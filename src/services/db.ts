import { isDemoMode, db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  where
} from 'firebase/firestore';

export interface ProductOption {
  size: string; // e.g. "500ml", "1L", "2L", "5L", "400g", "1kg"
  price: number;
  stock: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  details: string;
  category: 'ghee' | 'oils' | 'honey' | 'pickles' | 'dairy';
  image: string;
  gallery: string[];
  benefits: string[];
  options: ProductOption[];
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  featured: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'razorpay' | 'cod';
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%, or 200 for ₹200 off
  minPurchase: number;
  active: boolean;
}

// --- INITIAL SEED DATA FOR DEMO MODE ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "a2-desi-cow-ghee",
    name: "A2 Desi Cow Bilona Ghee",
    description: "Handcrafted from native Gir Cow A2 Milk using the traditional wooden Bilona method and slow-cooked in mud pots.",
    details: "Our flagship A2 Gir Cow Ghee is prepared using the Vedic 'Bilona' process. We culture raw A2 milk into curd, churn the curd with wooden churners to extract white butter (makkhan), and then slow-heat it in earthen pots over firewood. This traditional slow-cooking locks in pure vitamins, antioxidants, and yields an ultra-granular golden texture with an authentic aroma.",
    category: "ghee",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396176/crizasdmejbw4bquizyl.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396176/crizasdmejbw4bquizyl.jpg"
    ],
    benefits: [
      "100% Organic & Native Gir Cow A2 Milk",
      "Traditional Vedic Bilona Churned (Curd-based)",
      "Slow-cooked in earthen pots for authentic granular texture",
      "Boosts immunity, speeds digestion, and supports heart health",
      "High smoke point (250°C), ideal for Indian cooking"
    ],
    options: [
      { size: "500ml", price: 1100, stock: 45 },
      { size: "1 Liter", price: 1950, stock: 60 },
      { size: "2 Liter", price: 3800, stock: 20 },
      { size: "5 Liter", price: 9200, stock: 10 }
    ],
    rating: 4.9,
    reviewsCount: 38,
    reviews: [
      { id: "r1", userName: "Aarav Sharma", rating: 5, comment: "Absolutely authentic! The aroma immediately took me back to my grandmother's village. The granular texture is perfect.", date: "2026-07-10" },
      { id: "r2", userName: "Priyanka Patel", rating: 5, comment: "I have tried multiple A2 ghee brands, but Amrit Bhoomi's hand-churned ghee is by far the most premium and delicious one.", date: "2026-07-12" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "a2-desi-buffalo-ghee",
    name: "Pure A2 Buffalo Bilona Ghee",
    description: "Traditionally churned white butter ghee prepared from milk of grass-fed Murrah buffaloes.",
    details: "Amrit Bhoomi A2 Buffalo Ghee is made using milk from elite Murrah buffaloes raised on organic pastures. Prepared using the traditional curd-churning method, this ghee is naturally rich in healthy fats, has a creamy texture, and a pleasant, mild flavor. Highly valued for building strength and stamina.",
    category: "ghee",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396182/mdz7qsgsfhw0wmqfcz5q.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396182/mdz7qsgsfhw0wmqfcz5q.jpg"
    ],
    benefits: [
      "Sourced from premium grass-fed Murrah Buffaloes",
      "Rich in calcium, magnesium, and phosphorus",
      "Perfect for building physical strength, weight gain, and bone density",
      "Prepared using traditional Bilona method"
    ],
    options: [
      { size: "500ml", price: 800, stock: 30 },
      { size: "1 Liter", price: 1500, stock: 40 },
      { size: "2 Liter", price: 2900, stock: 15 },
      { size: "5 Liter", price: 7000, stock: 5 }
    ],
    rating: 4.7,
    reviewsCount: 14,
    reviews: [
      { id: "r3", userName: "Rajesh Kumar", rating: 5, comment: "Very good quality buffalo ghee. It is thick and adds a rich taste to parathas.", date: "2026-07-05" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "wood-pressed-mustard-oil",
    name: "Wood-Pressed Mustard Oil (Kachi Ghani)",
    description: "100% pure cold wood-pressed black mustard oil, extracted slowly to retain natural pungency, nutrients, and flavor.",
    details: "Extracted in traditional wooden mills (Kolhu) at low temperatures from premium quality black mustard seeds. This ancient cold-pressing technique ensures that the oil retains its high level of Monounsaturated Fatty Acids (MUFA), intense aroma, and rich, natural pungent taste.",
    category: "oils",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396191/bom9j2wiigwuiiz9l4hi.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396191/bom9j2wiigwuiiz9l4hi.jpg"
    ],
    benefits: [
      "Wood pressed (Kolhu/Kachi Ghani) below 40°C",
      "Retains natural pungency, antioxidants, and Omega-3/6",
      "No chemical refining, decolorizing, or preservatives",
      "Promotes heart health and boosts blood circulation"
    ],
    options: [
      { size: "1 Liter", price: 320, stock: 80 },
      { size: "5 Liter", price: 1550, stock: 25 }
    ],
    rating: 4.8,
    reviewsCount: 22,
    reviews: [
      { id: "r4", userName: "Sunita Devi", rating: 5, comment: "I use this for making all my traditional pickles and curries. Excellent flavor, very strong and pure.", date: "2026-07-08" }
    ],
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "wood-pressed-coconut-oil",
    name: "Wood-Pressed Virgin Coconut Oil",
    description: "Cold wood-pressed extraction from sun-dried sulfur-free copra. 100% natural and multi-purpose.",
    details: "Our wood-pressed coconut oil is extracted from handpicked, sun-dried copras using wooden pressers. The cold extraction preserves the fresh sweet aroma, vital nutrients, and Medium Chain Triglycerides (MCTs). Extremely versatile, perfect for cooking, baking, hair nourishing, and skin moisturizing.",
    category: "oils",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396195/d7jtua3b52y6xxdzpka0.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396195/d7jtua3b52y6xxdzpka0.jpg"
    ],
    benefits: [
      "Cold-extracted in wooden churners, never heated",
      "Rich in Lauric acid and MCTs for fast energy",
      "Pure white solidifies below 24°C, a hallmark of purity",
      "Multi-purpose: cooking, skin moisturizer, and hair tonic"
    ],
    options: [
      { size: "500ml", price: 380, stock: 50 },
      { size: "1 Liter", price: 720, stock: 45 }
    ],
    rating: 4.9,
    reviewsCount: 19,
    reviews: [
      { id: "r5", userName: "Kabir Mehta", rating: 5, comment: "Love the aroma! I use it as a hair oil and also for cooking. Solidifies in winter, which shows its pure nature.", date: "2026-07-14" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "raw-himalayan-honey",
    name: "Organic Raw Himalayan Honey",
    description: "100% raw, unpasteurized, and unfiltered honey harvested from the wildflowers of the Himalayan valleys.",
    details: "Sourced sustainably from native Apis laboriosa bee colonies in high-altitude wildflower fields of the Himalayas. This honey is cold-extracted and packed straight from the comb without heating, fine filtering, or pasteurization, ensuring all honey enzymes, royal jelly, and pollen are preserved.",
    category: "honey",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396197/jlolhmmdz8fnztgpy4q7.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396197/jlolhmmdz8fnztgpy4q7.jpg"
    ],
    benefits: [
      "Directly from Himalayan forests, untouched by pollution",
      "Raw & Unpasteurized to preserve active enzymes",
      "Rich source of natural antioxidants, vitamins, and minerals",
      "No added sugars, corn syrup, or artificial colorings"
    ],
    options: [
      { size: "500g", price: 480, stock: 40 },
      { size: "1kg", price: 900, stock: 30 }
    ],
    rating: 4.8,
    reviewsCount: 29,
    reviews: [
      { id: "r6", userName: "Aditi Rao", rating: 5, comment: "This honey is dense and has a unique wild herbal flavor. Best sweet replacement for morning green tea.", date: "2026-07-11" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "handcrafted-mango-pickle",
    name: "Handcrafted Spiced Mango Pickle",
    description: "Grandma's recipe organic green mangoes pickled in cold-pressed mustard oil and handground spices.",
    details: "Prepared in traditional ceramic jars (Barnis) using raw tang, crisp green mangoes harvested from organic farms. Hand-mixed with custom grounded spices (fennel, fenugreek, mustard, red chili) and fully matured under the natural warmth of the sun. Preserved exclusively in wood-pressed mustard oil.",
    category: "pickles",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396199/o3pvgqsdgqwgde87yb7e.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396199/o3pvgqsdgqwgde87yb7e.jpg"
    ],
    benefits: [
      "Matured under sun in earthen barnis for 21 days",
      "Preserved in cold wood-pressed mustard oil",
      "No chemical preservatives or synthetic vinegar",
      "Rich in natural probiotics, good for gut digestion"
    ],
    options: [
      { size: "400g", price: 290, stock: 100 }
    ],
    rating: 4.9,
    reviewsCount: 42,
    reviews: [
      { id: "r7", userName: "Meera Gupta", rating: 5, comment: "OMG! This pickle tastes exactly like my grandmother's home. Not too salty, perfectly spicy, and real mango pieces.", date: "2026-07-09" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "a2-gir-cow-milk",
    name: "Fresh A2 Gir Cow Milk",
    description: "Pure, unadulterated, and farm-fresh A2 Gir Cow raw milk, chilled immediately and delivered in eco-friendly glass bottles.",
    details: "Our raw A2 Gir Cow Milk is sourced daily from grass-fed native Gir cows. They graze on organic pastures rich in seasonal herbs. The milk is filtered and chilled to 4°C immediately after milking, with no pasteurization, processing, or additives, ensuring you get all natural vitamins, enzymes, and the A2 beta-casein protein in its purest form.",
    category: "dairy",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396169/us48gdquhokihzxsub5g.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396169/us48gdquhokihzxsub5g.jpg"
    ],
    benefits: [
      "100% Raw & Unprocessed A2 Milk",
      "Sourced from native grass-fed Gir Cows",
      "Rich in A2 beta-casein protein for easier digestion",
      "Delivered within 12 hours of milking in sanitized glass bottles",
      "Zero chemical preservatives, hormones, or antibiotics"
    ],
    options: [
      { size: "1 Liter", price: 95, stock: 150 },
      { size: "2 Liters", price: 185, stock: 80 }
    ],
    rating: 4.9,
    reviewsCount: 24,
    reviews: [
      { id: "rm1", userName: "Vikram Malhotra", rating: 5, comment: "This is the best milk I have tasted since childhood. Very rich cream layer format.", date: "2026-07-13" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "fresh-a2-paneer",
    name: "Artisanal Fresh A2 Paneer",
    description: "Traditional soft and creamy cottage cheese made from pure A2 cow milk, hand-pressed without chemicals.",
    details: "Amrit Bhoomi fresh Paneer is handcrafted in small batches using premium A2 cow milk. Curdled naturally with organic lemon juice or whey, and gently pressed in cotton muslin cloths. It is incredibly soft, moist, and melts in the mouth, retaining the delicate milky flavor without any starch, gums, or chemical coagulants.",
    category: "dairy",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396173/ulwmrrk99t9yl6awqzbr.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396173/ulwmrrk99t9yl6awqzbr.jpg"
    ],
    benefits: [
      "Handmade fresh daily using premium A2 cow milk",
      "Extremely soft texture that melts in your curries",
      "No added starches, gums, or chemical coagulants",
      "Excellent source of clean protein and calcium"
    ],
    options: [
      { size: "200g", price: 150, stock: 60 },
      { size: "500g", price: 350, stock: 40 }
    ],
    rating: 4.8,
    reviewsCount: 18,
    reviews: [
      { id: "rp1", userName: "Divya Sen", rating: 5, comment: "Super soft! Tastes exactly like home-curdled paneer. Highly recommended.", date: "2026-07-15" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "clay-pot-a2-curd",
    name: "Clay-Pot A2 Cultured Curd",
    description: "Thick, creamy set curd prepared traditionally in clay pots from boiled whole A2 cow milk.",
    details: "Our set curd is cultured in traditional clay pots (kulhads/handis). Clay is porous, absorbing excess water naturally to yield an incredibly thick, smooth, and creamy curd with a mild earthy aroma. This traditional process retains active probiotics, supporting excellent gut health and digestion.",
    category: "dairy",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
    gallery: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600"
    ],
    benefits: [
      "Slow set in natural clay pots for thick creamy texture",
      "Active probiotics that support gut microflora",
      "Mildly sweet, non-acidic taste kids love",
      "100% natural A2 cow milk, zero thickeners or gelatins"
    ],
    options: [
      { size: "500g", price: 90, stock: 90 },
      { size: "1kg", price: 170, stock: 50 }
    ],
    rating: 4.9,
    reviewsCount: 12,
    reviews: [
      { id: "rc1", userName: "Karan Johar", rating: 5, comment: "The earthiness from the clay pot is subtle but makes a massive difference in taste.", date: "2026-07-14" }
    ],
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "white-desi-butter",
    name: "Traditional White Butter (Makkhan)",
    description: "Unsalted, wood-churned white butter rich in probiotics, made fresh from whole A2 Cow curd.",
    details: "Amrit Bhoomi White Butter is churned directly from whole A2 cow milk curd using wooden bilona churners. Free from added salt, colorings, or preservatives, it is rich, creamy, and holds an authentic slightly tangy cultured flavor. Perfect on hot parathas, thalipeeth, or toasted breads.",
    category: "dairy",
    image: "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396177/z84qdq7uc3ot909uasau.jpg",
    gallery: [
      "https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396177/z84qdq7uc3ot909uasau.jpg"
    ],
    benefits: [
      "Churned using traditional wooden bilona from cultured curd",
      "Unsalted, chemical-free, and natural white color",
      "Rich in gut-friendly probiotics and fat-soluble vitamins",
      "Perfect melting addition to hot rotis and parathas"
    ],
    options: [
      { size: "250g", price: 220, stock: 40 },
      { size: "500g", price: 420, stock: 30 }
    ],
    rating: 4.9,
    reviewsCount: 15,
    reviews: [
      { id: "rb1", userName: "Nisha Madhulika", rating: 5, comment: "Reminds me of Krishna's butter stories. Extremely pure and flavorful.", date: "2026-07-16" }
    ],
    featured: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [];

// Helper to initialize local storage
const initializeLocalStorage = () => {
  if (!localStorage.getItem('amritbhoomi_products_v2')) {
    localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.removeItem('amritbhoomi_products');
  }
  if (!localStorage.getItem('amritbhoomi_coupons_v2')) {
    localStorage.setItem('amritbhoomi_coupons_v2', JSON.stringify(INITIAL_COUPONS));
    localStorage.removeItem('amritbhoomi_coupons');
  }
  if (!localStorage.getItem('amritbhoomi_orders_v2')) {
    localStorage.setItem('amritbhoomi_orders_v2', JSON.stringify([]));
    localStorage.removeItem('amritbhoomi_orders');
  }
};

// Execute initialization
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

// --- DATABASE SERVICE IMPLEMENTATION ---

export const getProducts = async (): Promise<Product[]> => {
  if (!isDemoMode && db) {
    try {
      const q = collection(db, 'products');
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      // If Firestore is empty, seed it
      if (list.length === 0) {
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), prod);
          list.push(prod);
        }
      }
      return list;
    } catch (e) {
      console.error("Firestore getProducts failed, loading local.", e);
    }
  }
  // LocalStorage Mock fallback
  const items = localStorage.getItem('amritbhoomi_products_v2');
  return items ? JSON.parse(items) : INITIAL_PRODUCTS;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (!isDemoMode && db) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (e) {
      console.error("Firestore getProductById failed.", e);
    }
  }
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
};

export const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>): Promise<Product> => {
  const newProduct: Product = {
    ...productData,
    id: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: 5.0,
    reviewsCount: 0,
    reviews: [],
    createdAt: new Date().toISOString()
  };

  if (!isDemoMode && db) {
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
      return newProduct;
    } catch (e) {
      console.error("Firestore addProduct failed.", e);
    }
  }

  const products = await getProducts();
  products.push(newProduct);
  localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(products));
  return newProduct;
};

