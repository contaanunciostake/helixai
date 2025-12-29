"""
Rotas públicas da Loja Virtual - EaiChat/VendeAI
NÃO requer autenticação - Acesso público
"""

from flask import Blueprint, render_template, request, jsonify, abort
from sqlalchemy import text, or_
from datetime import datetime
from urllib.parse import quote
import uuid
import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import DatabaseManager, Empresa, Produto, CategoriaLoja, PedidoLoja, Lead

# Importar db_manager global para usar PostgreSQL em produção
try:
    from backend import db_manager
except ImportError:
    db_path = Path(__file__).parent.parent / 'vendeai.db'
    db_manager = DatabaseManager(f'sqlite:///{db_path}')

loja_bp = Blueprint('loja', __name__)

print('\n' + '='*60)
print('         LOJA VIRTUAL PÚBLICA - MÓDULO CARREGADO')
print('='*60)
print('[LOJA] Rotas públicas disponíveis:')
print('[LOJA]   GET  /lojas                    - Lista estabelecimentos')
print('[LOJA]   GET  /loja/<slug>              - Página da loja')
print('[LOJA]   GET  /api/loja/<slug>/produtos - API produtos')
print('[LOJA]   GET  /api/loja/<slug>/info     - API info loja')
print('[LOJA]   POST /api/loja/<slug>/pedido   - Criar pedido')
print('='*60 + '\n')


# ==================== FUNÇÕES AUXILIARES ====================

def verificar_horario_funcionamento(horario):
    """Verifica se estabelecimento está aberto"""
    if not horario:
        return True  # Se não tem horário configurado, considera sempre aberto

    agora = datetime.now()
    dias_semana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
    dia_atual = dias_semana[agora.weekday()]

    if dia_atual not in horario or not horario.get(dia_atual):
        return False

    hora_atual = agora.strftime('%H:%M')
    config_dia = horario[dia_atual]
    abre = config_dia.get('abre', '00:00')
    fecha = config_dia.get('fecha', '23:59')

    return abre <= hora_atual <= fecha


def produto_to_dict(produto):
    """Converte produto para dicionário"""
    preco_final = produto.preco_promocional if produto.em_promocao and produto.preco_promocional else produto.preco
    return {
        'id': produto.id,
        'nome': produto.nome,
        'descricao': produto.descricao or '',
        'preco': float(produto.preco or 0),
        'preco_promocional': float(produto.preco_promocional or 0) if produto.preco_promocional else None,
        'preco_final': float(preco_final or 0),
        'em_promocao': produto.em_promocao or False,
        'imagem': produto.imagem_url or '',
        'imagens_galeria': produto.imagens_galeria or [],
        'variacoes': produto.variacoes or [],
        'estoque': produto.estoque or 0,
        'destaque': produto.destaque or False,
        'categoria': produto.categoria or '',
        'categoria_loja_id': produto.categoria_loja_id,
        'sku': produto.sku or ''
    }


def gerar_mensagem_whatsapp(empresa, pedido, itens):
    """Gera mensagem formatada para WhatsApp"""
    msg = f"🛒 *NOVO PEDIDO - {empresa.nome}*\n"
    msg += f"📋 Código: *{pedido.codigo}*\n"
    msg += "━━━━━━━━━━━━━━━━━━━━\n\n"

    for item in itens:
        msg += f"• {item['quantidade']}x {item['nome']}\n"
        if item.get('variacoes'):
            for var_nome, var_valor in item['variacoes'].items():
                msg += f"   ↳ {var_nome}: {var_valor}\n"
        msg += f"   R$ {item['subtotal']:.2f}\n\n"

    msg += "━━━━━━━━━━━━━━━━━━━━\n"
    msg += f"Subtotal: R$ {pedido.subtotal:.2f}\n"

    if pedido.taxa_entrega and pedido.taxa_entrega > 0:
        msg += f"Entrega: R$ {pedido.taxa_entrega:.2f}\n"

    msg += f"*TOTAL: R$ {pedido.total:.2f}*\n\n"

    if pedido.tipo_entrega == 'entrega':
        msg += "🛵 *Tipo: Entrega*\n"
        if pedido.cliente_endereco:
            msg += f"📍 {pedido.cliente_endereco}\n"
    else:
        msg += "🏪 *Tipo: Retirada na loja*\n"

    if pedido.cliente_nome:
        msg += f"\n👤 Cliente: {pedido.cliente_nome}\n"

    msg += "\n_Pedido realizado pela Loja Virtual_"

    return quote(msg)


