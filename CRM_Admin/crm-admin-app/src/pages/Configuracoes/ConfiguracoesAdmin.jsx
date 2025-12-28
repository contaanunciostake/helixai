import { useState, useEffect } from 'react';
import {
  Settings, Save, RefreshCw, DollarSign, Users, Clock,
  Percent, Shield, Bell, Globe, Database, Zap,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function ConfiguracoesAdmin() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Estado local para edicao
  const [afiliados, setAfiliados] = useState({
    comissao_primeira_venda: 30,
    comissao_recorrente: 20,
    prazo_cookie_dias: 30,
    minimo_saque: 50,
    programa_ativo: true
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getConfiguracoes();

      if (response.success) {
        setConfig(response.data);
        setAfiliados(response.data.afiliados);
      }
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateConfiguracoes({ afiliados });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configuracoes:', error);
      alert('Erro ao salvar configuracoes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Configuracoes</h2>
          <p className="text-gray-400">Configuracoes globais do sistema</p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              Salvo!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Alteracoes
          </button>
        </div>
      </div>

      {/* Programa de Afiliados */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          Programa de Afiliados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Comissao Primeira Venda (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={afiliados.comissao_primeira_venda}
                onChange={(e) => setAfiliados({ ...afiliados, comissao_primeira_venda: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Comissao paga na primeira venda de cada cliente indicado</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Comissao Recorrente (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={afiliados.comissao_recorrente}
                onChange={(e) => setAfiliados({ ...afiliados, comissao_recorrente: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Comissao paga nas renovacoes mensais</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Prazo do Cookie (dias)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="365"
                value={afiliados.prazo_cookie_dias}
                onChange={(e) => setAfiliados({ ...afiliados, prazo_cookie_dias: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Tempo de validade do link de indicacao</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Minimo para Saque (R$)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={afiliados.minimo_saque}
                onChange={(e) => setAfiliados({ ...afiliados, minimo_saque: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Valor minimo para solicitar saque</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Programa Ativo</p>
              <p className="text-xs text-gray-400">Permite novos cadastros de afiliados</p>
            </div>
            <button
              onClick={() => setAfiliados({ ...afiliados, programa_ativo: !afiliados.programa_ativo })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                afiliados.programa_ativo ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  afiliados.programa_ativo ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-purple-400" />
          Planos de Assinatura
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config?.planos && Object.entries(config.planos).map(([key, plano]) => (
            <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">{plano.nome}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  key === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                  key === 'profissional' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  R$ {plano.valor}/mes
                </span>
              </div>
              <div className="space-y-2 text-xs text-gray-400">
                <p>Leads: {plano.limite_leads === -1 ? 'Ilimitado' : plano.limite_leads}</p>
                <p>Usuarios: {plano.limite_usuarios === -1 ? 'Ilimitado' : plano.limite_usuarios}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Para alterar valores dos planos, edite o arquivo de configuracao do sistema.
        </p>
      </div>

      {/* Info do Sistema */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400" />
          Informacoes do Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-gray-400 mb-1">Versao</p>
            <p className="text-lg font-bold text-white">{config?.sistema?.versao || '1.0.0'}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-gray-400 mb-1">Ambiente</p>
            <p className="text-lg font-bold text-white capitalize">{config?.sistema?.ambiente || 'development'}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-xs text-gray-400 mb-1">Banco de Dados</p>
            <p className="text-lg font-bold text-white">{config?.sistema?.database || 'SQLite'}</p>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Atencao</p>
            <p className="text-sm text-gray-400 mt-1">
              Alteracoes nas configuracoes podem afetar o funcionamento do sistema.
              Certifique-se de testar em ambiente de desenvolvimento antes de aplicar em producao.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfiguracoesAdmin;
