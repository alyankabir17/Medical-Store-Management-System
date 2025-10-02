import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Clients from './components/Clients';
import Analytics from './components/Analytics';
import { useDatabase } from './hooks/useDatabase';
import { calculateDashboardStats } from './utils/analytics';
import { DashboardStats } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalClients: 0,
    todaySales: 0,
    avgDailySales: 0,
    avgMonthlySales: 0,
    avgYearlySales: 0,
    recentSales: [],
    topProducts: []
  });

  const {
    products,
    clients,
    sales,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    deleteClient,
    addSale
  } = useDatabase();


  // Update dashboard stats whenever data changes
  useEffect(() => {
    const stats = calculateDashboardStats(products, sales, clients);
    setDashboardStats(stats);
  }, [products, sales, clients]);

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your medical inventory...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Database Connection Error</p>
              <p>{error}</p>
              <p className="text-sm mt-2">Please make sure you have connected to Supabase.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} />;
      case 'inventory':
        return (
          <Inventory 
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        );
      case 'sales':
        return (
          <Sales 
            sales={sales}
            products={products}
            clients={clients}
            onAddSale={addSale}
          />
        );
      case 'clients':
        return (
          <Clients 
            clients={clients}
            sales={sales}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            sales={sales}
            products={products}
            clients={clients}
          />
        );
      default:
        return <Dashboard stats={dashboardStats} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      products={products}
      sales={sales}
      clients={clients}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;