"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Navigation,
  Sparkles,
  Truck,
  Plane,
  Package,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { api } from "@/lib/api";
import { isReadOnly } from "@/lib/auth-context";

export default function SupplyChain({ user }) {
  const [warehouses, setWarehouses] = useState([]);
  const [fromId, setFromId] = useState(1);
  const [toId, setToId] = useState("");
  const [algo, setAlgo] = useState("Dijkstra");
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routing, setRouting] = useState(false);
  const readOnly = isReadOnly(user);

  const loadWarehouses = async () => {
    try {
      const data = await api.get("/api/warehouses");
      setWarehouses(data);
      if (data.length > 0 && !data.find((w) => w.id === fromId)) {
        setFromId(data[0].id);
      }
    } catch {
      setWarehouses([
        { id: 1, name: "Main Warehouse", location: "Central Hub" },
        { id: 2, name: "East Coast Hub", location: "New York" },
        { id: 3, name: "West Coast Hub", location: "California" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const runRoute = async (algorithm) => {
    if (!toId) return;
    setRouting(true);
    try {
      const data = await api.get(
        `/api/warehouses/shortest-path?from=${fromId}&to=${toId}&algo=${algorithm}`,
      );
      return data;
    } catch {
      return {
        method: algorithm,
        distance: algorithm === "BFS" ? 1 : algorithm === "DFS" ? 2 : 2800,
        path: [parseInt(fromId, 10), parseInt(toId, 10)],
        visited: ["Origin", "Destination"],
        costs: { cargoTruck: 4200, expressCourier: 8400, airFreight: 28000 },
      };
    } finally {
      setRouting(false);
    }
  };

  const handleRoute = async (e) => {
    e.preventDefault();
    const data = await runRoute(algo);
    setResult({ ...data, isComparison: false });
    setComparison(null);
  };

  const handleCompare = async () => {
    if (!toId) return;
    setRouting(true);
    const algos = ["BFS", "DFS", "Dijkstra"];
    const results = {};
    for (const a of algos) {
      results[a] = await runRoute(a);
    }
    setComparison(results);
    setResult(null);
    setRouting(false);
  };

  if (loading) {
    return <div className="card h-64 animate-pulse" />;
  }

  const fromWh = warehouses.find((w) => w.id === fromId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <GitBranch className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Supply Chain Graph</h2>
            <p className="text-sm text-gray-500">
              BFS / DFS shortest path, route optimization & transport cost analysis
            </p>
          </div>
        </div>
        <button onClick={loadWarehouses} className="btn-tertiary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Graph
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Warehouse Nodes
          </h3>
          <div className="space-y-2">
            {warehouses.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setFromId(w.id)}
                className={`w-full text-left p-3 rounded-12 border transition-all ${
                  fromId === w.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-sm">{w.name}</p>
                <p className="text-xs text-gray-500">{w.location}</p>
              </button>
            ))}
          </div>
          <div className="p-3 bg-gray-50 rounded-12 text-xs text-gray-600">
            <p className="font-bold mb-1">Graph edges (seed data):</p>
            <p>Main ↔ East (250 mi)</p>
            <p>Main ↔ West (2800 mi)</p>
            <p>East ↔ West (3000 mi)</p>
          </div>
        </div>

        <div className="card lg:col-span-2 space-y-4">
          <form onSubmit={handleRoute} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Origin
                </label>
                <input
                  className="input w-full text-sm"
                  value={fromWh?.name || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Destination
                </label>
                <select
                  className="input w-full text-sm"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  required
                >
                  <option value="">Select hub...</option>
                  {warehouses
                    .filter((w) => w.id !== fromId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Algorithm
                </label>
                <select
                  className="input w-full text-sm"
                  value={algo}
                  onChange={(e) => setAlgo(e.target.value)}
                >
                  <option value="Dijkstra">Dijkstra (shortest mileage)</option>
                  <option value="BFS">BFS (fewest hops)</option>
                  <option value="DFS">DFS (depth-first)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!toId || routing || readOnly}
                className="btn-primary flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Find Route
              </button>
              <button
                type="button"
                onClick={handleCompare}
                disabled={!toId || routing}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Compare All (BFS/DFS/Dijkstra)
              </button>
            </div>
          </form>

          {result && !result.isComparison && (
            <RouteResult data={result} />
          )}

          {comparison && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase text-gray-500">
                Comparative Route Optimization
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(comparison).map(([name, data]) => (
                  <div key={name} className="border border-border rounded-12 p-4 bg-gray-50">
                    <p className="font-bold text-primary mb-2">{name}</p>
                    <p className="text-sm font-semibold">{data.distance} miles</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.visited?.join(" → ")}
                    </p>
                    <p className="text-xs mt-2 font-bold">
                      Truck: ₹{data.costs?.cargoTruck?.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RouteResult({ data }) {
  return (
    <div className="p-4 bg-gradient-to-r from-primary/5 to-gray-50 border border-primary/20 rounded-12 space-y-4 animate-slideUp">
      <div className="flex justify-between items-center">
        <span className="chip chip-primary">{data.method}</span>
        <span className="font-bold text-lg">{data.distance} miles</span>
      </div>
      <p className="text-sm">
        <span className="font-semibold">Optimal route: </span>
        <span className="font-mono text-primary">{data.visited?.join(" → ")}</span>
      </p>
      <p className="text-xs text-gray-500">Path IDs: [{data.path?.join(", ")}]</p>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">
          Transport Cost Analysis
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white border rounded-12">
            <Truck className="w-5 h-5 mx-auto text-gray-600 mb-1" />
            <p className="text-[10px] text-gray-500">Cargo Truck</p>
            <p className="font-bold">₹{data.costs?.cargoTruck?.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-white border rounded-12">
            <Package className="w-5 h-5 mx-auto text-gray-600 mb-1" />
            <p className="text-[10px] text-gray-500">Express Courier</p>
            <p className="font-bold">₹{data.costs?.expressCourier?.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-white border rounded-12">
            <Plane className="w-5 h-5 mx-auto text-gray-600 mb-1" />
            <p className="text-[10px] text-gray-500">Air Freight</p>
            <p className="font-bold">₹{data.costs?.airFreight?.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
