/**
 * TransactionsTable Component
 * Tabela de histórico de transações com paginação
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ChevronLeft, ChevronRight, Receipt, Filter } from 'lucide-react';
import { formatters } from '../../../services/dashboardService';
import { useTransactions } from '../../../hooks/useDashboard';

export function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError } = useTransactions({ page, limit });

  // Status badge colors
  const getStatusBadge = (status) => {
    const statusMap = {
      PAGO: { variant: 'default', className: 'bg-green-600' },
      PENDENTE: { variant: 'secondary', className: 'bg-yellow-600' },
      CANCELADO: { variant: 'destructive', className: '' },
      REEMBOLSADO: { variant: 'outline', className: '' },
    };
    return statusMap[status] || { variant: 'outline', className: '' };
  };

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      GANHO: { variant: 'default', className: 'bg-green-600' },
      NEGOCIACAO: { variant: 'secondary', className: 'bg-blue-600' },
      QUALIFICADO: { variant: 'secondary', className: 'bg-indigo-600' },
      PROPOSTA: { variant: 'secondary', className: 'bg-purple-600' },
      PERDIDO: { variant: 'destructive', className: '' },
    };
    return statusMap[status] || { variant: 'outline', className: '' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>Últimas vendas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Carregando transações...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>Últimas vendas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-destructive">
            Erro ao carregar transações
          </div>
        </CardContent>
      </Card>
    );
  }

  const { transactions, pagination } = data;

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>Últimas vendas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              {pagination.total_items} transações • Página {pagination.current_page} de {pagination.total_pages}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const paymentBadge = getStatusBadge(transaction.payment_status);
                const statusBadge = getTransactionStatusBadge(transaction.status);

                return (
                  <TableRow key={transaction.order_id}>
                    <TableCell className="font-mono text-xs">
                      {transaction.order_id}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatters.date(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{transaction.customer_phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[200px] truncate">
                        {transaction.product_name || 'Não informado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge {...paymentBadge}>
                        {transaction.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatters.currency(transaction.total)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.payment_method}
                    </TableCell>
                    <TableCell>
                      <Badge {...statusBadge}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, pagination.total_items)} de {pagination.total_items}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.has_prev}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={!pagination.has_next}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionsTable;
