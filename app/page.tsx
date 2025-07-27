
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ItemManagement from '@/components/ItemManagement';
import StockManagement from '@/components/StockManagement';
import ReportingSection from '@/components/ReportingSection';
import { ThemeProvider } from '@/components/ThemeProvider';
import GoogleSheetsService from '@/lib/googleSheetsClient';

interface Item {
  id: number;
  code: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  costPrice: number;
  lowStockThreshold: number;
  totalStock: number;
  soldQuantity: number;
  remainingStock: number;
  createdAt: string;
}

interface Stock {
  id: number;
  itemId: number;
  quantity: number;
  soldQuantity: number;
  date: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    const savedItems = localStorage.getItem('inventory_items');
    const savedStocks = localStorage.getItem('inventory_stocks');
    const savedTheme = localStorage.getItem('inventory_theme');
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      const sampleItems: Item[] = [
        {
          id: 1,
          code: 'ITM-001',
          name: 'Wireless Headphones',
          category: 'Electronics',
          supplier: 'Tech Supplier A',
          price: 99.99,
          costPrice: 45.00,
          lowStockThreshold: 10,
          totalStock: 50,
          soldQuantity: 15,
          remainingStock: 35,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          code: 'ITM-002',
          name: 'Smart Watch',
          category: 'Electronics',
          supplier: 'Tech Supplier B',
          price: 299.99,
          costPrice: 150.00,
          lowStockThreshold: 5,
          totalStock: 25,
          soldQuantity: 8,
          remainingStock: 17,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          code: 'ITM-003',
          name: 'Coffee Beans',
          category: 'Food & Beverages',
          supplier: 'Local Roaster',
          price: 24.99,
          costPrice: 12.00,
          lowStockThreshold: 20,
          totalStock: 100,
          soldQuantity: 45,
          remainingStock: 55,
          createdAt: new Date().toISOString()
        }
      ];
      setItems(sampleItems);
      localStorage.setItem('inventory_items', JSON.stringify(sampleItems));
    }
    
    if (savedStocks) {
      setStocks(JSON.parse(savedStocks));
    }
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const addItem = async (item: Omit<Item, 'id' | 'code' | 'createdAt' | 'totalStock' | 'soldQuantity' | 'remainingStock'>) => {
    setSyncStatus('syncing');
    
    const newItem = {
      ...item,
      id: Date.now(),
      code: `ITM-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalStock: 0,
      soldQuantity: 0,
      remainingStock: 0
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem('inventory_items', JSON.stringify(updatedItems));

    // Sync to Google Sheets
    try {
      GoogleSheetsService.updateConfig();
      await GoogleSheetsService.addItemToMaster(newItem);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync item to Google Sheets:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const updateItem = async (id: number, updatedItem: Partial<Item>) => {
    setSyncStatus('syncing');
    
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    );
    setItems(updatedItems);
    localStorage.setItem('inventory_items', JSON.stringify(updatedItems));

    // Sync to Google Sheets
    try {
      const item = updatedItems.find(i => i.id === id);
      GoogleSheetsService.updateConfig();
      await GoogleSheetsService.updateItemInMaster(item);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync item update to Google Sheets:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const deleteItem = async (id: number) => {
    setSyncStatus('syncing');
    
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) {
      console.error('Item to delete not found');
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return;
    }
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem('inventory_items', JSON.stringify(updatedItems));
    
    const updatedStocks = stocks.filter(stock => stock.itemId !== id);
    setStocks(updatedStocks);
    localStorage.setItem('inventory_stocks', JSON.stringify(updatedStocks));

    // Sync to Google Sheets
    try {
      GoogleSheetsService.updateConfig();
      await GoogleSheetsService.deleteItemFromMaster(itemToDelete.code);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync item deletion to Google Sheets:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const addStock = async (stockData: any) => {
    setSyncStatus('syncing');
    
    const newStock = {
      ...stockData,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    const updatedStocks = [...stocks, newStock];
    setStocks(updatedStocks);
    localStorage.setItem('inventory_stocks', JSON.stringify(updatedStocks));

    updateItemTotals(stockData.itemId, updatedStocks);

    // Sync to Google Sheets
    try {
      const item = items.find(i => i.id === stockData.itemId);
      if (!item) {
        console.error('Item not found for stock entry');
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
        return;
      }
      GoogleSheetsService.updateConfig();
      await GoogleSheetsService.addStockEntry(item.code, stockData);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync stock entry to Google Sheets:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const updateItemTotals = (itemId: number, stockList: Stock[] = stocks) => {
    const itemStocks = stockList.filter(stock => stock.itemId === itemId);
    const totalStock = itemStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const soldQuantity = itemStocks.reduce((sum, stock) => sum + (stock.soldQuantity || 0), 0);
    const remainingStock = totalStock - soldQuantity;

    updateItem(itemId, {
      totalStock,
      soldQuantity,
      remainingStock
    });
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('inventory_theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeProvider darkMode={darkMode}>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          syncStatus={syncStatus}
        />
        
        <main className="container mx-auto px-4 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              items={items}
              stocks={stocks}
              darkMode={darkMode}
            />
          )}
          
          {activeTab === 'items' && (
            <ItemManagement 
              items={items}
              addItem={addItem}
              updateItem={updateItem}
              deleteItem={deleteItem}
              darkMode={darkMode}
            />
          )}
          
          {activeTab === 'stock' && (
            <StockManagement 
              items={items}
              stocks={stocks}
              addStock={addStock}
              updateItemTotals={updateItemTotals}
              darkMode={darkMode}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportingSection 
              items={items}
              stocks={stocks}
              darkMode={darkMode}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
