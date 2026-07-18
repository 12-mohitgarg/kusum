import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/cart.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    freeShippingThreshold 
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const shippingProgressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <>
      {/* Overlay Background */}
      {isOpen && <div className="cart-drawer-overlay" onClick={onClose} />}

      {/* Slide-out Panel */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            <ShoppingBag size={22} style={{ color: 'var(--color-accent-dark)' }} />
            Your Shopping Bag
          </h3>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        {cartItems.length > 0 && (
          <div className="shipping-goal-container">
            {amountToFreeShipping > 0 ? (
              <p className="shipping-goal-text">
                Add <strong>₹{amountToFreeShipping}</strong> more for <strong>FREE shipping!</strong>
              </p>
            ) : (
              <p className="shipping-goal-text" style={{ color: 'var(--color-success)' }}>
                🎉 You qualify for <strong>FREE shipping!</strong>
              </p>
            )}
            <div className="shipping-progress-bg">
              <div 
                className="shipping-progress-fill" 
                style={{ width: `${shippingProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Items list */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--color-border)' }} />
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Your bag is empty</p>
              <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                Explore our pure A2 Bilona Ghee and organic cold-pressed oils.
              </p>
              <button 
                onClick={() => { onClose(); navigate('/shop'); }} 
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={`${item.product.id}-${item.size}-${item.isSubscription ? 'sub' : 'one'}`}>
                <div className="cart-item-img-wrapper">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="cart-item-img"
                  />
                </div>

                <div className="cart-item-info">
                  <div>
                    <h4 className="cart-item-title">{item.product.name}</h4>
                    <p className="cart-item-meta">Size: {item.size}</p>
                    {item.isSubscription && (
                      <span style={{ display: 'inline-block', fontSize: '0.72rem', backgroundColor: 'rgba(35, 63, 31, 0.1)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>
                        🔄 Deliver Monthly (15% Off)
                      </span>
                    )}
                  </div>

                  <div className="cart-item-footer">
                    <div className="qty-counter">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1, item.isSubscription)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1, item.isSubscription)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="cart-item-price">₹{item.price * item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.size, item.isSubscription)}
                        style={{ color: 'var(--color-error)', display: 'flex' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing Block */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="summary-row">
              <span>Subtotal:</span>
              <strong style={{ color: 'var(--color-primary)' }}>₹{subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{subtotal >= freeShippingThreshold ? subtotal : subtotal + 99}</span>
            </div>
            
            <button 
              onClick={handleCheckoutClick} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '12px' }}
            >
              Proceed to Secure Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
export default CartDrawer;
