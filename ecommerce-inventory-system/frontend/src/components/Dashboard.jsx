import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Warehouse,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  RefreshCw,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [restockOrders, setRestockOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products for stats
      const productsResponse = await fetch(
        "http://localhost:8080/api/products",
      );
      const products = await productsResponse.json();

      const statsData = [
        {
          label: "Total Products",
          value: products.length,
          change: "+12%",
          trend: "up",
          icon: Package,
          color: "bg-primary/10 text-primary",
          gradient: "from-primary/5 to-primary/10",
        },
        {
          label: "Total Stock",
          value: products.reduce((sum, p) => sum + p.stock, 0).toLocaleString(),
          change: "+8%",
          trend: "up",
          icon: Warehouse,
          color: "bg-info/10 text-info",
          gradient: "from-info/5 to-info/10",
        },
        {
          label: "Low Stock Alerts",
          value: products.filter((p) => p.stock < 50).length,
          change: "-3",
          trend: "down",
          icon: AlertTriangle,
          color: "bg-warning/10 text-warning",
          gradient: "from-warning/5 to-warning/10",
        },
        {
          label: "Active Carts",
          value: 0,
          change: "+15%",
          trend: "up",
          icon: ShoppingCart,
          color: "bg-success/10 text-success",
          gradient: "from-success/5 to-success/10",
        },
      ];
      setStats(statsData);

      // Load restock orders (Greedy algorithm)
      const restockResponse = await fetch(
        "http://localhost:8080/api/restock?budget=5000&capacity=1000",
      );
      const restockData = await restockResponse.json();
      setRestockOrders(restockData.slice(0, 3));

      // Load alerts
      const alertsResponse = await fetch("http://localhost:8080/api/alerts");
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData.slice(0, 3));

      // Mock forecast data (endpoint exists but need product-specific calls)
      const forecastData = products.slice(0, 4).map((p) => ({
        product: p.name,
        category: p.category,
        forecast: 100,
        current: p.stock,
        status: p.stock < 50 ? "Low Stock" : "Good",
        progress: Math.round((p.stock / 100) * 100),
      }));
      setForecasts(forecastData);
    } catch (error) {
      console.error("Failed to load dashboard data from backend:", error);
      // Fallback to mock data
      const statsData = [
        {
          label: "Total Products",
          value: 10,
          change: "+12%",
          trend: "up",
          icon: Package,
          color: "bg-primary/10 text-primary",
          gradient: "from-primary/5 to-primary/10",
        },
        {
          label: "Total Stock",
          value: "1,245",
          change: "+8%",
          trend: "up",
          icon: Warehouse,
          color: "bg-info/10 text-info",
          gradient: "from-info/5 to-info/10",
        },
        {
          label: "Low Stock Alerts",
          value: 3,
          change: "-3",
          trend: "down",
          icon: AlertTriangle,
          color: "bg-warning/10 text-warning",
          gradient: "from-warning/5 to-warning/10",
        },
        {
          label: "Active Carts",
          value: 0,
          change: "+15%",
          trend: "up",
          icon: ShoppingCart,
          color: "bg-success/10 text-success",
          gradient: "from-success/5 to-success/10",
        },
      ];
      setStats(statsData);
      setForecasts([
        {
          product: "Laptop",
          category: "Electronics",
          forecast: 95,
          current: 50,
          status: "Low Stock",
          progress: 53,
        },
        {
          product: "Mouse",
          category: "Electronics",
          forecast: 180,
          current: 200,
          status: "Good",
          progress: 111,
        },
        {
          product: "T-Shirt",
          category: "Clothing",
          forecast: 320,
          current: 300,
          status: "Low Stock",
          progress: 94,
        },
        {
          product: "Sneakers",
          category: "Footwear",
          forecast: 165,
          current: 150,
          status: "Low Stock",
          progress: 91,
        },
      ]);
      setRestockOrders([
        {
          productId: 1,
          productName: "Laptop",
          unitsToOrder: 50,
          totalCost: 30000,
          priority: 1.2,
        },
        {
          productId: 6,
          productName: "T-Shirt",
          unitsToOrder: 100,
          totalCost: 1200,
          priority: 0.95,
        },
        {
          productId: 9,
          productName: "Sneakers",
          unitsToOrder: 30,
          totalCost: 2100,
          priority: 0.85,
        },
      ]);
      setAlerts([
        { id: 1, name: "Laptop", stock: 50 },
        { id: 4, name: "Monitor", stock: 80 },
        { id: 10, name: "Boots", stock: 90 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-8 animate-pulse w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-8 animate-pulse w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-100 rounded-8 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-8 w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded-8 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-16">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-gray-500 ml-12">
            Real-time inventory insights and demand forecasting
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-tertiary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={stat.label}
              className={`card bg-gradient-to-br ${stat.gradient} border border-border hover:shadow-3 transition-all duration-300 group animate-slideUp`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-16 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-1`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Forecasting */}
        <div className="card animate-slideUp" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Demand Forecasting</h2>
            </div>
            <div className="chip chip-gray text-xs">
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI-Powered
            </div>
          </div>
          <div className="space-y-4">
            {forecasts.map((item, index) => (
              <div
                key={item.product}
                className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-12 border border-border hover:shadow-1 transition-all animate-slideUp"
                style={{ animationDelay: `${450 + index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.product}
                    </p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <span
                    className={`chip ${
                      item.status === "Low Stock" ? "chip-primary" : "chip-gray"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Level</span>
                    <span className="font-medium">
                      {item.current} / {item.forecast}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                        item.progress < 70 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restock Orders */}
        <div className="card animate-slideUp" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Restock Orders</h2>
            </div>
            <div className="chip chip-primary text-xs">
              <Activity className="w-3 h-3 inline mr-1" />
              Greedy Algorithm
            </div>
          </div>
          <div className="space-y-4">
            {restockOrders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No restock orders needed</p>
                <p className="text-sm text-gray-400 mt-1">All stock levels are healthy</p>
              </div>
            ) : (
              restockOrders.map((order, index) => (
                <div
                  key={order.productId}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-12 border border-border hover:shadow-1 transition-all animate-slideUp"
                  style={{ animationDelay: `${550 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {order.unitsToOrder} units
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="chip chip-primary text-xs">
                        Priority: {order.priority.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{order.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-8">
                    <Activity className="w-4 h-4" />
                    <span>
                      Turnover: {order.turnoverRate} | Storage: ₹
                      {order.storageCost}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="card bg-gradient-to-r from-warning/5 to-orange-50 border-warning/20 animate-slideUp" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-warning/10 rounded-8">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
            <span className="chip chip-primary text-xs">{alerts.length} items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="p-4 bg-white rounded-12 border border-border hover:shadow-1 transition-all animate-slideUp"
                style={{ animationDelay: `${650 + index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{alert.name}</p>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <p className="text-sm text-gray-500">Stock: {alert.stock} units</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-warning transition-all duration-500"
                      style={{ width: `${Math.min(alert.stock, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
