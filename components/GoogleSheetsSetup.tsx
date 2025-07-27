'use client';

import { useState, useEffect } from 'react';
import GoogleSheetsClient from '@/lib/googleSheetsClient';

interface GoogleSheetsSetupProps {
  darkMode: boolean;
  onClose: () => void;
}

export default function GoogleSheetsSetup({ darkMode, onClose }: GoogleSheetsSetupProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    apiKey: '',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    spreadsheetId: ''
  });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('google_sheets_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = () => {
    localStorage.setItem('google_sheets_config', JSON.stringify(config));
    GoogleSheetsClient.updateConfig();
    alert('Configuration saved successfully!');
    onClose();
  };

  const testConnection = async () => {
    // Save temporarily to test
    localStorage.setItem('google_sheets_config', JSON.stringify(config));
    GoogleSheetsClient.updateConfig();
    
    try {
      const result = await GoogleSheetsClient.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed' });
    }
  };

  const createSampleSheet = async () => {
    try {
      localStorage.setItem('google_sheets_config', JSON.stringify(config));
      GoogleSheetsClient.updateConfig();
      
      const result = await GoogleSheetsClient.createMasterSheetIfNeeded();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to create sample sheets' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-4xl w-full mx-4 rounded-xl shadow-2xl transition-colors duration-200 max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Google Sheets Integration Setup</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <h3 className="font-semibold text-blue-600 mb-2">Step 1: Google Cloud Console Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://console.cloud.google.com/" className="text-blue-500 underline" target="_blank">Google Cloud Console</a></li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable Google Sheets API in the API Library</li>
                  <li>Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"</li>
                  <li>Configure consent screen if needed</li>
                  <li>Set application type to "Web application"</li>
                  <li>Add redirect URI: https://developers.google.com/oauthplayground</li>
                </ol>
              </div>

              <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
                darkMode ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <h3 className="font-semibold text-green-600 mb-2">Step 2: OAuth 2.0 Playground</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://developers.google.com/oauthplayground/" className="text-blue-500 underline" target="_blank">OAuth 2.0 Playground</a></li>
                  <li>Click settings (gear icon) → Use your own OAuth credentials</li>
                  <li>Enter your Client ID and Client Secret</li>
                  <li>In Step 1, find "Google Sheets API v4" → Select "https://www.googleapis.com/auth/spreadsheets"</li>
                  <li>Click "Authorize APIs"</li>
                  <li>In Step 2, click "Exchange authorization code for tokens"</li>
                  <li>Copy the "Refresh token" (save this securely)</li>
                </ol>
              </div>

              <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${
                darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
              }`}>
                <h3 className="font-semibold text-purple-600 mb-2">Step 3: Create Google Spreadsheet</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://sheets.google.com" className="text-blue-500 underline" target="_blank">Google Sheets</a></li>
                  <li>Create a new blank spreadsheet</li>
                  <li>Copy the Spreadsheet ID from the URL (between /d/ and /edit)</li>
                  <li>Example: docs.google.com/spreadsheets/d/<strong>YOUR_SPREADSHEET_ID</strong>/edit</li>
                </ol>
              </div>

              <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${
                darkMode ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}>
                <h3 className="font-semibold text-orange-600 mb-2">Step 4: Environment Variables (Optional)</h3>
                <p className="text-sm mb-2">For production, add these to your environment variables:</p>
                <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                  <li>GOOGLE_API_KEY=your_api_key</li>
                  <li>GOOGLE_CLIENT_ID=your_client_id</li>
                  <li>GOOGLE_CLIENT_SECRET=your_client_secret</li>
                  <li>GOOGLE_REFRESH_TOKEN=your_refresh_token</li>
                  <li>GOOGLE_SPREADSHEET_ID=your_spreadsheet_id</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
                >
                  Next: Enter Credentials
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${
                darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
              }`}>
                <h3 className="font-semibold text-yellow-600 mb-2">Enter Your Credentials</h3>
                <p className="text-sm">Fill in all the credentials from the previous steps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    API Key
                  </label>
                  <input
                    type="text"
                    value={config.apiKey}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your Google API Key"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={config.clientId}
                    onChange={(e) => handleConfigChange('clientId', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your OAuth Client ID"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your OAuth Client Secret"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Refresh Token
                  </label>
                  <input
                    type="password"
                    value={config.refreshToken}
                    onChange={(e) => handleConfigChange('refreshToken', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your OAuth Refresh Token"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={config.spreadsheetId}
                    onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Your Google Spreadsheet ID"
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Found in URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                  </p>
                </div>
              </div>

              {/* Test Connection Results */}
              {testResult && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  testResult.success 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className={`flex items-center space-x-2 ${
                    testResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <i className={`${testResult.success ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>
                    <span className="font-medium">{testResult.message}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Back
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={testConnection}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Test Connection
                  </button>
                  
                  <button
                    onClick={createSampleSheet}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Create Sample Sheets
                  </button>
                  
                  <button
                    onClick={saveConfig}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}