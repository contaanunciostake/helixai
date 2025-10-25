/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: ContratoEditor - Editor de Contratos Editável
 * Permite editar todos os campos do contrato com preview ao vivo
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  Building2, User, Car, DollarSign, FileText,
  Download, Eye, Printer, Save, Edit3
} from 'lucide-react';
import { gerarContratoHTML } from '@/utils/contratoGenerator.js';

export default function ContratoEditor({
  isOpen,
  onClose,
  dadosIniciais,
  onSave,
  showNotification
}) {
  // Estados para cada seção de dados
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    rg: '',
    nacionalidade: 'brasileiro(a)',
    estado_civil: 'solteiro(a)',
    profissao: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  const [dadosVeiculo, setDadosVeiculo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    ano_fabricacao: '',
    ano_modelo: '',
    cor: '',
    placa: '',
    chassi: '',
    renavam: '',
    combustivel: 'Flex',
    km: 0,
    garantia_fabricante: ''
  });

  const [dadosFinanciamento, setDadosFinanciamento] = useState({
    valor_veiculo: 0,
    valor_entrada: 0,
    valor_financiado: 0,
    parcelas: 0,
    valor_parcela: 0,
    banco: '',
    taxa_juros: 0
  });

  const [mostrarPreview, setMostrarPreview] = useState(false);

  // Carregar dados iniciais quando o modal abrir
  useEffect(() => {
    if (isOpen && dadosIniciais) {
      setDadosEmpresa(dadosIniciais.dadosEmpresa || {});
      setDadosCliente(dadosIniciais.dadosCliente || {});
      setDadosVeiculo(dadosIniciais.dadosVeiculo || {});
      setDadosFinanciamento(dadosIniciais.dadosFinanciamento || {});
    }
  }, [isOpen, dadosIniciais]);

  // Função para gerar HTML do contrato com os dados atuais
  const gerarHTMLAtualizado = () => {
    return gerarContratoHTML(dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo);
  };

  // Visualizar contrato
  const handleVisualizar = () => {
    const htmlContrato = gerarHTMLAtualizado();
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(htmlContrato);
    novaJanela.document.close();

    setTimeout(() => {
      novaJanela.document.body.innerHTML += `
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
          <button onclick="window.print()" style="padding: 15px 30px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
            🖨️ Imprimir / Salvar como PDF
          </button>
        </div>
      `;
    }, 100);

    showNotification('Abrindo visualização do contrato...');
  };

  // Baixar contrato
  const handleBaixar = () => {
    const htmlContrato = gerarHTMLAtualizado();
    const blob = new Blob([htmlContrato], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const nomeArquivo = `Contrato_${dadosVeiculo.modelo.replace(/\s/g, '_')}_${dadosCliente.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showNotification('Contrato baixado com sucesso!');
  };

  // Imprimir contrato
  const handleImprimir = () => {
    const htmlContrato = gerarHTMLAtualizado();
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(htmlContrato);
    novaJanela.document.close();

    setTimeout(() => {
      novaJanela.print();
    }, 500);

    showNotification('Abrindo para impressão...');
  };

  // Salvar alterações
  const handleSalvar = () => {
    const dadosAtualizados = {
      dadosEmpresa,
      dadosCliente,
      dadosVeiculo,
      dadosFinanciamento,
      htmlContrato: gerarHTMLAtualizado()
    };

    if (onSave) {
      onSave(dadosAtualizados);
    }

    showNotification('Contrato salvo com sucesso!');
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit3 className="h-6 w-6 text-blue-400" />
            Editor de Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Botões de Ação */}
          <div className="flex gap-3 pb-4 border-b border-[#334155]">
            <Button
              onClick={handleVisualizar}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button
              onClick={handleBaixar}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button
              onClick={handleImprimir}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleSalvar}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>

          {/* Abas de Edição */}
          <Tabs defaultValue="empresa" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#0f172a]">
              <TabsTrigger value="empresa" className="data-[state=active]:bg-blue-600">
                <Building2 className="h-4 w-4 mr-2" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="cliente" className="data-[state=active]:bg-blue-600">
                <User className="h-4 w-4 mr-2" />
                Cliente
              </TabsTrigger>
              <TabsTrigger value="veiculo" className="data-[state=active]:bg-blue-600">
                <Car className="h-4 w-4 mr-2" />
                Veículo
              </TabsTrigger>
              <TabsTrigger value="financiamento" className="data-[state=active]:bg-blue-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Financiamento
              </TabsTrigger>
            </TabsList>

            {/* ABA: Dados da Empresa */}
            <TabsContent value="empresa">
              <Card className="bg-[#0f172a] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Dados da Empresa (Vendedora)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Razão Social</label>
                      <input
                        type="text"
                        value={dadosEmpresa.nome}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Nome Fantasia</label>
                      <input
                        type="text"
                        value={dadosEmpresa.nome_fantasia}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome_fantasia: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">CNPJ</label>
                      <input
                        type="text"
                        value={dadosEmpresa.cnpj}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, cnpj: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">CEP</label>
                      <input
                        type="text"
                        value={dadosEmpresa.cep}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, cep: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Endereço</label>
                    <input
                      type="text"
                      value={dadosEmpresa.endereco}
                      onChange={(e) => setDadosEmpresa({...dadosEmpresa, endereco: e.target.value})}
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Cidade</label>
                      <input
                        type="text"
                        value={dadosEmpresa.cidade}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, cidade: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Estado (UF)</label>
                      <input
                        type="text"
                        value={dadosEmpresa.estado}
                        onChange={(e) => setDadosEmpresa({...dadosEmpresa, estado: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SP"
                        maxLength="2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Dados do Cliente */}
            <TabsContent value="cliente">
              <Card className="bg-[#0f172a] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Dados do Cliente (Comprador)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={dadosCliente.nome}
                      onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})}
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">CPF</label>
                      <input
                        type="text"
                        value={dadosCliente.cpf}
                        onChange={(e) => setDadosCliente({...dadosCliente, cpf: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">RG</label>
                      <input
                        type="text"
                        value={dadosCliente.rg}
                        onChange={(e) => setDadosCliente({...dadosCliente, rg: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00.000.000-0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Nacionalidade</label>
                      <input
                        type="text"
                        value={dadosCliente.nacionalidade}
                        onChange={(e) => setDadosCliente({...dadosCliente, nacionalidade: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Estado Civil</label>
                      <select
                        value={dadosCliente.estado_civil}
                        onChange={(e) => setDadosCliente({...dadosCliente, estado_civil: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="solteiro(a)">Solteiro(a)</option>
                        <option value="casado(a)">Casado(a)</option>
                        <option value="divorciado(a)">Divorciado(a)</option>
                        <option value="viúvo(a)">Viúvo(a)</option>
                        <option value="união estável">União Estável</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Profissão</label>
                      <input
                        type="text"
                        value={dadosCliente.profissao}
                        onChange={(e) => setDadosCliente({...dadosCliente, profissao: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Telefone</label>
                      <input
                        type="text"
                        value={dadosCliente.telefone}
                        onChange={(e) => setDadosCliente({...dadosCliente, telefone: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Email</label>
                    <input
                      type="email"
                      value={dadosCliente.email}
                      onChange={(e) => setDadosCliente({...dadosCliente, email: e.target.value})}
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Endereço</label>
                    <input
                      type="text"
                      value={dadosCliente.endereco}
                      onChange={(e) => setDadosCliente({...dadosCliente, endereco: e.target.value})}
                      className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Cidade</label>
                      <input
                        type="text"
                        value={dadosCliente.cidade}
                        onChange={(e) => setDadosCliente({...dadosCliente, cidade: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Estado (UF)</label>
                      <input
                        type="text"
                        value={dadosCliente.estado}
                        onChange={(e) => setDadosCliente({...dadosCliente, estado: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SP"
                        maxLength="2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">CEP</label>
                      <input
                        type="text"
                        value={dadosCliente.cep}
                        onChange={(e) => setDadosCliente({...dadosCliente, cep: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Dados do Veículo */}
            <TabsContent value="veiculo">
              <Card className="bg-[#0f172a] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Dados do Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Marca</label>
                      <input
                        type="text"
                        value={dadosVeiculo.marca}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, marca: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Modelo Completo</label>
                      <input
                        type="text"
                        value={dadosVeiculo.modelo}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, modelo: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Ano Fabricação</label>
                      <input
                        type="text"
                        value={dadosVeiculo.ano_fabricacao}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, ano_fabricacao: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Ano Modelo</label>
                      <input
                        type="text"
                        value={dadosVeiculo.ano_modelo}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, ano_modelo: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Cor</label>
                      <input
                        type="text"
                        value={dadosVeiculo.cor}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, cor: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Placa</label>
                      <input
                        type="text"
                        value={dadosVeiculo.placa}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, placa: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">RENAVAM</label>
                      <input
                        type="text"
                        value={dadosVeiculo.renavam}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, renavam: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Chassi</label>
                      <input
                        type="text"
                        value={dadosVeiculo.chassi}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, chassi: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Combustível</label>
                      <select
                        value={dadosVeiculo.combustivel}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, combustivel: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Flex">Flex</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Elétrico">Elétrico</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="GNV">GNV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Quilometragem (km)</label>
                      <input
                        type="number"
                        value={dadosVeiculo.km}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, km: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Garantia de Fábrica</label>
                      <input
                        type="text"
                        value={dadosVeiculo.garantia_fabricante}
                        onChange={(e) => setDadosVeiculo({...dadosVeiculo, garantia_fabricante: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 31/12/2027"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA: Dados do Financiamento */}
            <TabsContent value="financiamento">
              <Card className="bg-[#0f172a] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-white">Dados do Financiamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Valor Total do Veículo</label>
                      <input
                        type="number"
                        value={dadosFinanciamento.valor_veiculo}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, valor_veiculo: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatPrice(dadosFinanciamento.valor_veiculo)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Valor da Entrada</label>
                      <input
                        type="number"
                        value={dadosFinanciamento.valor_entrada}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, valor_entrada: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatPrice(dadosFinanciamento.valor_entrada)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Valor Financiado</label>
                      <input
                        type="number"
                        value={dadosFinanciamento.valor_financiado}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, valor_financiado: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatPrice(dadosFinanciamento.valor_financiado)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Número de Parcelas</label>
                      <input
                        type="number"
                        value={dadosFinanciamento.parcelas}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, parcelas: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Valor da Parcela</label>
                      <input
                        type="number"
                        value={dadosFinanciamento.valor_parcela}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, valor_parcela: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formatPrice(dadosFinanciamento.valor_parcela)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Banco/Financeira</label>
                      <input
                        type="text"
                        value={dadosFinanciamento.banco}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, banco: e.target.value})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Banco Itaú"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Taxa de Juros (% a.m.)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={dadosFinanciamento.taxa_juros}
                        onChange={(e) => setDadosFinanciamento({...dadosFinanciamento, taxa_juros: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Resumo do Financiamento */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Resumo do Financiamento</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor Total:</span>
                        <span className="text-white font-semibold">{formatPrice(dadosFinanciamento.valor_veiculo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entrada:</span>
                        <span className="text-green-400 font-semibold">{formatPrice(dadosFinanciamento.valor_entrada)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Financiado:</span>
                        <span className="text-blue-400 font-semibold">{formatPrice(dadosFinanciamento.valor_financiado)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Parcelas:</span>
                        <span className="text-white font-semibold">{dadosFinanciamento.parcelas}x {formatPrice(dadosFinanciamento.valor_parcela)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
