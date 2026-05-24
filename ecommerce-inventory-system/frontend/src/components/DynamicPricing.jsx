"use client";

import {
  Percent,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Search,
  Check,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";

const pricingRules = [
  {
    label: "Demand Surge",
    description: "Increase price when demand exceeds 80% of available stock.",
    impact: "+12%",
    icon: TrendingUp,
  },
  {
    label: "Clearance",
    description:
      "Reduce price for slow-moving items after 14 days of low sales.",
    impact: "-8%",
    icon: Sparkles,
  },
  {
    label: "Volume Discount",
    description:
      "Apply discount on bulk orders to improve checkout conversions.",
    impact: "-5%",
    icon: Percent,
  },
];

const sampleProducts = [
  { id: 1, name: "Laptop", price: 45000, stock: 8, sales7d: 5 },
  { id: 2, name: "Mouse", price: 450, stock: 120, sales7d: 40 },
  { id: 6, name: "T-Shirt", price: 800, stock: 200, sales7d: 12 },
  { id: 9, name: "Sneakers", price: 5500, stock: 50, sales7d: 18 },
];

function recommendPrice(product) {
  // simple heuristic: if sales7d > stock/5 then increase, if stock high -> discount
  const demandRatio = product.sales7d / Math.max(1, product.stock);
  if (demandRatio > 0.25) return Math.round(product.price * 1.12);
  if (product.stock > 150) return Math.round(product.price * 0.9);
  return product.price;
}

// Lightweight sparkline (SVG)
function Sparkline({ data = [], color = "#2C3B4D" }) {
  if (!data || data.length === 0) return null;
  const w = 240;
  const h = 48;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Simple horizontal bar mini-chart
function BarMiniChart({ data = [], labels = [] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="space-y-2">
      {data.map((v, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs text-gray-600 w-20 truncate">{labels[i]}</div>
          <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
            <div
              style={{ width: `${(v / max) * 100}%` }}
              className="h-3 bg-primary"
            />
          </div>
          <div className="text-xs text-gray-500 w-16 text-right">
            ₹{v.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function expandSales(total) {
  // create a simple 7-day breakdown with slight variance
  const base = Math.floor(total / 7);
  const rem = total - base * 7;
  const arr = new Array(7).fill(base);
  for (let i = 0; i < rem; i++) arr[i] += 1;
  return arr.map((v, i) => v + Math.round(Math.sin(i) * 0.5));
}

export default function DynamicPricing({ user }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const products = useMemo(() => {
    const filtered = sampleProducts.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );
    return filtered.map((p) => ({ ...p, recommended: recommendPrice(p) }));
  }, [query]);

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500">
                Pricing Intelligence
              </p>
              <h1 className="text-3xl font-semibold text-abyssal">
                Dynamic Pricing Strategy
              </h1>
              <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                Optimize revenue with demand-aware pricing, automated markdowns,
                and personalized price adjustments for your product catalog.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-gray-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                {user?.role ?? "Guest"} Access
              </div>
              <button className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 card">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  className="input h-10 w-full pl-10"
                />
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap ml-1">
                Showing {products.length} items
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-border">
                    <th className="py-3">Product</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Recommended</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">7d Sales</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`align-top border-b last:border-b-0 cursor-pointer hover:bg-palladian/20 ${selected?.id === p.id ? "bg-palladian/30" : ""}`}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {p.name
                              .split(" ")
                              .map((s) => s[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">
                              Product ID: #{p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">₹{p.price.toLocaleString()}</td>
                      <td className="py-4">
                        ₹{p.recommended.toLocaleString()}
                      </td>
                      <td className="py-4">{p.stock}</td>
                      <td className="py-4">{p.sales7d}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button className="btn-primary text-xs flex items-center gap-2">
                            <Check className="w-3 h-3" />
                            Apply
                          </button>
                          <button className="btn-tertiary text-xs flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="card sticky top-24">
              <h3 className="text-sm text-gray-500 uppercase mb-3">
                Sales Trend
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Last 7 days aggregate sales
              </p>
              <div className="w-full h-20">
                {/* Show selected product sparkline if present */}
                <Sparkline
                  data={
                    selected
                      ? expandSales(selected.sales7d)
                      : sampleProducts.map((p) => p.sales7d)
                  }
                  color="#2C3B4D"
                />
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-500 uppercase mb-3">
                Price Distribution
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Current product prices
              </p>
              <div className="flex flex-col gap-3">
                <BarMiniChart
                  data={sampleProducts.map((p) => p.price)}
                  labels={sampleProducts.map((p) => p.name)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
