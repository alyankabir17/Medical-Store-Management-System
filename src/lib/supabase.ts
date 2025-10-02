import { createClient } from '@supabase/supabase-js';
import { Product, Client, Sale } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          manufacturer: string;
          batch_number: string;
          expiry_date: string;
          current_stock: number;
          min_stock_level: number;
          unit_price: number;
          selling_price: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          manufacturer: string;
          batch_number: string;
          expiry_date: string;
          current_stock: number;
          min_stock_level: number;
          unit_price: number;
          selling_price: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          manufacturer?: string;
          batch_number?: string;
          expiry_date?: string;
          current_stock?: number;
          min_stock_level?: number;
          unit_price?: number;
          selling_price?: number;
          description?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          total_purchases: number;
          last_purchase_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          total_purchases?: number;
          last_purchase_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          total_purchases?: number;
          last_purchase_date?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          client_id: string;
          client_name: string;
          total_amount: number;
          discount: number;
          final_amount: number;
          payment_method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_name: string;
          total_amount: number;
          discount: number;
          final_amount: number;
          payment_method: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_name?: string;
          total_amount?: number;
          discount?: number;
          final_amount?: number;
          payment_method?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
    };
  };
}

// Product operations
export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        category: product.category,
        manufacturer: product.manufacturer,
        batch_number: product.batchNumber,
        expiry_date: product.expiryDate,
        current_stock: product.currentStock,
        min_stock_level: product.minStockLevel,
        unit_price: product.unitPrice,
        selling_price: product.sellingPrice,
        description: product.description || ''
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapDbToProduct(data);
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.manufacturer) updateData.manufacturer = updates.manufacturer;
    if (updates.batchNumber) updateData.batch_number = updates.batchNumber;
    if (updates.expiryDate) updateData.expiry_date = updates.expiryDate;
    if (updates.currentStock !== undefined) updateData.current_stock = updates.currentStock;
    if (updates.minStockLevel !== undefined) updateData.min_stock_level = updates.minStockLevel;
    if (updates.unitPrice !== undefined) updateData.unit_price = updates.unitPrice;
    if (updates.sellingPrice !== undefined) updateData.selling_price = updates.sellingPrice;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapDbToProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  mapDbToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      category: dbProduct.category,
      manufacturer: dbProduct.manufacturer,
      batchNumber: dbProduct.batch_number,
      expiryDate: dbProduct.expiry_date,
      currentStock: dbProduct.current_stock,
      minStockLevel: dbProduct.min_stock_level,
      unitPrice: dbProduct.unit_price,
      sellingPrice: dbProduct.selling_price,
      description: dbProduct.description || '',
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at
    };
  }
};

// Client operations
export const clientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        total_purchases: client.totalPurchases || 0,
        last_purchase_date: client.lastPurchaseDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapDbToClient(data);
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.address) updateData.address = updates.address;
    if (updates.totalPurchases !== undefined) updateData.total_purchases = updates.totalPurchases;
    if (updates.lastPurchaseDate) updateData.last_purchase_date = updates.lastPurchaseDate;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapDbToClient(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  mapDbToClient(dbClient: any): Client {
    return {
      id: dbClient.id,
      name: dbClient.name,
      email: dbClient.email,
      phone: dbClient.phone,
      address: dbClient.address,
      totalPurchases: dbClient.total_purchases,
      lastPurchaseDate: dbClient.last_purchase_date,
      createdAt: dbClient.created_at
    };
  }
};

// Sales operations
export const salesService = {
  async getAll(): Promise<Sale[]> {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .order('created_at', { ascending: false });
    
    if (salesError) throw salesError;
    
    return (salesData || []).map((sale: { id: any; client_id: any; client_name: any; sale_items: any[]; total_amount: any; discount: any; final_amount: any; payment_method: string; created_at: any; }) => ({
      id: sale.id,
      clientId: sale.client_id,
      clientName: sale.client_name,
      items: sale.sale_items.map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      totalAmount: sale.total_amount,
      discount: sale.discount,
      finalAmount: sale.final_amount,
      paymentMethod: sale.payment_method as 'cash' | 'card' | 'digital',
      createdAt: sale.created_at
    }));
  },

  async create(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    // Start a transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        client_id: sale.clientId,
        client_name: sale.clientName,
        total_amount: sale.totalAmount,
        discount: sale.discount,
        final_amount: sale.finalAmount,
        payment_method: sale.paymentMethod
      })
      .select()
      .single();
    
    if (saleError) throw saleError;

    // Insert sale items
    const saleItemsData = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData);
    
    if (itemsError) throw itemsError;

    return {
      id: saleData.id,
      clientId: saleData.client_id,
      clientName: saleData.client_name,
      items: sale.items,
      totalAmount: saleData.total_amount,
      discount: saleData.discount,
      finalAmount: saleData.final_amount,
      paymentMethod: saleData.payment_method as 'cash' | 'card' | 'digital',
      createdAt: saleData.created_at
    };
  }
};