export interface Product {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  sellingPrice: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchaseDate: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  supplierContact: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'received' | 'cancelled';
  orderDate: string;
  receivedDate?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalClients: number;
  todaySales: number;
  avgDailySales: number;
  avgMonthlySales: number;
  avgYearlySales: number;
  recentSales: Sale[];
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}