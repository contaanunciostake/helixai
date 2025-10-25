"""
Rotas para Rastreamento de Afiliados - AIRA
Sistema de tracking de cliques, conversões e cookies
"""

from flask import Blueprint, request, jsonify, redirect, make_response
from database.models import Afiliado, Referencia, StatusReferencia, StatusAfiliado
from datetime import datetime, timedelta
import json

bp = Blueprint('tracking', __name__, url_prefix='/r')


@bp.route('/<chave_referencia>', methods=['GET'])
def rastrear_click(chave_referencia):
    """
    Rastreia clique em link de afiliado e redireciona para landing page
    URL: /r/<chave>
    """
    try:
        from app import db

        # Buscar afiliado
        afiliado = db.session.query(Afiliado).filter_by(
            chave_referencia=chave_referencia,
            status=StatusAfiliado.ATIVO
        ).first()

        if not afiliado:
            # Redirecionar para home sem rastreamento
            return redirect('/')

        # Pegar informações da requisição
        ip_origem = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        url_origem = request.headers.get('Referer', '')
        url_destino = request.args.get('redirect', '/')  # Para onde redirecionar

        # Pegar configurações de prazo
        from database.models import ConfiguracaoAfiliados
        config = db.session.query(ConfiguracaoAfiliados).first()
        prazo_cookie_dias = config.prazo_cookie_dias if config else 30

        # Calcular data de expiração do cookie
        data_expiracao = datetime.utcnow() + timedelta(days=prazo_cookie_dias)

        # Criar referência
        referencia = Referencia(
            afiliado_id=afiliado.id,
            ip_origem=ip_origem,
            user_agent=user_agent,
            url_origem=url_origem,
            url_destino=url_destino,
            status=StatusReferencia.CLICK,
            data_expiracao=data_expiracao
        )

        db.session.add(referencia)

        # Incrementar contador de clicks
        afiliado.total_clicks += 1

        db.session.commit()

        # Criar resposta com redirect
        response = make_response(redirect(url_destino))

        # Setar cookie de rastreamento (dura X dias)
        cookie_data = {
            'ref_id': referencia.id,
            'afiliado_id': afiliado.id,
            'chave': chave_referencia
        }

        response.set_cookie(
            'aira_ref',
            value=json.dumps(cookie_data),
            max_age=60*60*24*prazo_cookie_dias,  # Segundos
            httponly=True,
            samesite='Lax'
        )

        print(f"[TRACKING] Click rastreado: Afiliado {afiliado.id}, Referência {referencia.id}")

        return response

    except Exception as e:
        print(f"[ERRO] Ao rastrear click: {e}")
        # Em caso de erro, redirecionar sem rastreamento
        return redirect('/')


