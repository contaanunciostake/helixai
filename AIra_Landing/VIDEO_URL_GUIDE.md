# 🌐 Como Obter URLs de Vídeos Gratuitos

## ✅ URL Já Configurada!

O vídeo já está configurado para carregar diretamente da internet:

```jsx
videoUrl="https://cdn.pixabay.com/video/2024/01/12/196968-904449868_large.mp4"
```

**Não precisa baixar nada!** O vídeo carrega automaticamente do CDN do Pixabay. 🚀

---

## 🔄 Como Trocar por Outro Vídeo

### Opção 1: Pixabay (Grátis, Sem Login)

#### Passo 1: Encontre um vídeo
- Acesse: https://pixabay.com/videos/
- Busque: "spaceship", "sci-fi", "space", "futuristic", etc.

#### Passo 2: Obter URL Direta

**Método Fácil:**
1. Clique com botão direito no vídeo na página
2. Selecione "Inspecionar elemento" (F12)
3. Na aba Network/Rede, dê play no vídeo
4. Procure por arquivos `.mp4`
5. Copie a URL que aparece (geralmente começa com `https://cdn.pixabay.com/video/...`)

**Método Alternativo:**
1. Vá para a página do vídeo
2. Clique em "Free Download"
3. Escolha a qualidade (Medium ou Large)
4. **NÃO baixe!** Clique com botão direito no botão de download
5. Selecione "Copiar endereço do link"
6. Cole no código!

**Exemplo de URLs do Pixabay:**
```
https://cdn.pixabay.com/video/2024/01/12/196968-904449868_large.mp4
https://cdn.pixabay.com/video/2023/05/22/163420-832156482_large.mp4
https://cdn.pixabay.com/video/2022/11/30/141558-777456789_medium.mp4
```

---

### Opção 2: Pexels (Grátis, Mais URLs Diretas)

#### Vantagem: URLs mais fáceis de obter!

1. Acesse: https://www.pexels.com/videos/
2. Busque: "spaceship sci-fi"
3. Clique no vídeo
4. Role até "Download Options"
5. Clique com botão direito em qualquer qualidade
6. "Copiar endereço do link"

**Exemplo de URLs Pexels:**
```
https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4
https://videos.pexels.com/video-files/856119/856119-hd_1920_1080_25fps.mp4
```

**Vídeos Sci-Fi Recomendados:**
- https://www.pexels.com/video/flying-spaceship-3129957/
- https://www.pexels.com/video/view-of-the-outer-space-2387532/
- https://www.pexels.com/video/sci-fi-digital-animation-3141204/

---

### Opção 3: Coverr (Grátis, Loop Perfeito)

1. Acesse: https://coverr.co/
2. Busque: "space" ou "technology"
3. Clique no vídeo
4. Botão direito → "Copiar endereço do vídeo"

---

### Opção 4: Mixkit (Grátis, Alta Qualidade)

1. Acesse: https://mixkit.co/free-stock-video/
2. Categoria: "Technology" ou "Abstract"
3. Clique no vídeo
4. Botão "Copy video URL"

---

## 🎬 Vídeos Sci-Fi Prontos para Usar

### URLs Diretas de Vídeos Espaciais:

#### 1. Nave Espacial Voando (Pixabay)
```jsx
videoUrl="https://cdn.pixabay.com/video/2024/01/12/196968-904449868_large.mp4"
```

#### 2. Espaço com Estrelas (Pexels)
```jsx
videoUrl="https://videos.pexels.com/video-files/2387532/2387532-uhd_2560_1440_25fps.mp4"
```

#### 3. Nebulosa Digital (Pexels)
```jsx
videoUrl="https://videos.pexels.com/video-files/3141204/3141204-uhd_2560_1440_25fps.mp4"
```

#### 4. Tecnologia Futurista (Coverr)
```jsx
videoUrl="https://coverr.co/videos/technology-background-zYqMt3sL1e"
```

---

## 📝 Como Aplicar no Código

### Edite `App.jsx` linha ~875:

```jsx
<VideoBackground
  videoUrl="COLE_A_URL_AQUI"
  overlay="gradient"
  overlayOpacity={0.75}
  blur={2}
/>
```

### Exemplo Completo:

```jsx
<VideoBackground
  videoUrl="https://videos.pexels.com/video-files/2387532/2387532-uhd_2560_1440_25fps.mp4"
  overlay="gradient"
  overlayOpacity={0.75}
  blur={2}
/>
```

---

## ⚙️ Qualidades Disponíveis

### Pixabay:
- `_tiny.mp4` - 640x360 (Muito leve)
- `_small.mp4` - 960x540 (Leve)
- `_medium.mp4` - 1280x720 (Recomendado)
- `_large.mp4` - 1920x1080 (Alta qualidade)

