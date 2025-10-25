"""
VendeAI - Modelos de Banco de Dados Unificado
Sistema integrado de automação WhatsApp com IA
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import enum
import json

Base = declarative_base()


# ==================== ENUMS ====================

class TipoUsuario(enum.Enum):
    """Tipos de usuário do sistema"""
    SUPER_ADMIN = "super_admin"      # Admin do sistema VendeAI
    ADMIN_EMPRESA = "admin_empresa"  # Admin da empresa cliente
    USUARIO = "usuario"              # Usuário comum da empresa
    VISUALIZADOR = "visualizador"    # Apenas visualização


class PlanoAssinatura(enum.Enum):
    """Planos de assinatura"""
    GRATUITO = "gratuito"       # Plano free (limitado)
    BASICO = "basico"           # R$ 97/mês
    PROFISSIONAL = "profissional"  # R$ 197/mês
    ENTERPRISE = "enterprise"   # R$ 497/mês


class StatusLead(enum.Enum):
    """Status do lead no funil de vendas"""
    NOVO = "novo"
    CONTATO_INICIAL = "contato_inicial"
    QUALIFICADO = "qualificado"
    PROPOSTA = "proposta"
    NEGOCIACAO = "negociacao"
    GANHO = "ganho"
    PERDIDO = "perdido"
    FRIO = "frio"


class TemperaturaLead(enum.Enum):
    """Temperatura do lead"""
    QUENTE = "quente"     # Respondeu e demonstrou interesse
    MORNO = "morno"       # Respondeu mas sem decisão
    FRIO = "frio"         # Não respondeu ou desinteressado


class TipoMensagem(enum.Enum):
    """Tipo de mensagem no WhatsApp"""
    TEXTO = "texto"
    AUDIO = "audio"
    IMAGEM = "imagem"
    VIDEO = "video"
    DOCUMENTO = "documento"
    LOCALIZACAO = "localizacao"
    CONTATO = "contato"
    STICKER = "sticker"


class StatusCampanha(enum.Enum):
    """Status da campanha"""
    RASCUNHO = "rascunho"
    AGENDADA = "agendada"
    EM_ANDAMENTO = "em_andamento"
    PAUSADA = "pausada"
    CONCLUIDA = "concluida"
    CANCELADA = "cancelada"


class StatusDisparo(enum.Enum):
    """Status do disparo individual"""
    PENDENTE = "pendente"
    ENVIANDO = "enviando"
    ENVIADO = "enviado"
    ERRO = "erro"
    RESPONDIDO = "respondido"


# ==================== MODELOS ====================

class Usuario(UserMixin, Base):
    """Usuários do sistema (todos os tipos)"""
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True)
    nome = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    senha_hash = Column(String(256), nullable=False)
    tipo = Column(SQLEnum(TipoUsuario), default=TipoUsuario.USUARIO)
    ativo = Column(Boolean, default=True)

    # Relacionamento com empresa
    empresa_id = Column(Integer, ForeignKey('empresas.id'))

    # Metadados
    telefone = Column(String(20))
    avatar_url = Column(String(500))
    criado_em = Column(DateTime, default=datetime.utcnow)
    ultimo_acesso = Column(DateTime)
    timezone = Column(String(50), default='America/Sao_Paulo')

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="usuarios")
    logs = relationship("LogSistema", back_populates="usuario")

    def set_senha(self, senha):
        """Define senha com hash"""
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        """Verifica senha"""
        return check_password_hash(self.senha_hash, senha)

    # Métodos requeridos pelo Flask-Login
    @property
    def is_active(self):
        return self.ativo

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f'<Usuario {self.email}>'


class Empresa(Base):
    """Empresas/Clientes do sistema"""
    __tablename__ = 'empresas'

    id = Column(Integer, primary_key=True)
    nome = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200))
    cnpj = Column(String(18), unique=True)
    telefone = Column(String(20))
    email = Column(String(200))
    website = Column(String(200))

    # WhatsApp
    whatsapp_numero = Column(String(20))  # Número conectado
    whatsapp_conectado = Column(Boolean, default=False)
    whatsapp_qr_code = Column(Text)  # QR Code para conexão
    bot_ativo = Column(Boolean, default=False)

    # Assinatura
    plano = Column(SQLEnum(PlanoAssinatura), default=PlanoAssinatura.GRATUITO)
    plano_ativo = Column(Boolean, default=True)
    data_inicio_plano = Column(DateTime, default=datetime.utcnow)
    data_fim_plano = Column(DateTime)

    # Limites do plano
    limite_leads = Column(Integer, default=100)
    limite_disparos_mes = Column(Integer, default=500)
    limite_usuarios = Column(Integer, default=3)

    # Endereço
    endereco = Column(String(500))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(9))

    # Metadados
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    usuarios = relationship("Usuario", back_populates="empresa")
    configuracao = relationship("ConfiguracaoBot", back_populates="empresa", uselist=False)
    leads = relationship("Lead", back_populates="empresa")
    conversas = relationship("Conversa", back_populates="empresa")
    campanhas = relationship("Campanha", back_populates="empresa")
    templates = relationship("TemplateMensagem", back_populates="empresa")
    integrações = relationship("Integracao", back_populates="empresa")
    produtos = relationship("Produto", back_populates="empresa")
    arquivos_importacao = relationship("ArquivoImportacao", back_populates="empresa")

    def __repr__(self):
        return f'<Empresa {self.nome}>'


class ConfiguracaoBot(Base):
    """Configurações do bot personalizadas por empresa"""
    __tablename__ = 'configuracoes_bot'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), unique=True)

    # Informações do negócio (fornecidas pelo usuário via dashboard)
    descricao_empresa = Column(Text)
    produtos_servicos = Column(Text)
    publico_alvo = Column(Text)
    diferenciais = Column(Text)
    horario_atendimento = Column(String(200))

    # Configurações de IA (geradas ou customizadas)
    prompt_sistema = Column(Text)  # Prompt GPT personalizado
    tom_conversa = Column(String(100))  # formal, casual, técnico
    mensagem_boas_vindas = Column(Text)
    mensagem_ausencia = Column(Text)
    mensagem_encerramento = Column(Text)
    palavras_chave_interesse = Column(Text)  # JSON array

    # Comportamento do bot
    auto_resposta_ativa = Column(Boolean, default=True)
    enviar_audio = Column(Boolean, default=True)
    usar_elevenlabs = Column(Boolean, default=True)
    tempo_resposta_segundos = Column(Integer, default=5)
    max_tentativas_contato = Column(Integer, default=3)
    intervalo_entre_mensagens = Column(Integer, default=10)  # segundos

    # Integrações de IA
    openai_api_key = Column(String(200))
    openai_model = Column(String(50), default='gpt-4-turbo')
    groq_api_key = Column(String(200))
    elevenlabs_api_key = Column(String(200))
    elevenlabs_voice_id = Column(String(100))
    elevenlabs_agent_id = Column(String(100))  # Para webhooks

    # Features específicas (ex: para concessionária)
    modulo_fipe_ativo = Column(Boolean, default=False)
    modulo_financiamento_ativo = Column(Boolean, default=False)
    modulo_agendamento_ativo = Column(Boolean, default=False)

    # Dados customizados (JSON flexível para módulos específicos)
    configuracao_customizada = Column(JSON)

    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="configuracao")

    def __repr__(self):
        return f'<ConfiguracaoBot Empresa:{self.empresa_id}>'


class Lead(Base):
    """Leads capturados pelo sistema"""
    __tablename__ = 'leads'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    # Dados do lead
    nome = Column(String(200))
    telefone = Column(String(20), nullable=False, index=True)
    email = Column(String(200))
    empresa_lead = Column(String(200))  # Nome da empresa do lead
    cargo = Column(String(100))

    # Classificação
    status = Column(SQLEnum(StatusLead), default=StatusLead.NOVO, index=True)
    temperatura = Column(SQLEnum(TemperaturaLead), default=TemperaturaLead.FRIO)
    pontuacao = Column(Integer, default=0)  # Score 0-100

    # Origem e interesse
    origem = Column(String(100))  # whatsapp, site, indicacao, campanha
    campanha_id = Column(Integer, ForeignKey('campanhas.id'))
    interesse = Column(Text)
    necessidade = Column(Text)
    observacoes = Column(Text)
    tags = Column(Text)  # JSON array

    # Dados específicos (flexível para cada tipo de negócio)
    dados_customizados = Column(JSON)  # Ex: veículo de interesse, valor max, etc

    # Controle
    criado_em = Column(DateTime, default=datetime.utcnow, index=True)
    ultima_interacao = Column(DateTime, default=datetime.utcnow)
    proxima_acao = Column(DateTime)  # Quando fazer remarketing
    vendido = Column(Boolean, default=False)
    data_venda = Column(DateTime)
    valor_venda = Column(Float)

    # Relacionado a
    usuario_responsavel_id = Column(Integer, ForeignKey('usuarios.id'))

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="leads")
    campanha = relationship("Campanha", back_populates="leads")
    conversas = relationship("Conversa", back_populates="lead")
    interacoes = relationship("InteracaoLead", back_populates="lead")

    def __repr__(self):
        return f'<Lead {self.nome} - {self.telefone}>'


class Conversa(Base):
    """Conversas do WhatsApp"""
    __tablename__ = 'conversas'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), index=True)

    telefone = Column(String(20), nullable=False, index=True)
    nome_contato = Column(String(200))
    ativa = Column(Boolean, default=True)
    bot_ativo = Column(Boolean, default=True)  # Se bot está respondendo

    # Contexto da conversa (para IA)
    contexto = Column(JSON)  # Histórico resumido, intenções detectadas
    intencao_atual = Column(String(100))  # Ex: interesse_compra, duvida, negociacao

    # Métricas
    total_mensagens = Column(Integer, default=0)
    mensagens_enviadas = Column(Integer, default=0)
    mensagens_recebidas = Column(Integer, default=0)
    tempo_resposta_medio = Column(Float)  # Em segundos

    # Timestamps
    iniciada_em = Column(DateTime, default=datetime.utcnow)
    ultima_mensagem = Column(DateTime, default=datetime.utcnow, index=True)
    finalizada_em = Column(DateTime)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="conversas")
    lead = relationship("Lead", back_populates="conversas")
    mensagens = relationship("Mensagem", back_populates="conversa", order_by="Mensagem.enviada_em")

    def __repr__(self):
        return f'<Conversa {self.telefone}>'


class Mensagem(Base):
    """Mensagens individuais de uma conversa"""
    __tablename__ = 'mensagens'

    id = Column(Integer, primary_key=True)
    conversa_id = Column(Integer, ForeignKey('conversas.id'), index=True)

    tipo = Column(SQLEnum(TipoMensagem), default=TipoMensagem.TEXTO)
    conteudo = Column(Text)
    arquivo_url = Column(String(500))  # URL do arquivo (áudio, imagem, etc)
    arquivo_mimetype = Column(String(100))

    enviada_por_bot = Column(Boolean, default=False)
    enviada_em = Column(DateTime, default=datetime.utcnow, index=True)
    lida = Column(Boolean, default=False)
    lida_em = Column(DateTime)

    # Metadados WhatsApp
    whatsapp_id = Column(String(100), unique=True)  # ID da mensagem no WhatsApp
    respondendo_id = Column(Integer, ForeignKey('mensagens.id'))  # Se é resposta

    # IA / Analytics
    intencao_detectada = Column(String(100))  # Ex: duvida, interesse, objecao
    sentimento = Column(String(50))  # positivo, neutro, negativo
    palavras_chave = Column(Text)  # JSON array

    # Relacionamentos
    conversa = relationship("Conversa", back_populates="mensagens")
    resposta_de = relationship("Mensagem", remote_side=[id])

    def __repr__(self):
        return f'<Mensagem {self.id} - {self.tipo.value}>'


class Campanha(Base):
    """Campanhas de disparo em massa"""
    __tablename__ = 'campanhas'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    nome = Column(String(200), nullable=False)
    descricao = Column(Text)
    status = Column(SQLEnum(StatusCampanha), default=StatusCampanha.RASCUNHO)

    # Segmentação
    temperatura_alvo = Column(String(50))  # quente, morno, frio, todos
    tags_alvo = Column(Text)  # JSON array
    dias_sem_contato = Column(Integer)
    filtro_customizado = Column(JSON)  # Filtros flexíveis

    # Mensagem
    template_id = Column(Integer, ForeignKey('templates_mensagem.id'))
    enviar_audio = Column(Boolean, default=False)

    # Agendamento
    agendada_para = Column(DateTime)
    hora_envio = Column(String(5))  # HH:MM
    dias_semana = Column(String(50))  # 1,2,3,4,5 (seg-sex)
    fuso_horario = Column(String(50), default='America/Sao_Paulo')

    # Métricas
    total_destinatarios = Column(Integer, default=0)
    total_enviados = Column(Integer, default=0)
    total_erros = Column(Integer, default=0)
    total_respostas = Column(Integer, default=0)
    total_conversoes = Column(Integer, default=0)
    taxa_abertura = Column(Float, default=0.0)
    taxa_resposta = Column(Float, default=0.0)
    taxa_conversao = Column(Float, default=0.0)

    # Controle
    criada_em = Column(DateTime, default=datetime.utcnow)
    iniciada_em = Column(DateTime)
    concluida_em = Column(DateTime)
    criada_por_id = Column(Integer, ForeignKey('usuarios.id'))

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="campanhas")
    template = relationship("TemplateMensagem", back_populates="campanhas")
    disparos = relationship("Disparo", back_populates="campanha")
    leads = relationship("Lead", back_populates="campanha")

    def __repr__(self):
        return f'<Campanha {self.nome}>'


class TemplateMensagem(Base):
    """Templates de mensagens reutilizáveis"""
    __tablename__ = 'templates_mensagem'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    nome = Column(String(200), nullable=False)
    descricao = Column(Text)
    conteudo = Column(Text, nullable=False)

    # Variáveis dinâmicas disponíveis
    # Ex: {nome}, {empresa}, {produto}, {preco}
    variaveis = Column(Text)  # JSON array

    # Tipo
    tipo = Column(String(50))  # boas_vindas, remarketing, proposta, etc
    ativo = Column(Boolean, default=True)

    # Métricas de uso
    total_usos = Column(Integer, default=0)
    taxa_resposta_media = Column(Float, default=0.0)

    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="templates")
    campanhas = relationship("Campanha", back_populates="template")

    def __repr__(self):
        return f'<Template {self.nome}>'


class Disparo(Base):
    """Log individual de cada disparo de campanha"""
    __tablename__ = 'disparos'

    id = Column(Integer, primary_key=True)
    campanha_id = Column(Integer, ForeignKey('campanhas.id'), index=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), index=True)

    telefone = Column(String(20), nullable=False)
    mensagem_enviada = Column(Text)
    status = Column(SQLEnum(StatusDisparo), default=StatusDisparo.PENDENTE, index=True)

    # Timestamps
    agendado_para = Column(DateTime)
    enviado_em = Column(DateTime)
    lido_em = Column(DateTime)
    respondido_em = Column(DateTime)

    # Erro (se houver)
    erro_descricao = Column(Text)
    tentativas = Column(Integer, default=0)

    # Relacionamentos
    campanha = relationship("Campanha", back_populates="disparos")

    def __repr__(self):
        return f'<Disparo {self.telefone} - {self.status.value}>'


class InteracaoLead(Base):
    """Registro de interações com leads (remarketing, follow-up)"""
    __tablename__ = 'interacoes_lead'

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey('leads.id'), index=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

    tipo = Column(String(100))  # remarketing, follow_up, proposta, ligacao
    descricao = Column(Text)
    resultado = Column(String(100))  # sucesso, sem_resposta, interessado, etc

    # Dados da interação
    canal = Column(String(50))  # whatsapp, telefone, email
    duracao_segundos = Column(Integer)
    proxima_acao = Column(DateTime)

    criada_em = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    lead = relationship("Lead", back_populates="interacoes")

    def __repr__(self):
        return f'<InteracaoLead {self.tipo} - Lead:{self.lead_id}>'


class Integracao(Base):
    """Integrações externas configuradas"""
    __tablename__ = 'integracoes'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    nome = Column(String(100), nullable=False)  # openai, elevenlabs, zapier, etc
    tipo = Column(String(50))  # ia, audio, crm, pagamento
    ativa = Column(Boolean, default=True)

    # Credenciais (criptografadas)
    api_key = Column(String(500))
    api_secret = Column(String(500))
    configuracao = Column(JSON)  # Configs específicas da integração

    # Webhooks
    webhook_url = Column(String(500))
    webhook_secret = Column(String(200))

    # Métricas de uso
    total_chamadas = Column(Integer, default=0)
    ultima_chamada = Column(DateTime)

    criada_em = Column(DateTime, default=datetime.utcnow)
    atualizada_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="integrações")

    def __repr__(self):
        return f'<Integracao {self.nome} - Empresa:{self.empresa_id}>'


class MetricaConversa(Base):
    """Métricas agregadas de conversas (analytics)"""
    __tablename__ = 'metricas_conversas'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    data = Column(DateTime, nullable=False, index=True)

    # Métricas diárias
    total_conversas_iniciadas = Column(Integer, default=0)
    total_conversas_finalizadas = Column(Integer, default=0)
    total_mensagens_enviadas = Column(Integer, default=0)
    total_mensagens_recebidas = Column(Integer, default=0)

    # Performance do bot
    tempo_resposta_medio = Column(Float, default=0.0)
    taxa_resolucao_bot = Column(Float, default=0.0)  # % resolvido sem humano
    satisfacao_media = Column(Float, default=0.0)

    # Conversão
    leads_gerados = Column(Integer, default=0)
    leads_qualificados = Column(Integer, default=0)
    vendas_realizadas = Column(Integer, default=0)
    receita_total = Column(Float, default=0.0)

    def __repr__(self):
        return f'<MetricaConversa {self.data} - Empresa:{self.empresa_id}>'


class LogSistema(Base):
    """Logs de atividades do sistema"""
    __tablename__ = 'logs_sistema'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), index=True)

    tipo = Column(String(50), index=True)  # login, config_alterada, bot_ativado
    acao = Column(String(200))
    descricao = Column(Text)

    # Detalhes técnicos
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    dados_adicionais = Column(JSON)

    criado_em = Column(DateTime, default=datetime.utcnow, index=True)

    # Relacionamentos
    usuario = relationship("Usuario", back_populates="logs")

    def __repr__(self):
        return f'<LogSistema {self.tipo}>'


class Produto(Base):
    """Produtos/Serviços da empresa para conhecimento do bot"""
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    # Dados do produto
    nome = Column(String(200), nullable=False)
    descricao = Column(Text)
    categoria = Column(String(100))
    subcategoria = Column(String(100))

    # Preços
    preco = Column(Float)
    preco_promocional = Column(Float)
    moeda = Column(String(3), default='BRL')

    # Estoque e disponibilidade
    estoque = Column(Integer)
    disponivel = Column(Boolean, default=True)

    # Informações adicionais
    sku = Column(String(100))
    codigo_barras = Column(String(100))
    marca = Column(String(100))
    peso = Column(Float)  # em kg
    dimensoes = Column(String(100))  # formato: LxAxP em cm

    # Metadados para o bot
    palavras_chave = Column(Text)  # JSON array - palavras relacionadas ao produto
    tags = Column(Text)  # JSON array - tags de busca
    link = Column(String(500))  # Link do produto
    imagem_url = Column(String(500))  # URL da imagem principal

    # Informações extras (JSON flexível)
    dados_extras = Column(JSON)  # Ex: cores, tamanhos, especificações técnicas

    # Controle
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    importado_csv = Column(Boolean, default=False)  # Se veio de importação CSV

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="produtos")

    def __repr__(self):
        return f'<Produto {self.nome} - R$ {self.preco}>'


class ArquivoImportacao(Base):
    """Log de arquivos CSV importados"""
    __tablename__ = 'arquivos_importacao'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    # Dados do arquivo
    nome_arquivo = Column(String(200), nullable=False)
    tipo = Column(String(50), default='produtos')  # produtos, leads, contatos
    caminho = Column(String(500))  # Caminho onde foi salvo

    # Métricas da importação
    total_linhas = Column(Integer, default=0)
    importados_sucesso = Column(Integer, default=0)
    importados_erro = Column(Integer, default=0)
    erros_detalhes = Column(JSON)  # Lista de erros encontrados

    # Status
    status = Column(String(50), default='processando')  # processando, concluido, erro

    # Controle
    importado_por_id = Column(Integer, ForeignKey('usuarios.id'))
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="arquivos_importacao")

    def __repr__(self):
        return f'<ArquivoImportacao {self.nome_arquivo} - {self.status}>'


class Veiculo(Base):
    """Veículos para venda (integração com sistema de carros)"""
    __tablename__ = 'veiculos'

    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'), index=True)

    # Dados do veículo
    marca = Column(String(100))
    modelo = Column(String(200))
    versao = Column(String(200))
    ano_modelo = Column(String(4))
    ano_fabricacao = Column(String(4))

    # Preços
    preco = Column(Float)
    preco_anterior = Column(Float)  # Para promoções
    aceita_troca = Column(Boolean, default=True)
    financiamento_disponivel = Column(Boolean, default=True)

    # Características técnicas
    quilometragem = Column(String(20))
    cor = Column(String(50))
    combustivel = Column(String(50))  # flex, gasolina, diesel, eletrico
    cambio = Column(String(50))  # manual, automatico, automatizado
    motor = Column(String(50))  # 1.0, 1.6, 2.0, etc
    portas = Column(Integer)
    final_placa = Column(String(1))

    # Opcionais/Acessórios (JSON array)
    opcionais = Column(JSON)  # ar, direção, vidros, travas, etc

    # Imagens
    imagem_principal = Column(String(500))
    imagens_galeria = Column(JSON)  # Array de URLs

    # Descrição e observações
    descricao = Column(Text)
    observacoes = Column(Text)

    # Controle e status
    disponivel = Column(Boolean, default=True, index=True)
    destaque = Column(Boolean, default=False)  # is_featured
    oferta_especial = Column(Boolean, default=False)  # is_special_offer
    vendido = Column(Boolean, default=False)
    data_venda = Column(DateTime)

    # FIPE
    codigo_fipe = Column(String(20))
    valor_fipe = Column(Float)
    porcentagem_fipe = Column(Float)  # % do valor FIPE

    # Localização
    cidade = Column(String(100))
    estado = Column(String(2))
    loja = Column(String(200))  # Nome da loja/vendedor

    # Metadados
    codigo_interno = Column(String(50))  # Código interno da loja
    sku = Column(String(50))
    slug = Column(String(200))  # URL amigável

    # Timestamps
    criado_em = Column(DateTime, default=datetime.utcnow, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    publicado_em = Column(DateTime)

    # Relacionamento com empresa
    empresa = relationship("Empresa")

    def __repr__(self):
        return f'<Veiculo {self.marca} {self.modelo} {self.ano_modelo} - R$ {self.preco}>'

    def to_dict(self):
        """Converte para dicionário (útil para API)"""
        return {
            'id': self.id,
            'marca': self.marca,
            'modelo': self.modelo,
            'versao': self.versao,
            'ano': self.ano_modelo,
            'preco': self.preco,
            'preco_anterior': self.preco_anterior,
            'quilometragem': self.quilometragem,
            'cor': self.cor,
            'combustivel': self.combustivel,
            'cambio': self.cambio,
            'imagem': self.imagem_principal,
            'disponivel': self.disponivel,
            'destaque': self.destaque,
            'descricao': self.descricao
        }


# ==================== DATABASE MANAGER ====================

class DatabaseManager:
    """Gerenciador de banco de dados unificado"""

    def __init__(self, connection_string='sqlite:///vendeai.db'):
        self.engine = create_engine(connection_string, echo=False)
        self.Session = sessionmaker(bind=self.engine)

    def create_all(self):
        """Cria todas as tabelas"""
        Base.metadata.create_all(self.engine)
        print("[OK] Todas as tabelas criadas com sucesso!")

    def drop_all(self):
        """Remove todas as tabelas (CUIDADO!)"""
        Base.metadata.drop_all(self.engine)
        print("[WARNING] Todas as tabelas foram removidas!")

    def get_session(self):
        """Retorna uma nova sessão"""
        return self.Session()

    def criar_super_admin(self):
        """Cria super admin do sistema"""
        session = self.get_session()

        try:
            # Verificar se já existe
            admin = session.query(Usuario).filter_by(email='admin@vendeai.com').first()

            if not admin:
                # Criar empresa VendeAI
                empresa = Empresa(
                    nome='VendeAI Sistema',
                    plano=PlanoAssinatura.ENTERPRISE,
                    plano_ativo=True
                )
                session.add(empresa)
                session.commit()

                # Criar super admin
                admin = Usuario(
                    nome='Administrador VendeAI',
                    email='admin@vendeai.com',
                    tipo=TipoUsuario.SUPER_ADMIN,
                    empresa_id=empresa.id
                )
                admin.set_senha('admin123')
                session.add(admin)
                session.commit()

                print(f"[OK] Super Admin criado!")
                print(f"    Email: admin@vendeai.com")
                print(f"    Senha: admin123")

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Ao criar super admin: {e}")
        finally:
            session.close()

    def criar_empresa_demo(self):
        """Cria empresa demo para testes"""
        session = self.get_session()

        try:
            empresa = session.query(Empresa).filter_by(email='demo@vendeai.com').first()

            if not empresa:
                empresa = Empresa(
                    nome='Empresa Demonstração',
                    nome_fantasia='Demo Company',
                    email='demo@vendeai.com',
                    telefone='11999999999',
                    plano=PlanoAssinatura.PROFISSIONAL,
                    plano_ativo=True
                )
                session.add(empresa)
                session.commit()

                # Criar usuário demo
                usuario = Usuario(
                    nome='Usuário Demo',
                    email='demo@vendeai.com',
                    tipo=TipoUsuario.ADMIN_EMPRESA,
                    empresa_id=empresa.id
                )
                usuario.set_senha('demo123')
                session.add(usuario)

                # Criar configuração padrão
                config = ConfiguracaoBot(
                    empresa_id=empresa.id,
                    descricao_empresa='Empresa de demonstração do VendeAI',
                    mensagem_boas_vindas='Olá! Bem-vindo ao nosso atendimento automatizado.',
                    auto_resposta_ativa=True
                )
                session.add(config)

                session.commit()

                print(f"[OK] Empresa Demo criada!")
                print(f"    Email: demo@vendeai.com")
                print(f"    Senha: demo123")

        except Exception as e:
            session.rollback()
            print(f"[ERRO] Ao criar empresa demo: {e}")
        finally:
            session.close()


if __name__ == '__main__':
    # Criar banco de dados
    db = DatabaseManager()
    db.create_all()
    db.criar_super_admin()
    db.criar_empresa_demo()

    print("\n" + "="*70)
    print("BANCO DE DADOS VENDEAI CRIADO COM SUCESSO!")
    print("="*70)
    print("\nTodas as tabelas foram criadas e populadas com dados iniciais.")
    print("\n" + "="*70)
