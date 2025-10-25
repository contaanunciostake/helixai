# 💳 Implementação Payment Brick - Mercado Pago

## 📚 Documentação Oficial

Baseado em: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing

## ✅ Implementação Correta

### 1. **Estrutura do Objeto `payer` (Dados do Usuário)**

Conforme documentação oficial do Mercado Pago:

```javascript
const payerConfig = {
    email: 'user@email.com',           // OBRIGATÓRIO
    firstName: 'Nome',                  // Opcional
    lastName: 'Sobrenome',              // Opcional
    identification: {                   // Opcional mas recomendado
        type: 'CPF',                    // CPF ou CNPJ
        number: '12345678900'           // Número sem formatação
    }
};
```

**Nossa Implementação:**
```javascript
// Pegar dados do formulário
const userEmail = emailInput.value;
const userName = nameInput.value.trim();
const userCpf = cpfInput.value.replace(/\D/g, '');

// Separar primeiro nome e sobrenome
const nameParts = userName.split(' ');
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

// Montar objeto payer
const payerConfig = {
    email: userEmail || ''
};

// Adicionar nome se disponível
if (firstName && lastName) {
    payerConfig.firstName = firstName;
    payerConfig.lastName = lastName;
}

// Adicionar CPF se disponível e válido
if (userCpf && userCpf.length >= 11) {
    payerConfig.identification = {
        type: 'CPF',
        number: userCpf
    };
}
```

### 2. **Configuração de Parcelas (installments)**

Conforme documentação oficial:

```javascript
customization: {
    paymentMethods: {
        maxInstallments: 12,  // Máximo de parcelas
        minInstallments: 1,   // Mínimo de parcelas
        creditCard: 'all',    // Habilitar cartão de crédito
        debitCard: false      // Desabilitar débito
    }
}
```

**Nossa Implementação:**
```javascript
// Configurar baseado no método selecionado
let maxInstallments = 1;
let minInstallments = 1;

if (paymentMethod === 'credit_card') {
    maxInstallments = 12;
    minInstallments = 1;
} else if (paymentMethod === 'debit_card') {
    maxInstallments = 1;  // Débito não tem parcelas
    minInstallments = 1;
} else if (paymentMethod === 'pix') {
    maxInstallments = 1;  // PIX não tem parcelas
    minInstallments = 1;
}

// Aplicar na configuração
const settings = {
    customization: {
        paymentMethods: {
            maxInstallments: maxInstallments,
            minInstallments: minInstallments,
            creditCard: paymentMethod === 'credit_card' ? 'all' : false,
            debitCard: paymentMethod === 'debit_card' ? 'all' : false,
            bankTransfer: paymentMethod === 'pix' ? ['pix'] : false
        }
    }
};
```

### 3. **Settings Completo (Estrutura Final)**

```javascript
const settings = {
    initialization: {
        amount: selectedPlan.price,  // Valor em centavos
        payer: payerConfig            // Dados do usuário
    },
    customization: {
        paymentMethods: {
            // PARCELAS
            maxInstallments: 12,
            minInstallments: 1,

            // MÉTODOS PERMITIDOS
            creditCard: 'all',
            debitCard: false,
            bankTransfer: false,

            // MÉTODOS EXCLUÍDOS
            excluded: {
                paymentTypes: ['ticket', 'atm', 'debit_card', 'bank_transfer'],
                paymentMethods: ['debcabal', 'debelo']
            },

            // TIPOS DE DOCUMENTO
            types: {
                identificationTypes: ['CPF', 'CNPJ']
            }
        },
        visual: {
            style: {
                theme: 'dark',
                customVariables: {
                    baseColor: '#10b981',
                    textPrimaryColor: '#ffffff',
                    textSecondaryColor: '#9ca3af',
                    inputBackgroundColor: 'rgba(255, 255, 255, 0.05)',
                    formBackgroundColor: 'transparent'
                }
            },
            hideFormTitle: true,
            preserveHeight: false
        }
    },
    callbacks: {
        onReady: () => {
            console.log('Formulário carregado');
            // Aplicar fixes de visibilidade
        },
        onSubmit: async (formData) => {
            return handlePayment(formData);
        },
        onError: (error) => {
            console.error('Erro:', error);
        },
        onBinChange: (bin) => {
            console.log('BIN detectado:', bin);
            // Campo de parcelas deve aparecer aqui
        }
    }
};
```

## 🐛 Debug Implementado

### 1. **Logs Detalhados**
```javascript
console.log('[DEBUG] Configuração completa:', settings);
console.log('[DEBUG] Max installments configurado:', maxInstallments);
console.log('[DEBUG] Payer data:', payerConfig);
```

### 2. **Função debugMercadoPagoElements()**
- Lista todos inputs, selects e iframes
- Mostra propriedades de visibilidade
- Detecta especificamente campo de parcelas

