# AIRA Landing Page - Dark Theme

Landing page premium em dark mode para o produto AIRA (Assistente de Vendas com IA).

## 📋 Estrutura

### Seções da Landing Page
1. **Navbar** - Menu fixo com links de navegação
2. **Hero** - Seção principal com título impactante, CTA e imagem de fundo (slice_4-1-scaled.webp) ✨ **ATUALIZADO**
3. **Social Proof** - Logos de clientes (placeholders)
4. **Funcionalidades** - Grid com 8 cards de funcionalidades
5. **Preços** - 3 planos (Starter, Professional, Enterprise) ✨ **NOVO**
6. **Resultados** - Métricas e dashboard mockup
7. **Pain Points** - Problemas que a AIRA resolve
8. **FAQ** - Perguntas frequentes com accordion
9. **Footer** - Informações de contato e copyright

## 🎨 Design

### Cores - VERDE EMERALD 💚
- **Background**: `#0A0A0A` (preto profundo)
- **Accent Primary**: `#10B981` (Emerald 500 - verde principal)
- **Accent Secondary**: `#059669` (Emerald 600 - verde escuro)
- **Accent Light**: `#34D399` (Emerald 400 - verde claro)
- **Accent Dark**: `#047857` (Emerald 700 - verde mais escuro)
- **Texto**: Branco e tons de cinza

### Gradientes
- **Botões**: `linear-gradient(135deg, #10B981, #059669)`
- **Background**: `radial-gradient(rgba(16, 185, 129, 0.1))`
- **Sombras**: `rgba(16, 185, 129, [opacity])`

### Tipografia
- **Headings**: Montserrat (weight: 700-800)
- **Body**: Inter (weight: 400-600)

### Hero Background Layers (Z-Index)
A Hero section usa múltiplas camadas para criar profundidade visual:
- **Layer 0**: Imagem de fundo (`slice_4-1-scaled.webp`) com 20% de opacidade
- **Layer 1**: Overlay escuro com gradiente radial para legibilidade
- **Layer 2**: Gradiente coral decorativo no lado direito
- **Layer 10**: Conteúdo (texto e elementos visuais)

## 💰 Planos e Preços

### Starter - R$ 497/mês
- 1 Equipe de IA Completa
- Até 1.000 conversas/mês
- WhatsApp + Site + Redes Sociais
- Suporte por Email

### Professional - R$ 997/mês ⭐ MAIS POPULAR
- 3 Equipes de IA Completas
- Conversas Ilimitadas
- Todos os Canais Integrados
- Analytics e BI Avançado
- Suporte Prioritário 24/7
- Integrações Premium
- API Completa

### Enterprise - Custom
- Equipes de IA Ilimitadas
- White Label Completo
- Gerente de Sucesso Dedicado
- SLA Garantido 99.9%
- Customizações Sob Medida
- Treinamento Presencial

## 🔗 Funcionalidades Interativas

### Botões CTA
Todos os botões "QUERO TESTAR", "QUERO CONHECER", etc. redirecionam para a seção de preços com efeito ripple animado.

### Botões de Plano
- **Starter/Professional**: Redireciona para `/checkout.html?plano=X`
- **Enterprise**: Abre WhatsApp para contato direto

### FAQ Accordion
Clique nas perguntas para expandir/recolher respostas.

### Animações
- Scroll suave entre seções
- Fade-in dos cards ao scroll
- Counter animation nos números
- Hover effects nos cards
- WhatsApp chat animado

## 📱 Responsividade

### Desktop (> 1024px)
- Layout em grid de 3 colunas para funcionalidades
- Pricing cards lado a lado
- Todos os elementos visíveis

### Tablet (768px - 1024px)
- Layout em grid de 2 colunas
- Spacing ajustado

### Mobile (< 768px)
- Layout em coluna única
- Cards full-width
- Menu colapsado (será necessário adicionar toggle)
- Floating badges ocultos

## 🎨 Personalização de Cores

### Mudança de Paleta (v2.0)
A landing page foi atualizada de **Coral/Vermelho** para **Verde Emerald** para manter consistência visual com a marca AIRA.

**Cores Antigas → Novas:**
- `#FF6B6B` (coral) → `#10B981` (emerald 500)
- `#E74C3C` (vermelho) → `#059669` (emerald 600)
- `#FF8C42` (laranja) → `#34D399` (emerald 400)

**Variáveis CSS Atualizadas:**
```css
--accent-primary: #10B981;
--accent-secondary: #059669;
--accent-light: #34D399;
--accent-dark: #047857;
```

### Personalizar Cores
Para alterar a paleta de cores, edite as variáveis no início do `styles.css` (linhas 5-34):
```css
:root {
  --accent-primary: #SUA_COR;
  --accent-secondary: #SUA_COR_ESCURA;
  --gradient-btn: linear-gradient(135deg, #COR1, #COR2);
}
```

