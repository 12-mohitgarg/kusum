import React, { createContext, useContext, useState, useEffect } from 'react';
import { isDemoMode, auth } from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    if (!isDemoMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // In standard firebase, admin flag could be in custom claims or check a list.
          // For simplicity, any email ending with '@amritbhoomi.com' or specific admin list
          const isAdmin = firebaseUser.email?.endsWith('@amritbhoomi.com') || firebaseUser.email === 'admin@amritbhoomi.com';
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Customer',
            isAdmin: !!isAdmin
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // LocalStorage Demo Auth init
      const stored = localStorage.getItem('amritbhoomi_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!isDemoMode && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }

    // Demo Mode logic
    if (email === 'admin@amritbhoomi.com' && password === 'admin') {
      const adminUser: UserProfile = {
        uid: 'demo-admin-uid',
        email: 'admin@amritbhoomi.com',
        displayName: 'Amrit Bhoomi Admin',
        isAdmin: true
      };
      setUser(adminUser);
      localStorage.setItem('amritbhoomi_auth_user', JSON.stringify(adminUser));
      return;
    }

    // Check demo registered users
    const registeredStr = localStorage.getItem('amritbhoomi_registered_users');
    const users: any[] = registeredStr ? JSON.parse(registeredStr) : [];
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const normalUser: UserProfile = {
        uid: foundUser.uid,
        email: foundUser.email,
        displayName: foundUser.displayName,
        isAdmin: foundUser.email.endsWith('@amritbhoomi.com')
      };
      setUser(normalUser);
      localStorage.setItem('amritbhoomi_auth_user', JSON.stringify(normalUser));
    } else {
      throw new Error("Invalid email or password. (For Admin use admin@amritbhoomi.com / admin)");
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    if (!isDemoMode && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return;
    }

    // Demo Mode logic
    const registeredStr = localStorage.getItem('amritbhoomi_registered_users');
    const users: any[] = registeredStr ? JSON.parse(registeredStr) : [];
    
    if (users.some(u => u.email === email)) {
      throw new Error("Email already registered!");
    }

    const newUser = {
      uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      displayName
    };
    users.push(newUser);
    localStorage.setItem('amritbhoomi_registered_users', JSON.stringify(users));

    // Auto login
    const normalUser: UserProfile = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      isAdmin: newUser.email.endsWith('@amritbhoomi.com')
    };
    setUser(normalUser);
    localStorage.setItem('amritbhoomi_auth_user', JSON.stringify(normalUser));
  };

  const logout = async () => {
    if (!isDemoMode && auth) {
      await firebaseSignOut(auth);
      return;
    }

    // Demo Mode logout
    setUser(null);
    localStorage.removeItem('amritbhoomi_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isDemo: isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
