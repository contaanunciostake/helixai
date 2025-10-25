# ⚠️ Erro 503 - API do Mercado Pago

## 🔴 Problema Identificado

```
api.mercadopago.com/v1/payment_methods/installments
Status: 503 (Service Unavailable)
```

### O que aconteceu:
Quando o usuário digita o número do cartão, o Mercado Pago faz uma chamada à API para buscar as opções de parcelas disponíveis. **A API do Mercado Pago retornou erro 503**, indicando que o serviço está temporariamente indisponível.

## 🚨 Erros que Estavam Acontecendo

### 1. **Loop Infinito - fixIdentificationTypeSelect**
```
[Checkout] Select de tipo de documento não encontrado, tentando novamente...
[Checkout] Select de tipo de documento não encontrado, tentando novamente...
[Checkout] Select de tipo de documento não encontrado, tentando novamente...
... (infinito)
```

**Causa:** Função chamava a si mesma sem limite de tentativas.

### 2. **Loop Infinito - fixInstallmentsField**
```
[Checkout] Campo de parcelas não encontrado, tentando novamente...
[Checkout] Campo de parcelas não encontrado, tentando novamente...
... (infinito)
```

**Causa:** Função chamava a si mesma sem limite de tentativas.

### 3. **Campo de Parcelas Nunca Aparecia**
**Causa:** Como a API retornou 503, o Mercado Pago nunca adicionou o campo de parcelas ao DOM.

## ✅ Correções Implementadas

### 1. **Limite de Tentativas para fixIdentificationTypeSelect**

**Antes:**
```javascript
if (!identificationSelect) {
    setTimeout(fixIdentificationTypeSelect, 500); // ❌ Infinito
}
```

**Depois:**
```javascript
let identificationFixAttempts = 0;
const MAX_IDENTIFICATION_FIX_ATTEMPTS = 5;

if (!identificationSelect) {
    identificationFixAttempts++;
    if (identificationFixAttempts <= MAX_IDENTIFICATION_FIX_ATTEMPTS) {
        setTimeout(fixIdentificationTypeSelect, 500);
    }
}
```

**Resultado:** Máximo de 5 tentativas, depois para.

### 2. **Limite de Tentativas para fixInstallmentsField**

**Antes:**
```javascript
if (!installmentSelect) {
    setTimeout(fixInstallmentsField, 500); // ❌ Infinito
}
```

**Depois:**
```javascript
let installmentFixAttempts = 0;
const MAX_INSTALLMENT_FIX_ATTEMPTS = 3;

if (!installmentSelect) {
    installmentFixAttempts++;
    if (installmentFixAttempts <= MAX_INSTALLMENT_FIX_ATTEMPTS) {
        setTimeout(fixInstallmentsField, 500);
    }
}
```

**Resultado:** Máximo de 3 tentativas, depois para.

### 3. **Tratamento Específico para Erro 503**

