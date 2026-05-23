import { useState, useEffect } from "react";
import {
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  SlidersHorizontal,
  X,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  RefreshCw,
  Grid3x3,
  List,
  Clock,
  Zap,
  Star,
  Activity,
  AlertCircle,
} from "lucide-react";

const ProductCatalog = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("category");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState({ text: "", productId: null });

  const categories = ["All", "Electronics", "Clothing", "Footwear"];

  const productImages = {
    Laptop: "💻",
    Mouse: "🖱️",
    Keyboard: "⌨️",
    Monitor: "🖥️",
    Headphones: "🎧",
    "T-Shirt": "👕",
    Jeans: "👖",
    Jacket: "🧥",
    Sneakers: "👟",
    Boots: "👢",
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/products");
      const data = await response.json();
      setProducts(data);
      applyFilters(data);
    } catch (error) {
      console.warn(
        "Failed to load products from backend. Using offline mock catalog.",
      );
      // Fallback to robust mock data with basePrice and price for dynamic pricing demo
      const mockProducts = [
        {
          id: 1,
          name: "Laptop",
          category: "Electronics",
          basePrice: 999.99,
          price: 1099.99,
          popularity: 85,
          stock: 50,
          maxStock: 150,
          rating: 4.8,
          turnoverRate: 0.65,
        },
        {
          id: 2,
          name: "Mouse",
          category: "Electronics",
          basePrice: 29.99,
          price: 32.99,
          popularity: 90,
          stock: 200,
          maxStock: 300,
          rating: 4.3,
          turnoverRate: 0.85,
        },
        {
          id: 3,
          name: "Keyboard",
          category: "Electronics",
          basePrice: 79.99,
          price: 87.99,
          popularity: 88,
          stock: 150,
          maxStock: 250,
          rating: 4.5,
          turnoverRate: 0.72,
        },
        {
          id: 4,
          name: "Monitor",
          category: "Electronics",
          basePrice: 349.99,
          price: 349.99,
          popularity: 75,
          stock: 80,
          maxStock: 200,
          rating: 4.6,
          turnoverRate: 0.55,
        },
        {
          id: 5,
          name: "Headphones",
          category: "Electronics",
          basePrice: 149.99,
          price: 164.99,
          popularity: 82,
          stock: 120,
          maxStock: 200,
          rating: 4.2,
          turnoverRate: 0.6,
        },
        {
          id: 6,
          name: "T-Shirt",
          category: "Clothing",
          basePrice: 19.99,
          price: 11.99,
          popularity: 95,
          stock: 300,
          maxStock: 500,
          rating: 4.7,
          turnoverRate: 0.95,
        },
        {
          id: 7,
          name: "Jeans",
          category: "Clothing",
          basePrice: 59.99,
          price: 65.99,
          popularity: 80,
          stock: 180,
          maxStock: 250,
          rating: 4.1,
          turnoverRate: 0.7,
        },
        {
          id: 8,
          name: "Jacket",
          category: "Clothing",
          basePrice: 89.99,
          price: 76.49,
          popularity: 50,
          stock: 100,
          maxStock: 150,
          rating: 4.0,
          turnoverRate: 0.45,
        },
        {
          id: 9,
          name: "Sneakers",
          category: "Footwear",
          basePrice: 129.99,
          price: 142.99,
          popularity: 88,
          stock: 150,
          maxStock: 200,
          rating: 4.9,
          turnoverRate: 0.8,
        },
        {
          id: 10,
          name: "Boots",
          category: "Footwear",
          basePrice: 159.99,
          price: 135.99,
          popularity: 45,
          stock: 90,
          maxStock: 120,
          rating: 4.4,
          turnoverRate: 0.4,
        },
      ];
      setProducts(mockProducts);
      applyFilters(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (productList) => {
    let filtered = [...productList];

    // Search based on type
    if (searchTerm) {
      if (searchType === "id") {
        const id = parseInt(searchTerm);
        filtered = filtered.filter((p) => p.id === id);
      } else if (searchType === "price") {
        const min = parseFloat(priceFilter.min) || 0;
        const max = parseFloat(priceFilter.max) || Infinity;
        filtered = filtered.filter((p) => p.price >= min && p.price <= max);
      } else {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }
    }

    // Price range filter (for name/ID search)
    if (searchType !== "price" && (priceFilter.min || priceFilter.max)) {
      filtered = filtered.filter((product) => {
        const matchesMin =
          !priceFilter.min || product.price >= parseFloat(priceFilter.min);
        const matchesMax =
          !priceFilter.max || product.price <= parseFloat(priceFilter.max);
        return matchesMin && matchesMax;
      });
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === "category") {
      filtered.sort((a, b) => {
        if (a.category !== b.category)
          return a.category.localeCompare(b.category);
        if (a.popularity !== b.popularity) return b.popularity - a.popularity;
        return a.price - b.price;
      });
    } else if (sortBy === "price") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "popularity") {
      filtered.sort((a, b) => b.popularity - a.popularity);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters(products);
  }, [searchTerm, priceFilter, sortBy, selectedCategory, searchType, products]);

  const handleAddProduct = async (productData) => {
    if (user?.role === "Guest" || user?.role === "Employee") {
      setError("Permission Denied: Only Admin users can add new products.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          popularity: 50,
          stock: productData.stock || 0,
          maxStock: productData.maxStock || 100,
        }),
      });
      if (response.ok) {
        loadProducts();
        setShowAddModal(false);
      }
    } catch (error) {
      console.warn("Backend offline. Simulating product addition locally.");
      const newId = products.length
        ? Math.max(...products.map((p) => p.id)) + 1
        : 1;
      const newProduct = {
        id: newId,
        name: productData.name,
        category: productData.category,
        basePrice: productData.price,
        price: productData.price,
        popularity: 50,
        stock: productData.stock || 0,
        maxStock: productData.maxStock || 100,
        rating: 4.0,
        turnoverRate: 0.5,
      };
      setProducts([...products, newProduct]);
      setShowAddModal(false);
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    if (user?.role === "Guest") {
      setError("Permission Denied: Guest accounts cannot edit products.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        loadProducts();
        setEditingProduct(null);
      }
    } catch (error) {
      console.warn("Backend offline. Simulating product update locally.");
      setProducts(
        products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (user?.role === "Guest" || user?.role === "Employee") {
      setError("Permission Denied: Only Admin users can delete products.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this product? This will synchronize across all warehouses.",
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/products?id=${id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.warn("Backend offline. Simulating product deletion locally.");
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const response = await fetch("http://localhost:8080/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (response.ok) {
        setCartMessage({
          text: `${product.name} added to cart`,
          productId: product.id,
        });
      } else {
        throw new Error("non-OK response");
      }
    } catch (err) {
      console.warn(
        "Failed to add to cart via backend, falling back locally.",
        err,
      );
      // Persist cart locally so CartManagement can pick it up
      try {
        const raw = localStorage.getItem("cartItems");
        const existing = raw ? JSON.parse(raw) : [];
        const idx = existing.findIndex((i) => i.id === product.id);
        if (idx >= 0) {
          existing[idx].quantity = (existing[idx].quantity || 1) + 1;
        } else {
          existing.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: productImages[product.name] || "📦",
            category: product.category,
            stock: product.stock,
          });
        }
        localStorage.setItem("cartItems", JSON.stringify(existing));
        setCartMessage({
          text: `${product.name} added to local cart`,
          productId: product.id,
        });
      } catch (e) {
        console.warn("Failed to persist cart locally", e);
        setCartMessage({
          text: `${product.name} added to cart`,
          productId: product.id,
        });
      }
    }
    setTimeout(() => setCartMessage({ text: "", productId: null }), 2200);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter({ min: "", max: "" });
    setSelectedCategory("All");
  };

  const hasActiveFilters =
    searchTerm ||
    priceFilter.min ||
    priceFilter.max ||
    selectedCategory !== "All";

  // Check pricing adjustments relative to basePrice
  const getPricingBadge = (p) => {
    const base = p.basePrice || p.price;
    const diff = p.price - base;
    if (diff > 0.05) {
      return {
        text: `+${Math.round((diff / base) * 100)}% Surge`,
        style: "bg-red-50 text-red-700 border-red-200",
        desc: "High demand / peak hours pricing surge active.",
      };
    } else if (diff < -0.05) {
      return {
        text: `-${Math.round((Math.abs(diff) / base) * 100)}% Disc`,
        style: "bg-emerald-50 text-emerald-700 border-emerald-200",
        desc: "Overstock promo markdown / flash sale active.",
      };
    }
    return {
      text: "Normal Price",
      style: "bg-gray-100 text-gray-700 border-gray-200",
      desc: "Base catalog list price.",
    };
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
        <div className="card space-y-4 animate-pulse">
          <div className="h-12 bg-gray-100 rounded-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 bg-gray-100 rounded-12 mb-4"></div>
              <div className="h-6 bg-gray-100 rounded-8 w-24 mb-2"></div>
              <div className="h-8 bg-gray-100 rounded-8 w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Ensure we have a sortedProducts alias (used by the render) —
  // previously `sortedProducts` was referenced but not defined,
  // causing the product list to break. Use the already-filtered list.
  const sortedProducts = filteredProducts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Catalog & Pricing Control</h2>
            <p className="text-sm text-gray-500">
              Update listing specs, track ratings, and monitor demand-based
              pricing adjustments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            className="btn-tertiary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <div className="flex bg-gray-100 rounded-8 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-6 transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-1 text-primary"
                  : "text-gray-500"
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-6 transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-1 text-primary"
                  : "text-gray-500"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {user?.role === "Admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning animate-slideUp">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto font-bold text-xs uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Pricing Engine Rules Panel */}
      <div className="card bg-gradient-to-r from-burningFlame/5 via-truffleTrouble/5 to-slate-50 border border-border p-5 rounded-16 space-y-3 animate-slideUp">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary-hover animate-pulse" />
          <h3 className="text-sm font-black tracking-wide text-gray-800 uppercase">
            Active Dynamic Pricing Simulator
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-600">
          <div className="bg-white/80 p-3 rounded-12 border border-gray-100 space-y-1">
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Demand Surge Factors
            </p>
            <p className="text-gray-500 text-[11px]">
              Catalog items with popularity score &gt; 80 automatically undergo
              a +10% price markup. Items under 60 undergo -15% markdown for
              overstock clearance.
            </p>
          </div>
          <div className="bg-white/80 p-3 rounded-12 border border-gray-100 space-y-1">
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary-hover" />
              Seasonal Peak Hours
            </p>
            <p className="text-gray-500 text-[11px]">
              Holiday/Peak shopping window (6 PM – 10 PM) activates a global +5%
              seasonal markup multiplier calculated in real-time.
            </p>
          </div>
          <div className="bg-white/80 p-3 rounded-12 border border-gray-100 space-y-1">
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Heavy Discount Flash Sale
            </p>
            <p className="text-gray-500 text-[11px]">
              T-Shirt (ID #6) is designated as active flash sale anchor. Slashed
              price enjoys an automatic 40% discount off original base catalog
              specs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4 animate-slideUp">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="input text-sm font-semibold bg-gray-50"
            >
              <option value="name">Search by Name / Category</option>
              <option value="id">Search by Product ID</option>
              <option value="price">Search by Price</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                searchType === "id"
                  ? "Enter product ID number..."
                  : searchType === "price"
                    ? "Adjust price filters in sliders..."
                    : "Search inventory specifications..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 py-2.5 text-sm"
              disabled={searchType === "price"}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-8 text-xs font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-blueFantastic text-palladian shadow-1"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-bold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Price Ceiling:</span>
          </div>
          <div className="flex gap-2 items-center flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min Price"
                value={priceFilter.min}
                onChange={(e) =>
                  setPriceFilter({ ...priceFilter, min: e.target.value })
                }
                className="input w-28 pl-7 text-xs"
              />
            </div>
            <span className="text-gray-400 text-xs">to</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max Price"
                value={priceFilter.max}
                onChange={(e) =>
                  setPriceFilter({ ...priceFilter, max: e.target.value })
                }
                className="input w-28 pl-7 text-xs"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-xs font-bold"
            >
              <option value="category">Category Hub Order</option>
              <option value="price">Pricing: Low to High</option>
              <option value="popularity">Popularity (High to Low)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-tertiary flex items-center gap-2 py-1.5 text-xs font-bold"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="card text-center py-16 animate-fadeIn">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-md font-bold text-gray-900 mb-2">
            No matching products found
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Try clearing active category or price bounds filters
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary py-2 text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-6 animate-slideUp ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {sortedProducts.map((product, index) => {
            const m = getPricingBadge(product);
            const isAdjusted =
              Math.abs(product.price - (product.basePrice || product.price)) >
              0.05;

            return (
              <div
                key={product.id}
                className={`card border border-border flex flex-col justify-between group ${
                  viewMode === "list"
                    ? "md:flex-row items-center gap-6 p-4"
                    : "p-5"
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className={`relative ${viewMode === "list" ? "w-20 h-20 flex-shrink-0" : "w-full mb-4"}`}
                >
                  <div
                    className={`w-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/55 rounded-12 flex items-center justify-center ${
                      viewMode === "list" ? "h-20 text-3xl" : "h-36 text-5xl"
                    } group-hover:scale-105 transition-transform duration-300`}
                  >
                    {productImages[product.name] || "📦"}
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] bg-slate-900/10 text-slate-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm border border-slate-900/10">
                    {product.category}
                  </span>
                </div>

                <div
                  className={`flex-grow space-y-3 text-left ${viewMode === "list" ? "grid grid-cols-1 md:grid-cols-4 gap-4 items-center" : ""}`}
                >
                  {/* Name and specs */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>ID: #{product.id}</span>
                      <span className="flex items-center gap-0.5 font-bold text-yellow-600">
                        <Star className="w-3.5 h-3.5 fill-yellow-600" />
                        {product.rating ? product.rating.toFixed(1) : "4.0"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {isAdjusted && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{(product.basePrice || product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${m.style}`}
                        title={m.desc}
                      >
                        {m.text}
                      </span>
                    </div>
                  </div>

                  {/* Stock and velocity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                      <span>Inventory Level</span>
                      <span
                        className={
                          product.stock < 50
                            ? "text-error font-bold"
                            : "text-emerald-700 font-bold"
                        }
                      >
                        {product.stock} units
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${product.stock < 50 ? "bg-error" : "bg-success"}`}
                        style={{
                          width: `${Math.min((product.stock / (product.maxStock || 250)) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Turnover Velocity:{" "}
                      {(product.turnoverRate || 0.5).toFixed(2)}x
                    </p>
                  </div>

                  {/* Edit action buttons based on user role */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-2 py-2 px-3 text-xs font-bold btn-primary"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    {user?.role !== "Guest" && (
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 btn-tertiary flex items-center justify-center gap-2 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                    {user?.role === "Admin" && (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-error hover:bg-error/10 border border-transparent hover:border-error/20 rounded-8 transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {cartMessage.productId === product.id && (
                    <div className="text-sm text-success font-semibold mt-2">
                      {cartMessage.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Add New Product Specs
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddProductForm
              onSubmit={(data) => {
                handleAddProduct(data);
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Edit Product Specifications
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddProductForm
              product={editingProduct}
              onSubmit={(data) => {
                handleUpdateProduct(editingProduct.id, data);
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const AddProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    product
      ? {
          name: product.name,
          category: product.category,
          price: product.basePrice || product.price,
          stock: product.stock,
          maxStock: product.maxStock,
        }
      : {
          name: "",
          category: "Electronics",
          price: "",
          stock: "",
          maxStock: "",
        },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      maxStock: parseInt(formData.maxStock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Product Label Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Category Segment
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="input w-full text-sm font-semibold bg-gray-50"
        >
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
          Base Catalog Price (₹)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="input w-full text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
            Current Stock
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="input w-full text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
            Maximum Capacity
          </label>
          <input
            type="number"
            value={formData.maxStock}
            onChange={(e) =>
              setFormData({ ...formData, maxStock: e.target.value })
            }
            className="input w-full text-sm"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="btn-primary flex-1 py-2 text-sm font-bold"
        >
          {product ? "Update Product Specs" : "Add Product Specs"}
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

export default ProductCatalog;
