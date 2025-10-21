"""
Rotas para Gestão de Produtos e Configuração Avançada - VendeAI
Permite ao usuário fazer upload de CSV, gerenciar produtos e configurar bot via IA
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from sqlalchemy.orm import sessionmaker
from database.models import (
    Produto, ArquivoImportacao, ConfiguracaoBot, Empresa,
    DatabaseManager
)
from backend.ia_configurador import IAConfigurador
import csv
import os
import json
from datetime import datetime
from pathlib import Path

produtos_bp = Blueprint('produtos', __name__, url_prefix='/produtos')


# Configuração de upload
UPLOAD_FOLDER = Path(__file__).parent.parent.parent / 'uploads' / 'produtos'
ALLOWED_EXTENSIONS = {'csv', 'txt'}

# Garantir que pasta existe
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


def allowed_file(filename):
    """Verifica se extensão do arquivo é permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@produtos_bp.route('/')
@login_required
def index():
    """Página principal de gestão de produtos"""
    db = DatabaseManager()
    session = db.get_session()

    try:
        # Buscar produtos da empresa do usuário
        produtos = session.query(Produto).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).order_by(Produto.criado_em.desc()).all()

        # Estatísticas
        total_produtos = len(produtos)
        produtos_disponiveis = len([p for p in produtos if p.disponivel])
        valor_estoque = sum([p.preco * p.estoque for p in produtos if p.preco and p.estoque])

        # Buscar histórico de importações
        importacoes = session.query(ArquivoImportacao).filter_by(
            empresa_id=current_user.empresa_id,
            tipo='produtos'
        ).order_by(ArquivoImportacao.criado_em.desc()).limit(5).all()

        return render_template(
            'produtos/index.html',
            produtos=produtos,
            total_produtos=total_produtos,
            produtos_disponiveis=produtos_disponiveis,
            valor_estoque=valor_estoque,
            importacoes=importacoes
        )

    except Exception as e:
        flash(f'Erro ao carregar produtos: {str(e)}', 'danger')
        return render_template(
            'produtos/index.html',
            produtos=[],
            total_produtos=0,
            produtos_disponiveis=0,
            valor_estoque=0.0,
            importacoes=[]
        )
    finally:
        session.close()


@produtos_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """Upload de CSV de produtos"""
    if request.method == 'GET':
        return render_template('produtos/upload.html')

    # POST - Processar upload
    if 'arquivo' not in request.files:
        return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400

    file = request.files['arquivo']

    if file.filename == '':
        return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Formato de arquivo inválido. Use CSV'}), 400

    try:
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename_final = f"{current_user.empresa_id}_{timestamp}_{filename}"
        filepath = UPLOAD_FOLDER / filename_final

        # Salvar arquivo
        file.save(str(filepath))

        # Processar CSV
        resultado = processar_csv_produtos(filepath, current_user.empresa_id, current_user.id)

        if resultado['success']:
            flash(f"Produtos importados com sucesso! {resultado['importados']} de {resultado['total']} linhas.", 'success')
            return jsonify(resultado)
        else:
            flash(f"Erro ao importar produtos: {resultado['error']}", 'danger')
            return jsonify(resultado), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


def processar_csv_produtos(filepath, empresa_id, usuario_id):
    """
    Processa arquivo CSV e importa produtos para o banco

    Formato esperado do CSV:
    nome,descricao,categoria,preco,preco_promocional,estoque,sku,marca,disponivel,palavras_chave,link,imagem_url
    """
    db = DatabaseManager()
    session = db.get_session()

    erros = []
    importados = 0
    total_linhas = 0

    try:
        # Criar registro de importação
        importacao = ArquivoImportacao(
            empresa_id=empresa_id,
            nome_arquivo=os.path.basename(str(filepath)),
            tipo='produtos',
            caminho=str(filepath),
            importado_por_id=usuario_id,
            status='processando'
        )
        session.add(importacao)
        session.commit()

        # Ler CSV
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)

            for linha_num, row in enumerate(reader, start=2):  # Start at 2 (header = 1)
                total_linhas += 1

                try:
                    # Validar campos obrigatórios
                    if not row.get('nome'):
                        erros.append(f"Linha {linha_num}: Nome é obrigatório")
                        continue

                    # Converter tipos
                    preco = float(row.get('preco', 0)) if row.get('preco') else None
                    preco_promo = float(row.get('preco_promocional', 0)) if row.get('preco_promocional') else None
                    estoque = int(row.get('estoque', 0)) if row.get('estoque') else 0
                    disponivel = row.get('disponivel', 'true').lower() in ['true', '1', 'sim', 's', 'yes']

                    # Processar palavras-chave (pode vir como string separada por vírgula ou JSON)
                    palavras_chave_str = row.get('palavras_chave', '')
                    if palavras_chave_str:
                        try:
                            # Tentar como JSON primeiro
                            palavras_chave = json.loads(palavras_chave_str)
                        except:
                            # Se falhar, separar por vírgula
                            palavras_chave = [p.strip() for p in palavras_chave_str.split(',')]
                        palavras_chave_json = json.dumps(palavras_chave)
                    else:
                        palavras_chave_json = None

                    # Criar produto
                    produto = Produto(
                        empresa_id=empresa_id,
                        nome=row.get('nome', '').strip(),
                        descricao=row.get('descricao', '').strip() or None,
                        categoria=row.get('categoria', '').strip() or None,
                        subcategoria=row.get('subcategoria', '').strip() or None,
                        preco=preco,
                        preco_promocional=preco_promo,
                        estoque=estoque,
                        disponivel=disponivel,
                        sku=row.get('sku', '').strip() or None,
                        codigo_barras=row.get('codigo_barras', '').strip() or None,
                        marca=row.get('marca', '').strip() or None,
                        palavras_chave=palavras_chave_json,
                        link=row.get('link', '').strip() or None,
                        imagem_url=row.get('imagem_url', '').strip() or None,
                        importado_csv=True,
                        ativo=True
                    )

                    session.add(produto)
                    importados += 1

                except Exception as e:
                    erros.append(f"Linha {linha_num}: {str(e)}")
                    continue

        # Atualizar registro de importação
        importacao.total_linhas = total_linhas
        importacao.importados_sucesso = importados
        importacao.importados_erro = len(erros)
        importacao.erros_detalhes = json.dumps(erros) if erros else None
        importacao.status = 'concluido' if importados > 0 else 'erro'

        session.commit()

        return {
            'success': True,
            'total': total_linhas,
            'importados': importados,
            'erros': len(erros),
            'detalhes_erros': erros[:10]  # Primeiros 10 erros
        }

    except Exception as e:
        session.rollback()
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        session.close()


@produtos_bp.route('/template-csv')
@login_required
def template_csv():
    """Download de template CSV de exemplo"""
    # Criar CSV de exemplo
    output = "nome,descricao,categoria,preco,preco_promocional,estoque,sku,marca,disponivel,palavras_chave,link,imagem_url\n"
    output += "Camiseta Básica Preta,Camiseta 100% algodão cor preta,Roupas,59.90,49.90,100,CAM-001,Marca X,true,\"camiseta,básica,preta\",https://loja.com/cam-001,https://loja.com/img/cam-001.jpg\n"
    output += "Calça Jeans Slim,Calça jeans slim fit azul escuro,Roupas,129.90,,50,CAL-002,Marca Y,true,\"calça,jeans,slim\",https://loja.com/cal-002,https://loja.com/img/cal-002.jpg\n"
    output += "Tênis Esportivo,Tênis para corrida e caminhada,Calçados,199.90,179.90,30,TEN-003,Marca Z,true,\"tênis,esporte,corrida\",https://loja.com/ten-003,https://loja.com/img/ten-003.jpg\n"

    from flask import Response
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=template_produtos_vendeai.csv"}
    )


