import { useState, useMemo } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Home,
  Search,
  Bell,
  X,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Product, Sale, Client } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  products?: Product[];
  sales?: Sale[];
  clients?: Client[];
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout({ children, currentPage, onPageChange, products = [], sales = [], clients = [] }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Generate live notifications
  const notifications = useMemo((): Notification[] => {
    const notifs: Notification[] = [];
    
    // Low stock notifications
    const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
    lowStockProducts.forEach(product => {
      notifs.push({
        id: `low-stock-${product.id}`,
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.currentStock} remaining)`,
        timestamp: new Date(),
        read: false
      });
    });

    // Recent sales notifications
    const recentSales = sales
      .filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return saleDate > oneDayAgo;
      })
      .slice(0, 3);

    recentSales.forEach(sale => {
      notifs.push({
        id: `sale-${sale.id}`,
        type: 'success',
        title: 'New Sale',
        message: `Sale to ${sale.clientName} for $${sale.finalAmount.toFixed(2)}`,
        timestamp: new Date(sale.createdAt),
        read: false
      });
    });

    // Expiring products (within 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringProducts = products.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    });

    expiringProducts.forEach(product => {
      notifs.push({
        id: `expiry-${product.id}`,
        type: 'warning',
        title: 'Product Expiring Soon',
        message: `${product.name} expires on ${new Date(product.expiryDate).toLocaleDateString()}`,
        timestamp: new Date(),
        read: false
      });
    });

    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }, [products, sales]);

  // Live search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { products: [], clients: [], sales: [] };

    const query = searchQuery.toLowerCase();
    
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.manufacturer.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedClients = clients.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query)
    ).slice(0, 5);

    const matchedSales = sales.filter(s =>
      s.clientName.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    ).slice(0, 5);

    return { products: matchedProducts, clients: matchedClients, sales: matchedSales };
  }, [searchQuery, products, clients, sales]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSearchResultClick = (type: string, id: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    switch (type) {
      case 'product':
        onPageChange('inventory');
        break;
      case 'client':
        onPageChange('clients');
        break;
      case 'sale':
        onPageChange('sales');
        break;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kabir's Medical Store</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Live Search */}
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, clients, sales..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.products.length === 0 && searchResults.clients.length === 0 && searchResults.sales.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No results found</div>
                  ) : (
                    <div className="p-2">
                      {/* Products */}
                      {searchResults.products.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Products</h4>
                          {searchResults.products.map(product => (
                            <button
                              key={product.id}
                              onClick={() => handleSearchResultClick('product', product.id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                            >
                              <Package className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.category} • Stock: {product.currentStock}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Clients */}
                      {searchResults.clients.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Clients</h4>
                          {searchResults.clients.map(client => (
                            <button
                              key={client.id}
                              onClick={() => handleSearchResultClick('client', client.id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                            >
                              <Users className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">{client.name}</p>
                                <p className="text-sm text-gray-500">{client.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Sales */}
                      {searchResults.sales.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Sales</h4>
                          {searchResults.sales.map(sale => (
                            <button
                              key={sale.id}
                              onClick={() => handleSearchResultClick('sale', sale.id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                            >
                              <ShoppingCart className="h-4 w-4 text-purple-600" />
                              <div>
                                <p className="font-medium text-gray-900">Sale #{sale.id.slice(-6)}</p>
                                <p className="text-sm text-gray-500">{sale.clientName} • ${sale.finalAmount.toFixed(2)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Live Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className={`p-1 rounded-full ${
                              notification.type === 'warning' ? 'bg-yellow-100' :
                              notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {notification.type === 'warning' ? (
                                <AlertTriangle className={`h-4 w-4 ${
                                  notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              ) : notification.type === 'success' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <Bell className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close dropdowns */}
      {(showSearchResults || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowSearchResults(false);
            setShowNotifications(false);
          }}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}