export const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<Product> => {
  if (!isDemoMode && db) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedFields);
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
    } catch (e) {
      console.error("Firestore updateProduct failed.", e);
    }
  }

  const products = await getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updatedFields };
    localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(products));
    return products[idx];
  }
  throw new Error("Product not found");
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isDemoMode && db) {
    try {
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (e) {
      console.error("Firestore deleteProduct failed.", e);
    }
  }

  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(filtered));
  return true;
};

// --- ORDERS API ---

export const getOrders = async (): Promise<Order[]> => {
  if (!isDemoMode && db) {
    try {
      const q = collection(db, 'orders');
      const querySnapshot = await getDocs(q);
      const list: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error("Firestore getOrders failed.", e);
    }
  }
  const orders = localStorage.getItem('amritbhoomi_orders_v2');
  const parsedOrders: Order[] = orders ? JSON.parse(orders) : [];
  return parsedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getOrdersByUser = async (email: string): Promise<Order[]> => {
  if (!isDemoMode && db) {
    try {
      const q = query(collection(db, 'orders'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      const list: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error("Firestore getOrdersByUser failed.", e);
    }
  }
  const orders = await getOrders();
  return orders.filter(o => o.email.toLowerCase() === email.toLowerCase());
};

export const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
  const newOrder: Order = {
    ...orderData,
    id: 'KSM-' + Math.floor(100000 + Math.random() * 900000),
    status: 'processing',
    createdAt: new Date().toISOString()
  };

  // Deduct stock in Firestore or LocalStorage
  try {
    const products = await getProducts();
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const opt = prod.options.find(o => o.size === item.size);
        if (opt) {
          opt.stock = Math.max(0, opt.stock - item.quantity);
          if (!isDemoMode && db) {
            const docRef = doc(db, 'products', prod.id);
            await updateDoc(docRef, { options: prod.options });
          }
        }
      }
    }
    if (isDemoMode || !db) {
      localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(products));
    }
  } catch (e) {
    console.error("Error updating stock during placeOrder:", e);
  }

  if (!isDemoMode && db) {
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      return newOrder;
    } catch (e) {
      console.error("Firestore placeOrder failed.", e);
      throw e;
    }
  }

  const orders = await getOrders();
  orders.push(newOrder);
  localStorage.setItem('amritbhoomi_orders_v2', JSON.stringify(orders));

  return newOrder;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
  if (!isDemoMode && db) {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      return;
    } catch (e) {
      console.error("Firestore updateOrderStatus failed.", e);
      throw e;
    }
  }

  const orders = await getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem('amritbhoomi_orders_v2', JSON.stringify(orders));
  }
};

