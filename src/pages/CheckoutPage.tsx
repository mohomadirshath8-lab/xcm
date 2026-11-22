import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  User,
  Mail,
  MessageSquare,
  Phone,
  AlertCircle,
  Tag,
  Check,
  FileText,
  Lock,
} from 'lucide-react';
import { api, type Order } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    clearCart,
    cartOriginalTotal,
    cartDiscountAmount,
    cartFinalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currentUser,
    navigate,
    setLastCreatedOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [discordUsername, setDiscordUsername] = useState(currentUser?.discordTag || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
          <Tag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">Your cart is empty</h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Add gaming accounts, Discord services, or digital keys before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('catalog')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const res = await applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon');
    } else {
      setCouponInput('');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setOrderError('Name and email are required to generate your order.');
      return;
    }

    setOrderError(null);
    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        discordUsername: discordUsername.trim(),
        phone: phone.trim(),
        couponCode: appliedCoupon?.code,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          deliveryDetails: item.selectedPackage
            ? `Tier Package: ${item.selectedPackage.name}`
            : undefined,
        })),
      };

      const order: Order = await api.createOrder(orderPayload);
      clearCart();
      setLastCreatedOrder(order);
      navigate('order-confirmation', { orderId: order.id, orderCode: order.orderCode });
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Order Checkout & Payment Setup
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review your digital assets and generate your unique 8-digit order verification code
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Details & Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCreateOrder} className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Customer & Delivery Information
              </h2>

              {orderError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Full Legal / Buyer Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex.buyer@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Discord Username & Tag (Recommended)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="AlexM_Gaming#7721"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Used to identify your Discord ticket after bank payment confirmation.
                  </span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Phone / WhatsApp (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0192"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Payment Protocol: Manual Bank Transfer
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                XCM STORE currently operates exclusively with direct manual bank wire escrow.
                When you click "Generate Order & View Bank Details", our server creates a guaranteed unique 8-digit verification code.
              </p>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="font-semibold text-neutral-200">How payment works:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 leading-relaxed text-[11px]">
                  <li>We provide XCM commercial bank account number and branch routing.</li>
                  <li>You transfer the exact total and quote your 8-digit order code as reference.</li>
                  <li>Upload a screenshot or PDF of your transfer receipt.</li>
                  <li>Our finance team audits the bank deposit and authorizes Discord ticket fulfillment.</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Generating Order...' : 'Generate Order & View Bank Details'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
              Order Summary ({cart.length} items)
            </h2>

            {/* Items list */}
            <div className="divide-y divide-neutral-900 max-h-72 overflow-y-auto pr-1 space-y-3">
              {cart.map((item) => {
                const itemPrice = item.selectedPackage
                  ? item.selectedPackage.price
                  : item.product.discountPrice ?? item.product.originalPrice;

                return (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-neutral-400">Qty: {item.quantity} · {item.product.warranty}</div>
                    </div>
                    <span className="font-mono tabular-nums text-neutral-200 shrink-0">
                      ${(itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon input */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-2">
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
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-400">{couponError}</p>
              )}
            </div>

            {/* Pricing details */}
            <div className="space-y-2 pt-3 border-t border-neutral-800/80 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-neutral-200">
                  ${cartOriginalTotal.toFixed(2)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-mono tabular-nums">-${cartDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Fulfillment Fee</span>
                <span className="text-emerald-400 font-mono">$0.00 (Free)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                <span>Total Due</span>
                <span className="font-mono tabular-nums font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
                  ${cartFinalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
