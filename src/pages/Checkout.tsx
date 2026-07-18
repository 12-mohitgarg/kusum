import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Tag, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { placeOrder } from '../services/db';
import { initializeRazorpayPayment } from '../services/payment';
import '../styles/checkout.css';

export const Checkout: React.FC = () => {
  const { 
    cartItems, 
    subtotal, 
    discountAmount, 
    shippingFee, 
    totalAmount, 
    coupon, 
    applyCouponCode, 
    removeCoupon,
    clearCart
  } = useCart();
  
  const { user } = useAuth();
  const { showToast } = useToast();

  // Auth Gate states
  const { login, register } = useAuth();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Sync user profile fields once authenticated
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthSubmitting(true);
    try {
      if (authTab === 'login') {
        await login(authEmail, authPassword);
        showToast("Welcome back! Continuing to checkout.", "success");
      } else {
        if (!authName) {
          showToast("Please enter your name.", "error");
          setAuthSubmitting(false);
          return;
        }
        await register(authEmail, authPassword, authName);
        showToast("Account created successfully! Continuing to checkout.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Authentication failed. Please check details.", "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Form fields
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Checkout loading
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    const result = await applyCouponCode(couponInput);
    setCouponLoading(false);

    if (result.success) {
      showToast(result.message, "success");
      setCouponInput('');
    } else {
      showToast(result.message, "error");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast("Your cart is empty. Add products to order.", "error");
      return;
    }

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      showToast("Please fill in all shipping details.", "error");
      return;
    }

    setCheckingOut(true);

    const orderPayload = {
      customerName: name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        image: item.product.image,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      discount: discountAmount,
      total: totalAmount,
      couponCode: coupon?.code || undefined,
      paymentMethod,
      paymentStatus: (paymentMethod === 'cod' ? 'pending' : 'paid') as any
    };

    try {
      if (paymentMethod === 'cod') {
        const order = await placeOrder(orderPayload);
        setOrderSuccess(order);
        clearCart();
        showToast("Order placed successfully via Cash on Delivery!", "success");
      } else {
        // Razorpay payment integration
        const amountInPaise = totalAmount * 100;
        
        const paymentResult = await initializeRazorpayPayment({
          amount: amountInPaise,
          currency: "INR",
          name: "Amrit Bhoomi Organic",
          description: `Order checkout subtotal ₹${totalAmount}`,
          prefill: {
            name,
            email,
            contact: phone
          },
          handler: async (resp) => {
            const paidOrderPayload = {
              ...orderPayload,
              paymentId: resp.razorpay_payment_id,
              paymentStatus: 'paid' as any
            };
            const order = await placeOrder(paidOrderPayload);
            setOrderSuccess(order);
            clearCart();
            showToast("Payment successful! Order processed.", "success");
          },
          modal: {
            ondismiss: () => {
              showToast("Payment cancelled. Please try again.", "info");
              setCheckingOut(false);
            }
          }
        });

        if (!paymentResult.success && paymentResult.error) {
          // If payment window itself failed to launch
          showToast(paymentResult.error, "error");
          setCheckingOut(false);
        }
      }
    } catch (e: any) {
      console.error("Fulfill Order failed", e);
      showToast(e.message || "Something went wrong. Try again.", "error");
      setCheckingOut(false);
    }
  };

  // Success view overlay
  if (orderSuccess) {
    return (
      <div className="success-overlay">
        <div className="success-card">
          <div className="success-icon-badge">
            <ShieldCheck size={48} />
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '8px' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Thank you for shopping with Amrit Bhoomi. We are preparing your order.
          </p>

          <div style={{ backgroundColor: '#fcfbf9', border: '1px solid #e3decb', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6e6e6e' }}>Order ID:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{orderSuccess.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6e6e6e' }}>Payment Status:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: orderSuccess.paymentStatus === 'paid' ? 'var(--color-success)' : '#c5a86d' }}>
                {orderSuccess.paymentStatus.toUpperCase()} ({orderSuccess.paymentMethod.toUpperCase()})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6e6e6e' }}>Shipping Address:</span>
              <span style={{ fontSize: '0.9rem', color: '#2b2b2b', textAlign: 'right', maxWidth: '240px' }}>
                {orderSuccess.address}, {orderSuccess.city}, {orderSuccess.state} - {orderSuccess.pincode}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: '#6e6e6e' }}>Total Amount Paid:</span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>₹{orderSuccess.total}</strong>
            </div>
          </div>

          <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 32px' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '40px 24px' }}>
          <div className="auth-gate-wrapper glass" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', minHeight: '520px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Visual Panel */}
            <div className="auth-gate-info-panel" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)', padding: '48px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
              <div style={{ fontSize: '42px' }}>🌾</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', lineHeight: '1.2' }}>Amrit Bhoomi Organic Family</h2>
              <p style={{ fontSize: '0.98rem', opacity: 0.9, lineHeight: 1.6 }}>
                You are just one step away from completing your pure organic purchase. Sign in or register to securely finalize checkout, track shipments, and receive reward points.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Direct Farm-to-Home Delivery Tracking</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>Safe & Encrypted Razorpay Gateway</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span>10% Cashback on first ghee subscription</span>
                </div>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="auth-gate-form-panel" style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px' }}>
              
              {/* Tab Toggles */}
              <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', gap: '24px' }}>
                <button 
                  type="button"
                  onClick={() => setAuthTab('login')}
                  style={{
                    paddingBottom: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: authTab === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: authTab === 'login' ? '3px solid var(--color-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthTab('register')}
                  style={{
                    paddingBottom: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: authTab === 'register' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: authTab === 'register' ? '3px solid var(--color-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Register
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {authTab === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Rahul Sharma"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. rahul@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '14px', width: '100%', marginTop: '10px' }}
                  disabled={authSubmitting}
                >
                  {authSubmitting ? 'Processing...' : authTab === 'login' ? 'Access Account' : 'Create Account'}
                </button>
              </form>

              {authTab === 'login' && (
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  For Demo Admin Access use: <strong style={{ color: 'var(--color-primary)' }}>admin@amritbhoomi.com / admin</strong>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Store</Link>
          <ChevronRight size={14} />
          <span>Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Column 1: Billing Form */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              <Truck size={20} style={{ color: 'var(--color-accent-dark)' }} /> Shipping Details
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Shipping Address *</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House No. / Street / Area"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ width: '50%' }}>
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                className="form-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit Pincode"
                maxLength={6}
                required
              />
            </div>

            {/* Payment Method Option Selector */}
            <h2 className="checkout-section-title" style={{ marginTop: '40px' }}>
              <CreditCard size={20} style={{ color: 'var(--color-accent-dark)' }} /> Secure Payments
            </h2>

            <div className="payment-methods">
              <div 
                className={`payment-method-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <span className="payment-option-title">Razorpay Secure Payments</span>
                  <p className="payment-option-desc">UPI, Netbanking, Credit/Debit cards (instant confirmation)</p>
                </div>
              </div>

              <div 
                className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <span className="payment-option-title">Cash on Delivery (COD)</span>
                  <p className="payment-option-desc">Pay with cash upon package receipt (extra delivery transit time)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Checkout Summary sidebar */}
          <div className="checkout-card order-summary-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} style={{ color: 'var(--color-accent-dark)' }} /> Order Summary
            </h3>

            {/* Item list */}
            <div className="summary-items-list">
              {cartItems.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No items in checkout.</p>
              ) : (
                cartItems.map((item) => (
                  <div className="summary-item" key={`${item.product.id}-${item.size}`}>
                    <img src={item.product.image} alt={item.product.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <h4 className="summary-item-name">{item.product.name}</h4>
                      <span className="summary-item-meta">Size: {item.size} • Qty: {item.quantity}</span>
                    </div>
                    <span className="summary-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            {/* Coupon codes panel */}
            <div className="coupon-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Discount Coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!coupon}
                style={{ flex: 1, textTransform: 'uppercase' }}
              />
              {coupon ? (
                <button type="button" onClick={removeCoupon} className="btn btn-secondary" style={{ padding: '10px 16px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                  Remove
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleApplyCoupon} 
                  disabled={couponLoading}
                  className="coupon-btn"
                >
                  Apply
                </button>
              )}
            </div>

            {coupon && (
              <div className="applied-coupon-tag">
                <Tag size={12} />
                <span>{coupon.code} Applied (Discount ₹{discountAmount})</span>
              </div>
            )}

            {/* Price Line Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6e6e6e' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-success)' }}>
                  <span>Discount:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6e6e6e' }}>
                <span>Shipping Fee:</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '24px' }}>
              <span>Total Amount:</span>
              <span>₹{totalAmount}</span>
            </div>

            {/* Secure payment button */}
            <button
              type="submit"
              disabled={checkingOut || cartItems.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
            >
              {checkingOut 
                ? "Processing Checkout..." 
                : paymentMethod === 'razorpay' 
                  ? "Pay via Razorpay Secure" 
                  : "Place COD Order"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Checkout;
