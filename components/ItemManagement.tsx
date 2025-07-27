'use client';

import { useState, useEffect } from 'react';
import ItemForm from './ItemForm';
import ItemList from './ItemList';

interface ItemManagementProps {
  items: any[];
  addItem: (item: any) => void;
  updateItem: (id: number, item: any) => void;
  deleteItem: (id: number) => void;
  darkMode: boolean;
}

export default function ItemManagement({ items, addItem, updateItem, deleteItem, darkMode }: ItemManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
  const suppliers = [...new Set(items.map(item => item.supplier).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSupplier = !filterSupplier || item.supplier === filterSupplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleAddItem = (itemData: any) => {
    addItem(itemData);
    setShowForm(false);
  };

  const handleUpdateItem = (itemData: any) => {
    updateItem(editingItem.id, itemData);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterSupplier('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Item Management</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search and Filters */}
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
                placeholder="Search by name or code..."
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
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Supplier
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
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
          Showing {filteredItems.length} of {items.length} items
        </p>
        {(searchTerm || filterCategory || filterSupplier) && (
          <button
            onClick={clearFilters}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Item Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Item List */}
      <ItemList
        items={filteredItems}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        darkMode={darkMode}
      />
    </div>
  );
}