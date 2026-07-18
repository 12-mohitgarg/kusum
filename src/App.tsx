import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

export const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              
              {/* Header Navigation */}
              <Navbar onCartToggle={() => setIsCartOpen(true)} />
              
              {/* Shopping Cart Slider Drawer */}
              <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              
              {/* View Router */}
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Protected Admin Suite */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Fallback to home */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              {/* Footer navigation */}
              <Footer />

              {/* Floating WhatsApp chat widget */}
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                className="floating-whatsapp-widget animate-bounce"
                style={{
                  position: 'fixed',
                  bottom: '30px',
                  right: '110px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  zIndex: 9999,
                  cursor: 'pointer',
                  border: '2px solid #ffffff',
                  textDecoration: 'none'
                }}
                title="Chat on WhatsApp"
              >
                <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: 'currentColor' }}>
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.233-1.371a9.96 9.96 0 0 0 4.779 1.21h.005c5.506 0 9.99-4.479 9.991-9.986.002-2.67-1.037-5.18-2.93-7.073A9.925 9.925 0 0 0 12.012 2zm5.718 14.126c-.313.882-1.523 1.62-2.486 1.826-.653.14-1.512.249-4.387-.93-3.676-1.508-6.028-5.263-6.213-5.508-.184-.244-1.5-2.001-1.5-3.818 0-1.817.951-2.71 1.291-3.06.34-.35.74-.438.987-.438.243 0 .487.002.7.013.226.012.528-.087.828.636.31.745 1.057 2.585 1.152 2.776.096.191.16.414.032.67-.128.256-.192.414-.383.636-.191.222-.403.493-.574.67-.191.196-.39.41-.168.793.222.383.987 1.624 2.115 2.632 1.455 1.3 2.68 1.705 3.062 1.895.383.19.61.16.836-.096.226-.256.98-1.139 1.242-1.53.262-.39.525-.325.885-.19.36.134 2.292 1.08 2.688 1.278.396.198.66.297.755.46.096.163.096.942-.217 1.824z"/>
                </svg>
              </a>

            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
