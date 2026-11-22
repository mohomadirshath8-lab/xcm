import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';
import { api, type Product, type Category } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';
import { ProductCard } from '../components/ProductCard.js';

export const CatalogPage: React.FC = () => {
  const { pageParams, navigate, categories } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCatId, setSelectedCatId] = useState<string>(pageParams?.categoryId || 'all');
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>(pageParams?.subcategoryId || 'all');
  const [search, setSearch] = useState<string>(pageParams?.search || '');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (pageParams?.categoryId) setSelectedCatId(pageParams.categoryId);
    if (pageParams?.subcategoryId) setSelectedSubcatId(pageParams.subcategoryId);
    if (pageParams?.search !== undefined) setSearch(pageParams.search);
  }, [pageParams]);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCatId !== 'all') params.categoryId = selectedCatId;
        if (selectedSubcatId !== 'all') params.subcategoryId = selectedSubcatId;
        if (search.trim()) params.search = search.trim();
        if (sortBy) params.sortBy = sortBy;

        const data = await api.getProducts(params);
        let filtered = data;
        if (inStockOnly) {
          filtered = filtered.filter((p) => p.stockQuantity > 0);
        }
        setProducts(filtered);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
  }, [selectedCatId, selectedSubcatId, search, sortBy, inStockOnly]);

  const activeCategory = categories.find((c) => c.id === selectedCatId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <button onClick={() => navigate('home')} className="hover:text-white transition-colors">
              Home
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-neutral-200">
              {activeCategory ? activeCategory.name : 'All Products'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {activeCategory ? activeCategory.name : 'Digital Products & Accounts'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            {activeCategory
              ? activeCategory.description
              : 'Browse our full marketplace of gaming accounts, Discord services, web development, and digital assets.'}
          </p>
        </div>

        {/* Results count */}
        <div className="text-xs text-neutral-400">
          Showing <span className="font-semibold text-white">{products.length}</span> verified items
        </div>
      </div>

      {/* Main Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800/60 no-scrollbar">
        <button
          onClick={() => {
            setSelectedCatId('all');
            setSelectedSubcatId('all');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCatId === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCatId(cat.id);
              setSelectedSubcatId('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCatId === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategory Filter Pills (If a category is selected) */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-neutral-500 font-medium whitespace-nowrap shrink-0">Subcategories:</span>
          <button
            onClick={() => setSelectedSubcatId('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedSubcatId === 'all'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All {activeCategory.name}
          </button>
          {activeCategory.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcatId(sub.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSubcatId === sub.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within listing..."
            className="w-full pl-9 pr-8 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Stock Filter */}
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-800 accent-amber-500 focus:ring-0"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-neutral-900/40 border border-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-neutral-800/60 bg-neutral-900/30">
          <Tag className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No products found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            We couldn't find any listings matching your current filter criteria. Try resetting your search or exploring other categories.
          </p>
          <button
            onClick={() => {
              setSelectedCatId('all');
              setSelectedSubcatId('all');
              setSearch('');
            }}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
