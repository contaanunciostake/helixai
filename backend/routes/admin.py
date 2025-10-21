"""Rotas Admin (Super Admin)"""
from flask import Blueprint, render_template, abort, jsonify, request
from flask_login import login_required, current_user
from database.models import TipoUsuario, Empresa, Usuario, Lead, Disparo, StatusDisparo, TemperaturaLead, StatusLead
from backend import db_manager
from datetime import datetime, timedelta
import requests

bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    """Decorator para rotas que requerem super admin"""
    def decorated_function(*args, **kwargs):
        if current_user.tipo != TipoUsuario.SUPER_ADMIN:
            abort(403)
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@bp.route('/')
@bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """Dashboard admin"""
    session = db_manager.get_session()
    try:
        total_empresas = session.query(Empresa).count()
        total_usuarios = session.query(Usuario).count()
        empresas = session.query(Empresa).limit(20).all()
        return render_template('admin/dashboard.html',
                             total_empresas=total_empresas,
                             total_usuarios=total_usuarios,
                             empresas=empresas)
    finally:
        session.close()

@bp.route('/disparador')
@login_required
@admin_required
def disparador():
    """Página do disparador de mensagens"""
    session = db_manager.get_session()
    try:
        # Estatísticas
        total_leads = session.query(Lead).count()
        leads_conectados = session.query(Lead).filter(Lead.telefone != None).count()

        # Disparos hoje
        hoje = datetime.now().date()
        disparos_hoje = session.query(Disparo).filter(
            Disparo.enviado_em >= datetime.combine(hoje, datetime.min.time())
        ).count()

        # Taxa de sucesso
        total_disparos = session.query(Disparo).count()
        disparos_sucesso = session.query(Disparo).filter(
            Disparo.status == StatusDisparo.ENVIADO
        ).count()
        taxa_sucesso = int((disparos_sucesso / total_disparos * 100) if total_disparos > 0 else 0)

        # WhatsApp conectado (pega a primeira empresa como padrão ou a do usuário)
        empresa = current_user.empresa if current_user.empresa else session.query(Empresa).first()
        whatsapp_conectado = empresa.whatsapp_conectado if empresa else False

        # Histórico de disparos recentes
        historico_disparos = session.query(Disparo).order_by(
            Disparo.enviado_em.desc()
        ).limit(10).all()

        return render_template('admin/disparador.html',
                             total_leads=total_leads,
                             leads_conectados=leads_conectados,
                             disparos_hoje=disparos_hoje,
                             taxa_sucesso=taxa_sucesso,
                             whatsapp_conectado=whatsapp_conectado,
                             historico_disparos=historico_disparos)
    finally:
        session.close()

