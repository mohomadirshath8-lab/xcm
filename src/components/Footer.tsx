import React from 'react';
import { MessageSquare, ShieldCheck, CreditCard, Clock, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { XCMLogo } from './XCMLogo.js';

export const Footer: React.FC = () => {
  const { navigate, siteSettings } = useStore();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-xs">
      {/* Trust & Guarantee Strip */}
      <div className="border-b border-neutral-900/80 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">Manual Bank Escrow</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Every bank transfer is manually verified by authorized XCM finance personnel prior to release.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">Discord Ticket Verification</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Direct hand-to-hand delivery and live identity check via our official Discord infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">Guaranteed Replacement</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                All accounts and digital keys are backed by 30-day or lifetime replacement warranties.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">Global Digital Fulfillment</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Clean provenance, unbanned credentials, and enterprise gaming solutions worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <XCMLogo size="md" showStoreText={true} />
            <p className="text-neutral-400 max-w-sm leading-relaxed">
              Official digital marketplace of XCM Network. Providing enterprise-grade gaming accounts, authentic Discord Nitro & server boosts, full-stack digital development, and approved creator assets.
            </p>
            <div className="pt-2">
              <a
                href={siteSettings?.discordInviteUrl || 'https://discord.gg/xcmnetwork'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 hover:from-amber-500/25 hover:to-red-500/25 text-amber-300 border border-amber-500/30 font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Join Official XCM Discord
              </a>
            </div>
          </div>

          {/* Gaming Accounts */}
          <div>
            <h5 className="font-semibold text-neutral-200 mb-3 tracking-wide uppercase text-[11px]">
              Gaming Accounts
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-mc' })}
                  className="hover:text-white transition-colors"
                >
                  Minecraft Capes & VIP
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-gta' })}
                  className="hover:text-white transition-colors"
                >
                  GTA V Modded Accounts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-rdr2' })}
                  className="hover:text-white transition-colors"
                >
                  Red Dead Redemption 2
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-ark' })}
                  className="hover:text-white transition-colors"
                >
                  ARK: Survival Ascended
                </button>
              </li>
            </ul>
          </div>

          {/* Discord & Services */}
          <div>
            <h5 className="font-semibold text-neutral-200 mb-3 tracking-wide uppercase text-[11px]">
              Discord & Services
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-discord', subcategoryId: 'sub-nitro' })}
                  className="hover:text-white transition-colors"
                >
                  Discord Nitro Gifts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-discord', subcategoryId: 'sub-boosts' })}
                  className="hover:text-white transition-colors"
                >
                  Level 3 Server Boosts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-services', subcategoryId: 'sub-setup' })}
                  className="hover:text-white transition-colors"
                >
                  Discord Server Setup
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-services', subcategoryId: 'sub-srv-web' })}
                  className="hover:text-white transition-colors"
                >
                  Full-Stack Web Dev
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h5 className="font-semibold text-neutral-200 mb-3 tracking-wide uppercase text-[11px]">
              Customer Service
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('order-tracking')} className="hover:text-white transition-colors">
                  Track 8-Digit Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('faq')} className="hover:text-white transition-colors">
                  FAQ & Verification
                </button>
              </li>
              <li>
                <button onClick={() => navigate('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('refund-policy')} className="hover:text-white transition-colors">
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & domain disclaimer */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} XCM Network. All rights reserved. Registered domain: <span className="text-neutral-400 font-mono">store.xcmnetwork.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Manual Bank Wire Escrow</span>
            <span aria-hidden="true">·</span>
            <span>Discord Ticket Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Compliance Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
