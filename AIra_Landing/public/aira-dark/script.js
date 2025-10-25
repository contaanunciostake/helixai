// ========================================
// AIRA LANDING PAGE - INTERACTIVE SCRIPT
// ========================================

console.log('🚀 AIRA Landing Page loaded successfully!');

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========== NAVBAR SCROLL EFFECT ==========
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
  } else {
    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    navbar.style.boxShadow = 'none';
  }

  lastScroll = currentScroll;
});

// ========== FAQ ACCORDION ==========
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    // Fecha outros itens
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });

    // Toggle item atual
    item.classList.toggle('active');

    // Log para analytics
    if (item.classList.contains('active')) {
      console.log('FAQ aberto:', question.textContent);
    }
  });
});

// ========== ANIMAÇÃO ON SCROLL ==========
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';

      // Log para analytics
      const section = entry.target.closest('section');
      if (section && section.id) {
        console.log('Seção visualizada:', section.id);
      }
    }
  });
}, observerOptions);

// Elementos para animar
const animateElements = document.querySelectorAll('.feature-card, .pain-item, .faq-item, .results-visual');

animateElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ========== CTA BUTTONS TRACKING ==========
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-nav');

ctaButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    console.log('CTA clicked:', btn.textContent);

    // Adicionar efeito de ripple
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.marginTop = '-50px';
    ripple.style.marginLeft = '-50px';
    ripple.style.animation = 'ripple 0.6s';
    ripple.style.pointerEvents = 'none';

    const rect = btn.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left + 'px';
    ripple.style.top = e.clientY - rect.top + 'px';

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    // Redirecionar para seção de preços após ripple
    setTimeout(() => {
      scrollToPrecos();
    }, 300);

    // Aqui você pode adicionar:
    // - Google Analytics: gtag('event', 'click', { 'event_category': 'CTA', 'event_label': btn.textContent });
    // - Facebook Pixel: fbq('track', 'Lead');
  });
});

// Adicionar animação de ripple no CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ========== COUNTER ANIMATION ==========
const counters = document.querySelectorAll('.stat-number');
let counterAnimated = false;

const animateCounter = (counter) => {
  const target = counter.textContent;

  // Se for número, animar
  if (target.includes('%')) {
    const num = parseInt(target);
    let current = 0;
    const increment = num / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        counter.textContent = '+' + num + '%';
        clearInterval(timer);
      } else {
        counter.textContent = '+' + Math.floor(current) + '%';
      }
    }, 20);
  }
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counterAnimated) {
      counters.forEach(counter => animateCounter(counter));
      counterAnimated = true;
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  counterObserver.observe(heroStats);
}

// ========== METRICS ANIMATION ==========
const metricValues = document.querySelectorAll('.metric-value');
let metricsAnimated = false;

const animateMetric = (metric) => {
  const text = metric.textContent;

  if (text.includes('%')) {
    const num = parseInt(text);
    let current = 0;
    const increment = num / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        metric.textContent = '+' + num + '%';
        clearInterval(timer);
      } else {
        metric.textContent = '+' + Math.floor(current) + '%';
      }
    }, 30);
  } else if (text.includes('M')) {
    metric.style.opacity = '0';
    setTimeout(() => {
      metric.style.opacity = '1';
      metric.style.transition = 'opacity 0.6s ease';
    }, 100);
  } else if (!isNaN(text)) {
    const num = parseInt(text);
    let current = 0;
    const increment = num / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        metric.textContent = num;
        clearInterval(timer);
      } else {
        metric.textContent = Math.floor(current);
      }
    }, 30);
  }
};

const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !metricsAnimated) {
      metricValues.forEach(metric => animateMetric(metric));
      metricsAnimated = true;
    }
  });
}, { threshold: 0.5 });

const dashboard = document.querySelector('.dashboard-mockup');
if (dashboard) {
  metricsObserver.observe(dashboard);
}

// ========== LOGO CLICK EVENT ==========
const logo = document.querySelector('.nav-logo');
if (logo) {
  logo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ========== WHATSAPP CHAT SIMULATION ==========
const chatMessages = document.querySelector('.chat-messages');
if (chatMessages) {
  const messages = [
    { type: 'received', text: 'Olá! Estou procurando um carro...', delay: 0 },
    { type: 'sent', text: 'Olá! 👋 Sou a AIRA, assistente de vendas! Vou te ajudar...', delay: 1000 },
    { type: 'received', text: 'Gostaria de ver SUVs disponíveis', delay: 2000 },
    { type: 'sent', text: 'Temos ótimas opções! Deixa eu te mostrar... 🚗', delay: 3000 }
  ];

  // Limpar mensagens existentes
  setTimeout(() => {
    chatMessages.innerHTML = '';

    // Adicionar mensagens com delay
    messages.forEach(msg => {
      setTimeout(() => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.type}`;
        messageEl.textContent = msg.text;
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(10px)';
        chatMessages.appendChild(messageEl);

        // Animar entrada
        setTimeout(() => {
          messageEl.style.opacity = '1';
          messageEl.style.transform = 'translateY(0)';
          messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

          // Auto-scroll
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
      }, msg.delay);
    });
  }, 2000);
}

// ========== FEATURE CARDS HOVER EFFECT ==========
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
  card.addEventListener('mouseenter', (e) => {
    const icon = card.querySelector('.feature-icon');
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
  });

  card.addEventListener('mouseleave', (e) => {
    const icon = card.querySelector('.feature-icon');
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  });
});

// ========== TRACK PAGE VIEWS ==========
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Seção em visualização:', entry.target.id);

      // Aqui você pode adicionar tracking:
      // gtag('event', 'section_view', { 'section_name': entry.target.id });
    }
  });
}, { threshold: 0.5 });

sections.forEach(section => {
  sectionObserver.observe(section);
});

// ========== PERFORMANCE MONITORING ==========
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`⚡ Página carregada em ${Math.round(loadTime)}ms`);

  // Aqui você pode enviar para analytics:
  // gtag('event', 'timing_complete', { 'name': 'load', 'value': Math.round(loadTime) });
});

// ========== EXIT INTENT (OPCIONAL) ==========
// let exitIntentShown = false;
// document.addEventListener('mouseleave', (e) => {
//   if (e.clientY <= 0 && !exitIntentShown) {
//     exitIntentShown = true;
//     console.log('Exit intent detectado!');
//     // Aqui você pode mostrar um popup ou modal
//     // showExitIntentPopup();
//   }
// });

// ========== SCROLL TO PRICING ==========
function scrollToPrecos() {
  const precosSection = document.getElementById('precos');
  if (precosSection) {
    precosSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// ========== CHECKOUT REDIRECT ==========
const planButtons = document.querySelectorAll('.btn-plan');

planButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const planId = btn.getAttribute('data-plan');

    console.log('Plano selecionado:', planId);

    // Para Enterprise (plano 3), pode abrir WhatsApp
    if (planId === '3') {
      // Abrir WhatsApp para contato (substitua o número)
      const whatsappNumber = '5567999999999'; // Substitua pelo número real
      const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o plano Enterprise da AIRA.');
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } else {
      // Redirecionar para checkout com o ID do plano
      window.location.href = `/checkout.html?plano=${planId}`;
    }
  });
});

console.log('✅ Todos os scripts carregados com sucesso!');
console.log('📊 Tracking de eventos:', {
  'CTA clicks': 'Habilitado',
  'FAQ interactions': 'Habilitado',
  'Section views': 'Habilitado',
  'Scroll depth': 'Disponível',
  'Pricing buttons': 'Configurado'
});
