"""API REST Endpoints"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from sqlalchemy import text
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Lead, Conversa, Campanha, Empresa, NichoEmpresa
from backend import db_manager

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/stats')
@login_required
def stats():
    """API: Estatísticas gerais"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=current_user.empresa_id).count()
        return jsonify({
            'total_leads': total_leads,
            'total_conversas': total_conversas
        })
    finally:
        session.close()

@bp.route('/leads')
@login_required
def api_leads():
    """API: Lista de leads"""
    session = db_manager.get_session()
    try:
        leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).limit(100).all()
        resultado = []
        for lead in leads:
            resultado.append({
                'id': lead.id,
                'nome': lead.nome,
                'telefone': lead.telefone,
                'status': lead.status.value,
                'temperatura': lead.temperatura.value
            })
        return jsonify(resultado)
    finally:
        session.close()

@bp.route('/whatsapp/status')
@login_required
def whatsapp_status():
    """API: Status WhatsApp"""
    # TODO: Integrar com bot engine
    return jsonify({'connected': False, 'message': 'Bot engine not connected'})

# ==================== ENDPOINTS NICHO ====================

@bp.route('/empresa/info', methods=['GET'])
def get_empresa_info():
    """API: Obter informações da empresa incluindo nicho"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou do query param (para CRM Cliente)
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            # Para CRM Cliente sem autenticação, usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_fantasia': empresa.nome_fantasia,
                'email': empresa.email,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'plano': empresa.plano.value,
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'whatsapp_numero': empresa.whatsapp_numero,
                'bot_ativo': empresa.bot_ativo
            }
        })
    finally:
        session.close()

@bp.route('/empresa/nicho', methods=['GET'])
def get_empresa_nicho():
    """API: Obter nicho da empresa"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou do query param (para CRM Cliente)
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            # Para CRM Cliente sem autenticação, usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'nicho': empresa.nicho.value if empresa.nicho else None
        })
    finally:
        session.close()

