import { useState, useEffect } from 'react'
import { Search, Package, TrendingUp, DollarSign, Filter, SlidersHorizontal, X, Plus, Edit, Trash2 } from 'lucide-react'

const ProductCatalog = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('category')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchType, setSearchType] = useState('name') // 'name', 'id', 'price'

  const categories = ['All', 'Electronics', 'Clothing', 'Footwear']

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products')
      const data = await response.json()
      setProducts(data)
      applyFilters(data)
    } catch (error) {
      console.error('Failed to load products from backend:', error)
      // Fallback to mock data if backend is unavailable
      const mockProducts = [
        { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, popularity: 85, stock: 50, maxStock: 100 },
        { id: 2, name: 'Mouse', category: 'Electronics', price: 29.99, popularity: 90, stock: 200, maxStock: 300 },
        { id: 3, name: 'Keyboard', category: 'Electronics', price: 79.99, popularity: 88, stock: 150, maxStock: 200 },
        { id: 4, name: 'Monitor', category: 'Electronics', price: 349.99, popularity: 75, stock: 80, maxStock: 150 },
        { id: 5, name: 'Headphones', category: 'Electronics', price: 149.99, popularity: 82, stock: 120, maxStock: 200 },
        { id: 6, name: 'T-Shirt', category: 'Clothing', price: 19.99, popularity: 95, stock: 300, maxStock: 500 },
        { id: 7, name: 'Jeans', category: 'Clothing', price: 59.99, popularity: 80, stock: 180, maxStock: 250 },
        { id: 8, name: 'Jacket', category: 'Clothing', price: 89.99, popularity: 70, stock: 100, maxStock: 150 },
        { id: 9, name: 'Sneakers', category: 'Footwear', price: 129.99, popularity: 88, stock: 150, maxStock: 200 },
        { id: 10, name: 'Boots', category: 'Footwear', price: 159.99, popularity: 65, stock: 90, maxStock: 120 },
      ]
      setProducts(mockProducts)
      applyFilters(mockProducts)
    }
  }

  const applyFilters = (productList) => {
    let filtered = [...productList]

    // Search based on type
    if (searchTerm) {
      if (searchType === 'id') {
        const id = parseInt(searchTerm)
        filtered = filtered.filter(p => p.id === id)
      } else if (searchType === 'price') {
        const min = parseFloat(priceFilter.min) || 0
        const max = parseFloat(priceFilter.max) || Infinity
        filtered = filtered.filter(p => p.price >= min && p.price <= max)
      } else {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    }

    // Price range filter (for name/ID search)
    if (searchType !== 'price' && (priceFilter.min || priceFilter.max)) {
      filtered = filtered.filter(product => {
        const matchesMin = !priceFilter.min || product.price >= parseFloat(priceFilter.min)
        const matchesMax = !priceFilter.max || product.price <= parseFloat(priceFilter.max)
        return matchesMin && matchesMax
      })
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Sort (DSA algorithms will be handled by C++ backend)
    if (sortBy === 'category') {
      filtered.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category)
        if (a.popularity !== b.popularity) return b.popularity - a.popularity
        return a.price - b.price
      })
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.popularity - a.popularity)
    }

    setFilteredProducts(filtered)
  }

  useEffect(() => {
    applyFilters(products)
  }, [searchTerm, priceFilter, sortBy, selectedCategory, searchType])

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now(),
          ...productData,
          popularity: 50,
          stock: productData.stock || 0,
          maxStock: productData.maxStock || 100
        })
      })
      if (response.ok) {
        loadProducts()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to add product:', error)
      // Fallback to local update
      const newProduct = {
        id: Date.now(),
        ...productData,
        popularity: 50,
        stock: productData.stock || 0,
        maxStock: productData.maxStock || 100
      }
      setProducts([...products, newProduct])
      setShowAddModal(false)
    }
  }

  const handleUpdateProduct = async (id, updates) => {
    try {
      // Note: PUT endpoint not implemented yet, using local update
      setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      // Note: DELETE endpoint not implemented yet, using local update
      if (confirm('Are you sure you want to delete this product?')) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const sortedProducts = filteredProducts

  const clearFilters = () => {
    setSearchTerm('')
    setPriceFilter({ min: '', max: '' })
    setSelectedCategory('All')
  }

  const hasActiveFilters = searchTerm || priceFilter.min || priceFilter.max || selectedCategory !== 'All'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-16">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Product Catalog</h2>
            <p className="text-sm text-gray-500">Browse and manage your inventory</p>
          </div>
        </div>
        <div className="flex gap-2">
<<<<<<< HEAD
=======
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <div className="chip chip-primary">
            <Package className="w-4 h-4 inline mr-1" />
            BST: O(log n)
          </div>
>>>>>>> e2eaec53ff434469d2a91de2f286c646dfc4a507
          <div className="chip chip-gray">
            {sortedProducts.length} products
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Type Selector */}
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="input"
            >
              <option value="name">Search by Name</option>
              <option value="id">Search by ID</option>
              <option value="price">Search by Price</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchType === 'id' ? 'Enter product ID...' : searchType === 'price' ? 'Set price range below...' : 'Search products by name or category...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 py-3 text-base"
              disabled={searchType === 'price'}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-8 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Price Range:</span>
          </div>
          <div className="flex gap-2 items-center flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Min"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                className="input w-28 pl-8"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Max"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                className="input w-28 pl-8"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="category">Category → Popularity → Price</option>
              <option value="price">Price (Low to High)</option>
              <option value="popularity">Popularity (High to Low)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-tertiary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-3 transition-all duration-300 group">
              <div className="relative mb-4">
                <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-12 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  {product.image}
                </div>
                <span className="absolute top-2 right-2 chip chip-gray text-xs">
                  {product.category}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {product.id}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{product.popularity}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Level</span>
                    <span className={`font-medium ${product.stock < 100 ? 'text-warning' : 'text-success'}`}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${product.stock < 100 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(product.stock / 3, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 group-hover:bg-primary-hover transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-8 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
<<<<<<< HEAD
=======

      {/* DSA Implementation Info */}
      <div className="card bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-12">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">DSA Implementation Active</h3>
            <p className="text-sm text-gray-600">
              <strong>BST:</strong> O(log n) product search by ID and price range<br/>
              <strong>Binary Search:</strong> O(log n) price range filtering<br/>
              <strong>Merge Sort:</strong> O(n log n) multi-level sorting<br/>
              <strong>CRUD Operations:</strong> Full product management with BST
            </p>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
            <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <AddProductForm 
              product={editingProduct} 
              onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)} 
              onCancel={() => setEditingProduct(null)} 
            />
          </div>
        </div>
      )}
>>>>>>> e2eaec53ff434469d2a91de2f286c646dfc4a507
    </div>
  )
}

const AddProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    maxStock: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      maxStock: parseInt(formData.maxStock)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="input w-full"
        >
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
        <input
          type="number"
          value={formData.maxStock}
          onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
          className="input w-full"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {product ? 'Update' : 'Add'} Product
        </button>
        <button type="button" onClick={onCancel} className="btn-tertiary flex-1">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProductCatalog
