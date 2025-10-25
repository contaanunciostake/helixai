"""
API REST para Gestão de Produtos - CRM Cliente
Endpoints JSON para importação CSV, listagem e edição de produtos
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import current_user
from werkzeug.utils import secure_filename
from sqlalchemy.orm import sessionmaker
from database.models import (
    Produto, ArquivoImportacao, Veiculo, Empresa,
    DatabaseManager, NichoEmpresa
)
import csv
import os
import json
from datetime import datetime
from pathlib import Path
import io

produtos_api_bp = Blueprint('produtos_api', __name__, url_prefix='/api/produtos')

# ==================== DEBUG ====================
print('\n============================================================')
print('         PRODUTOS API ROUTES - MODULO CARREGADO')
print('============================================================')
print('[PRODUTOS API] Rotas disponíveis:')
print('[PRODUTOS API]   GET  /api/produtos?empresa_id=X')
print('[PRODUTOS API]   GET  /api/produtos/stats?empresa_id=X')
print('[PRODUTOS API]   PUT  /api/produtos/:id')
print('[PRODUTOS API]   DELETE /api/produtos/:id')
print('[PRODUTOS API]   POST /api/produtos/import-csv')
print('[PRODUTOS API]   GET  /api/produtos/template-csv')
print('============================================================\n')

# Configuração de upload
UPLOAD_FOLDER = Path(__file__).parent.parent.parent / 'uploads' / 'produtos'
ALLOWED_EXTENSIONS = {'csv', 'txt'}

# Garantir que pasta existe
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


def allowed_file(filename):
    """Verifica se extensão do arquivo é permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_current_empresa_id():
    """Obter ID da empresa do usuário atual"""
    if hasattr(current_user, 'empresa_id') and current_user.empresa_id:
        return current_user.empresa_id

    # Se não tiver current_user (API externa), pegar de header ou param
    empresa_id = request.headers.get('X-Empresa-ID') or request.args.get('empresa_id')
    if empresa_id:
        return int(empresa_id)

    return None


# ══════════════════════════════════════════════════════════════
# ENDPOINTS DE LISTAGEM E ESTATÍSTICAS
# ══════════════════════════════════════════════════════════════

