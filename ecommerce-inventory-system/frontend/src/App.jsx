import { useState } from 'react'
import { Package, Warehouse, ShoppingCart, Users, BarChart3, TrendingUp, AlertTriangle, Menu, X, Bell, Settings, LogOut } from 'lucide-react'
import ProductCatalog from './components/ProductCatalog'
import InventoryManagement from './components/InventoryManagement'
import CartManagement from './components/CartManagement'
import Dashboard from './components/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview & Analytics' },
    { id: 'products', label: 'Products', icon: Package, description: 'Product Catalog' },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, description: 'Warehouse Management' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, description: 'Cart & Checkout' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white shadow-2 border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-8 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-16 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 hidden sm:block">E-Commerce Inventory</h1>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Demand Forecasting & Supply Chain</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-8 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-8 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-8 transition-colors text-error">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-border sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-8 flex items-center gap-2 transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-1'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2 animate-slideUp">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full px-4 py-3 rounded-8 flex items-center gap-3 transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-xs opacity-75">{tab.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-73px-60px)]">
        <div className="animate-fadeIn">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'products' && <ProductCatalog />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'cart' && <CartManagement />}
        </div>
      </main>
    </div>
  )
}

export default App
