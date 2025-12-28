"""
Rotas para gestão de produtos de tintas - Módulo Loja de Tintas
VendeAI - Sistema de Automação WhatsApp com IA
"""
from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from functools import wraps
from datetime import datetime
import sys
import os

# Adicionar path do database
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from database.models import (
    Base, DatabaseManager,
    ProdutoTinta, CategoriaTinta, PaletaCores,
    OrcamentoTinta, ConfiguracaoBotTintas, Empresa
)

tintas_bp = Blueprint('tintas', __name__, url_prefix='/tintas')


def empresa_required(f):
    """Decorator para verificar se usuário tem empresa"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.empresa_id:
            flash('Acesso negado - empresa não configurada', 'error')
            return redirect(url_for('dashboard.index'))
        return f(*args, **kwargs)
    return decorated_function


def get_db_session():
    """Obtém sessão do banco de dados"""
    from flask import current_app
    if hasattr(current_app, 'db_session'):
        return current_app.db_session
    # Fallback para SQLite local
    db = DatabaseManager()
    return db.get_session()


# ============ PRODUTOS ============

@tintas_bp.route('/produtos')
@login_required
@empresa_required
def listar_produtos():
    """Lista todos os produtos de tinta"""
    session = get_db_session()
    try:
        produtos = session.query(ProdutoTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).order_by(ProdutoTinta.nome).all()

        categorias = session.query(CategoriaTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).all()

        return render_template('tintas/produtos.html',
                               produtos=produtos,
                               categorias=categorias)
    finally:
        session.close()


@tintas_bp.route('/produtos/novo', methods=['GET', 'POST'])
@login_required
@empresa_required
def novo_produto():
    """Cadastrar novo produto"""
    session = get_db_session()
    try:
        if request.method == 'POST':
            # Processar tamanhos e preços
            tamanhos_precos = {}
            preco_900ml = request.form.get('preco_900ml')
            preco_3600ml = request.form.get('preco_3600ml')
            preco_18l = request.form.get('preco_18l')

            if preco_900ml:
                tamanhos_precos['0.9L'] = float(preco_900ml)
            if preco_3600ml:
                tamanhos_precos['3.6L'] = float(preco_3600ml)
            if preco_18l:
                tamanhos_precos['18L'] = float(preco_18l)

            produto = ProdutoTinta(
                empresa_id=current_user.empresa_id,
                categoria_id=request.form.get('categoria_id') or None,
                codigo=request.form.get('codigo'),
                nome=request.form.get('nome'),
                marca=request.form.get('marca'),
                linha=request.form.get('linha'),
                tipo=request.form.get('tipo'),
                acabamento=request.form.get('acabamento'),
                ambiente=request.form.get('ambiente'),
                base=request.form.get('base'),
                cor_nome=request.form.get('cor_nome'),
                cor_codigo=request.form.get('cor_codigo'),
                cor_hex=request.form.get('cor_hex'),
                permite_tingimento=request.form.get('permite_tingimento') == 'on',
                rendimento_m2_litro=float(request.form.get('rendimento_m2_litro') or 10),
                rendimento_demaos=int(request.form.get('rendimento_demaos') or 2),
                tempo_secagem_toque=request.form.get('tempo_secagem_toque'),
                tempo_secagem_final=request.form.get('tempo_secagem_final'),
                tempo_entre_demaos=request.form.get('tempo_entre_demaos'),
                tamanhos_precos=tamanhos_precos,
                diluicao=request.form.get('diluicao'),
                aplicacao=request.form.get('aplicacao'),
                superficie=request.form.get('superficie'),
                preparo_superficie=request.form.get('preparo_superficie'),
                imagem_url=request.form.get('imagem_url'),
                ficha_tecnica_url=request.form.get('ficha_tecnica_url'),
                estoque=int(request.form.get('estoque') or 0),
                destaque=request.form.get('destaque') == 'on'
            )
            session.add(produto)
            session.commit()
            flash('Produto cadastrado com sucesso!', 'success')
            return redirect(url_for('tintas.listar_produtos'))

        categorias = session.query(CategoriaTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).all()
        return render_template('tintas/produto_form.html', categorias=categorias, produto=None)
    finally:
        session.close()


@tintas_bp.route('/produtos/<int:id>', methods=['GET'])
@login_required
@empresa_required
def ver_produto(id):
    """Ver detalhes do produto"""
    session = get_db_session()
    try:
        produto = session.query(ProdutoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if not produto:
            flash('Produto não encontrado', 'error')
            return redirect(url_for('tintas.listar_produtos'))

        categorias = session.query(CategoriaTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).all()

        return render_template('tintas/produto_form.html', produto=produto, categorias=categorias)
    finally:
        session.close()


@tintas_bp.route('/produtos/<int:id>/editar', methods=['POST'])
@login_required
@empresa_required
def editar_produto(id):
    """Editar produto existente"""
    session = get_db_session()
    try:
        produto = session.query(ProdutoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if not produto:
            flash('Produto não encontrado', 'error')
            return redirect(url_for('tintas.listar_produtos'))

        # Atualizar campos
        produto.categoria_id = request.form.get('categoria_id') or None
        produto.codigo = request.form.get('codigo')
        produto.nome = request.form.get('nome')
        produto.marca = request.form.get('marca')
        produto.linha = request.form.get('linha')
        produto.tipo = request.form.get('tipo')
        produto.acabamento = request.form.get('acabamento')
        produto.ambiente = request.form.get('ambiente')
        produto.base = request.form.get('base')
        produto.cor_nome = request.form.get('cor_nome')
        produto.cor_codigo = request.form.get('cor_codigo')
        produto.cor_hex = request.form.get('cor_hex')
        produto.permite_tingimento = request.form.get('permite_tingimento') == 'on'
        produto.rendimento_m2_litro = float(request.form.get('rendimento_m2_litro') or 10)
        produto.rendimento_demaos = int(request.form.get('rendimento_demaos') or 2)
        produto.tempo_secagem_toque = request.form.get('tempo_secagem_toque')
        produto.tempo_secagem_final = request.form.get('tempo_secagem_final')
        produto.tempo_entre_demaos = request.form.get('tempo_entre_demaos')
        produto.diluicao = request.form.get('diluicao')
        produto.aplicacao = request.form.get('aplicacao')
        produto.superficie = request.form.get('superficie')
        produto.preparo_superficie = request.form.get('preparo_superficie')
        produto.imagem_url = request.form.get('imagem_url')
        produto.ficha_tecnica_url = request.form.get('ficha_tecnica_url')
        produto.estoque = int(request.form.get('estoque') or 0)
        produto.destaque = request.form.get('destaque') == 'on'

        # Processar tamanhos e preços
        tamanhos_precos = {}
        preco_900ml = request.form.get('preco_900ml')
        preco_3600ml = request.form.get('preco_3600ml')
        preco_18l = request.form.get('preco_18l')

        if preco_900ml:
            tamanhos_precos['0.9L'] = float(preco_900ml)
        if preco_3600ml:
            tamanhos_precos['3.6L'] = float(preco_3600ml)
        if preco_18l:
            tamanhos_precos['18L'] = float(preco_18l)

        produto.tamanhos_precos = tamanhos_precos
        produto.updated_at = datetime.utcnow()

        session.commit()
        flash('Produto atualizado com sucesso!', 'success')
        return redirect(url_for('tintas.listar_produtos'))
    finally:
        session.close()


@tintas_bp.route('/produtos/<int:id>/excluir', methods=['POST'])
@login_required
@empresa_required
def excluir_produto(id):
    """Excluir produto (soft delete)"""
    session = get_db_session()
    try:
        produto = session.query(ProdutoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if produto:
            produto.ativo = False
            session.commit()
            flash('Produto removido com sucesso!', 'success')
        else:
            flash('Produto não encontrado', 'error')

        return redirect(url_for('tintas.listar_produtos'))
    finally:
        session.close()


@tintas_bp.route('/api/produtos/<int:id>', methods=['DELETE'])
@login_required
@empresa_required
def api_excluir_produto(id):
    """API: Excluir produto"""
    session = get_db_session()
    try:
        produto = session.query(ProdutoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if produto:
            produto.ativo = False
            session.commit()
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404
    finally:
        session.close()


# ============ CATEGORIAS ============

@tintas_bp.route('/categorias')
@login_required
@empresa_required
def listar_categorias():
    """Lista categorias de produtos"""
    session = get_db_session()
    try:
        categorias = session.query(CategoriaTinta).filter_by(
            empresa_id=current_user.empresa_id
        ).order_by(CategoriaTinta.nome).all()
        return render_template('tintas/categorias.html', categorias=categorias)
    finally:
        session.close()


@tintas_bp.route('/categorias/nova', methods=['POST'])
@login_required
@empresa_required
def nova_categoria():
    """Criar nova categoria"""
    session = get_db_session()
    try:
        categoria = CategoriaTinta(
            empresa_id=current_user.empresa_id,
            nome=request.form.get('nome'),
            descricao=request.form.get('descricao'),
            icone=request.form.get('icone', 'paint-bucket')
        )
        session.add(categoria)
        session.commit()
        flash('Categoria criada com sucesso!', 'success')
        return redirect(url_for('tintas.listar_categorias'))
    finally:
        session.close()


@tintas_bp.route('/categorias/<int:id>/editar', methods=['POST'])
@login_required
@empresa_required
def editar_categoria(id):
    """Editar categoria"""
    session = get_db_session()
    try:
        categoria = session.query(CategoriaTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if categoria:
            categoria.nome = request.form.get('nome')
            categoria.descricao = request.form.get('descricao')
            categoria.icone = request.form.get('icone')
            session.commit()
            flash('Categoria atualizada!', 'success')
        else:
            flash('Categoria não encontrada', 'error')

        return redirect(url_for('tintas.listar_categorias'))
    finally:
        session.close()


@tintas_bp.route('/categorias/<int:id>/excluir', methods=['POST'])
@login_required
@empresa_required
def excluir_categoria(id):
    """Excluir categoria"""
    session = get_db_session()
    try:
        categoria = session.query(CategoriaTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if categoria:
            categoria.ativo = False
            session.commit()
            flash('Categoria removida!', 'success')
        return redirect(url_for('tintas.listar_categorias'))
    finally:
        session.close()


# ============ PALETA DE CORES ============

@tintas_bp.route('/cores')
@login_required
@empresa_required
def paleta_cores():
    """Gerenciar paleta de cores"""
    session = get_db_session()
    try:
        cores = session.query(PaletaCores).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).order_by(PaletaCores.familia, PaletaCores.nome).all()
        return render_template('tintas/paleta_cores.html', cores=cores)
    finally:
        session.close()


@tintas_bp.route('/cores/nova', methods=['POST'])
@login_required
@empresa_required
def nova_cor():
    """Adicionar cor à paleta"""
    session = get_db_session()
    try:
        cor = PaletaCores(
            empresa_id=current_user.empresa_id,
            nome=request.form.get('nome'),
            codigo=request.form.get('codigo'),
            hex_color=request.form.get('hex_color'),
            rgb=request.form.get('rgb'),
            familia=request.form.get('familia'),
            tendencia=request.form.get('tendencia') == 'on',
            imagem_ambiente=request.form.get('imagem_ambiente')
        )
        session.add(cor)
        session.commit()

        if request.is_json:
            return jsonify({'success': True, 'cor_id': cor.id})

        flash('Cor adicionada com sucesso!', 'success')
        return redirect(url_for('tintas.paleta_cores'))
    finally:
        session.close()


@tintas_bp.route('/cores/<int:id>/editar', methods=['POST'])
@login_required
@empresa_required
def editar_cor(id):
    """Editar cor da paleta"""
    session = get_db_session()
    try:
        cor = session.query(PaletaCores).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if cor:
            cor.nome = request.form.get('nome')
            cor.codigo = request.form.get('codigo')
            cor.hex_color = request.form.get('hex_color')
            cor.rgb = request.form.get('rgb')
            cor.familia = request.form.get('familia')
            cor.tendencia = request.form.get('tendencia') == 'on'
            cor.imagem_ambiente = request.form.get('imagem_ambiente')
            session.commit()
            flash('Cor atualizada!', 'success')

        return redirect(url_for('tintas.paleta_cores'))
    finally:
        session.close()


@tintas_bp.route('/cores/<int:id>/excluir', methods=['POST'])
@login_required
@empresa_required
def excluir_cor(id):
    """Excluir cor da paleta"""
    session = get_db_session()
    try:
        cor = session.query(PaletaCores).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if cor:
            cor.ativo = False
            session.commit()
            flash('Cor removida!', 'success')

        return redirect(url_for('tintas.paleta_cores'))
    finally:
        session.close()


# ============ ORÇAMENTOS ============

@tintas_bp.route('/orcamentos')
@login_required
@empresa_required
def listar_orcamentos():
    """Lista orçamentos gerados"""
    session = get_db_session()
    try:
        orcamentos = session.query(OrcamentoTinta).filter_by(
            empresa_id=current_user.empresa_id
        ).order_by(OrcamentoTinta.created_at.desc()).limit(100).all()
        return render_template('tintas/orcamentos.html', orcamentos=orcamentos)
    finally:
        session.close()


@tintas_bp.route('/orcamentos/<int:id>')
@login_required
@empresa_required
def ver_orcamento(id):
    """Detalhes do orçamento"""
    session = get_db_session()
    try:
        orcamento = session.query(OrcamentoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if not orcamento:
            flash('Orçamento não encontrado', 'error')
            return redirect(url_for('tintas.listar_orcamentos'))

        return render_template('tintas/orcamento_detalhe.html', orcamento=orcamento)
    finally:
        session.close()


@tintas_bp.route('/orcamentos/<int:id>/status', methods=['POST'])
@login_required
@empresa_required
def atualizar_status_orcamento(id):
    """Atualizar status do orçamento"""
    session = get_db_session()
    try:
        orcamento = session.query(OrcamentoTinta).filter_by(
            id=id,
            empresa_id=current_user.empresa_id
        ).first()

        if orcamento:
            orcamento.status = request.form.get('status')
            orcamento.updated_at = datetime.utcnow()
            session.commit()
            flash('Status atualizado!', 'success')

        return redirect(url_for('tintas.ver_orcamento', id=id))
    finally:
        session.close()


# ============ CONFIGURAÇÕES ============

@tintas_bp.route('/configuracoes', methods=['GET', 'POST'])
@login_required
@empresa_required
def configuracoes():
    """Configurações do bot de tintas"""
    session = get_db_session()
    try:
        config = session.query(ConfiguracaoBotTintas).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        if not config:
            config = ConfiguracaoBotTintas(empresa_id=current_user.empresa_id)
            session.add(config)
            session.commit()

        if request.method == 'POST':
            config.nome_atendente = request.form.get('nome_atendente', 'Laura')
            config.tom_conversa = request.form.get('tom_conversa', 'amigavel_profissional')

            margem = request.form.get('margem_seguranca', '10')
            config.margem_seguranca_tinta = 1 + (float(margem) / 100)

            config.desconto_maximo = float(request.form.get('desconto_maximo', 15))
            config.frete_gratis_acima = float(request.form.get('frete_gratis_acima', 500))

            config.calculadora_rendimento = request.form.get('calculadora_rendimento') == 'on'
            config.sugestao_cores = request.form.get('sugestao_cores') == 'on'
            config.orcamento_automatico = request.form.get('orcamento_automatico') == 'on'
            config.enviar_ficha_tecnica = request.form.get('enviar_ficha_tecnica') == 'on'

            config.prazo_entrega_padrao = request.form.get('prazo_entrega', '1-2 dias úteis')
            config.msg_boas_vindas = request.form.get('msg_boas_vindas')
            config.msg_orcamento = request.form.get('msg_orcamento')
            config.msg_cores_tendencia = request.form.get('msg_cores_tendencia')

            # Horário de atendimento
            horario = {}
            if request.form.get('horario_seg_sex'):
                horario['seg-sex'] = request.form.get('horario_seg_sex')
            if request.form.get('horario_sab'):
                horario['sab'] = request.form.get('horario_sab')
            if request.form.get('horario_dom'):
                horario['dom'] = request.form.get('horario_dom')
            config.horario_atendimento = horario

            config.updated_at = datetime.utcnow()
            session.commit()
            flash('Configurações salvas com sucesso!', 'success')

        return render_template('tintas/configuracoes.html', config=config)
    finally:
        session.close()


# ============ CALCULADORA (API) ============

@tintas_bp.route('/api/calcular-rendimento', methods=['POST'])
@login_required
def calcular_rendimento():
    """API: Calcula quantidade de tinta necessária"""
    data = request.get_json()

    area_m2 = float(data.get('area_m2', 0))
    altura = float(data.get('altura', 2.8))
    rendimento = float(data.get('rendimento_m2_litro', 10))
    demaos = int(data.get('demaos', 2))
    margem = float(data.get('margem', 1.1))
    tipo_pintura = data.get('tipo_pintura', 'paredes')

    # Calcular área de pintura
    if tipo_pintura == 'paredes':
        # Considera perímetro x altura - 10% para aberturas
        area_pintura = area_m2 * altura * 0.9
    else:
        area_pintura = area_m2

    # Cálculo: (área × demãos × margem) / rendimento
    litros = (area_pintura * demaos * margem) / rendimento

    # Sugestão de latas
    latas = calcular_latas(litros)

    return jsonify({
        'area_m2': area_m2,
        'area_pintura': round(area_pintura, 2),
        'litros_necessarios': round(litros, 2),
        'latas_sugeridas': latas,
        'demaos': demaos
    })


def calcular_latas(litros):
    """Calcula quantidade de latas necessárias"""
    latas = {'18L': 0, '3.6L': 0, '0.9L': 0}
    restante = litros

    if restante >= 18:
        latas['18L'] = int(restante // 18)
        restante = restante % 18

    if restante >= 3.6:
        latas['3.6L'] = int(restante // 3.6)
        restante = restante % 3.6

    if restante > 0:
        latas['0.9L'] = int(restante // 0.9) + 1

    return latas


@tintas_bp.route('/api/sugerir-cores', methods=['POST'])
@login_required
def sugerir_cores():
    """API: Sugere combinações de cores"""
    session = get_db_session()
    try:
        data = request.get_json()
        ambiente = data.get('ambiente', 'sala')
        familia = data.get('familia')

        query = session.query(PaletaCores).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        )

        if familia:
            query = query.filter_by(familia=familia)

        # Priorizar cores tendência
        cores = query.order_by(PaletaCores.tendencia.desc()).limit(6).all()

        return jsonify({
            'sugestoes': [cor.to_dict() for cor in cores]
        })
    finally:
        session.close()


# ============ DASHBOARD TINTAS ============

@tintas_bp.route('/')
@login_required
@empresa_required
def dashboard_tintas():
    """Dashboard do módulo de tintas"""
    session = get_db_session()
    try:
        # Estatísticas
        total_produtos = session.query(ProdutoTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).count()

        total_cores = session.query(PaletaCores).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).count()

        total_orcamentos = session.query(OrcamentoTinta).filter_by(
            empresa_id=current_user.empresa_id
        ).count()

        orcamentos_pendentes = session.query(OrcamentoTinta).filter_by(
            empresa_id=current_user.empresa_id,
            status='pendente'
        ).count()

        # Últimos orçamentos
        ultimos_orcamentos = session.query(OrcamentoTinta).filter_by(
            empresa_id=current_user.empresa_id
        ).order_by(OrcamentoTinta.created_at.desc()).limit(5).all()

        # Produtos em destaque
        produtos_destaque = session.query(ProdutoTinta).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True,
            destaque=True
        ).limit(4).all()

        return render_template('tintas/dashboard.html',
                               total_produtos=total_produtos,
                               total_cores=total_cores,
                               total_orcamentos=total_orcamentos,
                               orcamentos_pendentes=orcamentos_pendentes,
                               ultimos_orcamentos=ultimos_orcamentos,
                               produtos_destaque=produtos_destaque)
    finally:
        session.close()
