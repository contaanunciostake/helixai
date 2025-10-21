/**
 * VendeAI - Robô Disparador Frontend
 * Sistema de controle do painel administrativo
 */

let currentFilter = 'todos';
let currentPage = 1;
let chartsInitialized = false;

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracoes();
    carregarMetricas();
    setupEventListeners();
    atualizarStats();
});

function setupEventListeners() {
    // Upload de CSV
    const uploadZone = document.getElementById('uploadZone');
    const csvFile = document.getElementById('csvFile');

    uploadZone.addEventListener('click', () => csvFile.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            csvFile.files = e.dataTransfer.files;
            uploadCSV();
        } else {
            alert('Por favor, selecione um arquivo CSV');
        }
    });

    csvFile.addEventListener('change', uploadCSV);

    // Form de configuração
    document.getElementById('configForm').addEventListener('submit', salvarConfiguracoes);
}

// ==================== TABS ====================

function showTab(tab) {
    // Esconder todas
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-custom').forEach(el => el.classList.remove('active'));

    // Mostrar selecionada
    document.getElementById(tab + '-tab').style.display = 'block';
    event.target.classList.add('active');

    // Carregar dados da tab
    if (tab === 'leads') {
        carregarLeads();
    } else if (tab === 'metricas') {
        if (!chartsInitialized) {
            inicializarCharts();
        }
    } else if (tab === 'logs') {
        atualizarLogs();
    }
}

// ==================== UPLOAD CSV ====================

