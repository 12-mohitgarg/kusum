import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Heart, Flame, User, Lock, Mail, UserPlus } from 'lucide-react';
import { getProducts, type Product } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import '../styles/hero.css';

const TESTIMONIALS = [
  {
    author: "Dr. Ananya Dixit",
    role: "Ayurvedic Practitioner",
    rating: 5,
    comment: "Ghee is considered liquid gold in Ayurveda. Amrit Bhoomi's Bilona Ghee is the only one I trust and recommend to my patients. The earthen pot preparation gives it an unmatched medicinal quality and rich taste."
  },
  {
    author: "Rohan Singhal",
    role: "Fitness Coach",
    rating: 5,
    comment: "I switch to Amrit Bhoomi's cold wood-pressed coconut and mustard oils for all my meals. The purity is visible in the texture and taste. Highly recommended for athletes looking for clean healthy fats."
  },
  {
    author: "Shalini Sharma",
    role: "Homemaker",
    rating: 5,
    comment: "My kids love the handmade mango pickle. It tastes exactly like the pickles my grandmother used to mature in glass jars on our rooftop. Authentic and chemical-free!"
  }
];

const HERO_SLIDES = [
  {
    subtitle: "Freshly Milked & Chilled",
    title: "Farm-Fresh A2 Desi Cow Milk",
    text: "Sourced daily from grass-fed native Gir cows. Chilled immediately to 4°C and delivered in eco-friendly glass bottles within 12 hours for absolute purity.",
    bg: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396169/us48gdquhokihzxsub5g.jpg"
  },
  {
    subtitle: "100% Traditional & Organic",
    title: "Experience Pure Vedic Bilona Ghee",
    text: "Handcrafted in small batches from A2 Gir Cow milk. Cultured into curd, wood-churned, and slow-cooked in earthen pots for the perfect granular golden texture.",
    bg: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396170/bwrgxuelzo2qc04pfxki.jpg"
  },
  {
    subtitle: "Artisanal Dairy Delights",
    title: "Fresh A2 Paneer & Cultured Curd",
    text: "Traditionally curdled fresh cottage cheese and earthen pot set Dahi rich in probiotics, handmade with care in our farm kitchen.",
    bg: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396173/ulwmrrk99t9yl6awqzbr.jpg"
  },
  {
    subtitle: "Unrefined & Nutrient-Rich",
    title: "Cold Wood-Pressed Virgin Oils",
    text: "Extracted slowly at low temperatures in wooden Kolhus from premium seeds. Zero chemical refining, preserving essential fatty acids and natural flavors.",
    bg: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396174/xscrsqiqxd1bekafuqho.jpg"
  }
];

const FAQ_ITEMS = [
  {
    q: "What is A2 Ghee and how is it different from regular ghee?",
    a: "Regular commercial ghee is made from cream (malai) of mixed breed cows using machines. A2 Ghee is prepared exclusively from the milk of native Indian cows (like Gir or Sahiwal) that produce only the A2 beta-casein protein, which is much easier on the human digestive tract."
  },
  {
    q: "What is Desi Cow Bilona Ghee?",
    a: "Desi Cow Bilona Ghee is made using the traditional Vedic method. The A2 milk is boiled, naturally cultured into curd, and then churned with a bi-directional wooden bilona to separate butter (makkhan). This butter is then slow-cooked in clay pots over cow dung or wood fire to produce pure, granular, and aromatic golden ghee."
  },
  {
    q: "Why is Buffalo Bilona Ghee considered a good choice?",
    a: "Buffalo Bilona Ghee is rich in calcium, phosphorus, magnesium, and healthy fats. Prepared using traditional bilona curd-churning methods, it offers a creamy, delicious flavor profile, helps build muscle mass, improves sleep, and is perfect for children's healthy development."
  },
  {
    q: "What are the benefits of using Kachi Ghani Black Mustard Oil?",
    a: "Kachi Ghani Black Mustard Oil is cold-pressed in traditional wooden Kolhus from premium black mustard seeds. It retains all natural monounsaturated fatty acids (MUFA), natural aroma, and sharp pungency. It is a powerful immunity booster, excellent for cardiovascular health, and acts as a natural food preservative."
  },
  {
    q: "What are the health benefits of A2 Ghee?",
    a: "A2 Ghee is rich in short-chain fatty acids like butyric acid, which improves gut health, heals digestive tracts, boosts immunity, enhances brain focus, lubricates joints, nourishes skin, and possesses a high smoke point making it perfect for cooking."
  }
];

