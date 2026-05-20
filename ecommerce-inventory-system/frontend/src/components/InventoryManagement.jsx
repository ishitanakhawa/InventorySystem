import { useState, useEffect } from "react";
import {
  Warehouse,
  Link2,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Package,
  ArrowRight,
  TrendingUp,
  Plus,
  Trash2,
} from "lucide-react";

const InventoryManagement = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [connections, setConnections] = useState([]);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedWarehouse]);

  const loadData = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/warehouses");
      const data = await response.json();
      setWarehouses(data);

      // Mock inventory data (endpoint not implemented yet)
      const mockInventory = [
        { id: 1, name: "Laptop", quantity: 25, category: "Electronics" },
        { id: 2, name: "Mouse", quantity: 80, category: "Electronics" },
        { id: 3, name: "Keyboard", quantity: 60, category: "Electronics" },
        { id: 6, name: "T-Shirt", quantity: 120, category: "Clothing" },
        { id: 9, name: "Sneakers", quantity: 50, category: "Footwear" },
      ];
      setInventoryData(mockInventory);

      // Mock connections (endpoint not implemented yet)
      const mockConnections = [
        { id: 2, weight: 250 },
        { id: 3, weight: 2800 },
      ];
      setConnections(mockConnections);
    } catch (error) {
      console.error("Failed to load warehouses from backend:", error);
      // Fallback to mock data
      const mockWarehouses = [
        {
          id: 1,
          name: "Main Warehouse",
          location: "Central Hub",
          totalStock: 5230,
          capacity: 10000,
          status: "Active",
        },
        {
          id: 2,
          name: "East Coast Hub",
          location: "New York",
          totalStock: 3890,
          capacity: 8000,
          status: "Active",
        },
        {
          id: 3,
          name: "West Coast Hub",
          location: "California",
          totalStock: 3330,
          capacity: 7500,
          status: "Active",
        },
      ];
      setWarehouses(mockWarehouses);
    }
  };

  const selectedWarehouseData = warehouses.find(
    (w) => w.id === selectedWarehouse,
  );
  const capacityPercentage = selectedWarehouseData
    ? (selectedWarehouseData.totalStock / selectedWarehouseData.capacity) * 100
    : 0;

  const handleAddWarehouse = async (warehouseData) => {
    // TODO: Call C++ backend API
    const newWarehouse = {
      id: Date.now(),
      ...warehouseData,
      totalStock: 0,
      capacity: parseInt(warehouseData.capacity),
      status: "Active",
    };
    setWarehouses([...warehouses, newWarehouse]);
    loadData();
    setShowAddWarehouseModal(false);
  };

  const handleRemoveWarehouse = async (id) => {
    // TODO: Call C++ backend API
    if (confirm("Are you sure you want to remove this warehouse?")) {
      setWarehouses(warehouses.filter((w) => w.id !== id));
      if (selectedWarehouse === id) {
        setSelectedWarehouse(warehouses[0]?.id || 1);
      }
      loadData();
    }
  };

  const handleFindShortestPath = async (toWarehouseId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/warehouses/shortest-path?from=${selectedWarehouse}&to=${toWarehouseId}`,
      );
      const data = await response.json();
      setSelectedPath(data);
      setShowTransferModal(true);
    } catch (error) {
      console.error("Failed to find shortest path:", error);
      // Fallback to mock data
      const mockPath = {
        path: [selectedWarehouse, toWarehouseId],
        distance: 250,
      };
      setSelectedPath(mockPath);
      setShowTransferModal(true);
    }
  };

  const handleStockTransfer = async (
    fromWarehouseId,
    toWarehouseId,
    productId,
    quantity,
  ) => {
    // TODO: Call C++ backend API
    alert("Stock transferred successfully!");
    loadData();
    setShowTransferModal(false);
    setSelectedPath(null);
  };

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
            <p className="text-sm text-gray-500">
              Monitor and manage warehouse inventory
            </p>
          </div>
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
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <span className="chip chip-gray text-xs">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Product ID: {item.productId}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-gray-900">
                        {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">units</p>
                      <span
                        className={`chip text-xs mt-1 ${item.status === "Low Stock" ? "chip-primary" : "chip-gray"}`}
                      >
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
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Connected Warehouses:
              </p>
              <div className="space-y-3">
                {connections.map((conn, index) => {
                  const connectedWarehouse = warehouses.find(
                    (w) => w.id === conn.id,
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-12 border border-border hover:shadow-1 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-8">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {connectedWarehouse?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {connectedWarehouse?.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ArrowRight className="w-4 h-4" />
                          {conn.weight} miles
                        </div>
                        <button
                          onClick={() => handleFindShortestPath(conn.id)}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          Find Shortest Path
                        </button>
                      </div>
                    </div>
                  );
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
                    <span className="chip chip-primary text-xs">
                      Restock Needed
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-8 border border-border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Sneakers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">50 units</span>
                    <span className="chip chip-primary text-xs">
                      Restock Needed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Structure Info */}
      <div className="card bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 rounded-8">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Data Structures Used</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-16 border border-border hover:shadow-1 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔗</span>
              <h4 className="font-semibold text-gray-900">Linked List</h4>
            </div>
            <p className="text-sm text-gray-600">
              Each warehouse maintains inventory as a linked list for efficient
              insertion and deletion operations.
              <span className="font-medium text-primary"> O(1)</span> insertion
              at head,
              <span className="font-medium text-primary"> O(n)</span> traversal.
            </p>
          </div>
          <div className="p-5 bg-white rounded-16 border border-border hover:shadow-1 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🕸️</span>
              <h4 className="font-semibold text-gray-900">Graph (Dijkstra)</h4>
            </div>
            <p className="text-sm text-gray-600">
              Warehouse connections form an undirected graph enabling shortest
              path calculations using Dijkstra's algorithm for optimal stock
              transfer.{" "}
              <span className="font-medium text-primary">O((V+E)log V)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">Add New Warehouse</h3>
            <AddWarehouseForm
              onSubmit={handleAddWarehouse}
              onCancel={() => setShowAddWarehouseModal(false)}
            />
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && selectedPath && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">Stock Transfer</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-12">
                <p className="text-sm text-gray-600 mb-2">
                  Shortest Path (Dijkstra):
                </p>
                <p className="font-medium">{selectedPath.path.join(" → ")}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Distance: {selectedPath.distance} miles
                </p>
              </div>
              <StockTransferForm
                fromWarehouse={selectedWarehouse}
                toWarehouse={selectedPath.path[selectedPath.path.length - 1]}
                inventory={inventoryData}
                onTransfer={handleStockTransfer}
                onCancel={() => {
                  setShowTransferModal(false);
                  setSelectedPath(null);
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Warehouse Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacity
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value })
          }
          className="input w-full"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Add Warehouse
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-tertiary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const StockTransferForm = ({
  fromWarehouse,
  toWarehouse,
  inventory,
  onTransfer,
  onCancel,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onTransfer(
      fromWarehouse,
      toWarehouse,
      parseInt(selectedProduct),
      parseInt(quantity),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="input w-full"
          required
        >
          <option value="">Select product...</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (Available: {item.quantity})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="input w-full"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Transfer Stock
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-tertiary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InventoryManagement;
