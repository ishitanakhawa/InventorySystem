import { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, Warehouse, ShoppingCart, ArrowUpRight, ArrowDownRight, Activity, Sparkles } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState([])
  const [forecasts, setForecasts] = useState([])
  const [restockOrders, setRestockOrders] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load products for stats
      const productsResponse = await fetch('http://localhost:8080/api/products')
      const products = await productsResponse.json()
      
      const statsData = [
        { label: 'Total Products', value: products.length, change: '+12%', trend: 'up', icon: Package, color: 'bg-primary/10 text-primary' },
        { label: 'Total Stock', value: products.reduce((sum, p) => sum + p.stock, 0).toLocaleString(), change: '+8%', trend: 'up', icon: Warehouse, color: 'bg-info/10 text-info' },
        { label: 'Low Stock Alerts', value: products.filter(p => p.stock < 50).length, change: '-3', trend: 'down', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
        { label: 'Active Carts', value: 0, change: '+15%', trend: 'up', icon: ShoppingCart, color: 'bg-success/10 text-success' },
      ]
      setStats(statsData)

      // Load restock orders (Greedy algorithm)
      const restockResponse = await fetch('http://localhost:8080/api/restock?budget=5000&capacity=1000')
      const restockData = await restockResponse.json()
      setRestockOrders(restockData.slice(0, 3))

      // Load alerts
      const alertsResponse = await fetch('http://localhost:8080/api/alerts')
      const alertsData = await alertsResponse.json()
      setAlerts(alertsData.slice(0, 3))

      // Mock forecast data (endpoint exists but need product-specific calls)
      const forecastData = products.slice(0, 4).map(p => ({
        product: p.name,
        category: p.category,
        forecast: 100,
        current: p.stock,
        status: p.stock < 50 ? 'Low Stock' : 'Good',
        progress: Math.round((p.stock / 100) * 100)
      }))
      setForecasts(forecastData)
    } catch (error) {
      console.error('Failed to load dashboard data from backend:', error)
      // Fallback to mock data
      const statsData = [
        { label: 'Total Products', value: 10, change: '+12%', trend: 'up', icon: Package, color: 'bg-primary/10 text-primary' },
        { label: 'Total Stock', value: '1,245', change: '+8%', trend: 'up', icon: Warehouse, color: 'bg-info/10 text-info' },
        { label: 'Low Stock Alerts', value: 3, change: '-3', trend: 'down', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
        { label: 'Active Carts', value: 0, change: '+15%', trend: 'up', icon: ShoppingCart, color: 'bg-success/10 text-success' },
      ]
      setStats(statsData)
      setForecasts([
        { product: 'Laptop', category: 'Electronics', forecast: 95, current: 50, status: 'Low Stock', progress: 53 },
        { product: 'Mouse', category: 'Electronics', forecast: 180, current: 200, status: 'Good', progress: 111 },
        { product: 'T-Shirt', category: 'Clothing', forecast: 320, current: 300, status: 'Low Stock', progress: 94 },
        { product: 'Sneakers', category: 'Footwear', forecast: 165, current: 150, status: 'Low Stock', progress: 91 },
      ])
      setRestockOrders([
        { productId: 1, productName: 'Laptop', unitsToOrder: 50, totalCost: 30000, priority: 1.2 },
        { productId: 6, productName: 'T-Shirt', unitsToOrder: 100, totalCost: 1200, priority: 0.95 },
        { productId: 9, productName: 'Sneakers', unitsToOrder: 30, totalCost: 2100, priority: 0.85 },
      ])
      setAlerts([
        { id: 1, name: 'Laptop', stock: 50 },
        { id: 4, name: 'Monitor', stock: 80 },
        { id: 10, name: 'Boots', stock: 90 },
      ])
    }
  }

  const dataStructures = [
    { name: 'BST', description: 'Product Catalog (O(log n) lookup)', icon: '🌳' },
    { name: 'Linked List', description: 'Warehouse Inventory', icon: '🔗' },
    { name: 'Graph', description: 'Warehouse Network', icon: '🕸️' },
    { name: 'Stack', description: 'Cart Undo/Redo', icon: '📚' },
    { name: 'Priority Queue', description: 'Checkout (Loyalty Priority)', icon: '🚦' },
    { name: 'Greedy Algorithm', description: 'Restocking Optimization', icon: '⚡' },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Real-time inventory insights and demand forecasting</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <div key={stat.label} className="card hover:shadow-3 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-16 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Forecasting */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Demand Forecasting</h2>
            </div>
            <div className="chip chip-gray text-xs">AI-Powered</div>
          </div>
          <div className="space-y-4">
            {forecasts.map((item) => (
              <div key={item.product} className="p-4 bg-gray-50 rounded-8 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <span className={`chip ${item.status === 'Low Stock' ? 'chip-primary' : 'chip-gray'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Level</span>
                    <span className="font-medium">{item.current} / {item.forecast}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.progress < 70 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restock Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Restock Orders</h2>
            </div>
            <div className="chip chip-primary text-xs">Greedy Algorithm</div>
          </div>
          <div className="space-y-4">
            {restockOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No restock orders needed</div>
            ) : (
              restockOrders.map((order) => (
                <div key={order.productId} className="p-4 bg-gray-50 rounded-8 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{order.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {order.unitsToOrder} units</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="chip chip-primary text-xs">
                        Priority: {order.priority.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">${order.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    <span>Turnover: {order.turnoverRate} | Storage: ${order.storageCost}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 rounded-8">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Data Structures & Algorithms</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dataStructures.map((ds) => (
            <div key={ds.name} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-16 border border-border hover:shadow-2 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl group-hover:scale-125 transition-transform">{ds.icon}</span>
                <p className="font-semibold text-gray-900">{ds.name}</p>
              </div>
              <p className="text-sm text-gray-500">{ds.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-primary text-white rounded-16 hover:bg-primary-hover transition-colors flex items-center gap-3">
            <Package className="w-5 h-5" />
            <span className="font-medium">Add New Product</span>
          </button>
          <button className="p-4 bg-blueFantastic text-palladian rounded-16 hover:bg-abyssal transition-colors flex items-center gap-3">
            <Warehouse className="w-5 h-5" />
            <span className="font-medium">Manage Inventory</span>
          </button>
        </div>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="card bg-gradient-to-r from-warning/5 to-orange-50 border-warning/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="font-semibold">Smart Alerts</span>
          </div>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-8 border border-border">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{alert.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{alert.stock} units</span>
                  <span className="chip chip-primary text-xs">Low Stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
