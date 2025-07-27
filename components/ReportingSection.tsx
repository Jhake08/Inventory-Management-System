
'use client';

import { useState, useMemo } from 'react';

interface ReportingSectionProps {
  items: any[];
  stocks: any[];
  darkMode: boolean;
}

export default function ReportingSection({ items, stocks, darkMode }: ReportingSectionProps) {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('all');
  const [selectedItem, setSelectedItem] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filteredStocks = stocks;
    
    if (dateRange === 'today') {
      filteredStocks = stocks.filter(stock => new Date(stock.date) >= today);
    } else if (dateRange === 'yesterday') {
      filteredStocks = stocks.filter(stock => {
        const stockDate = new Date(stock.date);
        return stockDate >= yesterday && stockDate < today;
      });
    } else if (dateRange === 'week') {
      filteredStocks = stocks.filter(stock => new Date(stock.date) >= week);
    } else if (dateRange === 'month') {
      filteredStocks = stocks.filter(stock => new Date(stock.date) >= month);
    }

    if (selectedItem) {
      filteredStocks = filteredStocks.filter(stock => stock.itemId.toString() === selectedItem);
    }

    return filteredStocks;
  }, [stocks, dateRange, selectedItem]);

  const generateInventoryReport = () => {
    const report = {
      type: 'Inventory Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      data: items.map(item => ({
        code: item.code,
        name: item.name,
        category: item.category,
        supplier: item.supplier,
        currentStock: item.remainingStock || 0,
        totalStock: item.totalStock || 0,
        soldQuantity: item.soldQuantity || 0,
        costPrice: item.costPrice || 0,
        unitPrice: item.price || 0,
        totalCostValue: (item.remainingStock || 0) * (item.costPrice || 0),
        totalValue: (item.remainingStock || 0) * (item.price || 0),
        profitMargin: item.price && item.costPrice ? 
          (((item.price - item.costPrice) / item.price) * 100) : 0,
        status: getStockStatus(item).status
      }))
    };
    
    setGeneratedReport(report);
  };

  const generateSalesReport = () => {
    const salesStocks = reportData.filter(stock => stock.type === 'sale');
    const salesByItem = {};
    
    salesStocks.forEach(stock => {
      const item = items.find(i => i.id === stock.itemId);
      if (item) {
        if (!salesByItem[item.id]) {
          salesByItem[item.id] = {
            code: item.code,
            name: item.name,
            category: item.category,
            costPrice: item.costPrice || 0,
            unitPrice: item.price || 0,
            totalSold: 0,
            totalRevenue: 0,
            totalCOGS: 0,
            grossProfit: 0,
            profitMargin: 0,
            transactions: []
          };
        }
        const soldQty = stock.soldQuantity || 0;
        salesByItem[item.id].totalSold += soldQty;
        salesByItem[item.id].totalRevenue += soldQty * (item.price || 0);
        salesByItem[item.id].totalCOGS += soldQty * (item.costPrice || 0);
        salesByItem[item.id].grossProfit = salesByItem[item.id].totalRevenue - salesByItem[item.id].totalCOGS;
        salesByItem[item.id].profitMargin = salesByItem[item.id].totalRevenue > 0 ? 
          (salesByItem[item.id].grossProfit / salesByItem[item.id].totalRevenue) * 100 : 0;
        salesByItem[item.id].transactions.push({
          date: stock.date,
          quantity: soldQty,
          agent: stock.agent || 'System'
        });
      }
    });

    const totalRevenue = Object.values(salesByItem).reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalCOGS = Object.values(salesByItem).reduce((sum, item) => sum + item.totalCOGS, 0);
    const totalGrossProfit = totalRevenue - totalCOGS;

    const report = {
      type: 'Sales Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      data: Object.values(salesByItem),
      summary: {
        totalRevenue,
        totalCOGS,
        totalGrossProfit,
        overallProfitMargin: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
        totalQuantity: Object.values(salesByItem).reduce((sum, item) => sum + item.totalSold, 0),
        itemCount: Object.keys(salesByItem).length
      }
    };
    
    setGeneratedReport(report);
  };

  const generateProfitabilityReport = () => {
    const profitabilityData = items.map(item => {
      const soldQty = item.soldQuantity || 0;
      const revenue = soldQty * (item.price || 0);
      const cogs = soldQty * (item.costPrice || 0);
      const grossProfit = revenue - cogs;
      const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      
      return {
        code: item.code,
        name: item.name,
        category: item.category,
        unitsSold: soldQty,
        costPrice: item.costPrice || 0,
        sellingPrice: item.price || 0,
        revenue,
        cogs,
        grossProfit,
        profitMargin,
        profitPerUnit: (item.price || 0) - (item.costPrice || 0)
      };
    }).filter(item => item.unitsSold > 0);

    const totalRevenue = profitabilityData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCOGS = profitabilityData.reduce((sum, item) => sum + item.cogs, 0);
    const totalGrossProfit = totalRevenue - totalCOGS;

    const report = {
      type: 'Profitability Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      data: profitabilityData.sort((a, b) => b.grossProfit - a.grossProfit),
      summary: {
        totalRevenue,
        totalCOGS,
        totalGrossProfit,
        overallProfitMargin: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
        profitableItems: profitabilityData.filter(item => item.grossProfit > 0).length,
        totalItems: profitabilityData.length
      }
    };
    
    setGeneratedReport(report);
  };

  const generateStockMovementReport = () => {
    const groupedData = reportData.reduce((acc, stock) => {
      const item = items.find(i => i.id === stock.itemId);
      if (item) {
        if (!acc[item.id]) {
          acc[item.id] = {
            code: item.code,
            name: item.name,
            category: item.category,
            movements: []
          };
        }
        acc[item.id].movements.push({
          date: stock.date,
          type: stock.type,
          quantity: stock.quantity || 0,
          soldQuantity: stock.soldQuantity || 0,
          agent: stock.agent || 'System',
          notes: stock.notes || ''
        });
      }
      return acc;
    }, {});

    const report = {
      type: 'Stock Movement Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      data: Object.values(groupedData)
    };
    
    setGeneratedReport(report);
  };

  const getStockStatus = (item: any) => {
    if (item.remainingStock === 0) {
      return { status: 'Out of Stock', color: 'text-red-500' };
    } else if (item.remainingStock <= (item.lowStockThreshold || 10)) {
      return { status: 'Low Stock', color: 'text-yellow-500' };
    } else {
      return { status: 'In Stock', color: 'text-green-500' };
    }
  };

  const exportToCSV = () => {
    if (!generatedReport) return;

    let csvContent = `${generatedReport.type}\n`;
    csvContent += `Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}\n`;
    csvContent += `Date Range: ${dateRange}\n\n`;

    if (generatedReport.type === 'Inventory Report') {
      csvContent += 'Code,Name,Category,Supplier,Current Stock,Cost Price,Unit Price,Total Cost Value,Total Value,Profit Margin,Status\n';
      generatedReport.data.forEach(item => {
        csvContent += `${item.code},${item.name},${item.category},${item.supplier},${item.currentStock},${item.costPrice.toFixed(2)},${item.unitPrice.toFixed(2)},${item.totalCostValue.toFixed(2)},${item.totalValue.toFixed(2)},${item.profitMargin.toFixed(1)}%,${item.status}\n`;
      });
    } else if (generatedReport.type === 'Sales Report') {
      csvContent += 'Code,Name,Category,Cost Price,Unit Price,Total Sold,Total Revenue,Total COGS,Gross Profit,Profit Margin\n';
      generatedReport.data.forEach(item => {
        csvContent += `${item.code},${item.name},${item.category},${item.costPrice.toFixed(2)},${item.unitPrice.toFixed(2)},${item.totalSold},${item.totalRevenue.toFixed(2)},${item.totalCOGS.toFixed(2)},${item.grossProfit.toFixed(2)},${item.profitMargin.toFixed(1)}%\n`;
      });
    } else if (generatedReport.type === 'Profitability Report') {
      csvContent += 'Code,Name,Category,Units Sold,Cost Price,Selling Price,Revenue,COGS,Gross Profit,Profit Margin,Profit Per Unit\n';
      generatedReport.data.forEach(item => {
        csvContent += `${item.code},${item.name},${item.category},${item.unitsSold},${item.costPrice.toFixed(2)},${item.sellingPrice.toFixed(2)},${item.revenue.toFixed(2)},${item.cogs.toFixed(2)},${item.grossProfit.toFixed(2)},${item.profitMargin.toFixed(1)}%,${item.profitPerUnit.toFixed(2)}\n`;
      });
    } else if (generatedReport.type === 'Stock Movement Report') {
      csvContent += 'Code,Name,Category,Date,Type,Quantity,Sold Quantity,Agent,Notes\n';
      generatedReport.data.forEach(item => {
        item.movements.forEach(movement => {
          csvContent += `${item.code},${item.name},${item.category},${new Date(movement.date).toLocaleDateString()},${movement.type},${movement.quantity},${movement.soldQuantity},${movement.agent},"${movement.notes}"\n`;
        });
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${generatedReport.type.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    switch (reportType) {
      case 'inventory':
        generateInventoryReport();
        break;
      case 'sales':
        generateSalesReport();
        break;
      case 'profitability':
        generateProfitabilityReport();
        break;
      case 'movement':
        generateStockMovementReport();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      </div>

      {/* Report Generation Controls */}
      <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="inventory">Inventory Report</option>
              <option value="sales">Sales Report</option>
              <option value="profitability">Profitability Report</option>
              <option value="movement">Stock Movement Report</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm pr-8 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filter by Item
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

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{generatedReport.type}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm whitespace-nowrap"
            >
              <i className="ri-download-line"></i>
              <span>Export CSV</span>
            </button>
          </div>

          {/* Report Content */}
          <div className="overflow-x-auto">
            {generatedReport.type === 'Inventory Report' && (
              <table className="w-full text-sm">
                <thead className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className="text-left py-2">Code</th>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Stock</th>
                    <th className="text-left py-2">Cost Price</th>
                    <th className="text-left py-2">Selling Price</th>
                    <th className="text-left py-2">Total Cost Value</th>
                    <th className="text-left py-2">Total Value</th>
                    <th className="text-left py-2">Profit Margin</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.data.map((item, index) => (
                    <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-2">{item.code}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{item.currentStock}</td>
                      <td className="py-2">${item.costPrice.toFixed(2)}</td>
                      <td className="py-2">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2">${item.totalCostValue.toFixed(2)}</td>
                      <td className="py-2">${item.totalValue.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.profitMargin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={getStockStatus(item).color}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {generatedReport.type === 'Sales Report' && (
              <div>
                {generatedReport.summary && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-green-500">
                        ${generatedReport.summary.totalRevenue.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Revenue
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-red-500">
                        ${generatedReport.summary.totalCOGS.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total COGS
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-blue-500">
                        ${generatedReport.summary.totalGrossProfit.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gross Profit
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-purple-500">
                        {generatedReport.summary.overallProfitMargin.toFixed(1)}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Profit Margin
                      </div>
                    </div>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className="text-left py-2">Code</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Quantity Sold</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">COGS</th>
                      <th className="text-left py-2">Gross Profit</th>
                      <th className="text-left py-2">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.data.map((item, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-2">{item.code}</td>
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.totalSold}</td>
                        <td className="py-2">${item.totalRevenue.toFixed(2)}</td>
                        <td className="py-2">${item.totalCOGS.toFixed(2)}</td>
                        <td className="py-2">
                          <span className={item.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                            ${item.grossProfit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {generatedReport.type === 'Profitability Report' && (
              <div>
                {generatedReport.summary && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-green-500">
                        ${generatedReport.summary.totalRevenue.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Revenue
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-red-500">
                        ${generatedReport.summary.totalCOGS.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total COGS
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-blue-500">
                        ${generatedReport.summary.totalGrossProfit.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gross Profit
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-purple-500">
                        {generatedReport.summary.overallProfitMargin.toFixed(1)}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overall Margin
                      </div>
                    </div>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className="text-left py-2">Code</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Units Sold</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">COGS</th>
                      <th className="text-left py-2">Gross Profit</th>
                      <th className="text-left py-2">Margin</th>
                      <th className="text-left py-2">Profit/Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.data.map((item, index) => (
                      <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-2">{item.code}</td>
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.unitsSold}</td>
                        <td className="py-2">${item.revenue.toFixed(2)}</td>
                        <td className="py-2">${item.cogs.toFixed(2)}</td>
                        <td className="py-2">
                          <span className={item.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                            ${item.grossProfit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={item.profitPerUnit > 0 ? 'text-green-600' : 'text-red-600'}>
                            ${item.profitPerUnit.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {generatedReport.type === 'Stock Movement Report' && (
              <div className="space-y-4">
                {generatedReport.data.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className="font-medium mb-2">{item.name} ({item.code})</h4>
                    <div className="space-y-2">
                      {item.movements.map((movement, mIndex) => (
                        <div key={mIndex} className={`flex items-center justify-between text-sm p-2 rounded ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">
                              {new Date(movement.date).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              movement.type === 'restock' 
                                ? 'bg-green-100 text-green-800' 
                                : movement.type === 'sale'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {movement.type}
                            </span>
                            <span>
                              {movement.type === 'sale' ? `-${movement.soldQuantity}` : `+${movement.quantity}`}
                            </span>
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {movement.agent}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
