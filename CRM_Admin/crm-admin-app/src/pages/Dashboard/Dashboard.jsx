import { useState } from 'react';
import { DollarSign, Users, Eye, Activity, RefreshCw, Download, TrendingUp, TrendingDown, Mail, Phone, Info, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from './components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

// Dados mockados (depois substituir por API)
const mockMetrics = {
  revenue: { valor: 4805, variacao: 12.5, sparkline: [4200, 4400, 4100, 4600, 4300, 4700, 4805] },
  customers: { total: 8400, variacao: 14.0, sparkline: [8000, 8100, 8050, 8200, 8300, 8350, 8400] },
  visitors: { total: 59000, variacao: 12.4, sparkline: [56000, 57000, 56500, 58000, 58500, 59200, 59000] },
  bounceRate: { taxa: 48.32, variacao: -2.1, sparkline: [52, 51, 50, 49.5, 49, 48.5, 48.32] },
};

const storeMetricsData = [
  { name: 'Jan', revenue: 3200, customers: 150, visitors: 1000 },
  { name: 'Feb', revenue: 3500, customers: 180, visitors: 1200 },
  { name: 'Mar', revenue: 3800, customers: 200, visitors: 1350 },
  { name: 'Apr', revenue: 4200, customers: 220, visitors: 1400 },
  { name: 'May', revenue: 3900, customers: 195, visitors: 1320 },
  { name: 'Jun', revenue: 4100, customers: 210, visitors: 1380 },
  { name: 'Jul', revenue: 4400, customers: 230, visitors: 1450 },
  { name: 'Aug', revenue: 4600, customers: 235, visitors: 1480 },
  { name: 'Sep', revenue: 4300, customers: 225, visitors: 1420 },
  { name: 'Oct', revenue: 4500, customers: 232, visitors: 1460 },
  { name: 'Nov', revenue: 4700, customers: 238, visitors: 1490 },
  { name: 'Dec', revenue: 4805, customers: 240, visitors: 1500 },
];

const topProducts = [
  { name: 'Light Blue Chair', price: 240, sales: 345, revenue: 82800, icon: '🪑' },
  { name: 'Honor Mobile 7x', price: 159, sales: 148, revenue: 23532, icon: '📱' },
  { name: 'Hand Watch', price: 250, sales: 122, revenue: 30500, icon: '⌚' },
  { name: 'Mini Laptop', price: 260, sales: 452, revenue: 117520, icon: '💻' },
  { name: 'Slim T-Shirt', price: 112, sales: 572, revenue: 64064, icon: '👕' },
  { name: 'Smart Headphones', price: 180, sales: 298, revenue: 53640, icon: '🎧' },
  { name: 'Green Sports Shoes', price: 95, sales: 410, revenue: 38950, icon: '👟' },
];

const transactions = [
  { id: 'ORD-001', customer: 'David Buckley', ref: '#8576986', date: 'Jan 16, 2021', amount: 876, status: 'In Progress' },
  { id: 'ORD-002', customer: 'Johnny Seitz', ref: '#9673520', date: 'Jan 20, 2021', amount: 86, status: 'Declined' },
  { id: 'ORD-003', customer: 'Lewis Cruz', ref: '#8576420', date: 'Jan 18, 2021', amount: 536, status: 'Completed' },
];

const categoriesData = [
  { name: 'Kids', value: 45, color: '#10b981' },
  { name: 'Women', value: 28, color: '#8b5cf6' },
  { name: 'Men', value: 18, color: '#f59e0b' },
  { name: 'Furniture', value: 9, color: '#3b82f6' },
];

const analyticsData = {
  bounceRate: {
    value: 48.32,
    change: 12.5,
    data: [42, 45, 44, 46, 47, 48, 49, 48.5, 47.8, 48.32]
  },
  pageviews: {
    value: 52.64,
    change: 8.2,
    data: [48, 49, 50, 51, 52, 51.5, 52, 52.5, 52.3, 52.64]
  },
  newSessions: {
    value: 68.23,
    change: 15.3,
    data: [58, 60, 62, 64, 65, 66, 67, 67.5, 68, 68.23]
  }
};

const visitorsData = [
  { day: 'Sun', visitors: 3800 },
  { day: 'Mon', visitors: 5200 },
  { day: 'Tue', visitors: 6100 },
  { day: 'Wed', visitors: 5800 },
  { day: 'Thu', visitors: 6500 },
  { day: 'Fri', visitors: 7200 },
  { day: 'Sat', visitors: 4200 },
];

const newCustomers = [
  { name: 'Emily Jackson', email: 'emily@example.com', avatar: 'EJ', color: 'from-pink-500 to-rose-500' },
  { name: 'Martin Hughes', email: 'martin@example.com', avatar: 'MH', color: 'from-blue-500 to-cyan-500' },
  { name: 'Laura Maduson', email: 'laura@example.com', avatar: 'LM', color: 'from-purple-500 to-pink-500' },
  { name: 'James Anderson', email: 'james@example.com', avatar: 'JA', color: 'from-green-500 to-teal-500' },
  { name: 'Sarah Wilson', email: 'sarah@example.com', avatar: 'SW', color: 'from-orange-500 to-yellow-500' },
  { name: 'Michael Brown', email: 'michael@example.com', avatar: 'MB', color: 'from-indigo-500 to-blue-500' },
  { name: 'Jessica Davis', email: 'jessica@example.com', avatar: 'JD', color: 'from-red-500 to-pink-500' },
];

const ordersProgress = {
  completed: { value: 68, color: '#10b981' },
  cancelled: { value: 60, color: '#ef4444' },
  inProgress: { value: 45, color: '#3b82f6' }
};

const monthlyOrdersData = [
  { month: 'Jan', orders: 45 },
  { month: 'Feb', orders: 52 },
  { month: 'Mar', orders: 48 },
  { month: 'Apr', orders: 65 },
  { month: 'May', orders: 58 },
  { month: 'Jun', orders: 70 },
];

const ordersSummary = [
  { id: '#8756986', product: 'Light Blue Chair', icon: '🪑', customer: 'John Smith', date: 'Jan 16, 2021', price: 240, status: 'Pending' },
  { id: '#8756987', product: 'Green Sport Shoes', icon: '👟', customer: 'Emily Johnson', date: 'Jan 17, 2021', price: 95, status: 'Dispatched' },
  { id: '#8756988', product: 'Red Headphone', icon: '🎧', customer: 'Michael Brown', date: 'Jan 18, 2021', price: 180, status: 'Completed' },
  { id: '#8756989', product: 'Honor Mobile', icon: '📱', customer: 'Sarah Davis', date: 'Jan 19, 2021', price: 159, status: 'Pending' },
  { id: '#8756990', product: 'Mini Laptop', icon: '💻', customer: 'David Wilson', date: 'Jan 20, 2021', price: 260, status: 'Completed' },
  { id: '#8756991', product: 'Blue T-Shirt', icon: '👕', customer: 'Lisa Anderson', date: 'Jan 21, 2021', price: 45, status: 'Dispatched' },
  { id: '#8756992', product: 'Hand Watch', icon: '⌚', customer: 'James Taylor', date: 'Jan 22, 2021', price: 250, status: 'Pending' },
];

// Componente MetricCard com Sparkline e efeitos de hover
function MetricCard({ icon: Icon, label, value, change, sparklineData, color, gradientColor }) {
  const isPositive = change >= 0;
  const colorValue = color.replace('text-', '');

  return (
    <Card className="bg-[#1a2332] border-[#2d3748] hover:border-[#3b82f6]/50 hover:shadow-lg hover:shadow-[#3b82f6]/20 transition-all duration-300 hover:-translate-y-1 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{label}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#3b82f6] transition-colors">{value}</div>
        <div className="flex items-center justify-between mt-2 mb-3">
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500">since last week</span>
          </div>
        </div>
        {/* Enhanced Sparkline with gradient */}
        <div className="mt-3 h-[50px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData.map((v, i) => ({ value: v }))}>
              <defs>
                <linearGradient id={`sparkline-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colorValue} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colorValue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colorValue}
                strokeWidth={2}
                fill={`url(#sparkline-${label})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente AnalyticsCard com Area Chart e hover aprimorado
function AnalyticsCard({ label, value, change, data, color }) {
  const isPositive = change >= 0;

  return (
    <Card className="bg-[#1a2332] border-[#2d3748] hover:border-[#3b82f6]/50 hover:shadow-xl hover:shadow-[#3b82f6]/10 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/0 to-[#3b82f6]/0 group-hover:from-[#3b82f6]/5 group-hover:to-transparent transition-all duration-300" />

      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">{value}%</div>
            <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">{label}</div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-transparent to-transparent group-hover:from-[#3b82f6]/10 group-hover:to-[#8b5cf6]/10 transition-all duration-300">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.map((v, i) => ({ value: v }))}>
              <defs>
                <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#gradient-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-3 font-medium">
          <span className="text-gray-400">Increase From Last Week</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Visão geral das suas métricas (últimos 30 dias)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-[#1a2332] border-[#2d3748] text-white hover:bg-[#253447]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="bg-[#1a2332] border-[#2d3748] text-white hover:bg-[#253447]">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={DollarSign}
            label="Revenue"
            value={formatCurrency(mockMetrics.revenue.valor)}
            change={mockMetrics.revenue.variacao}
            sparklineData={mockMetrics.revenue.sparkline}
            color="text-green-500"
            gradientColor="from-green-500/20 to-emerald-500/10"
          />
          <MetricCard
            icon={Users}
            label="Total Customers"
            value={mockMetrics.customers.total.toLocaleString()}
            change={mockMetrics.customers.variacao}
            sparklineData={mockMetrics.customers.sparkline}
            color="text-blue-500"
            gradientColor="from-blue-500/20 to-cyan-500/10"
          />
          <MetricCard
            icon={Eye}
            label="Store Visitors"
            value={mockMetrics.visitors.total.toLocaleString()}
            change={mockMetrics.visitors.variacao}
            sparklineData={mockMetrics.visitors.sparkline}
            color="text-purple-500"
            gradientColor="from-purple-500/20 to-pink-500/10"
          />
          <MetricCard
            icon={Activity}
            label="Bounce Rate"
            value={`${mockMetrics.bounceRate.taxa}%`}
            change={mockMetrics.bounceRate.variacao}
            sparklineData={mockMetrics.bounceRate.sparkline}
            color="text-orange-500"
            gradientColor="from-orange-500/20 to-yellow-500/10"
          />
        </div>

        {/* Store Metrics Chart - Enhanced */}
        <Card className="bg-[#1a2332] border-[#2d3748] hover:border-[#3b82f6]/50 hover:shadow-xl hover:shadow-[#3b82f6]/10 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white group-hover:text-[#3b82f6] transition-colors">Store Metrics</CardTitle>
                <CardDescription className="text-gray-400">Last 12 months revenue</CardDescription>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="px-2 py-1 bg-[#3b82f6]/20 rounded text-xs text-[#3b82f6] font-medium">12M</div>
                <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 font-medium">30D</div>
                <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 font-medium">7D</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={storeMetricsData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#8b95a5" />
                <YAxis stroke="#8b95a5" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Analytics Cards (3 horizontal) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticsCard
            label="Bounce Rate"
            value={analyticsData.bounceRate.value}
            change={analyticsData.bounceRate.change}
            data={analyticsData.bounceRate.data}
            color="#10b981"
          />
          <AnalyticsCard
            label="Pageviews"
            value={analyticsData.pageviews.value}
            change={analyticsData.pageviews.change}
            data={analyticsData.pageviews.data}
            color="#3b82f6"
          />
          <AnalyticsCard
            label="New Sessions"
            value={analyticsData.newSessions.value}
            change={analyticsData.newSessions.change}
            data={analyticsData.newSessions.data}
            color="#8b5cf6"
          />
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products - Enhanced */}
          <Card className="bg-[#1a2332] border-[#2d3748] hover:border-[#3b82f6]/50 hover:shadow-xl hover:shadow-[#3b82f6]/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">Top Products</CardTitle>
              <CardDescription className="text-gray-400">Best selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg hover:bg-[#253447] transition-all duration-200 hover:scale-[1.02] cursor-pointer group border border-transparent hover:border-[#3b82f6]/30">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-200">{product.icon}</div>
                      <div>
                        <div className="text-white font-medium group-hover:text-[#3b82f6] transition-colors">{product.name}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold group-hover:text-[#10b981] transition-colors">{formatCurrency(product.revenue)}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{product.sales} Sales</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription className="text-gray-400">Last 30 days revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {tx.customer[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium">{tx.customer}</div>
                        <div className="text-xs text-gray-500">{tx.ref}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">+{formatCurrency(tx.amount)}</div>
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        tx.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                        tx.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2d3748]">
                <div className="text-xs text-gray-500">
                  Showing 1 to 3 of 12 entries
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visitors & New Customers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitors Bar Chart */}
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Visitors</CardTitle>
              <CardDescription className="text-gray-400">
                <span className="text-2xl font-bold text-white">43,540</span>
                <span className="text-sm text-gray-400 ml-2">Total Visitors</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="day" stroke="#8b95a5" />
                  <YAxis stroke="#8b95a5" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2d3748', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="visitors" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* New Customers List - Enhanced */}
          <Card className="bg-[#1a2332] border-[#2d3748] hover:border-[#3b82f6]/50 hover:shadow-xl hover:shadow-[#3b82f6]/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">New Customers</CardTitle>
              <CardDescription className="text-gray-400">Recently joined customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newCustomers.map((customer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg hover:bg-[#253447] transition-all duration-200 hover:scale-[1.02] cursor-pointer group border border-transparent hover:border-[#3b82f6]/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${customer.color} flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                        {customer.avatar}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm group-hover:text-[#3b82f6] transition-colors">{customer.name}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-colors">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-colors">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Three Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Categories */}
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoriesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoriesData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-gray-300">{cat.name}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Overview */}
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">87%</div>
                <div className="text-gray-400">Total Sales</div>
                <div className="grid grid-cols-1 gap-3 mt-6">
                  <div>
                    <div className="text-2xl font-bold text-white">$289.42</div>
                    <div className="text-xs text-gray-500">Last Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$856.14</div>
                    <div className="text-xs text-gray-500">Last Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$987.25</div>
                    <div className="text-xs text-gray-500">Last Year</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Summary Progress */}
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Orders Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Completed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Completed</span>
                    <span className="text-sm font-semibold text-white">{ordersProgress.completed.value}%</span>
                  </div>
                  <div className="w-full bg-[#0f1419] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${ordersProgress.completed.value}%`,
                        backgroundColor: ordersProgress.completed.color
                      }}
                    />
                  </div>
                </div>
                {/* Cancelled */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Cancelled</span>
                    <span className="text-sm font-semibold text-white">{ordersProgress.cancelled.value}%</span>
                  </div>
                  <div className="w-full bg-[#0f1419] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${ordersProgress.cancelled.value}%`,
                        backgroundColor: ordersProgress.cancelled.color
                      }}
                    />
                  </div>
                </div>
                {/* In Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">In Progress</span>
                    <span className="text-sm font-semibold text-white">{ordersProgress.inProgress.value}%</span>
                  </div>
                  <div className="w-full bg-[#0f1419] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${ordersProgress.inProgress.value}%`,
                        backgroundColor: ordersProgress.inProgress.color
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={monthlyOrdersData}>
                    <XAxis dataKey="month" stroke="#8b95a5" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2d3748', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Summary Table */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardHeader>
            <CardTitle className="text-white">Orders Summary</CardTitle>
            <CardDescription className="text-gray-400">Complete order management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d3748]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersSummary.map((order, i) => (
                    <tr key={i} className="border-b border-[#2d3748] hover:bg-[#253447] transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-400">{order.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{order.icon}</span>
                          <span className="text-sm text-white">{order.product}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">{order.customer}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{order.date}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-white">{formatCurrency(order.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-3 py-1 rounded-full inline-block ${
                          order.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'Dispatched' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2d3748]">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2d3748]">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-[#2d3748]">
          Dashboard atualizado em tempo real • Dados dos últimos 30 dias
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;