import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, ShoppingBag, Send } from 'lucide-react';
import { getProductById, addReview, type Product, type ProductOption } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import '../styles/product.css';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery & Purchase states
  const [activeImage, setActiveImage] = useState('');
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubSelected, setIsSubSelected] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'benefits' | 'reviews'>('details');

  // Review form states
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const prod = await getProductById(id);
      if (prod) {
        setProduct(prod);
        setActiveImage(prod.image);
        setSelectedOption(prod.options[0]);
      }
    } catch (e) {
      console.error("Failed to load product detail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedOption) return;

    if (selectedOption.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, "error");
      return;
    }

    const price = isSubSelected ? Math.round(selectedOption.price * 0.85) : selectedOption.price;
    addToCart(product, selectedOption.size, price, quantity, isSubSelected);
    showToast(`Added ${quantity} × ${product.name} (${selectedOption.size}) ${isSubSelected ? 'Subscription' : 'One-time'} to your bag! 🌾`, "success");
    setQuantity(1);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id || !revName || !revComment) return;

    try {
      await addReview(id, {
        userName: revName,
        rating: revRating,
        comment: revComment
      });

      showToast("Thank you! Your review has been added.", "success");
      
      // Reset form
      setRevName('');
      setRevRating(5);
      setRevComment('');
      
      // Reload product data to show new review
      fetchProduct();
    } catch (err) {
      showToast("Failed to submit review.", "error");
    }
  };

  if (loading) {
    return (
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
        <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Preparing product details...</p>
      </div>
    );
  }

  if (!product || !selectedOption) {
    return (
      <div className="container text-center" style={{ padding: '100px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '16px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="container">
        {/* Back Link */}
        <Link to="/shop" className="back-link">
          <ArrowLeft size={16} /> Back to Organic Store
        </Link>

        {/* Core Detail Grid */}
        <div className="product-detail-grid">
          {/* Column 1: Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrapper" style={{ position: 'relative' }}>
              <img src={activeImage} alt={product.name} className="main-image" />
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

            {product.gallery && product.gallery.length > 1 && (
              <div className="gallery-thumbnails">
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="thumbnail-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Buy Details panel */}
          <div className="product-info-panel">
            <span className="card-category" style={{ fontSize: '0.85rem' }}>{product.category}</span>
            <h1 className="product-title-large">{product.name}</h1>

            {/* Ratings */}
            <div className="product-meta-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={16} fill="#ffb100" stroke="none" />
                <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>{product.rating}</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  ({product.reviewsCount} reviews)
                </span>
              </div>
              <span style={{ color: 'var(--color-border)' }}>|</span>
              <span style={{ fontSize: '0.9rem', color: selectedOption.stock > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                {selectedOption.stock > 0 ? `In Stock (${selectedOption.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Sub-description */}
            <p className="detail-desc">{product.description}</p>

            {/* Sizing Weight Options */}
            {product.options.length > 0 && (
              <div>
                <h4 className="options-title">Select Pack Size</h4>
                <div className="detail-size-pills">
                  {product.options.map((opt) => (
                    <button
                      key={opt.size}
                      className={`detail-size-pill ${selectedOption.size === opt.size ? 'active' : ''}`}
                      onClick={() => { setSelectedOption(opt); setQuantity(1); }}
                    >
                      {opt.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Type Selector */}
            <div className="purchase-type-selector" style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '16px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                <input 
                  type="radio" 
                  name={`purchase-type-detail`}
                  checked={!isSubSelected}
                  onChange={() => setIsSubSelected(false)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                <span>One-time Purchase</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                <input 
                  type="radio" 
                  name={`purchase-type-detail`}
                  checked={isSubSelected}
                  onChange={() => setIsSubSelected(true)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
                <span>Subscribe & Save (15% Off - Deliver Monthly)</span>
              </label>
            </div>

            {/* Dynamic Price Output */}
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isSubSelected ? 'Subscription Price' : 'Total Price'}</span>
              <strong style={{ fontSize: '2.2rem', color: 'var(--color-primary)', display: 'block', lineHeight: 1.2 }}>
                ₹{Math.round((isSubSelected ? selectedOption.price * 0.85 : selectedOption.price) * quantity)}
              </strong>
            </div>

            {/* Purchase quantities & Buttons */}
            <div className="purchase-actions">
              <div className="quantity-adjuster">
                <button 
                  className="quantity-btn-large" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="quantity-input-value">{quantity}</span>
                <button 
                  className="quantity-btn-large" 
                  onClick={() => setQuantity(Math.min(selectedOption.stock, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {selectedOption.stock > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary add-to-cart-btn-large"
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <ShoppingBag size={18} /> Add to Shopping Bag
                </button>
              ) : (
                <button 
                  className="btn add-to-cart-btn-large" 
                  style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
                  disabled
                >
                  Out of Stock
                </button>
              )}
            </div>

            {/* Quick trust checklist */}
            <div className="benefits-box">
              <h4 className="benefits-title">Why Amrit Bhoomi organic?</h4>
              <ul className="benefits-list">
                {product.benefits.map((b, i) => (
                  <li className="benefit-item" key={i}>
                    <CheckCircle size={16} className="benefit-check" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tab layout details */}
        <div className="detail-tabs-container">
          <div className="tab-nav">
            <button 
              className={`tab-nav-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Heritage & Process
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'benefits' ? 'active' : ''}`}
              onClick={() => setActiveTab('benefits')}
            >
              Benefits & Usage
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' && (
              <p style={{ whiteSpace: 'pre-line' }}>{product.details}</p>
            )}

            {activeTab === 'benefits' && (
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {product.benefits.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
                <li>Storage: Store in a cool, dry place away from direct sunlight. Traditional Bilona ghee does not require refrigeration.</li>
              </ul>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-block">
                {/* Rating distribution dashboard */}
                {(() => {
                  const revs = product.reviews || [];
                  const totalCount = revs.length;
                  const distribution = [5, 4, 3, 2, 1].map(stars => {
                    const count = revs.filter(r => r.rating === stars).length;
                    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : (stars === 5 ? 100 : 0);
                    return { stars, percentage };
                  });

                  return (
                    <div className="rating-distribution-card">
                      <div className="rating-distribution-summary">
                        <div style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: '1' }}>{product.rating}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '12px 0 6px', color: '#ffb100' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ fontSize: '20px' }}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Based on {product.reviewsCount} reviews</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {distribution.map(d => (
                          <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                            <span style={{ width: '45px', fontWeight: 600, color: 'var(--color-text-main)' }}>{d.stars} Star</span>
                            <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${d.percentage}%`, height: '100%', backgroundColor: '#ffb100', borderRadius: '4px' }} />
                            </div>
                            <span style={{ width: '35px', color: 'var(--color-text-muted)', textAlign: 'right' }}>{d.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Reviews List */}
                {product.reviews.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
                    No reviews yet. Be the first to share your experience with this product!
                  </p>
                ) : (
                  product.reviews.map((rev) => (
                    <div className="review-item-card" key={rev.id}>
                      <div className="review-item-header">
                        <span className="review-item-name">{rev.userName}</span>
                        <span className="review-item-date">{rev.date}</span>
                      </div>
                      <div className="review-stars" style={{ justifyContent: 'flex-start', marginBottom: '8px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ fontSize: '14px', color: i < rev.rating ? '#ffb100' : 'var(--color-border)' }}>★</span>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{rev.comment}</p>
                    </div>
                  ))
                )}

                {/* Review Submission Form */}
                <div className="review-form-card">
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.4rem', marginBottom: '8px' }}>
                    Write a Review
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    Your email address will not be published. Required fields are marked *
                  </p>

                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group-row">
                      <div className="form-group">
                        <label className="form-label">Your Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={revName}
                          onChange={(e) => setRevName(e.target.value)}
                          placeholder="e.g. Rahul Sen"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Rating *</label>
                        <div className="star-rating-selector" style={{ marginTop: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className="star-rating-btn"
                              onClick={() => setRevRating(star)}
                              aria-label={`Rate ${star} stars`}
                            >
                              <span style={{ fontSize: '24px', color: star <= revRating ? '#ffb100' : 'var(--color-border)' }}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Review *</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder="Tell us about the texture, aroma, or quality..."
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', gap: '8px' }}
                    >
                      Submit Review <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
