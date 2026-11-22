import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, RefreshCw } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'terms' | 'privacy' | 'refund';
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'terms' }) => {
  const [tab, setTab] = useState<'terms' | 'privacy' | 'refund'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Legal Compliance & Platform Policies
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Official policies governing transactions on store.xcmnetwork.com
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 text-xs font-semibold">
        <button
          onClick={() => setTab('terms')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            tab === 'terms' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Terms of Service
        </button>

        <button
          onClick={() => setTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            tab === 'privacy' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          Privacy Policy
        </button>

        <button
          onClick={() => setTab('refund')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            tab === 'refund' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refund & Replacement Policy
        </button>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed space-y-6">
        {tab === 'terms' && (
          <>
            <h2 className="text-base font-bold text-white font-display">XCM Store Terms and Conditions</h2>
            <p>
              By accessing store.xcmnetwork.com or initiating an order, you agree to be bound by these Terms of Service. XCM Network facilitates the lawful supply and configuration of digital gaming accounts, Discord services, and tech development packages.
            </p>
            <h3 className="text-sm font-semibold text-white">1. Manual Bank Escrow & 8-Digit Order Codes</h3>
            <p>
              All payments are processed exclusively via direct manual wire or bank transfer. The customer is responsible for quoting the exact 8-digit unique verification code generated at order creation. Orders without a valid matching code may experience verification delays.
            </p>
            <h3 className="text-sm font-semibold text-white">2. Discord Ticket Verification</h3>
            <p>
              Upon manual bank receipt confirmation by XCM finance personnel, customers are required to verify their order via the official XCM Discord server ticket system. Credential transfer and configuration are finalized inside private staff channels.
            </p>
          </>
        )}

        {tab === 'privacy' && (
          <>
            <h2 className="text-base font-bold text-white font-display">Privacy & Data Governance Policy</h2>
            <p>
              XCM Network values customer confidentiality. We collect only necessary details to execute your digital order (buyer name, email address, Discord handle, and payment receipt).
            </p>
            <h3 className="text-sm font-semibold text-white">1. Payment Slip Storage</h3>
            <p>
              Uploaded bank transfer receipts are stored securely within our restricted financial vault and accessed strictly by authorized Finance Managers to reconcile bank records.
            </p>
            <h3 className="text-sm font-semibold text-white">2. No Third-Party Data Selling</h3>
            <p>
              We never sell, rent, or trade customer information to advertising networks or third-party data brokers.
            </p>
          </>
        )}

        {tab === 'refund' && (
          <>
            <h2 className="text-base font-bold text-white font-display">Refund & Replacement Guarantee</h2>
            <p>
              Due to the bespoke nature of digital goods and server accounts, XCM Store maintains a strict replacement warranty protocol.
            </p>
            <h3 className="text-sm font-semibold text-white">1. Replacement Warranty Period</h3>
            <p>
              Every gaming account and digital key is protected by our standard 30-Day Full Replacement Warranty (or lifetime warranty where explicitly designated). If an account experiences a technical defect or lock not caused by customer negligence, an immediate replacement account is provided.
            </p>
            <h3 className="text-sm font-semibold text-white">2. Wire Reversals</h3>
            <p>
              In the unlikely event an ordered asset cannot be fulfilled within our stated service window, a complete refund will be wired back to the originator's bank account.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
