import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, User, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders, type Order } from '../services/db';
import { useToast } from '../components/Toast';
import '../styles/profile.css';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const allOrders = await getOrders();
        // Filter orders by email
        const userOrders = allOrders.filter(
          o => o.email.toLowerCase() === user.email.toLowerCase()
        );
        setOrders(userOrders);
      } catch (e) {
        console.error("Failed to load user orders", e);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  const handleLogoutClick = async () => {
    try {
      await logout();
      showToast("Logged out successfully.", "info");
      navigate('/');
    } catch (e) {
      showToast("Failed to log out.", "error");
    }
  };

  if (!user) {
    return (
      <div className="container text-center" style={{ padding: '120px 24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(30,63,32,0.05)',
          color: 'var(--color-primary)',
          marginBottom: '20px'
        }}>
          <User size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '16px' }}>
          Customer Dashboard
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
          Please sign in to view your orders timeline, shipping details, and account settings.
        </p>
        <Link to="/admin-login" className="btn btn-primary">
          Sign In / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-grid">
          
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-circle">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-username">{user.displayName}</h2>
            <p className="profile-email">{user.email}</p>
            
            <button onClick={handleLogoutClick} className="profile-logout-btn">
              Sign Out Account
            </button>
          </aside>

          {/* Main content Area: Orders Timeline list */}
          <main>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={22} style={{ color: 'var(--color-accent-dark)' }} /> Your Order History
            </h3>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--color-border)',
                  borderTop: '3px solid var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }} />
                <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Loading shipments...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <Package size={48} strokeWidth={1.5} style={{ color: 'var(--color-border)', marginBottom: '16px' }} />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '8px' }}>No Orders Found</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>You haven't placed any orders yet. Visit our store to find premium organic items!</p>
                <Link to="/shop" className="btn btn-primary">Go to Storefront</Link>
              </div>
            ) : (
              <div className="orders-history-container">
                {orders.map((order) => {
                  const isCancelled = order.status === 'cancelled';
                  
                  // Progress step status helpers
                  const step1Class = order.status !== 'cancelled' ? 'timeline-step completed' : 'timeline-step';
                  let step2Class = 'timeline-step';
                  let step3Class = 'timeline-step';
                  
                  if (!isCancelled) {
                    if (order.status === 'shipped') {
                      step2Class = 'timeline-step active';
                    } else if (order.status === 'delivered') {
                      step2Class = 'timeline-step completed';
                      step3Class = 'timeline-step completed';
                    } else {
                      // processing
                      step2Class = 'timeline-step active';
                    }
                  }

                  return (
                    <div className="order-history-card animated" key={order.id}>
                      {/* Card Header metadata */}
                      <div className="order-card-header">
                        <div className="order-header-meta">
                          <div>
                            <span className="meta-item-label">Order Number</span>
                            <span className="meta-item-value">{order.id}</span>
                          </div>
                          <div>
                            <span className="meta-item-label">Date Placed</span>
                            <span className="meta-item-value">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="meta-item-label">Total Amount</span>
                            <span className="meta-item-value">₹{order.total}</span>
                          </div>
                          <div>
                            <span className="meta-item-label">Payment</span>
                            <span className="meta-item-value" style={{ textTransform: 'uppercase' }}>
                              {order.paymentMethod} ({order.paymentStatus})
                            </span>
                          </div>
                        </div>
                        
                        <span className="badge" style={{
                          backgroundColor: isCancelled ? 'rgba(198,40,40,0.1)' : order.status === 'delivered' ? 'rgba(45,122,49,0.1)' : 'rgba(197,168,109,0.1)',
                          color: isCancelled ? 'var(--color-error)' : order.status === 'delivered' ? 'var(--color-success)' : 'var(--color-accent-dark)',
                          fontWeight: 700
                        }}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Card Body timeline & item list */}
                      <div className="order-card-body">
                        {/* Cancelled Alert Banner */}
                        {isCancelled ? (
                          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(198,40,40,0.05)', border: '1px solid rgba(198,40,40,0.15)', borderRadius: '8px', color: 'var(--color-error)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '16px' }}>
                            ⚠️ This order was cancelled. Feel free to contact customer care if this was an error.
                          </div>
                        ) : (
                          /* Order Tracking Timeline */
                          <div className="status-timeline">
                            <div className={step1Class}>
                              <div className="timeline-dot">✓</div>
                              <span className="timeline-label">Placed</span>
                            </div>
                            <div className={step2Class}>
                              <div className="timeline-dot">🚚</div>
                              <span className="timeline-label">Shipped</span>
                            </div>
                            <div className={step3Class}>
                              <div className="timeline-dot">🎁</div>
                              <span className="timeline-label">Delivered</span>
                            </div>
                          </div>
                        )}

                        {/* Order Items list */}
                        <div className="order-items-list">
                          {order.items.map((item, idx) => (
                            <div className="order-item-row" key={idx}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={item.image} alt={item.productName} className="order-item-img" />
                                <div>
                                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: 600 }}>{item.productName}</h4>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pack Size: {item.size} • Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
export default Profile;
