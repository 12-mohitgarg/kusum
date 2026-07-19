import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, ShieldAlert, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

interface NavbarProps {
  onCartToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartToggle }) => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Search input state
  const [searchVal, setSearchVal] = useState('');

  // Dynamic Ticker Announcement State
  const [activeAnnounceIdx, setActiveAnnounceIdx] = useState(0);
  const ANNOUNCEMENTS = [
    "🌾 Traditional Vedic Bilona A2 Ghee - Cultured from Curd, Slow Cooked in Clay Pots 🌾",
    "🚚 Free Delivery on all Orders above ₹999 Across India! 🚚",
    "🛡️ 100% Lab Certified Pure Organic - Check Purity Reports Below 🛡️"
  ];

  useEffect(() => {
    const announceInterval = setInterval(() => {
      setActiveAnnounceIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(announceInterval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="header-container">
      {/* Announcement Bar */}
      <div className="announcement-bar" style={{ transition: 'all 0.5s ease', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ANNOUNCEMENTS[activeAnnounceIdx]}
      </div>

      {/* Main Navbar */}
      <nav className="navbar glass">
        {/* Mobile Hamburger menu */}
        <button 
          className="nav-btn menu-toggle" 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Left Links (Desktop) */}
        <div className="nav-group-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.88rem', borderRadius: '8px', background: 'var(--color-primary)', color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>
            <ShoppingBag size={15} /> Products
          </Link>
          
          <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-primary)' }} title="My Account">
            <User size={20} />
          </Link>
          
          <a href="/#bilona-process" className="nav-link" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'capitalize' }}>
            Our story
          </a>
        </div>

        {/* Center Logo */}
        <div className="nav-logo-center">
          <Link to="/" className="logo-link">
            <img src="/logo.jpg" alt="Amrit Bhoomi" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="nav-group-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search input bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchVal.trim()) {
                navigate(`/shop?search=${searchVal}`);
              }
            }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            className="navbar-search-form"
          >
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                width: '180px',
                height: '38px',
                padding: '0 32px 0 16px',
                borderRadius: '20px',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff'
              }}
            />
            <button 
              type="submit" 
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search size={14} />
            </button>
          </form>

          {user && user.isAdmin && (
            <Link to="/admin" className="nav-btn" title="Admin Portal">
              <ShieldAlert size={18} style={{ color: '#c5a86d' }} />
              <span style={{ fontSize: '11px', marginLeft: '4px', fontWeight: 600, color: '#c5a86d' }}>Admin</span>
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/profile" className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="My Account">
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Hi, {user.displayName.split(' ')[0]}
                </span>
              </Link>
            </div>
          ) : null}

          {/* Cart Bag button styled like the Kasutam bag */}
          <button 
            onClick={onCartToggle} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
            aria-label="Open cart"
          >
            <ShoppingBag size={18} /> {cartCount}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <Link to="/" className="logo-link" onClick={() => setMobileMenuOpen(false)}>
                <img src="/logo.jpg" alt="Amrit Bhoomi" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
              </Link>
              <button className="nav-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Shop Products
              </Link>
              {user && user.isAdmin && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#c5a86d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} /> Admin Dashboard
                </Link>
              )}
              {user ? (
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="btn btn-secondary" 
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  Logout
                </button>
              ) : (
                <Link to="/admin-login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ marginTop: '20px', textAlign: 'center' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Navbar;
