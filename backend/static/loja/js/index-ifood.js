/**
 * EaiChat - Pagina /lojas - JavaScript
 * Estilo iFood
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

    // Update icon
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

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    setTheme(getPreferredTheme());
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

// Close on escape key
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

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.filtros-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        closeFiltros();
    }
});


// ============================================================
// LOAD MORE (Lazy Loading)
// ============================================================

let currentPage = 1;
const itemsPerPage = 12;
let allCards = [];
let visibleCount = 0;

function initLoadMore() {
    const grid = document.getElementById('gridEstabelecimentos');
    if (!grid) return;

    allCards = Array.from(grid.querySelectorAll('.estabelecimento-card-v2'));
    visibleCount = Math.min(itemsPerPage, allCards.length);

    // Initially hide cards beyond first page
    allCards.forEach((card, index) => {
        if (index >= itemsPerPage) {
            card.style.display = 'none';
        }
    });

    updateLoadMoreButton();
}

function loadMore() {
    const newVisible = Math.min(visibleCount + itemsPerPage, allCards.length);

    for (let i = visibleCount; i < newVisible; i++) {
        allCards[i].style.display = '';
        // Add fade-in animation
        allCards[i].style.opacity = '0';
        allCards[i].style.transform = 'translateY(20px)';

        setTimeout(() => {
            allCards[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            allCards[i].style.opacity = '1';
            allCards[i].style.transform = 'translateY(0)';
        }, (i - visibleCount) * 50);
    }

    visibleCount = newVisible;
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const btn = document.querySelector('.btn-load-more');
    const loadMoreDiv = document.querySelector('.load-more');

    if (loadMoreDiv) {
        if (visibleCount >= allCards.length) {
            loadMoreDiv.style.display = 'none';
        } else {
            loadMoreDiv.style.display = 'block';
            const remaining = allCards.length - visibleCount;
            if (btn) {
                btn.textContent = `Ver mais ${Math.min(remaining, itemsPerPage)} estabelecimentos`;
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
// SEARCH ENHANCEMENT
// ============================================================

const searchInput = document.querySelector('.search-input-wrapper input');
if (searchInput) {
    // Clear button functionality
    searchInput.addEventListener('input', function() {
        // Could add clear button logic here
    });

    // Focus styling
    const wrapper = searchInput.closest('.search-input-wrapper');
    searchInput.addEventListener('focus', function() {
        if (wrapper) wrapper.style.boxShadow = '0 0 0 3px rgba(234, 29, 44, 0.2)';
    });
    searchInput.addEventListener('blur', function() {
        if (wrapper) wrapper.style.boxShadow = '';
    });
}


// ============================================================
// LAZY LOADING IMAGES
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
// CATEGORY SCROLL ARROWS (Optional Enhancement)
// ============================================================

function initCategoryScroll() {
    const scroll = document.querySelector('.categorias-scroll');
    if (!scroll) return;

    // Add touch-friendly horizontal scroll behavior
    let isDown = false;
    let startX;
    let scrollLeft;

    scroll.addEventListener('mousedown', (e) => {
        isDown = true;
        scroll.style.cursor = 'grabbing';
        startX = e.pageX - scroll.offsetLeft;
        scrollLeft = scroll.scrollLeft;
    });

    scroll.addEventListener('mouseleave', () => {
        isDown = false;
        scroll.style.cursor = 'grab';
    });

    scroll.addEventListener('mouseup', () => {
        isDown = false;
        scroll.style.cursor = 'grab';
    });

    scroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroll.offsetLeft;
        const walk = (x - startX) * 2;
        scroll.scrollLeft = scrollLeft - walk;
    });
}

document.addEventListener('DOMContentLoaded', initCategoryScroll);


// ============================================================
// CARD HOVER EFFECTS
// ============================================================

document.querySelectorAll('.estabelecimento-card-v2').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    });
});


// ============================================================
// STATUS BADGE ANIMATION
// ============================================================

function animateStatusBadges() {
    document.querySelectorAll('.status-badge-v2:not(.fechado)').forEach(badge => {
        // Subtle pulse for open stores
        badge.style.animation = 'pulse 2s infinite';
    });
}

// Add pulse keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', animateStatusBadges);


// ============================================================
// PRELOAD CRITICAL RESOURCES
// ============================================================

function preloadEstabelecimento(slug) {
    // Preload store page on hover
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/loja/${slug}`;
    document.head.appendChild(link);
}

document.querySelectorAll('.estabelecimento-card-v2, .melhor-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const href = this.getAttribute('href');
        if (href && href.startsWith('/loja/')) {
            const slug = href.replace('/loja/', '');
            preloadEstabelecimento(slug);
        }
    }, { once: true });
});


// ============================================================
// ERROR HANDLING FOR IMAGES
// ============================================================

document.querySelectorAll('.card-logo-v2 img, .melhor-logo img, .card-banner-v2 img').forEach(img => {
    img.addEventListener('error', function() {
        // Replace with placeholder
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


console.log('[EaiChat] Index page initialized');
