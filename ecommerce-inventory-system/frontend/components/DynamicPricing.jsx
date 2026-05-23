"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Sun,
  Percent,
  Sparkles,
  RefreshCw,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import { isReadOnly } from "@/lib/auth-context";

const PRICING_RULES = [
  {
    id: "demand",
    title: "Demand-Based Pricing",
    icon: TrendingUp,
    description: "Popularity > 80% adds 10% premium; < 60% applies 15% clearance discount.",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "seasonal",
    title: "Seasonal Price Surge",
    icon: Sun,
    description: "Peak hours (6 PM – 10 PM) apply an additional 5% surge on all products.",
    color: "from-warning/10 to-warning/5",
  },
  {
    id: "discount",
    title: "Discount System",
    icon: Percent,
    description: "Low-demand overstock items receive automatic markdown for inventory clearance.",
    color: "from-success/10 to-success/5",
  },
  {
    id: "flash",
    title: "Flash Sale Support",
    icon: Sparkles,
    description: "Product #6 (T-Shirt) runs a 40% flash sale — prices update in real time.",
    color: "from-error/10 to-error/5",
  },
];

export default function DynamicPricing({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peakHours, setPeakHours] = useState(false);
  const readOnly = isReadOnly(user);

  const loadProducts = async () => {
    try {
      const data = await api.get("/api/products");
      setProducts(data);
      const hour = new Date().getHours();
      setPeakHours(hour >= 18 && hour <= 22);
    } catch {
      setProducts([
        { id: 1, name: "Laptop", category: "Electronics", basePrice: 999.99, price: 1099.99, popularity: 85 },
        { id: 6, name: "T-Shirt", category: "Clothing", basePrice: 19.99, price: 11.99, popularity: 95 },
        { id: 8, name: "Jacket", category: "Clothing", basePrice: 89.99, price: 76.49, popularity: 50 },
      ]);
      setPeakHours(new Date().getHours() >= 18 && new Date().getHours() <= 22);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  usePolling(loadProducts, 5000);

  const getPriceChange = (p) => {
    const diff = ((p.price - p.basePrice) / p.basePrice) * 100;
    return diff;
  };

  const getBadges = (p) => {
    const badges = [];
    if (p.id === 6) badges.push({ label: "Flash Sale", class: "chip-burningFlame" });
    if (p.popularity > 80) badges.push({ label: "High Demand +10%", class: "chip-primary" });
    if (p.popularity < 60) badges.push({ label: "Clearance -15%", class: "chip-gray" });
    if (peakHours) badges.push({ label: "Peak Surge +5%", class: "chip chip-gray" });
    return badges;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-8 animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/20 rounded-16">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Dynamic Pricing Engine</h2>
            <p className="text-sm text-gray-500">
              Demand-based, seasonal surge, discounts & flash sales — auto-refreshes every 5s
            </p>
          </div>
        </div>
        <button onClick={loadProducts} className="btn-tertiary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Prices
        </button>
      </div>

      {peakHours && (
        <div className="alert alert-warning">
          <Clock className="w-5 h-5" />
          <div>
            <p className="font-medium">Seasonal Surge Active</p>
            <p className="text-sm">Peak-hour pricing (6 PM – 10 PM) is adding 5% to all products.</p>
          </div>
        </div>
      )}

      {readOnly && (
        <div className="alert alert-info">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Guest mode: view pricing rules and live prices only.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRICING_RULES.map((rule, i) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className={`card bg-gradient-to-br ${rule.color} border border-border animate-slideUp`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">{rule.title}</h3>
              </div>
              <p className="text-xs text-gray-600">{rule.description}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Live Price Table</h3>
          </div>
          <span className="chip chip-gray text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Real-time sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-gray-500">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Base Price</th>
                <th className="py-3 pr-4">Current Price</th>
                <th className="py-3 pr-4">Change</th>
                <th className="py-3">Rules Applied</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const change = getPriceChange(p);
                const isUp = change > 0;
                const isDown = change < 0;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-gray-50">
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td className="py-3 text-gray-600">{p.category}</td>
                    <td className="py-3">₹{p.basePrice?.toFixed(2)}</td>
                    <td className="py-3 font-bold text-primary">₹{p.price?.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          isUp ? "text-error" : isDown ? "text-success" : "text-gray-500"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : isDown ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : null}
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {getBadges(p).map((b) => (
                          <span key={b.label} className={`text-xs ${b.class}`}>
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
