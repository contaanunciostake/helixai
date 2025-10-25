/**
 * MetricCard Component
 * Card individual para exibir uma métrica do dashboard
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export function MetricCard({ metric, icon: Icon, label, formatValue }) {
  if (!metric) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">...</div>
          <p className="text-xs text-muted-foreground mt-1">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  // Extrair valor principal (pode ser 'valor', 'total' ou 'taxa')
  const value = metric.valor ?? metric.total ?? metric.taxa ?? 0;
  const variacao = metric.variacao;
  const isPositive = variacao > 0;
  const isNegative = variacao < 0;
  const isNeutral = variacao === 0;

  // Para bounce rate, variação negativa é boa (improved)
  const isImproved = metric.status === 'improved';
  const isWorsened = metric.status === 'worsened';

  // Ícone de tendência
  let TrendIcon = Minus;
  let trendColor = 'text-gray-500';

  if (metric.status) {
    // Bounce rate (usa status)
    if (isImproved) {
      TrendIcon = TrendingDown;
      trendColor = 'text-green-600';
    } else if (isWorsened) {
      TrendIcon = TrendingUp;
      trendColor = 'text-red-600';
    }
  } else {
    // Outras métricas (usa variacao)
    if (isPositive) {
      TrendIcon = TrendingUp;
      trendColor = 'text-green-600';
    } else if (isNegative) {
      TrendIcon = TrendingDown;
      trendColor = 'text-red-600';
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center gap-1 mt-1">
          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
          <p className={`text-xs ${trendColor}`}>
            {Math.abs(variacao).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground ml-1">
            {metric.comparacao_periodo_anterior}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
