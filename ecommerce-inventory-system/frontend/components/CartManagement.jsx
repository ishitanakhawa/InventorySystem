"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Undo,
  Redo,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Crown,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Truck,
  Shield,
  Star,
  RefreshCw,
  Package,
  Receipt,
  UserPlus,
} from "lucide-react";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import { canPartialEdit } from "@/lib/auth-context";

const MOCK_QUEUE = [
  { id: 1, name: "John Doe", isLoyaltyMember: true, cartTotal: 1029.97, items: 3, waitTime: "4 min" },
  { id: 2, name: "Jane Smith", isLoyaltyMember: false, cartTotal: 159.99, items: 2, waitTime: "8 min" },
];

const CartManagement = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [checkoutQueue, setCheckoutQueue] = useState([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cart, queue] = await Promise.all([
        api.get("/api/cart"),
        api.get("/api/checkout/queue"),
      ]);
      setCartItems(cart);
      setCheckoutQueue(queue);
    } catch (error) {
      console.error("Failed to load cart from backend:", error);
      setCartItems([]);
      setCheckoutQueue(MOCK_QUEUE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  usePolling(loadData, 5000);

  const handleAddToCart = async (product) => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Fallback to local update
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUndo = async () => {
    try {
      await api.post("/api/cart/undo");
      loadData();
    } catch (error) {
      console.error("Failed to undo cart action:", error);
      if (cartItems.length > 0) setCartItems(cartItems.slice(0, -1));
    }
  };

  const handleRedo = async () => {
    try {
      await api.post("/api/cart/redo");
      loadData();
    } catch (error) {
      console.error("Failed to redo cart action:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const data = await api.post("/api/checkout/dequeue");
      if (data.success !== false) {
        setInvoice(data);
        loadData();
      }
    } catch (error) {
      console.error("Failed to process checkout:", error);
      if (checkoutQueue.length > 0) {
        setCheckoutQueue(checkoutQueue.slice(1));
      }
    }
  };

  const clearCart = async () => {
    try {
      // Clear endpoint not implemented yet, using local update
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const updateQuantity = (id, delta) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item,
    );
    setCartItems(updatedItems);
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((i) => i.id !== id));
  };

  const handleAddCustomer = async (customerData) => {
    try {
      await api.post("/api/checkout/enqueue", customerData);
      setShowAddCustomerModal(false);
      loadData();
    } catch {
      setCheckoutQueue([
        ...checkoutQueue,
        {
          id: Date.now(),
          ...customerData,
          cartTotal: 0,
          items: 0,
          waitTime: "0 min",
        },
      ]);
      setShowAddCustomerModal(false);
    }
  };

  const avgWait =
    checkoutQueue.length > 0
      ? Math.round(
          checkoutQueue.reduce((s, c) => s + parseInt(c.waitTime, 10) || 0, 0) /
            checkoutQueue.length,
        )
      : 0;

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedDelivery =
    cartTotal > 100 ? "Free (2-3 days)" : "₹5.99 (3-5 days)";

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-16 bg-gray-100 rounded-8 mb-2"></div>
              <div className="h-8 bg-gray-100 rounded-8 w-12"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-pulse">
            <div className="h-12 bg-gray-100 rounded-8 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-8"></div>
              ))}
            </div>
          </div>
          <div className="card animate-pulse">
            <div className="h-12 bg-gray-100 rounded-8 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-8"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <ShoppingCart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Cart & Checkout</h2>
            <p className="text-sm text-gray-500">
              Manage shopping carts and checkout queue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn-tertiary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideUp">
        <div className="card p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-600">Cart Items</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-info" />
            <span className="text-xs text-gray-600">In Queue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {checkoutQueue.length}
          </p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-warning" />
            <span className="text-xs text-gray-600">Loyalty</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {checkoutQueue.filter((c) => c.isLoyaltyMember).length}
          </p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs text-gray-600">Avg Wait</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgWait || 0} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shopping Cart (Stack) */}
        <div className="card animate-slideUp" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Shopping Cart</h3>
              <span className="chip chip-gray text-xs">LIFO Stack</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={cartItems.length === 0}
                className="btn-tertiary flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Undo className="w-4 h-4" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                className="btn-tertiary flex items-center gap-2 text-sm"
              >
                <Redo className="w-4 h-4" />
                Redo
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {cartItems.length === 0 ? (
              <div className="p-12 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cart is empty
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add items to get started
                </p>
                <button className="btn-primary">Browse Products</button>
              </div>
            ) : (
              <>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-12 border border-border hover:shadow-1 transition-all animate-slideUp"
                    style={{ animationDelay: `${150 + index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-1">
                        {cartItems.length - index}
                      </div>
                      {index < cartItems.length - 1 && (
                        <div className="w-0.5 h-10 bg-gradient-to-b from-primary to-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-16 flex items-center justify-center text-3xl shadow-1">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <span className="chip chip-gray text-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <p className="text-gray-500">
                          ₹{item.price.toFixed(2)} each
                        </p>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-success">
                          <Shield className="w-3 h-3" />
                          <span>{item.stock} in stock</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-8 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-gray-500 hover:text-error hover:bg-error/5 rounded-8 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Cart
                </button>
              </>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({totalItems} items)
                </span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-success">
                  {estimatedDelivery}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tax (8%)</span>
                <span className="font-medium">
                  ₹{(cartTotal * 0.08).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">
                  ₹{(cartTotal * 1.08).toFixed(2)}
                </span>
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <Sparkles className="w-5 h-5" />
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Secure checkout • Stock validated</span>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Queue (Priority Queue) */}
        <div className="card animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-8">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Checkout Queue</h3>
              <span className="chip chip-primary text-xs">Priority Queue</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="chip chip-primary">
                {checkoutQueue.length} in queue
              </div>
              <div className="chip chip-gray">
                {checkoutQueue.filter((c) => c.isLoyaltyMember).length} VIP
              </div>
              {canPartialEdit(user) && (
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Customer
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {checkoutQueue.length === 0 ? (
              <div className="p-12 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Queue is empty
                </h3>
                <p className="text-sm text-gray-500">
                  All customers have been served
                </p>
              </div>
            ) : (
              checkoutQueue.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`p-4 rounded-16 border-2 transition-all animate-slideUp ${
                    index === 0
                      ? "border-primary bg-gradient-to-r from-primary/5 to-primary/10 shadow-2"
                      : "border-border bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={{ animationDelay: `${250 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-600" />
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {customer.isLoyaltyMember && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {customer.name}
                          </p>
                          {customer.isLoyaltyMember && (
                            <span className="chip chip-primary text-xs flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {customer.items} items
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {customer.waitTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{customer.cartTotal.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Position:</span>
                        <span
                          className={`font-semibold ${index === 0 ? "text-primary" : ""}`}
                        >
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {checkoutQueue.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-12 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-gray-900">
                      Next Customer
                    </span>
                  </div>
                  <span className="chip chip-primary text-xs">Now Serving</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {checkoutQueue[0].name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {checkoutQueue[0].items} items • ₹
                      {checkoutQueue[0].cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{checkoutQueue[0].waitTime}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <Users className="w-5 h-5" />
                Process Next Customer
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Truck className="w-3 h-3" />
                <span>Priority queue: Loyalty members served first</span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Stock Validation Alert */}
      <div className="alert alert-warning animate-slideUp" style={{ animationDelay: "400ms" }}>
        <AlertTriangle className="w-5 h-5" />
        <div className="flex-1">
          <p className="font-medium">Stock Validation</p>
          <p className="text-sm">
            Stock levels are validated before checkout. Low stock items trigger
            automatic restock alerts to prevent overselling.
          </p>
        </div>
      </div>

      {/* Billing simulation receipt */}
      {invoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Billing Simulation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Customer: <strong>{invoice.name}</strong>
              {invoice.isLoyaltyMember && (
                <span className="chip chip-primary text-xs ml-2">VIP 10% off</span>
              )}
            </p>
            <div className="bg-gray-50 p-4 rounded-12 text-sm space-y-2 mb-4 font-mono">
              <p>Subtotal: ₹{Number(invoice.subtotal || 0).toFixed(2)}</p>
              <p>Discount: ₹{Number(invoice.discount || 0).toFixed(2)}</p>
              <p>Tax (8%): ₹{Number(invoice.tax || 0).toFixed(2)}</p>
              <p className="font-bold text-lg text-primary border-t pt-2">
                Total: ₹{Number(invoice.total || 0).toFixed(2)}
              </p>
            </div>
            {invoice.receipt && (
              <p className="text-xs text-gray-500 mb-4 break-words">{invoice.receipt}</p>
            )}
            <button type="button" onClick={() => setInvoice(null)} className="btn-primary w-full">
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">
              Add Customer to Queue
            </h3>
            <AddCustomerForm
              onSubmit={handleAddCustomer}
              onCancel={() => setShowAddCustomerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const AddCustomerForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    isLoyaltyMember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="loyalty"
          checked={formData.isLoyaltyMember}
          onChange={(e) =>
            setFormData({ ...formData, isLoyaltyMember: e.target.checked })
          }
          className="w-4 h-4"
        />
        <label htmlFor="loyalty" className="text-sm text-gray-700">
          Loyalty Member (Priority Queue)
        </label>
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Add to Queue
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

export default CartManagement;
