"""API REST Endpoints"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
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
    """API: Estatísticas por empresa (sem autenticação)"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).filter_by(empresa_id=empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=empresa_id).count()

        return jsonify({
            'success': True,
            'data': {
                'total_leads': total_leads,
                'total_conversas': total_conversas,
                'clientes': {'total': total_leads},
                'conversas': {'ativas': total_conversas},
                'mensagens': {'hoje': 0}  # TODO: Implementar contagem de mensagens
            }
        })
    except Exception as e:
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

        return jsonify({
            'success': True,
            'data': {
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'bot_ativo': empresa.bot_ativo,
                'nicho_configurado': empresa.nicho is not None,
                'setup_completo': empresa.whatsapp_conectado and empresa.nicho is not None
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

        if not nicho or nicho not in ['veiculos', 'imoveis']:
            return jsonify({'success': False, 'error': 'Nicho inválido. Use "veiculos" ou "imoveis"'}), 400

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


@bp.route('/docs')
def docs():
    """Documentação da API"""
    return jsonify({
        'version': '1.0.0',
        'endpoints': {
            '/api/stats': 'GET - Estatísticas gerais (requer autenticação)',
            '/api/stats/<empresa_id>': 'GET - Estatísticas por empresa',
            '/api/bot-config/<empresa_id>': 'GET - Configuração do bot',
            '/api/empresa/bot/toggle': 'POST - Ativar/Desativar bot (Body: {"empresa_id": 5, "bot_ativo": true})',
            '/api/empresa/check-setup/<empresa_id>': 'GET - Verificar status de setup da empresa',
            '/api/empresa/setup': 'POST - Configurar empresa (wizard de setup inicial)',
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