## 🛠️ Customização

### Alterar Logotipo
O sistema usa **dois logotipos** para garantir contraste adequado:

**Logotipos Disponíveis:**
- `AIra_Logotipo.png` - Colorido (usado no navbar com fundo escuro)
- `LogotipoCinza.png` - Cinza (usado no footer com fundo verde)

**Onde são usados:**
1. **Navbar** (fundo escuro): `AIra_Logotipo.png` - linha 16 do `index.html`
2. **Footer** (fundo verde): `LogotipoCinza.png` - linha 348 do `index.html`

**Para alterar:**
1. Substitua os arquivos na pasta `D:\Helix\HelixAI\AIra_Landing\public\`
2. Mantenha os mesmos nomes ou edite as referências no HTML
3. Ajuste o tamanho no CSS se necessário:
   - **Navbar**: `.logo-image` { height: 50px } (linha 85)
   - **Footer**: `.logo-image-footer` { height: 60px } (linha 899)

### Alterar Imagem de Fundo da Hero
A imagem de fundo está configurada no CSS. Para alterar:

1. Coloque sua nova imagem na pasta `D:\Helix\HelixAI\AIra_Landing\public\`
2. Edite o arquivo `styles.css` na linha 162:
```css
background-image: url('../sua-nova-imagem.webp');
```

Você pode ajustar a opacidade da imagem na linha 166:
```css
opacity: 0.2; /* 0 = invisível, 1 = 100% visível */
```

### Alterar Preços
Edite o arquivo `index.html` nas linhas 161-218 (seção #precos)

### Alterar WhatsApp
Edite o arquivo `script.js` na linha 377:
```javascript
const whatsappNumber = '5567999999999'; // Seu número com DDI
```

### Alterar Checkout URL
Edite o arquivo `script.js` na linha 382:
```javascript
window.location.href = `/checkout.html?plano=${planId}`;
```

### Adicionar Logos de Clientes
Substitua os placeholders "LOGO 1-5" na linha 81-85 do `index.html` por:
```html
<img src="path/to/logo.png" alt="Cliente Nome" class="client-logo">
```

### Google Analytics / Facebook Pixel
Adicione os códigos de tracking nas linhas 131-132 do `script.js`:
```javascript
// Google Analytics
gtag('event', 'click', { 'event_category': 'CTA', 'event_label': btn.textContent });

// Facebook Pixel
fbq('track', 'Lead');
```

## 📦 Arquivos

- `index.html` - Estrutura HTML da página
- `styles.css` - Estilos CSS completos (877 linhas → 1048 linhas)
- `script.js` - JavaScript interativo (361 linhas → 394 linhas)
- `../AIra_Logotipo.png` - Logotipo colorido da AIRA (navbar - fundo escuro)
- `../LogotipoCinza.png` - Logotipo cinza da AIRA (footer - fundo verde)

## 🚀 Como Usar

1. Abra o arquivo `index.html` no navegador
2. Para produção, suba os 3 arquivos para seu servidor
3. Certifique-se de que a página de checkout existe em `/checkout.html`

## 📊 Analytics e Tracking

O JavaScript já está configurado para rastrear:
- ✅ Cliques em CTAs
- ✅ Interações com FAQ
- ✅ Visualização de seções
- ✅ Seleção de planos
- ⏳ Performance de carregamento (console)

## 🎯 Próximos Passos

1. Adicionar menu mobile hamburger funcional
2. Substituir placeholders de logos por logos reais
3. Configurar número real de WhatsApp
4. Adicionar Google Analytics/Facebook Pixel
5. Testar fluxo completo de checkout
6. Otimizar imagens e performance
7. Adicionar animações de entrada na hero section

## 📝 Notas

- Landing page 100% standalone (sem dependências externas)
- Funciona sem servidor (pode abrir direto o HTML)
- Fontes carregadas via Google Fonts CDN
- Compatível com todos os navegadores modernos
- Validado para acessibilidade básica

---

## 📝 Changelog

### v2.0 (Janeiro 2025)
- 🎨 **Mudança completa de paleta**: Coral/Vermelho → Verde Emerald
- 🖼️ **Logotipo oficial**: Substituído ícone/texto por `AIra_Logotipo.png`
- 💰 **Seção de preços**: Adicionados 3 planos (Starter, Professional, Enterprise)
- 🖼️ **Background Hero**: Adicionada imagem `slice_4-1-scaled.webp`
- 🔘 **Botões funcionais**: CTAs redirecionam para checkout
- 📱 **Responsividade**: Otimizada para mobile/tablet/desktop

### v1.0 (Janeiro 2025)
- 🚀 Lançamento inicial com 8 seções
- 🎨 Design dark mode com tema coral/vermelho
- ✨ Animações e interatividade completa

---

**Desenvolvido por**: Helix AI
**Data**: Janeiro 2025
**Versão**: 2.0
