
'use client';

import { useState } from 'react';
import GoogleSheetsSetup from './GoogleSheetsSetup';
import GoogleSheetsClient from '@/lib/googleSheetsClient';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  syncStatus?: string;
}

export default function Header({ activeTab, setActiveTab, darkMode, toggleTheme, syncStatus }: HeaderProps) {
  const [showGSheetsSetup, setShowGSheetsSetup] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'items', label: 'Items', icon: 'ri-box-line' },
    { id: 'stock', label: 'Stock', icon: 'ri-stack-line' },
    { id: 'reports', label: 'Reports', icon: 'ri-file-chart-line' }
  ];

  const handleTestConnection = async () => {
    try {
      GoogleSheetsClient.updateConfig();
      const result = await GoogleSheetsClient.testConnection();
      setTestResult(result);
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult({ success: false, message: 'Test failed' });
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  function getSyncStatusColor() {
    switch (syncStatus) {
      case 'syncing': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return darkMode ? 'text-gray-400' : 'text-gray-500';
    }
  }

  function getSyncStatusIcon() {
    switch (syncStatus) {
      case 'syncing': return 'ri-loader-4-line animate-spin';
      case 'success': return 'ri-check-line';
      case 'error': return 'ri-error-warning-line';
      default: return 'ri-cloud-line';
    }
  }

  return (
    <>
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold">
                <span className="font-pacifico">Inventory</span> Management
              </h1>
              
              <nav className="flex space-x-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2">
                <i className={`${getSyncStatusIcon()} ${getSyncStatusColor()}`}></i>
                <span className={`text-sm ${getSyncStatusColor()}`}>
                  {syncStatus === 'syncing' ? 'Syncing...' : 
                   syncStatus === 'success' ? 'Synced' : 
                   syncStatus === 'error' ? 'Sync Error' : 'Ready'}
                </span>
              </div>

              {/* Test Connection */}
              <button
                onClick={handleTestConnection}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <i className="ri-pulse-line w-4 h-4 flex items-center justify-center"></i>
                <span>Test</span>
              </button>

              {/* Setup Button */}
              <button
                onClick={() => setShowGSheetsSetup(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap ${
                  darkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <i className="ri-settings-3-line w-4 h-4 flex items-center justify-center"></i>
                <span>Setup</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <i className={`${darkMode ? 'ri-sun-line' : 'ri-moon-line'} text-lg w-5 h-5 flex items-center justify-center`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="container mx-auto px-4 py-2">
              <div className={`text-sm flex items-center space-x-2 ${
                testResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                <i className={`${testResult.success ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>
                <span>{testResult.message}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {showGSheetsSetup && (
        <GoogleSheetsSetup 
          darkMode={darkMode}
          onClose={() => setShowGSheetsSetup(false)}
        />
      )}
    </>
  );
}
