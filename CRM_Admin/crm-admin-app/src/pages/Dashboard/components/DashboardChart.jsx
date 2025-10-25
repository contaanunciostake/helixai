/**
 * DashboardChart Component
 * Componente reutilizável para gráficos de linha do dashboard
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatters } from '../../../services/dashboardService';

export function DashboardChart({
  title,
  description,
  data,
  dataKey = 'value',
  color = '#3b82f6',
  formatValue,
  formatXAxis,
  isLoading
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Carregando dados do gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">
            {formatXAxis ? formatXAxis(data.payload.date) : data.payload.date}
          </p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {formatValue ? formatValue(data.value) : data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis || ((value) => formatters.shortDate(value))}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickFormatter={formatValue || ((value) => formatters.compactNumber(value))}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Componentes específicos de cada gráfico
export function RevenueChart({ data, isLoading }) {
  return (
    <DashboardChart
      title="Receita"
      description="Receita total dos últimos 30 dias"
      data={data}
      color="#10b981"
      formatValue={formatters.currency}
      isLoading={isLoading}
    />
  );
}

export function CustomersChart({ data, isLoading }) {
  return (
    <DashboardChart
      title="Clientes"
      description="Novos clientes convertidos nos últimos 30 dias"
      data={data}
      color="#3b82f6"
      formatValue={formatters.number}
      isLoading={isLoading}
    />
  );
}

export function VisitorsChart({ data, isLoading }) {
  return (
    <DashboardChart
      title="Visitantes"
      description="Visitantes únicos nos últimos 30 dias"
      data={data}
      color="#8b5cf6"
      formatValue={formatters.number}
      isLoading={isLoading}
    />
  );
}

export default DashboardChart;
