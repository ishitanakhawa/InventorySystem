import { Package, TrendingUp, AlertTriangle, Warehouse, ShoppingCart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    { label: 'Total Products', value: '156', change: '+12%', trend: 'up', icon: Package, color: 'bg-primary/10 text-primary' },
    { label: 'Total Stock', value: '12,450', change: '+8%', trend: 'up', icon: Warehouse, color: 'bg-info/10 text-info' },
    { label: 'Low Stock Alerts', value: '8', change: '-3', trend: 'down', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
    { label: 'Active Carts', value: '23', change: '+15%', trend: 'up', icon: ShoppingCart, color: 'bg-success/10 text-success' },
  ]

  const forecasts = [
    { product: 'Laptop', category: 'Electronics', forecast: 95, current: 50, status: 'Low Stock', progress: 53 },
    { product: 'Mouse', category: 'Electronics', forecast: 180, current: 200, status: 'Good', progress: 111 },
    { product: 'T-Shirt', category: 'Clothing', forecast: 320, current: 300, status: 'Low Stock', progress: 94 },
    { product: 'Sneakers', category: 'Footwear', forecast: 165, current: 150, status: 'Low Stock', progress: 91 },
  ]

  const restockOrders = [
    { product: 'Laptop', quantity: 50, priority: 'High', urgency: 'Urgent' },
    { product: 'T-Shirt', quantity: 100, priority: 'Medium', urgency: 'Normal' },
    { product: 'Sneakers', quantity: 30, priority: 'High', urgency: 'Urgent' },
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
          </div>
          <div className="space-y-4">
            {restockOrders.map((order) => (
              <div key={order.product} className="p-4 bg-gray-50 rounded-8 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{order.product}</p>
                    <p className="text-sm text-gray-500">Quantity: {order.quantity} units</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`chip ${order.priority === 'High' ? 'chip-primary' : 'chip-gray'}`}>
                      {order.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500">{order.urgency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Auto-generated based on turnover rate × storage cost</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
