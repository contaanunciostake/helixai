/**
 * Cliente de comunicação Bot <-> Backend Flask
 * Permite o bot salvar mensagens, leads e buscar configurações no banco
 */

const API_BASE = process.env.BACKEND_URL || 'http://localhost:5000/api';

/**
 * Busca configuração da empresa pelo número WhatsApp
 */
async function getEmpresaConfig(phoneNumber) {
    const url = `${API_BASE}/bot/config?phone=${phoneNumber}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Backend Flask não configurado ou empresa não existe (modo standalone)
            return null;
        }

        const data = await response.json();
        console.log('\n[DATABASE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`[DATABASE] ✅ Configuração recebida:`);
        console.log(`[DATABASE]    - Empresa ID: ${data.empresa_id || 'N/A'}`);
        console.log(`[DATABASE]    - Empresa Nome: ${data.empresa_nome || 'N/A'}`);
        console.log(`[DATABASE]    - Bot Ativo: ${data.config?.auto_resposta_ativa || 'N/A'}`);
        console.log('[DATABASE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return data;
    } catch (error) {
        // Backend Flask não disponível (modo standalone)
        return null;
    }
}

/**
 * Salva mensagem no banco de dados
 */
async function salvarMensagem(empresaId, conversaId, mensagemData) {
    const url = `${API_BASE}/bot/mensagens`;
    const payload = {
        empresa_id: empresaId,
        conversa_id: conversaId,
        ...mensagemData
    };

    console.log(`[DATABASE] 💾 Salvando mensagem...`);
    console.log(`[DATABASE]    URL: ${url}`);
    console.log(`[DATABASE]    Empresa ID: ${empresaId}`);
    console.log(`[DATABASE]    Conversa ID: ${conversaId}`);
    console.log(`[DATABASE]    Tipo: ${mensagemData.tipo || 'texto'}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`[DATABASE]    Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[DATABASE]    ❌ Erro: ${errorText}`);
            throw new Error(`Erro ao salvar mensagem: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[DATABASE]    ✅ Mensagem salva com sucesso!`);
        return data;
    } catch (error) {
        console.error(`[DATABASE] ❌ Erro ao salvar mensagem:`, error.message);
        return null;
    }
}

/**
 * Cria ou atualiza conversa
 */
async function salvarConversa(empresaId, telefone, conversaData) {
    try {
        const response = await fetch(`${API_BASE}/bot/conversas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa_id: empresaId,
                telefone,
                ...conversaData
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar conversa: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[DATABASE] Erro ao salvar conversa:', error);
        return null;
    }
}

/**
 * Cria ou atualiza lead
 */
async function salvarLead(empresaId, leadData) {
    try {
        const response = await fetch(`${API_BASE}/bot/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa_id: empresaId,
                ...leadData
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar lead: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[DATABASE] Erro ao salvar lead:', error);
        return null;
    }
}

/**
 * Atualiza status da empresa (WhatsApp conectado)
 */
async function atualizarStatusWhatsApp(empresaId, conectado) {
    try {
        const response = await fetch(`${API_BASE}/bot/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa_id: empresaId,
                whatsapp_conectado: conectado
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[DATABASE] Erro ao atualizar status:', error);
        return null;
    }
}

/**
 * Busca leads para disparo em massa
 */
async function buscarLeadsParaDisparo(empresaId, campanhaId) {
    try {
        const response = await fetch(`${API_BASE}/bot/leads/disparo?empresa_id=${empresaId}&campanha_id=${campanhaId}`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar leads: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[DATABASE] Erro ao buscar leads para disparo:', error);
        return [];
    }
}

/**
 * Registra disparo realizado
 */
async function registrarDisparo(empresaId, disparoData) {
    try {
        const response = await fetch(`${API_BASE}/bot/disparos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa_id: empresaId,
                ...disparoData
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar disparo: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[DATABASE] Erro ao registrar disparo:', error);
        return null;
    }
}

export {
    getEmpresaConfig,
    salvarMensagem,
    salvarConversa,
    salvarLead,
    atualizarStatusWhatsApp,
    buscarLeadsParaDisparo,
    registrarDisparo
};
