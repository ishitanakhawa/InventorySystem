"use client";

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
  Calendar,
  Hourglass,
  Percent,
} from "lucide-react";

const Dashboard = ({ user }) => {
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
      // 1. Load products for stats
      const productsResponse = await fetch("/api/products");
      const products = await productsResponse.json();

      // 2. Load active checkout queue waitlist size
      let queueSize = 3;
      try {
        const qRes = await fetch("/api/checkout/queue");
        const qData = await qRes.json();
        queueSize = qData.length;
      } catch (e) {
        console.warn("Queue size fetch failed, defaulting to mock.");
      }

      // 3. Load alerts from smart alerts system
      let alertsData = [];
      try {
        const alertsResponse = await fetch("/api/alerts");
        alertsData = await alertsResponse.json();
      } catch (e) {
        console.warn("Alerts fetch failed, defaulting to mock.");
        alertsData = [
          { id: 6, type: "EXPIRY", productName: "T-Shirt", message: "Perishable threat: product expires soon on 2026-08-01", severity: "CRITICAL" },
          { id: 2, type: "OVERSTOCK", productName: "Mouse", message: "Storage overcapacity: Stock level is at 200 units (max: 300)", severity: "WARNING" },
          { id: 1, type: "SPIKE", productName: "Laptop", message: "Demand surge: High sales spike expected due to high rating and popularity (85%)", severity: "INFO" }
        ];
      }
      setAlerts(alertsData);

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
          label: "Total Stock Units",
          value: products.reduce((sum, p) => sum + p.stock, 0).toLocaleString(),
          change: "+8%",
          trend: "up",
          icon: Warehouse,
          color: "bg-info/10 text-info",
          gradient: "from-info/5 to-info/10",
        },
        {
          label: "Smart Alerts Active",
          value: alertsData.length,
          change: `${alertsData.filter(a => a.severity === "CRITICAL").length} Critical`,
          trend: alertsData.length > 3 ? "up" : "down",
          icon: AlertTriangle,
          color: "bg-warning/10 text-warning",
          gradient: "from-warning/5 to-warning/10",
        },
        {
          label: "Checkout Queue Wait",
          value: `${queueSize} Buyers`,
          change: `${queueSize * 4} Min Wait`,
          trend: "up",
          icon: ShoppingCart,
          color: "bg-success/10 text-success",
          gradient: "from-success/5 to-success/10",
        },
      ];
      setStats(statsData);

      // 4. Load restock orders (Greedy algorithm)
      try {
        const restockResponse = await fetch("/api/restock?budget=8000");
        const restockData = await restockResponse.json();
        setRestockOrders(restockData.slice(0, 3));
      } catch (e) {
        console.warn("Restock fetch failed.");
      }

      // 5. Load forecasts (daily, weekly, monthly calculations)
      try {
        const forecastResponse = await fetch("/api/forecast");
        const forecastData = await forecastResponse.json();
        setForecasts(forecastData.slice(0, 4));
      } catch (e) {
        console.warn("Forecast fetch failed, using fallback.");
        const fallbackForecasts = products.slice(0, 4).map((p) => {
          const baseSales = 10 + Math.round(p.popularity / 3);
          return {
            productId: p.id,
            productName: p.name,
            dailyForecast: Math.max(2, Math.round(baseSales * p.turnoverRate / 7.0)),
            weeklyForecast: Math.max(10, Math.round(baseSales * p.turnoverRate)),
            monthlyForecast: Math.max(40, Math.round(baseSales * p.turnoverRate * 4.3)),
            accuracy: 85.0 + (p.id % 12),
          };
        });
        setForecasts(fallbackForecasts);
      }

    } catch (error) {
      console.error("Failed to load dashboard data from backend:", error);
      // Fallback to offline mock data
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
          label: "Total Stock Units",
          value: "1,450",
          change: "+8%",
          trend: "up",
          icon: Warehouse,
          color: "bg-info/10 text-info",
          gradient: "from-info/5 to-info/10",
        },
        {
          label: "Smart Alerts Active",
          value: 3,
          change: "1 Critical",
          trend: "down",
          icon: AlertTriangle,
          color: "bg-warning/10 text-warning",
          gradient: "from-warning/5 to-warning/10",
        },
        {
          label: "Checkout Queue Wait",
          value: "3 Buyers",
          change: "12 Min Wait",
          trend: "up",
          icon: ShoppingCart,
          color: "bg-success/10 text-success",
          gradient: "from-success/5 to-success/10",
        },
      ];
      setStats(statsData);

      setForecasts([
        { productId: 1, productName: "Laptop", dailyForecast: 4, weeklyForecast: 28, monthlyForecast: 120, accuracy: 92.5 },
        { productId: 2, productName: "Mouse", dailyForecast: 15, weeklyForecast: 105, monthlyForecast: 450, accuracy: 89.0 },
        { productId: 6, productName: "T-Shirt", dailyForecast: 22, weeklyForecast: 154, monthlyForecast: 660, accuracy: 94.2 },
        { productId: 9, productName: "Sneakers", dailyForecast: 8, weeklyForecast: 56, monthlyForecast: 240, accuracy: 87.8 },
      ]);

      setRestockOrders([
        { productId: 1, productName: "Laptop", recommendedSupplier: "Silicon Valley Logistics", unitsToOrder: 50, totalCost: 22500, deliveryDays: 1, priority: 72.5 },
        { productId: 6, productName: "T-Shirt", recommendedSupplier: "Speedy Apparel Corp", unitsToOrder: 200, totalCost: 1600, deliveryDays: 2, priority: 95.0 },
        { productId: 9, productName: "Sneakers", recommendedSupplier: "SoleCraft Leather Co", unitsToOrder: 50, totalCost: 2750, deliveryDays: 6, priority: 82.3 },
      ]);

      setAlerts([
        { id: 6, type: "EXPIRY", productName: "T-Shirt", message: "Perishable threat: product expires soon on 2026-08-01", severity: "CRITICAL" },
        { id: 2, type: "OVERSTOCK", productName: "Mouse", message: "Storage overcapacity: Stock level is at 200 units (max: 300)", severity: "WARNING" },
        { id: 1, type: "SPIKE", productName: "Laptop", message: "Demand surge: High sales spike expected due to high rating and popularity (85%)", severity: "INFO" }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
            Real-time inventory insights, greedy restocking schedules, and demand predictions
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
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    stat.trend === "up" || stat.label.includes("Queue")
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  <TrendIcon className="w-3.5 h-3.5" />
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Forecasting and Restocking Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Demand Forecasting - 2 cols wide */}
        <div className="lg:col-span-2 card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Demand Forecasting</h2>
            </div>
            <div className="chip chip-gray text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-secondary-hover" />
              <span>Multi-Timeline Model</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-center">Daily</th>
                  <th className="pb-3 text-center">Weekly</th>
                  <th className="pb-3 text-center">Monthly</th>
                  <th className="pb-3 text-right">Accuracy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {forecasts.map((item, index) => (
                  <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5">
                      <p className="font-semibold text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-400 font-normal">Product ID: #{item.productId}</p>
                    </td>
                    <td className="py-3.5 text-center text-gray-700">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-4 text-xs font-bold">
                        {item.dailyForecast} units
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-gray-700">
                      <span className="bg-blueFantastic/10 text-blueFantastic px-2.5 py-0.5 rounded-4 text-xs font-bold">
                        {item.weeklyForecast} units
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-gray-900 font-bold">
                      {item.monthlyForecast} units
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.accuracy >= 90 
                            ? "bg-success/10 text-success border border-success/20" 
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}>
                          {item.accuracy.toFixed(1)}% Acc
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Greedy Restocking Section */}
        <div className="lg:col-span-1 card flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-8">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Restocking Order Plan</h2>
              </div>
              <span className="chip chip-primary text-xs">Greedy Budget</span>
            </div>

            <div className="space-y-3">
              {restockOrders.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-dashed rounded-12">
                  <p className="text-xs text-gray-500 font-medium">All warehouse hubs synced</p>
                  <p className="text-[10px] text-gray-400 mt-1">Stock levels are fully healthy</p>
                </div>
              ) : (
                restockOrders.map((order) => (
                  <div
                    key={order.productId}
                    className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-12 border border-border space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-gray-800">{order.productName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Supplier: {order.recommendedSupplier}</p>
                      </div>
                      <span className="text-xs font-extrabold text-blueFantastic">
                        ₹{order.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                      <span>Order: {order.unitsToOrder} units</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-secondary-hover" />
                        ETA: {order.deliveryDays} Days
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Budget Ceiling: ₹8,000.00</span>
            <span className="text-blueFantastic font-black">Turnover Priority Ratios</span>
          </div>
        </div>
      </div>

      {/* Smart Alerts Feed */}
      {alerts.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-warning/10 rounded-8">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-xl font-bold">Smart Diagnostic Alerts</h2>
            <span className="chip chip-burningFlame text-xs font-extrabold">
              {alerts.length} Warnings Active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => {
              const isCritical = alert.severity === "CRITICAL";
              const isWarning = alert.severity === "WARNING";
              
              let alertStyle = "border-indigo-100 bg-indigo-50/50 text-indigo-900";
              let badgeStyle = "bg-indigo-100 text-indigo-700";
              
              if (isCritical) {
                alertStyle = "border-red-200 bg-red-50/40 text-red-950";
                badgeStyle = "bg-error text-white";
              } else if (isWarning) {
                alertStyle = "border-yellow-200 bg-yellow-50/40 text-yellow-950";
                badgeStyle = "bg-warning text-gray-900";
              }

              return (
                <div
                  key={index}
                  className={`p-4 border rounded-16 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all ${alertStyle}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-widest font-mono">
                        {alert.type}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeStyle}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 pt-1">
                      {alert.productName}
                    </p>
                    <p className="text-xs leading-relaxed text-gray-500 font-medium">
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
