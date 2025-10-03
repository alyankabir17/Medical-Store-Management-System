import { Sale, Product, Client, DashboardStats } from '../types';

export function calculateDashboardStats(
  products: Product[],
  sales: Sale[],
  clients: Client[]
): DashboardStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  // Filter sales by time periods
  const todaySales = sales.filter(sale => new Date(sale.createdAt) >= today);
  const monthSales = sales.filter(sale => new Date(sale.createdAt) >= thisMonth);
  const yearSales = sales.filter(sale => new Date(sale.createdAt) >= thisYear);

  // Calculate totals
  const totalSales = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const monthTotal = monthSales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const yearTotal = yearSales.reduce((sum, sale) => sum + sale.finalAmount, 0);

  // Calculate averages
  const daysInMonth = now.getDate();
  const daysInYear = Math.floor((now.getTime() - thisYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const avgDailySales = daysInMonth > 0 ? monthTotal / daysInMonth : 0;
  const avgMonthlySales = now.getMonth() > 0 ? yearTotal / (now.getMonth() + 1) : yearTotal;
  const avgYearlySales = yearTotal;

  // Low stock products
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel).length;

  // Recent sales (last 5)
  const recentSales = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Top products by quantity sold
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { 
        name: item.productName, 
        quantity: 0, 
        revenue: 0 
      };
      productSales.set(item.productId, {
        name: item.productName,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.totalPrice
      });
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantitySold: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  return {
    totalProducts: products.length,
    lowStockProducts,
    totalSales,
    totalClients: clients.length,
    todaySales: todayTotal,
    avgDailySales,
    avgMonthlySales,
    avgYearlySales,
    recentSales,
    topProducts
  };
}
export const productService = {
  getAll: async () => [],
  create: async (data: any) => ({ ...data, id: 'mock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
  update: async (id: string, updates: any) => ({ ...updates, id, updatedAt: new Date().toISOString() }),
  delete: async (id: string) => {},
};

export const clientService = {
  getAll: async () => [],
  create: async (data: any) => ({ ...data, id: 'mock', createdAt: new Date().toISOString() }),
  update: async (id: string, updates: any) => ({ ...updates, id }),
  delete: async (id: string) => {},
};

export const salesService = {
  getAll: async () => [],
  create: async (data: any) => ({ ...data, id: 'mock', createdAt: new Date().toISOString() }),
};