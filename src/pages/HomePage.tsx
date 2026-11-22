import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  MessageSquare,
  Code,
  Store,
  Star,
  Check,
  Copy,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { api, type Product, type Review } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { XCMLogo } from '../components/XCMLogo.js';

export const HomePage: React.FC = () => {
  const { navigate, categories, applyCoupon, setIsCartDrawerOpen } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [couponAppliedSuccess, setCouponAppliedSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await api.getProducts({ featured: 'true' });
        setFeaturedProducts(prods);
        // Load approved reviews
        const prodReviews = await api.getProductReviews('prod-discord-nitro-year');
        setReviews(prodReviews);
      } catch (err) {
        console.error('Error loading homepage data', err);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('catalog', { search: searchQuery.trim() });
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('XCM25');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleClaimCoupon = async () => {
    const res = await applyCoupon('XCM25');
    if (res.success) {
      setCouponAppliedSuccess(true);
      setIsCartDrawerOpen(true);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'gaming-accounts':
        return <Gamepad2 className="w-5 h-5 text-amber-400" />;
      case 'discord-products':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      case 'digital-services':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'marketplace':
      default:
        return <Store className="w-5 h-5 text-emerald-400" />;
    }
  };

  const faqs = [
    {
      q: 'How does the manual bank transfer payment workflow operate?',
      a: 'After you place an order, our system generates an exclusive, cryptographically unique 8-digit Order Verification Code (e.g. 48291047). You initiate a direct wire or transfer to our corporate account and provide the 8-digit code as your transfer reference. Once you upload your receipt slip, XCM financial personnel confirm fund receipt in our account.',
    },
    {
      q: 'Why do I need to open a Discord ticket for verification?',
      a: 'To guarantee absolute delivery security and prevent automated credential theft or chargeback fraud, orders transition to Discord Ticket Verification. You provide your 8-digit code in our verified Discord server where an authorized staff member personally transfers email accounts, gift links, or configures your bots in real time.',
    },
    {
      q: 'What is the XCM Replacement Warranty?',
      a: 'Every gaming account and digital license sold directly by XCM includes an unconditional 30-day (or specified lifetime) warranty. If any credential lockout occurs during normal legitimate use, we issue an immediate replacement or full credit.',
    },
    {
      q: 'Can third-party sellers list products on XCM Store?',
      a: 'Yes! Approved sellers can apply via the Seller Portal. All third-party listings undergo strict quality and ownership audits by our moderator team prior to public listing, and customer funds are held in escrow until order completion.',
    },
  ];

  return (
    <div className="flex flex-col space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-neutral-950 pt-8 sm:pt-16 pb-12 sm:pb-24 border-b border-neutral-900">
        {/* Subtle Ambient Tech Glows - Fiery Gold & Red */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-600/15 via-orange-600/10 to-red-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 shadow-inner">
                <XCMLogo size="sm" showStoreText={false} />
                <span className="font-semibold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  XCM NETWORK
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">Official Digital Marketplace</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
                Verified Gaming Accounts, Discord Infrastructure & Digital Services
              </h1>

              <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
                Direct fulfillment with manual bank escrow security, unique 8-digit order verification, and 24/7 dedicated Discord ticket delivery.
              </p>

              {/* Product Search Form */}
              <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Minecraft capes, GTA V, Nitro, bots, web dev..."
                    className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  Explore Store
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick links */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400 pt-2">
                <span className="text-neutral-500 font-medium">Trending:</span>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-mc' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Minecraft VIP
                </button>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-discord', subcategoryId: 'sub-nitro' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Nitro 1-Year
                </button>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-gaming', subcategoryId: 'sub-gta' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  GTA V $2.5B
                </button>
                <button
                  onClick={() => navigate('catalog', { categoryId: 'cat-services', subcategoryId: 'sub-setup' })}
                  className="hover:text-amber-400 transition-colors"
                >
                  Discord Server Build
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-900 shadow-2xl group">
                <img
                  src="/src/assets/images/hero_marketplace_gaming_1794043365368.jpg"
                  alt="XCM Store Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-amber-400">Featured Gaming Asset</span>
                    <span className="text-[11px] text-neutral-400">Instant Delivery Ready</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Full-Access Migrated Account Suite</h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60 text-xs">
                    <span className="text-emerald-400 font-mono font-bold">$34.99 <span className="line-through text-neutral-500 font-normal">$49.99</span></span>
                    <button
                      onClick={() => navigate('catalog', { categoryId: 'cat-gaming' })}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      View Accounts
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Browse by Category</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select a specialized digital sector to view subcategories and verified stock
            </p>
          </div>
          <button
            onClick={() => navigate('catalog')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0"
          >
            All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate('catalog', { categoryId: cat.id })}
              className="group relative p-6 rounded-xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 cursor-pointer transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                {getCategoryIcon(cat.slug)}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
                <span>{cat.subcategories.length} Subcategories</span>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Flagship Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Featured Products & Services</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Top-selling gaming accounts and digital assets with verified warranty coverage
            </p>
          </div>
          <button
            onClick={() => navigate('catalog')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0"
          >
            View Full Inventory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Special Offer Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/35 bg-gradient-to-r from-amber-950/70 via-neutral-900 to-red-950/70 p-8 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              LIMITED-TIME PROMOTION
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Get 25% OFF with Official Coupon <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 font-mono font-extrabold">XCM25</span>
            </h3>

            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Apply coupon code XCM25 at checkout to save 25% on your entire order. Valid on all gaming accounts, Discord Nitro gifts, and custom server infrastructure.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-700 font-mono text-sm text-white font-bold shadow-inner">
                <span className="text-amber-400">XCM25</span>
                <button
                  onClick={handleCopyCoupon}
                  className="p-1 hover:text-amber-300 text-neutral-400 transition-colors"
                  title="Copy code"
                >
                  {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleClaimCoupon}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-orange-600/30 cursor-pointer"
              >
                {couponAppliedSuccess ? 'Applied to Cart!' : 'Claim & Apply'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose XCM Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white font-display">The XCM Standard</h2>
          <p className="text-xs text-neutral-400 mt-2">
            Why professional gamers, server administrators, and tech companies rely on XCM Network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white">Manual Bank Transfer Escrow</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No third-party payment gateway freezes or unauthorized card claims. Each order generates a unique 8-digit verification code confirmed directly in our commercial account.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white">Discord Ticket Live Dispatch</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              After payment verification, customers unlock a direct Discord ticket channel where credential transfer, email changes, and setup are personally performed by authorized staff.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white">Guaranteed Provenance & Warranty</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Accounts and licenses are vetted for clean ban histories and legitimate origin. Every purchase is backed by our full 30-day or lifetime warranty against retrieval.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Verified Customer Feedback</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Real reviews submitted exclusively by verified purchasers upon order completion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{rev.userName}</span>
                    <span className="text-[11px] text-neutral-500">{rev.productName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-neutral-500 text-xs">
              Verified customer reviews loading...
            </div>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white font-display">Frequently Asked Questions</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Everything you need to know about purchasing, payment slip verification, and Discord delivery
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-neutral-900/40 border border-neutral-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-neutral-200 hover:text-white transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
