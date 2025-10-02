import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Package, Calendar, DollarSign } from 'lucide-react';
import { Sale, Product, Client } from '../types';

interface AnalyticsProps {
  sales: Sale[];
  products: Product[];
  clients: Client[];
}

export default function Analytics({ sales, products, clients }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const analyticsData = useMemo(() => {
    const getDateRange = () => {
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return { startDate, endDate: now };
    };

    const { startDate, endDate } = getDateRange();
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Revenue analytics
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const avgSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    
    // Time-based averages
    const daysInRange = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDailyRevenue = totalRevenue / daysInRange;
    const avgWeeklyRevenue = avgDailyRevenue * 7;
    const avgMonthlyRevenue = avgDailyRevenue * 30;
    const avgYearlyRevenue = avgDailyRevenue * 365;

    // Product performance
    const productSales = new Map<string, { name: string; quantity: number; revenue: number; profit: number; }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const existing = productSales.get(item.productId) || { 
          name: item.productName, 
          quantity: 0, 
          revenue: 0,
          profit: 0
        };
        
        const profit = product ? (item.unitPrice - product.unitPrice) * item.quantity : 0;
        
        productSales.set(item.productId, {
          name: item.productName,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.totalPrice,
          profit: existing.profit + profit
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Client analytics
    const clientPurchases = new Map<string, { name: string; orders: number; revenue: number; avgOrder: number; }>();
    
    filteredSales.forEach(sale => {
      const existing = clientPurchases.get(sale.clientId) || {
        name: sale.clientName,
        orders: 0,
        revenue: 0,
        avgOrder: 0
      };
      
      const newData = {
        name: sale.clientName,
        orders: existing.orders + 1,
        revenue: existing.revenue + sale.finalAmount,
        avgOrder: 0
      };
      newData.avgOrder = newData.revenue / newData.orders;
      
      clientPurchases.set(sale.clientId, newData);
    });

    const topClients = Array.from(clientPurchases.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Monthly trends
    const monthlyData = new Map<string, { revenue: number; orders: number; }>();
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      const month = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0 };
      monthlyData.set(month, {
        revenue: existing.revenue + sale.finalAmount,
        orders: existing.orders + 1
      });
    });

    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue,
      avgSaleValue,
      avgDailyRevenue,
      avgWeeklyRevenue,
      avgMonthlyRevenue,
      avgYearlyRevenue,
      filteredSales,
      topProducts,
      topClients,
      monthlyTrends
    };
  }, [sales, products, clients, timeRange]);

  const analyticsCards = [
    {
      title: 'Total Revenue',
      value: `$${analyticsData.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Average Sale Value',
      value: `$${analyticsData.avgSaleValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Total Orders',
      value: analyticsData.filteredSales.length.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Active Clients',
      value: analyticsData.topClients.length.toString(),
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  const averageCards = [
    { label: 'Daily Average', value: `$${analyticsData.avgDailyRevenue.toFixed(2)}` },
    { label: 'Weekly Average', value: `$${analyticsData.avgWeeklyRevenue.toFixed(2)}` },
    { label: 'Monthly Average', value: `$${analyticsData.avgMonthlyRevenue.toFixed(2)}` },
    { label: 'Yearly Projection', value: `$${analyticsData.avgYearlyRevenue.toFixed(2)}` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Average Revenue Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Revenue Averages Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {averageCards.map((avg, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{avg.value}</p>
              <p className="text-sm text-gray-600 mt-1">{avg.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {analyticsData.topProducts.length > 0 ? analyticsData.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-green-600">+${product.profit.toFixed(2)} profit</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No product data available for selected period</p>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-orange-600" />
            Top Clients by Revenue
          </h3>
          <div className="space-y-4">
            {analyticsData.topClients.length > 0 ? analyticsData.topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${client.revenue.toFixed(2)}</p>
                  <p className="text-sm text-blue-600">${client.avgOrder.toFixed(2)} avg</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No client data available for selected period</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      {analyticsData.monthlyTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Monthly Revenue Trends
          </h3>
          <div className="space-y-3">
            {analyticsData.monthlyTrends.map((trend) => {
              const maxRevenue = Math.max(...analyticsData.monthlyTrends.map(t => t.revenue));
              const widthPercentage = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={trend.month} className="relative">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(trend.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-gray-500">{trend.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${trend.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${(trend.revenue / trend.orders).toFixed(2)} avg</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 bg-green-200 rounded-full" style={{ width: `${widthPercentage}%` }}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}