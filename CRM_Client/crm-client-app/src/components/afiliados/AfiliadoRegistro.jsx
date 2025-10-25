import { useState } from 'react';
import { Award, User, CreditCard, Building, Check } from 'lucide-react';

export function AfiliadoRegistro({ onRegistroCompleto }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf_cnpj: '',
    telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix_tipo: 'cpf',
    pix_chave: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/afiliados/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert('Cadastro realizado com sucesso! Aguarde aprovação.');
        if (onRegistroCompleto) onRegistroCompleto();
      } else {
        alert(data.message || 'Erro ao registrar');
      }
    } catch (error) {
      console.error('[ERRO] Ao registrar afiliado:', error);
      alert('Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
          <Award className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Seja um Afiliado AIRA</h2>
        <p className="text-gray-400">
          Ganhe até 30% de comissão em cada venda + comissões recorrentes
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2].map(num => (
          <div key={num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= num
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-600 text-gray-500'
            }`}>
              {num}
            </div>
            {num < 2 && (
              <div className={`w-24 h-0.5 ${
                step > num ? 'bg-green-500' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    name="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold"
            >
              Próximo
            </button>
          </div>
        )}

        {/* Step 2: Dados Bancários */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Dados para Pagamento</h3>
              </div>

              <div className="space-y-4">
                {/* PIX */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Chave PIX
                  </label>
                  <select
                    name="pix_tipo"
                    value={formData.pix_tipo}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="chave_aleatoria">Chave Aleatória</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    name="pix_chave"
                    value={formData.pix_chave}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    placeholder="Sua chave PIX"
                    required
                  />
                </div>

                {/* Dados Bancários Opcionais */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-4">
                    Dados bancários (opcional)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Banco
                      </label>
                      <input
                        type="text"
                        name="banco"
                        value={formData.banco}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Ex: 001 - Banco do Brasil"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Tipo de Conta
                      </label>
                      <select
                        name="tipo_conta"
                        value={formData.tipo_conta}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="corrente">Corrente</option>
                        <option value="poupanca">Poupança</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Agência
                      </label>
                      <input
                        type="text"
                        name="agencia"
                        value={formData.agencia}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="0000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Conta
                      </label>
                      <input
                        type="text"
                        name="conta"
                        value={formData.conta}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="00000-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-semibold"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Benefícios */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">30% na 1ª Venda</h4>
          <p className="text-xs text-gray-400">Comissão na primeira compra</p>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">20% Recorrente</h4>
          <p className="text-xs text-gray-400">Comissão mensal vitalícia</p>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Bônus por Meta</h4>
          <p className="text-xs text-gray-400">Ganhe mais vendendo mais</p>
        </div>
      </div>
    </div>
  );
}
