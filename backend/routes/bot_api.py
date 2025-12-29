"""
API para comunicação Bot <-> Backend
Endpoints usados pelo bot WhatsApp para salvar dados
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import (
    Empresa, ConfiguracaoBot, Lead, Conversa, Mensagem,
    Campanha, Disparo, StatusLead, TemperaturaLead,
    TipoMensagem, StatusDisparo,
    ProdutoTinta, CategoriaTinta, PaletaCores,
    OrcamentoTinta, ConfiguracaoBotTintas
)
from backend import db_manager

bp = Blueprint('bot_api', __name__, url_prefix='/api/bot')

# ==================== DEBUG ====================
print('\n========================================================')
print('=        BOT API ROUTES - MODULO CARREGADO            =')
print('========================================================')
print('[BOT API] Rotas disponiveis:')
print('[BOT API]   GET  /api/bot/config?phone=NUMERO')
print('[BOT API]   POST /api/bot/conversas')
print('[BOT API]   POST /api/bot/mensagens')
print('[BOT API]   POST /api/bot/leads')
print('[BOT API]   POST /api/bot/status')
print('[BOT API]   GET  /api/bot/leads/disparo')
print('[BOT API]   POST /api/bot/disparos')
print('========================================================\n')


@bp.route('/config', methods=['GET'])
def get_config():
    """Busca configuração da empresa pelo número WhatsApp"""
    phone = request.args.get('phone')

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/config")
    print(f"[BOT API] Telefone recebido: {phone}")

    if not phone:
        print(f"[BOT API] Telefone nao fornecido")
        return jsonify({'error': 'Phone number required'}), 400

    # Limpar número: extrair apenas os dígitos antes de @ ou :
    phone_clean = phone.split('@')[0].split(':')[0]
    print(f"[BOT API] Telefone limpo: {phone_clean}")

    session = db_manager.get_session()
    try:
        print(f"[BOT API] Buscando empresa com numero: {phone_clean}%")

        # Buscar empresa pelo número WhatsApp (usando LIKE para match parcial)
        empresa = session.query(Empresa).filter(
            Empresa.whatsapp_numero.like(f'{phone_clean}%')
        ).first()

        if not empresa:
            print(f"[BOT API] Empresa nao encontrada com filtro LIKE")
            print(f"[BOT API] Tentando buscar primeira empresa ativa...")

            # Fallback: buscar primeira empresa ativa
            empresa = session.query(Empresa).filter(
                Empresa.bot_ativo == True
            ).first()

            if not empresa:
                print(f"[BOT API] Nenhuma empresa ativa encontrada no banco!")
                print(f"[BOT API] ========================================\n")
                return jsonify({'error': 'Empresa não encontrada'}), 404

            print(f"[BOT API] Empresa encontrada (fallback): {empresa.nome} (ID: {empresa.id})")

        else:
            print(f"[BOT API] Empresa encontrada: {empresa.nome} (ID: {empresa.id})")

        # Buscar configuração
        print(f"[BOT API] Buscando configuracao do bot...")
        config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa.id).first()

        if not config:
            print(f"[BOT API] Configuracao nao encontrada, criando padrao...")
            # Criar configuração padrão
            config = ConfiguracaoBot(
                empresa_id=empresa.id,
                descricao_empresa=empresa.nome,
                mensagem_boas_vindas="Olá! Bem-vindo ao nosso atendimento.",
                auto_resposta_ativa=True,
                enviar_audio=True
            )
            session.add(config)
            session.commit()
            print(f"[BOT API] Configuracao padrao criada")

        print(f"[BOT API] Configuracao carregada:")
        print(f"[BOT API]    - Auto resposta: {config.auto_resposta_ativa}")
        print(f"[BOT API]    - Enviar audio: {config.enviar_audio}")
        print(f"[BOT API]    - OpenAI configurado: {'Sim' if config.openai_api_key else 'Nao'}")
        print(f"[BOT API]    - ElevenLabs configurado: {'Sim' if config.elevenlabs_api_key else 'Nao'}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'empresa_id': empresa.id,
            'empresa_nome': empresa.nome,
            'whatsapp_numero': empresa.whatsapp_numero,
            'bot_ativo': empresa.bot_ativo,
            'tipo_negocio': empresa.tipo_negocio or 'veiculos',  # Tipo de negócio (veiculos, loja_tintas, etc)
            'config': {
                'descricao_empresa': config.descricao_empresa,
                'produtos_servicos': config.produtos_servicos,
                'tom_conversa': config.tom_conversa,
                'mensagem_boas_vindas': config.mensagem_boas_vindas,
                'auto_resposta_ativa': config.auto_resposta_ativa,
                'enviar_audio': config.enviar_audio,
                'openai_api_key': config.openai_api_key,
                'openai_model': config.openai_model,
                'groq_api_key': config.groq_api_key,
                'elevenlabs_api_key': config.elevenlabs_api_key,
                'elevenlabs_voice_id': config.elevenlabs_voice_id,
                'elevenlabs_agent_id': config.elevenlabs_agent_id,
                'modulo_fipe_ativo': config.modulo_fipe_ativo,
                'modulo_financiamento_ativo': config.modulo_financiamento_ativo
            }
        })

    except Exception as e:
        print(f"[BOT API] ERRO CRITICO")
        print(f"[BOT API] Erro: {str(e)}")
        print(f"[BOT API] ========================================\n")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/config/<int:empresa_id>', methods=['GET'])
def get_config_by_id(empresa_id):
    """Busca configuração da empresa pelo ID (usado pelo WhatsApp Service)"""
    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/config/{empresa_id}")

    session = db_manager.get_session()
    try:
        # Buscar empresa pelo ID
        empresa = session.query(Empresa).filter(Empresa.id == empresa_id).first()

        if not empresa:
            print(f"[BOT API] Empresa {empresa_id} não encontrada")
            print(f"[BOT API] ========================================\n")
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        print(f"[BOT API] Empresa encontrada: {empresa.nome} (ID: {empresa.id})")

        # Buscar configuração
        print(f"[BOT API] Buscando configuracao do bot...")
        config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa.id).first()

        if not config:
            print(f"[BOT API] Configuracao nao encontrada, usando valores padrão...")

        print(f"[BOT API] ========================================\n")

        # Converter nicho enum para string
        nicho_str = empresa.nicho.value if empresa.nicho else 'outros'

        return jsonify({
            'success': True,
            'data': {
                'empresaId': empresa.id,
                'empresaNome': empresa.nome,
                'nicho': nicho_str,
                'botAtivo': empresa.bot_ativo if empresa.bot_ativo is not None else True,
                'autoRespostaAtiva': config.auto_resposta_ativa if config else True,
                'enviarAudio': config.enviar_audio if config else False,
                'usarElevenlabs': False,
                'openaiApiKey': config.openai_api_key if config else None,
                'anthropicApiKey': config.anthropic_api_key if config and hasattr(config, 'anthropic_api_key') else None,
                'elevenlabsApiKey': config.elevenlabs_api_key if config else None,
                'elevenlabsVoiceId': config.elevenlabs_voice_id if config else None
            }
        })

    except Exception as e:
        print(f"[BOT API] ERRO CRITICO: {str(e)}")
        print(f"[BOT API] ========================================\n")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/mensagens', methods=['POST'])
def salvar_mensagem():
    """Salva mensagem no banco"""
    data = request.json
    session = db_manager.get_session()

    try:
        mensagem = Mensagem(
            conversa_id=data.get('conversa_id'),
            tipo=TipoMensagem[data.get('tipo', 'TEXTO').upper()],
            conteudo=data.get('conteudo'),
            arquivo_url=data.get('arquivo_url'),
            enviada_por_bot=data.get('enviada_por_bot', False),
            whatsapp_id=data.get('whatsapp_id')
        )

        session.add(mensagem)
        session.commit()

        return jsonify({
            'success': True,
            'mensagem_id': mensagem.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/conversas', methods=['POST'])
def salvar_conversa():
    """Cria ou atualiza conversa"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')

        # Buscar conversa existente
        conversa = session.query(Conversa).filter_by(
            empresa_id=empresa_id,
            telefone=telefone,
            ativa=True
        ).first()

        if not conversa:
            # Criar nova conversa
            conversa = Conversa(
                empresa_id=empresa_id,
                telefone=telefone,
                nome_contato=data.get('nome_contato'),
                ativa=True,
                bot_ativo=True
            )
            session.add(conversa)
        else:
            # Atualizar última mensagem
            conversa.ultima_mensagem = datetime.utcnow()
            conversa.total_mensagens += 1

        session.commit()

        return jsonify({
            'success': True,
            'conversa_id': conversa.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/leads', methods=['POST'])
def salvar_lead():
    """Cria ou atualiza lead"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')

        # Buscar lead existente
        lead = session.query(Lead).filter_by(
            empresa_id=empresa_id,
            telefone=telefone
        ).first()

        if not lead:
            # Criar novo lead
            lead = Lead(
                empresa_id=empresa_id,
                nome=data.get('nome'),
                telefone=telefone,
                email=data.get('email'),
                status=StatusLead.NOVO,
                temperatura=TemperaturaLead.MORNO,
                origem='whatsapp'
            )
            session.add(lead)
        else:
            # Atualizar lead
            if data.get('nome'):
                lead.nome = data.get('nome')
            if data.get('email'):
                lead.email = data.get('email')
            if data.get('temperatura'):
                lead.temperatura = TemperaturaLead[data['temperatura'].upper()]

            lead.ultima_interacao = datetime.utcnow()

        session.commit()

        return jsonify({
            'success': True,
            'lead_id': lead.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/status', methods=['POST'])
def atualizar_status():
    """Atualiza status WhatsApp da empresa"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        empresa.whatsapp_conectado = data.get('whatsapp_conectado', False)
        session.commit()

        return jsonify({'success': True})

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/leads/disparo', methods=['GET'])
def buscar_leads_disparo():
    """Busca leads para disparo em massa"""
    empresa_id = request.args.get('empresa_id')
    campanha_id = request.args.get('campanha_id')

    session = db_manager.get_session()

    try:
        # Buscar leads pendentes da campanha
        query = session.query(Lead).filter_by(
            empresa_id=empresa_id
        )

        if campanha_id:
            query = query.filter_by(campanha_id=campanha_id)

        leads = query.limit(100).all()

        resultado = []
        for lead in leads:
            resultado.append({
                'id': lead.id,
                'nome': lead.nome,
                'telefone': lead.telefone,
                'status': lead.status.value
            })

        return jsonify(resultado)

    finally:
        session.close()


@bp.route('/disparos', methods=['POST'])
def registrar_disparo():
    """Registra disparo realizado"""
    data = request.json
    session = db_manager.get_session()

    try:
        disparo = Disparo(
            campanha_id=data.get('campanha_id'),
            lead_id=data.get('lead_id'),
            telefone=data.get('telefone'),
            mensagem_enviada=data.get('mensagem'),
            status=StatusDisparo[data.get('status', 'ENVIADO').upper()],
            enviado_em=datetime.utcnow()
        )

        session.add(disparo)
        session.commit()

        return jsonify({
            'success': True,
            'disparo_id': disparo.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


# ==================== MÓDULO LOJA DE TINTAS ====================

@bp.route('/tintas/produtos', methods=['GET'])
def get_produtos_tinta():
    """Bot busca produtos de tinta"""
    empresa_id = request.args.get('empresa_id')
    tipo = request.args.get('tipo')  # latex, acrilica, esmalte
    marca = request.args.get('marca')
    ambiente = request.args.get('ambiente')  # interno, externo
    busca = request.args.get('busca')  # Busca por nome

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/tintas/produtos")
    print(f"[BOT API] Empresa: {empresa_id}, Tipo: {tipo}, Marca: {marca}")

    session = db_manager.get_session()
    try:
        query = session.query(ProdutoTinta).filter_by(
            empresa_id=empresa_id,
            ativo=True
        )

        if tipo:
            query = query.filter_by(tipo=tipo)
        if marca:
            query = query.filter(ProdutoTinta.marca.ilike(f'%{marca}%'))
        if ambiente:
            query = query.filter(
                (ProdutoTinta.ambiente == ambiente) |
                (ProdutoTinta.ambiente == 'ambos')
            )
        if busca:
            query = query.filter(
                (ProdutoTinta.nome.ilike(f'%{busca}%')) |
                (ProdutoTinta.marca.ilike(f'%{busca}%')) |
                (ProdutoTinta.cor_nome.ilike(f'%{busca}%'))
            )

        produtos = query.order_by(ProdutoTinta.destaque.desc()).limit(10).all()

        print(f"[BOT API] Produtos encontrados: {len(produtos)}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'success': True,
            'produtos': [p.to_dict() for p in produtos]
        })

    except Exception as e:
        print(f"[BOT API] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/tintas/calcular', methods=['POST'])
def calcular_tinta():
    """Bot calcula quantidade de tinta"""
    data = request.json

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] POST /api/bot/tintas/calcular")
    print(f"[BOT API] Dados: {data}")

    area = float(data.get('area_m2', 0))
    rendimento = float(data.get('rendimento', 10))
    demaos = int(data.get('demaos', 2))
    altura = float(data.get('altura', 2.8))
    tipo_pintura = data.get('tipo_pintura', 'paredes')
    margem = float(data.get('margem', 1.1))

    # Calcular área de pintura
    if tipo_pintura == 'paredes':
        area_pintura = area * altura * 0.9  # 10% desconto para aberturas
    else:
        area_pintura = area

    # Litros necessários
    litros = (area_pintura * demaos * margem) / rendimento

    # Calcular latas
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

    print(f"[BOT API] Litros calculados: {litros:.2f}")
    print(f"[BOT API] ========================================\n")

    return jsonify({
        'success': True,
        'area_pintura': round(area_pintura, 2),
        'litros': round(litros, 2),
        'latas_18l': latas['18L'],
        'latas_3_6l': latas['3.6L'],
        'latas_900ml': latas['0.9L'],
        'latas': latas,
        'demaos': demaos
    })


@bp.route('/tintas/orcamento', methods=['POST'])
def criar_orcamento_tinta():
    """Bot cria orçamento"""
    data = request.json

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] POST /api/bot/tintas/orcamento")
    print(f"[BOT API] Empresa: {data.get('empresa_id')}")

    session = db_manager.get_session()
    try:
        orcamento = OrcamentoTinta(
            empresa_id=data.get('empresa_id'),
            lead_id=data.get('lead_id'),
            conversa_id=data.get('conversa_id'),
            tipo_projeto=data.get('tipo_projeto'),
            ambiente=data.get('ambiente'),
            area_m2=data.get('area_m2'),
            altura_paredes=data.get('altura', 2.8),
            area_total_pintura=data.get('area_total_pintura'),
            litros_necessarios=data.get('litros_necessarios'),
            numero_latas=data.get('numero_latas'),
            itens=data.get('itens'),
            subtotal=data.get('subtotal'),
            desconto_percentual=data.get('desconto_percentual', 0),
            desconto_valor=data.get('desconto_valor', 0),
            valor_total=data.get('valor_total'),
            status='pendente'
        )
        session.add(orcamento)
        session.commit()

        print(f"[BOT API] Orcamento criado: #{orcamento.id}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'success': True,
            'orcamento_id': orcamento.id
        })

    except Exception as e:
        session.rollback()
        print(f"[BOT API] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/tintas/cores', methods=['GET'])
def get_paleta_cores():
    """Bot busca cores disponíveis"""
    empresa_id = request.args.get('empresa_id')
    familia = request.args.get('familia')  # Neutros, Quentes, Frios

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/tintas/cores")
    print(f"[BOT API] Empresa: {empresa_id}, Família: {familia}")

    session = db_manager.get_session()
    try:
        query = session.query(PaletaCores).filter_by(
            empresa_id=empresa_id,
            ativo=True
        )

        if familia:
            query = query.filter_by(familia=familia)

        # Priorizar cores tendência
        cores = query.order_by(
            PaletaCores.tendencia.desc(),
            PaletaCores.nome
        ).limit(20).all()

        print(f"[BOT API] Cores encontradas: {len(cores)}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'success': True,
            'cores': [
                {
                    'id': c.id,
                    'nome': c.nome,
                    'codigo': c.codigo,
                    'hex': c.hex_color,
                    'familia': c.familia,
                    'tendencia': c.tendencia
                } for c in cores
            ]
        })

    except Exception as e:
        print(f"[BOT API] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/tintas/config', methods=['GET'])
def get_config_tintas():
    """Bot busca configurações da loja de tintas"""
    empresa_id = request.args.get('empresa_id')

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/tintas/config")
    print(f"[BOT API] Empresa: {empresa_id}")

    session = db_manager.get_session()
    try:
        config = session.query(ConfiguracaoBotTintas).filter_by(
            empresa_id=empresa_id
        ).first()

        if not config:
            print(f"[BOT API] Config não encontrada, criando padrão...")
            # Criar configuração padrão
            config = ConfiguracaoBotTintas(
                empresa_id=empresa_id,
                nome_atendente='Laura',
                tom_conversa='amigavel_profissional'
            )
            session.add(config)
            session.commit()

        print(f"[BOT API] Config carregada: {config.nome_atendente}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'success': True,
            'nome_atendente': config.nome_atendente,
            'tom_conversa': config.tom_conversa,
            'calculadora_ativa': config.calculadora_rendimento,
            'sugestao_cores_ativa': config.sugestao_cores,
            'orcamento_automatico': config.orcamento_automatico,
            'msg_boas_vindas': config.msg_boas_vindas,
            'desconto_maximo': config.desconto_maximo,
            'frete_gratis_acima': config.frete_gratis_acima,
            'margem_seguranca': config.margem_seguranca_tinta,
            'prazo_entrega': config.prazo_entrega_padrao
        })

    except Exception as e:
        print(f"[BOT API] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/tintas/categorias', methods=['GET'])
def get_categorias_tinta():
    """Bot busca categorias de tintas"""
    empresa_id = request.args.get('empresa_id')

    session = db_manager.get_session()
    try:
        categorias = session.query(CategoriaTinta).filter_by(
            empresa_id=empresa_id,
            ativo=True
        ).order_by(CategoriaTinta.nome).all()

        return jsonify({
            'success': True,
            'categorias': [
                {
                    'id': c.id,
                    'nome': c.nome,
                    'descricao': c.descricao,
                    'icone': c.icone
                } for c in categorias
            ]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/tintas/produto/<int:id>', methods=['GET'])
def get_produto_tinta_detalhe(id):
    """Bot busca detalhes de um produto específico"""
    empresa_id = request.args.get('empresa_id')

    session = db_manager.get_session()
    try:
        produto = session.query(ProdutoTinta).filter_by(
            id=id,
            empresa_id=empresa_id,
            ativo=True
        ).first()

        if not produto:
            return jsonify({'error': 'Produto não encontrado'}), 404

        return jsonify({
            'success': True,
            'produto': produto.to_dict()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


# ══════════════════════════════════════════════════════════════════════════════
# VENDAS E PEDIDOS - Endpoints para registro automático pelo bot
# ══════════════════════════════════════════════════════════════════════════════

@bp.route('/registrar-venda', methods=['POST'])
def registrar_venda_bot():
    """
    POST /api/bot/registrar-venda
    Registrar venda/pedido automaticamente via bot (SQLite)
    """
    import sqlite3
    from pathlib import Path

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados não fornecidos'}), 400

        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')
        nome_cliente = data.get('nome_cliente', 'Cliente WhatsApp')
        produtos = data.get('produtos', [])  # [{produto_id, nome, quantidade, preco}]

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatório'}), 400

        # Conectar ao SQLite
        db_path = Path(__file__).parent.parent / 'vendeai.db'
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Buscar ou criar cliente
        cliente_id = None
        if telefone:
            cursor.execute('''
                SELECT id FROM clientes
                WHERE empresa_id = ? AND (telefone = ? OR celular = ?)
            ''', (empresa_id, telefone, telefone))
            cliente = cursor.fetchone()

            if cliente:
                cliente_id = cliente['id']
            else:
                # Criar cliente básico
                cursor.execute('''
                    INSERT INTO clientes (empresa_id, nome, telefone, celular, origem, ativo, criado_em)
                    VALUES (?, ?, ?, ?, 'whatsapp_bot', 1, datetime('now'))
                ''', (empresa_id, nome_cliente, telefone, telefone))
                cliente_id = cursor.lastrowid

        # Calcular total
        subtotal = 0
        for item in produtos:
            preco = float(item.get('preco', 0))
            qtd = int(item.get('quantidade', 1))
            subtotal += preco * qtd

        desconto = float(data.get('desconto', 0))
        total = subtotal - desconto

        # Criar pedido
        cursor.execute('''
            INSERT INTO pedidos (
                empresa_id, cliente_id, data_pedido, status,
                subtotal, desconto, total, forma_pagamento,
                observacoes, origem, criado_em
            ) VALUES (?, ?, datetime('now'), 'pendente', ?, ?, ?, ?, ?, 'whatsapp_bot', datetime('now'))
        ''', (
            empresa_id,
            cliente_id,
            subtotal,
            desconto,
            total,
            data.get('forma_pagamento', 'a_combinar'),
            data.get('observacoes', f'Pedido via WhatsApp - {nome_cliente}')
        ))

        pedido_id = cursor.lastrowid

        # Inserir itens do pedido
        for item in produtos:
            cursor.execute('''
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                pedido_id,
                item.get('produto_id') or item.get('id'),
                item.get('quantidade', 1),
                float(item.get('preco', 0)),
                float(item.get('preco', 0)) * int(item.get('quantidade', 1))
            ))

        # Atualizar total_compras do cliente
        if cliente_id:
            cursor.execute('''
                UPDATE clientes
                SET total_compras = COALESCE(total_compras, 0) + ?,
                    ultima_compra = datetime('now'),
                    atualizado_em = datetime('now')
                WHERE id = ?
            ''', (total, cliente_id))

        conn.commit()
        conn.close()

        print(f'[BOT-API] Venda registrada: Pedido #{pedido_id} - R$ {total:.2f} - {len(produtos)} itens')

        return jsonify({
            'success': True,
            'pedido_id': pedido_id,
            'cliente_id': cliente_id,
            'total': total,
            'itens': len(produtos),
            'message': f'Pedido #{pedido_id} registrado com sucesso!'
        })

    except Exception as e:
        print(f'[BOT-API] Erro ao registrar venda: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/finalizar-atendimento', methods=['POST'])
def finalizar_atendimento_bot():
    """
    POST /api/bot/finalizar-atendimento
    Finalizar atendimento/conversa (SQLite)
    """
    import sqlite3
    from pathlib import Path

    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')
        motivo = data.get('motivo', 'venda_concluida')  # venda_concluida, sem_interesse, agendado, etc

        if not empresa_id or not telefone:
            return jsonify({'success': False, 'error': 'empresa_id e telefone obrigatórios'}), 400

        db_path = Path(__file__).parent.parent / 'vendeai.db'
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Atualizar conversa como finalizada
        cursor.execute('''
            UPDATE conversas
            SET ativa = 0,
                bot_ativo = 0,
                finalizada_em = datetime('now'),
                intencao_atual = ?
            WHERE empresa_id = ? AND telefone = ?
        ''', (motivo, empresa_id, telefone))

        conn.commit()
        affected = cursor.rowcount
        conn.close()

        print(f'[BOT-API] Atendimento finalizado: {telefone} - Motivo: {motivo}')

        return jsonify({
            'success': True,
            'message': 'Atendimento finalizado',
            'telefone': telefone,
            'motivo': motivo,
            'conversas_atualizadas': affected
        })

    except Exception as e:
        print(f'[BOT-API] Erro ao finalizar atendimento: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/atualizar-conversa', methods=['POST'])
def atualizar_conversa_bot():
    """
    POST /api/bot/atualizar-conversa
    Criar ou atualizar registro de conversa ativa (SQLite)
    """
    import sqlite3
    from pathlib import Path

    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')
        nome_contato = data.get('nome', 'Cliente')

        if not empresa_id or not telefone:
            return jsonify({'success': False, 'error': 'empresa_id e telefone obrigatórios'}), 400

        db_path = Path(__file__).parent.parent / 'vendeai.db'
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Verificar se já existe conversa
        cursor.execute('''
            SELECT id FROM conversas WHERE empresa_id = ? AND telefone = ?
        ''', (empresa_id, telefone))
        conversa = cursor.fetchone()

        if conversa:
            # Atualizar conversa existente
            cursor.execute('''
                UPDATE conversas
                SET ativa = 1,
                    bot_ativo = 1,
                    nome_contato = COALESCE(?, nome_contato),
                    ultima_mensagem = datetime('now'),
                    total_mensagens = total_mensagens + 1
                WHERE empresa_id = ? AND telefone = ?
            ''', (nome_contato, empresa_id, telefone))
            conversa_id = conversa[0]
        else:
            # Criar nova conversa
            cursor.execute('''
                INSERT INTO conversas (
                    empresa_id, telefone, nome_contato, ativa, bot_ativo,
                    total_mensagens, mensagens_recebidas, mensagens_enviadas,
                    iniciada_em, ultima_mensagem
                ) VALUES (?, ?, ?, 1, 1, 1, 1, 0, datetime('now'), datetime('now'))
            ''', (empresa_id, telefone, nome_contato))
            conversa_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'conversa_id': conversa_id,
            'telefone': telefone
        })

    except Exception as e:
        print(f'[BOT-API] Erro ao atualizar conversa: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