export const updateOrderPaymentStatus = async (id: string, paymentStatus: Order['paymentStatus']): Promise<void> => {
  if (!isDemoMode && db) {
    try {
      await updateDoc(doc(db, 'orders', id), { paymentStatus });
      return;
    } catch (e) {
      console.error("Firestore updateOrderPaymentStatus failed.", e);
      throw e;
    }
  }

  const orders = await getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) {
    orders[idx].paymentStatus = paymentStatus;
    localStorage.setItem('amritbhoomi_orders_v2', JSON.stringify(orders));
  }
};

// --- COUPON API ---

export const getCoupons = async (): Promise<Coupon[]> => {
  if (!isDemoMode && db) {
    try {
      const q = collection(db, 'coupons');
      const querySnapshot = await getDocs(q);
      const list: Coupon[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Coupon);
      });
      return list;
    } catch (e) {
      console.error("Firestore getCoupons failed.", e);
    }
  }
  const coupons = localStorage.getItem('amritbhoomi_coupons_v2');
  return coupons ? JSON.parse(coupons) : INITIAL_COUPONS;
};

export const addCoupon = async (coupon: Coupon): Promise<Coupon> => {
  if (!isDemoMode && db) {
    try {
      await setDoc(doc(db, 'coupons', coupon.code), coupon);
      return coupon;
    } catch (e) {
      console.error("Firestore addCoupon failed.", e);
    }
  }

  const coupons = await getCoupons();
  if (coupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
    throw new Error("Coupon already exists");
  }
  coupons.push({ ...coupon, code: coupon.code.toUpperCase() });
  localStorage.setItem('amritbhoomi_coupons_v2', JSON.stringify(coupons));
  return coupon;
};

