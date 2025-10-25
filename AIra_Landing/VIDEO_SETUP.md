# 🎬 Configuração do Vídeo de Fundo

## 📥 Como Baixar o Vídeo

### Opção 1: Download Direto do Pixabay

1. Acesse: https://pixabay.com/videos/ai-generated-spaceship-sky-sci-fi-200735/
2. Clique no botão **"Free Download"**
3. Selecione a resolução desejada:
   - **1920x1080 (Full HD)** - Recomendado para desktop
   - **1280x720 (HD)** - Mais leve, bom para performance
   - **640x360 (SD)** - Muito leve, para conexões lentas

### Opção 2: Vídeo Alternativo (Se Pixabay não funcionar)

Você pode usar qualquer vídeo de nave espacial/sci-fi. Recomendações:
- **Pexels**: https://www.pexels.com/search/videos/spaceship/
- **Mixkit**: https://mixkit.co/free-stock-video/spaceship/
- **Coverr**: https://coverr.co/s/space

---

## 📁 Onde Colocar o Vídeo

### Passo 1: Renomear o Vídeo

Renomeie o arquivo baixado para:
```
spaceship-bg.mp4
```

### Passo 2: Mover para a Pasta Public

Coloque o vídeo na pasta:
```
AIra_Landing/public/spaceship-bg.mp4
```

**Estrutura de pastas:**
```
AIra_Landing/
├── public/
│   ├── spaceship-bg.mp4  ← COLOQUE AQUI
│   ├── vite.svg
│   └── checkout.html
├── src/
└── package.json
```

---

## ⚙️ Configurações do Vídeo

O componente `VideoBackground` está configurado com:

### Configurações Atuais:
- **Overlay**: Gradiente escuro (75% opacidade)
- **Blur**: 2px (leve desfoque para suavizar)
- **Autoplay**: Sim (automático)
- **Loop**: Sim (repete infinitamente)
- **Muted**: Sim (sem som)
- **Lazy Loading**: Sim (carrega só quando visível)

### Otimizações Mobile:
- ✅ **Desabilitado em mobile** (economiza dados)
- ✅ **Desabilitado em conexões lentas** (2G/3G)
- ✅ Fallback para imagem estática se necessário

---

## 🎨 Personalizar o Vídeo

### Alterar Opacidade do Overlay

No arquivo `App.jsx`, linha 875-880:

```jsx
<VideoBackground
  videoUrl="/spaceship-bg.mp4"
  overlay="gradient"
  overlayOpacity={0.75}  // ← Mudar de 0 (transparente) a 1 (opaco)
  blur={2}
/>
```

### Alterar o Blur

```jsx
blur={2}  // ← Mudar de 0 (nítido) a 10 (muito desfocado)
```

### Alterar Tipo de Overlay

```jsx
overlay="gradient"  // Opções: 'dark', 'gradient', 'none'
```

**Exemplos:**
- `overlay="dark"` - Overlay escuro uniforme
- `overlay="gradient"` - Gradiente (mais escuro no meio)
- `overlay="none"` - Sem overlay (pode dificultar leitura)

---

## 🔧 Troubleshooting

### ❌ Vídeo não aparece

**Causas possíveis:**
1. Arquivo não está na pasta `public/`
2. Nome do arquivo está diferente de `spaceship-bg.mp4`
3. Formato incompatível (use `.mp4`)

**Solução:**
```bash
# Verificar se arquivo existe
ls public/spaceship-bg.mp4

# Se não existir, colocar o vídeo lá
```

### ❌ Vídeo não inicia automaticamente

**Causa:** Navegador bloqueou autoplay

**Solução:** O vídeo está configurado como `muted` (sem som), que permite autoplay. Se ainda assim não funcionar, é política do navegador.

### ❌ Performance ruim

**Soluções:**
1. Use resolução menor (720p em vez de 1080p)
2. Comprima o vídeo com HandBrake ou FFmpeg
3. Aumente o blur para `blur={5}` (menos detalhes = melhor performance)

---

## 🎥 Comprimir Vídeo (Opcional)

Se o vídeo estiver muito pesado, use FFmpeg:

```bash
# Comprimir para 720p com qualidade otimizada
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 -preset fast spaceship-bg.mp4
```

**Parâmetros:**
- `-vf scale=1280:720` - Redimensionar para 720p
- `-crf 28` - Qualidade (menor = melhor, 18-28 é bom)
- `-preset fast` - Velocidade de compressão

---

## ✅ Checklist Final

- [ ] Vídeo baixado do Pixabay
- [ ] Renomeado para `spaceship-bg.mp4`
- [ ] Colocado em `AIra_Landing/public/`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Testado no navegador
- [ ] Overlay configurado para legibilidade

---

## 🎯 Resultado Esperado

Após configurar corretamente, você verá:

1. ✨ Vídeo de nave espacial em loop no fundo
2. 🌫️ Overlay escuro gradiente para legibilidade
3. 📝 Texto dos cards perfeitamente legível
4. 🚀 Efeito futurista e imersivo
5. 📱 Mobile mostra versão estática (performance)

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique console do navegador (F12 → Console)
2. Confirme caminho do arquivo
3. Teste com vídeo menor primeiro
4. Ajuste overlay/blur conforme necessário

**Dica:** Comece com `overlayOpacity={0.8}` e `blur={3}` se texto ficar difícil de ler.
