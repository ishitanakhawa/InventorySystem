import { useState, useEffect } from "react";
import {
  Warehouse as WarehouseIcon,
  Link2,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Package,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Truck,
  BarChart3,
  Search,
  Navigation,
  DollarSign,
  Info,
} from "lucide-react";

const InventoryManagement = ({ user }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Comparative Routing Panel States
  const [routingTarget, setRoutingTarget] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState("Dijkstra");
  const [routingResults, setRoutingResults] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/warehouses");
      const data = await response.json();
      setWarehouses(data);
      if (data.length > 0 && !data.find(w => w.id === selectedWarehouse)) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (err) {
      console.warn("Failed to load warehouses from C++ server. Using offline mock database.");
      // Fail-safe mock data
      const mockWarehouses = [
        {
          id: 1,
          name: "Main Warehouse",
          location: "Central Hub",
          totalStock: 335,
          capacity: 10000,
          status: "Active",
          inventory: [
            { productId: 1, name: "Laptop", quantity: 25 },
            { productId: 2, name: "Mouse", quantity: 80 },
            { productId: 3, name: "Keyboard", quantity: 60 },
            { productId: 6, name: "T-Shirt", quantity: 120 },
            { productId: 9, name: "Sneakers", quantity: 50 },
          ],
        },
        {
          id: 2,
          name: "East Coast Hub",
          location: "New York",
          totalStock: 215,
          capacity: 8000,
          status: "Active",
          inventory: [
            { productId: 1, name: "Laptop", quantity: 15 },
            { productId: 2, name: "Mouse", quantity: 70 },
            { productId: 5, name: "Headphones", quantity: 50 },
            { productId: 6, name: "T-Shirt", quantity: 80 },
          ],
        },
        {
          id: 3,
          name: "West Coast Hub",
          location: "California",
          totalStock: 165,
          capacity: 7500,
          status: "Active",
          inventory: [
            { productId: 3, name: "Keyboard", quantity: 40 },
            { productId: 4, name: "Monitor", quantity: 30 },
            { productId: 9, name: "Sneakers", quantity: 50 },
            { productId: 10, name: "Boots", quantity: 45 },
          ],
        },
      ];
      setWarehouses(mockWarehouses);
    } finally {
      setLoading(false);
    }
  };

  const selectedWarehouseData = warehouses.find((w) => w.id === selectedWarehouse) || warehouses[0];
  const inventoryData = selectedWarehouseData?.inventory || [];

  const handleAddWarehouse = async (warehouseData) => {
    if (user?.role !== "Admin") {
      setError("Permission Denied: Only Admin accounts can add warehouse hubs.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warehouseData),
      });
      if (response.ok) {
        setSuccess("New warehouse hub established successfully!");
        loadData();
        setShowAddWarehouseModal(false);
      }
    } catch (err) {
      console.warn("Backend offline. Adding warehouse locally.");
      const newId = warehouses.length ? Math.max(...warehouses.map((w) => w.id)) + 1 : 1;
      const newWarehouse = {
        id: newId,
        name: warehouseData.name,
        location: warehouseData.location,
        capacity: parseInt(warehouseData.capacity),
        totalStock: 0,
        status: "Active",
        inventory: [],
      };
      setWarehouses([...warehouses, newWarehouse]);
      setSelectedWarehouse(newId);
      setSuccess("New warehouse hub added locally!");
      setShowAddWarehouseModal(false);
    }
  };

  const handleRemoveWarehouse = async (id) => {
    if (user?.role !== "Admin") {
      setError("Permission Denied: Only Admin accounts can remove warehouse hubs.");
      return;
    }

    if (!confirm("Are you sure you want to decommission this warehouse hub? This will erase connected inventories.")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/warehouses?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccess("Warehouse hub decommissioned successfully.");
        if (selectedWarehouse === id) {
          setSelectedWarehouse(warehouses.find((w) => w.id !== id)?.id || 1);
        }
        loadData();
      }
    } catch (err) {
      console.warn("Backend offline. Removing warehouse locally.");
      const updated = warehouses.filter((w) => w.id !== id);
      setWarehouses(updated);
      if (selectedWarehouse === id) {
        setSelectedWarehouse(updated[0]?.id || 1);
      }
      setSuccess("Warehouse removed locally.");
    }
  };

  const handleRouteQuery = async (targetId, algo = selectedAlgo) => {
    setError("");
    if (!targetId || targetId == selectedWarehouse) return;
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/warehouses/shortest-path?from=${selectedWarehouse}&to=${targetId}&algo=${algo}`
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn("Backend offline. Simulating shortest path calculations locally.");
      // Simple mock shortest path helper
      const namesMap = { 1: "Main Warehouse", 2: "East Coast Hub", 3: "West Coast Hub" };
      const fromName = namesMap[selectedWarehouse] || `Warehouse ${selectedWarehouse}`;
      const toName = namesMap[targetId] || `Warehouse ${targetId}`;
      
      let distance = 250;
      let path = [selectedWarehouse, parseInt(targetId)];
      let visited = [fromName, toName];

      if (selectedWarehouse === 2 && parseInt(targetId) === 3) {
        distance = 3000;
        visited = ["East Coast Hub", "Main Warehouse", "West Coast Hub"];
        path = [2, 1, 3];
      } else if (selectedWarehouse === 3 && parseInt(targetId) === 2) {
        distance = 3000;
        visited = ["West Coast Hub", "Main Warehouse", "East Coast Hub"];
        path = [3, 1, 2];
      }

      return {
        success: true,
        method: algo === "BFS" ? "BFS (Shortest Hops)" : algo === "DFS" ? "DFS (Depth Traversal)" : "Dijkstra (Lowest Mileage)",
        distance,
        path,
        visited,
        costs: {
          cargoTruck: distance * 0.15,
          expressCourier: distance * 0.45,
          airFreight: distance * 1.20,
        },
      };
    }
  };

  const executeRouting = async (e) => {
    e.preventDefault();
    if (!routingTarget) return;

    setRoutingResults(null);
    setIsComparing(false);
    
    const results = await handleRouteQuery(routingTarget, selectedAlgo);
    if (results && results.success) {
      setRoutingResults(results);
    } else {
      setError("No valid logistics routes found between selected hubs.");
    }
  };

  // Compare BFS, DFS, and Dijkstra side-by-side!
  const runComparativeAnalysis = async () => {
    if (!routingTarget) return;
    setIsComparing(true);
    setRoutingResults(null);

    const [bfs, dfs, dijkstra] = await Promise.all([
      handleRouteQuery(routingTarget, "BFS"),
      handleRouteQuery(routingTarget, "DFS"),
      handleRouteQuery(routingTarget, "Dijkstra"),
    ]);

    setRoutingResults({
      isComparison: true,
      targetId: routingTarget,
      bfs,
      dfs,
      dijkstra,
    });
  };

  const handleStockTransfer = async (fromWarehouseId, toWarehouseId, productId, quantity) => {
    if (user?.role === "Guest") {
      setError("Permission Denied: Guest accounts cannot execute stock transfers.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/warehouses/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId,
          toWarehouseId,
          productId,
          quantity,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Stock successfully transferred across hubs!");
        loadData();
        setShowTransferModal(false);
      } else {
        setError(data.message || "Transfer failed.");
      }
    } catch (err) {
      console.warn("Backend offline. Executing local mock stock transfer.");
      // Local database update logic
      const updated = warehouses.map((w) => {
        if (w.id === fromWarehouseId) {
          const inv = w.inventory.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i
          );
          return { ...w, inventory: inv, totalStock: inv.reduce((sum, item) => sum + item.quantity, 0) };
        }
        if (w.id === toWarehouseId) {
          const exists = w.inventory.find((i) => i.productId === productId);
          let inv = [];
          if (exists) {
            inv = w.inventory.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            inv = [...w.inventory, { productId, name: `Product ${productId}`, quantity }];
          }
          return { ...w, inventory: inv, totalStock: inv.reduce((sum, item) => sum + item.quantity, 0) };
        }
        return w;
      });
      setWarehouses(updated);
      setSuccess("Stock transferred locally across nodes!");
      setShowTransferModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-16 animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded-8 animate-pulse w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-8 animate-pulse w-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <WarehouseIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Logistics & Warehousing</h2>
            <p className="text-sm text-gray-500">
              Audit in-memory inventories, transfer stock, and analyze comparative BFS/DFS/Dijkstra network routes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="btn-tertiary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Hubs
          </button>
          
          {user?.role === "Admin" && (
            <button
              onClick={() => setShowAddWarehouseModal(true)}
              className="btn-primary flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Establish Hub
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Warehouse Selector grid */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Active Hub Directory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((w) => {
            const pct = Math.round((w.totalStock / w.capacity) * 100) || 0;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWarehouse(w.id)}
                className={`p-5 rounded-16 border-2 text-left cursor-pointer transition-all ${
                  selectedWarehouse === w.id
                    ? "border-blueFantastic bg-blueFantastic/5 shadow-2"
                    : "border-border hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <WarehouseIcon className="w-5 h-5 text-blueFantastic" />
                    <p className="font-bold text-gray-900">{w.name}</p>
                  </div>
                  {user?.role === "Admin" && warehouses.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWarehouse(w.id);
                      }}
                      className="text-gray-400 hover:text-error p-1 rounded-full transition-colors"
                      title="Decommission Hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{w.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span>Storage: {w.totalStock} units</span>
                    <span className="font-bold">{pct}% Full</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-blueFantastic transition-all duration-300"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Linked List Inventory vs Logistics Graph Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Inventory (Linked List) */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blueFantastic" />
              <h2 className="text-lg font-bold text-gray-900">Linked-List Stock Directory</h2>
            </div>
            <span className="chip chip-gray text-xs">Linked List Nodes</span>
          </div>

          {inventoryData.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-500 font-medium bg-gray-50 border border-dashed rounded-12">
              This hub has zero inventory stocked.
            </p>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {inventoryData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-border rounded-12 shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 rounded-full bg-blueFantastic text-palladian flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    {idx < inventoryData.length - 1 && (
                      <div className="w-0.5 h-6 bg-blueFantastic/20 mt-1"></div>
                    )}
                  </div>

                  <div className="flex-grow text-xs font-semibold text-gray-700">
                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Product ID: #{item.productId}</p>
                  </div>

                  <div className="text-right font-bold text-xs">
                    <p className="text-sm font-black text-gray-900">{item.quantity} units</p>
                    <span className="text-[10px] text-gray-400">Stock Node</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Comparative Routing (Graph Algorithms) */}
        <div className="card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blueFantastic" />
                <h2 className="text-lg font-bold text-gray-900">Network Route Optimization</h2>
              </div>
              <span className="chip chip-primary text-xs">Logistics Graph</span>
            </div>

            {/* Inputs */}
            <form onSubmit={executeRouting} className="space-y-4 bg-gray-50 p-4 border border-border rounded-12">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Origin Hub
                  </label>
                  <input
                    type="text"
                    value={selectedWarehouseData?.name || ""}
                    className="input w-full text-xs font-bold bg-gray-200 border-none"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Destination Hub
                  </label>
                  <select
                    value={routingTarget}
                    onChange={(e) => setRoutingTarget(e.target.value)}
                    className="input w-full text-xs font-bold"
                    required
                  >
                    <option value="">Select target...</option>
                    {warehouses
                      .filter((w) => w.id !== selectedWarehouse)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Algorithm:</span>
                  <select
                    value={selectedAlgo}
                    onChange={(e) => setSelectedAlgo(e.target.value)}
                    className="input text-[11px] py-1 font-bold"
                  >
                    <option value="Dijkstra">Dijkstra (Mileage-Based)</option>
                    <option value="BFS">BFS (Hop-Based)</option>
                    <option value="DFS">DFS (Depth-Based)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!routingTarget}
                    className="btn-primary py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Route
                  </button>
                  <button
                    type="button"
                    onClick={runComparativeAnalysis}
                    disabled={!routingTarget}
                    className="btn-secondary py-1.5 text-xs font-bold flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-burningFlame" />
                    Compare Algos
                  </button>
                </div>
              </div>
            </form>

            {/* Results display */}
            {routingResults && !routingResults.isComparison && (
              <div className="p-4 bg-gradient-to-r from-blueFantastic/5 to-slate-50 border border-blueFantastic/10 rounded-12 space-y-3 animate-slideUp">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-blueFantastic uppercase tracking-widest bg-blueFantastic/10 px-2 py-0.5 rounded-full">
                    {routingResults.method}
                  </span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {routingResults.distance} Miles
                  </span>
                </div>

                <div className="text-xs space-y-1.5 font-medium text-gray-600">
                  <p className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 uppercase text-[10px]">Optimal Route:</span>
                    <span className="font-mono text-blueFantastic font-black">
                      {routingResults.visited?.join(" → ")}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Visited Hops Sequence: [{routingResults.path?.join(", ")}]
                  </p>
                </div>

                {/* Costs Analysis breakdown */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Comparative Transport Costs Analysis
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="bg-white p-2 border rounded-8">
                      <p className="text-slate-500">Cargo Truck</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        ₹{routingResults.costs?.cargoTruck.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-2 border rounded-8">
                      <p className="text-indigo-500">Express Courier</p>
                      <p className="text-xs font-black text-indigo-700 mt-0.5">
                        ₹{routingResults.costs?.expressCourier.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-2 border rounded-8">
                      <p className="text-yellow-600">Air Freight</p>
                      <p className="text-xs font-black text-yellow-800 mt-0.5">
                        ₹{routingResults.costs?.airFreight.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transfer Action */}
                {user?.role !== "Guest" && (
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="w-full btn-primary py-2 text-xs font-bold mt-2"
                  >
                    Initiate Stock Transfer Along Route
                  </button>
                )}
              </div>
            )}

            {/* Comparison results */}
            {routingResults && routingResults.isComparison && (
              <div className="space-y-3 animate-slideUp">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                  Side-by-Side Algorithm Benchmark
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Dijkstra */}
                  <div className="p-3 bg-white border border-blueFantastic/20 rounded-12 text-center space-y-1 shadow-sm">
                    <p className="font-extrabold text-[10px] text-blueFantastic uppercase">Dijkstra</p>
                    <p className="text-base font-black text-gray-900">{routingResults.dijkstra?.distance} Mi</p>
                    <p className="text-[9px] text-slate-500 font-bold">Lowest Mileage</p>
                  </div>
                  {/* BFS */}
                  <div className="p-3 bg-white border rounded-12 text-center space-y-1 shadow-sm">
                    <p className="font-extrabold text-[10px] text-gray-500 uppercase">BFS</p>
                    <p className="text-base font-black text-gray-900">{routingResults.bfs?.distance} Mi</p>
                    <p className="text-[9px] text-slate-500 font-bold">Shortest Hops</p>
                  </div>
                  {/* DFS */}
                  <div className="p-3 bg-white border rounded-12 text-center space-y-1 shadow-sm">
                    <p className="font-extrabold text-[10px] text-gray-500 uppercase">DFS</p>
                    <p className="text-base font-black text-gray-900">{routingResults.dfs?.distance} Mi</p>
                    <p className="text-[9px] text-slate-500 font-bold">Depth Traversal</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-12 border border-border text-[11px] font-semibold text-gray-700 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-blueFantastic uppercase text-[9px] font-black w-14">Dijkstra:</span>
                    <span className="font-mono text-gray-600 line-clamp-1">{routingResults.dijkstra?.visited?.join(" → ")}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 uppercase text-[9px] font-black w-14">BFS:</span>
                    <span className="font-mono text-gray-600 line-clamp-1">{routingResults.bfs?.visited?.join(" → ")}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 uppercase text-[9px] font-black w-14">DFS:</span>
                    <span className="font-mono text-gray-600 line-clamp-1">{routingResults.dfs?.visited?.join(" → ")}</span>
                  </div>
                </div>

                {user?.role !== "Guest" && (
                  <button
                    onClick={() => {
                      setRoutingResults(routingResults.dijkstra);
                      setShowTransferModal(true);
                    }}
                    className="w-full btn-primary py-2 text-xs font-bold"
                  >
                    Select Dijkstra Path & Transfer Stock
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Establish Hub Profile</h3>
              <button onClick={() => setShowAddWarehouseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddWarehouseForm
              onSubmit={handleAddWarehouse}
              onCancel={() => setShowAddWarehouseModal(false)}
            />
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && routingResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Initiate Cargo Transfer</h3>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-blueFantastic/5 border border-blueFantastic/10 rounded-8 text-xs font-semibold text-gray-600">
                <p className="font-bold text-blueFantastic text-[10px] uppercase mb-1">
                  Logistics Path (Dijkstra)
                </p>
                <p className="font-mono text-gray-900">{routingResults.visited?.join(" → ")}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Distance: {routingResults.distance} Miles | Transit ETA: {routingResults.distance < 500 ? "4 Hours" : "2 Days"}
                </p>
              </div>

              <StockTransferForm
                fromWarehouse={selectedWarehouse}
                toWarehouse={routingResults.path ? routingResults.path[routingResults.path.length - 1] : routingTarget}
                inventory={inventoryData}
                onTransfer={handleStockTransfer}
                onCancel={() => {
                  setShowTransferModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddWarehouseForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Hub Tag Name
        </label>
        <input
          type="text"
          placeholder="e.g. Northern Depot"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          City Location
        </label>
        <input
          type="text"
          placeholder="e.g. Seattle"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="input w-full text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Storage Volume Capacity (Units)
        </label>
        <input
          type="number"
          placeholder="e.g. 10000"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          className="input w-full text-sm"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1 py-2 text-sm font-bold">
          Establish Hub
        </button>
        <button type="button" onClick={onCancel} className="btn-tertiary flex-1 py-2 text-sm font-bold">
          Cancel
        </button>
      </div>
    </form>
  );
};

const StockTransferForm = ({ fromWarehouse, toWarehouse, inventory, onTransfer, onCancel }) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onTransfer(fromWarehouse, parseInt(toWarehouse), parseInt(selectedProduct), parseInt(quantity));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Select Product Node
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="input w-full text-sm font-semibold bg-gray-50"
          required
        >
          <option value="">Choose item...</option>
          {inventory.map((item) => (
            <option key={item.productId} value={item.productId}>
              {item.name} (Available: {item.quantity})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Transfer Quantity
        </label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="input w-full text-sm"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1 py-2 text-sm font-bold">
          Execute Transfer
        </button>
        <button type="button" onClick={onCancel} className="btn-tertiary flex-1 py-2 text-sm font-bold">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InventoryManagement;