@bp.route('/api/tracking/registrar-cadastro', methods=['POST'])
def registrar_cadastro():
    """
    Registra quando um visitante se cadastra
    Chamado pelo frontend após cadastro bem-sucedido
    """
    try:
        from app import db

        # Verificar cookie de referência
        cookie_ref = request.cookies.get('aira_ref')
        if not cookie_ref:
            return jsonify({
                'success': False,
                'message': 'Nenhuma referência encontrada'
            }), 404

        cookie_data = json.loads(cookie_ref)
        ref_id = cookie_data.get('ref_id')

        if not ref_id:
            return jsonify({'success': False, 'message': 'ID de referência inválido'}), 400

        # Buscar referência
        referencia = db.session.query(Referencia).filter_by(id=ref_id).first()

        if not referencia:
            return jsonify({'success': False, 'message': 'Referência não encontrada'}), 404

        # Atualizar referência
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        lead_id = data.get('lead_id')

        referencia.status = StatusReferencia.CADASTRO
        referencia.data_cadastro = datetime.utcnow()

        if usuario_id:
            referencia.cliente_novo_id = usuario_id
        if lead_id:
            referencia.lead_id = lead_id

        # Incrementar contador de cadastros do afiliado
        afiliado = referencia.afiliado
        afiliado.total_cadastros += 1

        db.session.commit()

        print(f"[TRACKING] Cadastro registrado: Referência {ref_id}, Usuário {usuario_id}")

        return jsonify({
            'success': True,
            'message': 'Cadastro rastreado com sucesso'
        })

    except Exception as e:
        print(f"[ERRO] Ao registrar cadastro: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/api/tracking/registrar-conversao', methods=['POST'])
def registrar_conversao():
    """
    Registra quando uma conversão (venda) acontece
    Chamado após confirmação de pagamento
    """
    try:
        from app import db
        from database.models import Comissao, TipoComissao, StatusComissao, ConfiguracaoAfiliados

        # Verificar cookie de referência
        cookie_ref = request.cookies.get('aira_ref')
        data = request.get_json()

        ref_id = None
        afiliado_id = None

        # Tentar pegar do cookie ou dos dados enviados
        if cookie_ref:
            cookie_data = json.loads(cookie_ref)
            ref_id = cookie_data.get('ref_id')
            afiliado_id = cookie_data.get('afiliado_id')
        else:
            # Ou buscar pela chave de referência enviada
            chave = data.get('chave_referencia')
            if chave:
                afiliado = db.session.query(Afiliado).filter_by(
                    chave_referencia=chave
                ).first()
                if afiliado:
                    afiliado_id = afiliado.id

        if not ref_id and not afiliado_id:
            return jsonify({
                'success': False,
                'message': 'Nenhuma referência encontrada'
            }), 404

        # Buscar referência
        referencia = None
        if ref_id:
            referencia = db.session.query(Referencia).filter_by(id=ref_id).first()

        # Se não encontrou referência pelo ID, buscar a mais recente do afiliado para o usuário
        usuario_id = data.get('usuario_id')
        if not referencia and afiliado_id and usuario_id:
            referencia = db.session.query(Referencia).filter_by(
                afiliado_id=afiliado_id,
                cliente_novo_id=usuario_id
            ).order_by(Referencia.data_clique.desc()).first()

        if not referencia:
            return jsonify({'success': False, 'message': 'Referência não encontrada'}), 404

        # Verificar se já não foi convertido
        if referencia.status == StatusReferencia.CONVERTIDO:
            return jsonify({
                'success': False,
                'message': 'Conversão já registrada anteriormente'
            }), 400

        # Dados da compra
        valor_compra = float(data.get('valor_compra', 0))
        plano = data.get('plano')
        pagamento_id = data.get('pagamento_id')
        assinatura_id = data.get('assinatura_id')

        # Atualizar referência
        referencia.status = StatusReferencia.CONVERTIDO
        referencia.data_conversao = datetime.utcnow()
        referencia.valor_primeira_compra = valor_compra
        referencia.plano_contratado = plano

        # Incrementar vendas do afiliado
        afiliado = referencia.afiliado
        afiliado.total_vendas += 1

        # Calcular comissão
        config = db.session.query(ConfiguracaoAfiliados).first()

        # Usar comissão personalizada ou padrão
        percentual_comissao = afiliado.comissao_primeira_venda or config.comissao_primeira_venda_padrao
        valor_comissao = (valor_compra * percentual_comissao) / 100

        # Criar comissão
        comissao = Comissao(
            afiliado_id=afiliado.id,
            referencia_id=referencia.id,
            tipo=TipoComissao.PRIMEIRA_VENDA,
            valor=valor_comissao,
            percentual=percentual_comissao,
            valor_base=valor_compra,
            status=StatusComissao.PENDENTE,  # Fica pendente por X dias
            pagamento_id=pagamento_id,
            assinatura_id=assinatura_id,
            descricao=f"Comissão de primeira venda - {plano}"
        )

        db.session.add(comissao)

        # Atualizar métricas do afiliado
        afiliado.total_comissoes_geradas += valor_comissao

        db.session.commit()

        print(f"[TRACKING] Conversão registrada: Referência {referencia.id}, Comissão R$ {valor_comissao:.2f}")

        return jsonify({
            'success': True,
            'message': 'Conversão rastreada com sucesso',
            'comissao': {
                'id': comissao.id,
                'valor': valor_comissao,
                'percentual': percentual_comissao
            }
        })

    except Exception as e:
        print(f"[ERRO] Ao registrar conversão: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/api/tracking/verificar-referencia', methods=['GET'])
def verificar_referencia():
    """
    Verifica se existe uma referência válida no cookie
    Usado pelo frontend para saber se veio de afiliado
    """
    try:
        cookie_ref = request.cookies.get('aira_ref')

        if not cookie_ref:
            return jsonify({
                'success': True,
                'tem_referencia': False
            })

        cookie_data = json.loads(cookie_ref)

        return jsonify({
            'success': True,
            'tem_referencia': True,
            'chave': cookie_data.get('chave'),
            'ref_id': cookie_data.get('ref_id')
        })

    except Exception as e:
        print(f"[ERRO] Ao verificar referência: {e}")
        return jsonify({
            'success': True,
            'tem_referencia': False
        })
