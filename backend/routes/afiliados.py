"""
Rotas para Sistema de Afiliados - AIRA
Gerenciamento completo de afiliados, comissões e saques
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.models import (
    Afiliado, Referencia, Comissao, SaqueAfiliado, ConfiguracaoAfiliados,
    Usuario, StatusAfiliado, StatusReferencia, StatusComissao, TipoComissao
)
from datetime import datetime, timedelta
from sqlalchemy import func
import secrets
import string

bp = Blueprint('afiliados', __name__, url_prefix='/api/afiliados')


# ==================== AUTENTICAÇÃO ====================

@bp.route('/login', methods=['POST', 'OPTIONS'])
def login_afiliado():
    """
    Login específico para afiliados

    Body JSON:
        email: Email do afiliado
        senha: Senha

    Returns:
        JSON: {success: bool, message: str, token: str, afiliado: dict}
    """
    # Handle OPTIONS for CORS
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        from backend import db_manager, app
        from werkzeug.security import check_password_hash
        import jwt

        data = request.get_json()

        email = data.get('email', '').strip()
        senha = data.get('senha', '')

        # Validações
        if not email or '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Email inválido'
            }), 400

        if not senha:
            return jsonify({
                'success': False,
                'message': 'Senha é obrigatória'
            }), 400

        session = db_manager.get_session()
        try:
            # Buscar usuário
            usuario = session.query(Usuario).filter_by(email=email).first()

            if not usuario:
                return jsonify({
                    'success': False,
                    'message': 'Email ou senha incorretos'
                }), 401

            # Verificar senha
            if not usuario.check_senha(senha):
                return jsonify({
                    'success': False,
                    'message': 'Email ou senha incorretos'
                }), 401

            # Verificar se usuário está ativo
            if not usuario.ativo:
                return jsonify({
                    'success': False,
                    'message': 'Sua conta está desativada. Entre em contato com o suporte.'
                }), 403

            # ✅ VERIFICAR SE É AFILIADO
            afiliado = session.query(Afiliado).filter_by(usuario_id=usuario.id).first()

            if not afiliado:
                return jsonify({
                    'success': False,
                    'message': 'Você não está cadastrado como afiliado. Por favor, complete seu cadastro.'
                }), 403

            # Verificar se afiliado está aprovado
            if afiliado.status != StatusAfiliado.ATIVO:
                status_msg = {
                    StatusAfiliado.PENDENTE: 'Seu cadastro está aguardando aprovação.',
                    StatusAfiliado.BLOQUEADO: 'Sua conta de afiliado está bloqueada. Entre em contato com o suporte.',
                    StatusAfiliado.INATIVO: 'Sua conta de afiliado está inativa.'
                }
                return jsonify({
                    'success': False,
                    'message': status_msg.get(afiliado.status, 'Status da conta não permite login.')
                }), 403

            # Atualizar último acesso
            usuario.ultimo_acesso = datetime.utcnow()
            session.commit()

            # Gerar token JWT
            token_payload = {
                'user_id': usuario.id,
                'email': usuario.email,
                'afiliado_id': afiliado.id,
                'tipo': 'afiliado',
                'exp': datetime.utcnow() + timedelta(days=30)  # Expira em 30 dias
            }

            token = jwt.encode(
                token_payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )

            # Retornar dados do afiliado
            return jsonify({
                'success': True,
                'message': f'Bem-vindo, {usuario.nome}!',
                'token': token,
                'afiliado': {
                    'id': afiliado.id,
                    'usuario_id': usuario.id,
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'chave_referencia': afiliado.chave_referencia,
                    'status': afiliado.status.value,
                    'link_referencia': f'http://localhost:5000/r/{afiliado.chave_referencia}',
                    'saldo_disponivel': float(afiliado.saldo_disponivel or 0),
                    'total_comissoes_geradas': float(afiliado.total_comissoes_geradas or 0),
                    'total_comissoes_pagas': float(afiliado.total_comissoes_pagas or 0),
                    'total_clicks': afiliado.total_clicks or 0,
                    'total_cadastros': afiliado.total_cadastros or 0,
                    'total_vendas': afiliado.total_vendas or 0
                }
            }), 200

        finally:
            session.close()

    except Exception as e:
        print(f"[AFILIADOS-LOGIN] Erro ao fazer login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Erro ao fazer login: {str(e)}'
        }), 500


def gerar_chave_referencia():
    """Gera uma chave de referência única"""
    caracteres = string.ascii_lowercase + string.digits
    while True:
        chave = ''.join(secrets.choice(caracteres) for _ in range(8))
        # Verificar se já existe
        from app import db
        existe = db.session.query(Afiliado).filter_by(chave_referencia=chave).first()
        if not existe:
            return chave


# ==================== REGISTRO E PERFIL ====================

@bp.route('/registrar', methods=['POST'])
@login_required
def registrar_afiliado():
    """Registra novo afiliado"""
    try:
        from app import db

        # Verificar se já é afiliado
        afiliado_existente = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if afiliado_existente:
            return jsonify({
                'success': False,
                'message': 'Você já está cadastrado como afiliado'
            }), 400

        # Pegar configurações
        config = db.session.query(ConfiguracaoAfiliados).first()
        if not config or not config.aceitar_novos_afiliados:
            return jsonify({
                'success': False,
                'message': 'O programa de afiliados não está aceitando novos cadastros no momento'
            }), 400

        data = request.get_json()

        # Criar afiliado
        afiliado = Afiliado(
            usuario_id=current_user.id,
            chave_referencia=gerar_chave_referencia(),
            status=StatusAfiliado.PENDENTE,
            nome_completo=data.get('nome_completo'),
            cpf_cnpj=data.get('cpf_cnpj'),
            telefone=data.get('telefone'),
            banco=data.get('banco'),
            agencia=data.get('agencia'),
            conta=data.get('conta'),
            tipo_conta=data.get('tipo_conta'),
            pix_tipo=data.get('pix_tipo'),
            pix_chave=data.get('pix_chave')
        )

        db.session.add(afiliado)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Cadastro realizado com sucesso! Aguarde aprovação.',
            'afiliado': {
                'id': afiliado.id,
                'chave_referencia': afiliado.chave_referencia,
                'status': afiliado.status.value
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao registrar afiliado: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/meu-perfil', methods=['GET'])
@login_required
def meu_perfil():
    """Retorna perfil do afiliado logado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({
                'success': False,
                'message': 'Você não está cadastrado como afiliado'
            }), 404

        # Pegar configurações para exibir regras
        config = db.session.query(ConfiguracaoAfiliados).first()

        return jsonify({
            'success': True,
            'afiliado': {
                'id': afiliado.id,
                'chave_referencia': afiliado.chave_referencia,
                'status': afiliado.status.value,
                'nome_completo': afiliado.nome_completo,
                'cpf_cnpj': afiliado.cpf_cnpj,
                'telefone': afiliado.telefone,
                'banco': afiliado.banco,
                'agencia': afiliado.agencia,
                'conta': afiliado.conta,
                'tipo_conta': afiliado.tipo_conta,
                'pix_tipo': afiliado.pix_tipo,
                'pix_chave': afiliado.pix_chave,
                'total_clicks': afiliado.total_clicks,
                'total_cadastros': afiliado.total_cadastros,
                'total_vendas': afiliado.total_vendas,
                'total_comissoes_geradas': afiliado.total_comissoes_geradas,
                'total_comissoes_pagas': afiliado.total_comissoes_pagas,
                'saldo_disponivel': afiliado.saldo_disponivel,
                'comissao_primeira_venda': afiliado.comissao_primeira_venda or config.comissao_primeira_venda_padrao,
                'comissao_recorrente': afiliado.comissao_recorrente or config.comissao_recorrente_padrao,
                'data_inscricao': afiliado.data_inscricao.isoformat() if afiliado.data_inscricao else None,
                'data_aprovacao': afiliado.data_aprovacao.isoformat() if afiliado.data_aprovacao else None
            },
            'configuracao': {
                'minimo_saque': config.minimo_saque,
                'prazo_cookie_dias': config.prazo_cookie_dias,
                'prazo_aprovacao_comissao_dias': config.prazo_aprovacao_comissao_dias
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao buscar perfil do afiliado: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/atualizar-perfil', methods=['PUT'])
@login_required
def atualizar_perfil():
    """Atualiza dados do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        data = request.get_json()

        # Atualizar campos permitidos
        if 'nome_completo' in data:
            afiliado.nome_completo = data['nome_completo']
        if 'cpf_cnpj' in data:
            afiliado.cpf_cnpj = data['cpf_cnpj']
        if 'telefone' in data:
            afiliado.telefone = data['telefone']
        if 'banco' in data:
            afiliado.banco = data['banco']
        if 'agencia' in data:
            afiliado.agencia = data['agencia']
        if 'conta' in data:
            afiliado.conta = data['conta']
        if 'tipo_conta' in data:
            afiliado.tipo_conta = data['tipo_conta']
        if 'pix_tipo' in data:
            afiliado.pix_tipo = data['pix_tipo']
        if 'pix_chave' in data:
            afiliado.pix_chave = data['pix_chave']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Perfil atualizado com sucesso'
        })

    except Exception as e:
        print(f"[ERRO] Ao atualizar perfil: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== DASHBOARD E MÉTRICAS ====================

@bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    """Dashboard com métricas do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        # Pegar período (padrão: últimos 30 dias)
        periodo_dias = int(request.args.get('periodo_dias', 30))
        data_inicio = datetime.utcnow() - timedelta(days=periodo_dias)

        # Métricas do período
        clicks_periodo = db.session.query(func.count(Referencia.id)).filter(
            Referencia.afiliado_id == afiliado.id,
            Referencia.data_clique >= data_inicio
        ).scalar() or 0

        cadastros_periodo = db.session.query(func.count(Referencia.id)).filter(
            Referencia.afiliado_id == afiliado.id,
            Referencia.status.in_([StatusReferencia.CADASTRO, StatusReferencia.CONVERTIDO]),
            Referencia.data_cadastro >= data_inicio
        ).scalar() or 0

        vendas_periodo = db.session.query(func.count(Referencia.id)).filter(
            Referencia.afiliado_id == afiliado.id,
            Referencia.status == StatusReferencia.CONVERTIDO,
            Referencia.data_conversao >= data_inicio
        ).scalar() or 0

        comissoes_periodo = db.session.query(func.sum(Comissao.valor)).filter(
            Comissao.afiliado_id == afiliado.id,
            Comissao.data_geracao >= data_inicio
        ).scalar() or 0.0

        # Comissões por status
        comissoes_pendentes = db.session.query(func.sum(Comissao.valor)).filter(
            Comissao.afiliado_id == afiliado.id,
            Comissao.status == StatusComissao.PENDENTE
        ).scalar() or 0.0

        comissoes_aprovadas = db.session.query(func.sum(Comissao.valor)).filter(
            Comissao.afiliado_id == afiliado.id,
            Comissao.status == StatusComissao.APROVADA
        ).scalar() or 0.0

        # Últimas referências
        ultimas_referencias = db.session.query(Referencia).filter(
            Referencia.afiliado_id == afiliado.id
        ).order_by(Referencia.data_clique.desc()).limit(10).all()

        # Últimas comissões
        ultimas_comissoes = db.session.query(Comissao).filter(
            Comissao.afiliado_id == afiliado.id
        ).order_by(Comissao.data_geracao.desc()).limit(10).all()

        # Taxa de conversão
        taxa_conversao = (vendas_periodo / clicks_periodo * 100) if clicks_periodo > 0 else 0

        return jsonify({
            'success': True,
            'metricas': {
                'total': {
                    'clicks': afiliado.total_clicks,
                    'cadastros': afiliado.total_cadastros,
                    'vendas': afiliado.total_vendas,
                    'comissoes_geradas': afiliado.total_comissoes_geradas,
                    'comissoes_pagas': afiliado.total_comissoes_pagas,
                    'saldo_disponivel': afiliado.saldo_disponivel
                },
                'periodo': {
                    'dias': periodo_dias,
                    'clicks': clicks_periodo,
                    'cadastros': cadastros_periodo,
                    'vendas': vendas_periodo,
                    'comissoes': comissoes_periodo,
                    'taxa_conversao': round(taxa_conversao, 2)
                },
                'comissoes': {
                    'pendentes': comissoes_pendentes,
                    'aprovadas': comissoes_aprovadas,
                    'disponiveis_saque': afiliado.saldo_disponivel
                }
            },
            'ultimas_referencias': [{
                'id': ref.id,
                'status': ref.status.value,
                'data_clique': ref.data_clique.isoformat() if ref.data_clique else None,
                'data_conversao': ref.data_conversao.isoformat() if ref.data_conversao else None,
                'valor_compra': ref.valor_primeira_compra,
                'plano': ref.plano_contratado
            } for ref in ultimas_referencias],
            'ultimas_comissoes': [{
                'id': com.id,
                'tipo': com.tipo.value,
                'valor': com.valor,
                'status': com.status.value,
                'data_geracao': com.data_geracao.isoformat() if com.data_geracao else None,
                'descricao': com.descricao
            } for com in ultimas_comissoes]
        })

    except Exception as e:
        print(f"[ERRO] Ao buscar dashboard: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== REFERÊNCIAS E RASTREAMENTO ====================

@bp.route('/referencias', methods=['GET'])
@login_required
def listar_referencias():
    """Lista referências do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        # Filtros
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        query = db.session.query(Referencia).filter(
            Referencia.afiliado_id == afiliado.id
        )

        if status:
            query = query.filter(Referencia.status == StatusReferencia[status.upper()])

        referencias = query.order_by(Referencia.data_clique.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'success': True,
            'referencias': [{
                'id': ref.id,
                'status': ref.status.value,
                'ip_origem': ref.ip_origem,
                'url_origem': ref.url_origem,
                'data_clique': ref.data_clique.isoformat() if ref.data_clique else None,
                'data_cadastro': ref.data_cadastro.isoformat() if ref.data_cadastro else None,
                'data_conversao': ref.data_conversao.isoformat() if ref.data_conversao else None,
                'valor_primeira_compra': ref.valor_primeira_compra,
                'plano_contratado': ref.plano_contratado
            } for ref in referencias.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': referencias.total,
                'pages': referencias.pages
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao listar referências: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== COMISSÕES ====================

@bp.route('/comissoes', methods=['GET'])
@login_required
def listar_comissoes():
    """Lista comissões do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        # Filtros
        status = request.args.get('status')
        tipo = request.args.get('tipo')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        query = db.session.query(Comissao).filter(
            Comissao.afiliado_id == afiliado.id
        )

        if status:
            query = query.filter(Comissao.status == StatusComissao[status.upper()])

        if tipo:
            query = query.filter(Comissao.tipo == TipoComissao[tipo.upper()])

        comissoes = query.order_by(Comissao.data_geracao.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'success': True,
            'comissoes': [{
                'id': com.id,
                'tipo': com.tipo.value,
                'valor': com.valor,
                'percentual': com.percentual,
                'valor_base': com.valor_base,
                'status': com.status.value,
                'descricao': com.descricao,
                'data_geracao': com.data_geracao.isoformat() if com.data_geracao else None,
                'data_aprovacao': com.data_aprovacao.isoformat() if com.data_aprovacao else None,
                'data_pagamento': com.data_pagamento.isoformat() if com.data_pagamento else None
            } for com in comissoes.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': comissoes.total,
                'pages': comissoes.pages
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao listar comissões: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== SAQUES ====================

@bp.route('/saques', methods=['GET'])
@login_required
def listar_saques():
    """Lista saques do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        saques = db.session.query(SaqueAfiliado).filter(
            SaqueAfiliado.afiliado_id == afiliado.id
        ).order_by(SaqueAfiliado.data_solicitacao.desc()).all()

        return jsonify({
            'success': True,
            'saques': [{
                'id': saque.id,
                'valor_solicitado': saque.valor_solicitado,
                'valor_pago': saque.valor_pago,
                'taxa': saque.taxa,
                'status': saque.status,
                'metodo_pagamento': saque.metodo_pagamento,
                'data_solicitacao': saque.data_solicitacao.isoformat() if saque.data_solicitacao else None,
                'data_aprovacao': saque.data_aprovacao.isoformat() if saque.data_aprovacao else None,
                'data_pagamento': saque.data_pagamento.isoformat() if saque.data_pagamento else None,
                'observacoes': saque.observacoes,
                'motivo_rejeicao': saque.motivo_rejeicao
            } for saque in saques],
            'saldo_disponivel': afiliado.saldo_disponivel
        })

    except Exception as e:
        print(f"[ERRO] Ao listar saques: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/solicitar-saque', methods=['POST'])
@login_required
def solicitar_saque():
    """Solicita um saque"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        if afiliado.status != StatusAfiliado.ATIVO:
            return jsonify({
                'success': False,
                'message': 'Seu cadastro precisa estar ativo para solicitar saques'
            }), 400

        data = request.get_json()
        valor = float(data.get('valor', 0))
        metodo = data.get('metodo_pagamento', 'pix')

        # Pegar configurações
        config = db.session.query(ConfiguracaoAfiliados).first()

        # Validações
        if valor <= 0:
            return jsonify({'success': False, 'message': 'Valor inválido'}), 400

        if valor < config.minimo_saque:
            return jsonify({
                'success': False,
                'message': f'Valor mínimo para saque é R$ {config.minimo_saque:.2f}'
            }), 400

        if valor > afiliado.saldo_disponivel:
            return jsonify({
                'success': False,
                'message': 'Saldo insuficiente'
            }), 400

        # Verificar se tem dados bancários
        if metodo == 'pix' and not afiliado.pix_chave:
            return jsonify({
                'success': False,
                'message': 'Cadastre uma chave PIX antes de solicitar saque'
            }), 400

        # Criar saque
        saque = SaqueAfiliado(
            afiliado_id=afiliado.id,
            valor_solicitado=valor,
            metodo_pagamento=metodo,
            status='pendente'
        )

        # Debitar do saldo disponível
        afiliado.saldo_disponivel -= valor

        db.session.add(saque)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Saque solicitado com sucesso',
            'saque': {
                'id': saque.id,
                'valor': saque.valor_solicitado,
                'status': saque.status,
                'data_solicitacao': saque.data_solicitacao.isoformat()
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao solicitar saque: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== LINK DE REFERÊNCIA ====================

@bp.route('/meu-link', methods=['GET'])
@login_required
def meu_link():
    """Retorna link de referência do afiliado"""
    try:
        from app import db

        afiliado = db.session.query(Afiliado).filter_by(
            usuario_id=current_user.id
        ).first()

        if not afiliado:
            return jsonify({'success': False, 'message': 'Afiliado não encontrado'}), 404

        # URL base (pode ser configurável)
        base_url = request.host_url.rstrip('/')
        link_referencia = f"{base_url}/r/{afiliado.chave_referencia}"

        return jsonify({
            'success': True,
            'link': link_referencia,
            'chave': afiliado.chave_referencia
        })

    except Exception as e:
        print(f"[ERRO] Ao buscar link: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================== CONFIGURAÇÕES (Admin) ====================

@bp.route('/configuracoes', methods=['GET'])
@login_required
def obter_configuracoes():
    """Retorna configurações do programa de afiliados"""
    try:
        from app import db

        config = db.session.query(ConfiguracaoAfiliados).first()

        if not config:
            return jsonify({'success': False, 'message': 'Configurações não encontradas'}), 404

        return jsonify({
            'success': True,
            'configuracoes': {
                'comissao_primeira_venda_padrao': config.comissao_primeira_venda_padrao,
                'comissao_recorrente_padrao': config.comissao_recorrente_padrao,
                'prazo_cookie_dias': config.prazo_cookie_dias,
                'minimo_saque': config.minimo_saque,
                'prazo_aprovacao_comissao_dias': config.prazo_aprovacao_comissao_dias,
                'bonus_meta_5_vendas': config.bonus_meta_5_vendas,
                'bonus_meta_10_vendas': config.bonus_meta_10_vendas,
                'bonus_meta_20_vendas': config.bonus_meta_20_vendas,
                'programa_ativo': config.programa_ativo,
                'aceitar_novos_afiliados': config.aceitar_novos_afiliados,
                'termos_uso': config.termos_uso,
                'politica_pagamento': config.politica_pagamento
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao buscar configurações: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
