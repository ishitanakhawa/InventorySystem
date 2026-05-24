import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import {
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import ProductCatalog from "./components/ProductCatalog";
import InventoryManagement from "./components/InventoryManagement";
import CartManagement from "./components/CartManagement";
import Dashboard from "./components/Dashboard";
import CustomerModule from "./components/CustomerModule";
import AuthModule from "./components/AuthModule";
import DynamicPricing from "./components/DynamicPricing";

function App() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    {
      path: "/",
      label: "Dashboard",
      icon: BarChart3,
      description: "Overview & Analytics",
    },
    {
      path: "/products",
      label: "Products",
      icon: Package,
      description: "Product Catalog",
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: Warehouse,
      description: "Warehouse Management",
    },
    {
      path: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      description: "Cart & Checkout",
    },
    {
      path: "/customers",
      label: "Customers",
      icon: Users,
      description: "Loyalty & Purchases",
    },
    {
      path: "/pricing",
      label: "Pricing",
      icon: Zap,
      description: "Dynamic Pricing",
    },
  ];

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blueFantastic rounded-16 flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-palladian" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-abyssal leading-none">
                E-Commerce Inventory
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Role-Based Control System
              </p>
            </div>
          </div>
          <AuthModule
            user={user}
            onLogin={(u) => setUser(u)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <header className="bg-palladian shadow-2 border-b border-oatmeal sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 hover:bg-oatmeal/50 rounded-8 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6 text-abyssal" />
                  ) : (
                    <Menu className="w-6 h-6 text-abyssal" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blueFantastic rounded-16 flex items-center justify-center">
                      <Package className="w-6 h-6 text-palladian" />
                    </div>
                    <h1 className="text-xl font-bold text-abyssal hidden sm:block">
                      E-Commerce Inventory
                    </h1>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">
                    Dynamic Pricing & Inventory
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-oatmeal/50 rounded-8 transition-colors relative">
                  <Bell className="w-5 h-5 text-blueFantastic" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                </button>
                <button className="p-2 hover:bg-oatmeal/50 rounded-8 transition-colors">
                  <Settings className="w-5 h-5 text-blueFantastic" />
                </button>

                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-oatmeal">
                  <div className="w-8 h-8 bg-blueFantastic/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blueFantastic" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-abyssal">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {user.role} Account
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-error/10 hover:text-error rounded-8 transition-colors text-gray-600"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-palladian border-b border-oatmeal sticky top-[73px] z-40">
          <div className="max-w-7xl mx-auto px-6">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1 py-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.path === "/"}
                    className={({ isActive }) =>
                      `px-5 py-3 rounded-8 flex items-center gap-2 transition-all font-medium whitespace-nowrap ${
                        isActive
                          ? "bg-blueFantastic text-palladian shadow-1"
                          : "text-gray-600 hover:bg-oatmeal/50 hover:text-abyssal"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-4 space-y-2 animate-slideUp">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <NavLink
                      key={tab.path}
                      to={tab.path}
                      end={tab.path === "/"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `w-full px-4 py-3 rounded-8 flex items-center gap-3 transition-all ${
                          isActive
                            ? "bg-blueFantastic text-palladian font-medium"
                            : "text-gray-600 hover:bg-oatmeal/50"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">{tab.label}</p>
                        <p className="text-xs opacity-75">{tab.description}</p>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-73px-60px)]">
          <div className="animate-fadeIn">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route
                path="/products"
                element={<ProductCatalog user={user} />}
              />
              <Route
                path="/inventory"
                element={<InventoryManagement user={user} />}
              />
              <Route path="/cart" element={<CartManagement user={user} />} />
              <Route
                path="/customers"
                element={<CustomerModule user={user} />}
              />
              <Route path="/pricing" element={<DynamicPricing user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
