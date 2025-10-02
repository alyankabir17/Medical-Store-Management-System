import React from 'react';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Today\'s Sales',
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  const avgStats = [
    { label: 'Daily Average', value: `$${stats.avgDailySales.toFixed(2)}` },
    { label: 'Monthly Average', value: `$${stats.avgMonthlySales.toFixed(2)}` },
    { label: 'Yearly Total', value: `$${stats.avgYearlySales.toFixed(2)}` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Averages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Sales Averages
          </h3>
          <div className="space-y-4">
            {avgStats.map((avg, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{avg.label}</span>
                <span className="font-semibold text-gray-900">{avg.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
            Recent Sales
          </h3>
          <div className="space-y-3">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{sale.clientName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-green-600">
                  ${sale.finalAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600" />
            Top Products
          </h3>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={product.productId} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{product.productName}</p>
                  <p className="text-xs text-gray-500">{product.quantitySold} units sold</p>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  ${product.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}