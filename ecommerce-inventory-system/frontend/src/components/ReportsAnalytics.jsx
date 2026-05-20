import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Package, Warehouse, DollarSign, AlertTriangle, Download, Filter } from 'lucide-react'

const ReportsAnalytics = () => {
  const [salesData, setSalesData] = useState([])
  const [stockData, setStockData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    loadReports()
  }, [selectedPeriod])

  const loadReports = async () => {
    try {
      // Load products for reports
      const productsResponse = await fetch('http://localhost:8080/api/products')
      const products = await productsResponse.json()
      
      // Load warehouses
      const warehousesResponse = await fetch('http://localhost:8080/api/warehouses')
      const warehouses = await warehousesResponse.json()
      
      // Generate sales report (simulated from products)
      const salesData = products.map(p => ({
        name: p.name,
        category: p.category,
        sales: Math.floor(Math.random() * 500) + 100,
        revenue: p.price * (Math.floor(Math.random() * 50) + 10),
        growth: (Math.random() * 20 - 5).toFixed(1)
      }))
      setSalesData(salesData)

      // Stock report from products
      const stockData = products.map(p => ({
        name: p.name,
        currentStock: p.stock,
        maxStock: p.maxStock,
        turnoverRate: p.popularity / 100,
        status: p.stock < 50 ? 'Low' : p.stock > 150 ? 'High' : 'Normal'
      }))
      setStockData(stockData)

      // Warehouse report
      const warehouseData = warehouses.map(w => ({
        name: w.name,
        location: 'Unknown',
        totalStock: 1000,
        capacity: 10000,
        utilization: '10.0'
      }))
      setWarehouseData(warehouseData)

      // Forecast data (simulated)
      const forecastData = products.slice(0, 4).map(p => ({
        name: p.name,
        forecast: 100,
        confidence: '85',
        seasonality: 'Normal'
      }))
      setForecastData(forecastData)
    } catch (error) {
      console.error('Failed to load reports from backend:', error)
      // Fallback to mock data
      const mockSalesData = [
        { name: 'Laptop', category: 'Electronics', sales: 450, revenue: 449995, growth: '12.5' },
        { name: 'Mouse', category: 'Electronics', sales: 1200, revenue: 35988, growth: '8.2' },
        { name: 'Keyboard', category: 'Electronics', sales: 890, revenue: 71191, growth: '5.1' },
        { name: 'T-Shirt', category: 'Clothing', sales: 2500, revenue: 49975, growth: '15.3' },
        { name: 'Sneakers', category: 'Footwear', sales: 680, revenue: 88392, growth: '9.7' },
      ]
      setSalesData(mockSalesData)
      setStockData([
        { name: 'Laptop', currentStock: 50, maxStock: 100, turnoverRate: 0.8, status: 'Low' },
        { name: 'Mouse', currentStock: 200, maxStock: 300, turnoverRate: 0.9, status: 'Normal' },
        { name: 'Keyboard', currentStock: 150, maxStock: 200, turnoverRate: 0.85, status: 'Normal' },
        { name: 'T-Shirt', currentStock: 300, maxStock: 500, turnoverRate: 0.95, status: 'Normal' },
        { name: 'Sneakers', currentStock: 150, maxStock: 200, turnoverRate: 0.88, status: 'Normal' },
      ])
      setWarehouseData([
        { name: 'Main Warehouse', location: 'Central Hub', totalStock: 5230, capacity: 10000, utilization: '52.3' },
        { name: 'East Coast Hub', location: 'New York', totalStock: 3890, capacity: 8000, utilization: '48.6' },
        { name: 'West Coast Hub', location: 'California', totalStock: 3330, capacity: 7500, utilization: '44.4' },
      ])
      setForecastData([
        { name: 'Laptop', forecast: 95, confidence: '87', seasonality: 'Normal' },
        { name: 'Mouse', forecast: 180, confidence: '92', seasonality: 'Normal' },
        { name: 'T-Shirt', forecast: 320, confidence: '85', seasonality: 'High' },
        { name: 'Sneakers', forecast: 165, confidence: '88', seasonality: 'Normal' },
      ])
    }
  }

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0)
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0)
  const avgGrowth = (salesData.reduce((sum, item) => sum + parseFloat(item.growth), 0) / salesData.length).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
            <p className="text-sm text-gray-500">Comprehensive inventory and sales insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{selectedPeriod} period</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-info" />
            <span className="text-xs text-gray-600">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">units sold</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-success" />
            <span className="text-xs text-gray-600">Avg Growth</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgGrowth}%</p>
          <p className="text-xs text-gray-500 mt-1">period over period</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-gray-600">Low Stock Items</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stockData.filter(s => s.status === 'Low').length}</p>
          <p className="text-xs text-gray-500 mt-1">need attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Sales Report</h3>
            </div>
            <div className="chip chip-gray text-xs">By Product</div>
          </div>
          <div className="space-y-3">
            {salesData.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${item.revenue.toLocaleString()}</p>
                    <p className={`text-sm ${parseFloat(item.growth) >= 0 ? 'text-success' : 'text-error'}`}>
                      {parseFloat(item.growth) >= 0 ? '+' : ''}{item.growth}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{item.sales} units sold</span>
                  <span>Rank #{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Report */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Stock Report</h3>
            </div>
            <div className="chip chip-gray text-xs">By Product</div>
          </div>
          <div className="space-y-3">
            {stockData.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className={`chip text-xs ${
                    item.status === 'Low' ? 'chip-primary' : 
                    item.status === 'High' ? 'chip-gray' : 'chip-success'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Level</span>
                    <span className="font-medium">{item.currentStock} / {item.maxStock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'Low' ? 'bg-warning' : 
                        item.status === 'High' ? 'bg-info' : 'bg-success'
                      }`}
                      style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Turnover Rate</span>
                    <span className="font-medium">{item.turnoverRate.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Report */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Warehouse className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Warehouse Report</h3>
            </div>
            <div className="chip chip-gray text-xs">By Location</div>
          </div>
          <div className="space-y-3">
            {warehouseData.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                  <span className={`chip text-xs ${
                    parseFloat(item.utilization) > 80 ? 'chip-primary' : 'chip-gray'
                  }`}>
                    {item.utilization}% Used
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Stock</span>
                    <span className="font-medium">{item.totalStock.toLocaleString()} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${item.utilization}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Capacity</span>
                    <span className="font-medium">{item.capacity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Report */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Demand Forecast</h3>
            </div>
            <div className="chip chip-primary text-xs">AI-Powered</div>
          </div>
          <div className="space-y-3">
            {forecastData.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className={`chip text-xs ${
                    parseFloat(item.confidence) > 80 ? 'chip-success' : 
                    parseFloat(item.confidence) > 60 ? 'chip-gray' : 'chip-primary'
                  }`}>
                    {item.confidence}% Confidence
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Forecasted Demand</span>
                  <span className="font-medium">{item.forecast} units</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Seasonality</span>
                  <span className="font-medium">{item.seasonality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalytics
