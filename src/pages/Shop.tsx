import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getProducts, type Product } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import '../styles/shop.css';

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  // Read URL category filter if any
  const categoryFilter = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        console.error("Failed to load products", e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Filter and sort items when query/category/sorting shifts
  useEffect(() => {
    let result = [...products];

    // 1. Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 2. Search Filter
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }

    // 3. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.options[0]?.price || 0) - (b.options[0]?.price || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.options[0]?.price || 0) - (a.options[0]?.price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [products, categoryFilter, searchQuery, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSearchParams(cat === 'all' ? {} : { category: cat });
  };

  return (
    <div className="shop-page">
      <div className="container">
        {/* Page Header */}
        <div className="shop-header">
          <h1 className="shop-title">Amrit Bhoomi Farm Store</h1>
          <p className="shop-subtitle">Pure, unrefined, and traditionally cooked grocery essentials for your family</p>
        </div>

        {/* Toolbar: Category tabs + Search + Sort */}
        <div className="shop-toolbar glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div className="category-tabs">
            {['all', 'dairy', 'ghee', 'oils', 'honey', 'pickles'].map((cat) => (
              <button
                key={cat}
                className={`category-tab ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === 'all' ? 'All Products' : cat === 'dairy' ? 'Fresh Dairy' : cat === 'ghee' ? 'Bilona Ghee' : cat === 'oils' ? 'Wood-Pressed Oils' : cat === 'honey' ? 'Wild Honey' : 'Pickles'}
              </button>
            ))}
          </div>

          <div className="search-sort-group">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search products..."
                className="search-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Price Sort Selection */}
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Harvesting products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '8px' }}>No Products Found</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Try clearing your search query or choosing another category.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Shop;