export const deleteCoupon = async (code: string): Promise<boolean> => {
  if (!isDemoMode && db) {
    try {
      await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
      return true;
    } catch (e) {
      console.error("Firestore deleteCoupon failed.", e);
    }
  }

  const coupons = await getCoupons();
  const filtered = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  localStorage.setItem('amritbhoomi_coupons_v2', JSON.stringify(filtered));
  return true;
};

export const addReview = async (productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  const newReview: Review = {
    ...review,
    id: 'rev-' + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0]
  };

  const products = await getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    const prod = products[idx];
    const updatedReviews = [newReview, ...prod.reviews];
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));

    const fieldsToUpdate = {
      reviews: updatedReviews,
      rating: newRating,
      reviewsCount: updatedReviews.length
    };

    await updateProduct(productId, fieldsToUpdate);
    return newReview;
  }
  throw new Error("Product not found");
};

export const clearAllProducts = async (): Promise<boolean> => {
  if (!isDemoMode && db) {
    try {
      const q = collection(db, 'products');
      const querySnapshot = await getDocs(q);
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, 'products', document.id));
      }
      return true;
    } catch (e) {
      console.error("Firestore clearAllProducts failed.", e);
      return false;
    }
  }
  localStorage.setItem('amritbhoomi_products_v2', JSON.stringify([]));
  return true;
};

