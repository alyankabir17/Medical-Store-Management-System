
import { useState, useEffect } from 'react';
import { Product, Client, Sale } from '../types';
import { productService, clientService, salesService } from '../lib/supabase';

export function useDatabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, clientsData, salesData] = await Promise.all([
        productService.getAll(),
        clientService.getAll(),
        salesService.getAll()
      ]);
      
      setProducts(productsData);
      setClients(clientsData);
      setSales(salesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await productService.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
      throw err;
    }
  };

  // Client operations
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient = await clientService.create(clientData);
      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client');
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const updatedClient = await clientService.update(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      // Also remove related sales
      setSales(prev => prev.filter(s => s.clientId !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
      throw err;
    }
  };

  // Sales operations
  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      const newSale = await salesService.create(saleData);
      setSales(prev => [newSale, ...prev]);
      
      // Update product stock
      for (const item of saleData.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateProduct(item.productId, {
            currentStock: product.currentStock - item.quantity
          });
        }
      }

      // Update client total purchases
      const client = clients.find(c => c.id === saleData.clientId);
      if (client) {
        await updateClient(client.id, {
          totalPurchases: client.totalPurchases + saleData.finalAmount,
          lastPurchaseDate: newSale.createdAt
        });
      }

      return newSale;
    } catch (err) {
      console.error('Error adding sale:', err);
      setError('Failed to add sale');
      throw err;
    }
  };

  return {
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
    addSale,
    refreshData: loadAllData
  };
}