async function uploadCSV() {
    const file = document.getElementById('csvFile').files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    const progress = document.getElementById('importProgress');
    const result = document.getElementById('importResult');

    progress.style.display = 'block';
    result.style.display = 'none';

    try {
        const response = await fetch('/api/robo/importar-csv', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        progress.style.display = 'none';

        if (data.sucesso) {
            result.innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle"></i> Importação Concluída!</h5>
                    <div class="mt-3">
                        <div class="row text-center">
                            <div class="col-md-3">
                                <h4>${data.stats.total_linhas}</h4>
                                <small class="text-muted">Total de Linhas</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-success">${data.stats.importados}</h4>
                                <small class="text-muted">Importados</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-warning">${data.stats.duplicados}</h4>
                                <small class="text-muted">Duplicados</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-danger">${data.stats.erros}</h4>
                                <small class="text-muted">Erros</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            atualizarStats();
        } else {
            result.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="bi bi-x-circle"></i> Erro na Importação</h5>
                    <p>${data.erro || 'Erro desconhecido'}</p>
                </div>
            `;
        }

        result.style.display = 'block';

    } catch (error) {
        progress.style.display = 'none';
        result.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="bi bi-x-circle"></i> Erro</h5>
                <p>${error.message}</p>
            </div>
        `;
        result.style.display = 'block';
    }
}

// ==================== LEADS ====================

async function carregarLeads(status = currentFilter, page = 1) {
    currentFilter = status;
    currentPage = page;

    try {
        const response = await fetch(`/api/robo/leads-importados?status=${status}&page=${page}&per_page=50`);
        const data = await response.json();

        if (data.sucesso) {
            renderLeads(data.leads);
            renderPagination(data.total_pages, page);
        }
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
    }
}

function renderLeads(leads) {
    const table = document.getElementById('leadsTable');
    table.innerHTML = '';

    leads.forEach(lead => {
        const statusBadge = getStatusBadge(lead);

        table.innerHTML += `
            <tr class="lead-row">
                <td>${lead.nome}</td>
                <td>${lead.whatsapp}</td>
                <td>${lead.empresa || '-'}</td>
                <td>${lead.cidade || '-'}, ${lead.estado || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="testarDisparo(${lead.id})">
                        <i class="bi bi-send"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="ignorarLead(${lead.id})">
                        <i class="bi bi-x"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function getStatusBadge(lead) {
    if (!lead.disparo_realizado) {
        return '<span class="badge bg-warning">Pendente</span>';
    } else if (lead.sucesso && lead.respondeu) {
        return '<span class="badge bg-success">Respondeu</span>';
    } else if (lead.sucesso) {
        return '<span class="badge bg-info">Enviado</span>';
    } else {
        return '<span class="badge bg-danger">Erro</span>';
    }
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('leadsPagination');
    let html = '<ul class="pagination justify-content-center">';

    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${active}"><a class="page-link" href="#" onclick="carregarLeads('${currentFilter}', ${i})">${i}</a></li>`;
    }

    html += '</ul>';
    pagination.innerHTML = html;
}

function filtrarLeads(status) {
    carregarLeads(status, 1);
}

async function testarDisparo(leadId) {
    const mensagem = prompt('Digite a mensagem de teste:');
    if (!mensagem) return;

    try {
        const response = await fetch('/api/robo/testar-disparo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({lead_id: leadId, mensagem: mensagem})
        });

        const data = await response.json();

        if (data.sucesso) {
            alert('Disparo enviado com sucesso!');
            carregarLeads();
        } else {
            alert('Erro: ' + (data.resultado?.erro || 'Desconhecido'));
        }
    } catch (error) {
        alert('Erro ao enviar: ' + error.message);
    }
}

async function ignorarLead(leadId) {
    try {
        const response = await fetch(`/api/robo/lead/${leadId}/ignorar`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.sucesso) {
            carregarLeads();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function iniciarDisparoMassa() {
    const campanhaId = prompt('Digite o ID da campanha:');
    if (!campanhaId) return;

    const limite = prompt('Quantos leads processar?', '100');

    if (!confirm(`Iniciar disparo em massa para ${limite} leads?`)) return;

    try {
        const response = await fetch('/api/robo/iniciar-disparo-massa', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                campanha_id: parseInt(campanhaId),
                limite: parseInt(limite)
            })
        });

        const data = await response.json();

        if (data.sucesso) {
            alert('Disparo iniciado! Verifique os logs para acompanhar.');
            showTab('logs');
        } else {
            alert('Erro: ' + data.erro);
        }
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// ==================== CONFIGURAÇÕES ====================

async function carregarConfiguracoes() {
    try {
        const response = await fetch('/api/robo/config');
        const data = await response.json();

        if (data.sucesso) {
            const config = data.config;
            const form = document.getElementById('configForm');

            Object.keys(config).forEach(key => {
                const input = form.elements[key];
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = config[key];
                    } else {
                        input.value = config[key] || '';
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar config:', error);
    }
}

async function salvarConfiguracoes(e) {
    e.preventDefault();

    const form = document.getElementById('configForm');
    const formData = new FormData(form);
    const config = {};

    formData.forEach((value, key) => {
        if (form.elements[key].type === 'checkbox') {
            config[key] = form.elements[key].checked;
        } else if (form.elements[key].type === 'number') {
            config[key] = parseInt(value);
        } else {
            config[key] = value;
        }
    });

    try {
        const response = await fetch('/api/robo/config', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(config)
        });

        const data = await response.json();

        if (data.sucesso) {
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar: ' + data.erro);
        }
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// ==================== MÉTRICAS ====================

async function carregarMetricas() {
    try {
        const response = await fetch('/api/robo/metricas?dias=7');
        const data = await response.json();

        if (data.sucesso) {
            atualizarStatsGerais(data.stats_gerais);

            if (chartsInitialized) {
                atualizarCharts(data.metricas_diarias);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar métricas:', error);
    }
}

function atualizarStatsGerais(stats) {
    document.getElementById('totalLeads').textContent = stats.total_leads || 0;
    document.getElementById('pendentesLeads').textContent = stats.pendentes || 0;
    document.getElementById('enviadosLeads').textContent = stats.enviados || 0;
    document.getElementById('taxaSucesso').textContent = (stats.taxa_sucesso || 0).toFixed(1) + '%';
}

async function atualizarStats() {
    await carregarMetricas();
}

function inicializarCharts() {
    // Chart de Envios
    const ctxEnvios = document.getElementById('enviosChart').getContext('2d');
    window.enviosChart = new Chart(ctxEnvios, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Enviados',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Chart de Sucesso
    const ctxSucesso = document.getElementById('sucessoChart').getContext('2d');
    window.sucessoChart = new Chart(ctxSucesso, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Taxa de Sucesso (%)',
                data: [],
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    chartsInitialized = true;
}

function atualizarCharts(metricas) {
    const labels = metricas.map(m => new Date(m.data).toLocaleDateString('pt-BR'));
    const enviados = metricas.map(m => m.total_disparos);
    const taxas = metricas.map(m => m.taxa_sucesso);

    window.enviosChart.data.labels = labels;
    window.enviosChart.data.datasets[0].data = enviados;
    window.enviosChart.update();

    window.sucessoChart.data.labels = labels;
    window.sucessoChart.data.datasets[0].data = taxas;
    window.sucessoChart.update();
}

// ==================== LOGS ====================

let currentLogFilter = 'todos';

async function atualizarLogs(tipo = currentLogFilter) {
    currentLogFilter = tipo;

    try {
        const response = await fetch(`/api/robo/logs?tipo=${tipo}&per_page=20`);
        const data = await response.json();

        if (data.sucesso) {
            renderLogs(data.logs);
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

function renderLogs(logs) {
    const container = document.getElementById('logsContainer');
    container.innerHTML = '';

    if (logs.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Nenhum log encontrado</p>';
        return;
    }

    logs.forEach(log => {
        const className = log.sucesso ? 'success' : 'error';
        const icon = log.sucesso ? 'check-circle-fill' : 'x-circle-fill';

        container.innerHTML += `
            <div class="log-entry ${className}">
                <div class="d-flex justify-content-between">
                    <div>
                        <i class="bi bi-${icon}"></i>
                        <strong>${log.whatsapp}</strong>
                        ${log.sucesso ? '' : `<span class="text-danger ms-2">${log.erro}</span>`}
                    </div>
                    <small class="text-muted">${new Date(log.criado_em).toLocaleString('pt-BR')}</small>
                </div>
                <p class="mb-0 mt-2">${log.mensagem}</p>
                ${log.tempo_espera ? `<small class="text-muted">Delay: ${log.tempo_espera}s</small>` : ''}
            </div>
        `;
    });
}

function filtrarLogs(tipo) {
    atualizarLogs(tipo);
}

// Auto-atualizar a cada 30 segundos
setInterval(atualizarStats, 30000);