@produtos_bp.route('/api/listar')
@login_required
def api_listar():
    """API para listar produtos (JSON)"""
    db = DatabaseManager()
    session = db.get_session()

    try:
        produtos = session.query(Produto).filter_by(
            empresa_id=current_user.empresa_id
        ).all()

        resultado = []
        for p in produtos:
            resultado.append({
                'id': p.id,
                'nome': p.nome,
                'descricao': p.descricao,
                'categoria': p.categoria,
                'preco': p.preco,
                'preco_promocional': p.preco_promocional,
                'estoque': p.estoque,
                'disponivel': p.disponivel,
                'sku': p.sku,
                'marca': p.marca,
                'link': p.link,
                'imagem_url': p.imagem_url
            })

        return jsonify({'success': True, 'produtos': resultado})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@produtos_bp.route('/api/delete/<int:produto_id>', methods=['POST'])
@login_required
def api_delete(produto_id):
    """API para deletar produto"""
    db = DatabaseManager()
    session = db.get_session()

    try:
        produto = session.query(Produto).filter_by(
            id=produto_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not produto:
            return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

        # Soft delete
        produto.ativo = False
        session.commit()

        return jsonify({'success': True, 'message': 'Produto removido com sucesso'})

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@produtos_bp.route('/config-avancada', methods=['GET', 'POST'])
@login_required
def config_avancada():
    """Página de configuração avançada do bot com IA"""
    db = DatabaseManager()
    session = db.get_session()

    try:
        # Buscar configuração atual
        config = session.query(ConfiguracaoBot).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        # Buscar produtos da empresa
        produtos = session.query(Produto).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True
        ).all()

        if request.method == 'GET':
            return render_template(
                'produtos/config_avancada.html',
                config=config,
                total_produtos=len(produtos)
            )

        # POST - Salvar configuração
        data = request.json

        if not config:
            config = ConfiguracaoBot(empresa_id=current_user.empresa_id)
            session.add(config)

        # Atualizar campos
        config.descricao_empresa = data.get('descricao_empresa')
        config.produtos_servicos = data.get('produtos_servicos')
        config.publico_alvo = data.get('publico_alvo')
        config.diferenciais = data.get('diferenciais')
        config.horario_atendimento = data.get('horario_atendimento')
        config.prompt_sistema = data.get('prompt_sistema')
        config.tom_conversa = data.get('tom_conversa')
        config.mensagem_boas_vindas = data.get('mensagem_boas_vindas')
        config.mensagem_ausencia = data.get('mensagem_ausencia')
        config.mensagem_encerramento = data.get('mensagem_encerramento')
        config.palavras_chave_interesse = data.get('palavras_chave_interesse')

        session.commit()

        return jsonify({'success': True, 'message': 'Configuração salva com sucesso'})

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@produtos_bp.route('/api/gerar-config-ia', methods=['POST'])
@login_required
def api_gerar_config_ia():
    """
    API para gerar configuração do bot usando IA (GPT-4)
    """
    data = request.json

    # Validar campos obrigatórios
    if not data.get('descricao_empresa'):
        return jsonify({'success': False, 'error': 'Descrição da empresa é obrigatória'}), 400

    db = DatabaseManager()
    session = db.get_session()

    try:
        # Buscar configuração para pegar API key
        config = session.query(ConfiguracaoBot).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        api_key = config.openai_api_key if config else None

        # Se não tiver API key configurada, usar do .env
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')

        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API Key do OpenAI não configurada. Configure em Configurações > Integrações'
            }), 400

        # Buscar produtos da empresa
        produtos = session.query(Produto).filter_by(
            empresa_id=current_user.empresa_id,
            ativo=True,
            disponivel=True
        ).all()

        # Converter produtos para dicionários
        produtos_lista = []
        for p in produtos:
            produtos_lista.append({
                'nome': p.nome,
                'descricao': p.descricao,
                'preco': p.preco,
                'categoria': p.categoria
            })

        # Inicializar configurador de IA
        configurador = IAConfigurador(api_key)

        # Gerar configuração
        resultado = configurador.gerar_configuracao_completa(
            descricao_empresa=data.get('descricao_empresa'),
            produtos_servicos=data.get('produtos_servicos', ''),
            publico_alvo=data.get('publico_alvo', ''),
            diferenciais=data.get('diferenciais', ''),
            produtos_lista=produtos_lista if len(produtos_lista) > 0 else None
        )

        if resultado['success']:
            return jsonify(resultado)
        else:
            return jsonify(resultado), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
