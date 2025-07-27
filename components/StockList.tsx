'use client';

interface StockListProps {
  stocks: any[];
  items: any[];
  darkMode: boolean;
}

export default function StockList({ stocks, items, darkMode }: StockListProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restock':
        return { icon: 'ri-add-circle-line', color: 'text-green-600' };
      case 'sale':
        return { icon: 'ri-subtract-line', color: 'text-red-600' };
      case 'adjustment':
        return { icon: 'ri-edit-circle-line', color: 'text-blue-600' };
      default:
        return { icon: 'ri-record-circle-line', color: 'text-gray-600' };
    }
  };

  const getTypeIconDark = (type: string) => {
    switch (type) {
      case 'restock':
        return { icon: 'ri-add-circle-line', color: 'text-green-400' };
      case 'sale':
        return { icon: 'ri-subtract-line', color: 'text-red-400' };
      case 'adjustment':
        return { icon: 'ri-edit-circle-line', color: 'text-blue-400' };
      default:
        return { icon: 'ri-record-circle-line', color: 'text-gray-400' };
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedStocks.length === 0) {
    return (
      <div className={`text-center py-16 rounded-xl border transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <i className={`ri-stack-line text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
        </div>
        <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          No stock entries found
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Add stock entries to track inventory movements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className={`hidden md:block rounded-xl shadow-sm border overflow-hidden transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="grid grid-cols-12 gap-4 text-sm font-medium">
            <div className="col-span-1">Type</div>
            <div className="col-span-3">Item</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Agent</div>
            <div className="col-span-2">Notes</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedStocks.map((stock) => {
            const item = items.find(i => i.id === stock.itemId);
            const typeInfo = darkMode ? getTypeIconDark(stock.type) : getTypeIcon(stock.type);
            
            return (
              <div key={stock.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                darkMode ? 'divide-gray-700 hover:bg-gray-700' : 'divide-gray-200'
              }`}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <div className="flex items-center">
                      <i className={`${typeInfo.icon} ${typeInfo.color} text-lg`}></i>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item?.code || 'N/A'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm">
                      {stock.type === 'restock' && (
                        <span className="text-green-600 font-medium">
                          +{stock.quantity}
                        </span>
                      )}
                      {stock.type === 'sale' && (
                        <span className="text-red-600 font-medium">
                          -{stock.soldQuantity}
                        </span>
                      )}
                      {stock.type === 'adjustment' && (
                        <span className="text-blue-600 font-medium">
                          {stock.quantity > 0 ? '+' : ''}{stock.quantity}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {stock.type}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm">
                      {new Date(stock.date).toLocaleDateString()}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(stock.date).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {stock.agent || 'System'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stock.notes || '-'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedStocks.map((stock) => {
          const item = items.find(i => i.id === stock.itemId);
          const typeInfo = darkMode ? getTypeIconDark(stock.type) : getTypeIcon(stock.type);
          
          return (
            <div key={stock.id} className={`p-4 rounded-xl shadow-sm border transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <i className={`${typeInfo.icon} ${typeInfo.color} text-xl`}></i>
                  <div>
                    <h3 className="font-medium">{item?.name || 'Unknown Item'}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item?.code || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {stock.type === 'restock' && (
                      <span className="text-green-600 font-medium">
                        +{stock.quantity}
                      </span>
                    )}
                    {stock.type === 'sale' && (
                      <span className="text-red-600 font-medium">
                        -{stock.soldQuantity}
                      </span>
                    )}
                    {stock.type === 'adjustment' && (
                      <span className="text-blue-600 font-medium">
                        {stock.quantity > 0 ? '+' : ''}{stock.quantity}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {stock.type}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Date:</span>
                  <div className="mt-1">
                    {new Date(stock.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Agent:</span>
                  <div className="mt-1">{stock.agent || 'System'}</div>
                </div>
              </div>
              
              {stock.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Notes:</span>
                  <div className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stock.notes}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}