@bp.route('/empresa/nicho/<int:empresa_id>', methods=['GET'])
def get_empresa_nicho_by_id(empresa_id):
    """API: Obter nicho da empresa por ID"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'nicho': empresa.nicho.value if empresa.nicho else None
        })
    finally:
        session.close()

@bp.route('/empresa/nicho', methods=['POST'])
@login_required
def set_empresa_nicho():
    """API: Definir nicho da empresa"""
    session = db_manager.get_session()
    try:
        data = request.get_json()
        nicho = data.get('nicho')

        # Validar nicho
        if nicho not in ['veiculos', 'imoveis']:
            return jsonify({
                'success': False,
                'error': 'Nicho inválido. Use "veiculos" ou "imoveis"'
            }), 400

        # Atualizar empresa
        empresa = session.query(Empresa).get(current_user.empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Converter string para enum
        if nicho == 'veiculos':
            empresa.nicho = NichoEmpresa.VEICULOS
        elif nicho == 'imoveis':
            empresa.nicho = NichoEmpresa.IMOVEIS

        session.commit()

        return jsonify({
            'success': True,
            'message': f'Nicho definido como {nicho}',
            'nicho': empresa.nicho.value
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/bot/toggle', methods=['POST'])
def toggle_bot_ativo():
    """API: Alternar status do bot (ativar/desativar)"""
    session = db_manager.get_session()
    try:
        data = request.get_json() or {}

        # Tentar obter empresa_id do usuário autenticado, do body ou do query param
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        elif 'empresa_id' in data:
            # CRM Cliente envia empresa_id no body
            empresa_id = data['empresa_id']
        else:
            # Fallback: usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        print(f"[API] Toggle bot - empresa_id: {empresa_id}")

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Se bot_ativo foi enviado no body, usar esse valor; caso contrário, alternar
        if 'bot_ativo' in data:
            empresa.bot_ativo = data['bot_ativo']
        else:
            # Alternar o estado
            empresa.bot_ativo = not empresa.bot_ativo

        session.commit()

        print(f"[API] Bot {'ativado' if empresa.bot_ativo else 'desativado'} para empresa {empresa_id}")

        return jsonify({
            'success': True,
            'bot_ativo': empresa.bot_ativo,
            'message': f'Bot {"ativado" if empresa.bot_ativo else "desativado"} com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f"[API] Erro ao fazer toggle do bot: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/register', methods=['POST'])
def register_empresa():
    """API: Registrar nova empresa com nicho"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Validar dados obrigatórios
        required_fields = ['nome', 'email', 'nicho', 'plano']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}'
                }), 400

        # Validar nicho
        nicho = data.get('nicho')
        if nicho not in ['veiculos', 'imoveis']:
            return jsonify({
                'success': False,
                'error': 'Nicho inválido. Use "veiculos" ou "imoveis"'
            }), 400

        # Verificar se email já existe
        empresa_existente = session.query(Empresa).filter_by(email=data['email']).first()
        if empresa_existente:
            return jsonify({
                'success': False,
                'error': 'Email já cadastrado'
            }), 400

        # Criar nova empresa
        nova_empresa = Empresa(
            nome=data['nome'],
            nome_fantasia=data.get('nome_fantasia', data['nome']),
            email=data['email'],
            telefone=data.get('telefone'),
            cnpj=data.get('cnpj'),
            nicho=NichoEmpresa.VEICULOS if nicho == 'veiculos' else NichoEmpresa.IMOVEIS,
            plano=data['plano']
        )

        session.add(nova_empresa)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa registrada com sucesso',
            'empresa_id': nova_empresa.id,
            'nicho': nova_empresa.nicho.value
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/stats/<int:empresa_id>')
def stats_by_empresa(empresa_id):
    """API: Estatísticas completas por empresa (para Dashboard CRM)"""
    session = db_manager.get_session()
    try:
        from datetime import datetime
        from sqlalchemy import func, extract

        # Dados básicos
        total_leads = session.query(Lead).filter_by(empresa_id=empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=empresa_id).count()

        # Clientes (tabela clientes)
        try:
            from database.models import Cliente
            total_clientes = session.query(Cliente).filter_by(empresa_id=empresa_id).count()
        except:
            total_clientes = total_leads

        # Pedidos e métricas financeiras
        try:
            from database.models import Pedido
            mes_atual = datetime.now().month
            ano_atual = datetime.now().year

            # Receita do mês
            receita_mes = session.query(func.coalesce(func.sum(Pedido.total), 0)).filter(
                Pedido.empresa_id == empresa_id,
                extract('month', Pedido.criado_em) == mes_atual,
                extract('year', Pedido.criado_em) == ano_atual
            ).scalar() or 0

            # Vendas do mês (quantidade)
            vendas_mes = session.query(Pedido).filter(
                Pedido.empresa_id == empresa_id,
                extract('month', Pedido.criado_em) == mes_atual,
                extract('year', Pedido.criado_em) == ano_atual
            ).count()

            # Ticket médio
            ticket_medio = session.query(func.coalesce(func.avg(Pedido.total), 0)).filter(
                Pedido.empresa_id == empresa_id,
                Pedido.total > 0
            ).scalar() or 0

            total_pedidos = session.query(Pedido).filter_by(empresa_id=empresa_id).count()
        except Exception as e:
            print(f"[API] Erro ao buscar pedidos: {e}")
            receita_mes = 0
            vendas_mes = 0
            ticket_medio = 0
            total_pedidos = 0

        # Leads do mês
        try:
            leads_mes = session.query(Lead).filter(
                Lead.empresa_id == empresa_id,
                extract('month', Lead.criado_em) == datetime.now().month,
                extract('year', Lead.criado_em) == datetime.now().year
            ).count()
        except:
            leads_mes = 0

        # Mensagens hoje
        try:
            from database.models import Mensagem
            hoje = datetime.now().date()
            mensagens_hoje = session.query(Mensagem).join(Conversa).filter(
                Conversa.empresa_id == empresa_id,
                func.date(Mensagem.enviada_em) == hoje
            ).count()

            # Mensagens da semana
            from datetime import timedelta
            inicio_semana = hoje - timedelta(days=hoje.weekday())
            mensagens_semana = session.query(Mensagem).join(Conversa).filter(
                Conversa.empresa_id == empresa_id,
                func.date(Mensagem.enviada_em) >= inicio_semana
            ).count()
        except Exception as e:
            print(f"[API] Erro ao buscar mensagens: {e}")
            mensagens_hoje = 0
            mensagens_semana = 0

        # Entregas
        try:
            from sqlalchemy import text
            result = session.execute(text("SELECT COUNT(*) FROM entregas WHERE empresa_id = :emp_id"), {'emp_id': empresa_id})
            total_entregas = result.scalar() or 0
        except:
            total_entregas = 0

        return jsonify({
            'success': True,
            'data': {
                'total_leads': total_leads,
                'total_conversas': total_conversas,
                'clientes': {'total': total_clientes},
                'conversas': {'total': total_conversas, 'ativas': total_conversas},
                'mensagens': {'hoje': mensagens_hoje, 'semana': mensagens_semana},
                'leads': {'total': total_leads, 'mes': leads_mes},
                'pedidos': {'total': total_pedidos},
                'entregas': {'total': total_entregas},
                'financeiro': {
                    'receita_mes': float(receita_mes),
                    'vendas_mes': vendas_mes,
                    'ticket_medio': float(ticket_medio)
                },
                'bot': {
                    'taxa_resposta': 95,
                    'tempo_medio_resposta': '< 1min'
                }
            }
        })
    except Exception as e:
        print(f"[API] Erro stats_by_empresa: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

# Rota removida - usar toggle_bot_ativo() acima (linha 154)

@bp.route('/bot-config/<int:empresa_id>')
def get_bot_config(empresa_id):
    """API: Obter configuração do bot da empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'data': {
                'bot_ativo': empresa.bot_ativo,
                'whatsapp_conectado': empresa.whatsapp_conectado
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/check-setup/<int:empresa_id>')
def check_setup(empresa_id):
    """API: Verificar status de setup da empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        # Verificar setup_completo do banco ou calcular se nicho está configurado
        setup_ok = getattr(empresa, 'setup_completo', False) or (empresa.nicho is not None)

        # Obter nicho como string
        nicho_str = None
        if empresa.nicho:
            nicho_str = empresa.nicho.value if hasattr(empresa.nicho, 'value') else str(empresa.nicho)
            nicho_str = nicho_str.lower() if nicho_str else None

        return jsonify({
            'success': True,
            'data': {
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'bot_ativo': empresa.bot_ativo,
                'nicho_configurado': empresa.nicho is not None,
                'nicho': nicho_str,
                'setup_completo': setup_ok
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/setup', methods=['POST'])
def setup_empresa():
    """API: Configurar empresa (wizard de setup inicial)"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Validar dados obrigatórios
        empresa_id = data.get('empresa_id')
        nicho = data.get('nicho')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        if not nicho or nicho not in ['veiculos', 'imoveis', 'atacado_varejo', 'loja_tintas']:
            return jsonify({'success': False, 'error': 'Nicho inválido. Use "veiculos", "imoveis", "atacado_varejo" ou "loja_tintas"'}), 400

        # Buscar empresa
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Atualizar dados opcionais
        if 'nome_fantasia' in data:
            empresa.nome_fantasia = data['nome_fantasia']
        if 'telefone' in data:
            empresa.telefone = data['telefone']
        if 'email' in data:
            empresa.email = data['email']

        # Atualizar nicho (salvar uppercase diretamente para compatibilidade com SQLAlchemy)
        # NOTA: O enum NichoEmpresa tem values lowercase mas SQLAlchemy espera NAME uppercase
        if nicho == 'veiculos':
            # Usar setattr para forçar update direto no atributo do banco
            setattr(empresa, 'nicho', 'VEICULOS')
        elif nicho == 'imoveis':
            setattr(empresa, 'nicho', 'IMOVEIS')
        elif nicho == 'atacado_varejo':
            setattr(empresa, 'nicho', 'ATACADO_VAREJO')
        elif nicho == 'loja_tintas':
            setattr(empresa, 'nicho', 'LOJA_TINTAS')

        # Salvar tipo_negocio para identificar módulo do bot
        if hasattr(empresa, 'tipo_negocio'):
            empresa.tipo_negocio = nicho

        # Marcar setup como completo
        if hasattr(empresa, 'setup_completo'):
            empresa.setup_completo = True

        session.commit()
        session.flush()  # Garantir que foi escrito no banco

        return jsonify({
            'success': True,
            'message': 'Setup concluído com sucesso!',
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nicho': nicho,
                'setup_completo': True
            }
        })

    except Exception as e:
        session.rollback()
        print(f"[API] Erro no setup: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== ENDPOINTS VEICULOS ====================
print("\n[API] Registrando rotas de veiculos...")

@bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    """API: Listar veículos com paginação"""
    import sqlite3
    import json

    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        db_path = Path(__file__).parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Contar total
        cursor.execute('SELECT COUNT(*) as total FROM veiculos WHERE empresa_id = ?', (empresa_id,))
        total = cursor.fetchone()['total']

        # Buscar veículos
        offset = (page - 1) * limit
        cursor.execute('''
            SELECT
                id, marca, modelo, versao, ano_modelo, ano_fabricacao,
                preco, preco_anterior, quilometragem, cor, combustivel,
                cambio, motor, portas, imagem_principal, descricao,
                disponivel, destaque, oferta_especial, vendido,
                cidade, estado, codigo_interno, sku, criado_em
            FROM veiculos
            WHERE empresa_id = ?
            ORDER BY criado_em DESC
            LIMIT ? OFFSET ?
        ''', (empresa_id, limit, offset))

        rows = cursor.fetchall()

        veiculos = []
        for row in rows:
            veiculos.append({
                'id': row['id'],
                'marca': row['marca'],
                'modelo': row['modelo'],
                'versao': row['versao'],
                'ano_modelo': row['ano_modelo'],
                'ano_fabricacao': row['ano_fabricacao'],
                'preco': row['preco'],
                'preco_anterior': row['preco_anterior'],
                'quilometragem': row['quilometragem'],
                'cor': row['cor'],
                'combustivel': row['combustivel'],
                'cambio': row['cambio'],
                'motor': row['motor'],
                'portas': row['portas'],
                'imagem_principal': row['imagem_principal'],
                'descricao': row['descricao'],
                'disponivel': bool(row['disponivel']),
                'destaque': bool(row['destaque']),
                'oferta_especial': bool(row['oferta_especial']),
                'vendido': bool(row['vendido']),
                'cidade': row['cidade'],
                'estado': row['estado'],
                'codigo_interno': row['codigo_interno'],
                'sku': row['sku'],
                'criado_em': row['criado_em']
            })

        conn.close()

        return jsonify({
            'success': True,
            'data': veiculos,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        print(f"[API] Erro ao listar veículos: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/veiculos/stats', methods=['GET'])
def get_veiculos_stats():
    """API: Estatísticas de veículos"""
    import sqlite3

    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)

        db_path = Path(__file__).parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ?', (empresa_id,))
        total = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND disponivel = 1', (empresa_id,))
        disponiveis = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND vendido = 1', (empresa_id,))
        vendidos = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND destaque = 1', (empresa_id,))
        destaques = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'disponiveis': disponiveis,
                'vendidos': vendidos,
                'destaques': destaques
            }
        })

    except Exception as e:
        print(f"[API] Erro ao obter stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/veiculos/template-csv', methods=['GET'])
def download_template_csv():
    """API: Download do template CSV de veículos"""
    from flask import send_file

    try:
        template_path = Path(__file__).parent.parent.parent / 'uploads' / 'produtos' / 'template_veiculos.csv'

        if not template_path.exists():
            return jsonify({'success': False, 'error': 'Template não encontrado'}), 404

        return send_file(
            template_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='template_veiculos.csv'
        )
    except Exception as e:
        print(f"[API] Erro ao enviar template: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== NOTIFICAÇÕES GERENTE VIA WHATSAPP ====================
print("\n[API] Registrando rotas de notificações para gerente...")

@bp.route('/empresa/notificacoes/<int:empresa_id>', methods=['GET'])
def get_notificacoes_gerente(empresa_id):
    """API: Obter configurações de notificação do gerente"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter(Empresa.id == empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'data': {
                'numero_gerente': getattr(empresa, 'numero_gerente', None),
                'notificar_vendas': getattr(empresa, 'notificar_vendas', True),
                'notificar_leads': getattr(empresa, 'notificar_leads', True),
                'notificar_entregas': getattr(empresa, 'notificar_entregas', True),
                'notificar_estoque': getattr(empresa, 'notificar_estoque', False)
            }
        })
    except Exception as e:
        print(f"[API] Erro ao obter notificações: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/notificacoes/<int:empresa_id>', methods=['POST'])
def salvar_notificacoes_gerente(empresa_id):
    """API: Salvar configurações de notificação do gerente"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Verificar se empresa existe
        empresa = session.query(Empresa).filter(Empresa.id == empresa_id).first()
        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Atualizar campos se existirem nos dados
        if 'numero_gerente' in data:
            empresa.numero_gerente = data['numero_gerente']
        if 'notificar_vendas' in data:
            empresa.notificar_vendas = data['notificar_vendas']
        if 'notificar_leads' in data:
            empresa.notificar_leads = data['notificar_leads']
        if 'notificar_entregas' in data:
            empresa.notificar_entregas = data['notificar_entregas']
        if 'notificar_estoque' in data:
            empresa.notificar_estoque = data['notificar_estoque']

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Configurações de notificação salvas com sucesso!'
        })
    except Exception as e:
        session.rollback()
        print(f"[API] Erro ao salvar notificações: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/notificacoes/enviar', methods=['POST'])
def enviar_notificacao_gerente():
    """API: Enviar notificação ao gerente via WhatsApp"""
    import requests
    import sqlite3
    from datetime import datetime

    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        tipo = data.get('tipo')  # 'venda', 'lead', 'entrega', 'estoque'
        dados = data.get('dados', {})

        if not empresa_id or not tipo:
            return jsonify({'success': False, 'error': 'empresa_id e tipo são obrigatórios'}), 400

        # Buscar dados da empresa via SQLite
        db_path = Path(__file__).parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT nome, numero_gerente, notificar_vendas, notificar_leads,
                   notificar_entregas, notificar_estoque
            FROM empresas WHERE id = ?
        ''', (empresa_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        empresa_nome = row[0]
        numero_gerente = row[1]
        notificar_vendas = bool(row[2]) if row[2] is not None else True
        notificar_leads = bool(row[3]) if row[3] is not None else True
        notificar_entregas = bool(row[4]) if row[4] is not None else True
        notificar_estoque = bool(row[5]) if row[5] is not None else False

        if not numero_gerente:
            return jsonify({'success': False, 'error': 'Número do gerente não configurado'}), 400

        # Verificar se notificação está habilitada para este tipo
        tipo_check = {
            'venda': notificar_vendas,
            'lead': notificar_leads,
            'entrega': notificar_entregas,
            'estoque': notificar_estoque
        }

        if tipo in tipo_check and not tipo_check[tipo]:
            return jsonify({'success': False, 'error': f'Notificações de {tipo} estão desabilitadas'}), 400

        # Construir mensagem baseada no tipo
        agora = datetime.now().strftime('%d/%m/%Y às %H:%M')

        if tipo == 'venda':
            mensagem = f"""🛒 *NOVA VENDA REALIZADA!*

📅 {agora}
👤 Cliente: {dados.get('cliente_nome', 'N/A')}
📱 Telefone: {dados.get('cliente_telefone', 'N/A')}

📦 Produtos:
{dados.get('produtos_texto', 'N/A')}

💰 *Total: R$ {dados.get('valor_total', '0,00')}*
💳 Pagamento: {dados.get('forma_pagamento', 'N/A')}
🚚 Entrega: {dados.get('tipo_entrega', 'N/A')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'lead':
            mensagem = f"""🔔 *NOVO LEAD/CONTATO!*

📅 {agora}
👤 Nome: {dados.get('nome', 'N/A')}
📱 Telefone: {dados.get('telefone', 'N/A')}

💬 Mensagem:
"{dados.get('mensagem', 'N/A')}"

🎯 Interesse: {dados.get('interesse', 'Não identificado')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'entrega':
            mensagem = f"""🚚 *ENTREGA SOLICITADA!*

📅 {agora}
👤 Cliente: {dados.get('cliente_nome', 'N/A')}
📱 Telefone: {dados.get('cliente_telefone', 'N/A')}

📍 Endereço:
{dados.get('endereco', 'N/A')}

📦 Produtos: {dados.get('produtos_resumo', 'N/A')}
💰 Valor: R$ {dados.get('valor_total', '0,00')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'estoque':
            mensagem = f"""⚠️ *ALERTA DE ESTOQUE BAIXO!*

📅 {agora}
📦 Produto: {dados.get('produto_nome', 'N/A')}
🔢 Código: {dados.get('codigo', 'N/A')}
📊 Estoque atual: {dados.get('quantidade', 0)} unidades

⚠️ Nível mínimo: {dados.get('nivel_minimo', 5)} unidades

_Notificação automática - {empresa_nome}_"""

        else:
            mensagem = f"""📢 *NOTIFICAÇÃO*

📅 {agora}
{dados.get('mensagem', 'Sem detalhes')}

_Notificação automática - {empresa_nome}_"""

        # Enviar via bot server
        try:
            response = requests.post(
                'http://localhost:3010/api/bot/send-notification',
                json={
                    'empresaId': empresa_id,
                    'telefone': numero_gerente,
                    'mensagem': mensagem
                },
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    return jsonify({
                        'success': True,
                        'message': 'Notificação enviada com sucesso!',
                        'enviada_para': numero_gerente
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': result.get('error', 'Erro ao enviar notificação')
                    }), 500
            else:
                return jsonify({
                    'success': False,
                    'error': f'Erro HTTP {response.status_code}'
                }), 500

        except requests.exceptions.RequestException as e:
            print(f"[API] Erro ao conectar com bot server: {e}")
            return jsonify({
                'success': False,
                'error': f'Erro ao conectar com bot: {str(e)}'
            }), 500

    except Exception as e:
        print(f"[API] Erro ao enviar notificação: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# SALES API - Dashboard de Vendas
# ══════════════════════════════════════════════════════════════

@bp.route('/sales/<int:empresa_id>')
def get_sales_dashboard(empresa_id):
    """
    GET /api/sales/<empresa_id>?periodo=30
    Dashboard completo de vendas para a empresa
    """
    session = db_manager.get_session()
    try:
        periodo = int(request.args.get('periodo', 30))
        hoje = datetime.now()
        data_inicio = hoje - timedelta(days=periodo)

        # ═══════════════════════════════════════════════════════════
        # 1. MÉTRICAS GERAIS - Baseado em Pedidos e Entregas
        # ═══════════════════════════════════════════════════════════

        # Total de vendas (pedidos entregues + entregas concluídas)
        result = session.execute(text('''
            SELECT
                COUNT(*) as total_vendas,
                COALESCE(SUM(total), 0) as valor_total
            FROM pedidos
            WHERE empresa_id = :empresa_id
            AND status = 'entregue'
            AND criado_em >= :data_inicio
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        pedidos_stats = result.fetchone()

        # Também incluir entregas com status entregue
        result = session.execute(text('''
            SELECT
                COUNT(*) as total_entregas,
                COALESCE(SUM(valor_pedido), 0) as valor_entregas
            FROM entregas
            WHERE empresa_id = :empresa_id
            AND status = 'entregue'
            AND criado_em >= :data_inicio
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        entregas_stats = result.fetchone()

        total_vendas = (pedidos_stats[0] or 0) + (entregas_stats[0] or 0)
        valor_total = float(pedidos_stats[1] or 0) + float(entregas_stats[1] or 0)
        ticket_medio = valor_total / total_vendas if total_vendas > 0 else 0

        # Período anterior para calcular crescimento
        data_inicio_anterior = data_inicio - timedelta(days=periodo)
        result = session.execute(text('''
            SELECT COALESCE(SUM(total), 0) + (
                SELECT COALESCE(SUM(valor_pedido), 0) FROM entregas
                WHERE empresa_id = :empresa_id AND status = 'entregue'
                AND criado_em >= :data_inicio_ant AND criado_em < :data_inicio
            ) as valor_anterior
            FROM pedidos
            WHERE empresa_id = :empresa_id AND status = 'entregue'
            AND criado_em >= :data_inicio_ant AND criado_em < :data_inicio
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio, 'data_inicio_ant': data_inicio_anterior})
        valor_anterior = float(result.fetchone()[0] or 0)

        crescimento = 0
        if valor_anterior > 0:
            crescimento = ((valor_total - valor_anterior) / valor_anterior) * 100

        # ═══════════════════════════════════════════════════════════
        # 2. FUNIL DE VENDAS - Baseado em Leads
        # ═══════════════════════════════════════════════════════════

        result = session.execute(text('''
            SELECT COUNT(*) FROM leads
            WHERE empresa_id = :empresa_id AND criado_em >= :data_inicio
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        total_leads = result.fetchone()[0] or 0

        result = session.execute(text('''
            SELECT COUNT(*) FROM leads
            WHERE empresa_id = :empresa_id AND criado_em >= :data_inicio
            AND status IN ('QUALIFICADO', 'NEGOCIANDO', 'CONVERTIDO')
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        leads_qualificados = result.fetchone()[0] or 0

        result = session.execute(text('''
            SELECT COUNT(*), COALESCE(SUM(valor_venda), 0) FROM leads
            WHERE empresa_id = :empresa_id AND vendido = true
            AND data_venda >= :data_inicio
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        leads_vendidos = result.fetchone()

        taxa_conversao_leads = (leads_vendidos[0] / total_leads * 100) if total_leads > 0 else 0
        taxa_conversao_qualificados = (leads_vendidos[0] / leads_qualificados * 100) if leads_qualificados > 0 else 0

        # ═══════════════════════════════════════════════════════════
        # 3. VENDAS POR DIA
        # ═══════════════════════════════════════════════════════════

        result = session.execute(text('''
            SELECT
                DATE(criado_em) as data,
                COUNT(*) as quantidade,
                COALESCE(SUM(total), 0) as valor
            FROM pedidos
            WHERE empresa_id = :empresa_id
            AND status = 'entregue'
            AND criado_em >= :data_inicio
            GROUP BY DATE(criado_em)
            ORDER BY data
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        vendas_pedidos = {str(row[0]): {'quantidade': row[1], 'valor': float(row[2])} for row in result.fetchall()}

        result = session.execute(text('''
            SELECT
                DATE(criado_em) as data,
                COUNT(*) as quantidade,
                COALESCE(SUM(valor_pedido), 0) as valor
            FROM entregas
            WHERE empresa_id = :empresa_id
            AND status = 'entregue'
            AND criado_em >= :data_inicio
            GROUP BY DATE(criado_em)
            ORDER BY data
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        vendas_entregas = {str(row[0]): {'quantidade': row[1], 'valor': float(row[2])} for row in result.fetchall()}

        # Combinar vendas por dia
        vendas_por_dia = []
        for i in range(periodo):
            data = (data_inicio + timedelta(days=i)).strftime('%Y-%m-%d')
            pedido = vendas_pedidos.get(data, {'quantidade': 0, 'valor': 0})
            entrega = vendas_entregas.get(data, {'quantidade': 0, 'valor': 0})
            vendas_por_dia.append({
                'data': data,
                'quantidade': pedido['quantidade'] + entrega['quantidade'],
                'valor': pedido['valor'] + entrega['valor']
            })

        # Recorde do dia
        recorde_dia = max(vendas_por_dia, key=lambda x: x['valor']) if vendas_por_dia else None

        # ═══════════════════════════════════════════════════════════
        # 4. VENDAS POR CATEGORIA (produtos)
        # ═══════════════════════════════════════════════════════════

        result = session.execute(text('''
            SELECT
                COALESCE(p.categoria, 'Outros') as categoria,
                COUNT(DISTINCT ped.id) as quantidade,
                COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) as valor
            FROM itens_pedido ip
            JOIN pedidos ped ON ip.pedido_id = ped.id
            JOIN produtos p ON ip.produto_id = p.id
            WHERE ped.empresa_id = :empresa_id
            AND ped.status = 'entregue'
            AND ped.criado_em >= :data_inicio
            GROUP BY p.categoria
            ORDER BY valor DESC
            LIMIT 10
        '''), {'empresa_id': empresa_id, 'data_inicio': data_inicio})
        vendas_por_categoria = [
            {'categoria': row[0], 'quantidade': row[1], 'valor': float(row[2])}
            for row in result.fetchall()
        ]

        # ═══════════════════════════════════════════════════════════
        # 5. VENDAS RECENTES
        # ═══════════════════════════════════════════════════════════

        result = session.execute(text('''
            SELECT
                ped.id, c.nome as cliente, c.email, c.telefone,
                ped.total as valor, ped.criado_em as data,
                ped.forma_pagamento, ped.observacoes
            FROM pedidos ped
            LEFT JOIN clientes c ON ped.cliente_id = c.id
            WHERE ped.empresa_id = :empresa_id
            AND ped.status = 'entregue'
            ORDER BY ped.criado_em DESC
            LIMIT 10
        '''), {'empresa_id': empresa_id})

        vendas_recentes = []
        for row in result.fetchall():
            vendas_recentes.append({
                'id': row[0],
                'cliente': row[1] or 'Cliente',
                'email': row[2] or '',
                'telefone': row[3] or '',
                'carro': 'Pedido',  # Placeholder
                'valor': float(row[4] or 0),
                'data': row[5].isoformat() if row[5] else None,
                'forma_pagamento': row[6] or 'pago',
                'vendedor': 'Sistema',
                'observacoes': row[7] or ''
            })

        # Também incluir entregas recentes
        result = session.execute(text('''
            SELECT
                id, cliente_nome, '', cliente_telefone,
                valor_pedido, criado_em, forma_pagamento, observacoes
            FROM entregas
            WHERE empresa_id = :empresa_id
            AND status = 'entregue'
            ORDER BY criado_em DESC
            LIMIT 10
        '''), {'empresa_id': empresa_id})

        for row in result.fetchall():
            vendas_recentes.append({
                'id': row[0],
                'cliente': row[1] or 'Cliente',
                'email': row[2] or '',
                'telefone': row[3] or '',
                'carro': 'Entrega',
                'valor': float(row[4] or 0),
                'data': row[5].isoformat() if row[5] else None,
                'forma_pagamento': row[6] or 'pago',
                'vendedor': 'Sistema',
                'observacoes': row[7] or ''
            })

        # Ordenar por data e limitar a 10
        vendas_recentes.sort(key=lambda x: x['data'] or '', reverse=True)
        vendas_recentes = vendas_recentes[:10]

        # ═══════════════════════════════════════════════════════════
        # 6. MONTAR RESPOSTA
        # ═══════════════════════════════════════════════════════════

        return jsonify({
            'success': True,
            'data': {
                'metricas_gerais': {
                    'total_vendas': total_vendas,
                    'valor_total': valor_total,
                    'ticket_medio': ticket_medio,
                    'crescimento_periodo': round(crescimento, 1),
                    'roi': round(crescimento + 100, 0) if crescimento > 0 else 100
                },
                'funil': {
                    'total_leads': total_leads,
                    'visitas_realizadas': leads_qualificados,
                    'total_vendas': leads_vendidos[0] if leads_vendidos else 0,
                    'taxa_conversao_leads': round(taxa_conversao_leads, 1),
                    'taxa_conversao_visitas': round(taxa_conversao_qualificados, 1)
                },
                'recorde_dia': {
                    'data': recorde_dia['data'],
                    'quantidade': recorde_dia['quantidade'],
                    'valor_total': recorde_dia['valor']
                } if recorde_dia and recorde_dia['valor'] > 0 else None,
                'vendas_por_dia': vendas_por_dia,
                'vendas_por_categoria': vendas_por_categoria,
                'vendas_por_vendedor': [],  # Não temos vendedores implementados
                'vendas_recentes': vendas_recentes,
                'performance_radar': vendas_por_categoria[:5] if vendas_por_categoria else []
            }
        })

    except Exception as e:
        print(f'[SALES API] Erro: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/docs')
def docs():
    """Documentação da API"""
    return jsonify({
        'version': '1.0.0',
        'endpoints': {
            '/api/stats': 'GET - Estatísticas gerais (requer autenticação)',
            '/api/stats/<empresa_id>': 'GET - Estatísticas por empresa',
            '/api/sales/<empresa_id>': 'GET - Dashboard de vendas (periodo=30)',
            '/api/bot-config/<empresa_id>': 'GET - Configuração do bot',
            '/api/empresa/bot/toggle': 'POST - Ativar/Desativar bot (Body: {"empresa_id": 5, "bot_ativo": true})',
            '/api/empresa/check-setup/<empresa_id>': 'GET - Verificar status de setup da empresa',
            '/api/empresa/setup': 'POST - Configurar empresa (wizard de setup inicial)',
            '/api/empresa/notificacoes/<empresa_id>': 'GET/POST - Configurar notificações do gerente',
            '/api/empresa/notificacoes/enviar': 'POST - Enviar notificação ao gerente',
            '/api/leads': 'GET - Lista de leads',
            '/api/whatsapp/status': 'GET - Status WhatsApp',
            '/api/empresa/info': 'GET - Informações da empresa + bot',
            '/api/empresa/nicho': 'GET - Obter nicho da empresa',
            '/api/empresa/register': 'POST - Registrar nova empresa com nicho',
            '/api/veiculos': 'GET - Lista de veículos com paginação',
            '/api/veiculos/stats': 'GET - Estatísticas de veículos',
            '/api/veiculos/template-csv': 'GET - Download template CSV'
        }
    })
