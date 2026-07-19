import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';
import '../styles/footer.css';

export const Footer: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Retrieve already subscribed emails from localStorage to prevent duplicate subscription
    const subscribedEmailsStr = localStorage.getItem('amritbhoomi_newsletter_subscribers');
    const subscribedEmails: string[] = subscribedEmailsStr ? JSON.parse(subscribedEmailsStr) : [];
    
    const normEmail = email.trim().toLowerCase();
    if (subscribedEmails.includes(normEmail)) {
      showToast("This email is already subscribed! 🌾", "info");
      return;
    }
    
    subscribedEmails.push(normEmail);
    localStorage.setItem('amritbhoomi_newsletter_subscribers', JSON.stringify(subscribedEmails));
    
    showToast("Successfully subscribed to Amrit Bhoomi's newsletters! 🌾", "success");
    setEmail('');
  };

  return (
    <>
      {/* Also Available On Section */}
      <section className="available-on-strip">
        <div className="container">
          <div className="available-on-content">
            <h3 className="available-on-title">Also Available On</h3>
            <div className="available-on-logos">
              <a href="https://blinkit.com" target="_blank" rel="noopener noreferrer" className="available-logo-card">
                <span className="blinkit-logo">blink<span className="blinkit-yellow">it</span></span>
              </a>
              <a href="https://flipkart.com" target="_blank" rel="noopener noreferrer" className="available-logo-card">
                <span className="flipkart-logo">Flipkart <span className="flipkart-blue">🛒</span></span>
              </a>
              <a href="https://amazon.in" target="_blank" rel="noopener noreferrer" className="available-logo-card">
                <span className="amazon-logo">amazon<span className="amazon-arrow">.in</span></span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
        {/* Trust Accreditations Strip */}
        <div className="trust-accreditations-strip">
          <div className="accreditation-item">
            <svg viewBox="0 0 24 24" className="accreditation-svg" style={{ width: '20px', height: '20px', fill: 'currentColor' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            <span>FSSAI Quality Approved</span>
          </div>
          <div className="accreditation-item">
            <svg viewBox="0 0 24 24" className="accreditation-svg" style={{ width: '20px', height: '20px', fill: 'currentColor' }}><path d="M17 8C8 8 4 16 4 16s4-2 8-2 8 2 8 2-3-8-3-8zM7.5 14c-.83 0-1.5-.67-1.5-1.5S6.67 11 7.5 11s1.5.67 1.5 1.5S8.33 14 7.5 14z"/></svg>
            <span>100% India Organic</span>
          </div>
          <div className="accreditation-item">
            <svg viewBox="0 0 24 24" className="accreditation-svg" style={{ width: '20px', height: '20px', fill: 'currentColor' }}><path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
            <span>USDA Organic Compliant</span>
          </div>
          <div className="accreditation-item">
            <svg viewBox="0 0 24 24" className="accreditation-svg" style={{ width: '20px', height: '20px', fill: 'currentColor' }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>Ahimsa Cruelty-Free</span>
          </div>
        </div>

        <div className="footer-grid">
          {/* Col 1: About */}
          <div className="footer-col">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="Amrit Bhoomi" style={{ height: '54px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }} />
            </div>
            <p className="footer-desc">
              Rooted in Ayurvedic tradition, Amrit Bhoomi brings you the purest, farm-fresh, organic products made using Vedic methods. Our hand-churned Bilona Ghee is crafted in earthen pots to preserve vital nutrients and traditional flavor.
            </p>
          </div>

          {/* Col 2: Shop links */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop Collections</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=dairy" className="footer-link">Fresh Dairy</Link></li>
              <li><Link to="/shop?category=ghee" className="footer-link">Bilona Ghee</Link></li>
              <li><Link to="/shop?category=oils" className="footer-link">Wood-Pressed Oils</Link></li>
              <li><Link to="/shop?category=honey" className="footer-link">Wild Honey</Link></li>
              <li><Link to="/shop?category=pickles" className="footer-link">Handcrafted Pickles</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Our Story</Link></li>
              <li><Link to="/admin-login" className="footer-link">Partner with Us</Link></li>
              <li><Link to="/" className="footer-link">Track Order</Link></li>
              <li><Link to="/" className="footer-link">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Stay Connected</h4>
            <p className="footer-desc" style={{ fontSize: '0.85rem' }}>
              Subscribe to receive recipe ideas, exclusive discounts, and farm updates.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
            
            <div className="footer-contact-info" style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} style={{ color: 'var(--color-accent)' }} />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: 'var(--color-accent)' }} />
                <span>care@amritbhoomi.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '3px' }} />
                <span>Amrit Bhoomi Organic Farms, Jaipur, Rajasthan, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Amrit Bhoomi Organic Farms Private Limited. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/" className="footer-link" style={{ fontSize: '0.8rem' }}>Privacy Policy</Link>
            <Link to="/" className="footer-link" style={{ fontSize: '0.8rem' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
};
export default Footer;
