/**
 * IA Factory - Fábrica de Módulos IA
 * Retorna o módulo de IA correto baseado no tipo de negócio
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

import { IAMaster } from './00-ia-master.js';

// Importação dinâmica para módulos CommonJS
let TintasMaster = null;

// Tentar importar o módulo de tintas
try {
    const tintasModule = await import('./tintas/00-tintas-master.js');
    TintasMaster = tintasModule.default || tintasModule.TintasMaster;
    console.log('[IA-FACTORY] Módulo de Tintas carregado');
} catch (e) {
    console.log('[IA-FACTORY] Módulo de Tintas não disponível:', e.message);
}

/**
 * Classe Factory para criar instâncias de IA
 */
class IAFactory {
    /**
     * Cria instância do módulo IA apropriado
     * @param {string} tipoNegocio - Tipo de negócio (veiculos, autopecas, loja_tintas)
     * @param {object} config - Configurações (API keys, empresa, etc)
     * @returns {object} - Instância do módulo IA
     */
    static criar(tipoNegocio, config) {
        console.log(`[IA-FACTORY] Criando IA para tipo: ${tipoNegocio || 'veiculos (padrão)'}`);

        const tipo = (tipoNegocio || 'veiculos').toLowerCase();

        switch (tipo) {
            case 'loja_tintas':
            case 'tintas':
                if (!TintasMaster) {
                    console.warn('[IA-FACTORY] TintasMaster não disponível, usando IAMaster padrão');
                    return new IAMaster(config.apiKey, config.groqKey, config.db);
                }
                console.log('[IA-FACTORY] ✅ Usando TintasMaster');
                return new TintasMaster({
                    empresaId: config.empresaId,
                    nomeAtendente: config.nomeAtendente || 'Laura',
                    nomeLoja: config.nomeLoja,
                    backendUrl: config.backendUrl || process.env.BACKEND_URL || 'http://localhost:5000',
                    freteGratisAcima: config.freteGratisAcima || 500,
                    margemSeguranca: config.margemSeguranca || 1.1,
                    descontoMaximo: config.descontoMaximo || 15,
                    prazoEntrega: config.prazoEntrega || '1-2 dias úteis',
                    tomConversa: config.tomConversa || 'amigavel_profissional'
                });

            case 'veiculos':
            case 'autopecas':
            case 'automoveis':
            default:
                console.log('[IA-FACTORY] ✅ Usando IAMaster (Veículos)');
                return new IAMaster(config.apiKey, config.groqKey, config.db);
        }
    }

    /**
     * Verifica se um tipo de negócio é suportado
     * @param {string} tipoNegocio - Tipo de negócio
     * @returns {boolean}
     */
    static isSupported(tipoNegocio) {
        const tiposSuportados = ['veiculos', 'autopecas', 'automoveis', 'loja_tintas', 'tintas'];
        return tiposSuportados.includes((tipoNegocio || '').toLowerCase());
    }

    /**
     * Lista tipos de negócio suportados
     * @returns {array}
     */
    static getTiposSuportados() {
        return [
            { id: 'veiculos', nome: 'Veículos/Concessionária', modulo: 'IAMaster' },
            { id: 'autopecas', nome: 'Autopeças', modulo: 'IAMaster' },
            { id: 'loja_tintas', nome: 'Loja de Tintas', modulo: 'TintasMaster' }
        ];
    }
}

export { IAFactory };
export default IAFactory;
