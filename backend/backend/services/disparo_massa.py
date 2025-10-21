"""
VendeAI - Serviço de Disparo em Massa
Sistema de disparo inteligente com rate limiting e controle de qualidade
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import asyncio
import time

# Adicionar caminhos ao path
sys.path.append(str(Path(__file__).parent.parent.parent))
sys.path.append(str(Path(__file__).parent.parent.parent / 'RoboVendedor'))

from sqlalchemy.orm import Session
from database.models import Empresa, Lead, Campanha
from database.models_robo import (
    ConfiguracaoRoboDisparador, LeadImportacao,
    LogDisparoMassa, MetricasDisparoMassa
)

# Importar o WhatsApp sender do RoboVendedor
try:
    sys.path.insert(0, 'C:\\Users\\Victor\\Documents\\RoboVendedor')
    from disparador.whatsapp_sender import WhatsAppSender
    from disparador.rate_limiter import RateLimiter
except ImportError as e:
    print(f"[AVISO] Nao foi possivel importar WhatsAppSender: {e}")
    WhatsAppSender = None
    RateLimiter = None


class ServicoDisparoMassa:
    """Serviço centralizado de disparo em massa"""

    def __init__(self, db_session: Session, empresa_id: int):
        self.db = db_session
        self.empresa_id = empresa_id
        self.config = self._carregar_configuracao()

        # Inicializar WhatsApp sender se disponível
        if WhatsAppSender:
            self.whatsapp = WhatsAppSender()
            self.rate_limiter = RateLimiter({
                'maxPerHour': self.config.max_mensagens_por_hora,
                'delayMin': self.config.delay_entre_mensagens_min,
                'delayMax': self.config.delay_entre_mensagens_max,
                'workingHoursStart': self.config.horario_inicio,
                'workingHoursEnd': self.config.horario_fim,
                'enableWeekends': self.config.habilitar_fins_semana
            })
        else:
            self.whatsapp = None
            self.rate_limiter = None

        # Métricas
        self.stats = {
            'total': 0,
            'enviados': 0,
            'erros': 0,
            'pendentes': 0,
            'inicio': datetime.now()
        }

    def _carregar_configuracao(self) -> ConfiguracaoRoboDisparador:
        """Carrega configuração do robô para a empresa"""
        config = self.db.query(ConfiguracaoRoboDisparador).filter_by(
            empresa_id=self.empresa_id
        ).first()

        if not config:
            # Criar configuração padrão
            config = ConfiguracaoRoboDisparador(
                empresa_id=self.empresa_id,
                max_mensagens_por_hora=15,
                delay_entre_mensagens_min=300,
                delay_entre_mensagens_max=600,
                horario_inicio=9,
                horario_fim=18,
                habilitar_fins_semana=False,
                modo_assistido=True,
                sempre_enviar_audio=True
            )
            self.db.add(config)
            self.db.commit()

        return config

    async def iniciar_whatsapp(self):
        """Inicializa conexão WhatsApp"""
        if not self.whatsapp:
            raise Exception("WhatsAppSender nao disponivel")

        print("Conectando ao WhatsApp...")
        await self.whatsapp.conectar()

        # Atualizar status no banco
        self.config.whatsapp_conectado = True
        self.db.commit()

        return True

    def buscar_leads_pendentes(self, campanha_id: Optional[int] = None, limite: int = 100) -> List[LeadImportacao]:
        """Busca leads pendentes de disparo"""
        query = self.db.query(LeadImportacao).filter_by(
            empresa_id=self.empresa_id,
            disparo_realizado=False,
            ignorar=False
        )

        if campanha_id:
            query = query.join(
                'arquivo_importacao'
            ).filter_by(campanha_id=campanha_id)

        # Ordenar por tentativas (menos tentativas primeiro)
        query = query.order_by(LeadImportacao.tentativas.asc())

        return query.limit(limite).all()

    async def disparar_para_lead(self, lead: LeadImportacao, mensagem: str, audio_path: Optional[str] = None) -> Dict:
        """Dispara mensagem para um lead específico"""

        inicio = datetime.now()
        log = LogDisparoMassa(
            empresa_id=self.empresa_id,
            lead_importacao_id=lead.id,
            whatsapp_destino=lead.whatsapp,
            mensagem_texto=mensagem,
            audio_path=audio_path,
            iniciado_em=inicio
        )

        try:
            # Verificar rate limit
            pode_enviar = self.rate_limiter.podeEnviar() if self.rate_limiter else {'pode': True}

            if not pode_enviar['pode']:
                log.sucesso = False
                log.erro = pode_enviar.get('motivo', 'Rate limit atingido')
                log.rate_limit_atingido = 'rate' in log.erro.lower()
                log.fora_horario = 'horário' in log.erro.lower()
                self.db.add(log)
                self.db.commit()
                return {'sucesso': False, 'erro': log.erro}

            # Modo assistido - pedir confirmação
            if self.config.modo_assistido and self.whatsapp:
                sucesso = await self.whatsapp.enviarAssistido(
                    lead.whatsapp,
                    mensagem,
                    audio_path
                )
            elif self.whatsapp:
                # Modo automático
                if audio_path and os.path.exists(audio_path):
                    sucesso = await self.whatsapp.enviarAudio(lead.whatsapp, audio_path)
                else:
                    sucesso = await self.whatsapp.enviarTexto(lead.whatsapp, mensagem)
            else:
                # Modo de simulação (sem WhatsApp)
                print(f"[SIMULACAO] Enviando para {lead.nome} ({lead.whatsapp})")
                print(f"   Mensagem: {mensagem[:50]}...")
                sucesso = True

            # Registrar no log
            log.sucesso = sucesso
            log.concluido_em = datetime.now()
            log.tempo_espera_segundos = (log.concluido_em - log.iniciado_em).seconds

            if sucesso and self.rate_limiter:
                self.rate_limiter.registrarEnvio()

            # Atualizar lead
            lead.disparo_realizado = True
            lead.data_disparo = datetime.now()
            lead.mensagem_enviada = mensagem
            lead.audio_enviado = audio_path
            lead.sucesso = sucesso
            lead.tentativas += 1

            if not sucesso:
                lead.erro_descricao = log.erro or "Erro desconhecido"

                # Agendar próxima tentativa se não excedeu limite
                if lead.tentativas < self.config.max_tentativas_por_lead:
                    lead.proxima_tentativa = datetime.now() + timedelta(hours=2)
                    lead.disparo_realizado = False  # Permitir nova tentativa

            self.db.add(log)
            self.db.commit()

            # Atualizar stats
            self.stats['total'] += 1
            if sucesso:
                self.stats['enviados'] += 1
            else:
                self.stats['erros'] += 1

            # Aplicar delay entre mensagens
            if sucesso and self.rate_limiter:
                await self.rate_limiter.aguardarDelay()

            return {
                'sucesso': sucesso,
                'lead_id': lead.id,
                'nome': lead.nome,
                'whatsapp': lead.whatsapp
            }

        except Exception as e:
            log.sucesso = False
            log.erro = str(e)
            log.concluido_em = datetime.now()

            lead.erro_descricao = str(e)
            lead.tentativas += 1

            self.db.add(log)
            self.db.commit()

            self.stats['erros'] += 1

            return {
                'sucesso': False,
                'erro': str(e),
                'lead_id': lead.id
            }

    def personalizar_mensagem(self, template: str, lead: LeadImportacao) -> str:
        """Personaliza mensagem com dados do lead"""
        mensagem = template

        # Variáveis padrão
        variaveis = {
            '{nome}': lead.nome or 'Cliente',
            '{empresa}': lead.empresa_lead or '',
            '{cidade}': lead.cidade or '',
            '{estado}': lead.estado or '',
            '{cargo}': lead.cargo or ''
        }

        # Adicionar variáveis extras do CSV
        if lead.dados_extras:
            for key, value in lead.dados_extras.items():
                variaveis[f'{{{key}}}'] = str(value)

        # Substituir variáveis
        for var, valor in variaveis.items():
            mensagem = mensagem.replace(var, valor)

        return mensagem

    async def executar_campanha(self, campanha_id: int, limite: Optional[int] = None):
        """Executa disparo de uma campanha completa"""

        campanha = self.db.query(Campanha).get(campanha_id)
        if not campanha:
            raise Exception(f"Campanha {campanha_id} não encontrada")

        print("\n" + "="*70)
        print(f"INICIANDO CAMPANHA: {campanha.nome}")
        print("="*70)

        # Buscar leads
        leads = self.buscar_leads_pendentes(campanha_id, limite)

        if not leads:
            print("[INFO] Nenhum lead pendente encontrado")
            return

        print(f"[INFO] {len(leads)} leads para processar\n")

        # Template da mensagem
        template = campanha.template.conteudo if campanha.template else self.config.template_padrao

        # Conectar WhatsApp se necessário
        if self.whatsapp and not self.config.whatsapp_conectado:
            await self.iniciar_whatsapp()

        # Processar cada lead
        for i, lead in enumerate(leads, 1):
            print(f"\n[{i}/{len(leads)}] Processando: {lead.nome} ({lead.whatsapp})")

            # Personalizar mensagem
            mensagem = self.personalizar_mensagem(template, lead)

            # Verificar se deve enviar áudio
            audio_path = None
            if self.config.sempre_enviar_audio and campanha.enviar_audio:
                # Gerar áudio (integração futura com ElevenLabs)
                audio_path = None  # TODO: Implementar geração de áudio

            # Disparar
            resultado = await self.disparar_para_lead(lead, mensagem, audio_path)

            if resultado['sucesso']:
                print(f"   [OK] Enviado com sucesso!")
            else:
                print(f"   [ERRO] Erro: {resultado.get('erro', 'Desconhecido')}")

            # Pausar em erro se configurado
            if not resultado['sucesso'] and self.config.pausar_em_erro:
                resposta = input("\n[AVISO] Erro detectado. Continuar? (s/n): ")
                if resposta.lower() != 's':
                    print("[INFO] Campanha pausada pelo usuario")
                    break

        # Atualizar métricas da campanha
        self._atualizar_metricas_campanha(campanha_id)

        print("\n" + "="*70)
        print("ESTATISTICAS FINAIS")
        print("="*70)
        print(f"Total processado: {self.stats['total']}")
        print(f"Enviados: {self.stats['enviados']}")
        print(f"Erros: {self.stats['erros']}")
        print(f"Tempo total: {(datetime.now() - self.stats['inicio']).seconds}s")
        print("="*70 + "\n")

    def _atualizar_metricas_campanha(self, campanha_id: int):
        """Atualiza métricas agregadas da campanha"""

        # Buscar ou criar métrica do dia
        hoje = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        metrica = self.db.query(MetricasDisparoMassa).filter_by(
            empresa_id=self.empresa_id,
            campanha_id=campanha_id,
            data=hoje
        ).first()

        if not metrica:
            metrica = MetricasDisparoMassa(
                empresa_id=self.empresa_id,
                campanha_id=campanha_id,
                data=hoje
            )
            self.db.add(metrica)

        # Contar logs do dia
        logs_hoje = self.db.query(LogDisparoMassa).filter(
            LogDisparoMassa.campanha_id == campanha_id,
            LogDisparoMassa.criado_em >= hoje
        ).all()

        metrica.total_disparos = len(logs_hoje)
        metrica.total_sucesso = sum(1 for log in logs_hoje if log.sucesso)
        metrica.total_erro = sum(1 for log in logs_hoje if not log.sucesso)
        metrica.vezes_rate_limit = sum(1 for log in logs_hoje if log.rate_limit_atingido)
        metrica.vezes_fora_horario = sum(1 for log in logs_hoje if log.fora_horario)

        # Calcular taxas
        metrica.calcular_metricas()

        self.db.commit()

    def mostrar_status(self):
        """Mostra status atual do sistema"""
        print("\n" + "="*70)
        print("STATUS DO SISTEMA DE DISPARO")
        print("="*70)
        print(f"Empresa ID: {self.empresa_id}")
        print(f"WhatsApp Conectado: {'SIM' if self.config.whatsapp_conectado else 'NAO'}")
        print(f"Modo: {'Assistido' if self.config.modo_assistido else 'Automatico'}")
        print(f"\nRate Limiter:")
        print(f"  Max/hora: {self.config.max_mensagens_por_hora}")
        print(f"  Delay: {self.config.delay_entre_mensagens_min}-{self.config.delay_entre_mensagens_max}s")
        print(f"  Horario: {self.config.horario_inicio}h-{self.config.horario_fim}h")
        print(f"  Fins de semana: {'SIM' if self.config.habilitar_fins_semana else 'NAO'}")

        # Leads pendentes
        pendentes = self.db.query(LeadImportacao).filter_by(
            empresa_id=self.empresa_id,
            disparo_realizado=False,
            ignorar=False
        ).count()

        print(f"\nLeads pendentes: {pendentes}")
        print("="*70 + "\n")


# CLI para testes
async def main():
    import sys
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    # Conectar banco
    engine = create_engine('sqlite:///vendeai.db')
    Session = sessionmaker(bind=engine)
    db = Session()

    # ID da empresa (pegar do argumento ou usar 1)
    empresa_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1

    servico = ServicoDisparoMassa(db, empresa_id)
    servico.mostrar_status()

    # Se tiver campanha ID, executar
    if len(sys.argv) > 2:
        campanha_id = int(sys.argv[2])
        await servico.executar_campanha(campanha_id)


if __name__ == '__main__':
    asyncio.run(main())