@produtos_api_bp.route('/', methods=['GET'])
def listar_produtos():
    """
    GET /api/produtos?empresa_id=X&page=1&limit=20&search=termo
    Lista produtos da empresa com paginação e busca
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            # Parâmetros de paginação e busca
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))
            search = request.args.get('search', '').strip()
            categoria = request.args.get('categoria', '').strip()
            disponivel = request.args.get('disponivel')  # 'true' ou 'false'

            # Verificar nicho da empresa
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            # Se for veículos, usar tabela veiculos
            if nicho == 'veiculos':
                query = session.query(Veiculo).filter_by(empresa_id=empresa_id)

                if search:
                    query = query.filter(
                        (Veiculo.marca.like(f'%{search}%')) |
                        (Veiculo.modelo.like(f'%{search}%')) |
                        (Veiculo.versao.like(f'%{search}%'))
                    )

                if disponivel is not None:
                    disp_bool = disponivel.lower() == 'true'
                    query = query.filter_by(disponivel=disp_bool)

                total = query.count()
                veiculos = query.order_by(Veiculo.criado_em.desc()).offset((page - 1) * limit).limit(limit).all()

                produtos_list = []
                for v in veiculos:
                    produtos_list.append({
                        'id': v.id,
                        'tipo': 'veiculo',
                        'nome': f"{v.marca} {v.modelo} {v.versao}",
                        'marca': v.marca,
                        'modelo': v.modelo,
                        'versao': v.versao,
                        'ano': v.ano_modelo,
                        'preco': float(v.preco) if v.preco else None,
                        'preco_anterior': float(v.preco_anterior) if v.preco_anterior else None,
                        'disponivel': v.disponivel,
                        'destaque': v.destaque,
                        'imagem_url': v.imagem_principal,
                        'quilometragem': v.quilometragem,
                        'cor': v.cor,
                        'combustivel': v.combustivel,
                        'cambio': v.cambio,
                        'motor': v.motor,
                        'descricao': v.descricao,
                        'criado_em': v.criado_em.isoformat() if v.criado_em else None
                    })

            else:
                # Produtos genéricos
                query = session.query(Produto).filter_by(
                    empresa_id=empresa_id,
                    ativo=True
                )

                if search:
                    query = query.filter(
                        (Produto.nome.like(f'%{search}%')) |
                        (Produto.descricao.like(f'%{search}%')) |
                        (Produto.marca.like(f'%{search}%'))
                    )

                if categoria:
                    query = query.filter_by(categoria=categoria)

                if disponivel is not None:
                    disp_bool = disponivel.lower() == 'true'
                    query = query.filter_by(disponivel=disp_bool)

                total = query.count()
                produtos = query.order_by(Produto.criado_em.desc()).offset((page - 1) * limit).limit(limit).all()

                produtos_list = []
                for p in produtos:
                    produtos_list.append({
                        'id': p.id,
                        'tipo': 'produto',
                        'nome': p.nome,
                        'descricao': p.descricao,
                        'categoria': p.categoria,
                        'preco': float(p.preco) if p.preco else None,
                        'preco_promocional': float(p.preco_promocional) if p.preco_promocional else None,
                        'estoque': p.estoque,
                        'disponivel': p.disponivel,
                        'marca': p.marca,
                        'imagem_url': p.imagem_url,
                        'link': p.link,
                        'sku': p.sku,
                        'criado_em': p.criado_em.isoformat() if p.criado_em else None
                    })

            return jsonify({
                'success': True,
                'data': {
                    'produtos': produtos_list,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'pages': (total + limit - 1) // limit
                    },
                    'nicho': nicho
                }
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@produtos_api_bp.route('/stats', methods=['GET'])
def estatisticas_produtos():
    """
    GET /api/produtos/stats?empresa_id=X
    Retorna estatísticas dos produtos
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            if nicho == 'veiculos':
                total = session.query(Veiculo).filter_by(empresa_id=empresa_id).count()
                disponiveis = session.query(Veiculo).filter_by(empresa_id=empresa_id, disponivel=True).count()
                destaques = session.query(Veiculo).filter_by(empresa_id=empresa_id, destaque=True).count()

                veiculos = session.query(Veiculo).filter_by(empresa_id=empresa_id, disponivel=True).all()
                valor_total = sum([v.preco for v in veiculos if v.preco]) if veiculos else 0

                stats = {
                    'total_produtos': total,
                    'disponiveis': disponiveis,
                    'destaques': destaques,
                    'valor_total_estoque': float(valor_total),
                    'tipo': 'veiculos'
                }
            else:
                total = session.query(Produto).filter_by(empresa_id=empresa_id, ativo=True).count()
                disponiveis = session.query(Produto).filter_by(empresa_id=empresa_id, ativo=True, disponivel=True).count()

                produtos = session.query(Produto).filter_by(empresa_id=empresa_id, ativo=True).all()
                valor_estoque = sum([p.preco * p.estoque for p in produtos if p.preco and p.estoque]) if produtos else 0

                stats = {
                    'total_produtos': total,
                    'disponiveis': disponiveis,
                    'valor_estoque': float(valor_estoque),
                    'tipo': 'produtos'
                }

            return jsonify({
                'success': True,
                'data': stats
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ENDPOINTS DE CRUD INDIVIDUAL
# ══════════════════════════════════════════════════════════════

@produtos_api_bp.route('/<int:produto_id>', methods=['GET'])
def obter_produto(produto_id):
    """
    GET /api/produtos/:id?empresa_id=X
    Obter detalhes de um produto específico
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            if nicho == 'veiculos':
                veiculo = session.query(Veiculo).filter_by(id=produto_id, empresa_id=empresa_id).first()

                if not veiculo:
                    return jsonify({'success': False, 'error': 'Veículo não encontrado'}), 404

                return jsonify({
                    'success': True,
                    'data': {
                        'id': veiculo.id,
                        'tipo': 'veiculo',
                        'marca': veiculo.marca,
                        'modelo': veiculo.modelo,
                        'versao': veiculo.versao,
                        'ano_modelo': veiculo.ano_modelo,
                        'ano_fabricacao': veiculo.ano_fabricacao,
                        'preco': float(veiculo.preco) if veiculo.preco else None,
                        'preco_anterior': float(veiculo.preco_anterior) if veiculo.preco_anterior else None,
                        'quilometragem': veiculo.quilometragem,
                        'cor': veiculo.cor,
                        'combustivel': veiculo.combustivel,
                        'cambio': veiculo.cambio,
                        'motor': veiculo.motor,
                        'portas': veiculo.portas,
                        'opcionais': json.loads(veiculo.opcionais) if veiculo.opcionais and isinstance(veiculo.opcionais, str) else veiculo.opcionais,
                        'imagem_principal': veiculo.imagem_principal,
                        'imagens_galeria': json.loads(veiculo.imagens_galeria) if veiculo.imagens_galeria and isinstance(veiculo.imagens_galeria, str) else veiculo.imagens_galeria,
                        'descricao': veiculo.descricao,
                        'observacoes': veiculo.observacoes,
                        'disponivel': veiculo.disponivel,
                        'destaque': veiculo.destaque,
                        'aceita_troca': veiculo.aceita_troca,
                        'financiamento_disponivel': veiculo.financiamento_disponivel
                    }
                })
            else:
                produto = session.query(Produto).filter_by(id=produto_id, empresa_id=empresa_id, ativo=True).first()

                if not produto:
                    return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

                return jsonify({
                    'success': True,
                    'data': {
                        'id': produto.id,
                        'tipo': 'produto',
                        'nome': produto.nome,
                        'descricao': produto.descricao,
                        'categoria': produto.categoria,
                        'preco': float(produto.preco) if produto.preco else None,
                        'preco_promocional': float(produto.preco_promocional) if produto.preco_promocional else None,
                        'estoque': produto.estoque,
                        'disponivel': produto.disponivel,
                        'marca': produto.marca,
                        'sku': produto.sku,
                        'imagem_url': produto.imagem_url,
                        'link': produto.link,
                        'tags': json.loads(produto.tags) if produto.tags and isinstance(produto.tags, str) else produto.tags
                    }
                })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@produtos_api_bp.route('/<int:produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    """
    PUT /api/produtos/:id
    Atualizar produto existente
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        data = request.get_json()

        db = DatabaseManager()
        session = db.get_session()

        try:
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            if nicho == 'veiculos':
                veiculo = session.query(Veiculo).filter_by(id=produto_id, empresa_id=empresa_id).first()

                if not veiculo:
                    return jsonify({'success': False, 'error': 'Veículo não encontrado'}), 404

                # Atualizar campos
                if 'marca' in data: veiculo.marca = data['marca']
                if 'modelo' in data: veiculo.modelo = data['modelo']
                if 'versao' in data: veiculo.versao = data['versao']
                if 'ano_modelo' in data: veiculo.ano_modelo = data['ano_modelo']
                if 'ano_fabricacao' in data: veiculo.ano_fabricacao = data['ano_fabricacao']
                if 'preco' in data: veiculo.preco = float(data['preco'])
                if 'preco_anterior' in data: veiculo.preco_anterior = float(data['preco_anterior']) if data['preco_anterior'] else None
                if 'quilometragem' in data: veiculo.quilometragem = data['quilometragem']
                if 'cor' in data: veiculo.cor = data['cor']
                if 'combustivel' in data: veiculo.combustivel = data['combustivel']
                if 'cambio' in data: veiculo.cambio = data['cambio']
                if 'motor' in data: veiculo.motor = data['motor']
                if 'portas' in data: veiculo.portas = int(data['portas'])
                if 'opcionais' in data: veiculo.opcionais = json.dumps(data['opcionais']) if isinstance(data['opcionais'], list) else data['opcionais']
                if 'descricao' in data: veiculo.descricao = data['descricao']
                if 'observacoes' in data: veiculo.observacoes = data['observacoes']
                if 'disponivel' in data: veiculo.disponivel = data['disponivel']
                if 'destaque' in data: veiculo.destaque = data['destaque']
                if 'imagem_principal' in data: veiculo.imagem_principal = data['imagem_principal']

                veiculo.atualizado_em = datetime.utcnow()

            else:
                produto = session.query(Produto).filter_by(id=produto_id, empresa_id=empresa_id, ativo=True).first()

                if not produto:
                    return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

                # Atualizar campos
                if 'nome' in data: produto.nome = data['nome']
                if 'descricao' in data: produto.descricao = data['descricao']
                if 'categoria' in data: produto.categoria = data['categoria']
                if 'preco' in data: produto.preco = float(data['preco'])
                if 'preco_promocional' in data: produto.preco_promocional = float(data['preco_promocional']) if data['preco_promocional'] else None
                if 'estoque' in data: produto.estoque = int(data['estoque'])
                if 'disponivel' in data: produto.disponivel = data['disponivel']
                if 'marca' in data: produto.marca = data['marca']
                if 'sku' in data: produto.sku = data['sku']
                if 'imagem_url' in data: produto.imagem_url = data['imagem_url']
                if 'link' in data: produto.link = data['link']

                produto.atualizado_em = datetime.utcnow()

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Produto atualizado com sucesso'
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@produtos_api_bp.route('/<int:produto_id>', methods=['DELETE'])
def deletar_produto(produto_id):
    """
    DELETE /api/produtos/:id
    Deletar produto (soft delete)
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            if nicho == 'veiculos':
                veiculo = session.query(Veiculo).filter_by(id=produto_id, empresa_id=empresa_id).first()

                if not veiculo:
                    return jsonify({'success': False, 'error': 'Veículo não encontrado'}), 404

                veiculo.disponivel = False
                veiculo.vendido = True
                veiculo.data_venda = datetime.utcnow()

            else:
                produto = session.query(Produto).filter_by(id=produto_id, empresa_id=empresa_id, ativo=True).first()

                if not produto:
                    return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

                produto.ativo = False
                produto.disponivel = False

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Produto removido com sucesso'
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# IMPORTAÇÃO CSV
# ══════════════════════════════════════════════════════════════

@produtos_api_bp.route('/import-csv', methods=['POST'])
def importar_csv():
    """
    POST /api/produtos/import-csv
    Importar produtos via CSV
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        if 'arquivo' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['arquivo']

        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400

        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Tipo de arquivo não permitido. Use CSV'}), 400

        # Salvar arquivo
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename_completo = f"{timestamp}_{empresa_id}_{filename}"
        filepath = UPLOAD_FOLDER / filename_completo

        file.save(str(filepath))

        # Processar CSV
        db = DatabaseManager()
        session = db.get_session()

        try:
            empresa = session.query(Empresa).get(empresa_id)
            nicho = empresa.nicho if empresa else None

            # Criar registro de importação
            arquivo_import = ArquivoImportacao(
                empresa_id=empresa_id,
                nome_arquivo=filename,
                tipo='produtos',
                caminho=str(filepath),
                status='processando'
            )
            session.add(arquivo_import)
            session.commit()

            # Processar linhas do CSV
            importados_sucesso = 0
            importados_erro = 0
            erros_detalhes = []

            with open(filepath, 'r', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile)
                total_linhas = 0

                for row in reader:
                    total_linhas += 1

                    try:
                        if nicho == 'veiculos':
                            # Importar como veículo
                            veiculo = Veiculo(
                                empresa_id=empresa_id,
                                marca=row.get('marca', ''),
                                modelo=row.get('modelo', ''),
                                versao=row.get('versao', ''),
                                ano_modelo=row.get('ano_modelo', row.get('ano', '')),
                                ano_fabricacao=row.get('ano_fabricacao', row.get('ano', '')),
                                preco=float(row.get('preco', 0)),
                                preco_anterior=float(row.get('preco_anterior', 0)) if row.get('preco_anterior') else None,
                                quilometragem=row.get('quilometragem', row.get('km', '')),
                                cor=row.get('cor', ''),
                                combustivel=row.get('combustivel', ''),
                                cambio=row.get('cambio', ''),
                                motor=row.get('motor', ''),
                                portas=int(row.get('portas', 4)),
                                descricao=row.get('descricao', ''),
                                imagem_principal=row.get('imagem', row.get('imagem_principal', '')),
                                disponivel=True,
                                destaque=row.get('destaque', '').lower() in ['sim', 'true', '1']
                            )
                            session.add(veiculo)

                        else:
                            # Importar como produto genérico
                            produto = Produto(
                                empresa_id=empresa_id,
                                nome=row.get('nome', ''),
                                descricao=row.get('descricao', ''),
                                categoria=row.get('categoria', ''),
                                preco=float(row.get('preco', 0)),
                                preco_promocional=float(row.get('preco_promocional', 0)) if row.get('preco_promocional') else None,
                                estoque=int(row.get('estoque', 0)),
                                marca=row.get('marca', ''),
                                sku=row.get('sku', ''),
                                imagem_url=row.get('imagem', row.get('imagem_url', '')),
                                link=row.get('link', ''),
                                disponivel=True,
                                ativo=True,
                                importado_csv=True
                            )
                            session.add(produto)

                        importados_sucesso += 1

                    except Exception as e:
                        importados_erro += 1
                        erros_detalhes.append({
                            'linha': total_linhas,
                            'erro': str(e)
                        })

                # Atualizar registro de importação
                arquivo_import.total_linhas = total_linhas
                arquivo_import.importados_sucesso = importados_sucesso
                arquivo_import.importados_erro = importados_erro
                arquivo_import.erros_detalhes = json.dumps(erros_detalhes) if erros_detalhes else None
                arquivo_import.status = 'concluido' if importados_erro == 0 else 'concluido_com_erros'

                session.commit()

            return jsonify({
                'success': True,
                'message': f'Importação concluída! {importados_sucesso} produtos importados.',
                'data': {
                    'total_linhas': total_linhas,
                    'importados_sucesso': importados_sucesso,
                    'importados_erro': importados_erro,
                    'erros': erros_detalhes[:10]  # Primeiros 10 erros
                }
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@produtos_api_bp.route('/template-csv', methods=['GET'])
def obter_template_csv():
    """
    GET /api/produtos/template-csv?nicho=veiculos
    Retornar template CSV baseado no nicho
    """
    try:
        nicho = request.args.get('nicho', 'produtos')

        if nicho == 'veiculos':
            template = "marca,modelo,versao,ano_modelo,preco,quilometragem,cor,combustivel,cambio,motor,portas,descricao,imagem,destaque\n"
            template += "Volkswagen,Gol,1.0 Flex,2023,45000,25000,Branco,Flex,Manual,1.0,4,Completo único dono,https://exemplo.com/img.jpg,sim\n"
            template += "Fiat,Argo,Drive 1.0,2024,62000,0,Vermelho,Flex,Automático,1.0,4,Zero km,https://exemplo.com/img2.jpg,sim"
        else:
            template = "nome,descricao,categoria,preco,preco_promocional,estoque,marca,sku,imagem,link\n"
            template += "Produto Exemplo,Descrição do produto,Categoria 1,100.00,89.90,50,Marca X,SKU123,https://exemplo.com/img.jpg,https://loja.com/produto\n"
            template += "Outro Produto,Outra descrição,Categoria 2,200.00,,30,Marca Y,SKU456,https://exemplo.com/img2.jpg,https://loja.com/produto2"

        return template, 200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': f'attachment; filename=template_{nicho}.csv'
        }

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@produtos_api_bp.route('/importacoes', methods=['GET'])
def listar_importacoes():
    """
    GET /api/produtos/importacoes?empresa_id=X
    Listar histórico de importações
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            importacoes = session.query(ArquivoImportacao).filter_by(
                empresa_id=empresa_id,
                tipo='produtos'
            ).order_by(ArquivoImportacao.criado_em.desc()).limit(10).all()

            importacoes_list = []
            for imp in importacoes:
                importacoes_list.append({
                    'id': imp.id,
                    'nome_arquivo': imp.nome_arquivo,
                    'total_linhas': imp.total_linhas,
                    'importados_sucesso': imp.importados_sucesso,
                    'importados_erro': imp.importados_erro,
                    'status': imp.status,
                    'criado_em': imp.criado_em.isoformat() if imp.criado_em else None
                })

            return jsonify({
                'success': True,
                'data': importacoes_list
            })

        finally:
            session.close()

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

