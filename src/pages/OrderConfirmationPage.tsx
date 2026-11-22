import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Upload,
  FileText,
  Clock,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api, type Order } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

export const OrderConfirmationPage: React.FC = () => {
  const { pageParams, lastCreatedOrder, navigate, siteSettings } = useStore();
  const [order, setOrder] = useState<Order | null>(lastCreatedOrder);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // File upload state
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const orderIdentifier = pageParams?.orderCode || pageParams?.orderId || lastCreatedOrder?.orderCode;

  useEffect(() => {
    async function fetchOrder() {
      if (!orderIdentifier) return;
      setLoading(true);
      try {
        const data = await api.trackOrder(orderIdentifier);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    }

    if (!order || (orderIdentifier && order.orderCode !== orderIdentifier && order.id !== orderIdentifier)) {
      fetchOrder();
    }
  }, [orderIdentifier]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-neutral-400 text-sm">
        Retrieving order verification records...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-neutral-400">
          No order was found matching reference: {orderIdentifier || 'None provided'}
        </p>
        <button
          onClick={() => navigate('order-tracking')}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40"
        >
          Track An Order
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(order.bankSnapshot.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15MB maximum limit.');
      return;
    }

    setSlipFile(file);
    setUploadError(null);

    // Convert to base64 Data URL for upload and preview
    const reader = new FileReader();
    reader.onload = () => {
      setSlipPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipPreview) {
      setUploadError('Please select a JPG, PNG, or PDF payment slip to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const res = await api.uploadSlip(order.id, slipPreview, uploadNotes);
      setOrder(res.order);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to submit payment slip. Please retry.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'Payment Verified':
      case 'Discord Verification':
      case 'Processing':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'Slip Uploaded':
      case 'Under Review':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'Rejected':
      case 'Cancelled':
      case 'Refunded':
        return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      default:
        return 'text-neutral-400 bg-neutral-900 border-neutral-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Alert */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <h1 className="text-xl font-bold text-white font-display">
              Order Registered Successfully
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            Please transfer the exact amount and quote your unique 8-digit verification code below.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* STEP 3 & 4: THE 8-DIGIT VERIFICATION CODE & BANK DETAILS CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/35 space-y-6 shadow-2xl">
        <div className="text-center sm:text-left space-y-2">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest block">
            Step 1: Your Unique 8-Digit Order Verification Code
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <div className="inline-block px-6 py-3 rounded-xl bg-neutral-950 border border-amber-500/50 font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 tracking-widest text-center shadow-inner">
              {order.orderCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors self-center sm:self-auto"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              {copiedCode ? 'Code Copied!' : 'Copy 8-Digit Code'}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">
            * CRITICAL: Enter this exact 8-digit code in the "Reference" or "Remarks" field of your bank transfer.
          </p>
        </div>

        {/* Dynamic Bank Transfer Snapshot */}
        <div className="pt-6 border-t border-neutral-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Official XCM Wire / Bank Transfer Account Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[11px] block">Bank Name</span>
              <span className="font-semibold text-white text-sm">{order.bankSnapshot.bankName}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[11px] block">Account Holder Name</span>
              <span className="font-semibold text-white text-sm">{order.bankSnapshot.accountHolder}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-neutral-500 text-[11px] block">Account Number</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {order.bankSnapshot.accountNumber}
                </span>
              </div>
              <button
                onClick={handleCopyAccount}
                className="p-1.5 text-neutral-400 hover:text-white rounded"
                title="Copy account number"
              >
                {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 text-[11px] block">Branch / Routing</span>
              <span className="font-semibold text-white">{order.bankSnapshot.branch}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Exact Payment Total:</span>
              <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
                ${order.finalPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 whitespace-pre-line border-t border-neutral-800/60 pt-2 leading-relaxed">
              {order.bankSnapshot.paymentInstructions}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 5: PAYMENT SLIP UPLOAD COMPONENT */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            Step 2: Upload Bank Transfer Receipt Slip
          </h2>
          {order.paymentSlipUrl && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Slip Uploaded
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Upload a clear screenshot or official PDF of your completed transfer showing date, amount, and reference code.
        </p>

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Receipt uploaded successfully! XCM finance staff will review your deposit shortly.</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Existing uploaded slip display */}
        {order.paymentSlipUrl && !uploadSuccess && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Current Attached Receipt:</span>
              <span className="text-[11px] text-neutral-500">
                Uploaded: {new Date(order.paymentSlipUploadedAt || order.updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="max-w-xs rounded-lg overflow-hidden border border-neutral-800">
              <img
                src={order.paymentSlipUrl}
                alt="Payment receipt preview"
                className="w-full max-h-48 object-cover"
              />
            </div>
            <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Receipt is under review by XCM Financial Staff. You can upload an updated slip below if requested.
            </p>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-6 text-center bg-neutral-950/60 transition-colors">
            <input
              type="file"
              id="slip-upload"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="slip-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-neutral-500 mb-2" />
              <span className="text-xs font-semibold text-neutral-200">
                {slipFile ? slipFile.name : 'Click to select or drag and drop payment slip'}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1">
                Supported formats: JPG, PNG, PDF (Max 15MB)
              </span>
            </label>
          </div>

          {slipPreview && (
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center gap-3">
              <img src={slipPreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-neutral-200 truncate">{slipFile?.name}</p>
                <p className="text-[10px] text-neutral-500">Ready to transmit</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSlipFile(null);
                  setSlipPreview(null);
                }}
                className="text-neutral-500 hover:text-rose-400 text-xs"
              >
                Clear
              </button>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-neutral-300 mb-1">
              Optional Notes for Finance Staff
            </label>
            <input
              type="text"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              placeholder="e.g., Wire sent from Bank of America account ending in 4102"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !slipPreview}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? 'Transmitting Receipt...' : 'Submit Payment Slip for Verification'}
            <Upload className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* STEP 7: DISCORD TICKET VERIFICATION GUIDANCE */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          Step 3: Discord Ticket Verification & Delivery
        </h2>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Once our staff approves your bank slip, your order status changes to <strong>Payment Verified</strong>.
          You then open a ticket on the official XCM Discord server to receive your credentials or schedule your service delivery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
          <div className="text-xs space-y-1">
            <span className="font-semibold text-amber-300 block">XCM Official Discord Server:</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {siteSettings?.discordInviteUrl || 'https://discord.gg/xcmnetwork'}
            </span>
          </div>

          <a
            href={siteSettings?.discordInviteUrl || 'https://discord.gg/xcmnetwork'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-orange-950/40"
          >
            Open XCM Discord Server
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {order.discordTicketNumber && (
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
            <span className="text-neutral-400">Assigned Ticket Reference: </span>
            <span className="font-mono font-bold text-amber-400">{order.discordTicketNumber}</span>
            {order.discordVerifiedBy && (
              <span className="text-neutral-500 ml-2">(Verified by: {order.discordVerifiedBy})</span>
            )}
          </div>
        )}
      </div>

      {/* Complete Order Status History Timeline */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
          Order Activity & Audit Timeline
        </h2>

        <div className="space-y-3">
          {order.statusHistory.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.status}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px]">
                  Actor: {item.actor} ({item.actorRole})
                </div>
                {item.notes && (
                  <p className="text-neutral-300 text-[11px] italic bg-neutral-950 p-2 rounded mt-1 border border-neutral-850">
                    "{item.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
