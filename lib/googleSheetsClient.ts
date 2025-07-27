
'use client';

class GoogleSheetsClient {
  private config: any = {};

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_sheets_config');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    }
  }

  isConfigured() {
    return this.config.apiKey && this.config.clientId && this.config.clientSecret && 
           this.config.refreshToken && this.config.spreadsheetId;
  }

  updateConfig() {
    this.loadConfig();
  }

  async getAccessToken() {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
      }
      return data.access_token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  async makeRequest(endpoint: string, options: any = {}) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Sheets API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      const result = await this.makeRequest('');
      return {
        success: true,
        message: `Connected to spreadsheet: ${result.properties.title}`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  async createMasterSheetIfNeeded() {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      // Check if Master_Items sheet exists
      const spreadsheet = await this.makeRequest('');
      const masterSheet = spreadsheet.sheets.find(sheet => 
        sheet.properties.title === 'Master_Items'
      );

      if (!masterSheet) {
        // Create Master_Items sheet
        await this.makeRequest(':batchUpdate', {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              addSheet: {
                properties: {
                  title: 'Master_Items'
                }
              }
            }]
          })
        });

        // Add headers to Master_Items sheet
        await this.makeRequest(`/values/Master_Items!A1:M1`, {
          method: 'PUT',
          body: JSON.stringify({
            values: [[
              'Item Code',
              'Name',
              'Category',
              'Supplier',
              'Unit Price',
              'Cost Price',
              'Low Stock Threshold',
              'Total Stock',
              'Sold Quantity',
              'Remaining Stock',
              'Profit Margin',
              'Created Date',
              'Status'
            ]],
            majorDimension: 'ROWS'
          })
        });
      }

      return {
        success: true,
        message: 'Master sheet created successfully with proper headers'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create master sheet: ${error.message}`
      };
    }
  }

  async createItemSheet(itemCode: string) {
    try {
      const sheetName = `${itemCode}_Stock`;
      
      // Check if sheet already exists
      const spreadsheet = await this.makeRequest('');
      const existingSheet = spreadsheet.sheets.find(sheet => 
        sheet.properties.title === sheetName
      );

      if (!existingSheet) {
        // Create new sheet
        await this.makeRequest(':batchUpdate', {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          })
        });

        // Add headers
        await this.makeRequest(`/values/${sheetName}!A1:H1`, {
          method: 'PUT',
          body: JSON.stringify({
            values: [[
              'Date',
              'Transaction Type',
              'Quantity',
              'Sold Quantity',
              'Remaining Stock',
              'Agent/Person',
              'Notes',
              'Total Stock'
            ]],
            majorDimension: 'ROWS'
          })
        });
      }

      return {
        success: true,
        message: `Item sheet ${sheetName} created successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create item sheet: ${error.message}`
      };
    }
  }

  async addItemToMaster(item: any) {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      const profitMargin = item.price && item.costPrice ? 
        (((item.price - item.costPrice) / item.price) * 100).toFixed(2) + '%' : '0%';

      const values = [[
        item.code,
        item.name,
        item.category,
        item.supplier,
        item.price,
        item.costPrice,
        item.lowStockThreshold,
        item.totalStock || 0,
        item.soldQuantity || 0,
        item.remainingStock || 0,
        profitMargin,
        new Date(item.createdAt).toLocaleDateString(),
        'Active'
      ]];

      await this.makeRequest(`/values/Master_Items:append`, {
        method: 'POST',
        body: JSON.stringify({
          values: values,
          majorDimension: 'ROWS'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Create individual item sheet
      await this.createItemSheet(item.code);

      return {
        success: true,
        message: `Item ${item.code} added to master sheet successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add item to master sheet: ${error.message}`
      };
    }
  }

  async updateItemInMaster(item: any) {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      // Find the row with this item code
      const result = await this.makeRequest(`/values/Master_Items!A:A`);
      const values = result.values || [];
      
      let rowIndex = -1;
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === item.code) {
          rowIndex = i + 1; // Google Sheets is 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        return {
          success: false,
          message: `Item ${item.code} not found in master sheet`
        };
      }

      const profitMargin = item.price && item.costPrice ? 
        (((item.price - item.costPrice) / item.price) * 100).toFixed(2) + '%' : '0%';

      const updateValues = [[
        item.code,
        item.name,
        item.category,
        item.supplier,
        item.price,
        item.costPrice,
        item.lowStockThreshold,
        item.totalStock || 0,
        item.soldQuantity || 0,
        item.remainingStock || 0,
        profitMargin,
        new Date(item.createdAt).toLocaleDateString(),
        'Active'
      ]];

      await this.makeRequest(`/values/Master_Items!A${rowIndex}:M${rowIndex}`, {
        method: 'PUT',
        body: JSON.stringify({
          values: updateValues,
          majorDimension: 'ROWS'
        })
      });

      return {
        success: true,
        message: `Item ${item.code} updated in master sheet successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update item in master sheet: ${error.message}`
      };
    }
  }

  async deleteItemFromMaster(itemCode: string) {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      // Find the row with this item code
      const result = await this.makeRequest(`/values/Master_Items!A:A`);
      const values = result.values || [];
      
      let rowIndex = -1;
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === itemCode) {
          rowIndex = i; // 0-indexed for deletion
          break;
        }
      }

      if (rowIndex === -1) {
        return {
          success: false,
          message: `Item ${itemCode} not found in master sheet`
        };
      }

      // Get sheet ID for Master_Items
      const spreadsheet = await this.makeRequest('');
      const masterSheet = spreadsheet.sheets.find(sheet => 
        sheet.properties.title === 'Master_Items'
      );

      if (!masterSheet) {
        return {
          success: false,
          message: 'Master_Items sheet not found'
        };
      }

      // Delete the row
      await this.makeRequest(':batchUpdate', {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            deleteDimension: {
              range: {
                sheetId: masterSheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }]
        })
      });

      return {
        success: true,
        message: `Item ${itemCode} deleted from master sheet successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete item from master sheet: ${error.message}`
      };
    }
  }

  async addStockEntry(itemCode: string, stockData: any) {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }

    try {
      const sheetName = `${itemCode}_Stock`;
      
      // Ensure the item sheet exists
      await this.createItemSheet(itemCode);
      
      const values = [[
        new Date(stockData.date || new Date()).toLocaleDateString(),
        stockData.transactionType || stockData.type || 'Restock',
        stockData.quantity || 0,
        stockData.soldQuantity || 0,
        stockData.remainingStock || 0,
        stockData.agent || 'System',
        stockData.notes || '',
        stockData.totalStock || 0
      ]];

      await this.makeRequest(`/values/${sheetName}:append`, {
        method: 'POST',
        body: JSON.stringify({
          values: values,
          majorDimension: 'ROWS'
        })
      });

      return {
        success: true,
        message: `Stock entry added to ${sheetName} successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add stock entry: ${error.message}`
      };
    }
  }
}

export default new GoogleSheetsClient();