export const seed200Products = async (): Promise<boolean> => {
  // 1. Wipe existing
  await clearAllProducts();

  // 2. Define Category metadata maps
  const categories: ('ghee' | 'oils' | 'honey' | 'pickles' | 'dairy')[] = ['ghee', 'oils', 'honey', 'pickles', 'dairy'];

  const categoryMetaData: Record<string, {
    names: string[];
    images: string[];
    details: string;
    benefits: string[];
    sizes: string[];
    priceBase: number;
  }> = {
    ghee: {
      names: ['Pure Gir Cow Vedic Bilona Ghee', 'Hand-Churned Golden A2 Cow Ghee', 'Premium Vedic Buffalo Bilona Ghee', 'Organic Grass-Fed Cow Butter Ghee', 'Traditional Clay-Pot Firewood Ghee'],
      images: [
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396176/crizasdmejbw4bquizyl.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396177/z84qdq7uc3ot909uasau.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396182/mdz7qsgsfhw0wmqfcz5q.jpg'
      ],
      details: 'Handcrafted using ancient Indian Vedic Bilona curd-churning techniques, then slow-cooked over firewood in earthen pots. Rich in vitamins A, D, E, K, butyric acid, and antioxidants for strong gut health.',
      benefits: ['Prepared using bidirectional wood churners', 'Slow-cooked in clay pots over firewood', 'Granular texture and rich aroma', '100% natural, lactose-free and gluten-free'],
      sizes: ['500ml', '1 Liter', '2 Liter', '5 Liter'],
      priceBase: 900
    },
    oils: {
      names: ['Kachi Ghani Cold Wood-Pressed Mustard Oil', 'Organic Wood-Pressed Yellow Mustard Oil', 'Cold-Pressed Virgin Coconut Oil', 'Traditional Wooden-Churned Sesame Oil', 'Extra Virgin Raw Groundnut Oil'],
      images: [
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396191/bom9j2wiigwuiiz9l4hi.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396195/d7jtua3b52y6xxdzpka0.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396174/xscrsqiqxd1bekafuqho.jpg'
      ],
      details: 'Extracted at low speeds in traditional wooden mills (Kolhus) under 40 degrees. Preserves essential fatty acids (Omega 3 & 6), natural vitamins, minerals, and flavor without chemical refinement.',
      benefits: ['Wood-pressed extraction preserves active enzymes', 'Zero chemical solvents, zero additives', 'Rich in natural heart-healthy MUFAs', 'Perfect for cooking, stir frying, and body massage'],
      sizes: ['1 Liter', '2 Liter', '5 Liter'],
      priceBase: 280
    },
    honey: {
      names: ['Raw Wild Forest Organic Honey', 'Natural Unfiltered Multi-Floral Honey', 'Pure Himalayan Sidr Honey', 'Medicinal Neem Infused Flower Honey', 'Organic Lychee Blossom Honey'],
      images: [
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396197/jlolhmmdz8fnztgpy4q7.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396198/s1aghnshytinhhkbr5mi.jpg'
      ],
      details: 'Harvested ethically from natural beehives in organic forest clusters. Raw, unprocessed, and unfiltered, preserving active enzymes, pollen grains, and medicinal value.',
      benefits: ['Ethically harvested, raw and unfiltered', 'Naturally rich in antioxidants and pollen grains', 'No added sugar syrup or pasteurization', 'Acts as a natural immunity booster'],
      sizes: ['250g', '500g', '1kg'],
      priceBase: 250
    },
    pickles: {
      names: ['Homemade Spicy Green Chili Pickle', 'Traditional Grandma Mango Achar', 'Tangy Lime Garlic Achar', 'Organic Ginger Lime Pickle', 'Spicy Carrot & Cauliflower Mix Pickle'],
      images: [
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396199/o3pvgqsdgqwgde87yb7e.jpg'
      ],
      details: 'Prepared using traditional recipes. Sun-dried and slow-cured in pure wood-pressed mustard oil with hand-ground spices for rich, tangy probiotic flavors.',
      benefits: ['Traditionally sun-cured over weeks', 'Preserved in pure wood-pressed mustard oil', 'No artificial colors or preservatives', 'Rich in natural gut-friendly lactobacillus probiotics'],
      sizes: ['250g', '400g', '800g'],
      priceBase: 180
    },
    dairy: {
      names: ['Fresh A2 Gir Cow Milk', 'Premium Grass-Fed Murrah Buffalo Milk', 'Clay-Pot Set Probiotic Dahi (Curd)', 'Fresh Soft Cottage Cheese (Paneer)', 'Hand-Churned Country White Butter'],
      images: [
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396169/us48gdquhokihzxsub5g.jpg',
        'https://res.cloudinary.com/de6uqmt1m/image/upload/v1784396173/ulwmrrk99t9yl6awqzbr.jpg',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600'
      ],
      details: 'Produced sustainably at our local organic pastures. Farm-fresh, unadulterated, immediately chilled, and delivered in glass jars to retain rich vitamins and minerals.',
      benefits: ['Cruelty-free sourcing from happy grass-fed cows', 'Eco-friendly glass bottle packaging', 'Probiotic-rich and gut friendly', 'No hormone injections or synthetic feed'],
      sizes: ['1 Liter', '2 Liter', '500g', '1kg'],
      priceBase: 90
    }
  };

  // 3. Seed 210 products
  if (isDemoMode || !db) {
    localStorage.setItem('amritbhoomi_products_v2', JSON.stringify([]));
  }

  for (let i = 1; i <= 210; i++) {
    const category = categories[(i - 1) % categories.length];
    const meta = categoryMetaData[category];
    
    // Choose product metadata index
    const nameIndex = (i - 1) % meta.names.length;
    const imgIndex = (i - 1) % meta.images.length;
    
    const prodName = `${meta.names[nameIndex]} (Batch #${100 + i})`;
    const prodId = `prod-${category}-${i}`;
    
    // Generate pricing options based on sizing
    const options: ProductOption[] = meta.sizes.map((size, sIdx) => {
      const priceFactor = sIdx + 1;
      const sizeMultiplier = size.includes('500ml') || size.includes('250g') || size.includes('500g') || size.includes('400g') ? 0.6 : (size.includes('5 Liter') || size.includes('2 Liter') ? priceFactor * 0.9 : priceFactor);
      return {
        size,
        price: Math.round(meta.priceBase * sizeMultiplier),
        stock: Math.floor(Math.random() * 80) + 10
      };
    });

    const reviews: Review[] = [
      {
        id: `rev-${prodId}-1`,
        userName: ['Ramesh Patel', 'Sneha Reddy', 'Amit Kumar', 'Divya Sen', 'Vikram Singh'][Math.floor(Math.random() * 5)],
        rating: Math.floor(Math.random() * 2) + 4,
        comment: ['Extremely pure quality. Strongly recommended!', 'Superb taste and granular structure.', 'Best organic purchase. Truly authentic.', 'Excellent packing, pure taste. Will buy again.'][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    const newProd: Product = {
      id: prodId,
      name: prodName,
      description: `Delicious and pure ${prodName}. ${meta.details}`,
      details: meta.details,
      category,
      image: meta.images[imgIndex],
      gallery: [meta.images[imgIndex]],
      benefits: meta.benefits,
      options,
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
      reviewsCount: reviews.length,
      reviews,
      featured: i % 15 === 0,
      createdAt: new Date().toISOString()
    };

    if (!isDemoMode && db) {
      try {
        await setDoc(doc(db, 'products', newProd.id), newProd);
      } catch (e) {
        console.error(`Firestore seeding failed for ${prodId}`, e);
        return false;
      }
    } else {
      const products = localStorage.getItem('amritbhoomi_products_v2');
      const list: Product[] = products ? JSON.parse(products) : [];
      list.push(newProd);
      localStorage.setItem('amritbhoomi_products_v2', JSON.stringify(list));
    }
  }
  // 4. Seed dynamic coupons
  const defaultCoupons = [
    { code: "KASUTAM10", type: "percentage", value: 10, minPurchase: 500, active: true },
    { code: "BILO200", type: "fixed", value: 200, minPurchase: 1500, active: true },
    { code: "WELCOME15", type: "percentage", value: 15, minPurchase: 0, active: true }
  ];

  if (!isDemoMode && db) {
    try {
      const q = collection(db, 'coupons');
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'coupons', docSnap.id));
      }
      for (const cop of defaultCoupons) {
        await setDoc(doc(db, 'coupons', cop.code), cop);
      }
    } catch (e) {
      console.error("Failed to seed default coupons in Firestore", e);
    }
  } else {
    localStorage.setItem('amritbhoomi_coupons_v2', JSON.stringify(defaultCoupons));
  }

  return true;
};