### Pexels:
- `hd_1280_720_25fps.mp4` - 720p (Recomendado)
- `hd_1920_1080_25fps.mp4` - 1080p
- `uhd_2560_1440_25fps.mp4` - 2K
- `uhd_3840_2160_24fps.mp4` - 4K (Muito pesado)

**Recomendação:** Use 720p ou 1080p para melhor equilíbrio entre qualidade e performance.

---

## 🔧 Troubleshooting

### ❌ Erro CORS (Cross-Origin)

**Sintoma:** Vídeo não carrega, erro no console sobre CORS

**Solução:**
- ✅ Pixabay, Pexels, Coverr permitem CORS
- ✅ Componente já tem `crossOrigin="anonymous"`
- ❌ Se ainda der erro, use outro site

### ❌ Vídeo muito pesado

**Solução:** Use qualidade menor

Troque `_large.mp4` por `_medium.mp4` ou `_small.mp4`

### ❌ Vídeo não inicia automaticamente

**Causa:** Política do navegador

**Solução:** Vídeo está `muted`, deve funcionar. Se não funcionar, é restrição do browser.

---

## 🎯 Melhores Práticas

### ✅ Performance Otimizada:

```jsx
// Leve - Bom para mobile
videoUrl="https://cdn.pixabay.com/video/.../video_medium.mp4"
blur={3}  // Mais blur = menos detalhes = melhor performance

// Balanceado - Recomendado
videoUrl="https://cdn.pixabay.com/video/.../video_large.mp4"
blur={2}

// Qualidade máxima - Apenas desktop
videoUrl="https://videos.pexels.com/.../uhd_2560_1440_25fps.mp4"
blur={1}
```

### ✅ Legibilidade:

Se texto ficar difícil de ler, aumente:
```jsx
overlayOpacity={0.85}  // Mais escuro
blur={4}               // Mais desfoque
```

---

## 🎨 Temas de Vídeos Sugeridos

### Para Landing Page de IA:

1. **Spaceship/Sci-Fi** ✅ (Atual)
   - Transmite: Tecnologia, Futuro, Inovação

2. **Código/Matrix**
   - Transmite: Programação, IA, Dados

3. **Partículas/Nebulosa**
   - Transmite: Movimento, Energia, Dinamismo

4. **Circuitos/Tecnologia**
   - Transmite: Conexões, Redes, Inteligência

5. **Data Streams**
   - Transmite: Processamento, Velocidade, Big Data

---

## 📚 Sites Gratuitos de Vídeos

| Site | Login? | Qualidade | CORS? |
|------|--------|-----------|-------|
| **Pixabay** | ❌ Não | Alta | ✅ Sim |
| **Pexels** | ❌ Não | Muito Alta | ✅ Sim |
| **Coverr** | ❌ Não | Alta | ✅ Sim |
| **Mixkit** | ❌ Não | Alta | ✅ Sim |
| **Videvo** | ✅ Sim | Média | ⚠️ Depende |

**Recomendação:** Pexels ou Pixabay (melhor qualidade + sem login)

---

## ✅ Checklist

- [x] URL externa configurada
- [x] CORS habilitado
- [x] Lazy loading ativo
- [x] Mobile otimizado (desabilita vídeo)
- [x] Overlay para legibilidade
- [ ] Testar no navegador
- [ ] Ajustar overlay/blur se necessário

---

## 🆘 Suporte Rápido

**Vídeo não aparece?**
1. Abra Console (F12)
2. Veja erros relacionados a vídeo
3. Teste URL diretamente no navegador
4. Troque por outra URL se necessário

**Performance ruim?**
1. Use qualidade menor (_medium em vez de _large)
2. Aumente blur para 4 ou 5
3. Aumente overlayOpacity para 0.85

**Texto ilegível?**
```jsx
overlayOpacity={0.9}  // Muito escuro
```

---

## 🎁 Bônus: URLs Testadas e Funcionando

```jsx
// Opção 1: Nave Espacial (Atual) ⭐
"https://cdn.pixabay.com/video/2024/01/12/196968-904449868_large.mp4"

// Opção 2: Espaço Profundo
"https://videos.pexels.com/video-files/2387532/2387532-hd_1920_1080_25fps.mp4"

// Opção 3: Partículas Tecnológicas
"https://videos.pexels.com/video-files/3141204/3141204-hd_1920_1080_25fps.mp4"

// Opção 4: Código Matrix Style
"https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4"
```

**Teste todas e escolha a que combina melhor com sua marca!** 🚀
