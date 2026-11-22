import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  MessageSquare,
  Tag,
  Bell,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api, type Order, type Review, type Coupon } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';
import { ProductCard } from '../components/ProductCard.js';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    navigate,
    pageParams,
    wishlist,
    notifications,
    reloadNotifications,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'reviews' | 'coupons' | 'notifications'>(
    pageParams?.tab || 'orders'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Profile edit form
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [discordTag, setDiscordTag] = useState(currentUser?.discordTag || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [myOrders, activeCoupons] = await Promise.all([
          api.getMyOrders(),
          api.getCoupons().catch(() => []),
        ]);
        setOrders(myOrders);
        setCoupons(activeCoupons);

        // Load wishlist items
        if (wishlist.length > 0) {
          const allProds = await api.getProducts();
          setWishlistProducts(allProds.filter((p) => wishlist.includes(p.id)));
        } else {
          setWishlistProducts([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentUser, wishlist]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-neutral-400">
          Please sign in to access your customer dashboard, order history, and digital keys.
        </p>
        <button
          onClick={() => navigate('home')}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await api.updateProfile({ name, phone, discordTag, newPassword: newPassword || undefined });
      setProfileMessage('Profile settings updated successfully.');
      setNewPassword('');
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Customer Portal
            </h1>
            <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded font-semibold uppercase">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Welcome back, <strong className="text-neutral-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('order-tracking')}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-800 transition-colors"
          >
            Track by 8-Digit Code
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800/80 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'orders' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'wishlist' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          My Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'coupons' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          My Coupons
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'notifications' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications ({notifications.filter((n) => !n.read).length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'profile' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-orange-950/40 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Account Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
              You haven't placed any orders yet.
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-white tracking-wider">
                      #{ord.orderCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-neutral-950 border border-neutral-800 text-amber-400">
                      {ord.status}
                    </span>
                    <span className="text-neutral-500 text-xs">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300">
                    {ord.items.map((i) => i.productName).join(', ')}
                  </div>

                  <div className="text-xs text-neutral-400 flex items-center gap-2">
                    <span>Total: <strong className="text-emerald-400 font-mono">${ord.finalPrice.toFixed(2)}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Slip: {ord.paymentSlipUrl ? 'Uploaded' : 'Pending Upload'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <button
                    onClick={() => navigate('order-confirmation', { orderCode: ord.orderCode })}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-orange-950/40 cursor-pointer"
                  >
                    View Order Details & Slip
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
              Your wishlist is empty. Tap the heart icon on any product to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-amber-400 tracking-wider">{c.code}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  {c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Minimum order: ${c.minPurchase.toFixed(2)} · Valid until {c.expiryDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border text-xs space-y-1 ${
                  !n.read ? 'bg-amber-950/20 border-amber-500/30' : 'bg-neutral-900/40 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{n.title}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-neutral-300">{n.message}</p>
                {n.link && (
                  <button
                    onClick={() => {
                      if (n.link?.startsWith('/orders/')) {
                        const code = n.link.split('/').pop();
                        navigate('order-tracking', { orderCode: code });
                      }
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 hover:underline pt-1 block font-medium"
                  >
                    View Related Record →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-xl p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
          <h2 className="text-base font-bold text-white font-display">Account Settings & Profile</h2>

          {profileMessage && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-2.5 text-neutral-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Discord Tag</label>
              <input
                type="text"
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                placeholder="AlexM#0001"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Change Password (leave blank to keep)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg shadow-md shadow-orange-950/40 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
