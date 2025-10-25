"""
Database package
Exports all models and database manager
"""

from .models import (
    DatabaseManager,
    Base,
    Usuario,
    Empresa,
    Lead,
    Conversa,
    Mensagem,
    Campanha,
    Produto,
    ConfiguracaoBot,
    InteracaoLead,
    Disparo,
    ArquivoImportacao,
    Veiculo,
    TipoUsuario,
    TipoMensagem,
    PlanoAssinatura,
    TemperaturaLead,
    StatusLead,
    StatusDisparo
)

from .models_robo import (
    ConfiguracaoRoboDisparador,
    LeadImportacao,
    LogDisparoMassa,
    MetricasDisparoMassa
)

__all__ = [
    'DatabaseManager',
    'Base',
    'Usuario',
    'Empresa',
    'Lead',
    'Conversa',
    'Mensagem',
    'Campanha',
    'Produto',
    'ConfiguracaoBot',
    'InteracaoLead',
    'Disparo',
    'ArquivoImportacao',
    'Veiculo',
    'TipoUsuario',
    'TipoMensagem',
    'PlanoAssinatura',
    'TemperaturaLead',
    'StatusLead',
    'StatusDisparo',
    'ConfiguracaoRoboDisparador',
    'LeadImportacao',
    'LogDisparoMassa',
    'MetricasDisparoMassa'
]
