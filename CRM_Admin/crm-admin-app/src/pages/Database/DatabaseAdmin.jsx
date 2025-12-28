import { useState, useEffect } from 'react';
import {
  Database, RefreshCw, HardDrive, Table2, Download,
  Upload, Trash2, Clock, CheckCircle, AlertCircle,
  Server, Cpu, Activity
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function DatabaseAdmin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarStats();
  }, []);

  const carregarStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDatabaseStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-white mb-1">Banco de Dados</h2>
          <p className="text-gray-400">Informacoes e estatisticas do banco</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarStats}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Status do Banco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Status</p>
              <p className="text-lg font-bold text-green-400">Online</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Server className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Tipo</p>
              <p className="text-lg font-bold text-blue-400">SQLite</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <HardDrive className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Total Registros</p>
              <p className="text-lg font-bold text-purple-400">
                {stats?.total_registros?.toLocaleString('pt-BR') || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelas */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Table2 className="h-5 w-5 text-purple-400" />
          Tabelas do Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.tabelas?.map((tabela) => (
            <div
              key={tabela.nome}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Database className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{tabela.nome}</p>
                  <p className="text-xs text-gray-400">{tabela.registros.toLocaleString('pt-BR')} registros</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-lg font-bold ${
                  tabela.registros > 1000 ? 'text-green-400' :
                  tabela.registros > 100 ? 'text-blue-400' :
                  tabela.registros > 0 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {tabela.registros}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acoes */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Acoes de Manutencao</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-left">
            <Download className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Backup</p>
              <p className="text-xs text-gray-400">Fazer backup do banco</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-colors text-left">
            <Upload className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Restaurar</p>
              <p className="text-xs text-gray-400">Restaurar backup</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors text-left">
            <Activity className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-white">Otimizar</p>
              <p className="text-xs text-gray-400">Otimizar tabelas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Informacoes do Sistema</p>
            <p className="text-sm text-gray-400 mt-1">
              O banco de dados esta configurado em modo SQLite para desenvolvimento local.
              Em producao, recomenda-se utilizar MySQL ou PostgreSQL para melhor desempenho.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseAdmin;
