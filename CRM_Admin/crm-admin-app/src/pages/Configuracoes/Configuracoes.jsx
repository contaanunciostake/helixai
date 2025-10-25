import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Settings, User, Bell, Shield, Database, Palette, Globe, Mail, Check } from 'lucide-react';

export function Configuracoes() {
  const [abaSelecionada, setAbaSelecionada] = useState('geral');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const abas = [
    { id: 'geral', nome: 'Geral', icone: Settings },
    { id: 'perfil', nome: 'Perfil', icone: User },
    { id: 'notificacoes', nome: 'Notificações', icone: Bell },
    { id: 'seguranca', nome: 'Segurança', icone: Shield },
    { id: 'integracao', nome: 'Integração', icone: Database },
    { id: 'aparencia', nome: 'Aparência', icone: Palette },
  ];

  const [configuracoes, setConfiguracoes] = useState({
    geral: [
      { id: 1, titulo: 'Nome da Empresa', descricao: 'Nome exibido no sistema', tipo: 'text', valor: 'Helix CRM' },
      { id: 2, titulo: 'CNPJ', descricao: 'Cadastro Nacional de Pessoa Jurídica', tipo: 'text', valor: '12.345.678/0001-90' },
      { id: 3, titulo: 'Timezone', descricao: 'Fuso horário padrão do sistema', tipo: 'select', valor: 'America/Sao_Paulo', opcoes: ['America/Sao_Paulo', 'America/New_York', 'Europe/London'] },
      { id: 4, titulo: 'Idioma', descricao: 'Idioma padrão da interface', tipo: 'select', valor: 'pt-BR', opcoes: ['pt-BR', 'en-US', 'es-ES'] },
      { id: 5, titulo: 'Moeda', descricao: 'Moeda padrão para transações', tipo: 'select', valor: 'BRL', opcoes: ['BRL', 'USD', 'EUR'] },
    ],
    perfil: [
      { id: 1, titulo: 'Nome Completo', descricao: 'Seu nome completo', tipo: 'text', valor: 'Administrador' },
      { id: 2, titulo: 'Email', descricao: 'Email para login e notificações', tipo: 'email', valor: 'admin@helixcrm.com' },
      { id: 3, titulo: 'Telefone', descricao: 'Telefone de contato', tipo: 'tel', valor: '(11) 98765-4321' },
      { id: 4, titulo: 'Cargo', descricao: 'Seu cargo na empresa', tipo: 'text', valor: 'Administrador do Sistema' },
      { id: 5, titulo: 'Avatar', descricao: 'Foto de perfil', tipo: 'file', valor: '' },
    ],
    notificacoes: [
      { id: 1, titulo: 'Notificações por Email', descricao: 'Receber notificações via email', tipo: 'toggle', valor: true },
      { id: 2, titulo: 'Notificações Push', descricao: 'Receber notificações no navegador', tipo: 'toggle', valor: true },
      { id: 3, titulo: 'Novos Leads', descricao: 'Alertar quando novos leads chegarem', tipo: 'toggle', valor: true },
      { id: 4, titulo: 'Propostas Aprovadas', descricao: 'Notificar aprovação de propostas', tipo: 'toggle', valor: true },
      { id: 5, titulo: 'Contratos Assinados', descricao: 'Notificar assinatura de contratos', tipo: 'toggle', valor: true },
      { id: 6, titulo: 'Resumo Diário', descricao: 'Receber resumo diário por email', tipo: 'toggle', valor: false },
    ],
    seguranca: [
      { id: 1, titulo: 'Autenticação em Dois Fatores', descricao: 'Adicionar camada extra de segurança', tipo: 'toggle', valor: false },
      { id: 2, titulo: 'Alterar Senha', descricao: 'Trocar senha de acesso', tipo: 'button', valor: 'Alterar' },
      { id: 3, titulo: 'Sessões Ativas', descricao: 'Gerenciar dispositivos conectados', tipo: 'button', valor: 'Ver Sessões' },
      { id: 4, titulo: 'Log de Atividades', descricao: 'Visualizar histórico de ações', tipo: 'button', valor: 'Ver Log' },
      { id: 5, titulo: 'Backup de Dados', descricao: 'Configurar backup automático', tipo: 'toggle', valor: true },
    ],
    integracao: [
      { id: 1, titulo: 'API Key', descricao: 'Chave de API para integrações', tipo: 'text', valor: 'hlx_*********************', readOnly: true },
      { id: 2, titulo: 'Webhook URL', descricao: 'URL para receber eventos', tipo: 'text', valor: 'https://api.helixcrm.com/webhook' },
      { id: 3, titulo: 'Rate Limit', descricao: 'Limite de requisições por minuto', tipo: 'number', valor: '1000' },
      { id: 4, titulo: 'CORS Origins', descricao: 'Domínios permitidos para CORS', tipo: 'text', valor: '*' },
      { id: 5, titulo: 'Regenerar API Key', descricao: 'Gerar nova chave de API', tipo: 'button', valor: 'Regenerar' },
    ],
    aparencia: [
      { id: 1, titulo: 'Tema', descricao: 'Modo claro ou escuro', tipo: 'select', valor: 'dark', opcoes: ['dark', 'light', 'auto'] },
      { id: 2, titulo: 'Cor Primária', descricao: 'Cor principal da interface', tipo: 'color', valor: '#3b82f6' },
      { id: 3, titulo: 'Densidade', descricao: 'Espaçamento entre elementos', tipo: 'select', valor: 'comfortable', opcoes: ['compact', 'comfortable', 'spacious'] },
      { id: 4, titulo: 'Fonte', descricao: 'Família de fontes', tipo: 'select', valor: 'Inter', opcoes: ['Inter', 'Roboto', 'Open Sans'] },
      { id: 5, titulo: 'Animações', descricao: 'Ativar animações da interface', tipo: 'toggle', valor: true },
    ],
  });

  const configuracoesDaAba = configuracoes[abaSelecionada] || [];

  const handleToggle = (configId) => {
    setConfiguracoes(prev => ({
      ...prev,
      [abaSelecionada]: prev[abaSelecionada].map(config =>
        config.id === configId && config.tipo === 'toggle'
          ? { ...config, valor: !config.valor }
          : config
      )
    }));
    setHasUnsavedChanges(true);
  };

  const handleInputChange = (configId, newValue) => {
    setConfiguracoes(prev => ({
      ...prev,
      [abaSelecionada]: prev[abaSelecionada].map(config =>
        config.id === configId
          ? { ...config, valor: newValue }
          : config
      )
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Aqui você faria a chamada para salvar no backend
    console.log('Salvando configurações:', configuracoes);

    setShowSaveConfirmation(true);
    setHasUnsavedChanges(false);

    // Esconder a mensagem após 3 segundos
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 3000);
  };

  const handleCancel = () => {
    // Recarregar a página ou resetar para valores originais
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Personalize e configure o sistema</p>
        </div>

        {/* Mensagem de Sucesso */}
        {showSaveConfirmation && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-green-400 font-medium">Configurações salvas com sucesso!</p>
              <p className="text-green-300 text-sm">Todas as alterações foram aplicadas ao sistema.</p>
            </div>
          </div>
        )}

        {/* Alerta de Mudanças Não Salvas */}
        {hasUnsavedChanges && !showSaveConfirmation && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-orange-400 font-medium">Você tem alterações não salvas</p>
              <p className="text-orange-300 text-sm">Não esqueça de salvar suas mudanças antes de sair.</p>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar de Abas */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-2">
              {abas.map((aba) => {
                const Icone = aba.icone;
                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaSelecionada(aba.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      abaSelecionada === aba.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:bg-[#0f1419] hover:text-white'
                    }`}
                  >
                    <Icone className="h-5 w-5" />
                    <span>{aba.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo das Configurações */}
          <div className="flex-1">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {abas.find(a => a.id === abaSelecionada)?.nome}
              </h2>

              <div className="space-y-6">
                {configuracoesDaAba.map((config) => (
                  <div key={config.id} className="pb-6 border-b border-[#2d3748] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium mb-1">{config.titulo}</h3>
                        <p className="text-sm text-gray-400">{config.descricao}</p>
                      </div>
                      {config.tipo === 'toggle' && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleToggle(config.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              config.valor ? 'bg-blue-500' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                config.valor ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {config.tipo === 'text' && (
                      <input
                        type="text"
                        value={config.valor}
                        onChange={(e) => handleInputChange(config.id, e.target.value)}
                        readOnly={config.readOnly}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-3"
                      />
                    )}

                    {config.tipo === 'email' && (
                      <input
                        type="email"
                        value={config.valor}
                        onChange={(e) => handleInputChange(config.id, e.target.value)}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-3"
                      />
                    )}

                    {config.tipo === 'tel' && (
                      <input
                        type="tel"
                        value={config.valor}
                        onChange={(e) => handleInputChange(config.id, e.target.value)}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-3"
                      />
                    )}

                    {config.tipo === 'number' && (
                      <input
                        type="number"
                        value={config.valor}
                        onChange={(e) => handleInputChange(config.id, e.target.value)}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-3"
                      />
                    )}

                    {config.tipo === 'select' && (
                      <select
                        value={config.valor}
                        onChange={(e) => handleInputChange(config.id, e.target.value)}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500 mt-3"
                      >
                        {config.opcoes?.map((opcao) => (
                          <option key={opcao} value={opcao}>
                            {opcao}
                          </option>
                        ))}
                      </select>
                    )}

                    {config.tipo === 'color' && (
                      <div className="flex gap-3 mt-3">
                        <input
                          type="color"
                          value={config.valor}
                          onChange={(e) => handleInputChange(config.id, e.target.value)}
                          className="h-10 w-20 bg-[#0f1419] border border-[#2d3748] rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.valor}
                          onChange={(e) => handleInputChange(config.id, e.target.value)}
                          className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {config.tipo === 'file' && (
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleInputChange(config.id, e.target.files[0].name);
                          }
                        }}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600 mt-3"
                      />
                    )}

                    {config.tipo === 'button' && (
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mt-3">
                        {config.valor}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#2d3748]">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] text-white rounded-lg hover:bg-[#1a2332] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    hasUnsavedChanges
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Configuracoes;
