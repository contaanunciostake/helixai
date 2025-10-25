/**
 * TopProductsTable Component
 * Tabela de top 10 produtos mais vendidos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { TrendingUp, Package } from 'lucide-react';
import { formatters } from '../../../services/dashboardService';

export function TopProductsTable({ data, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 10 Produtos
          </CardTitle>
          <CardDescription>Produtos mais vendidos no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Carregando produtos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 10 Produtos
          </CardTitle>
          <CardDescription>Produtos mais vendidos no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Nenhum produto vendido no período
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top 10 Produtos
        </CardTitle>
        <CardDescription>
          {data.products.length} produtos vendidos • Total: {formatters.currency(data.total_revenue)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Vendas</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">% Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {index === 0 && <Badge variant="default" className="bg-amber-500">1</Badge>}
                  {index === 1 && <Badge variant="default" className="bg-gray-400">2</Badge>}
                  {index === 2 && <Badge variant="default" className="bg-orange-600">3</Badge>}
                  {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{product.sales}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatters.currency(product.revenue)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-sm text-muted-foreground">
                      {product.percentage.toFixed(1)}%
                    </span>
                    {product.percentage >= 20 && (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default TopProductsTable;