# ==================== PÁGINAS HTML ====================

@loja_bp.route('/lojas')
def index():
    """Página principal - Lista de estabelecimentos"""
    session = db_manager.get_session()
    try:
        # Filtros
        busca = request.args.get('q', '')
        categoria = request.args.get('categoria', '')
        cidade = request.args.get('cidade', '')

        # Query base - apenas lojas ativas com slug
        query = session.query(Empresa).filter(
            Empresa.loja_publica_ativa == True,
            Empresa.slug != None
        )

        # Aplicar filtros
        if busca:
            query = query.filter(
                or_(
                    Empresa.nome.ilike(f'%{busca}%'),
                    Empresa.nome_fantasia.ilike(f'%{busca}%'),
                    Empresa.descricao_curta.ilike(f'%{busca}%')
                )
            )
        if categoria:
            query = query.filter(Empresa.categoria_negocio == categoria)
        if cidade:
            query = query.filter(Empresa.cidade == cidade)

        # Ordenar por avaliação
        estabelecimentos = query.order_by(Empresa.avaliacao_media.desc()).all()

        # Categorias disponíveis para filtro
        categorias_result = session.query(Empresa.categoria_negocio).filter(
            Empresa.loja_publica_ativa == True,
            Empresa.categoria_negocio != None
        ).distinct().all()
        categorias = [c[0] for c in categorias_result if c[0]]

        # Cidades disponíveis
        cidades_result = session.query(Empresa.cidade).filter(
            Empresa.loja_publica_ativa == True,
            Empresa.cidade != None
        ).distinct().all()
        cidades = [c[0] for c in cidades_result if c[0]]

        # Verificar status aberto/fechado para cada estabelecimento
        for est in estabelecimentos:
            est.aberto = verificar_horario_funcionamento(est.horario_funcionamento)

        return render_template('loja/index.html',
            estabelecimentos=estabelecimentos,
            categorias=categorias,
            cidades=cidades,
            filtros={'busca': busca, 'categoria': categoria, 'cidade': cidade}
        )

    except Exception as e:
        print(f'[LOJA] Erro ao listar estabelecimentos: {e}')
        import traceback
        traceback.print_exc()
        return render_template('loja/index.html',
            estabelecimentos=[],
            categorias=[],
            cidades=[],
            filtros={'busca': '', 'categoria': '', 'cidade': ''},
            error=str(e)
        )
    finally:
        session.close()


@loja_bp.route('/loja/<slug>')
def estabelecimento(slug):
    """Página do estabelecimento com produtos"""
    session = db_manager.get_session()
    try:
        # Buscar empresa pelo slug
        empresa = session.query(Empresa).filter(
            Empresa.slug == slug,
            Empresa.loja_publica_ativa == True
        ).first()

        if not empresa:
            abort(404)

        # Verificar se está aberto
        aberto = verificar_horario_funcionamento(empresa.horario_funcionamento)

        # Categorias da loja
        categorias = session.query(CategoriaLoja).filter(
            CategoriaLoja.empresa_id == empresa.id,
            CategoriaLoja.ativo == True
        ).order_by(CategoriaLoja.ordem).all()

        # Produtos em destaque
        destaques = session.query(Produto).filter(
            Produto.empresa_id == empresa.id,
            Produto.ativo == True,
            Produto.exibir_loja == True,
            Produto.destaque == True
        ).limit(6).all()

        # Todos os produtos agrupados por categoria
        produtos_por_categoria = {}

        # Produtos sem categoria
        produtos_sem_categoria = session.query(Produto).filter(
            Produto.empresa_id == empresa.id,
            Produto.ativo == True,
            Produto.exibir_loja == True,
            Produto.categoria_loja_id == None
        ).order_by(Produto.ordem, Produto.nome).all()

        if produtos_sem_categoria:
            produtos_por_categoria['geral'] = produtos_sem_categoria

        # Produtos por categoria
        for cat in categorias:
            produtos = session.query(Produto).filter(
                Produto.empresa_id == empresa.id,
                Produto.categoria_loja_id == cat.id,
                Produto.ativo == True,
                Produto.exibir_loja == True
            ).order_by(Produto.ordem, Produto.nome).all()

            if produtos:
                produtos_por_categoria[cat.id] = produtos

        # Se não há categorias, buscar todos os produtos
        if not categorias:
            todos_produtos = session.query(Produto).filter(
                Produto.empresa_id == empresa.id,
                Produto.ativo == True,
                Produto.exibir_loja == True
            ).order_by(Produto.ordem, Produto.nome).all()

            if todos_produtos:
                produtos_por_categoria['todos'] = todos_produtos

        return render_template('loja/estabelecimento.html',
            empresa=empresa,
            categorias=categorias,
            destaques=destaques,
            produtos_por_categoria=produtos_por_categoria,
            aberto=aberto
        )

    except Exception as e:
        print(f'[LOJA] Erro ao carregar estabelecimento {slug}: {e}')
        import traceback
        traceback.print_exc()
        abort(500)
    finally:
        session.close()


