import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.js';
import {
  api,
  type User,
  type Category,
  type Product,
  type Order,
  type BankDetails,
  type SiteSettings,
  type NotificationItem,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '../lib/api.js';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPackage?: { name: string; price: number };
  customerNote?: string;
}

export interface AppliedCouponState {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface StoreContextType {
  // Navigation
  currentPage: string;
  pageParams: Record<string, any>;
  navigate: (page: string, params?: Record<string, any>) => void;

  // Auth
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; phone?: string; discordTag?: string }) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  demoLogin: (roleName: string) => Promise<void>;
  reloadUser: () => Promise<void>;

  // Data
  categories: Category[];
  siteSettings: SiteSettings | null;
  bankDetails: BankDetails | null;
  notifications: NotificationItem[];
  reloadCategories: () => Promise<void>;
  reloadSettings: () => Promise<void>;
  reloadNotifications: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedPackage?: { name: string; price: number }) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Coupon & Totals
  appliedCoupon: AppliedCouponState | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  cartOriginalTotal: number;
  cartDiscountAmount: number;
  cartFinalTotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Active Order State
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'xcm_cart_v1';
const WISHLIST_STORAGE_KEY = 'xcm_wishlist_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});

  const navigate = useCallback((page: string, params: Record<string, any> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Sync Cart
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch initial data
  const reloadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const reloadSettings = useCallback(async () => {
    try {
      const [settings, bank] = await Promise.all([api.getSiteSettings(), api.getBankDetails()]);
      setSiteSettings(settings);
      setBankDetails(bank);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }, []);

  const reloadUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setCurrentUser(data.user);
    } catch {
      removeAuthToken();
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const reloadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [currentUser]);

  useEffect(() => {
    reloadUser();
    reloadCategories();
    reloadSettings();
  }, [reloadUser, reloadCategories, reloadSettings]);

  useEffect(() => {
    if (currentUser) {
      reloadNotifications();
    }
  }, [currentUser, reloadNotifications]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login({ email, password: pass });
    setAuthToken(res.token);
    setCurrentUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string; discordTag?: string }): Promise<User> => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setCurrentUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await api.googleLogin({
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        googleId: user.uid,
        idToken,
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      return res.user;
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw new Error(error.message || 'Google sign-in was cancelled or failed.');
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    removeAuthToken();
    setCurrentUser(null);
    setNotifications([]);
  };

  // Helper for 1-click test login for user/reviewers
  const demoLogin = async (roleName: string) => {
    let email = 'owner@xcmnetwork.com';
    let pass = 'xcm_owner_2026';

    if (roleName === 'Finance Manager') {
      email = 'finance@xcmnetwork.com';
      pass = 'finance_xcm_2026';
    } else if (roleName === 'Order Manager') {
      email = 'orders@xcmnetwork.com';
      pass = 'orders_xcm_2026';
    } else if (roleName === 'Customer') {
      email = 'alex.buyer@gmail.com';
      pass = 'password123';
    } else if (roleName === 'Seller') {
      email = 'vortex@creatives.io';
      pass = 'password123';
    }

    await login(email, pass);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedPackage?: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, selectedPackage }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Totals calculation
  const cartOriginalTotal = cart.reduce((sum, item) => {
    const unitPrice = item.selectedPackage
      ? item.selectedPackage.price
      : item.product.discountPrice ?? item.product.originalPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const cartDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartFinalTotal = Math.max(0, cartOriginalTotal - cartDiscountAmount);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return { success: false, error: 'Enter a coupon code' };
    try {
      const categoryIds = cart.map((i) => i.product.categoryId);
      const res = await api.validateCoupon(code, cartOriginalTotal, categoryIds);
      setAppliedCoupon({
        code: res.code,
        type: res.type,
        value: res.value,
        discountAmount: res.discountAmount,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        pageParams,
        navigate,
        currentUser,
        authLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        demoLogin,
        reloadUser,
        categories,
        siteSettings,
        bankDetails,
        notifications,
        reloadCategories,
        reloadSettings,
        reloadNotifications,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartOriginalTotal,
        cartDiscountAmount,
        cartFinalTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        lastCreatedOrder,
        setLastCreatedOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
