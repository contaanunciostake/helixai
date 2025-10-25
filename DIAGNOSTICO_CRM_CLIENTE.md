# Diagnóstico - CRM Cliente (Tela Branca)

## Problema Identificado

O CRM Cliente (http://localhost:5177/) está exibindo tela branca.

## Possíveis Causas

### 1. Erro no Console do Navegador
- Pressione F12 no navegador
- Vá na aba "Console"
- Verifique se há erros em vermelho

### 2. Bibliotecas Faltando
O App.jsx usa estas bibliotecas que podem estar faltando:
- `@hello-pangea/dnd` (para drag and drop)
- `qrcode.react` (para QR Code)
- `lucide-react` (ícones)
- `@/components/ui/*` (componentes shadcn/ui)

### 3. Verificar Dependências

Execute no terminal (dentro da pasta CRM_Client/crm-client-app):

```bash
npm list @hello-pangea/dnd
npm list qrcode.react
npm list lucide-react
```

Se qualquer uma não estiver instalada, execute:

```bash
npm install @hello-pangea/dnd qrcode.react lucide-react
```

### 4. Verificar Vite Config

O arquivo vite.config.js pode ter problema com o alias `@`:

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### 5. Teste Rápido

Substitua temporariamente o conteúdo de `src/App.jsx` por:

```jsx
function App() {
  return (
    <div style={{padding: '20px', color: 'white', background: '#000'}}>
      <h1>CRM Cliente - Teste</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
    </div>
  )
}

export default App
```

Se isso funcionar, o problema é com algum componente ou biblioteca específica.

## Solução Rápida

Execute estes comandos na pasta `CRM_Client/crm-client-app`:

```bash
npm install @hello-pangea/dnd qrcode.react
npm run dev
```

## Verificar Logs

Olhe o terminal onde o CRM Cliente está rodando e procure por:
- Erros de import
- Avisos de módulos faltando
- Problemas de compilação

## Próximos Passos

Se nada acima funcionar:
1. Pare o servidor (Ctrl+C)
2. Delete `node_modules`
3. Execute `npm install`
4. Execute `npm run dev` novamente