@bp.route('/api/disparo-teste', methods=['POST'])
@login_required
@admin_required
def disparo_teste():
    """Envia mensagem de teste para número específico"""
    session = db_manager.get_session()
    try:
        data = request.get_json()
        telefone = data.get('telefone')
        mensagem = data.get('mensagem')

        if not telefone or not mensagem:
            return jsonify({'success': False, 'message': 'Telefone e mensagem são obrigatórios'}), 400

        # Verificar WhatsApp conectado
        empresa = current_user.empresa if current_user.empresa else session.query(Empresa).first()
        if not empresa or not empresa.whatsapp_conectado:
            return jsonify({'success': False, 'message': 'WhatsApp não está conectado'}), 400

        # Criar registro de disparo
        disparo = Disparo(
            telefone=telefone,
            mensagem_enviada=mensagem,
            status=StatusDisparo.ENVIANDO,
            agendado_para=datetime.now()
        )
        session.add(disparo)
        session.commit()

        # Enviar mensagem via API do WhatsApp
        try:
            # Aqui você deve integrar com seu serviço de WhatsApp
            # Por exemplo, usando a API do Baileys
            whatsapp_response = enviar_mensagem_whatsapp(telefone, mensagem)

            if whatsapp_response.get('success'):
                disparo.status = StatusDisparo.ENVIADO
                disparo.enviado_em = datetime.now()
                session.commit()

                return jsonify({
                    'success': True,
                    'message': 'Mensagem de teste enviada com sucesso!',
                    'disparo_id': disparo.id
                })
            else:
                disparo.status = StatusDisparo.ERRO
                disparo.erro_descricao = whatsapp_response.get('error', 'Erro desconhecido')
                session.commit()

                return jsonify({
                    'success': False,
                    'message': f'Erro ao enviar: {disparo.erro_descricao}'
                }), 500

        except Exception as e:
            disparo.status = StatusDisparo.ERRO
            disparo.erro_descricao = str(e)
            session.commit()

            return jsonify({
                'success': False,
                'message': f'Erro ao enviar mensagem: {str(e)}'
            }), 500

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/disparo-massa', methods=['POST'])
@login_required
@admin_required
def disparo_massa():
    """Dispara mensagens para todos os leads"""
    session = db_manager.get_session()
    try:
        data = request.get_json()
        mensagem = data.get('mensagem')
        filtro_temperatura = data.get('filtro_temperatura', 'TODOS')
        filtro_status = data.get('filtro_status', 'TODOS')

        if not mensagem:
            return jsonify({'success': False, 'message': 'Mensagem é obrigatória'}), 400

        # Verificar WhatsApp conectado
        empresa = current_user.empresa if current_user.empresa else session.query(Empresa).first()
        if not empresa or not empresa.whatsapp_conectado:
            return jsonify({'success': False, 'message': 'WhatsApp não está conectado'}), 400

        # Buscar leads com filtros
        query = session.query(Lead).filter(Lead.telefone != None)

        if filtro_temperatura != 'TODOS':
            query = query.filter(Lead.temperatura == TemperaturaLead[filtro_temperatura])

        if filtro_status != 'TODOS':
            query = query.filter(Lead.status == StatusLead[filtro_status])

        leads = query.all()

        if not leads:
            return jsonify({'success': False, 'message': 'Nenhum lead encontrado com os filtros aplicados'}), 400

        # Contador de disparos
        total_disparos = 0
        enviados = 0
        erros = 0

        # Processar cada lead
        for lead in leads:
            # Personalizar mensagem
            mensagem_personalizada = mensagem.replace('{nome}', lead.nome or 'Cliente')

            # Criar disparo
            disparo = Disparo(
                lead_id=lead.id,
                telefone=lead.telefone,
                mensagem_enviada=mensagem_personalizada,
                status=StatusDisparo.ENVIANDO,
                agendado_para=datetime.now()
            )
            session.add(disparo)
            total_disparos += 1

            # Enviar mensagem
            try:
                whatsapp_response = enviar_mensagem_whatsapp(lead.telefone, mensagem_personalizada)

                if whatsapp_response.get('success'):
                    disparo.status = StatusDisparo.ENVIADO
                    disparo.enviado_em = datetime.now()
                    enviados += 1
                else:
                    disparo.status = StatusDisparo.ERRO
                    disparo.erro_descricao = whatsapp_response.get('error', 'Erro desconhecido')
                    erros += 1

            except Exception as e:
                disparo.status = StatusDisparo.ERRO
                disparo.erro_descricao = str(e)
                erros += 1

        session.commit()

        return jsonify({
            'success': True,
            'message': f'Disparos processados com sucesso!',
            'total_disparos': total_disparos,
            'enviados': enviados,
            'erros': erros
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/stats-disparador')
@login_required
@admin_required
def stats_disparador():
    """Retorna estatísticas do disparador"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).count()
        leads_conectados = session.query(Lead).filter(Lead.telefone != None).count()

        hoje = datetime.now().date()
        disparos_hoje = session.query(Disparo).filter(
            Disparo.enviado_em >= datetime.combine(hoje, datetime.min.time())
        ).count()

        return jsonify({
            'success': True,
            'total_leads': total_leads,
            'leads_conectados': leads_conectados,
            'disparos_hoje': disparos_hoje
        })
    finally:
        session.close()

@bp.route('/api/whatsapp/gerar-qr/<int:empresa_id>', methods=['POST'])
@login_required
@admin_required
def admin_gerar_qr(empresa_id):
    """API Admin para gerar QR Code para empresa específica"""
    import qrcode
    import io
    import base64

    session = db_manager.get_session()
    WHATSAPP_SERVICE_URL = 'http://localhost:3001'

    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        try:
            # Tentar conectar ao serviço WhatsApp (Baileys)
            response = requests.post(
                f'{WHATSAPP_SERVICE_URL}/api/session/start',
                json={'empresaId': empresa.id},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()

                if data.get('qr'):
                    qr_text = data['qr']
                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_L,
                        box_size=10,
                        border=4,
                    )
                    qr.add_data(qr_text)
                    qr.make(fit=True)

                    img = qr.make_image(fill_color="black", back_color="white")

                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_code_base64 = f"data:image/png;base64,{base64.b64encode(buffer.read()).decode()}"

                    empresa.whatsapp_qr_code = qr_code_base64
                    session.commit()

                    return jsonify({
                        'success': True,
                        'qr_code': qr_code_base64,
                        'message': 'QR Code gerado com sucesso!',
                        'using_baileys': True
                    })

                elif data.get('connected'):
                    empresa.whatsapp_conectado = True
                    empresa.whatsapp_numero = data.get('numero')
                    empresa.whatsapp_qr_code = None
                    session.commit()

                    return jsonify({
                        'success': True,
                        'message': 'WhatsApp já está conectado!',
                        'connected': True,
                        'numero': data.get('numero')
                    })

        except requests.exceptions.ConnectionError:
            # Fallback: gerar QR code de simulação
            from datetime import datetime
            import secrets
            token = secrets.token_urlsafe(32)
            timestamp = int(datetime.utcnow().timestamp())
            connection_code = f"vendeai://demo:{empresa.id}:{timestamp}:{token}"

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(connection_code)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            qr_code_base64 = f"data:image/png;base64,{base64.b64encode(buffer.read()).decode()}"

            empresa.whatsapp_qr_code = qr_code_base64
            session.commit()

            return jsonify({
                'success': True,
                'qr_code': qr_code_base64,
                'message': 'QR Code gerado (modo simulação)',
                'using_baileys': False,
                'warning': 'Serviço WhatsApp não está rodando'
            })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/whatsapp/desconectar/<int:empresa_id>', methods=['POST'])
@login_required
@admin_required
def admin_desconectar(empresa_id):
    """API Admin para desconectar WhatsApp de empresa específica"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        empresa.whatsapp_conectado = False
        empresa.whatsapp_qr_code = None
        empresa.bot_ativo = False
        session.commit()

        return jsonify({
            'success': True,
            'message': 'WhatsApp desconectado com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/whatsapp/simular-conexao/<int:empresa_id>', methods=['POST'])
@login_required
@admin_required
def admin_simular_conexao(empresa_id):
    """API Admin para simular conexão de empresa específica"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        empresa.whatsapp_conectado = True
        empresa.whatsapp_numero = '+55 11 99999-9999'
        empresa.whatsapp_qr_code = None
        session.commit()

        return jsonify({
            'success': True,
            'message': 'WhatsApp conectado com sucesso! (simulação)',
            'numero': empresa.whatsapp_numero
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

# Rotas placeholder para o menu (você pode implementá-las depois)
@bp.route('/analytics')
@login_required
@admin_required
def analytics():
    return render_template('admin/em_desenvolvimento.html', titulo='Analytics')

@bp.route('/campanhas')
@login_required
@admin_required
def campanhas():
    return render_template('admin/em_desenvolvimento.html', titulo='Campanhas')

@bp.route('/templates')
@login_required
@admin_required
def templates():
    return render_template('admin/em_desenvolvimento.html', titulo='Templates')

@bp.route('/empresas')
@login_required
@admin_required
def empresas():
    """Gestão de Empresas"""
    session = db_manager.get_session()
    try:
        empresas = session.query(Empresa).all()
        total_empresas = len(empresas)
        empresas_ativas = sum(1 for e in empresas if e.whatsapp_conectado)

        return render_template('admin/empresas.html',
                             empresas=empresas,
                             total_empresas=total_empresas,
                             empresas_ativas=empresas_ativas)
    finally:
        session.close()

@bp.route('/usuarios')
@login_required
@admin_required
def usuarios():
    """Gestão de Usuários"""
    session = db_manager.get_session()
    try:
        usuarios = session.query(Usuario).all()
        total_usuarios = len(usuarios)
        usuarios_ativos = sum(1 for u in usuarios if u.ativo)

        return render_template('admin/usuarios.html',
                             usuarios=usuarios,
                             total_usuarios=total_usuarios,
                             usuarios_ativos=usuarios_ativos)
    finally:
        session.close()

@bp.route('/leads')
@login_required
@admin_required
def leads():
    """Gestão de Leads"""
    session = db_manager.get_session()
    try:
        leads = session.query(Lead).order_by(Lead.criado_em.desc()).limit(100).all()
        total_leads = session.query(Lead).count()
        leads_quentes = session.query(Lead).filter(Lead.temperatura == TemperaturaLead.QUENTE).count()

        return render_template('admin/leads.html',
                             leads=leads,
                             total_leads=total_leads,
                             leads_quentes=leads_quentes)
    finally:
        session.close()

@bp.route('/conversas')
@login_required
@admin_required
def conversas():
    """Gestão de Conversas"""
    session = db_manager.get_session()
    try:
        from database.models import Conversa
        conversas = session.query(Conversa).order_by(Conversa.ultima_mensagem_em.desc()).limit(100).all()
        total_conversas = session.query(Conversa).count()
        conversas_ativas = session.query(Conversa).filter(Conversa.ativa == True).count()

        return render_template('admin/conversas.html',
                             conversas=conversas,
                             total_conversas=total_conversas,
                             conversas_ativas=conversas_ativas)
    finally:
        session.close()

@bp.route('/whatsapp-config')
@login_required
@admin_required
def whatsapp_config():
    """Configuração WhatsApp no Admin"""
    session = db_manager.get_session()
    try:
        # Buscar todas as empresas
        empresas = session.query(Empresa).all()

        # Estatísticas gerais
        total_empresas = len(empresas)
        empresas_conectadas = sum(1 for e in empresas if e.whatsapp_conectado)

        return render_template('admin/whatsapp_config.html',
                             empresas=empresas,
                             total_empresas=total_empresas,
                             empresas_conectadas=empresas_conectadas)
    finally:
        session.close()

@bp.route('/ia-config')
@login_required
@admin_required
def ia_config():
    return render_template('admin/em_desenvolvimento.html', titulo='Configuração IA')

@bp.route('/integracoes')
@login_required
@admin_required
def integracoes():
    return render_template('admin/em_desenvolvimento.html', titulo='Integrações')

@bp.route('/sistema')
@login_required
@admin_required
def sistema():
    return render_template('admin/em_desenvolvimento.html', titulo='Sistema')

@bp.route('/logs')
@login_required
@admin_required
def logs():
    return render_template('admin/em_desenvolvimento.html', titulo='Logs')

@bp.route('/documentacao')
@login_required
@admin_required
def documentacao():
    return render_template('admin/em_desenvolvimento.html', titulo='Documentação')

# Função auxiliar para enviar mensagem via WhatsApp
def enviar_mensagem_whatsapp(telefone, mensagem):
    """
    Envia mensagem via API do WhatsApp
    Você deve adaptar essa função para sua implementação específica
    """
    try:
        # Aqui você deve integrar com seu serviço de WhatsApp
        # Exemplo usando uma API local do Baileys
        response = requests.post('http://localhost:3000/send-message',
            json={
                'phone': telefone,
                'message': mensagem
            },
            timeout=10
        )

        if response.status_code == 200:
            return {'success': True}
        else:
            return {'success': False, 'error': f'Status code: {response.status_code}'}

    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': str(e)}
    except Exception as e:
        return {'success': False, 'error': str(e)}
