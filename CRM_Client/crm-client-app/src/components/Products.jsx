import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package, Upload, Download, Search, Edit, Trash2, Plus,
  AlertCircle, CheckCircle, X, Eye, DollarSign, Package2,
  FileText, TrendingUp, Database, RefreshCw, Car, Filter, Image
} from 'lucide-react';

const API_URL = 'http://localhost:5000'; // Backend Flask

export default function Products({ user, nicho }) {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para importação CSV
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Estados para edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para histórico de importações
  const [importHistory, setImportHistory] = useState([]);

  const empresaId = user?.empresa_id;

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/veiculos?empresa_id=${empresaId}&page=${currentPage}&limit=20`,
        {
          headers: {
            'X-Empresa-ID': empresaId.toString()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('[Products] Erro ao carregar veículos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/veiculos/stats?empresa_id=${empresaId}`,
        {
          headers: {
            'X-Empresa-ID': empresaId.toString()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('[Products] Erro ao carregar estatísticas:', error);
      setStats(null);
    }
  };

  // Carregar histórico de importações
  const loadImportHistory = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/produtos/importacoes?empresa_id=${empresaId}`,
        {
          headers: {
            'X-Empresa-ID': empresaId.toString()
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setImportHistory(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadProducts();
      loadStats();
      loadImportHistory();
    }
  }, [empresaId, currentPage, searchTerm]);

  // Importar CSV
  const handleImportCSV = async () => {
    if (!csvFile) return;

    try {
      setIsImporting(true);
      setImportResult(null);

      const formData = new FormData();
      formData.append('arquivo', csvFile);

      const response = await fetch(
        `${API_URL}/api/produtos/import-csv?empresa_id=${empresaId}`,
        {
          method: 'POST',
          headers: {
            'X-Empresa-ID': empresaId.toString()
          },
          body: formData
        }
      );

      const data = await response.json();

      if (data.success) {
        setImportResult({
          success: true,
          message: data.message,
          details: data.data
        });

        // Recarregar produtos e estatísticas
        setTimeout(() => {
          loadProducts();
          loadStats();
          loadImportHistory();
          setIsImportDialogOpen(false);
          setCsvFile(null);
          setImportResult(null);
        }, 3000);
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Erro ao importar CSV'
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `Erro: ${error.message}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Download template CSV
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/veiculos/template-csv`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${nicho || 'produtos'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar template:', error);
    }
  };

  // Editar produto
  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      setIsSaving(true);

      const response = await fetch(
        `${API_URL}/api/produtos/${editingProduct.id}?empresa_id=${empresaId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Empresa-ID': empresaId.toString()
          },
          body: JSON.stringify(editingProduct)
        }
      );

      const data = await response.json();

      if (data.success) {
        // Recarregar produtos
        loadProducts();
        loadStats();
        setIsEditDialogOpen(false);
        setEditingProduct(null);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Deletar produto
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const response = await fetch(
        `${API_URL}/api/produtos/${productId}?empresa_id=${empresaId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Empresa-ID': empresaId.toString()
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        loadProducts();
        loadStats();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert(`Erro ao deletar: ${error.message}`);
    }
  };

  // Abrir modal de edição
  const openEditDialog = (product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="relative min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Gestão de Produtos
            </h1>
            <p className="text-white/60 mt-2">
              Gerencie seu catálogo de {nicho === 'veiculos' ? 'veículos' : 'produtos'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>

            <Button
              onClick={() => setIsImportDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Total de Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.total_produtos || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Disponíveis
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.disponiveis || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(stats.valor_estoque || stats.valor_total_estoque || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Produtos / Histórico */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="products" className="data-[state=active]:bg-green-500/20">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-green-500/20">
            <FileText className="h-4 w-4 mr-2" />
            Histórico de Importações
          </TabsTrigger>
        </TabsList>

        {/* Aba Produtos */}
        <TabsContent value="products" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  Lista de {nicho === 'veiculos' ? 'Veículos' : 'Produtos'}
                </CardTitle>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <Button
                    onClick={loadProducts}
                    variant="outline"
                    size="icon"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    Importe produtos usando CSV ou adicione manualmente
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        {nicho === 'veiculos' ? (
                          <>
                            <TableHead className="text-white/70">Veículo</TableHead>
                            <TableHead className="text-white/70">Ano</TableHead>
                            <TableHead className="text-white/70">KM</TableHead>
                            <TableHead className="text-white/70">Preço</TableHead>
                            <TableHead className="text-white/70">Status</TableHead>
                            <TableHead className="text-white/70 text-right">Ações</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead className="text-white/70">Produto</TableHead>
                            <TableHead className="text-white/70">Categoria</TableHead>
                            <TableHead className="text-white/70">Preço</TableHead>
                            <TableHead className="text-white/70">Estoque</TableHead>
                            <TableHead className="text-white/70">Status</TableHead>
                            <TableHead className="text-white/70 text-right">Ações</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                          {nicho === 'veiculos' ? (
                            <>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {product.imagem_url ? (
                                    <img
                                      src={product.imagem_url}
                                      alt={product.nome}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                                      <Car className="h-6 w-6 text-white/40" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-white">
                                      {product.marca} {product.modelo}
                                    </div>
                                    <div className="text-sm text-white/60">
                                      {product.versao}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/80">{product.ano}</TableCell>
                              <TableCell className="text-white/80">{product.quilometragem || '-'}</TableCell>
                              <TableCell className="text-white/80 font-semibold">
                                {formatCurrency(product.preco)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={product.disponivel ? 'default' : 'secondary'}
                                  className={product.disponivel
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                  }
                                >
                                  {product.disponivel ? 'Disponível' : 'Indisponível'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    onClick={() => openEditDialog(product)}
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-white/10 text-white/60 hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {product.imagem_url ? (
                                    <img
                                      src={product.imagem_url}
                                      alt={product.nome}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                                      <Package className="h-6 w-6 text-white/40" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-white">{product.nome}</div>
                                    <div className="text-sm text-white/60">{product.marca || '-'}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/80">{product.categoria || '-'}</TableCell>
                              <TableCell className="text-white/80 font-semibold">
                                {formatCurrency(product.preco)}
                              </TableCell>
                              <TableCell className="text-white/80">{product.estoque || 0}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={product.disponivel ? 'default' : 'secondary'}
                                  className={product.disponivel
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                  }
                                >
                                  {product.disponivel ? 'Disponível' : 'Indisponível'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    onClick={() => openEditDialog(product)}
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-white/10 text-white/60 hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-white/60">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-50"
                        >
                          Anterior
                        </Button>
                        <Button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-50"
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Histórico */}
        <TabsContent value="history" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Importações</CardTitle>
              <CardDescription className="text-white/60">
                Últimas importações de produtos via CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Nenhuma importação realizada ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/70">Arquivo</TableHead>
                      <TableHead className="text-white/70">Total</TableHead>
                      <TableHead className="text-white/70">Sucesso</TableHead>
                      <TableHead className="text-white/70">Erros</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((imp) => (
                      <TableRow key={imp.id} className="border-white/10">
                        <TableCell className="text-white">{imp.nome_arquivo}</TableCell>
                        <TableCell className="text-white/80">{imp.total_linhas || 0}</TableCell>
                        <TableCell className="text-green-400">{imp.importados_sucesso || 0}</TableCell>
                        <TableCell className="text-red-400">{imp.importados_erro || 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant={imp.status === 'concluido' ? 'default' : 'secondary'}
                            className={imp.status === 'concluido'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {imp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60">
                          {imp.criado_em ? new Date(imp.criado_em).toLocaleString('pt-BR') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Importar CSV */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Importar Produtos via CSV</DialogTitle>
            <DialogDescription className="text-white/60">
              Faça upload de um arquivo CSV com seus produtos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file" className="text-white/80">
                Arquivo CSV
              </Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
              <p className="text-xs text-white/40 mt-2">
                Formatos aceitos: .csv (UTF-8)
              </p>
            </div>

            {importResult && (
              <Alert variant={importResult.success ? 'default' : 'destructive'}>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {importResult.message}
                  {importResult.details && (
                    <div className="mt-2 text-sm">
                      <p>Total: {importResult.details.total_linhas}</p>
                      <p>Importados: {importResult.details.importados_sucesso}</p>
                      <p>Erros: {importResult.details.importados_erro}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsImportDialogOpen(false);
                setCsvFile(null);
                setImportResult(null);
              }}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImportCSV}
              disabled={!csvFile || isImporting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Editar {nicho === 'veiculos' ? 'Veículo' : 'Produto'}
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4">
              {nicho === 'veiculos' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Marca</Label>
                      <Input
                        value={editingProduct.marca || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, marca: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Modelo</Label>
                      <Input
                        value={editingProduct.modelo || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, modelo: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Versão</Label>
                    <Input
                      value={editingProduct.versao || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, versao: e.target.value})}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Ano</Label>
                      <Input
                        value={editingProduct.ano_modelo || editingProduct.ano || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, ano_modelo: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Preço</Label>
                      <Input
                        type="number"
                        value={editingProduct.preco || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, preco: parseFloat(e.target.value)})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Quilometragem</Label>
                      <Input
                        value={editingProduct.quilometragem || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, quilometragem: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Cor</Label>
                      <Input
                        value={editingProduct.cor || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, cor: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Descrição</Label>
                    <textarea
                      value={editingProduct.descricao || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, descricao: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white mt-2"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.disponivel || false}
                        onChange={(e) => setEditingProduct({...editingProduct, disponivel: e.target.checked})}
                        className="rounded"
                      />
                      Disponível
                    </label>
                    <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.destaque || false}
                        onChange={(e) => setEditingProduct({...editingProduct, destaque: e.target.checked})}
                        className="rounded"
                      />
                      Destaque
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-white/80">Nome</Label>
                    <Input
                      value={editingProduct.nome || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, nome: e.target.value})}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Categoria</Label>
                      <Input
                        value={editingProduct.categoria || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, categoria: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Marca</Label>
                      <Input
                        value={editingProduct.marca || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, marca: e.target.value})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Preço</Label>
                      <Input
                        type="number"
                        value={editingProduct.preco || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, preco: parseFloat(e.target.value)})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Estoque</Label>
                      <Input
                        type="number"
                        value={editingProduct.estoque || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, estoque: parseInt(e.target.value)})}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Descrição</Label>
                    <textarea
                      value={editingProduct.descricao || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, descricao: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.disponivel || false}
                        onChange={(e) => setEditingProduct({...editingProduct, disponivel: e.target.checked})}
                        className="rounded"
                      />
                      Disponível
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingProduct(null);
              }}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditProduct}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
