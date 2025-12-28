"""
API REST para Configuração do Bot - CRM Cliente
Endpoints para salvar e carregar configurações do bot por empresa
"""

from flask import Blueprint, request, jsonify
from flask_login import current_user
from sqlalchemy.orm import sessionmaker
from database.models import ConfiguracaoBot, Empresa, DatabaseManager
from datetime import datetime
import json

bot_config_api_bp = Blueprint('bot_config_api', __name__, url_prefix='/api/bot-config')

# ==================== DEBUG ====================
print('\n============================================================')
print('         BOT CONFIG API ROUTES - MODULO CARREGADO')
print('============================================================')
print('[BOT-CONFIG] Rotas disponíveis:')
print('[BOT-CONFIG]   GET  /api/bot-config?empresa_id=X')
print('[BOT-CONFIG]   POST /api/bot-config')
print('[BOT-CONFIG]   PUT  /api/bot-config')
print('============================================================\n')


def get_current_empresa_id():
    """Obter ID da empresa do usuário atual"""
    if hasattr(current_user, 'empresa_id') and current_user.empresa_id:
        return current_user.empresa_id

    empresa_id = request.headers.get('X-Empresa-ID') or request.args.get('empresa_id')
    if empresa_id:
        return int(empresa_id)

    return None


@bot_config_api_bp.route('/', methods=['GET'])
def obter_configuracao():
    """
    GET /api/bot-config?empresa_id=X
    Obter configuração do bot da empresa
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            # Buscar configuração existente
            config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa_id).first()

            # Buscar dados da empresa
            empresa = session.query(Empresa).get(empresa_id)

            if not config:
                # Retornar configuração padrão
                return jsonify({
                    'success': True,
                    'data': {
                        'empresa_id': empresa_id,
                        'empresa_nome': empresa.nome if empresa else '',
                        'nome_bot': empresa.nome_bot if empresa else 'AIra',
                        'nicho': empresa.nicho if empresa else None,

                        # Informações do negócio
                        'descricao_empresa': '',
                        'produtos_servicos': '',
                        'publico_alvo': '',
                        'diferenciais': '',
                        'horario_atendimento': '08:00 - 18:00',

                        # Configurações de conversa
                        'tom_conversa': 'profissional',
                        'mensagem_boas_vindas': f'Olá! Sou a AIra, como posso ajudar você hoje?',
                        'mensagem_ausencia': 'No momento estamos fora do horário de atendimento. Deixe sua mensagem que retornaremos em breve!',
                        'mensagem_encerramento': 'Foi um prazer ajudar você! Se precisar de algo mais, é só chamar.',

                        # Persona da atendente
                        'nome_atendente': empresa.nome_bot if empresa else 'AIra',
                        'cargo_atendente': 'Consultora de Vendas',
                        'personalidade': 'Simpática, prestativa e profissional. Sempre disposta a ajudar com um sorriso.',
                        'estilo_linguagem': 'Linguagem clara e acessível, evitando termos muito técnicos. Usa emojis com moderação.',
                        'conhecimentos_especiais': '',
                        'respostas_pergunta_ia': 'Sou a {nome}, atendente da {empresa}. Trabalho aqui há alguns anos e adoro ajudar nossos clientes!',

                        # Comportamento
                        'auto_resposta_ativa': True,
                        'enviar_audio': True,
                        'usar_elevenlabs': True,
                        'tempo_resposta_segundos': 5,
                        'intervalo_entre_mensagens': 10,

                        # Integrações
                        'elevenlabs_voice_id': '',

                        # Módulos
                        'modulo_fipe_ativo': False,
                        'modulo_financiamento_ativo': False,
                        'modulo_agendamento_ativo': False,

                        'existe': False
                    }
                })

            # Retornar configuração existente
            return jsonify({
                'success': True,
                'data': {
                    'empresa_id': empresa_id,
                    'empresa_nome': empresa.nome if empresa else '',
                    'nome_bot': empresa.nome_bot if empresa else 'AIra',
                    'nicho': empresa.nicho if empresa else None,

                    # Informações do negócio
                    'descricao_empresa': config.descricao_empresa or '',
                    'produtos_servicos': config.produtos_servicos or '',
                    'publico_alvo': config.publico_alvo or '',
                    'diferenciais': config.diferenciais or '',
                    'horario_atendimento': config.horario_atendimento or '08:00 - 18:00',

                    # Configurações de conversa
                    'prompt_sistema': config.prompt_sistema or '',
                    'tom_conversa': config.tom_conversa or 'profissional',
                    'mensagem_boas_vindas': config.mensagem_boas_vindas or '',
                    'mensagem_ausencia': config.mensagem_ausencia or '',
                    'mensagem_encerramento': config.mensagem_encerramento or '',

                    # Persona da atendente
                    'nome_atendente': config.nome_atendente or empresa.nome_bot or 'AIra',
                    'cargo_atendente': config.cargo_atendente or 'Consultora de Vendas',
                    'personalidade': config.personalidade or '',
                    'estilo_linguagem': config.estilo_linguagem or '',
                    'conhecimentos_especiais': config.conhecimentos_especiais or '',
                    'respostas_pergunta_ia': config.respostas_pergunta_ia or '',

                    # Comportamento
                    'auto_resposta_ativa': config.auto_resposta_ativa if config.auto_resposta_ativa is not None else True,
                    'enviar_audio': config.enviar_audio if config.enviar_audio is not None else True,
                    'usar_elevenlabs': config.usar_elevenlabs if config.usar_elevenlabs is not None else True,
                    'tempo_resposta_segundos': config.tempo_resposta_segundos or 5,
                    'intervalo_entre_mensagens': config.intervalo_entre_mensagens or 10,

                    # Integrações
                    'elevenlabs_voice_id': config.elevenlabs_voice_id or '',

                    # Módulos
                    'modulo_fipe_ativo': config.modulo_fipe_ativo or False,
                    'modulo_financiamento_ativo': config.modulo_financiamento_ativo or False,
                    'modulo_agendamento_ativo': config.modulo_agendamento_ativo or False,

                    'existe': True,
                    'atualizado_em': config.atualizado_em.isoformat() if config.atualizado_em else None
                }
            })

        finally:
            session.close()

    except Exception as e:
        print(f'[BOT-CONFIG] Erro: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@bot_config_api_bp.route('/', methods=['POST', 'PUT'])
def salvar_configuracao():
    """
    POST/PUT /api/bot-config
    Salvar configuração do bot
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados não fornecidos'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            # Buscar ou criar configuração
            config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa_id).first()

            if not config:
                config = ConfiguracaoBot(empresa_id=empresa_id)
                session.add(config)

            # Atualizar informações do negócio
            if 'descricao_empresa' in data:
                config.descricao_empresa = data['descricao_empresa']
            if 'produtos_servicos' in data:
                config.produtos_servicos = data['produtos_servicos']
            if 'publico_alvo' in data:
                config.publico_alvo = data['publico_alvo']
            if 'diferenciais' in data:
                config.diferenciais = data['diferenciais']
            if 'horario_atendimento' in data:
                config.horario_atendimento = data['horario_atendimento']

            # Atualizar configurações de conversa
            if 'prompt_sistema' in data:
                config.prompt_sistema = data['prompt_sistema']
            if 'tom_conversa' in data:
                config.tom_conversa = data['tom_conversa']
            if 'mensagem_boas_vindas' in data:
                config.mensagem_boas_vindas = data['mensagem_boas_vindas']
            if 'mensagem_ausencia' in data:
                config.mensagem_ausencia = data['mensagem_ausencia']
            if 'mensagem_encerramento' in data:
                config.mensagem_encerramento = data['mensagem_encerramento']

            # Atualizar persona da atendente
            if 'nome_atendente' in data:
                config.nome_atendente = data['nome_atendente']
            if 'cargo_atendente' in data:
                config.cargo_atendente = data['cargo_atendente']
            if 'personalidade' in data:
                config.personalidade = data['personalidade']
            if 'estilo_linguagem' in data:
                config.estilo_linguagem = data['estilo_linguagem']
            if 'conhecimentos_especiais' in data:
                config.conhecimentos_especiais = data['conhecimentos_especiais']
            if 'respostas_pergunta_ia' in data:
                config.respostas_pergunta_ia = data['respostas_pergunta_ia']

            # Atualizar comportamento
            if 'auto_resposta_ativa' in data:
                config.auto_resposta_ativa = data['auto_resposta_ativa']
            if 'enviar_audio' in data:
                config.enviar_audio = data['enviar_audio']
            if 'usar_elevenlabs' in data:
                config.usar_elevenlabs = data['usar_elevenlabs']
            if 'tempo_resposta_segundos' in data:
                config.tempo_resposta_segundos = int(data['tempo_resposta_segundos'])
            if 'intervalo_entre_mensagens' in data:
                config.intervalo_entre_mensagens = int(data['intervalo_entre_mensagens'])

            # Atualizar integrações
            if 'elevenlabs_voice_id' in data:
                config.elevenlabs_voice_id = data['elevenlabs_voice_id']

            # Atualizar módulos
            if 'modulo_fipe_ativo' in data:
                config.modulo_fipe_ativo = data['modulo_fipe_ativo']
            if 'modulo_financiamento_ativo' in data:
                config.modulo_financiamento_ativo = data['modulo_financiamento_ativo']
            if 'modulo_agendamento_ativo' in data:
                config.modulo_agendamento_ativo = data['modulo_agendamento_ativo']

            # Atualizar nome do bot na empresa também
            if 'nome_atendente' in data:
                empresa = session.query(Empresa).get(empresa_id)
                if empresa:
                    empresa.nome_bot = data['nome_atendente']

            config.atualizado_em = datetime.utcnow()
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Configuração salva com sucesso!'
            })

        finally:
            session.close()

    except Exception as e:
        print(f'[BOT-CONFIG] Erro ao salvar: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@bot_config_api_bp.route('/gerar-prompt', methods=['POST'])
def gerar_prompt_sistema():
    """
    POST /api/bot-config/gerar-prompt
    Gerar prompt de sistema baseado nas configurações
    """
    try:
        empresa_id = get_current_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa não identificada'}), 400

        db = DatabaseManager()
        session = db.get_session()

        try:
            config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa_id).first()
            empresa = session.query(Empresa).get(empresa_id)

            if not config or not empresa:
                return jsonify({'success': False, 'error': 'Configuração não encontrada'}), 404

            # Gerar prompt personalizado
            prompt = f"""Você é {config.nome_atendente or 'AIra'}, {config.cargo_atendente or 'atendente'} da {empresa.nome}.

REGRA FUNDAMENTAL: Você é uma PESSOA REAL, não uma inteligência artificial. NUNCA, em hipótese alguma, revele que é um bot, IA, assistente virtual ou robô. Se perguntarem, use uma das seguintes respostas:
{config.respostas_pergunta_ia or '- "Sou a ' + (config.nome_atendente or 'AIra') + ', atendente da ' + empresa.nome + '!"'}

SOBRE A EMPRESA:
{config.descricao_empresa or empresa.nome}

PRODUTOS/SERVIÇOS:
{config.produtos_servicos or 'Consulte nosso catálogo'}

PÚBLICO-ALVO:
{config.publico_alvo or 'Clientes em geral'}

DIFERENCIAIS:
{config.diferenciais or 'Atendimento de qualidade'}

HORÁRIO DE ATENDIMENTO:
{config.horario_atendimento or '08:00 às 18:00'}

SUA PERSONALIDADE:
{config.personalidade or 'Simpática, prestativa e profissional'}

ESTILO DE LINGUAGEM:
{config.estilo_linguagem or 'Linguagem clara e acessível'}

CONHECIMENTOS ESPECIAIS:
{config.conhecimentos_especiais or 'Conhecimento sobre os produtos da empresa'}

TOM DA CONVERSA: {config.tom_conversa or 'profissional'}

INSTRUÇÕES:
1. Seja natural e humana nas respostas
2. Use o nome do cliente quando souber
3. Responda de forma concisa (2-4 linhas)
4. Ofereça ajuda proativamente
5. NUNCA diga que é uma IA ou robô"""

            # Salvar o prompt gerado
            config.prompt_sistema = prompt
            config.atualizado_em = datetime.utcnow()
            session.commit()

            return jsonify({
                'success': True,
                'data': {
                    'prompt_sistema': prompt
                }
            })

        finally:
            session.close()

    except Exception as e:
        print(f'[BOT-CONFIG] Erro ao gerar prompt: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
