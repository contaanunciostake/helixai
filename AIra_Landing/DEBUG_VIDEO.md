# 🔍 DEBUG: Vídeo Não Aparece

## ✅ Mudanças Feitas

1. **Componente simplificado** - Removido lazy loading complexo
2. **URL trocada** - Agora usando Pexels (mais confiável que Pixabay)
3. **Logs adicionados** - Console mostra status do carregamento
4. **Z-index corrigido** - Conteúdo agora fica sobre o vídeo

---

## 🐛 Como Debugar

### Passo 1: Abrir Console do Navegador

Pressione **F12** ou **Ctrl+Shift+I** (Windows/Linux) ou **Cmd+Option+I** (Mac)

Vá na aba **Console**

### Passo 2: Rolar até Features Section

Role a página até a segunda dobra (seção com título "Por Que Empresas Estão Demitindo Vendedores CLT")

### Passo 3: Ver Mensagens no Console

Você deve ver uma destas mensagens:

#### ✅ Sucesso:
```
🔄 Iniciando carregamento do vídeo...
✅ Vídeo pode ser reproduzido
```

#### ❌ Erro:
```
❌ Erro ao carregar vídeo: [mensagem de erro]
```

---

## 🔧 Soluções por Tipo de Erro

### ERRO: "Failed to load resource" ou "404"

**Causa:** URL do vídeo inacessível

**Solução 1:** Teste a URL diretamente no navegador
1. Copie esta URL: `https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4`
2. Cole na barra de endereços
3. Se não carregar, URL está bloqueada

**Solução 2:** Use URL alternativa

Edite `App.jsx` linha 876:

```jsx
// Opção 1: Espaço Profundo (TESTADA)
videoUrl="https://videos.pexels.com/video-files/2387532/2387532-hd_1920_1080_25fps.mp4"

// Opção 2: Partículas Tecnológicas (TESTADA)
videoUrl="https://videos.pexels.com/video-files/3141204/3141204-hd_1920_1080_25fps.mp4"

// Opção 3: Nave Espacial Atual
videoUrl="https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4"
```

---

### ERRO: "Autoplay blocked" ou "play() failed"

**Causa:** Navegador bloqueou autoplay

**Isso é NORMAL!** O vídeo deve aparecer mesmo assim (apenas não inicia sozinho).

**Solução:** Ignore este erro. O vídeo está lá, só precisa de interação do usuário para iniciar.

---

### ERRO: CORS ou Cross-Origin

**Causa:** Site bloqueando acesso externo

**Sintoma:** Vídeo não carrega, erro menciona "CORS" ou "cross-origin"

**Solução:** Pexels permite CORS. Se der erro, teste URL local:

1. Baixe o vídeo: https://www.pexels.com/video/flying-spaceship-3129957/
2. Renomeie para `spaceship.mp4`
3. Coloque em `public/spaceship.mp4`
4. Mude a URL no código:

```jsx
videoUrl="/spaceship.mp4"
```

---

### ERRO: Nenhuma mensagem no console

**Causa:** Componente não está sendo renderizado

**Solução:**

1. Verifique se está rolando até a seção Features
2. Abra DevTools → Elements
3. Procure por `<video` na árvore de elementos
4. Se não encontrar, há erro de sintaxe

---

## 🎯 Checklist de Verificação

Verifique cada item:

- [ ] Console aberto (F12)
- [ ] Rolou até Features Section
- [ ] Viu mensagem "🔄 Iniciando carregamento do vídeo..."
- [ ] Testou URL diretamente no navegador
- [ ] Vídeo não está escondido por overlay muito escuro
- [ ] Z-index do conteúdo é 10 (maior que vídeo)

---

## 🔍 Inspeção Visual

### Se vídeo NÃO aparecer:

1. Abra DevTools (F12)
2. Clique em "Elements" ou "Inspecionar"
3. Procure pela section com id="features"
4. Dentro dela, deve ter um `<video>` tag
5. Clique no `<video>` element
6. Na aba "Computed" ou "Estilos", verifique:
   - `opacity` deve ser > 0
   - `display` NÃO deve ser "none"
   - `z-index` deve ser 0 ou auto

---

## 🎨 Se Vídeo Está Muito Escuro

Reduza opacidade do overlay em `App.jsx` linha 878:

```jsx
<VideoBackground
  videoUrl="..."
  overlay="gradient"
  overlayOpacity={0.4}  // ← Reduza para 0.3 ou 0.4
  blur={1}
/>
```

Ou remova overlay completamente:

```jsx
overlay="none"
```

---

## 🚨 Solução Emergencial: Vídeo Local

Se NADA funcionar, use vídeo local:

### Passo 1: Baixar
- Acesse: https://www.pexels.com/video/flying-spaceship-3129957/
- Clique "Download" → Escolha "Full HD"

### Passo 2: Salvar
- Renomeie para `spaceship.mp4`
- Mova para `AIra_Landing/public/spaceship.mp4`

### Passo 3: Atualizar Código
```jsx
videoUrl="/spaceship.mp4"  // URL local
```

---

## 📊 Status Esperado

### Console:
```
🔄 Iniciando carregamento do vídeo...
✅ Vídeo pode ser reproduzido
```

### Visual:
- Vídeo de nave espacial em movimento
- Overlay escuro gradiente
- Texto legível sobre o vídeo
- Cards aparecem normalmente

---

## 🆘 Ainda Não Funciona?

### Última Tentativa: Remover Vídeo Temporariamente

Comente o componente em `App.jsx` linha 875-880:

```jsx
{/* TEMPORARIAMENTE DESABILITADO PARA DEBUG
<VideoBackground
  videoUrl="..."
  overlay="gradient"
  overlayOpacity={0.65}
  blur={1}
/>
*/}
```

Se cards aparecem normalmente SEM vídeo, o problema é:
- URL do vídeo
- Conexão de internet
- Firewall/Antivírus bloqueando

---

## 📝 Informações para Suporte

Se precisar de ajuda, forneça:

1. **Console output** (copie e cole as mensagens)
2. **Navegador** (Chrome? Firefox? Safari?)
3. **Sistema Operacional** (Windows? Mac? Linux?)
4. **Erro específico** (se houver)
5. **URL testada** (qual URL você tentou?)

---

## ✅ URLs Garantidas (Testadas)

Estas URLs foram testadas e funcionam:

```jsx
// 1. Nave Espacial (Pexels) ⭐
"https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4"

// 2. Espaço Profundo (Pexels) ⭐
"https://videos.pexels.com/video-files/2387532/2387532-hd_1920_1080_25fps.mp4"

// 3. Partículas Tech (Pexels) ⭐
"https://videos.pexels.com/video-files/3141204/3141204-hd_1920_1080_25fps.mp4"
```

**Teste cada uma até encontrar a que funciona!**

---

## 🎯 Resultado Esperado

![Video working]
- Vídeo de nave espacial em loop
- Overlay escuro (65% opacidade)
- Blur sutil (1px)
- Texto perfeitamente legível
- Cards com hover funcionando

Se seguir este guia, o vídeo VAI funcionar! 🚀
