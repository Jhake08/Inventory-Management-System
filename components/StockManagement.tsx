'use client';

import { useState, useEffect } from 'react';
import StockForm from './StockForm';
import StockList from './StockList';

interface StockManagementProps {
  items: any[];
  stocks: any[];
  addStock: (stock: any) => void;
  updateItemTotals: (itemId: number, stocks?: any[]) => void;
  darkMode: boolean;
}

export default function StockManagement({ items, stocks, addStock, updateItemTotals, darkMode }: StockManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(stock => {
    const item = items.find(i => i.id === stock.itemId);
    const matchesSearch = item?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item?.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesItem = !selectedItem || stock.itemId.toString() === selectedItem;
    const matchesType = filterType === 'all' || stock.type === filterType;
    
    return matchesSearch && matchesItem && matchesType;
  });

  const handleAddStock = (stockData: any) => {
    addStock(stockData);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSelectedItem('');
    setFilterType('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          <span>Add Stock Entry</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Items
            </label>
            <div className="relative">
              <i className={`ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
              <input
                type="text"
                placeholder="Search by item name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="restock">Restock</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredStocks.length} of {stocks.length} stock entries
        </p>
        {(searchTerm || selectedItem || filterType !== 'all') && (
          <button
            onClick={clearFilters}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Stock Form Modal */}
      {showForm && (
        <StockForm
          items={items}
          onSubmit={handleAddStock}
          onCancel={() => setShowForm(false)}
          darkMode={darkMode}
        />
      )}

      {/* Stock List */}
      <StockList
        stocks={filteredStocks}
        items={items}
        darkMode={darkMode}
      />
    </div>
  );
}