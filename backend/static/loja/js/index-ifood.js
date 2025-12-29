/**
 * EaiChat - Pagina /lojas - JavaScript
 * Estilo iFood com Slideshow e Busca em Tempo Real
 */

// ============================================================
// THEME TOGGLE
// ============================================================

function getPreferredTheme() {
    const saved = localStorage.getItem('eaichat-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eaichat-theme', theme);

    const icon = document.querySelector('.btn-theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

document.addEventListener('DOMContentLoaded', function() {
    setTheme(getPreferredTheme());
});


// ============================================================
// HERO SLIDESHOW
// ============================================================

const slideData = [
    {
        title: "O que voce precisa hoje?",
        subtitle: "Restaurantes, mercados, farmacias e muito mais perto de voce"
    },
    {
        title: "Compras do mercado?",
        subtitle: "Tudo que voce precisa entregue na sua porta"
    },
    {
        title: "Fome de que?",
        subtitle: "Os melhores restaurantes com entrega rapida"
    },
    {
        title: "Produtos para sua casa",
        subtitle: "Lojas, farmacias e servicos a um clique"
    }
];

let currentSlide = 0;
let slideInterval = null;

function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    const indicators = document.querySelectorAll('.hero-indicators .indicator');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');

    if (!slides.length) return;

    function showSlide(index) {
        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update indicators
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === index);
        });

        // Update text with fade effect
        if (heroTitle && heroSubtitle && slideData[index]) {
            heroTitle.style.opacity = '0';
            heroSubtitle.style.opacity = '0';

            setTimeout(() => {
                heroTitle.textContent = slideData[index].title;
                heroSubtitle.textContent = slideData[index].subtitle;
                heroTitle.style.opacity = '1';
                heroSubtitle.style.opacity = '1';
            }, 300);
        }

        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // Click on indicators
    indicators.forEach((ind, index) => {
        ind.addEventListener('click', () => {
            showSlide(index);
            resetInterval();
        });
    });

    // Auto-advance slides
    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    startInterval();
}

document.addEventListener('DOMContentLoaded', initSlideshow);


// ============================================================
// BUSCA EM TEMPO REAL
// ============================================================

let searchTimeout = null;
let allCards = [];

function initRealTimeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    const searchResults = document.getElementById('searchResults');
    const grid = document.getElementById('gridEstabelecimentos');

    if (!searchInput || !grid) return;

    // Cache all cards
    allCards = Array.from(grid.querySelectorAll('.estabelecimento-card-v2'));

    // Input event for real-time filtering
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();

        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = query ? 'flex' : 'none';
        }

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            filterCards(query);
            updateURL(query);
        }, 200);
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            filterCards('');
            updateURL('');
            searchInput.focus();
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });

    // Initial state
    if (searchInput.value) {
        if (clearBtn) clearBtn.style.display = 'flex';
        filterCards(searchInput.value.trim().toLowerCase());
    }
}

function filterCards(query) {
    const grid = document.getElementById('gridEstabelecimentos');
    const gridPerto = document.getElementById('gridPertoDeVoce');
    let visibleCount = 0;

    allCards.forEach(card => {
        const nome = (card.dataset.nome || '').toLowerCase();
        const categoria = (card.dataset.categoria || '').toLowerCase();
        const cidade = (card.dataset.cidade || '').toLowerCase();

        const matches = !query ||
            nome.includes(query) ||
            categoria.includes(query) ||
            cidade.includes(query);

        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });

    // Update "Perto de voce" section too
    if (gridPerto) {
        const pertoCards = gridPerto.querySelectorAll('.estabelecimento-card-v2');
        pertoCards.forEach(card => {
            const nome = (card.dataset.nome || '').toLowerCase();
            const categoria = (card.dataset.categoria || '').toLowerCase();

            const matches = !query ||
                nome.includes(query) ||
                categoria.includes(query);

            card.style.display = matches ? '' : 'none';
        });
    }

    // Show/hide empty state
    let emptyState = document.getElementById('emptyState');
    if (!emptyState && visibleCount === 0) {
        emptyState = document.createElement('div');
        emptyState.id = 'emptyState';
        emptyState.className = 'empty-state-v2';
        emptyState.innerHTML = `
            <i class="fas fa-store-slash"></i>
            <h3>Nenhum estabelecimento encontrado</h3>
            <p>Tente buscar por outro termo</p>
        `;
        grid.appendChild(emptyState);
    } else if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? '' : 'none';
    }
}

