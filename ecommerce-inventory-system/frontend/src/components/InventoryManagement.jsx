import { useState, useEffect } from "react";
import { warehousesDb } from "../lib/mockDb";
import {
  Warehouse as WarehouseIcon,
  Link2,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Plus,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

const InventoryManagement = ({ user }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await warehousesDb.getAll();
      setWarehouses(data);
      if (data.length > 0 && !data.find((w) => w.id === selectedWarehouse)) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (err) {
      setError("Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  const selectedWarehouseData =
    warehouses.find((w) => w.id === selectedWarehouse) || warehouses[0];
  const inventoryData = selectedWarehouseData?.inventory || [];

  const handleAddWarehouse = async (warehouseData) => {
    if (user?.role !== "Admin") {
      setError(
        "Permission Denied: Only Admin accounts can add warehouse hubs.",
      );
      return;
    }

    try {
      await warehousesDb.create(warehouseData);
      setSuccess("New warehouse hub established successfully!");
      loadData();
      setShowAddWarehouseModal(false);
    } catch (err) {
      setError("Failed to add warehouse hub.");
    }
  };

  const handleRemoveWarehouse = async (id) => {
    if (user?.role !== "Admin") {
      setError(
        "Permission Denied: Only Admin accounts can remove warehouse hubs.",
      );
      return;
    }

    if (
      !confirm(
        "Are you sure you want to decommission this warehouse hub? This will erase connected inventories.",
      )
    )
      return;

    try {
      await warehousesDb.delete(id);
      setSuccess("Warehouse hub decommissioned successfully.");
      if (selectedWarehouse === id) {
        setSelectedWarehouse(warehouses.find((w) => w.id !== id)?.id || 1);
      }
      loadData();
    } catch (err) {
      setError("Failed to decommission warehouse hub.");
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
              Audit in-memory inventories and manage warehouse stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn-tertiary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Hubs
          </button>

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

      {/* Stock Directory */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blueFantastic" />
            <h2 className="text-lg font-bold text-gray-900">
              Linked-List Stock Directory
            </h2>
          </div>
        </div>

        {inventoryData.length === 0 ? (
          <p className="text-center py-12 text-xs text-gray-500 font-medium bg-gray-50 border border-dashed rounded-12">
            This hub has zero inventory stocked.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventoryData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border border-border rounded-12 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <span className="w-9 h-9 rounded-full bg-blueFantastic text-palladian flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-grow text-xs font-semibold text-gray-700">
                  <p className="font-bold text-sm text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Product ID: #{item.productId}
                  </p>
                </div>

                <div className="text-right font-bold text-xs">
                  <p className="text-sm font-black text-gray-900">
                    {item.quantity} units
                  </p>
                  <span className="text-[10px] text-gray-400">
                    Stock Node
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Establish Hub Profile
              </h3>
              <button
                onClick={() => setShowAddWarehouseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value })
          }
          className="input w-full text-sm"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="btn-primary flex-1 py-2 text-sm font-bold"
        >
          Establish Hub
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-tertiary flex-1 py-2 text-sm font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};



export default InventoryManagement;
