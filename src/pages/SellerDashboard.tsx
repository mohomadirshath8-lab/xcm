import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  TrendingUp,
  Package,
  Plus,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
} from 'lucide-react';
import { api, type SellerProfile, type Product } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

export const SellerDashboard: React.FC = () => {
  const { currentUser, navigate, categories } = useStore();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyStoreName, setApplyStoreName] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Withdrawal modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  // Add Product modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('cat-marketplace');
  const [prodSubcat, setProdSubcat] = useState('sub-mkt-discord');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodDesc, setProdDesc] = useState('');
  const [prodWarranty, setProdWarranty] = useState('Standard Digital License Warranty');

  useEffect(() => {
    async function fetchSellerData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [prof, prods] = await Promise.all([
          api.getSellerProfile().catch(() => null),
          api.getSellerProducts().catch(() => []),
        ]);
        setProfile(prof);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load seller data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSellerData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-neutral-400">Please log in to manage your XCM Seller Store.</p>
        <button onClick={() => navigate('home')} className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40">
          Return Home
        </button>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    try {
      const newProf = await api.applySeller({ storeName: applyStoreName, bio: applyBio });
      setProfile(newProf);
    } catch (err: any) {
      alert(err.message || 'Application failed');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    try {
      await api.requestWithdrawal({ amount: Number(withdrawAmount), bankDetails: withdrawBank });
      setWithdrawMsg('Withdrawal request submitted for finance approval.');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      const prof = await api.getSellerProfile();
      setProfile(prof);
    } catch (err: any) {
      setWithdrawMsg(err.message || 'Failed to request withdrawal');
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: prodName,
        categoryId: prodCat,
        subcategoryId: prodSubcat,
        originalPrice: Number(prodPrice),
        stockQuantity: Number(prodStock),
        description: prodDesc,
        warranty: prodWarranty,
        productType: 'digital_key',
        images: ['/src/assets/images/product_discord_nitro_1794043366446.jpg'],
      });
      setIsAddProductOpen(false);
      // Reload products
      const updated = await api.getSellerProducts();
      setProducts(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              XCM Marketplace Seller Studio
            </h1>
            {profile && (
              <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded capitalize">
                {profile.status}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Publish gaming assets, Discord templates, and digital services on store.xcmnetwork.com
          </p>
        </div>

        {profile && profile.status === 'approved' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-orange-950/40"
            >
              <Plus className="w-4 h-4" />
              List New Product
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Request Payout
            </button>
          </div>
        )}
      </div>

      {!profile ? (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6 text-center">
          <Store className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Join as a Verified XCM Seller</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sell your custom game accounts, bots, graphic designs, or services to verified international buyers with guaranteed manual bank escrow protection.
          </p>

          <form onSubmit={handleApply} className="space-y-4 text-left text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Store / Studio Name</label>
              <input
                type="text"
                required
                value={applyStoreName}
                onChange={(e) => setApplyStoreName(e.target.value)}
                placeholder="VortexDesign Studio"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Store Bio & Specialization</label>
              <textarea
                required
                rows={3}
                value={applyBio}
                onChange={(e) => setApplyBio(e.target.value)}
                placeholder="Describe the digital assets or services you provide..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
            <button
              type="submit"
              disabled={applyLoading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
            >
              {applyLoading ? 'Submitting Application...' : 'Submit Seller Application'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span>Available Balance</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${profile.balance.toFixed(2)}
              </div>
              <span className="text-[11px] text-neutral-500">Ready for direct bank payout</span>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span>Pending Escrow</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${profile.pendingBalance.toFixed(2)}
              </div>
              <span className="text-[11px] text-neutral-500">Released once orders complete</span>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span>Total Withdrawn</span>
                <ArrowDownLeft className="w-4 h-4 text-amber-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${profile.totalWithdrawn.toFixed(2)}
              </div>
              <span className="text-[11px] text-neutral-500">Lifetime earnings transferred</span>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
                <span>Commission Rate</span>
                <Star className="w-4 h-4 text-purple-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {profile.commissionRate}%
              </div>
              <span className="text-[11px] text-neutral-500">Standard XCM Network tier</span>
            </div>
          </div>

          {/* Product Inventory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display">
                My Listed Products ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
                You haven't listed any marketplace items yet. Click "List New Product" above to start selling!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover rounded-lg bg-neutral-950" />
                    <div>
                      <h3 className="text-xs font-semibold text-white truncate">{p.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-mono text-amber-400 font-bold">${p.originalPrice.toFixed(2)}</span>
                        <span className="text-neutral-500 text-[11px]">{p.stockQuantity} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Request Earnings Payout</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Amount (Available: ${profile.balance.toFixed(2)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={profile.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Bank Name & Wire Instructions</label>
                <textarea
                  required
                  rows={3}
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  placeholder="Bank of America, Checking: 9812-4412-001, Routing: 021000021"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
              >
                Confirm Payout Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">List Marketplace Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g., Discord Moderation Bot Template with Dashboard"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="10"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detailed specs, features, and delivery instructions..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Warranty Guarantee</label>
                <input
                  type="text"
                  value={prodWarranty}
                  onChange={(e) => setProdWarranty(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors shadow-md shadow-orange-950/40"
              >
                Submit for Publication
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