# ==================== API REST ====================

@loja_bp.route('/api/loja/<slug>/produtos')
def api_produtos(slug):
    """API: Lista produtos da loja"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter(
            Empresa.slug == slug,
            Empresa.loja_publica_ativa == True
        ).first()

        if not empresa:
            return jsonify({'error': 'Loja não encontrada'}), 404

        categoria_id = request.args.get('categoria')
        busca = request.args.get('q', '')

        query = session.query(Produto).filter(
            Produto.empresa_id == empresa.id,
            Produto.ativo == True,
            Produto.exibir_loja == True
        )

        if categoria_id and categoria_id != 'todos':
            query = query.filter(Produto.categoria_loja_id == int(categoria_id))

        if busca:
            query = query.filter(
                or_(
                    Produto.nome.ilike(f'%{busca}%'),
                    Produto.descricao.ilike(f'%{busca}%'),
                    Produto.categoria.ilike(f'%{busca}%')
                )
            )

        produtos = query.order_by(Produto.ordem, Produto.nome).all()

        return jsonify({
            'success': True,
            'produtos': [produto_to_dict(p) for p in produtos],
            'total': len(produtos)
        })

    except Exception as e:
        print(f'[LOJA API] Erro ao listar produtos: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@loja_bp.route('/api/loja/<slug>/info')
def api_info_loja(slug):
    """API: Informações da loja para personalização"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter(
            Empresa.slug == slug,
            Empresa.loja_publica_ativa == True
        ).first()

        if not empresa:
            return jsonify({'error': 'Loja não encontrada'}), 404

        # Formatar WhatsApp
        whatsapp = empresa.whatsapp_numero or ''
        whatsapp_limpo = whatsapp.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if whatsapp_limpo and not whatsapp_limpo.startswith('55'):
            whatsapp_limpo = '55' + whatsapp_limpo

        return jsonify({
            'success': True,
            'nome': empresa.nome or empresa.nome_fantasia,
            'nome_fantasia': empresa.nome_fantasia,
            'slug': empresa.slug,
            'logo_url': empresa.logo_url,
            'banner_url': empresa.banner_url,
            'cor_primaria': empresa.cor_primaria or '#22C55E',
            'cor_secundaria': empresa.cor_secundaria or '#16A34A',
            'tema_padrao': empresa.tema_padrao or 'dark',
            'descricao': empresa.descricao_curta,
            'categoria': empresa.categoria_negocio,
            'whatsapp': whatsapp_limpo,
            'endereco': empresa.endereco,
            'cidade': empresa.cidade,
            'estado': empresa.estado,
            'avaliacao': empresa.avaliacao_media or 5.0,
            'total_avaliacoes': empresa.total_avaliacoes or 0,
            'horario': empresa.horario_funcionamento,
            'entrega_ativa': empresa.entrega_ativa,
            'taxa_entrega': empresa.taxa_entrega or 0,
            'pedido_minimo': empresa.pedido_minimo or 0,
            'tempo_entrega': empresa.tempo_entrega or '30-60 min',
            'aberto': verificar_horario_funcionamento(empresa.horario_funcionamento)
        })

    except Exception as e:
        print(f'[LOJA API] Erro ao obter info: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@loja_bp.route('/api/loja/<slug>/pedido', methods=['POST'])
def api_criar_pedido(slug):
    """API: Criar pedido e retornar link do WhatsApp"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter(
            Empresa.slug == slug,
            Empresa.loja_publica_ativa == True
        ).first()

        if not empresa:
            return jsonify({'error': 'Loja não encontrada'}), 404

        data = request.get_json()

        # Validar dados
        itens = data.get('itens', [])
        if not itens:
            return jsonify({'error': 'Carrinho vazio'}), 400

        # Calcular totais
        subtotal = 0
        itens_processados = []

        for item in itens:
            produto = session.query(Produto).filter(
                Produto.id == item.get('produto_id'),
                Produto.empresa_id == empresa.id
            ).first()

            if not produto:
                continue

            preco = produto.preco_promocional if produto.em_promocao and produto.preco_promocional else produto.preco
            preco = float(preco or 0)
            qtd = int(item.get('quantidade', 1))
            item_total = preco * qtd
            subtotal += item_total

            itens_processados.append({
                'produto_id': produto.id,
                'nome': produto.nome,
                'quantidade': qtd,
                'preco_unitario': preco,
                'subtotal': item_total,
                'variacoes': item.get('variacoes', {})
            })

            # Incrementar cliques WhatsApp
            produto.cliques_whatsapp = (produto.cliques_whatsapp or 0) + 1

        if not itens_processados:
            return jsonify({'error': 'Nenhum produto válido no carrinho'}), 400

        # Taxa de entrega
        tipo_entrega = data.get('tipo_entrega', 'entrega')
        taxa_entrega = float(empresa.taxa_entrega or 0) if tipo_entrega == 'entrega' else 0

        # Total
        total = subtotal + taxa_entrega

        # Verificar pedido mínimo
        pedido_minimo = float(empresa.pedido_minimo or 0)
        if subtotal < pedido_minimo:
            return jsonify({
                'error': f'Pedido mínimo de R$ {pedido_minimo:.2f}'
            }), 400

        # Gerar código do pedido
        codigo = f"PED-{uuid.uuid4().hex[:6].upper()}"

        # Criar pedido no banco
        pedido = PedidoLoja(
            empresa_id=empresa.id,
            codigo=codigo,
            cliente_nome=data.get('cliente_nome', ''),
            cliente_telefone=data.get('cliente_telefone', ''),
            cliente_endereco=data.get('cliente_endereco', ''),
            itens=itens_processados,
            subtotal=subtotal,
            taxa_entrega=taxa_entrega,
            total=total,
            tipo_entrega=tipo_entrega,
            status='pendente',
            origem='loja_virtual'
        )
        session.add(pedido)

        # Criar/atualizar lead se tiver telefone
        if data.get('cliente_telefone'):
            telefone = data['cliente_telefone']
            lead = session.query(Lead).filter(
                Lead.empresa_id == empresa.id,
                Lead.telefone == telefone
            ).first()

            if not lead:
                lead = Lead(
                    empresa_id=empresa.id,
                    nome=data.get('cliente_nome', 'Cliente Loja Virtual'),
                    telefone=telefone,
                    origem='loja_virtual'
                )
                session.add(lead)
                session.flush()

            pedido.lead_id = lead.id

        session.flush()

        # Gerar mensagem WhatsApp
        mensagem = gerar_mensagem_whatsapp(empresa, pedido, itens_processados)

        # Gerar link WhatsApp
        whatsapp_numero = (empresa.whatsapp_numero or '').replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not whatsapp_numero.startswith('55'):
            whatsapp_numero = '55' + whatsapp_numero

        whatsapp_link = f"https://wa.me/{whatsapp_numero}?text={mensagem}"

        # Salvar mensagem no pedido
        pedido.mensagem_whatsapp = mensagem
        pedido.enviado_whatsapp = True

        session.commit()

        print(f'[LOJA] Pedido {codigo} criado para empresa {empresa.id}')

        return jsonify({
            'success': True,
            'pedido_codigo': codigo,
            'whatsapp_link': whatsapp_link,
            'subtotal': subtotal,
            'taxa_entrega': taxa_entrega,
            'total': total
        })

    except Exception as e:
        session.rollback()
        print(f'[LOJA API] Erro ao criar pedido: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@loja_bp.route('/api/loja/<slug>/categorias')
def api_categorias(slug):
    """API: Lista categorias da loja"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter(
            Empresa.slug == slug,
            Empresa.loja_publica_ativa == True
        ).first()

        if not empresa:
            return jsonify({'error': 'Loja não encontrada'}), 404

        categorias = session.query(CategoriaLoja).filter(
            CategoriaLoja.empresa_id == empresa.id,
            CategoriaLoja.ativo == True
        ).order_by(CategoriaLoja.ordem).all()

        return jsonify({
            'success': True,
            'categorias': [{
                'id': c.id,
                'nome': c.nome,
                'descricao': c.descricao,
                'icone': c.icone,
                'imagem_url': c.imagem_url
            } for c in categorias],
            'total': len(categorias)
        })

    except Exception as e:
        print(f'[LOJA API] Erro ao listar categorias: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


print('[LOJA PÚBLICA] Módulo carregado com sucesso')