export const Home: React.FC = () => {
  const { showToast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Bulk Form State
  const [bulkName, setBulkName] = useState('');
  const [bulkEmail, setBulkEmail] = useState('');
  const [bulkProduct, setBulkProduct] = useState('ghee');
  const [bulkQty, setBulkQty] = useState('10L');
  const [bulkMsg, setBulkMsg] = useState('');

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkName || !bulkEmail) return;
    showToast("Bulk inquiry submitted successfully! Our wholesale team will contact you in 24 hours. 🌾", "success");
    setBulkName('');
    setBulkEmail('');
    setBulkMsg('');
  };

  // Ayurvedic Ghee Calculator State
  const [calcAge, setCalcAge] = useState<'kid' | 'adult' | 'senior'>('adult');
  const [calcGoal, setCalcGoal] = useState<'digestion' | 'joints' | 'immunity' | 'brain'>('immunity');
  const [calcDosha, setCalcDosha] = useState<'vata' | 'pitta' | 'kapha'>('vata');
  const [calcResult, setCalcResult] = useState<string>('');

  const calculateAyurveda = () => {
    let dosage = "";
    let timing = "";
    let tip = "";

    if (calcAge === 'kid') {
      dosage = "1/2 to 1 teaspoon (2.5ml - 5ml) daily";
    } else if (calcAge === 'adult') {
      dosage = "1 to 2 teaspoons (5ml - 10ml) twice daily";
    } else {
      dosage = "1 teaspoon (5ml) daily in warm milk";
    }

    if (calcGoal === 'digestion') {
      timing = "First thing in the morning on an empty stomach with a glass of warm water.";
      tip = "Stimulates Agni (digestive fire), helping flush toxins and cleanse the digestive tract.";
    } else if (calcGoal === 'joints') {
      timing = "Mixed into warm cooked meals (daal, rice, or subji) at lunch.";
      tip = "Lubricates joints from within, reduces cracking, and pacifies excess Vata.";
    } else if (calcGoal === 'immunity') {
      timing = "Before breakfast and bedtime with warm milk.";
      tip = "Builds Ojas (energy essence), supports the respiratory tract, and provides vital antioxidants.";
    } else {
      timing = "Mixed in lukewarm water or milk in the morning.";
      tip = "Nourishes Majja Dhatu (brain tissue), enhances concentration, memory, and cognitive sharpness.";
    }

    let doshaAdvice = "";
    if (calcDosha === 'vata') {
      doshaAdvice = "Vata body types are naturally dry and cold; you benefit immensely from daily ghee. Feel free to use 2-3 teaspoons.";
    } else if (calcDosha === 'pitta') {
      doshaAdvice = "Pitta governs heat; Ghee is cooling and sweet, which perfectly pacifies Pitta. Ideal for you.";
    } else {
      doshaAdvice = "Kapha is heavy and moist; you should consume ghee in moderation (max 1 teaspoon daily) paired with warming spices.";
    }

    setCalcResult(`🌿 Recommended Dosage: ${dosage}\n⏱ Best Time: ${timing}\n💡 Ayurvedic Tip: ${tip}\n🧘 Dosha Guidance: ${doshaAdvice}`);
  };

  // Run initial calculation on load & update
  useEffect(() => {
    calculateAyurveda();
  }, [calcAge, calcGoal, calcDosha]);

  // Lab Batch Tracker State
  const [selectedBatch, setSelectedBatch] = useState<string>('AB-GHEE-101');

  const BATCH_DATA: Record<string, {
    date: string,
    purity: string,
    moisture: string,
    casein: string,
    acidValue: string,
    status: string
  }> = {
    'AB-GHEE-101': { date: 'July 2026', purity: '100% Pure Ghee Fat', moisture: '0.08% (Max allowable: 0.3%)', casein: 'A2 Beta-Casein Positive (100%)', acidValue: '0.24 (Ideal range < 0.6)', status: 'Approved & Certified' },
    'AB-MILK-708': { date: 'Daily Supply - July 18', purity: 'Zero Adulterants / Water Additives', moisture: 'Natural Milk Solids (12.8%)', casein: 'A2 Beta-Casein Positive (100%)', acidValue: 'N/A (pH: 6.7)', status: 'Approved & Certified' },
    'AB-OIL-204': { date: 'June 2026 Cold-Press', purity: '100% Raw Wood-Pressed Oil', moisture: '0.05% (Cold pressed)', casein: 'N/A', acidValue: '0.38 (FFA percentage)', status: 'Approved & Certified' }
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(slideInterval);
  }, []);

  // Auth popup & context
  const { user, login, register } = useAuth();
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('amritbhoomi_auth_popup_dismissed');
      if (!dismissed && !user) {
        setIsAuthPopupOpen(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismissAuthPopup = () => {
    setIsAuthPopupOpen(false);
    sessionStorage.setItem('amritbhoomi_auth_popup_dismissed', 'true');
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showToast("Please enter your credentials.", "error");
      return;
    }
    setAuthSubmitting(true);
    try {
      await login(authEmail, authPassword);
      showToast("Welcome back to Amrit Bhoomi! 🌾", "success");
      setIsAuthPopupOpen(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      showToast(err.message || "Invalid email or password.", "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      showToast("Please fill in all registration fields.", "error");
      return;
    }
    setAuthSubmitting(true);
    try {
      await register(authEmail, authPassword, authName);
      showToast("Registration successful! Welcome to the farm family. 🌾", "success");
      setIsAuthPopupOpen(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      showToast(err.message || "Registration failed.", "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const [homeTab, setHomeTab] = useState<'all' | 'ghee' | 'oils' | 'dairy' | 'honey' | 'pickles'>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const prods = await getProducts();
        const featured = prods.filter(p => p.featured);
        setFeaturedProducts(featured.length >= 3 ? featured.slice(0, 6) : prods.slice(0, 6));
        setAllProducts(prods);
      } catch (e) {
        console.error("Failed to load products", e);
      }
    };
    fetchHomeProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Dynamic Hero Carousel Section (Kasutam Style Card Banner) */}
      <section className="hero-carousel-section" style={{ background: '#fdfaf5', padding: '40px 0 20px 0', overflow: 'hidden' }}>
        <div className="container">
          <div className="hero-carousel-container">
            {HERO_SLIDES.map((slide, idx) => (
              <div 
                key={idx} 
                className={`hero-slide-item ${activeSlide === idx ? 'active' : ''}`}
                style={{
                  display: activeSlide === idx ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url('${slide.bg}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  animation: 'fadeIn 0.6s ease',
                  position: 'relative'
                }}
              >
                {/* Dark Contrast Overlay */}
                <div className="hero-slide-overlay" />

                <div className="hero-slide-content-wrapper">
                  <span className="section-tag" style={{ textAlign: 'left', margin: 0, color: 'var(--color-accent)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>{slide.subtitle}</span>
                  
                  <h1 className="hero-slide-title">
                    Every <span className="hero-slide-title-italic">jar</span> tells a story of <span className="hero-slide-title-main">{slide.title.replace('Experience Pure ', '').replace('Farm-Fresh ', '')}</span>
                  </h1>

                  <div style={{ width: '120px', borderBottom: '3px dotted var(--color-accent)', margin: '2px 0 6px 0' }} />
                  
                  <p className="hero-slide-text">
                    {slide.text}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Link to="/shop" className="btn btn-accent" style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: 'var(--color-primary-dark)', padding: '12px 28px', borderRadius: '30px', fontWeight: 700 }}>
                      Shop Now <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Dots (Kasutam Pill/Circle Style) */}
            <div style={{ display: 'flex', gap: '8px', position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    width: activeSlide === idx ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: activeSlide === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="badges-section">
        <div className="container">
          <div className="badges-grid">
            <div className="badge-item">
              <div className="badge-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="badge-item-title">100% Organic</h4>
                <p className="badge-item-desc">Pure farm-sourced ingredients, zero additives.</p>
              </div>
            </div>

            <div className="badge-item">
              <div className="badge-icon-wrapper">
                <Award size={24} />
              </div>
              <div>
                <h4 className="badge-item-title">Traditional Bilona</h4>
                <p className="badge-item-desc">Curd-churned wooden method, never direct cream.</p>
              </div>
            </div>

            <div className="badge-item">
              <div className="badge-icon-wrapper">
                <Flame size={24} />
              </div>
              <div>
                <h4 className="badge-item-title">Earthen Slow Cooked</h4>
                <p className="badge-item-desc">Heated in mud pots over firewood chulha.</p>
              </div>
            </div>

            <div className="badge-item">
              <div className="badge-icon-wrapper">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="badge-item-title">Ahinsa Dairy</h4>
                <p className="badge-item-desc">Cruelty-free, grass-fed cows. Calf is fed first.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <span className="section-tag">Direct From Our Farm</span>
          <h2 className="section-title">Featured Best Sellers</h2>
          <p className="section-subtitle">Explore our range of premium A2 butter ghee, wood-pressed healthy cooking oils, and traditional pickles.</p>
          
          <div className="grid-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center" style={{ marginTop: '48px' }}>
            <Link to="/shop" className="btn btn-primary">
              View Featured Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Products Explorer Tabbed Section */}
      <section className="section explorer-section" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <span className="section-tag">Direct From Amrit Bhoomi Farms</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '8px' }}>Featured Products</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 500, marginBottom: '24px' }}>
            Shop By Categories
          </p>

          {/* Explorer Tab Selectors */}
          <div className="home-category-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', margin: '20px 0 40px 0' }}>
            {[
              { id: 'all', label: '🏆 Bestseller' },
              { id: 'ghee', label: '🍯 Ghee' },
              { id: 'dairy', label: '🥛 Fresh Dairy' },
              { id: 'oils', label: '🌻 Oils' },
              { id: 'honey', label: '🐝 Honey' },
              { id: 'pickles', label: '🌶️ Pickles' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`category-tab ${homeTab === tab.id ? 'active' : ''}`}
                onClick={() => setHomeTab(tab.id as any)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: homeTab === tab.id ? 'var(--color-primary)' : '#ffffff',
                  color: homeTab === tab.id ? '#ffffff' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: homeTab === tab.id ? 'var(--shadow-md)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product grid matching the category filter */}
          <div className="grid-3" style={{ minHeight: '400px' }}>
            {allProducts
              .filter(p => homeTab === 'all' || p.category === homeTab)
              .slice(0, 6) // limit to top 6 items on home page
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/shop" className="btn btn-primary">
              Browse Full Farm Catalog & Filters <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Fresh Dairy Delights Banner Section */}
      <section className="section dairy-promo-section">
        <div className="container">
          <div className="dairy-promo-grid">
            <div className="dairy-promo-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800" 
                alt="Fresh A2 Milk Bottle" 
                className="dairy-promo-img"
              />
              <div className="dairy-promo-badge glass">
                <span>🥛 Delivered in 12 Hrs</span>
              </div>
            </div>

            <div className="dairy-promo-content">
              <span className="section-tag" style={{ textAlign: 'left', margin: 0 }}>Farm Fresh Promise</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>Our A2 Farm-to-Table Dairy Difference</h2>
              <p className="dairy-promo-text">
                Every drop of our A2 milk and every block of our fresh paneer is produced sustainably at our organic farm. We maintain the highest standards of hygiene and animal welfare, feeding our Gir cows organic fodder and herbs.
              </p>

              <div className="dairy-features-list">
                <div className="dairy-feature-item">
                  <span className="dairy-feature-icon">✨</span>
                  <div>
                    <h4 className="dairy-feature-title">Pure A2 Beta-Casein</h4>
                    <p className="dairy-feature-desc">Naturally easy on the gut, with zero A1 milk allergies or digestive issues.</p>
                  </div>
                </div>

                <div className="dairy-feature-item">
                  <span className="dairy-feature-icon">🍼</span>
                  <div>
                    <h4 className="dairy-feature-title">Eco Glass Bottle Program</h4>
                    <p className="dairy-feature-desc">Delivered in sanitized, reusable glass bottles. Swap your bottle daily and help the planet.</p>
                  </div>
                </div>

                <div className="dairy-feature-item">
                  <span className="dairy-feature-icon">❄️</span>
                  <div>
                    <h4 className="dairy-feature-title">Strict Cold Chain Logistics</h4>
                    <p className="dairy-feature-desc">Chilled instantly at milking and maintained at 4°C right to your doorstep.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '36px' }}>
                <Link to="/shop?category=dairy" className="btn btn-primary">
                  Order Fresh Dairy Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Honey & Wood-Pressed Oils Banner Section */}
      <section className="section honey-oils-promo-section" style={{ background: '#fdfaf5', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="honey-oils-promo-grid">
            <div className="honey-oils-promo-content">
              <span className="section-tag" style={{ textAlign: 'left', margin: 0 }}>Liquid Gold & Natural Fats</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px', color: '#684a1e' }}>Raw Himalayan Honey & Wood-Pressed Oils</h2>
              <p className="honey-oils-promo-text" style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', lineHeight: '1.7', marginBottom: '24px' }}>
                Extracted using traditional wooden mortars (Kohlus) at temperatures below 40°C to preserve natural antioxidants, vitamins, and delicious nutty flavors. Paired with pure wildflower raw honey collected by native bee-keepers in the deep forests.
              </p>

              <div className="honey-features-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', color: '#c5a86d' }}>🍯</span>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '1.05rem', marginBottom: '4px' }}>Unpasteurized & Unfiltered Honey</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>Rich in natural pollen particles, enzymes, and anti-bacterial properties. Straight from comb to jar.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', color: '#c5a86d' }}>🌻</span>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '1.05rem', marginBottom: '4px' }}>Slow Wooden Churning (Kohlu)</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>No heat or chemical solvents used. Oils retain their dense natural colors, strong aromas, and fatty acids.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '36px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/shop?category=honey" className="btn btn-accent" style={{ backgroundColor: '#c5a86d', borderColor: '#c5a86d', color: '#ffffff' }}>
                  Shop Raw Honey <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=oils" className="btn btn-secondary" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                  Shop Wood-Pressed Oils
                </Link>
              </div>
            </div>

            <div className="honey-oils-promo-image-wrapper" style={{ position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800" 
                alt="Raw wild honey jar and wood pressed oil seeds" 
                style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}
              />
              <div className="honey-promo-badge glass" style={{ position: 'absolute', bottom: '20px', left: '-20px', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                🍯 Wild Harvested & Cold Pressed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ayurvedic Clay-Pot Process Highlights */}
      <section className="section earthenware-highlights" style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '48px' }}>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800" 
                alt="Clay pots heating on wood fire" 
                style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span className="section-tag" style={{ textAlign: 'left', margin: 0 }}>Ayurvedic Science</span>
              <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Why Mud-Pot Slow Cooking Matters</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', lineHeight: '1.7' }}>
                Modern commercial cooking uses high-pressure steel containers that boil milk fat at over 150°C. This destroys key nutrients and converts natural fats into inflammatory trans-fats.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent-dark)', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Clay Alkalinity:</strong> Clay cookware is alkaline and reacts with acidic ingredients, balancing pH levels.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent-dark)', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Nutrient Retention:</strong> Clay is porous and distributes heat evenly, allowing steam condensation to cycle back into the cooking ghee.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent-dark)', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Low Temperature:</strong> Heated on gentle wood-fire coals, keeping vital conjugated linoleic acids (CLA) and butyric acid fully intact.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vedic Bilona Process Showcase (Premium Timeline layout) */}
      <section id="bilona-process" className="section process-section" style={{ background: '#fdfcf8', padding: '80px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="journey-layout">
            {/* Left Column: Heading and Birds Graphic */}
            <div className="journey-left">
              <span className="section-tag" style={{ margin: 0 }}>How It Is Made</span>
              <h2 className="journey-title" style={{ margin: '8px 0 0 0' }}>The Traditional Journey Of Our Ghee</h2>
              <img src="/journey_birds.png" alt="Traditional Journey of our Ghee" className="journey-birds-img" />
            </div>

            {/* Right Column: Timeline Cards */}
            <div className="journey-right">
              <div className="timeline-connector-line"></div>
              
              <div className="journey-steps-list">
                <div className="journey-step-row">
                  <div className="journey-step-number">1</div>
                  <div className="journey-step-card">
                    <img src="/journey_step1.png" alt="Milking with care" className="journey-step-img" />
                    <div>
                      <h4 className="journey-step-title">Milking with care</h4>
                      <p className="journey-step-desc">
                        A2 Desi Cows are Milked by Hand, Honoring Ancient Ayurvedic traditions for purity and authenticity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="journey-step-row">
                  <div className="journey-step-number">2</div>
                  <div className="journey-step-card">
                    <img src="/journey_step2.png" alt="Heating Milk and Preparing Curd" className="journey-step-img" />
                    <div>
                      <h4 className="journey-step-title">Heating Milk and Preparing Curd</h4>
                      <p className="journey-step-desc">
                        Heat A2 milk in a clay pot, add curd culture, and let it ferment into rich curd.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="journey-step-row">
                  <div className="journey-step-number">3</div>
                  <div className="journey-step-card">
                    <img src="/journey_step3.png" alt="Traditionally wood churned" className="journey-step-img" />
                    <div>
                      <h4 className="journey-step-title">Traditionally wood churned</h4>
                      <p className="journey-step-desc">
                        The curd is churned using a wooden bilona, extracting rich and wholesome butter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="journey-step-row">
                  <div className="journey-step-number">4</div>
                  <div className="journey-step-card">
                    <img src="/journey_step4.png" alt="Slow Cooking the Butter" className="journey-step-img" />
                    <div>
                      <h4 className="journey-step-title">Slow Cooking the Butter</h4>
                      <p className="journey-step-desc">
                        This process evaporates water content and converts the butter into aromatic golden ghee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Comparison Section */}
      <section className="section comparison-section" style={{ background: '#ffffff', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <span className="section-tag">Know the Truth</span>
          <h2 className="section-title">The Bilona Difference</h2>
          <p className="section-subtitle">
            Not all ghee is created equal. See how our traditional Vedic Bilona Ghee stacks up against commercial store-bought alternatives.
          </p>

          <div className="comparison-table-wrapper" style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '16px', marginTop: '40px' }}>
            <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-primary-dark)', color: '#ffffff' }}>
                  <th style={{ padding: '18px 24px', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Features</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', color: 'var(--color-accent)' }}>Amrit Bhoomi Vedic Ghee</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', opacity: 0.8 }}>Commercial Store Ghee</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>Milk Source</td>
                  <td style={{ padding: '16px 24px' }}>Grass-fed native A2 Gir cows. Sourced from our organic pasture farms.</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>Mixed HF/Jersey cow and buffalo milk collected from unverified aggregators.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>Preparation Basis</td>
                  <td style={{ padding: '16px 24px' }}>Cultured from whole milk curd churned with bi-directional wooden bilona.</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>Boiled directly from residual milk cream (malai) or butter solids.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>Cooking Vessels</td>
                  <td style={{ padding: '16px 24px' }}>Slow-heated in clay pots (earthenware) over dry cow-dung cake fires.</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>Boiled directly from cream in large steel boilers with steam.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>Texture & Aroma</td>
                  <td style={{ padding: '16px 24px' }}>Highly granular golden beads, rich native nutty aroma.</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>Smooth paste or oily liquid, artificial flavors often added.</td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-primary)' }}>Digestion & Health</td>
                  <td style={{ padding: '16px 24px' }}>Light on stomach, rich in vitamins A, D, E, K, and butyric acid. Easy for lactose-intolerants.</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>Heavy to digest, can cause acidity, loaded with trans-fats.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Interactive Trust Dashboard: Calculator & Batch Lookup */}
      <section className="section dashboard-section" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <span className="section-tag">Interactive Health & Purity</span>
          <h2 className="section-title">Ayurveda & Lab Purity Dashboard</h2>
          <p className="section-subtitle">
            Get personalized Ghee dosage recommendations based on Ayurvedic principles, and search live laboratory tests for our current farm batches.
          </p>

          <div className="dashboard-grid">
            
            {/* Ayurvedic Ghee Calculator */}
            <div className="dashboard-card glass">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                🌿 Ghee Dosage Calculator
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-row-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Age Group</label>
                    <select 
                      style={{ width: '100%', maxWidth: '100%', height: '40px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none' }}
                      value={calcAge} 
                      onChange={(e) => setCalcAge(e.target.value as any)}
                    >
                      <option value="kid">Child (2 - 12 years)</option>
                      <option value="adult">Adult (13 - 60 years)</option>
                      <option value="senior">Senior (60+ years)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Primary Health Goal</label>
                    <select 
                      style={{ width: '100%', maxWidth: '100%', height: '40px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none' }}
                      value={calcGoal} 
                      onChange={(e) => setCalcGoal(e.target.value as any)}
                    >
                      <option value="immunity">Strengthen Immunity</option>
                      <option value="digestion">Improve Digestion / Agni</option>
                      <option value="joints">Lubricate Joints / Bone Health</option>
                      <option value="brain">Boost Memory & Brain Focus</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Ayurvedic Body Type (Dosha)</label>
                  <select 
                    style={{ width: '100%', maxWidth: '100%', height: '40px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none' }}
                    value={calcDosha} 
                    onChange={(e) => setCalcDosha(e.target.value as any)}
                  >
                    <option value="vata">Vata (Dry, light, cold, hyperactive)</option>
                    <option value="pitta">Pitta (Fiery, warm, intense, sharp digestion)</option>
                    <option value="kapha">Kapha (Heavy, calm, slow digestion, moisture-rich)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Result Panel */}
              <div style={{ padding: '20px', backgroundColor: 'var(--color-bg-base)', borderLeft: '4px solid var(--color-accent)', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                {calcResult}
              </div>
            </div>

            {/* Lab Purity Batch Tracker */}
            <div className="dashboard-card glass">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                🔬 Lab Report & Batch Lookup
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Select Farm Batch Code</label>
                <select 
                  style={{ height: '40px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none', width: '100%', maxWidth: '100%' }}
                  value={selectedBatch} 
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="AB-GHEE-101">A2 Desi Cow Bilona Ghee (Batch: AB-GHEE-101)</option>
                  <option value="AB-MILK-708">Fresh A2 Gir Cow Milk (Batch: AB-MILK-708)</option>
                  <option value="AB-OIL-204">Wood-Pressed Mustard Oil (Batch: AB-OIL-204)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f3e7', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Test Date</span>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{BATCH_DATA[selectedBatch].date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f3e7', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Purity Analysis</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{BATCH_DATA[selectedBatch].purity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f3e7', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Moisture Level</span>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{BATCH_DATA[selectedBatch].moisture}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f3e7', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Casein Type</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{BATCH_DATA[selectedBatch].casein}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f3e7', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Free Fatty Acid (FFA)</span>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{BATCH_DATA[selectedBatch].acidValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Report Status</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✓ {BATCH_DATA[selectedBatch].status}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Traditional Kitchen Recipes Section */}
      <section className="section recipes-section" style={{ background: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <span className="section-tag">Healthy Cooking</span>
          <h2 className="section-title">Amrit Bhoomi Traditional Kitchen</h2>
          <p className="section-subtitle">
            Explore simple, healthy, and nurturing traditional recipes curated by Ayurvedic chefs using our pure farm ingredients.
          </p>

          <div className="grid-3" style={{ marginTop: '40px' }}>
            {/* Card 1 */}
            <div className="recipe-card glass" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img 
                src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" 
                alt="Bulletproof Ghee Coffee" 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>5 Mins • Easy</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.25rem' }}>Vedic Ghee Coffee</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  A premium morning beverage blending organic coffee with a teaspoon of grass-fed A2 Ghee for prolonged energy, stable focus, and zero gut acidity.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="recipe-card glass" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img 
                src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400" 
                alt="Ghee Roast Paneer" 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>15 Mins • Medium</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.25rem' }}>Tawa Ghee Roast Paneer</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Artisanal fresh A2 paneer cubes shallow-fried in our aromatic Bilona Ghee with handground dry red chilies, curry leaves, pepper, and garlic.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="recipe-card glass" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img 
                src="https://images.unsplash.com/photo-1571244856341-4f3dd95db33e?auto=format&fit=crop&q=80&w=400" 
                alt="Dahi Raita with Herbs" 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>10 Mins • Easy</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.25rem' }}>Pomegranate Clay-Pot Raita</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  Thick set A2 curd beaten smoothly, folded with fresh ruby-red pomegranates, roasted cumin, black salt, and a garnish of fresh mint leaves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk & Wholesale Orders Section */}
      <section className="section bulk-wholesale-section" style={{ background: 'var(--color-bg-base)' }}>
        <div className="container">
          <span className="section-tag">Wholesale & Special Events</span>
          <h2 className="section-title">Bulk Orders & Corporate Gifting</h2>
          <p className="section-subtitle">
            Planning a wedding, festival gifts, or looking for premium organic wholesale supplies? We offer custom packaging, jar sizes, and direct farm logistics.
          </p>

          <div className="bulk-grid glass" style={{ border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Info Panel */}
            <div className="bulk-info" style={{ padding: '40px', backgroundColor: 'var(--color-primary-dark)', color: '#ffffff' }}>
              <h3 className="bulk-info-title" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontSize: '1.6rem', marginBottom: '24px' }}>
                Why Partner with Amrit Bhoomi?
              </h3>
              <ul className="bulk-benefits-list" style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: 'var(--color-accent-light)' }}>✓ Custom Packaging</strong>
                  <span style={{ fontSize: '0.9rem', color: '#e4ede6' }}>Beautiful traditional ceramic barnis, custom labels, and personalized gift tags for weddings or corporate events.</span>
                </li>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: 'var(--color-accent-light)' }}>✓ Absolute Purity Guaranteed</strong>
                  <span style={{ fontSize: '0.9rem', color: '#e4ede6' }}>Every batch is traditionally processed, lab-certified pure, and direct from our clean organic farms.</span>
                </li>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: 'var(--color-accent-light)' }}>✓ Direct Farm Logistics</strong>
                  <span style={{ fontSize: '0.9rem', color: '#e4ede6' }}>Specialized bulk delivery solutions ensuring cold-chain and quality controls are maintained throughout transport.</span>
                </li>
                <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: 'var(--color-accent-light)' }}>✓ Flexible Quantities</strong>
                  <span style={{ fontSize: '0.9rem', color: '#e4ede6' }}>Order sizes ranging from 10L/kg to tons, cooked in small batches to preserve premium quality.</span>
                </li>
              </ul>

              <div className="bulk-trust-footer" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '0.85rem', color: 'var(--color-accent)' }}>
                ✉ wholesale@amritbhoomi.com | ☎ +91 98765 43210
              </div>
            </div>

            {/* Form Panel */}
            <div className="bulk-form-wrapper" style={{ padding: '40px' }}>
              <h3 className="bulk-form-title" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.6rem', marginBottom: '24px' }}>
                Send a Bulk Inquiry
              </h3>
              <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-row-2">
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={bulkName} 
                      onChange={(e) => setBulkName(e.target.value)} 
                      placeholder="e.g. Rajan Malhotra" 
                      required 
                      style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Work Email *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={bulkEmail} 
                      onChange={(e) => setBulkEmail(e.target.value)} 
                      placeholder="e.g. rajan@company.com" 
                      required 
                      style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Select Product Category *</label>
                    <select 
                      className="sort-select" 
                      style={{ width: '100%', height: '42px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none' }} 
                      value={bulkProduct} 
                      onChange={(e) => setBulkProduct(e.target.value)}
                    >
                      <option value="ghee">Bilona Ghee (Gir Cow / Buffalo)</option>
                      <option value="dairy">Fresh Dairy (Milk, Paneer, Curd, Butter)</option>
                      <option value="oils">Wood-Pressed Oils</option>
                      <option value="honey">Wild Honey</option>
                      <option value="pickles">Organic Pickles</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Approximate Requirement *</label>
                    <select 
                      className="sort-select" 
                      style={{ width: '100%', height: '42px', padding: '0 10px', border: '1px solid var(--color-border)', borderRadius: '6px', outline: 'none' }} 
                      value={bulkQty} 
                      onChange={(e) => setBulkQty(e.target.value)}
                    >
                      <option value="10L">10 Liters / Kilograms</option>
                      <option value="25L">25 Liters / Kilograms</option>
                      <option value="50L">50 Liters / Kilograms</option>
                      <option value="100L">100+ Liters / Kilograms</option>
                      <option value="custom">Custom Commercial Quantity</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Specific Details / Event Requirements</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    value={bulkMsg} 
                    onChange={(e) => setBulkMsg(e.target.value)} 
                    placeholder="Describe custom jar labeling, event dates, or packaging requirements..."
                    style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Submit Wholesale Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable FAQ Accordion Section (Premium Two-column Layout) */}
      <section className="section faq-section" style={{ background: '#fdfdfa', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '80px 0' }}>
        <div className="container">
          <div className="faq-layout">
            {/* Left Column: FAQ Accordion */}
            <div className="faq-left">
              <span className="section-tag" style={{ margin: 0 }}>Frequently Answered</span>
              <h2 className="journey-title" style={{ margin: '8px 0 20px 0' }}>Frequently Asked Questions</h2>
              
              <div className="faq-list">
                {FAQ_ITEMS.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`faq-item ${openFaqIdx === idx ? 'open' : ''}`}
                  >
                    <button 
                      className="faq-question-btn" 
                      onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-icon-arrow">{openFaqIdx === idx ? '−' : '+'}</span>
                    </button>
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Farmer Illustration */}
            <div className="faq-right">
              <div className="faq-farmer-card">
                <img src="/farmer_holding_ghee.png" alt="Pure A2 Desi Cow Ghee" className="faq-farmer-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonial Carousel */}
      <section className="section reviews-section">
        <div className="container">
          <span className="section-tag">Words of Appreciation</span>
          <h2 className="section-title">Loved by Health Lovers</h2>
          
          <div className="reviews-carousel">
            <div className="review-slide" key={activeReviewIdx}>
              <div className="review-stars">
                {Array.from({ length: TESTIMONIALS[activeReviewIdx].rating }).map((_, i) => (
                  <span key={i} style={{ fontSize: '20px' }}>★</span>
                ))}
              </div>
              <p className="review-comment">
                "{TESTIMONIALS[activeReviewIdx].comment}"
              </p>
              <h4 className="review-author">{TESTIMONIALS[activeReviewIdx].author}</h4>
              <span className="review-role">{TESTIMONIALS[activeReviewIdx].role}</span>
            </div>

            <div className="carousel-controls">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  className={`carousel-dot ${activeReviewIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveReviewIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Auth Icon Button (only show if not logged in) */}
      {!user && (
        <button 
          className="floating-auth-btn animate-bounce"
          onClick={() => setIsAuthPopupOpen(true)}
          aria-label="Access Account Login"
          title="Sign In / Register"
        >
          <User size={22} />
        </button>
      )}

      {/* Centered Auth Card Popup (Kasutam Style Gold Overlay) */}
      {isAuthPopupOpen && !user && (
        <div className="auth-overlay">
          <div className="auth-popup">
          <button 
            onClick={dismissAuthPopup}
            className="auth-popup-close"
            aria-label="Close login popup"
          >
            ✕
          </button>
          
          {/* Logo & Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
            <img 
              src="/logo.jpg" 
              alt="Amrit Bhoomi Logo" 
              style={{ height: '48px', width: 'auto', borderRadius: '8px', objectFit: 'contain', border: '1px solid rgba(0,0,0,0.06)' }} 
            />
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary-dark)', fontSize: '1.25rem', marginTop: '12px', marginBottom: '2px', textAlign: 'center', fontWeight: 'bold' }}>
              Login now to avail best offers!
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', letterSpacing: '0.5px' }}>
              Innovative &bull; Pure &bull; Natural
            </span>
          </div>

          <div className="auth-popup-form-box">
            <div className="auth-popup-tabs">
              <button 
                className={`auth-popup-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
              >
                Sign In
              </button>
              <button 
                className={`auth-popup-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthTab('register')}
              >
                Join Free
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleAuthLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px', textAlign: 'center' }}>
                  Sign in to track orders and complete checkout faster.
                </p>
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="form-input" 
                    style={{ paddingLeft: '38px', margin: 0, width: '100%', height: '40px', fontSize: '0.85rem' }}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="form-input" 
                    style={{ paddingLeft: '38px', margin: 0, width: '100%', height: '40px', fontSize: '0.85rem' }}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '40px', marginTop: '4px' }}
                  disabled={authSubmitting}
                >
                  {authSubmitting ? 'Authenticating...' : <>Sign In <ArrowRight size={14} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px', textAlign: 'center' }}>
                  Create a farm account to save shipping addresses.
                </p>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Your Full Name" 
                    className="form-input" 
                    style={{ paddingLeft: '38px', margin: 0, width: '100%', height: '40px', fontSize: '0.85rem' }}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="form-input" 
                    style={{ paddingLeft: '38px', margin: 0, width: '100%', height: '40px', fontSize: '0.85rem' }}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="password" 
                    placeholder="Create Password" 
                    className="form-input" 
                    style={{ paddingLeft: '38px', margin: 0, width: '100%', height: '40px', fontSize: '0.85rem' }}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '40px', marginTop: '4px' }}
                  disabled={authSubmitting}
                >
                  {authSubmitting ? 'Registering...' : <>Register Account <UserPlus size={14} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
export default Home;