function updateURL(query) {
    const url = new URL(window.location);
    if (query) {
        url.searchParams.set('q', query);
    } else {
        url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
}

document.addEventListener('DOMContentLoaded', initRealTimeSearch);


// ============================================================
// FILTRO POR CATEGORIA (SEM RELOAD)
// ============================================================

let currentCategoria = '';

function filtrarCategoria(categoria) {
    currentCategoria = categoria;

    allCards.forEach(card => {
        const cardCategoria = (card.dataset.categoria || '').toLowerCase();
        const searchQuery = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

        // Check both category and search query
        const matchesCategoria = !categoria || cardCategoria.includes(categoria.toLowerCase());
        const matchesSearch = !searchQuery ||
            (card.dataset.nome || '').toLowerCase().includes(searchQuery) ||
            cardCategoria.includes(searchQuery);

        card.style.display = (matchesCategoria && matchesSearch) ? '' : 'none';
    });

    // Update active states
    document.querySelectorAll('.filtros-menu a').forEach(link => {
        const linkCategoria = link.textContent.trim().toLowerCase();
        const isActive = (!categoria && linkCategoria === 'todos') ||
                        linkCategoria === categoria.toLowerCase();
        link.classList.toggle('active', isActive);
    });

    document.querySelectorAll('.categoria-icon-item').forEach(item => {
        const itemCategoria = item.dataset.categoria || '';
        item.classList.toggle('active', itemCategoria === categoria);
    });

    // Update URL
    const url = new URL(window.location);
    if (categoria) {
        url.searchParams.set('categoria', categoria);
    } else {
        url.searchParams.delete('categoria');
    }
    window.history.replaceState({}, '', url);

    // Close dropdown
    closeFiltros();
}

// Make category icons filter without reload
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.categoria-icon-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.dataset.categoria || '';
            filtrarCategoria(categoria);
        });
    });
});


// ============================================================
// MOBILE MENU
// ============================================================

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
        document.body.style.overflow = menu.style.display === 'none' ? '' : 'hidden';
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.style.display = 'none';
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
        closeFiltros();
    }
});


// ============================================================
// FILTROS DROPDOWN
// ============================================================

function toggleFiltros() {
    const menu = document.getElementById('filtrosMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

function closeFiltros() {
    const menu = document.getElementById('filtrosMenu');
    if (menu) {
        menu.classList.remove('show');
    }
}

document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.filtros-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        closeFiltros();
    }
});


// ============================================================
// LOAD MORE
// ============================================================

let visibleCount = 0;
const itemsPerPage = 12;

function initLoadMore() {
    const grid = document.getElementById('gridEstabelecimentos');
    if (!grid) return;

    visibleCount = Math.min(itemsPerPage, allCards.length);

    allCards.forEach((card, index) => {
        if (index >= itemsPerPage) {
            card.style.display = 'none';
            card.dataset.hidden = 'true';
        }
    });

    updateLoadMoreButton();
}

function loadMore() {
    const visibleCards = allCards.filter(c => c.style.display !== 'none' || c.dataset.hidden === 'true');
    const hiddenCards = allCards.filter(c => c.dataset.hidden === 'true');

    const toShow = hiddenCards.slice(0, itemsPerPage);
    toShow.forEach((card, index) => {
        delete card.dataset.hidden;
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });

    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const btn = document.querySelector('.btn-load-more');
    const loadMoreDiv = document.querySelector('.load-more');
    const hiddenCount = allCards.filter(c => c.dataset.hidden === 'true').length;

    if (loadMoreDiv) {
        if (hiddenCount === 0) {
            loadMoreDiv.style.display = 'none';
        } else {
            loadMoreDiv.style.display = 'block';
            if (btn) {
                btn.textContent = `Ver mais ${Math.min(hiddenCount, itemsPerPage)} estabelecimentos`;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', initLoadMore);


// ============================================================
// SMOOTH SCROLL
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header-main')?.offsetHeight || 64;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});


// ============================================================
// LAZY LOADING & PERFORMANCE
// ============================================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}


// ============================================================
// ERROR HANDLING FOR IMAGES
// ============================================================

document.querySelectorAll('.card-logo-v2 img, .melhor-logo img, .card-banner-v2 img').forEach(img => {
    img.addEventListener('error', function() {
        const parent = this.parentElement;
        const name = parent.closest('a')?.querySelector('h3, .melhor-nome')?.textContent || 'L';
        const placeholder = document.createElement('div');
        placeholder.className = this.closest('.card-banner-v2') ? 'banner-gradient' : 'logo-letter';
        placeholder.style.background = 'linear-gradient(135deg, #EA1D2C, #FF6B6B)';
        if (!this.closest('.card-banner-v2')) {
            placeholder.textContent = name.charAt(0).toUpperCase();
        }
        this.replaceWith(placeholder);
    });
});


console.log('[EaiChat] Index page initialized with slideshow and real-time search');
