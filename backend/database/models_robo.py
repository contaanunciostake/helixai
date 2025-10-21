"""
VendeAI - Modelos para Configuração do Robô Disparador
Extensão do models.py para funcionalidades de disparo em massa
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database.models import Base


class ConfiguracaoRoboDisparador(Base):
    """Configurações do robô disparador (Rate Limiter e WhatsApp)"""
    __tablename__ = 'configuracao_robo_disparador'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), unique=True)

    # Rate Limiter
    max_mensagens_por_hora = Column(Integer, default=15)
    delay_entre_mensagens_min = Column(Integer, default=300)  # segundos
    delay_entre_mensagens_max = Column(Integer, default=600)  # segundos

    # Horário Comercial
    horario_inicio = Column(Integer, default=9)  # 9h
    horario_fim = Column(Integer, default=18)  # 18h
    habilitar_fins_semana = Column(Boolean, default=False)

    # WhatsApp Session
    whatsapp_session_path = Column(String(500))
    whatsapp_conectado = Column(Boolean, default=False)
    whatsapp_qr_code = Column(Text)  # QR Code para scan
    ultimo_qr_gerado = Column(DateTime)

    # Modo de Operação
    modo_assistido = Column(Boolean, default=True)  # Se false, é automático (perigoso!)
    pausar_em_erro = Column(Boolean, default=True)
    max_tentativas_por_lead = Column(Integer, default=3)

    # Configurações de Áudio
    sempre_enviar_audio = Column(Boolean, default=True)
    audio_provider = Column(String(50), default='elevenlabs')  # elevenlabs, google, aws

    # Template de mensagens
    template_padrao = Column(Text)  # Template com variáveis {nome}, {empresa}, etc

    # Controle
    ativo = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<ConfigRobo Empresa:{self.empresa_id}>'


class LeadImportacao(Base):
    """Leads importados via CSV para disparo"""
    __tablename__ = 'leads_importacao'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)
    arquivo_importacao_id = Column(Integer, ForeignKey('arquivos_importacao.id'))

    # Dados do Lead
    nome = Column(String(200))
    whatsapp = Column(String(20), nullable=False, index=True)
    email = Column(String(200))
    empresa_lead = Column(String(200))
    cidade = Column(String(100))
    estado = Column(String(2))
    cargo = Column(String(100))

    # Dados personalizados (vindos do CSV)
    dados_extras = Column(JSON)  # Qualquer campo extra do CSV

    # Status do disparo
    disparo_realizado = Column(Boolean, default=False)
    data_disparo = Column(DateTime)
    mensagem_enviada = Column(Text)
    audio_enviado = Column(String(500))  # Path do áudio

    # Resultado
    sucesso = Column(Boolean, default=False)
    erro_descricao = Column(Text)
    respondeu = Column(Boolean, default=False)
    data_resposta = Column(DateTime)
    resposta_texto = Column(Text)

    # Controle
    tentativas = Column(Integer, default=0)
    proxima_tentativa = Column(DateTime)
    ignorar = Column(Boolean, default=False)  # Se usuário marcou para não enviar

    criado_em = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f'<LeadImportacao {self.nome} - {self.whatsapp}>'


class LogDisparoMassa(Base):
    """Log detalhado de cada disparo em massa"""
    __tablename__ = 'logs_disparo_massa'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)
    campanha_id = Column(Integer, ForeignKey('campanhas.id'), index=True)
    lead_importacao_id = Column(Integer, ForeignKey('leads_importacao.id'))

    # Detalhes do disparo
    whatsapp_destino = Column(String(20), nullable=False)
    mensagem_texto = Column(Text)
    audio_path = Column(String(500))

    # Timing
    iniciado_em = Column(DateTime, default=datetime.utcnow)
    concluido_em = Column(DateTime)
    tempo_espera_segundos = Column(Integer)  # Delay aplicado

    # Resultado
    sucesso = Column(Boolean, default=False)
    erro = Column(Text)
    rate_limit_atingido = Column(Boolean, default=False)
    fora_horario = Column(Boolean, default=False)

    # Resposta do WhatsApp
    whatsapp_message_id = Column(String(100))
    entregue = Column(Boolean, default=False)
    lido = Column(Boolean, default=False)

    criado_em = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f'<LogDisparoMassa {self.whatsapp_destino} - {"✓" if self.sucesso else "✗"}>'


class MetricasDisparoMassa(Base):
    """Métricas agregadas de disparos em massa (por dia)"""
    __tablename__ = 'metricas_disparo_massa'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)
    campanha_id = Column(Integer, ForeignKey('campanhas.id'), index=True)

    data = Column(DateTime, nullable=False, index=True)

    # Métricas do dia
    total_disparos = Column(Integer, default=0)
    total_sucesso = Column(Integer, default=0)
    total_erro = Column(Integer, default=0)
    total_pendentes = Column(Integer, default=0)

    # Taxa de sucesso
    taxa_sucesso = Column(Float, default=0.0)
    taxa_entrega = Column(Float, default=0.0)
    taxa_leitura = Column(Float, default=0.0)
    taxa_resposta = Column(Float, default=0.0)

    # Performance
    tempo_medio_envio = Column(Float, default=0.0)  # segundos
    mensagens_por_hora = Column(Float, default=0.0)

    # Rate Limit
    vezes_rate_limit = Column(Integer, default=0)
    vezes_fora_horario = Column(Integer, default=0)

    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def calcular_metricas(self):
        """Calcula taxas percentuais"""
        if self.total_disparos > 0:
            self.taxa_sucesso = (self.total_sucesso / self.total_disparos) * 100
        else:
            self.taxa_sucesso = 0.0

    def __repr__(self):
        return f'<MetricasDisparo {self.data} - {self.total_disparos} disparos>'
