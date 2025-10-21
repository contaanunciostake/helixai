"""
Configurador Inteligente com IA - VendeAI
Gera prompts e configurações personalizadas com base na descrição do negócio
Adaptado do RoboVendedorPro para VendeAI
"""

import openai
import json
from typing import Dict, Optional, List


class IAConfigurador:
    """Configurador inteligente que usa GPT para adaptar o robô ao nicho"""

    def __init__(self, api_key: str):
        """
        Inicializa o configurador

        Args:
            api_key: API key do OpenAI
        """
        self.api_key = api_key
        openai.api_key = api_key

    def gerar_configuracao_completa(
        self,
        descricao_empresa: str,
        produtos_servicos: str,
        publico_alvo: str,
        diferenciais: str,
        produtos_lista: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Gera configuração completa do robô baseada nas informações do negócio

        Args:
            descricao_empresa: O que a empresa faz
            produtos_servicos: Lista de produtos/serviços
            publico_alvo: Público alvo
            diferenciais: Diferenciais competitivos
            produtos_lista: Lista opcional de produtos do banco de dados

        Returns:
            Dicionário com todas as configurações geradas
        """

        # Se houver produtos no banco, incluir no prompt
        info_produtos = ""
        if produtos_lista and len(produtos_lista) > 0:
            info_produtos = f"\n\n**CATÁLOGO DE PRODUTOS ({len(produtos_lista)} itens):**\n"
            for p in produtos_lista[:20]:  # Limitar a 20 para não sobrecarregar
                preco_info = f"R$ {p.get('preco', 'N/A')}" if p.get('preco') else "Consultar"
                info_produtos += f"- {p.get('nome')}: {p.get('descricao', '')[:100]} ({preco_info})\n"

        prompt = f"""Você é um especialista em criar assistentes virtuais de atendimento para WhatsApp.

Com base nas informações abaixo, crie uma configuração completa para um robô de atendimento:

**EMPRESA:**
{descricao_empresa}

**PRODUTOS/SERVIÇOS:**
{produtos_servicos}{info_produtos}

**PÚBLICO-ALVO:**
{publico_alvo}

**DIFERENCIAIS:**
{diferenciais}

---

Retorne um JSON com a seguinte estrutura (SEM markdown, apenas JSON puro):

{{
  "prompt_sistema": "Instruções completas para o GPT atuar como atendente dessa empresa. Deve incluir: identidade, tom de voz, objetivos, produtos/serviços, como qualificar leads, quando transferir para humano. Seja detalhado e inclua informações sobre os produtos se disponíveis!",
  "tom_conversa": "formal/casual/técnico/consultivo",
  "mensagem_boas_vindas": "Mensagem inicial calorosa e profissional (máx 200 caracteres)",
  "mensagem_ausencia": "Mensagem para fora do horário de atendimento",
  "mensagem_encerramento": "Mensagem de despedida e fechamento",
  "palavras_chave_interesse": ["lista", "de", "palavras", "que", "indicam", "interesse"],
  "perguntas_qualificacao": [
    "Pergunta 1 para qualificar o lead",
    "Pergunta 2 para entender necessidade",
    "Pergunta 3 para orçamento/prazo"
  ],
  "respostas_frequentes": {{
    "Pergunta comum 1": "Resposta 1",
    "Pergunta comum 2": "Resposta 2",
    "Pergunta comum 3": "Resposta 3"
  }},
  "gatilhos_venda": [
    "Gatilho mental 1 específico do nicho",
    "Gatilho mental 2"
  ]
}}"""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em criar assistentes virtuais de vendas. Retorne APENAS JSON válido, sem markdown."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2500
            )

            # Extrair resposta
            resposta = response.choices[0].message.content.strip()

            # Remover markdown se houver
            if resposta.startswith('```'):
                resposta = resposta.split('```')[1]
                if resposta.startswith('json'):
                    resposta = resposta[4:]
                resposta = resposta.strip()

            # Parse JSON
            config = json.loads(resposta)

            return {
                'success': True,
                'config': config
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def gerar_prompt_sistema(
        self,
        descricao_empresa: str,
        produtos_servicos: str,
        publico_alvo: str,
        tom_conversa: str = "profissional e amigável",
        produtos_lista: Optional[List[Dict]] = None
    ) -> str:
        """
        Gera apenas o prompt do sistema (mais rápido)

        Args:
            descricao_empresa: O que a empresa faz
            produtos_servicos: Lista de produtos/serviços
            publico_alvo: Público alvo
            tom_conversa: Tom de conversa desejado
            produtos_lista: Lista opcional de produtos do banco

        Returns:
            Prompt do sistema pronto para uso
        """

        # Incluir informações dos produtos se disponível
        info_produtos = ""
        if produtos_lista and len(produtos_lista) > 0:
            info_produtos = f"\n\nCATÁLOGO DISPONÍVEL ({len(produtos_lista)} produtos):\n"
            for p in produtos_lista[:15]:
                preco = f"R$ {p.get('preco', 'N/A')}" if p.get('preco') else "Sob consulta"
                info_produtos += f"- {p.get('nome')} ({preco}): {p.get('descricao', '')[:80]}\n"

        prompt = f"""Crie um prompt de sistema para um assistente virtual de WhatsApp com as seguintes características:

**Empresa**: {descricao_empresa}
**Produtos/Serviços**: {produtos_servicos}{info_produtos}
**Público-Alvo**: {publico_alvo}
**Tom**: {tom_conversa}

O prompt deve definir:
1. Identidade do assistente (nome, papel)
2. Objetivo principal (vendas, qualificação, agendamento)
3. Como se comunicar (tom, linguagem, emojis)
4. Conhecimento sobre produtos/serviços (use o catálogo se disponível)
5. Como identificar e qualificar leads
6. Quando e como transferir para atendimento humano
7. Limites e restrições

Retorne APENAS o prompt de sistema, sem explicações."""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você cria prompts de sistema para assistentes virtuais."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            # Fallback caso API falhe
            return self._gerar_prompt_fallback(
                descricao_empresa,
                produtos_servicos,
                publico_alvo,
                tom_conversa,
                produtos_lista
            )

    def _gerar_prompt_fallback(
        self,
        descricao_empresa: str,
        produtos_servicos: str,
        publico_alvo: str,
        tom_conversa: str,
        produtos_lista: Optional[List[Dict]] = None
    ) -> str:
        """Gera prompt básico caso API falhe"""

        info_produtos = ""
        if produtos_lista and len(produtos_lista) > 0:
            info_produtos = f"\n\n**PRODUTOS DISPONÍVEIS:**\n"
            for p in produtos_lista[:10]:
                info_produtos += f"- {p.get('nome')}"
                if p.get('preco'):
                    info_produtos += f" (R$ {p.get('preco')})"
                info_produtos += f": {p.get('descricao', '')[:60]}\n"

        return f"""Você é um assistente virtual inteligente de vendas e atendimento.

**IDENTIDADE:**
Você atende pela empresa que {descricao_empresa}.
Seja {tom_conversa} em todas as interações.

**PRODUTOS/SERVIÇOS:**
{produtos_servicos}{info_produtos}

**PÚBLICO-ALVO:**
Você atende {publico_alvo}.

**OBJETIVOS:**
1. Recepcionar o cliente de forma calorosa
2. Entender a necessidade do cliente
3. Apresentar soluções adequadas dos nossos produtos
4. Qualificar o interesse (quente/morno/frio)
5. Agendar contato com vendedor se necessário

**DIRETRIZES:**
- Seja sempre educado e prestativo
- Faça perguntas para entender a necessidade
- Apresente os benefícios, não apenas características
- Use linguagem clara e objetiva
- Identifique objeções e trate com empatia
- Caso não saiba responder, ofereça contato humano
- Quando o cliente perguntar sobre produtos, consulte o catálogo acima

**LIMITES:**
- Não faça promessas que não pode cumprir
- Não compartilhe informações sensíveis
- Não discuta preços finais sem qualificação
- Sempre que houver dúvida técnica complexa, transfira para atendimento humano"""

    def analisar_conversa(
        self,
        mensagens: list,
        config: Dict
    ) -> Dict:
        """
        Analisa uma conversa e sugere próximas ações

        Args:
            mensagens: Lista de mensagens da conversa
            config: Configuração do robô

        Returns:
            Análise e sugestões
        """

        historico = "\n".join([
            f"{'CLIENTE' if not msg.get('bot') else 'BOT'}: {msg.get('texto')}"
            for msg in mensagens[-10:]  # Últimas 10 mensagens
        ])

        prompt = f"""Analise a seguinte conversa de vendas:

{historico}

Com base no contexto:
- Produtos/serviços: {config.get('produtos_servicos', 'N/A')}
- Público-alvo: {config.get('publico_alvo', 'N/A')}

Retorne um JSON com:
{{
  "temperatura": "quente/morno/frio",
  "interesse_detectado": true/false,
  "produtos_interesse": ["produto1", "produto2"],
  "objecoes": ["objeção detectada"],
  "proxima_acao": "o que fazer agora",
  "sugestao_mensagem": "sugestão de resposta"
}}"""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Você analisa conversas de vendas e retorna apenas JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )

            resposta = response.choices[0].message.content.strip()

            # Limpar markdown
            if resposta.startswith('```'):
                resposta = resposta.split('```')[1]
                if resposta.startswith('json'):
                    resposta = resposta[4:]
                resposta = resposta.strip()

            return json.loads(resposta)

        except Exception as e:
            return {
                'temperatura': 'morno',
                'interesse_detectado': False,
                'proxima_acao': 'continuar_conversa',
                'error': str(e)
            }

    def gerar_mensagem_remarketing(
        self,
        nome_lead: str,
        empresa_lead: Optional[str],
        historico: str,
        config: Dict
    ) -> str:
        """
        Gera mensagem personalizada de remarketing

        Args:
            nome_lead: Nome do lead
            empresa_lead: Empresa do lead (opcional)
            historico: Resumo do histórico
            config: Configuração do robô

        Returns:
            Mensagem de remarketing personalizada
        """

        prompt = f"""Crie uma mensagem de remarketing personalizada:

**Lead**: {nome_lead}{f' ({empresa_lead})' if empresa_lead else ''}
**Histórico**: {historico}
**Empresa**: {config.get('descricao_empresa', '')}
**Produtos**: {config.get('produtos_servicos', '')}

A mensagem deve:
- Ser calorosa e não invasiva
- Relembrar o contato anterior
- Oferecer valor (novidade, promoção, conteúdo)
- Ter CTA claro
- Máximo 300 caracteres
- Tom: {config.get('tom_conversa', 'profissional')}

Retorne APENAS a mensagem, sem explicações."""

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Você cria mensagens de remarketing eficazes."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=200
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            # Mensagem padrão
            return f"Olá {nome_lead}! Tudo bem? Estávamos conversando sobre {config.get('produtos_servicos', 'nossos serviços')}. Gostaria de retomar nossa conversa?"

    def processar_produtos_para_prompt(self, produtos: List[Dict], max_produtos: int = 20) -> str:
        """
        Processa lista de produtos para incluir no prompt do bot

        Args:
            produtos: Lista de dicionários com dados dos produtos
            max_produtos: Número máximo de produtos a incluir

        Returns:
            String formatada com informações dos produtos
        """
        if not produtos:
            return ""

        resultado = f"\n\n=== CATÁLOGO DE PRODUTOS ({len(produtos)} itens) ===\n"

        for i, prod in enumerate(produtos[:max_produtos], 1):
            nome = prod.get('nome', 'Produto sem nome')
            preco = prod.get('preco')
            preco_promo = prod.get('preco_promocional')
            descricao = prod.get('descricao', '')
            categoria = prod.get('categoria', '')
            disponivel = prod.get('disponivel', True)

            resultado += f"\n{i}. {nome}"

            if categoria:
                resultado += f" [{categoria}]"

            # Preço
            if preco:
                if preco_promo and preco_promo < preco:
                    resultado += f"\n   Preço: ~~R$ {preco:.2f}~~ → R$ {preco_promo:.2f} (PROMOÇÃO)"
                else:
                    resultado += f"\n   Preço: R$ {preco:.2f}"

            # Descrição
            if descricao:
                desc_curta = descricao[:150] + "..." if len(descricao) > 150 else descricao
                resultado += f"\n   {desc_curta}"

            # Disponibilidade
            if not disponivel:
                resultado += "\n   ⚠️ INDISPONÍVEL NO MOMENTO"

        if len(produtos) > max_produtos:
            resultado += f"\n\n... e mais {len(produtos) - max_produtos} produtos disponíveis."

        resultado += "\n=== FIM DO CATÁLOGO ===\n"

        return resultado


if __name__ == '__main__':
    # Teste do configurador
    import os
    from dotenv import load_dotenv

    load_dotenv()

    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        print("[ERRO] OPENAI_API_KEY não encontrada no .env")
        exit(1)

    configurador = IAConfigurador(api_key)

    print("="*70)
    print("TESTE DO CONFIGURADOR INTELIGENTE - VendeAI")
    print("="*70)

    # Exemplo: Loja de roupas
    resultado = configurador.gerar_configuracao_completa(
        descricao_empresa="Somos uma loja de roupas femininas modernas e acessíveis",
        produtos_servicos="Vestidos, blusas, saias, acessórios. Focamos em moda jovem e casual.",
        publico_alvo="Mulheres de 18 a 35 anos, classe B e C",
        diferenciais="Preços acessíveis, entrega rápida, troca fácil"
    )

    if resultado['success']:
        config = resultado['config']
        print("\n[OK] Configuração gerada com sucesso!\n")
        print("PROMPT DO SISTEMA:")
        print("-"*70)
        print(config.get('prompt_sistema', ''))
        print("\n" + "="*70)
        print(f"Tom: {config.get('tom_conversa')}")
        print(f"Boas-vindas: {config.get('mensagem_boas_vindas')}")
        print("="*70)
    else:
        print(f"\n[ERRO] {resultado['error']}")
