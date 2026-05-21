import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Award,
  History,
  Calendar,
  DollarSign,
  ShoppingBag,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Percent,
} from "lucide-react";

const CustomerModule = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    isLoyaltyMember: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/customers");
      const data = await response.json();
      setCustomers(data);
      if (data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err) {
      console.warn("Backend unavailable. Loading local fallback customer database.");
      // Fail-safe mock data
      const mockCustomers = [
        {
          id: 1,
          name: "John Doe",
          isLoyaltyMember: true,
          registrationDate: "2026-02-14",
          purchaseHistory: [
            "Invoice #8241 - 1x Laptop (₹999.99) 2x Mouse (₹29.99) | Subtotal: ₹1059.97 | Discount: ₹105.99 | Tax: ₹76.32 | Total Paid: ₹1030.30",
            "Invoice #4129 - 1x Headphone (₹149.99) | Subtotal: ₹149.99 | Discount: ₹15.00 | Tax: ₹10.80 | Total Paid: ₹145.79",
          ],
        },
        {
          id: 2,
          name: "Jane Smith",
          isLoyaltyMember: false,
          registrationDate: "2026-04-01",
          purchaseHistory: [
            "Invoice #3928 - 1x Sneakers (₹129.99) | Subtotal: ₹129.99 | Discount: ₹0.00 | Tax: ₹10.40 | Total Paid: ₹140.39",
          ],
        },
        {
          id: 3,
          name: "Bob Wilson",
          isLoyaltyMember: true,
          registrationDate: "2026-05-10",
          purchaseHistory: [
            "Invoice #1209 - 3x T-Shirt (₹19.99) | Subtotal: ₹59.97 | Discount: ₹6.00 | Tax: ₹4.32 | Total Paid: ₹58.29",
          ],
        },
        {
          id: 4,
          name: "Alice Brown",
          isLoyaltyMember: false,
          registrationDate: "2026-05-20",
          purchaseHistory: [],
        },
      ];
      setCustomers(mockCustomers);
      if (!selectedCustomerId) {
        setSelectedCustomerId(mockCustomers[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Check Guest role restrictions
    if (user?.role === "Guest") {
      setError("Permission Denied: Guest role cannot register customers.");
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8080/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Customer "${formData.name}" registered successfully!`);
        setFormData({ name: "", isLoyaltyMember: false });
        await loadCustomers();
      } else {
        setError(data.message || "Failed to register customer.");
      }
    } catch (err) {
      console.warn("Backend offline. Simulating local customer registration.");
      const newId = customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1;
      const today = new Date().toISOString().split("T")[0];
      const newCustomer = {
        id: newId,
        name: formData.name,
        isLoyaltyMember: formData.isLoyaltyMember,
        registrationDate: today,
        purchaseHistory: [],
      };
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      setSelectedCustomerId(newId);
      setSuccess(`Customer "${formData.name}" registered locally!`);
      setFormData({ name: "", isLoyaltyMember: false });
    } finally {
      setFormLoading(false);
      // Auto clear alerts after 4s
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
    }
  };

  // Helper to determine customer loyalty status and metrics
  const getCustomerMetrics = (c) => {
    if (!c) return { tier: "None", color: "text-gray-400", badgeBg: "bg-gray-100", discount: 0 };
    
    const count = c.purchaseHistory ? c.purchaseHistory.length : 0;
    
    // Loyalty Level Definition
    // Gold: Loyalty member AND >= 2 purchases
    // Silver: Loyalty member OR >= 1 purchase
    // Bronze: Regular new customer
    let tier = "Bronze";
    let color = "text-amber-700 bg-amber-50 border-amber-200";
    let discount = 0;

    if (c.isLoyaltyMember) {
      if (count >= 2) {
        tier = "Gold VIP";
        color = "text-yellow-800 bg-yellow-50 border-yellow-200";
        discount = 10; // 10%
      } else {
        tier = "Silver Plus";
        color = "text-slate-700 bg-slate-100 border-slate-300";
        discount = 5; // 5%
      }
    } else if (count >= 1) {
      tier = "Silver Regular";
      color = "text-slate-600 bg-slate-50 border-slate-200";
      discount = 0;
    }

    // Calculate total spent by parsing invoice string summaries
    let totalSpent = 0;
    c.purchaseHistory?.forEach((invoice) => {
      const match = invoice.match(/Total Paid:\s*₹?\s*([\d.]+)/);
      if (match) {
        totalSpent += parseFloat(match[1]);
      } else {
        // Fallback search
        const fallbackMatch = invoice.match(/Total:\s*₹?\s*([\d.]+)/);
        if (fallbackMatch) totalSpent += parseFloat(fallbackMatch[1]);
      }
    });

    return { tier, color, discount, totalSpent };
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedMetrics = getCustomerMetrics(selectedCustomer);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-16">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Loyalty & Profiles
            </h1>
          </div>
          <p className="text-gray-500 ml-12">
            Register new buyers, evaluate checkout loyalty benefits, and explore purchase history
          </p>
        </div>
      </div>

      {/* Main Grid: Registration & Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Search & Directory List */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Customer Directory Search */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Buyer Directory
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-8 animate-pulse"></div>
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-500 font-medium">
                No customer profiles found.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredCustomers.map((c) => {
                  const m = getCustomerMetrics(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`w-full text-left p-3 rounded-12 border flex items-center justify-between transition-all ${
                        selectedCustomerId === c.id
                          ? "bg-blueFantastic text-white border-blueFantastic shadow-1"
                          : "bg-gray-50 text-gray-800 border-border hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs opacity-75 mt-0.5">
                          ID: #{c.id} • Registered {c.registrationDate}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          selectedCustomerId === c.id
                            ? "bg-white/20 border-white/30 text-white"
                            : m.color
                        }`}
                      >
                        {m.tier}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Registration Form */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Register Customer
            </h2>

            {user?.role === "Guest" && (
              <div className="alert alert-warning mb-4 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">Guest Account: Registration is disabled.</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">{success}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Charlie Miller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={formLoading || user?.role === "Guest"}
                  className="input w-full text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-8">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-secondary-hover" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">Enroll in Loyalty Member Program</p>
                    <p className="text-[10px] text-gray-500">Unlocks immediate VIP discounts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isLoyaltyMember}
                  onChange={(e) =>
                    setFormData({ ...formData, isLoyaltyMember: e.target.checked })
                  }
                  disabled={formLoading || user?.role === "Guest"}
                  className="w-4 h-4 text-primary focus:ring-0 rounded-4"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || user?.role === "Guest" || !formData.name.trim()}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <UserPlus className="w-4 h-4" />
                {formLoading ? "Saving..." : "Register Profile"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Selected Customer Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer ? (
            <div className="card space-y-6">
              
              {/* Profile Card Summary */}
              <div className="p-6 bg-gradient-to-br from-blueFantastic to-slate-800 text-white rounded-16 shadow-2 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Background accents */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                  <Shield className="w-64 h-64" />
                </div>

                <div className="space-y-2 z-10">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                    <span className="text-xs bg-white/20 border border-white/30 text-white px-2.5 py-1 rounded-full font-bold">
                      ID: #{selectedCustomer.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Registered: {selectedCustomer.registrationDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Purchases: {selectedCustomer.purchaseHistory?.length || 0} orders
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 z-10">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-12 border border-white/20 shadow-1">
                    <Award className="w-4 h-4 text-burningFlame" />
                    <span className="text-sm font-bold tracking-wide">{selectedMetrics.tier}</span>
                  </div>
                  <p className="text-xs text-slate-300 text-left md:text-right">
                    Current status level
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 border border-border rounded-12 flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-8">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Spent</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      ₹{selectedMetrics.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-border rounded-12 flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 rounded-8">
                    <Percent className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Loyalty Discount</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {selectedMetrics.discount}% Off
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-border rounded-12 flex items-center gap-3">
                  <div className="p-3 bg-orange-50 rounded-8">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Benefit Tier</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {selectedCustomer.isLoyaltyMember ? "VIP Club" : "Standard"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase History Receipt Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <History className="w-5 h-5 text-primary" />
                  Purchase Receipt History
                </h3>

                {!selectedCustomer.purchaseHistory || selectedCustomer.purchaseHistory.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50 border border-dashed border-border rounded-16">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No sales recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Check out items in the Cart tab to populate this buyer's timeline!
                    </p>
                  </div>
                ) : (
                  <div className="relative border-l border-border pl-6 ml-3 space-y-6">
                    {selectedCustomer.purchaseHistory.map((invoice, index) => {
                      // Parse invoice elements for clean styling
                      const invoiceNumMatch = invoice.match(/Invoice\s*#(\d+)|Receipt\s*#(\d+)/);
                      const invoiceNum = invoiceNumMatch ? (invoiceNumMatch[1] || invoiceNumMatch[2]) : "Receipt";
                      
                      const parts = invoice.split("|");
                      const itemsPart = parts[0] ? parts[0].replace(/Invoice\s*#\d+\s*-\s*|Receipt\s*#\d+\s*-\s*/, "") : "";
                      
                      // Find subtotal, discount, tax, total paid
                      const totalMatch = invoice.match(/Total Paid:\s*₹?\s*([\d.]+)|Total:\s*₹?\s*([\d.]+)/);
                      const totalPaid = totalMatch ? parseFloat(totalMatch[1] || totalMatch[2]) : 0;

                      return (
                        <div key={index} className="relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blueFantastic border-4 border-white group-hover:scale-125 transition-all"></div>
                          
                          <div className="p-4 bg-gradient-to-r from-gray-50 to-white border border-border rounded-12 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-blueFantastic uppercase tracking-widest bg-blueFantastic/10 px-2.5 py-0.5 rounded-full">
                                Order #{invoiceNum}
                              </span>
                              <span className="text-sm font-black text-gray-900">
                                Total Paid: ₹{totalPaid.toFixed(2)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 leading-relaxed font-mono bg-white p-3 rounded-8 border border-gray-100 mb-2">
                              {itemsPart}
                            </p>

                            {parts.slice(1).length > 0 && (
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                {parts.slice(1).map((p, idx) => {
                                  if (p.trim()) {
                                    return <span key={idx}>{p.trim()}</span>;
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Loyalty Benefits Explanation */}
              <div className="bg-gradient-to-r from-burningFlame/5 to-truffleTrouble/5 border border-burningFlame/10 p-5 rounded-16 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary-hover" />
                  <h4 className="text-sm font-bold text-gray-800">Loyalty Level Benefits Program</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white/80 rounded-8 border border-border">
                    <p className="font-bold text-amber-800">Bronze Level</p>
                    <p className="text-gray-500 mt-0.5">Standard new customers. Standard dynamic list pricing.</p>
                  </div>
                  <div className="p-3 bg-white/80 rounded-8 border border-border">
                    <p className="font-bold text-slate-700">Silver Plus</p>
                    <p className="text-gray-500 mt-0.5">Loyalty program enrolled. Unlocks immediate 5% invoice discounts.</p>
                  </div>
                  <div className="p-3 bg-white/80 rounded-8 border border-border">
                    <p className="font-bold text-yellow-800">Gold VIP</p>
                    <p className="text-gray-500 mt-0.5">Loyalty member + 2 orders. Premium 10% discount on final subtotal!</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="card p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500 font-semibold">Select a customer from the directory</p>
              <p className="text-sm text-gray-400 mt-1">
                Explore their loyalty credentials, total lifetime purchases, and invoicing timeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModule;
