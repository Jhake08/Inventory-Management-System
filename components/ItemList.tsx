
'use client';

interface ItemListProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  darkMode: boolean;
}

export default function ItemList({ items, onEdit, onDelete, darkMode }: ItemListProps) {
  const getStockStatus = (item: any) => {
    if (item.remainingStock === 0) {
      return { text: 'Out of Stock', color: 'text-red-500' };
    } else if (item.remainingStock <= (item.lowStockThreshold || 10)) {
      return { text: 'Low Stock', color: 'text-yellow-500' };
    } else {
      return { text: 'In Stock', color: 'text-green-500' };
    }
  };

  const getProfitMargin = (item: any) => {
    if (!item.price || !item.costPrice) return '0.0';
    return (((item.price - item.costPrice) / item.price) * 100).toFixed(1);
  };

  if (items.length === 0) {
    return (
      <div className={`p-8 rounded-xl shadow-sm border text-center transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <i className="ri-box-line text-4xl text-gray-400 mb-4"></i>
        <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          No items found
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add your first item to get started
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm border transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <tr>
              <th className="text-left p-4 font-medium text-sm">Item</th>
              <th className="text-left p-4 font-medium text-sm">Category</th>
              <th className="text-left p-4 font-medium text-sm">Supplier</th>
              <th className="text-left p-4 font-medium text-sm">Cost Price</th>
              <th className="text-left p-4 font-medium text-sm">Selling Price</th>
              <th className="text-left p-4 font-medium text-sm">Profit Margin</th>
              <th className="text-left p-4 font-medium text-sm">Stock</th>
              <th className="text-left p-4 font-medium text-sm">Status</th>
              <th className="text-left p-4 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const status = getStockStatus(item);
              const profitMargin = getProfitMargin(item);
              
              return (
                <tr key={item.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.code}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{item.supplier}</td>
                  <td className="p-4 text-sm font-medium">
                    ${(item.costPrice || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm font-medium">
                    ${(item.price || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`font-medium ${
                      parseFloat(profitMargin) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profitMargin}%
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="space-y-1">
                      <div>Available: {item.remainingStock || 0}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total: {item.totalStock || 0} | Sold: {item.soldQuantity || 0}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          darkMode 
                            ? 'hover:bg-gray-700 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          darkMode 
                            ? 'hover:bg-red-600 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