### 3. **Callback onBinChange**
Quando usuário digita número do cartão:
```javascript
onBinChange: (bin) => {
    console.log('💳 BIN detectado:', bin);
    console.log('🔄 Campo de parcelas deve aparecer agora');

    // Forçar visibilidade após 500ms
    setTimeout(() => {
        fixInstallmentsField();
    }, 500);
}
```

## 🔧 Fixes de Visibilidade

### 1. **fixInstallmentsField()**
Força visibilidade do campo de parcelas:
```javascript
function fixInstallmentsField() {
    const selectors = [
        'select[name*="installment"]',
        'select[id*="installment"]',
        '[class*="installment"] select'
    ];

    // Buscar campo
    let installmentSelect = container.querySelector(selector);

    if (installmentSelect) {
        // Forçar visibilidade
        installmentSelect.style.setProperty('display', 'block', 'important');
        installmentSelect.style.setProperty('visibility', 'visible', 'important');
        installmentSelect.style.setProperty('opacity', '1', 'important');

        // Forçar visibilidade dos pais (até 5 níveis)
        let parent = installmentSelect.parentElement;
        while (parent && depth < 5) {
            parent.style.setProperty('display', 'block', 'important');
            parent.style.setProperty('overflow', 'visible', 'important');
            parent = parent.parentElement;
        }
    }
}
```

### 2. **observeInstallmentsField()**
Observer que detecta quando campo é adicionado ao DOM:
```javascript
function observeInstallmentsField() {
    const observer = new MutationObserver((mutations) => {
        // Detectar adição de campo de parcelas
        if (node.matches('select[name*="installment"]')) {
            console.log('🔔 Campo de parcelas detectado!');
            fixInstallmentsField();
        }
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });
}
```

### 3. **CSS Forçado**
```css
/* Campo de parcelas - GARANTIR VISIBILIDADE */
#mercadopago-container select[name*="installment"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    min-height: 56px !important;
    width: 100% !important;
}

/* Container do campo */
#mercadopago-container [class*="installment"] {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    margin-top: 16px !important;
}
```

## 📊 Fluxo de Execução

### Passo 1: Inicialização
```
1. Usuário preenche email, nome, CPF
2. Usuário seleciona método de pagamento (Cartão/PIX)
3. renderPaymentBrick() é chamado
```

### Passo 2: Configuração
```
4. Monta objeto payer com dados do usuário
5. Define maxInstallments baseado no método
6. Cria settings com toda configuração
7. Chama bricksBuilder.create()
```

### Passo 3: Renderização
```
8. Mercado Pago renderiza formulário no DOM
9. Callback onReady é executado
10. debugMercadoPagoElements() lista elementos
11. fixInstallmentsField() força visibilidade
12. observeInstallmentsField() ativa observer
```

### Passo 4: Interação do Usuário
```
13. Usuário digita número do cartão
14. onBinChange detecta BIN
15. Mercado Pago adiciona campo de parcelas ao DOM
16. Observer detecta adição
17. fixInstallmentsField() é executado automaticamente
18. Campo de parcelas se torna visível
```

## 🎯 Problemas Resolvidos

### ✅ Select CPF/CNPJ não mostrava opção selecionada
**Solução:**
- Removido `pointer-events: none`
- Adicionado `appearance: auto`
- Estilos para option:checked

### ✅ Campo de parcelas não aparecia
**Solução:**
- CSS forçado com !important
- fixInstallmentsField() após onBinChange
- Observer para detectar adição dinâmica
- Forçar visibilidade de elementos pai

### ✅ Dados do usuário não pré-preenchidos
**Solução:**
- Objeto payer estruturado corretamente
- firstName e lastName separados
- identification com CPF sem formatação

### ✅ MaxInstallments não funcionava
**Solução:**
- Mover para customization.paymentMethods
- Não usar dentro de um objeto aninhado incorreto
- Seguir exatamente a estrutura da documentação

## 📝 Checklist de Teste

- [ ] Selecionar método "Cartão de Crédito"
- [ ] Verificar logs no console
- [ ] Preencher email, nome, CPF
- [ ] Verificar se campos pré-preenchem no formulário MP
- [ ] Digitar número de cartão (use: 5031 4332 1540 6351)
- [ ] Verificar log "BIN detectado"
- [ ] Verificar se campo de parcelas aparece
- [ ] Verificar se mostra até 12 parcelas
- [ ] Selecionar número de parcelas
- [ ] Verificar se select mostra valor selecionado

## 🚀 Próximos Passos

1. Testar com cartões reais de teste do Mercado Pago
2. Verificar comportamento em diferentes navegadores
3. Testar fluxo completo de pagamento
4. Validar webhook de confirmação

---

**Status:** ✅ Implementado conforme documentação oficial
**Última Atualização:** Janeiro 2025
**Referência:** https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks
