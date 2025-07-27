
'use client';

import { useState, useEffect } from 'react';

interface ItemFormProps {
  item?: any;
  onSubmit: (item: any) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export default function ItemForm({ item, onSubmit, onCancel, darkMode }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    supplier: '',
    price: '',
    costPrice: '',
    lowStockThreshold: '10'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        supplier: item.supplier || '',
        price: item.price?.toString() || '',
        costPrice: item.costPrice?.toString() || '',
        lowStockThreshold: item.lowStockThreshold?.toString() || '10'
      });
    }
  }, [item]);

  const categories = [
    'Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Home & Garden',
    'Sports', 'Toys', 'Health & Beauty', 'Automotive', 'Office Supplies'
  ];

  const suppliers = [
    'Supplier A', 'Supplier B', 'Supplier C', 'Local Distributor',
    'International Trading Co.', 'Premium Wholesale', 'Budget Supplies'
  ];

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid selling price is required';
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }

    if (parseFloat(formData.costPrice) >= parseFloat(formData.price)) {
      newErrors.costPrice = 'Cost price should be less than selling price';
    }
    
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = 'Valid low stock threshold is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const itemData = {
      ...formData,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      lowStockThreshold: parseInt(formData.lowStockThreshold)
    };
    
    onSubmit(itemData);
    
    // Clear form
    setFormData({
      name: '',
      category: '',
      supplier: '',
      price: '',
      costPrice: '',
      lowStockThreshold: '10'
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const profitMargin = formData.price && formData.costPrice 
    ? ((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full mx-4 rounded-xl shadow-2xl transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {item ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                  errors.name
                    ? 'border-red-500'
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                    errors.category
                      ? 'border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier *
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                    errors.supplier
                      ? 'border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cost Price *
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                    errors.costPrice
                      ? 'border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
                {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Selling Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                    errors.price
                      ? 'border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Profit Margin Display */}
            {formData.price && formData.costPrice && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Profit Margin:
                  </span>
                  <span className={`font-medium ${
                    parseFloat(profitMargin) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profitMargin}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Profit per unit:
                  </span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    ${(parseFloat(formData.price || '0') - parseFloat(formData.costPrice || '0')).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Low Stock Threshold *
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                  errors.lowStockThreshold
                    ? 'border-red-500'
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="10"
              />
              {errors.lowStockThreshold && <p className="text-red-500 text-xs mt-1">{errors.lowStockThreshold}</p>}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors duration-200 text-sm font-medium whitespace-nowrap ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap"
              >
                {item ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
