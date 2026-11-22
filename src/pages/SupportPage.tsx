import React, { useState } from 'react';
import { MessageSquare, Mail, ShieldCheck, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const SupportPage: React.FC = () => {
  const { siteSettings } = useStore();
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketOrderCode, setTicketOrderCode] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setTicketName('');
      setTicketEmail('');
      setTicketOrderCode('');
      setTicketMsg('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          XCM Support & Customer Care
        </h1>
        <p className="text-xs text-neutral-400 max-w-lg mx-auto">
          Need assistance with an 8-digit order verification code, bank receipt confirmation, or account replacement? We are here 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discord Official Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/30 border border-amber-500/35 space-y-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">Official Discord Support Server</h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Fastest response channel. Join our server and open a private support ticket quoting your 8-digit order code to receive live credential handover.
          </p>
          <a
            href={siteSettings?.discordInviteUrl || 'https://discord.gg/xcmnetwork'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-orange-600/25"
          >
            Join Discord Ticket Channel
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Corporate Email Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">Direct Corporate Email</h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            For business inquiries, bulk marketplace orders, or official verification escalations, contact our financial department.
          </p>
          <div className="font-mono text-xs text-amber-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
            {siteSettings?.supportEmail || 'support@xcmnetwork.com'}
          </div>
        </div>
      </div>

      {/* Support Message Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h2 className="text-base font-bold text-white font-display">Submit a Support Ticket Request</h2>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Support ticket received. An XCM representative will reach out via email shortly.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  placeholder="alex.buyer@gmail.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">8-Digit Order Code (If applicable)</label>
              <input
                type="text"
                value={ticketOrderCode}
                onChange={(e) => setTicketOrderCode(e.target.value)}
                placeholder="48291047"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Inquiry / Issue Details</label>
              <textarea
                required
                rows={4}
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Describe your inquiry or order query in detail..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-orange-950/40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Transmit Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
