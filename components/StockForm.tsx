'use client';

import { useState } from 'react';

interface StockFormProps {
  items: any[];
  onSubmit: (stock: any) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export default function StockForm({ items, onSubmit, onCancel, darkMode }: StockFormProps) {
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'restock',
    quantity: '',
    soldQuantity: '',
    notes: '',
    agent: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.itemId) newErrors.itemId = 'Please select an item';
    if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    if (formData.type === 'sale' && (!formData.soldQuantity || parseInt(formData.soldQuantity) <= 0)) {
      newErrors.soldQuantity = 'Valid sold quantity is required for sales';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const stockData = {
        itemId: parseInt(formData.itemId),
        type: formData.type,
        quantity: formData.type === 'sale' ? 0 : parseInt(formData.quantity),
        soldQuantity: formData.type === 'sale' ? parseInt(formData.soldQuantity || formData.quantity) : 0,
        notes: formData.notes.trim(),
        agent: formData.agent.trim() || 'System'
      };
      
      onSubmit(stockData);
      
      // Reset form
      setFormData({
        itemId: '',
        type: 'restock',
        quantity: '',
        soldQuantity: '',
        notes: '',
        agent: ''
      });
    }
  };

  const selectedItem = items.find(item => item.id === parseInt(formData.itemId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Add Stock Entry</h3>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Item *
                </label>
                <select
                  name="itemId"
                  value={formData.itemId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                    errors.itemId
                      ? 'border-red-500 focus:border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                >
                  <option value="">Choose an item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.code}) - Current: {item.remainingStock || 0}
                    </option>
                  ))}
                </select>
                {errors.itemId && <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Transaction Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                >
                  <option value="restock">Restock (Add Inventory)</option>
                  <option value="sale">Sale (Remove Inventory)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              {formData.type === 'restock' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity to Add *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      errors.quantity
                        ? 'border-red-500 focus:border-red-500'
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
              )}

              {formData.type === 'sale' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity Sold *
                  </label>
                  <input
                    type="number"
                    name="soldQuantity"
                    value={formData.soldQuantity}
                    onChange={handleChange}
                    min="1"
                    max={selectedItem?.remainingStock || 0}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      errors.soldQuantity
                        ? 'border-red-500 focus:border-red-500'
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                    placeholder="Enter sold quantity"
                  />
                  {errors.soldQuantity && <p className="text-red-500 text-xs mt-1">{errors.soldQuantity}</p>}
                  {selectedItem && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Available: {selectedItem.remainingStock || 0} units
                    </p>
                  )}
                </div>
              )}

              {formData.type === 'adjustment' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Adjustment Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      errors.quantity
                        ? 'border-red-500 focus:border-red-500'
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                    placeholder="Enter adjustment (+/-)"
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Use positive numbers to add, negative to subtract
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Agent/Person
                </label>
                <input
                  type="text"
                  name="agent"
                  value={formData.agent}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Enter agent name"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
                placeholder="Enter additional notes (optional)"
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formData.notes.length}/500 characters
              </p>
            </div>

            {selectedItem && (
              <div className={`p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Stock Information
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Stock:</span>
                    <div className="font-medium">{selectedItem.totalStock || 0}</div>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sold:</span>
                    <div className="font-medium">{selectedItem.soldQuantity || 0}</div>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available:</span>
                    <div className="font-medium">{selectedItem.remainingStock || 0}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                Add Stock Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}