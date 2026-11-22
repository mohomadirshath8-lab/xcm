import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    cartOriginalTotal,
    cartDiscountAmount,
    cartFinalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    navigate,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponLoading(true);
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Failed to apply coupon');
    } else {
      setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    navigate('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">Shopping Cart</h2>
              <span className="text-xs text-neutral-400">({cart.length} items)</span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-900 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600 mb-4">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Browse our high-tier gaming accounts, Discord services, and marketplace assets.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('catalog');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 rounded-lg transition-colors shadow-md shadow-orange-950/40"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.selectedPackage
                  ? item.selectedPackage.price
                  : item.product.discountPrice ?? item.product.originalPrice;

                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{item.product.name}</h4>
                      {item.selectedPackage && (
                        <p className="text-[11px] text-amber-400 mt-0.5 truncate font-medium">
                          Tier: {item.selectedPackage.name}
                        </p>
                      )}
                      <div className="text-[11px] text-neutral-400 mt-0.5">{item.product.warranty}</div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-800 rounded-md bg-neutral-900">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono tabular-nums text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white font-mono tabular-nums">
                            ${(itemPrice * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Module */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/90 space-y-4">
              {/* Coupon Form */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discountAmount.toFixed(2)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-rose-400 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. XCM25)"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs border-t border-neutral-900 pt-3">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-neutral-200">
                    ${cartOriginalTotal.toFixed(2)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-${cartDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Payment Method</span>
                  <span className="text-neutral-300">Manual Bank Transfer</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800/80">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
                    ${cartFinalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 rounded-lg transition-all shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Protected by XCM Manual Bank Escrow</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
