
'use client';

import { useMemo } from 'react';

interface DashboardProps {
  items: any[];
  stocks: any[];
  darkMode: boolean;
}

export default function Dashboard({ items, stocks, darkMode }: DashboardProps) {
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalStockValue = items.reduce((sum, item) => sum + (item.totalStock * (item.price || 0)), 0);
    const totalCostValue = items.reduce((sum, item) => sum + (item.totalStock * (item.costPrice || 0)), 0);
    const totalSales = items.reduce((sum, item) => sum + (item.soldQuantity * (item.price || 0)), 0);
    const totalCOGS = items.reduce((sum, item) => sum + (item.soldQuantity * (item.costPrice || 0)), 0);
    const grossProfit = totalSales - totalCOGS;
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    
    const lowStockItems = items.filter(item => item.remainingStock <= (item.lowStockThreshold || 10));
    const outOfStockItems = items.filter(item => item.remainingStock === 0);

    return {
      totalItems,
      totalStockValue,
      totalCostValue,
      totalSales,
      totalCOGS,
      grossProfit,
      profitMargin,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      lowStockList: lowStockItems
    };
  }, [items]);

  const recentActivities = useMemo(() => {
    return stocks
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(stock => {
        const item = items.find(i => i.id === stock.itemId);
        return {
          ...stock,
          itemName: item?.name || 'Unknown Item'
        };
      });
  }, [stocks, items]);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} suppressHydrationWarning={true}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon="ri-box-3-line"
          color="bg-blue-500"
          subtitle="Items in inventory"
        />
        <StatCard
          title="Stock Value"
          value={`$${stats.totalStockValue.toLocaleString()}`}
          icon="ri-money-dollar-circle-line"
          color="bg-green-500"
          subtitle="Total inventory value"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems}
          icon="ri-alert-line"
          color="bg-yellow-500"
          subtitle="Items need restocking"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockItems}
          icon="ri-close-circle-line"
          color="bg-red-500"
          subtitle="Items unavailable"
        />
      </div>

      {/* Financial Overview */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="ri-bar-chart-line text-blue-500 mr-2"></i>
          Financial Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalSales.toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Sales Revenue
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalCOGS.toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cost of Goods Sold
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${stats.grossProfit.toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gross Profit
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              stats.profitMargin > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.profitMargin.toFixed(1)}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Profit Margin
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-alert-line text-yellow-500 mr-2"></i>
            Low Stock Alert
          </h3>
          <div className="space-y-3">
            {stats.lowStockList.length > 0 ? (
              stats.lowStockList.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Code: {item.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      item.remainingStock === 0 ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {item.remainingStock} left
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Threshold: {item.lowStockThreshold || 10}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No low stock items
              </p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-history-line text-blue-500 mr-2"></i>
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className="font-medium">{activity.itemName}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.type === 'restock' ? 'Restocked' : 'Sold'} {activity.quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
