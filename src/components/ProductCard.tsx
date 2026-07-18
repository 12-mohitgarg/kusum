import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product, ProductOption } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [isSubSelected, setIsSubSelected] = useState(false);
  // Default to first price option (e.g. 500ml)
  const [selectedOption, setSelectedOption] = useState<ProductOption>(
    product.options[0] || { size: "Default", price: 0, stock: 0 }
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation to detail page
    
    if (selectedOption.stock <= 0) {
      showToast(`${product.name} (${selectedOption.size}) is currently out of stock.`, "error");
      return;
    }

    const price = isSubSelected ? Math.round(selectedOption.price * 0.85) : selectedOption.price;
    addToCart(product, selectedOption.size, price, 1, isSubSelected);
    showToast(`Added ${product.name} (${selectedOption.size}) ${isSubSelected ? 'Subscription' : 'One-time'} to your bag! 🌾`, "success");
  };

  return (
    <div className="product-card animated">
      <Link to={`/product/${product.id}`} style={{ display: 'block' }}>
        {/* Card Image */}
        <div className="card-img-wrapper">
          <img 
            src={product.image} 
            alt={product.name} 
            className="card-img"
            loading="lazy"
          />
          {product.featured && (
            <span className="featured-badge">Featured</span>
          )}
          <span className="brand-tag-badge">
            {(() => {
              switch (product.category) {
                case 'ghee': return 'Pure';
                case 'dairy': return 'Fresh';
                case 'oils': return 'Natural';
                case 'honey': return 'Wholesome';
                default: return 'Wholesome';
              }
            })()}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <span className="card-category">{product.category}</span>
          <h3 className="card-title">{product.name}</h3>
          
          {/* Rating */}
          <div className="card-rating">
            <Star size={14} fill="#ffb100" stroke="none" className="star-icon" />
            <strong style={{ color: '#1e3f20' }}>{product.rating}</strong>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              ({product.reviewsCount} reviews)
            </span>
          </div>

          <p className="card-desc">{product.description}</p>
        </div>
      </Link>

      <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column' }}>
        {/* Weight Options */}
        {product.options.length > 1 && (
          <div className="card-size-selector">
            {product.options.map((opt) => (
              <button
                key={opt.size}
                className={`size-pill ${selectedOption.size === opt.size ? 'active' : ''}`}
                onClick={() => setSelectedOption(opt)}
              >
                {opt.size}
              </button>
            ))}
          </div>
        )}

        {/* Purchase Type Selector */}
        <div className="purchase-type-selector" style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-main)' }}>
            <input 
              type="radio" 
              name={`purchase-type-${product.id}`}
              checked={!isSubSelected}
              onChange={() => setIsSubSelected(false)}
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span>One-time Purchase</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            <input 
              type="radio" 
              name={`purchase-type-${product.id}`}
              checked={isSubSelected}
              onChange={() => setIsSubSelected(true)}
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span>Subscribe & Save (15% Off)</span>
          </label>
        </div>

        {/* Footer actions */}
        <div className="card-footer">
          <div className="card-price-group">
            <span className="card-price-label">{isSubSelected ? 'Sub Price' : 'Price'}</span>
            <span className="card-price">₹{isSubSelected ? Math.round(selectedOption.price * 0.85) : selectedOption.price}</span>
          </div>

          {selectedOption.stock > 0 ? (
            <button 
              onClick={handleAddToCart}
              className="card-add-btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Add to Bag"
            >
              <ShoppingCart size={14} /> Add
            </button>
          ) : (
            <button 
              className="card-add-btn" 
              style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
              disabled
            >
              Out of stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
