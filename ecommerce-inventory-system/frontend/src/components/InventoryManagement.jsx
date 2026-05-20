import { useState } from 'react'
import { Warehouse, Link2, AlertTriangle, CheckCircle, MapPin, Package, ArrowRight, TrendingUp } from 'lucide-react'

const InventoryManagement = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(1)

  const warehouses = [
    { id: 1, name: 'Main Warehouse', location: 'Central Hub', totalStock: 5230, capacity: 10000, status: 'Active' },
    { id: 2, name: 'East Coast Hub', location: 'New York', totalStock: 3890, capacity: 8000, status: 'Active' },
    { id: 3, name: 'West Coast Hub', location: 'California', totalStock: 3330, capacity: 7500, status: 'Active' },
  ]

  const connections = [
    { from: 1, to: 2, distance: '250 miles', transferTime: '4 hours' },
    { from: 1, to: 3, distance: '2800 miles', transferTime: '2 days' },
    { from: 2, to: 3, distance: '2900 miles', transferTime: '2 days' },
  ]

  const inventoryData = [
    { productId: 1, name: 'Laptop', quantity: 25, category: 'Electronics', status: 'Low Stock' },
    { productId: 2, name: 'Mouse', quantity: 80, category: 'Electronics', status: 'Good' },
    { productId: 3, name: 'Keyboard', quantity: 60, category: 'Electronics', status: 'Good' },
    { productId: 6, name: 'T-Shirt', quantity: 120, category: 'Clothing', status: 'Good' },
    { productId: 9, name: 'Sneakers', quantity: 50, category: 'Footwear', status: 'Low Stock' },
  ]

  const selectedWarehouseData = warehouses.find(w => w.id === selectedWarehouse)
  const capacityPercentage = (selectedWarehouseData?.totalStock / selectedWarehouseData?.capacity) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <Warehouse className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Inventory Management</h2>
            <p className="text-sm text-gray-500">Monitor and manage warehouse inventory</p>
          </div>
        </div>
        
      </div>

      {/* Warehouse Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Select Warehouse</h3>
          <span className="text-sm text-gray-500">{warehouses.length} warehouses available</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <button
              key={warehouse.id}
              onClick={() => setSelectedWarehouse(warehouse.id)}
              className={`p-5 rounded-16 border-2 transition-all duration-300 group ${
                selectedWarehouse === warehouse.id
                  ? 'border-primary bg-primary/5 shadow-2'
                  : 'border-border hover:border-gray-300 hover:shadow-1'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Warehouse className={`w-5 h-5 ${selectedWarehouse === warehouse.id ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="font-semibold">{warehouse.name}</span>
                </div>
                <span className={`chip text-xs ${warehouse.status === 'Active' ? 'chip-primary' : 'chip-gray'}`}>
                  {warehouse.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {warehouse.location}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Stock</span>
                  <span className="font-medium">{warehouse.totalStock.toLocaleString()} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${(warehouse.totalStock / warehouse.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {Math.round((warehouse.totalStock / warehouse.capacity) * 100)}% capacity
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Warehouse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-600">Total Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{selectedWarehouseData?.totalStock.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">units in warehouse</p>
        </div>
        <div className="card bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="flex items-center gap-3 mb-2">
            <Warehouse className="w-5 h-5 text-info" />
            <span className="text-sm text-gray-600">Capacity</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{selectedWarehouseData?.capacity.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">maximum capacity</p>
        </div>
        <div className="card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm text-gray-600">Low Stock Items</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-500 mt-1">need attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Inventory (Linked List) */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Warehouse Inventory</h3>
            </div>
           
          </div>
          <div className="space-y-3">
            {inventoryData.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-1">
                    {index + 1}
                  </div>
                  {index < inventoryData.length - 1 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 p-4 bg-gradient-to-r from-gray-50 to-white rounded-12 border border-border hover:shadow-1 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <span className="chip chip-gray text-xs">{item.category}</span>
                      </div>
                      <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-gray-900">{item.quantity}</p>
                      <p className="text-sm text-gray-500">units</p>
                      <span className={`chip text-xs mt-1 ${item.status === 'Low Stock' ? 'chip-primary' : 'chip-gray'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Network (Graph) */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Warehouse Network</h3>
            </div>
           
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-12">
              <p className="text-sm text-gray-600 mb-3 font-medium">Connected Warehouses:</p>
              <div className="space-y-3">
                {connections
                  .filter(c => c.from === selectedWarehouse || c.to === selectedWarehouse)
                  .map((conn, index) => {
                    const connectedId = conn.from === selectedWarehouse ? conn.to : conn.from
                    const connectedWarehouse = warehouses.find(w => w.id === connectedId)
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-12 border border-border hover:shadow-1 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success/10 rounded-8">
                            <CheckCircle className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{connectedWarehouse?.name}</p>
                            <p className="text-sm text-gray-500">{connectedWarehouse?.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ArrowRight className="w-4 h-4" />
                            {conn.distance}
                          </div>
                          <p className="text-xs text-gray-500">{conn.transferTime}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-warning/5 to-orange-50 rounded-12 border border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="font-semibold text-sm">Low Stock Alerts</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-8 border border-border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Laptop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">25 units</span>
                    <span className="chip chip-primary text-xs">Restock Needed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-8 border border-border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Sneakers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">50 units</span>
                    <span className="chip chip-primary text-xs">Restock Needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryManagement
