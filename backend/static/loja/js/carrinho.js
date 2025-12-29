/**
 * Carrinho de Compras - Loja Virtual EaiChat
 */

class Carrinho {
    constructor() {
        this.itens = [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        const slug = window.LOJA?.slug;
        if (!slug) return;

        const saved = localStorage.getItem(`carrinho_${slug}`);
        if (saved) {
            try {
                this.itens = JSON.parse(saved);
            } catch (e) {
                this.itens = [];
            }
        }
        this.updateUI();
    }

    saveToStorage() {
        const slug = window.LOJA?.slug;
        if (!slug) return;

        localStorage.setItem(`carrinho_${slug}`, JSON.stringify(this.itens));
    }

    adicionar(produto) {
        const existente = this.itens.find(i =>
            i.produto_id === produto.id &&
            JSON.stringify(i.variacoes) === JSON.stringify(produto.variacoes || {})
        );

        if (existente) {
            existente.quantidade++;
        } else {
            this.itens.push({
                produto_id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: 1,
                variacoes: produto.variacoes || {}
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.showToast('Produto adicionado ao carrinho!');
    }

    remover(index) {
        this.itens.splice(index, 1);
        this.saveToStorage();
        this.updateUI();
    }

    alterarQtd(index, delta) {
        const item = this.itens[index];
        if (!item) return;

        item.quantidade += delta;

        if (item.quantidade <= 0) {
            this.remover(index);
        } else {
            this.saveToStorage();
            this.updateUI();
        }
    }

    limpar() {
        this.itens = [];
        this.saveToStorage();
        this.updateUI();
    }

    getSubtotal() {
        return this.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    getTotalItens() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const taxaEntrega = window.LOJA?.taxaEntrega || 0;
        return subtotal + taxaEntrega;
    }

    updateUI() {
        const totalItens = this.getTotalItens();
        const total = this.getTotal();
        const subtotal = this.getSubtotal();
        const taxaEntrega = window.LOJA?.taxaEntrega || 0;

        // Atualizar carrinho flutuante
        const flutuante = document.getElementById('carrinho-flutuante');
        if (flutuante) {
            flutuante.style.display = totalItens > 0 ? 'block' : 'none';
        }

        const qtdEl = document.getElementById('carrinho-qtd');
        if (qtdEl) qtdEl.textContent = totalItens;

        const totalEl = document.getElementById('carrinho-total');
        if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Atualizar modal
        const subtotalEl = document.getElementById('subtotal');
        if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        const taxaEl = document.getElementById('taxa-entrega');
        if (taxaEl) taxaEl.textContent = `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`;

        const totalFinalEl = document.getElementById('total-final');
        if (totalFinalEl) totalFinalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Renderizar itens
        this.renderItens();
    }

    renderItens() {
        const container = document.getElementById('carrinho-itens');
        if (!container) return;

        if (this.itens.length === 0) {
            container.innerHTML = `
                <div class="carrinho-vazio">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Seu carrinho esta vazio</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.itens.map((item, index) => `
            <div class="carrinho-item">
                <div class="item-imagem">
                    ${item.imagem ? `<img src="${item.imagem}" alt="${item.nome}">` : '<i class="fas fa-image"></i>'}
                </div>
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    ${Object.entries(item.variacoes || {}).map(([k, v]) => `<small>${k}: ${v}</small>`).join('')}
                    <span class="item-preco">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="item-qtd">
                    <button onclick="carrinho.alterarQtd(${index}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="carrinho.alterarQtd(${index}, 1)">+</button>
                </div>
                <button class="item-remover" onclick="carrinho.remover(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    showToast(msg) {
        // Remove toasts existentes
        document.querySelectorAll('.toast-success').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast-success';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Instancia global
const carrinho = new Carrinho();

// Funcoes globais
function adicionarRapido(id, nome, preco, imagem) {
    carrinho.adicionar({ id, nome, preco, imagem });
}

function abrirCarrinho() {
    const modal = document.getElementById('modal-carrinho');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function fecharCarrinho() {
    const modal = document.getElementById('modal-carrinho');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

async function finalizarPedido() {
    if (carrinho.itens.length === 0) {
        alert('Adicione produtos ao carrinho primeiro!');
        return;
    }

    // Verificar pedido minimo
    const minimo = window.LOJA?.pedidoMinimo || 0;
    if (carrinho.getSubtotal() < minimo) {
        alert(`Pedido minimo de R$ ${minimo.toFixed(2)}`);
        return;
    }

    try {
        const response = await fetch(`/api/loja/${window.LOJA.slug}/pedido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itens: carrinho.itens,
                tipo_entrega: 'entrega'
            })
        });

        const data = await response.json();

        if (data.success) {
            // Limpar carrinho
            carrinho.limpar();
            fecharCarrinho();

            // Redirecionar para WhatsApp
            window.open(data.whatsapp_link, '_blank');
        } else {
            alert(data.error || 'Erro ao criar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao processar pedido. Tente novamente.');
    }
}
