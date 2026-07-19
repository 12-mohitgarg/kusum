import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Sparkles,
  Search
} from 'lucide-react';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getOrders, 
  updateOrderStatus, 
  updateOrderPaymentStatus,
  getCoupons, 
  addCoupon, 
  deleteCoupon,
  clearAllProducts,
  seed200Products,
  type Product,
  type ProductOption,
  type Order,
  type Coupon
} from '../services/db';
import { uploadImageToCloudinary } from '../config/cloudinary';
import { useToast } from '../components/Toast';
import '../styles/admin.css';

export const Admin: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons'>('dashboard');

  // DB Data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Products search & pagination states
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodCurrentPage, setProdCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal controls
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states - Products
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'ghee' | 'oils' | 'honey' | 'pickles' | 'dairy'>('ghee');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDetails, setProdDetails] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [prodBenefits, setProdBenefits] = useState<string[]>(['']);
  const [prodOptions, setProdOptions] = useState<ProductOption[]>([{ size: '1 Liter', price: 1500, stock: 50 }]);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleWipe = async () => {
    if (!window.confirm("Are you sure you want to clear all products from the database?")) return;
    setLoading(true);
    try {
      const success = await clearAllProducts();
      if (success) {
        showToast("All products wiped successfully. 🗑️", "success");
        await fetchData();
      } else {
        showToast("Failed to wipe products.", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Error clearing products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("Are you sure you want to wipe the database and seed 200 Kasutam-style products? This may take a moment...")) return;
    setLoading(true);
    try {
      const success = await seed200Products();
      if (success) {
        showToast("Successfully seeded 200 products across all categories! ✨", "success");
        await fetchData();
      } else {
        showToast("Seeding failed.", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Error seeding products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Form states - Coupons
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(10);
  const [newMinPurchase, setNewMinPurchase] = useState(500);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prods = await getProducts();
      const ords = await getOrders();
      const cōps = await getCoupons();
      setProducts(prods);
      setOrders(ords);
      setCoupons(cōps);
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setProdImage(url);
      setProdGallery([url]); // default gallery is the main image
      showToast("Image uploaded successfully! 📷", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload image.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  // Product save/update handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodImage || prodOptions.length === 0) {
      showToast("Please fill in name, upload image and add at least one size option.", "error");
      return;
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      description: prodDesc,
      details: prodDetails,
      image: prodImage,
      gallery: prodGallery,
      benefits: prodBenefits.filter(b => b.trim() !== ''),
      options: prodOptions,
      featured: prodFeatured
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast("Product updated successfully!", "success");
      } else {
        await addProduct(payload);
        showToast("Product added successfully!", "success");
      }
      setIsProdModalOpen(false);
      resetProductForm();
      fetchData();
    } catch (err) {
      showToast("Failed to save product.", "error");
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdDesc(prod.description);
    setProdDetails(prod.details);
    setProdImage(prod.image);
    setProdGallery(prod.gallery);
    setProdBenefits(prod.benefits.length > 0 ? prod.benefits : ['']);
    setProdOptions(prod.options);
    setProdFeatured(prod.featured);
    setIsProdModalOpen(true);
  };

  const handleDeleteProductClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      showToast("Product deleted.", "success");
      fetchData();
    } catch (e) {
      showToast("Failed to delete product.", "error");
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('ghee');
    setProdDesc('');
    setProdDetails('');
    setProdImage('');
    setProdGallery([]);
    setProdBenefits(['']);
    setProdOptions([{ size: '1 Liter', price: 1500, stock: 50 }]);
    setProdFeatured(false);
  };

  // Order status controls
  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}!`, "success");
      fetchData();
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      await updateOrderPaymentStatus(orderId, paymentStatus);
      showToast(`Order payment status updated to ${paymentStatus}!`, "success");
      fetchData();
    } catch (e) {
      showToast("Failed to update payment status", "error");
    }
  };

  // Coupon actions
  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    try {
      await addCoupon({
        code: newCode.trim().toUpperCase(),
        type: newType,
        value: newValue,
        minPurchase: newMinPurchase,
        active: true
      });
      showToast("Discount coupon added!", "success");
      setNewCode('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to add coupon.", "error");
    }
  };

  const handleDeleteCouponClick = async (code: string) => {
    try {
      await deleteCoupon(code);
      showToast("Coupon deleted.", "success");
      fetchData();
    } catch (e) {
      showToast("Failed to delete coupon.", "error");
    }
  };

  // Calculation utilities
  const totalSales = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  const filteredProducts = products.filter(prod => {
    const q = prodSearchQuery.toLowerCase();
    return prod.name.toLowerCase().includes(q) || prod.category.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (prodCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Page Header */}
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Amrit Bhoomi Administrative Suite</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Manage products, inspect order fulfillment, and adjust coupon lists.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            View Storefront
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Harvesting Admin Database...</p>
          </div>
        ) : (
          <div className="admin-layout">
            {/* Sidebar Controls */}
            <aside className="admin-sidebar">
              <button 
                className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} /> Summary Dashboard
              </button>
              <button 
                className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={18} /> Manage Products
              </button>
              <button 
                className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ClipboardList size={18} /> Shipments & Orders
              </button>
              <button 
                className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <Ticket size={18} /> Discount Coupons
              </button>
            </aside>

            {/* Right main panel display */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Tab 1: Dashboard Panel */}
              {activeTab === 'dashboard' && (
                <>
                  <div className="admin-metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon-wrapper">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <span className="metric-title">Gross Paid Sales</span>
                        <div className="metric-value">₹{totalSales.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper">
                        <ClipboardList size={24} />
                      </div>
                      <div>
                        <span className="metric-title">Active Orders</span>
                        <div className="metric-value">{pendingOrders.length} / {orders.length}</div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <span className="metric-title">Total Products</span>
                        <div className="metric-value">{products.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="admin-content-card">
                    <h3 className="card-title-sub" style={{ marginBottom: '20px' }}>Pending Order Fulfillment</h3>
                    <div className="admin-table-wrapper">
                      {pendingOrders.length === 0 ? (
                        <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>All orders are fulfilled!</p>
                      ) : (
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Total Amount</th>
                              <th>Payment Status</th>
                              <th>Fulfillment</th>
                              <th>Fulfill Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingOrders.slice(0, 5).map((order) => (
                              <tr key={order.id}>
                                <td><strong>{order.id}</strong></td>
                                <td>{order.customerName}</td>
                                <td>₹{order.total}</td>
                                <td>
                                  <span className="badge" style={{ 
                                    backgroundColor: order.paymentStatus === 'paid' ? 'rgba(45,122,49,0.1)' : 'rgba(197,168,109,0.1)',
                                    color: order.paymentStatus === 'paid' ? 'var(--color-success)' : 'var(--color-accent-dark)'
                                  }}>
                                    {order.paymentStatus}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge" style={{ 
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    color: 'var(--color-primary-dark)'
                                  }}>
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                      className="btn btn-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                    >
                                      Ship
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                      className="btn btn-primary" 
                                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                    >
                                      Deliver
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Products panel */}
              {activeTab === 'products' && (
                <div className="admin-content-card">
                  <div className="card-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 className="card-title-sub" style={{ marginRight: 'auto' }}>Products Inventory</h3>
                    <button 
                      onClick={handleSeed}
                      className="btn btn-secondary"
                      style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#e3decb', color: 'var(--color-primary-dark)', borderColor: '#e3decb', fontWeight: 600, padding: '8px 16px' }}
                      disabled={loading}
                    >
                      ✨ Seed 200 Products
                    </button>
                    <button 
                      onClick={handleWipe}
                      className="btn btn-secondary"
                      style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#fcdcd4', color: '#b32e2e', borderColor: '#fcdcd4', fontWeight: 600, padding: '8px 16px' }}
                      disabled={loading}
                    >
                      🗑️ Wipe All
                    </button>
                    <button 
                      onClick={() => { resetProductForm(); setIsProdModalOpen(true); }}
                      className="btn btn-primary"
                      style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                      disabled={loading}
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  {/* Search and Pagination Controls */}
                  <div className="admin-search-pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
                      <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search products by name or category..."
                        className="form-input"
                        style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
                        value={prodSearchQuery}
                        onChange={(e) => {
                          setProdSearchQuery(e.target.value);
                          setProdCurrentPage(1);
                        }}
                      />
                    </div>
                    
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          disabled={prodCurrentPage === 1}
                          onClick={() => setProdCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                          Previous
                        </button>
                        <span style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                          Page <strong>{prodCurrentPage}</strong> of <strong>{totalPages}</strong> (Total: {filteredProducts.length})
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          disabled={prodCurrentPage === totalPages}
                          onClick={() => setProdCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Pricing Options</th>
                          <th>Rating</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((prod) => (
                          <tr key={prod.id}>
                            <td>
                              <img src={prod.image} alt={prod.name} className="admin-table-img" />
                            </td>
                            <td>
                              <strong>{prod.name}</strong>
                              {prod.featured && <span style={{ marginLeft: '8px', fontSize: '9px', backgroundColor: 'var(--color-accent)', color: 'var(--color-primary-dark)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Featured</span>}
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{prod.category}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {prod.options.map((opt, i) => (
                                  <span key={i} style={{ fontSize: '0.8rem' }}>
                                    {opt.size}: <strong>₹{opt.price}</strong> (Stock: {opt.stock})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>★ {prod.rating} ({prod.reviewsCount} reviews)</td>
                            <td>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                  onClick={() => handleEditProductClick(prod)}
                                  style={{ color: 'var(--color-primary)' }}
                                  title="Edit"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProductClick(prod.id)}
                                  style={{ color: 'var(--color-error)' }}
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Orders List tab */}
              {activeTab === 'orders' && (
                <div className="admin-content-card">
                  <h3 className="card-title-sub" style={{ marginBottom: '24px' }}>All Store Orders</h3>
                  
                  <div className="admin-table-wrapper">
                    {orders.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No customer orders placed yet.</p>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Items Purchased</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Fulfillment Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td><strong>{order.id}</strong></td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600 }}>{order.customerName}</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.phone}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.city}, {order.state}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {order.items.map((item, idx) => (
                                    <span key={idx} style={{ fontSize: '0.8rem' }}>
                                      {item.productName} ({item.size}) × {item.quantity}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ fontWeight: 600 }}>₹{order.total}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span className="badge" style={{ 
                                    backgroundColor: order.paymentStatus === 'paid' ? 'rgba(45,122,49,0.1)' : 'rgba(197,168,109,0.1)',
                                    color: order.paymentStatus === 'paid' ? 'var(--color-success)' : 'var(--color-accent-dark)'
                                  }}>
                                    {order.paymentStatus}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                    {order.paymentMethod}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="badge" style={{ 
                                  backgroundColor: order.status === 'delivered' ? 'rgba(45,122,49,0.1)' : order.status === 'cancelled' ? 'rgba(198,40,40,0.1)' : 'rgba(0,0,0,0.05)',
                                  color: order.status === 'delivered' ? 'var(--color-success)' : order.status === 'cancelled' ? 'var(--color-error)' : 'var(--color-primary-dark)'
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', minWidth: '55px' }}>Status:</span>
                                    <select
                                      className="sort-select"
                                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                      value={order.status}
                                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                                    >
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', minWidth: '55px' }}>Payment:</span>
                                    <select
                                      className="sort-select"
                                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                      value={order.paymentStatus}
                                      onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as any)}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="paid">Paid</option>
                                      <option value="failed">Failed</option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Coupon Manager tab */}
              {activeTab === 'coupons' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
                  
                  {/* Coupon List */}
                  <div className="admin-content-card">
                    <h3 className="card-title-sub" style={{ marginBottom: '24px' }}>Active Discount Codes</h3>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Value</th>
                            <th>Min Purchase</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((cop) => (
                            <tr key={cop.code}>
                              <td><strong style={{ color: 'var(--color-primary)' }}>{cop.code}</strong></td>
                              <td>{cop.type === 'percentage' ? `${cop.value}% OFF` : `₹${cop.value} OFF`}</td>
                              <td>₹{cop.minPurchase}</td>
                              <td>
                                <button 
                                  onClick={() => handleDeleteCouponClick(cop.code)}
                                  style={{ color: 'var(--color-error)' }}
                                  title="Delete Coupon"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add Coupon Form */}
                  <div className="admin-content-card">
                    <h3 className="card-title-sub" style={{ marginBottom: '20px' }}>Create Promo Code</h3>
                    <form onSubmit={handleAddCouponSubmit}>
                      <div className="form-group">
                        <label className="form-label">Coupon Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. MONSOON20"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          required
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Discount Type *</label>
                        <select
                          className="sort-select"
                          style={{ width: '100%' }}
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as any)}
                        >
                          <option value="percentage">Percentage Discount (%)</option>
                          <option value="fixed">Fixed Flat Discount (₹)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Discount Value *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newValue}
                          onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
                          min={1}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Min Purchase Requirement (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newMinPurchase}
                          onChange={(e) => setNewMinPurchase(parseInt(e.target.value) || 0)}
                          min={0}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                        Create Coupon
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL DIALOG --- */}
      {isProdModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title-sub">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Farm Product'}
              </h3>
              <button 
                onClick={() => { setIsProdModalOpen(false); resetProductForm(); }} 
                className="qty-btn"
                style={{ borderRadius: '50%', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. A2 Desi Cow Bilona Ghee"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="sort-select"
                    style={{ width: '100%', height: '45px' }}
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                  >
                    <option value="ghee">Bilona Ghee</option>
                    <option value="dairy">Fresh Dairy</option>
                    <option value="oils">Wood-Pressed Oils</option>
                    <option value="honey">Wild Honey</option>
                    <option value="pickles">Organic Pickles</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Featured Product</label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '45px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={prodFeatured}
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                      />
                      <span>Display on Home Page</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Card Description *</label>
                <input
                  type="text"
                  className="form-input"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Brief summary showing in product cards"
                  maxLength={180}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heritage Process Details *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={prodDetails}
                  onChange={(e) => setProdDetails(e.target.value)}
                  placeholder="Full detailed explanation about the sourcing, maturations, Ayurveda values..."
                  required
                />
              </div>

              {/* Image Upload Box */}
              <div className="form-group">
                <label className="form-label">Product Banner Image *</label>
                <div 
                  className="image-upload-wrapper"
                  onClick={() => document.getElementById('image-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="image-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {imageUploading ? (
                    <div>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid var(--color-border)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 8px'
                      }} />
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Uploading to Cloudinary...</p>
                    </div>
                  ) : prodImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <img src={prodImage} alt="Uploaded product" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>✓ Uploaded. Tap here to change.</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>Select Product Image file</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Direct unsigned upload to Cloudinary CDN</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Size & Pricing Options */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">Size & Pricing Variations *</label>
                  <button 
                    type="button" 
                    onClick={() => setProdOptions([...prodOptions, { size: '500ml', price: 800, stock: 50 }])}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} /> Add Variation
                  </button>
                </div>
                
                {prodOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="Size (e.g. 500ml, 1 Liter)"
                      value={opt.size}
                      onChange={(e) => {
                        const updated = [...prodOptions];
                        updated[idx].size = e.target.value;
                        setProdOptions(updated);
                      }}
                      required
                    />
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '100px' }}
                      placeholder="Price (₹)"
                      value={opt.price}
                      min={1}
                      onChange={(e) => {
                        const updated = [...prodOptions];
                        updated[idx].price = parseInt(e.target.value) || 0;
                        setProdOptions(updated);
                      }}
                      required
                    />
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '90px' }}
                      placeholder="Stock"
                      value={opt.stock}
                      min={0}
                      onChange={(e) => {
                        const updated = [...prodOptions];
                        updated[idx].stock = parseInt(e.target.value) || 0;
                        setProdOptions(updated);
                      }}
                      required
                    />
                    {prodOptions.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => setProdOptions(prodOptions.filter((_, i) => i !== idx))}
                        style={{ color: 'var(--color-error)' }}
                        title="Remove option"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Benefits Lists */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">Sourcing & Nutrition Benefits</label>
                  <button 
                    type="button" 
                    onClick={() => setProdBenefits([...prodBenefits, ''])}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} /> Add Benefit
                  </button>
                </div>

                {prodBenefits.map((benefit, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="e.g. Churned in wooden mills below 40°C"
                      value={benefit}
                      onChange={(e) => {
                        const updated = [...prodBenefits];
                        updated[idx] = e.target.value;
                        setProdBenefits(updated);
                      }}
                    />
                    {prodBenefits.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => setProdBenefits(prodBenefits.filter((_, i) => i !== idx))}
                        style={{ color: 'var(--color-error)' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsProdModalOpen(false); resetProductForm(); }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Product Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
