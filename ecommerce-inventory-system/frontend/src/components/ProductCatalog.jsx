import { useState } from 'react'
import { Search, Package, TrendingUp, DollarSign, Filter, SlidersHorizontal, X } from 'lucide-react'

const ProductCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('category')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const products = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, popularity: 85, stock: 50, image: '💻' },
    { id: 2, name: 'Mouse', category: 'Electronics', price: 29.99, popularity: 90, stock: 200, image: '🖱️' },
    { id: 3, name: 'Keyboard', category: 'Electronics', price: 79.99, popularity: 88, stock: 150, image: '⌨️' },
    { id: 4, name: 'Monitor', category: 'Electronics', price: 349.99, popularity: 75, stock: 80, image: '🖥️' },
    { id: 5, name: 'Headphones', category: 'Electronics', price: 149.99, popularity: 82, stock: 120, image: '🎧' },
    { id: 6, name: 'T-Shirt', category: 'Clothing', price: 19.99, popularity: 95, stock: 300, image: '👕' },
    { id: 7, name: 'Jeans', category: 'Clothing', price: 59.99, popularity: 80, stock: 180, image: '👖' },
    { id: 8, name: 'Jacket', category: 'Clothing', price: 89.99, popularity: 70, stock: 100, image: '🧥' },
    { id: 9, name: 'Sneakers', category: 'Footwear', price: 129.99, popularity: 88, stock: 150, image: '👟' },
    { id: 10, name: 'Boots', category: 'Footwear', price: 159.99, popularity: 65, stock: 90, image: '👢' },
  ]

  const categories = ['All', 'Electronics', 'Clothing', 'Footwear']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMinPrice = !priceFilter.min || product.price >= parseFloat(priceFilter.min)
    const matchesMaxPrice = !priceFilter.max || product.price <= parseFloat(priceFilter.max)
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'category') {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      if (a.popularity !== b.popularity) return b.popularity - a.popularity
      return a.price - b.price
    }
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'popularity') return b.popularity - a.popularity
    return 0
  })

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
          <div className="chip chip-primary">
            <Package className="w-4 h-4 inline mr-1" />
            BST: O(log n)
          </div>
          <div className="chip chip-gray">
            {sortedProducts.length} products
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 py-3 text-base"
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

                <button className="btn-primary w-full flex items-center justify-center gap-2 group-hover:bg-primary-hover transition-colors">
                  <Package className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Binary Search Info */}
      <div className="card bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-12">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Price Range Search (Binary Search)</h3>
            <p className="text-sm text-gray-600">
              Products are sorted by price for efficient binary search operations with O(log n) complexity. 
              Set min/max price filters to see the binary search algorithm in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCatalog
