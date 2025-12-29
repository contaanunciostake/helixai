/**
 * Loja Virtual EaiChat - JavaScript Principal
 */

// Filtrar produtos por categoria
function filtrarCategoria(categoriaId, btn) {
    // Atualizar botao ativo
    document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Filtrar secoes
    const secoes = document.querySelectorAll('.categoria-section');

    if (categoriaId === 'todos') {
        secoes.forEach(s => s.style.display = 'block');
    } else {
        secoes.forEach(s => {
            const secaoCatId = s.getAttribute('data-categoria-id');
            if (secaoCatId === String(categoriaId) || secaoCatId === 'geral') {
                s.style.display = 'block';
            } else {
                s.style.display = 'none';
            }
        });
    }
}

// Filtrar produtos por busca
function filtrarProdutos(termo) {
    termo = termo.toLowerCase().trim();

    const cards = document.querySelectorAll('.produto-card');

    cards.forEach(card => {
        const nome = card.getAttribute('data-nome') || '';
        const textoNome = card.querySelector('.produto-nome')?.textContent?.toLowerCase() || '';
        const textoDesc = card.querySelector('.produto-descricao')?.textContent?.toLowerCase() || '';

        if (!termo || nome.includes(termo) || textoNome.includes(termo) || textoDesc.includes(termo)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // Mostrar/esconder secoes vazias
    document.querySelectorAll('.categoria-section').forEach(secao => {
        const visibleCards = secao.querySelectorAll('.produto-card[style="display: flex"]').length;
        const flexCards = secao.querySelectorAll('.produto-card:not([style*="none"])').length;

        if (termo && flexCards === 0) {
            secao.style.display = 'none';
        } else {
            secao.style.display = 'block';
        }
    });
}

// Abrir modal de produto (para futuro uso)
function abrirProduto(produtoId) {
    // Por enquanto, apenas adiciona ao carrinho
    // No futuro, pode abrir um modal com detalhes do produto
    console.log('Produto clicado:', produtoId);
}

// Compartilhar loja
function compartilhar() {
    const url = window.location.href;
    const titulo = window.LOJA?.nome || 'Loja';

    if (navigator.share) {
        navigator.share({
            title: titulo,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a area de transferencia!');
        }).catch(() => {
            prompt('Copie o link:', url);
        });
    }
}

// Inicializacao
document.addEventListener('DOMContentLoaded', function() {
    console.log('[LOJA] Loja virtual inicializada');

    // Atualizar UI do carrinho
    if (typeof carrinho !== 'undefined') {
        carrinho.updateUI();
    }

    // Lazy loading para imagens
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                    }
                    observer.unobserve(image);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});
