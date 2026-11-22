import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingBag,
  MessageSquare,
  Tag,
  Building2,
  Users,
  Shield,
  Palette,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';
import {
  api,
  type Order,
  type Product,
  type Category,
  type Coupon,
  type Review,
  type User,
  type BankDetails,
  type SiteSettings,
  type WithdrawalRequest,
  type AuditLog,
  type OrderStatus,
} from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';
import { XCMLogo } from '../components/XCMLogo.js';

export const AdminPanel: React.FC = () => {
  const { currentUser, navigate, reloadSettings } = useStore();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'categories'
    | 'reviews'
    | 'coupons'
    | 'bank'
    | 'staff'
    | 'settings'
    | 'themes'
    | 'withdrawals'
    | 'audit'
  >('dashboard');

  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [bankSettings, setBankSettings] = useState<BankDetails | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Order inspection modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [discordTicketInput, setDiscordTicketInput] = useState('');
  const [orderNotesInput, setOrderNotesInput] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Add Product form state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pCat, setPCat] = useState('cat-gaming');
  const [pSubcat, setPSubcat] = useState('sub-mc');
  const [pPrice, setPPrice] = useState('49.99');
  const [pDiscount, setPDiscount] = useState('34.99');
  const [pStock, setPStock] = useState('10');
  const [pWarranty, setPWarranty] = useState('30-Day Full Replacement Warranty');
  const [pDesc, setPDesc] = useState('');
  const [pType, setPType] = useState<'account' | 'service' | 'digital_key' | 'subscription'>('account');
  const [pFeatured, setPFeatured] = useState(true);

  // Add Coupon form
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState('20');
  const [cMin, setCMin] = useState('0');
  const [cExpiry, setCExpiry] = useState('2027-12-31');

  // Add Staff form
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sRole, setSRole] = useState('Admin');

  // Review reply state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const isStaff = currentUser && [
    'Owner',
    'Super Admin',
    'Admin',
    'Finance Manager',
    'Order Manager',
    'Product Manager',
    'Support Manager',
    'Moderator',
  ].includes(currentUser.role);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        analyticsData,
        ordersData,
        productsData,
        categoriesData,
        couponsData,
        reviewsData,
        staffData,
        withdrawalsData,
        auditData,
        bankData,
        settingsData,
      ] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getAdminOrders().catch(() => []),
        api.getAdminProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getCoupons().catch(() => []),
        api.getAdminReviews().catch(() => []),
        api.getAdminStaff().catch(() => []),
        api.getAdminWithdrawals().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getBankDetails().catch(() => null),
        api.getSiteSettings().catch(() => null),
      ]);

      setAnalytics(analyticsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setCoupons(couponsData);
      setReviews(reviewsData);
      setStaffList(staffData);
      setWithdrawals(withdrawalsData);
      setAuditLogs(auditData);
      setBankSettings(bankData);
      setSiteSettings(settingsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadAllAdminData();
    }
  }, [isStaff]);

  if (!currentUser || !isStaff) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-white">XCM Restricted Staff Area</h1>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          You must be logged in as an authorized XCM Administrator or Staff member to view this console.
        </p>
        <button
          onClick={() => navigate('home')}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Action handlers
  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, status, notes);
      setMessage(`Order status updated to ${status}`);
      setTimeout(() => setMessage(null), 3000);
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleDiscordVerifySubmit = async (orderId: string) => {
    try {
      const res = await api.discordVerifyOrder(orderId, {
        discordTicketNumber: discordTicketInput,
        notes: orderNotesInput,
      });
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      setDiscordTicketInput('');
      setOrderNotesInput('');
      setMessage('Discord ticket verified and logged successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Discord verification failed');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, {
          name: pName,
          categoryId: pCat,
          subcategoryId: pSubcat,
          originalPrice: Number(pPrice),
          discountPrice: pDiscount ? Number(pDiscount) : undefined,
          stockQuantity: Number(pStock),
          warranty: pWarranty,
          description: pDesc,
          productType: pType,
          featured: pFeatured,
        });
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setEditingProduct(null);
      } else {
        const created = await api.createProduct({
          name: pName,
          categoryId: pCat,
          subcategoryId: pSubcat,
          originalPrice: Number(pPrice),
          discountPrice: pDiscount ? Number(pDiscount) : undefined,
          stockQuantity: Number(pStock),
          warranty: pWarranty,
          description: pDesc,
          productType: pType,
          featured: pFeatured,
          images: ['/src/assets/images/product_minecraft_account_1794043365430.jpg'],
        });
        setProducts((prev) => [created, ...prev]);
      }
      setIsAddProductOpen(false);
      resetProductForm();
      setMessage('Product catalog updated');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const resetProductForm = () => {
    setPName('');
    setPPrice('49.99');
    setPDiscount('34.99');
    setPStock('10');
    setPDesc('');
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage('Product deleted');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCoupon({
        code: cCode,
        type: cType,
        value: Number(cValue),
        minPurchase: Number(cMin),
        expiryDate: cExpiry,
      });
      setCoupons((prev) => [...prev, created]);
      setIsAddCouponOpen(false);
      setCCode('');
      setMessage(`Coupon ${created.code} activated`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleBankDetailsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankSettings) return;
    try {
      const updated = await api.updateBankDetails(bankSettings);
      setBankSettings(updated);
      setMessage('Bank details snapshot updated for future orders');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update bank details');
    }
  };

  const handleSiteSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      const updated = await api.updateSiteSettings(siteSettings);
      setSiteSettings(updated);
      reloadSettings();
      setMessage('Global platform settings updated');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update site settings');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createStaff({
        name: sName,
        email: sEmail,
        password: sPassword,
        role: sRole,
      });
      setStaffList((prev) => [...prev, created]);
      setIsAddStaffOpen(false);
      setSName('');
      setSEmail('');
      setSPassword('');
      setMessage(`Staff account created for ${created.name}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create staff');
    }
  };

  const handleProcessWithdrawal = async (id: string, action: 'approve' | 'reject') => {
    try {
      const updated = await api.processWithdrawal(id, action);
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? updated : w)));
      setMessage(`Withdrawal ${action}d`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Withdrawal processing failed');
    }
  };

  const handleReviewReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId || !replyText.trim()) return;
    try {
      const updated = await api.replyReview(replyReviewId, replyText);
      setReviews((prev) => prev.map((r) => (r.id === replyReviewId ? updated : r)));
      setReplyReviewId(null);
      setReplyText('');
      setMessage('Review reply posted');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reply to review');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'slips') return o.status === 'Slip Uploaded' || o.status === 'Under Review';
    if (orderFilter === 'verified') return o.status === 'Payment Verified' || o.status === 'Discord Verification';
    if (orderFilter === 'completed') return o.status === 'Completed';
    return o.status === orderFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-neutral-900 p-4 space-y-6 shrink-0">
        <div className="px-2 py-1">
          <XCMLogo size="sm" showStoreText={true} subtitle="CONSOLE" />
        </div>

        <div className="px-2 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400">
          <span>Active Staff:</span>{' '}
          <strong className="text-white block truncate">{currentUser.name}</strong>
          <span className="text-[10px] text-amber-400 font-semibold uppercase">{currentUser.role}</span>
        </div>

        <nav className="space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            9.1 Analytics
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              9.4 Orders & Slips
            </div>
            {analytics?.pendingSlips > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {analytics.pendingSlips}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            9.3 Products
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            9.2 Categories
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'coupons' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            9.6 Coupons
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            9.5 Reviews
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bank' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            9.7 Bank Settings
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'staff' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            9.8 Staff & RBAC
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'withdrawals' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            10. Marketplace Payouts
          </button>

          <button
            onClick={() => setActiveTab('themes')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'themes' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            9.10 Theme & Banner
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            9.9 Maintenance
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'audit' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Audit Logs
          </button>
        </nav>

        <div className="pt-4 border-t border-neutral-900">
          <button
            onClick={() => navigate('home')}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            Return to Storefront
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {message && (
          <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 9.1 ADMIN DASHBOARD ANALYTICS */}
        {activeTab === 'dashboard' && analytics && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">9.1 Analytics & Financial Overview</h1>
              <p className="text-xs text-neutral-400 mt-1">Live database performance metrics for store.xcmnetwork.com</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Total Realized Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </span>
                <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  ${analytics.totalRevenue.toFixed(2)}
                </div>
                <span className="text-[11px] text-neutral-500">Verified bank wire receipts</span>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </span>
                <div className="text-3xl font-bold font-mono text-white tabular-nums">
                  {analytics.totalOrders}
                </div>
                <span className="text-[11px] text-neutral-500">{analytics.completedOrders} completed successfully</span>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Pending Payment Slips</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </span>
                <div className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
                  {analytics.pendingSlips}
                </div>
                <span className="text-[11px] text-neutral-500">Action needed in Orders</span>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                  <span>Active Products</span>
                  <Package className="w-4 h-4 text-orange-400" />
                </span>
                <div className="text-3xl font-bold font-mono text-white tabular-nums">
                  {analytics.totalProducts}
                </div>
                <span className="text-[11px] text-neutral-500">Across 4 primary categories</span>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display">Recent Marketplace Transactions</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Order Code</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Slip</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-3 font-bold text-amber-400">#{o.orderCode}</td>
                        <td className="py-3 px-3 font-sans text-white">{o.customerName}</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">${o.finalPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          {o.paymentSlipUrl ? (
                            <span className="text-emerald-400 text-[11px]">Attached</span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setActiveTab('orders');
                            }}
                            className="px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500 hover:to-red-600 border border-amber-500/30 text-amber-300 hover:text-white rounded text-[11px] transition-all font-semibold"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9.4 ORDER MANAGEMENT & PAYMENT VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">9.4 Orders & Manual Bank Verification</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Inspect uploaded bank wire slips, approve receipts, and verify Discord delivery tickets
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="slips">Pending Slips ({orders.filter((o) => o.status === 'Slip Uploaded' || o.status === 'Under Review').length})</option>
                  <option value="verified">Verified / In Discord ({orders.filter((o) => o.status === 'Payment Verified' || o.status === 'Discord Verification').length})</option>
                  <option value="completed">Completed ({orders.filter((o) => o.status === 'Completed').length})</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">8-Digit Code</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Purchased Items</th>
                      <th className="py-3 px-4">Final Amount</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4">Payment Receipt</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-800/30">
                        <td className="py-4 px-4 font-mono font-bold text-amber-400">
                          #{o.orderCode}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">{o.customerName}</div>
                          <div className="text-[11px] text-neutral-400">{o.customerEmail}</div>
                          {o.discordUsername && (
                            <div className="text-[10px] text-amber-400/80">Discord: {o.discordUsername}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="truncate">
                              {it.quantity}x {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                          ${o.finalPrice.toFixed(2)}
                          {o.couponCode && (
                            <span className="block text-[10px] text-neutral-500 font-normal">
                              Coupon: {o.couponCode}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-950 border border-neutral-800 text-amber-300">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {o.paymentSlipUrl ? (
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect Slip
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-500">Not Uploaded</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Inspection & Action Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h2 className="text-base font-bold text-white font-display">
                        Manage Order #{selectedOrder.orderCode}
                      </h2>
                      <span className="text-xs text-neutral-400">ID: {selectedOrder.id} · Current Status: <strong>{selectedOrder.status}</strong></span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Payment Slip Image Preview */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Attached Payment Receipt Slip
                    </h3>
                    {selectedOrder.paymentSlipUrl ? (
                      <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 p-2 text-center">
                        <img
                          src={selectedOrder.paymentSlipUrl}
                          alt="Customer receipt"
                          className="max-h-64 mx-auto object-contain rounded"
                        />
                        <div className="mt-2 text-[11px] text-neutral-400">
                          Uploaded At: {new Date(selectedOrder.paymentSlipUploadedAt || selectedOrder.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-neutral-900 text-center text-xs text-neutral-500">
                        Customer has not uploaded a payment receipt for this order yet.
                      </div>
                    )}
                  </div>

                  {/* STEP 6: VERIFICATION ACTIONS */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Staff Payment Verification Actions
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={() => handleOrderStatusUpdate(selectedOrder.id, 'Payment Verified', 'Authorized by finance manager: Funds arrived in XCM commercial account.')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Payment
                      </button>

                      <button
                        onClick={() => handleOrderStatusUpdate(selectedOrder.id, 'Under Review', 'Staff requested clearer receipt snapshot.')}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        Request New Slip
                      </button>

                      <button
                        onClick={() => handleOrderStatusUpdate(selectedOrder.id, 'Rejected', 'Bank wire reference mismatched or fraudulent slip.')}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        Reject Payment
                      </button>
                    </div>
                  </div>

                  {/* STEP 7: DISCORD TICKET FULFILLMENT */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Discord Ticket Verification & Handover
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Ticket Number / Ref</label>
                        <input
                          type="text"
                          value={discordTicketInput}
                          onChange={(e) => setDiscordTicketInput(e.target.value)}
                          placeholder="XCM-9941"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1">Internal Notes</label>
                        <input
                          type="text"
                          value={orderNotesInput}
                          onChange={(e) => setOrderNotesInput(e.target.value)}
                          placeholder="Account credentials transferred in ticket"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDiscordVerifySubmit(selectedOrder.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      Authorize Discord Verification
                    </button>
                  </div>

                  {/* FINAL COMPLETION OR REFUND */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => handleOrderStatusUpdate(selectedOrder.id, 'Completed', 'Order successfully fulfilled and confirmed by customer.')}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-orange-950/40"
                    >
                      Mark Completed & Release Escrow
                    </button>

                    <button
                      onClick={() => handleOrderStatusUpdate(selectedOrder.id, 'Refunded', 'Customer refunded via manual wire transfer.')}
                      className="px-4 py-2 bg-neutral-800 hover:bg-rose-900 text-neutral-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Issue Refund
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9.3 PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">9.3 Product & Asset Management</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Create, edit pricing, adjust stock, manage warranties, and toggle featured catalog items
                </p>
              </div>
              <button
                onClick={() => {
                  resetProductForm();
                  setIsAddProductOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-orange-950/40"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Warranty</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-neutral-400">{p.categoryId}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                          ${p.discountPrice ? p.discountPrice.toFixed(2) : p.originalPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono">{p.stockQuantity}</td>
                        <td className="py-3 px-4 text-neutral-400 truncate max-w-xs">{p.warranty}</td>
                        <td className="py-3 px-4">
                          {p.featured ? (
                            <span className="text-emerald-400 font-semibold">Yes</span>
                          ) : (
                            <span className="text-neutral-500">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setPName(p.name);
                              setPCat(p.categoryId);
                              setPSubcat(p.subcategoryId);
                              setPPrice(p.originalPrice.toString());
                              setPDiscount(p.discountPrice ? p.discountPrice.toString() : '');
                              setPStock(p.stockQuantity.toString());
                              setPWarranty(p.warranty);
                              setPDesc(p.description);
                              setPType(p.productType);
                              setPFeatured(p.featured);
                              setIsAddProductOpen(true);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add / Edit Product Modal */}
            {isAddProductOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <h3 className="text-base font-bold text-white">
                      {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                    </h3>
                    <button onClick={() => setIsAddProductOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder="Minecraft Hypixel Account VIP+"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Category</label>
                        <select
                          value={pCat}
                          onChange={(e) => setPCat(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Product Type</label>
                        <select
                          value={pType}
                          onChange={(e) => setPType(e.target.value as any)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        >
                          <option value="account">Gaming Account</option>
                          <option value="digital_key">Digital Key / License</option>
                          <option value="service">Digital Service</option>
                          <option value="subscription">Subscription</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Original Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Discount Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={pDiscount}
                          onChange={(e) => setPDiscount(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          required
                          value={pStock}
                          onChange={(e) => setPStock(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Warranty Term</label>
                      <input
                        type="text"
                        value={pWarranty}
                        onChange={(e) => setPWarranty(e.target.value)}
                        placeholder="30-Day Full Replacement Warranty"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Full Description</label>
                      <textarea
                        required
                        rows={4}
                        value={pDesc}
                        onChange={(e) => setPDesc(e.target.value)}
                        placeholder="Provide full credentials warranty, specifications, and handover guidelines..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                      <input
                        type="checkbox"
                        checked={pFeatured}
                        onChange={(e) => setPFeatured(e.target.checked)}
                        className="rounded bg-neutral-900 border-neutral-800 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span>Featured on Storefront Homepage</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
                    >
                      {editingProduct ? 'Save Product Changes' : 'Create Product'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9.6 COUPON MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">9.6 Coupon & Discount Management</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure percentage or fixed discount promo codes with usage quotas and expiry constraints
                </p>
              </div>
              <button
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-orange-950/40"
              >
                <Plus className="w-4 h-4" />
                Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div key={c.id} className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-amber-400">{c.code}</span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-neutral-300">
                    Discount:{' '}
                    <strong>{c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}</strong>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-1">
                    <div>Min Purchase: ${c.minPurchase.toFixed(2)}</div>
                    <div>Usage: {c.timesUsed} / {c.usageLimit}</div>
                    <div>Expiry: {c.expiryDate}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Coupon Modal */}
            {isAddCouponOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Create New Discount Coupon</h3>
                    <button onClick={() => setIsAddCouponOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
                  </div>
                  <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={cCode}
                        onChange={(e) => setCCode(e.target.value.toUpperCase())}
                        placeholder="DISCORD50"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Type</label>
                        <select
                          value={cType}
                          onChange={(e) => setCType(e.target.value as any)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-medium mb-1">Value</label>
                        <input
                          type="number"
                          required
                          value={cValue}
                          onChange={(e) => setCValue(e.target.value)}
                          placeholder="25"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={cExpiry}
                        onChange={(e) => setCExpiry(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
                    >
                      Activate Coupon
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9.7 BANK DETAILS MANAGEMENT */}
        {activeTab === 'bank' && bankSettings && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">9.7 Bank Details & Instructions</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Configure corporate wire credentials shown to customers upon order placement. Existing orders retain historical snapshots.
              </p>
            </div>

            <form onSubmit={handleBankDetailsSave} className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankSettings.bankName}
                  onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Account Holder Legal Name</label>
                <input
                  type="text"
                  required
                  value={bankSettings.accountHolder}
                  onChange={(e) => setBankSettings({ ...bankSettings, accountHolder: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Account Number / IBAN</label>
                  <input
                    type="text"
                    required
                    value={bankSettings.accountNumber}
                    onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Branch / Routing Swift</label>
                  <input
                    type="text"
                    required
                    value={bankSettings.branch}
                    onChange={(e) => setBankSettings({ ...bankSettings, branch: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Customer Wire Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={bankSettings.paymentInstructions}
                  onChange={(e) => setBankSettings({ ...bankSettings, paymentInstructions: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-orange-950/40"
              >
                <Save className="w-4 h-4" />
                Save Bank Settings
              </button>
            </form>
          </div>
        )}

        {/* 9.8 STAFF AND RBAC MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">9.8 Staff & Role-Based Access Control</h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage administrative accounts, role assignments (Owner, Super Admin, Finance Manager, Order Manager), and granular permissions
                </p>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-orange-950/40"
              >
                <Plus className="w-4 h-4" />
                Add Staff Member
              </button>
            </div>

            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{s.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 border border-amber-500/30 text-amber-300">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] ${s.status === 'active' || !s.status ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Staff Modal */}
            {isAddStaffOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Create Staff Member</h3>
                    <button onClick={() => setIsAddStaffOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
                  </div>
                  <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={sName}
                        onChange={(e) => setSName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Staff Email</label>
                      <input
                        type="email"
                        required
                        value={sEmail}
                        onChange={(e) => setSEmail(e.target.value)}
                        placeholder="marcus@xcmnetwork.com"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Temporary Password</label>
                      <input
                        type="password"
                        required
                        value={sPassword}
                        onChange={(e) => setSPassword(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-medium mb-1">Assign RBAC Role</label>
                      <select
                        value={sRole}
                        onChange={(e) => setSRole(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Order Manager">Order Manager</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Support Manager">Support Manager</option>
                        <option value="Moderator">Moderator</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
                    >
                      Create Staff Account
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9.9 MAINTENANCE MODE & 9.10 THEMES */}
        {activeTab === 'themes' && siteSettings && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">9.10 Seasonal Themes & Announcements</h1>
              <p className="text-xs text-neutral-400 mt-1">Configure storefront announcements and visual theme presets</p>
            </div>

            <form onSubmit={handleSiteSettingsSave} className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Active Seasonal Theme</label>
                <select
                  value={siteSettings.currentTheme}
                  onChange={(e) => setSiteSettings({ ...siteSettings, currentTheme: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                >
                  <option value="default">Default XCM Dark Obsidian</option>
                  <option value="cyberpunk">Cyberpunk Neon Nightfall</option>
                  <option value="christmas">Winter Glaze / Christmas</option>
                  <option value="halloween">Blood Moon / Halloween</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Top Announcement Banner Text</label>
                <input
                  type="text"
                  value={siteSettings.announcementText}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                  placeholder="⚡ FLASH SALE: Use coupon code XCM25 for 25% OFF!"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Official Discord Server Invite URL</label>
                <input
                  type="text"
                  value={siteSettings.discordInviteUrl}
                  onChange={(e) => setSiteSettings({ ...siteSettings, discordInviteUrl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-orange-950/40"
              >
                <Save className="w-4 h-4" />
                Update Theme & Announcements
              </button>
            </form>
          </div>
        )}

        {/* 9.9 MAINTENANCE MODE */}
        {activeTab === 'settings' && siteSettings && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">9.9 Platform Maintenance Mode</h1>
              <p className="text-xs text-neutral-400 mt-1">
                Instantly toggle storefront maintenance mode with custom return notice and administrator bypass
              </p>
            </div>

            <form onSubmit={handleSiteSettingsSave} className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Full Website Maintenance Mode</span>
                  <span className="text-[11px] text-neutral-400">When enabled, non-admin visitors see the maintenance screen.</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.maintenanceMode}
                  onChange={(e) => setSiteSettings({ ...siteSettings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 rounded bg-neutral-900 border-neutral-700 accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Maintenance Notice Message</label>
                <textarea
                  rows={3}
                  value={siteSettings.maintenanceMessage}
                  onChange={(e) => setSiteSettings({ ...siteSettings, maintenanceMessage: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Estimated Return Time</label>
                <input
                  type="text"
                  value={siteSettings.estimatedReturnTime}
                  onChange={(e) => setSiteSettings({ ...siteSettings, estimatedReturnTime: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-orange-950/40"
              >
                <Save className="w-4 h-4" />
                Save Maintenance Status
              </button>
            </form>
          </div>
        )}

        {/* 10. WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">10. Marketplace Seller Payouts</h1>
              <p className="text-xs text-neutral-400 mt-1">Approve and wire earnings to verified third-party marketplace sellers</p>
            </div>

            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Seller Store</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Bank Routing Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-semibold text-white">{w.sellerName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">${w.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{w.bankDetails}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          w.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {w.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProcessWithdrawal(w.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessWithdrawal(w.id, 'reject')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9.5 REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">9.5 Customer Review Moderation</h1>
              <p className="text-xs text-neutral-400 mt-1">Review feedback, pin highlights, and publish staff responses</p>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{r.userName}</span> on{' '}
                      <span className="text-amber-400">{r.productName}</span>
                    </div>
                    <span className="text-amber-400 font-bold">{r.rating} / 5 Stars</span>
                  </div>
                  <p className="text-neutral-300 italic">"{r.comment}"</p>
                  {r.adminReply && (
                    <div className="p-3 rounded bg-neutral-950 border border-neutral-850 text-neutral-400">
                      <strong>Staff Reply:</strong> {r.adminReply.comment}
                    </div>
                  )}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setReplyReviewId(r.id)}
                      className="text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      Reply to Review
                    </button>
                    <span className="text-neutral-500 text-[10px]">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {replyReviewId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                  <h3 className="text-sm font-bold text-white">Post Official Staff Reply</h3>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank you for choosing XCM Store..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button onClick={() => setReplyReviewId(null)} className="px-3 py-1.5 text-neutral-400">Cancel</button>
                    <button onClick={handleReviewReplySubmit} className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-lg font-semibold shadow-md shadow-orange-950/40">Submit Reply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">System Audit Log</h1>
              <p className="text-xs text-neutral-400 mt-1">Chronological history of all staff activities and order mutations</p>
            </div>

            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-800/30">
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-amber-300">{log.actorEmail} ({log.actorRole})</td>
                      <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                      <td className="py-3 px-4 text-neutral-400 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