**Adicionado:**
```javascript
onError: (error) => {
    console.error('[Mercado Pago] ❌ Erro detectado:', error);

    let errorMessage = 'Erro ao processar pagamento. Tente novamente.';

    if (error.message.includes('503') || error.message.includes('Service')) {
        errorMessage = 'Serviço do Mercado Pago temporariamente indisponível. ' +
                      'Aguarde alguns segundos e tente novamente.';
        console.error('[Mercado Pago] API retornou erro 503 - Servidor temporariamente indisponível');

        // Mostrar mensagem visual
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <p>⚠️ Serviço temporariamente indisponível</p>
            <p>A API do Mercado Pago está com problemas.</p>
            <p>Aguarde alguns segundos e recarregue a página (F5).</p>
        `;
        container.appendChild(errorDiv);
    }

    showAlert(errorMessage);
}
```

### 4. **Prevenção de Event Listeners Duplicados**

**Adicionado:**
```javascript
// Adicionar evento apenas uma vez
if (!identificationSelect.dataset.eventAdded) {
    identificationSelect.dataset.eventAdded = 'true';
    identificationSelect.addEventListener('change', function(e) {
        console.log('[Checkout] Tipo de documento selecionado:', e.target.value);
    });
}
```

## 📊 Logs Esperados Agora

### ✅ Console Limpo (Sem Erros):
```
════════════════════════════════════════
[Mercado Pago] ✅ Brick carregado
[DEBUG] Método de pagamento: credit_card
[DEBUG] Max installments: 12
════════════════════════════════════════
💡 IMPORTANTE: Campo de parcelas aparece APÓS digitar número do cartão
════════════════════════════════════════
[Checkout] 👁️ Observer de parcelas ativado
[Checkout] Select de documento não encontrado (1/5)
[Checkout] Select de documento não encontrado (2/5)
... (até 5 tentativas e para)
```

### Quando Digitar Cartão (Sucesso):
```
════════════════════════════════════════
[Mercado Pago] 💳 BIN detectado: 503143
[Mercado Pago] Campo de parcelas será adicionado pelo Mercado Pago...
════════════════════════════════════════
[Checkout] 🔔 Campo de parcelas detectado via observer!
[Checkout] ✅ Campo de parcelas encontrado, aplicando fix
```

### Quando API Retornar 503 (Erro):
```
════════════════════════════════════════
[Mercado Pago] ❌ Erro detectado: {message: "Service Unavailable"}
════════════════════════════════════════
[Mercado Pago] API retornou erro 503 - Servidor temporariamente indisponível
[Mercado Pago] 💡 DICA: Aguarde 5-10 segundos e recarregue a página (F5)
```

**E no formulário aparece:**
```
⚠️ Serviço temporariamente indisponível
A API do Mercado Pago está com problemas.
Aguarde alguns segundos e recarregue a página (F5).
```

## 🎯 Sobre o Erro 503

### O que é?
**503 Service Unavailable** indica que o servidor está temporariamente indisponível. Isso pode acontecer por:

1. **Manutenção programada** do Mercado Pago
2. **Alta demanda** nos servidores
3. **Problema temporário** na infraestrutura
4. **Rate limiting** (muitas requisições)

### É Normal?
✅ Sim, é normal e **não é culpa do nosso código**.

APIs externas podem ter instabilidades momentâneas. O importante é:
- ✅ Detectar o erro
- ✅ Informar o usuário claramente
- ✅ Não travar a aplicação
- ✅ Permitir retry

### Como Testar?

**Cenário 1 - API Funcionando:**
1. Recarregue a página (CTRL + F5)
2. Preencha dados do formulário
3. Digite número do cartão: `5031 4332 1540 6351`
4. Campo de parcelas aparece normalmente ✅

**Cenário 2 - API com Erro 503:**
1. API retorna erro
2. Mensagem de erro aparece
3. Usuário é instruído a aguardar e recarregar
4. Sem loops infinitos no console ✅

## 🔧 Melhorias Adicionadas

### 1. Contadores de Tentativas
- `identificationFixAttempts` - Máximo 5 tentativas
- `installmentFixAttempts` - Máximo 3 tentativas

### 2. Reset de Contadores
```javascript
// Reset quando campo é encontrado
installmentFixAttempts = 0;
identificationFixAttempts = 0;

// Reset quando BIN é detectado
onBinChange: (bin) => {
    installmentFixAttempts = 0;
}
```

### 3. Mensagens Mais Claras
- ✅ Logs numerados: `(tentativa 1/3)`
- ✅ Emojis para fácil identificação
- ✅ Separadores visuais com `════════`
- ✅ Cores no console (erro em vermelho)

### 4. Tratamento Específico de Erros
- ✅ Erro 503 → Mensagem sobre serviço indisponível
- ✅ Erro de installments → Mensagem para redigitar cartão
- ✅ Outros erros → Mensagem genérica

## 📝 Próximos Passos

### Se API Continuar com 503:
1. **Aguardar 5-10 minutos** - Pode ser manutenção temporária
2. **Verificar status** do Mercado Pago: https://status.mercadopago.com/
3. **Testar em outro horário** - Pode ser pico de uso
4. **Usar cartão de teste diferente** - Alguns BINs podem ter problemas

### Se Quiser Forçar Retry:
Adicione botão "Tentar Novamente" que:
```javascript
function retryPaymentBrick() {
    // Reset contadores
    installmentFixAttempts = 0;
    identificationFixAttempts = 0;

    // Re-renderizar brick
    renderPaymentBrick(currentPaymentMethod);
}
```

## ✅ Status Atual

- ✅ Loops infinitos corrigidos
- ✅ Erro 503 detectado e tratado
- ✅ Mensagens claras para o usuário
- ✅ Contadores de tentativas implementados
- ✅ Event listeners sem duplicação
- ✅ Console limpo e organizado

---

**Importante:** O erro 503 é do lado do Mercado Pago, não do nosso código. Nosso código agora trata isso graciosamente e informa o usuário adequadamente! 🎉

**Última Atualização:** Janeiro 2025
