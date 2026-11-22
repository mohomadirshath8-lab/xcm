import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, Clock, Building2, Upload, MessageSquare, ArrowRight } from 'lucide-react';
import { api, type Order } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

export const OrderTrackingPage: React.FC = () => {
  const { pageParams, navigate } = useStore();
  const [query, setQuery] = useState(pageParams?.orderCode || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageParams?.orderCode) {
      setQuery(pageParams.orderCode);
      handleSearch(pageParams.orderCode);
    }
  }, [pageParams]);

  const handleSearch = async (targetCode: string) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(targetCode.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No order found with this 8-digit code or reference.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Track Order Status
        </h1>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          Enter your unique 8-digit order verification code or order ID to view real-time bank verification and ticket progress.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={onSubmit} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter 8-digit code (e.g. 48291047)..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-md shadow-orange-950/40 cursor-pointer"
        >
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-4">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-mono block">Order Verification Code</span>
              <span className="font-mono text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-widest">{order.orderCode}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-neutral-950 border border-neutral-800 text-amber-300">
                Status: {order.status}
              </span>
              <button
                onClick={() => navigate('order-confirmation', { orderCode: order.orderCode })}
                className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-orange-950/40"
              >
                Full Details
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Customer</span>
              <span className="font-semibold text-white">{order.customerName}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Amount Total</span>
              <span className="font-mono font-bold text-emerald-400">${order.finalPrice.toFixed(2)}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[11px]">Payment Slip Status</span>
              <span className="font-semibold text-neutral-200">
                {order.paymentSlipUrl ? 'Uploaded & Logged' : 'Pending Upload'}
              </span>
            </div>
          </div>

          {/* Activity timeline preview */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Status History</h3>
            <div className="space-y-2">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-neutral-200">{step.status}</span>
                    <span className="text-neutral-500 text-[11px] ml-2">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                    {step.notes && <p className="text-neutral-400 text-[11px] mt-0.5">{step.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
