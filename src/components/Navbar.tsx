import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Bell,
  Shield,
  Store,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { XCMLogo } from './XCMLogo.js';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const {
    currentPage,
    pageParams,
    navigate,
    currentUser,
    logout,
    demoLogin,
    cart,
    setIsCartDrawerOpen,
    wishlist,
    notifications,
    siteSettings,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('catalog', { search: searchQuery.trim() });
      setIsSearchOpen(false);
    }
  };

  const isStaff = currentUser && [
    'Owner',
    'Super Admin',
    'Admin',
    'Finance Manager',
    'Order Manager',
    'Product Manager',
    'Support Manager',
    'Moderator',
  ].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/90 border-b border-neutral-800/80">
      {/* Optional Announcement Banner */}
      {!bannerDismissed && siteSettings?.announcementText && (
        <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-red-950 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <span className="font-semibold text-amber-400">ANNOUNCEMENT</span>
            <span className="text-neutral-300 truncate">{siteSettings.announcementText}</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-neutral-400 hover:text-white p-0.5 ml-2 shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar - Following Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Links) - Zone 3 (Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with Crystalline Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 rounded"
          >
            <XCMLogo size="md" showStoreText={true} />
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => navigate('catalog', { categoryId: 'cat-gaming' })}
            className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
              currentPage === 'catalog' && pageParams?.categoryId === 'cat-gaming'
                ? 'text-amber-400 font-semibold'
                : ''
            }`}
          >
            Gaming Accounts
          </button>
          <button
            onClick={() => navigate('catalog', { categoryId: 'cat-discord' })}
            className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
              currentPage === 'catalog' && pageParams?.categoryId === 'cat-discord'
                ? 'text-amber-400 font-semibold'
                : ''
            }`}
          >
            Discord Products
          </button>
          <button
            onClick={() => navigate('catalog', { categoryId: 'cat-services' })}
            className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
              currentPage === 'catalog' && pageParams?.categoryId === 'cat-services'
                ? 'text-amber-400 font-semibold'
                : ''
            }`}
          >
            Digital Services
          </button>
          <button
            onClick={() => navigate('catalog', { categoryId: 'cat-marketplace' })}
            className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
              currentPage === 'catalog' && pageParams?.categoryId === 'cat-marketplace'
                ? 'text-amber-400 font-semibold'
                : ''
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => navigate('contact')}
            className={`whitespace-nowrap transition-colors hover:text-amber-400 ${
              currentPage === 'contact' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Support
          </button>
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-neutral-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-neutral-900"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => (currentUser ? navigate('customer-dashboard', { tab: 'wishlist' }) : onOpenAuth())}
            className="relative p-2 text-neutral-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-neutral-900"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="relative p-2 text-neutral-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-neutral-900"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200">Notifications</span>
                  <span className="text-[11px] text-neutral-400">{unreadNotifs} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs hover:bg-neutral-800/40 cursor-pointer ${
                          !notif.read ? 'bg-amber-950/20' : ''
                        }`}
                        onClick={() => {
                          if (notif.link) {
                            if (notif.link.startsWith('/admin')) navigate('admin');
                            else if (notif.link.startsWith('/orders/')) {
                              const code = notif.link.split('/').pop();
                              navigate('order-tracking', { orderCode: code });
                            }
                          }
                          setIsNotifMenuOpen(false);
                        }}
                      >
                        <div className="font-medium text-neutral-200">{notif.title}</div>
                        <div className="text-neutral-400 mt-0.5 line-clamp-2">{notif.message}</div>
                        <div className="text-[10px] text-neutral-500 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition-colors group"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
            <span className="font-semibold text-neutral-200">{cartItemsCount}</span>
          </button>

          {/* User Account / Login */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 hover:from-amber-500/20 hover:to-red-500/20 text-amber-200 border border-amber-500/30 text-xs font-medium transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="font-semibold text-neutral-200 truncate">{currentUser.name}</p>
                    <p className="text-neutral-400 truncate text-[11px]">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('customer-dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      My Orders & Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate('order-tracking');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
                      Track 8-Digit Order
                    </button>

                    {(currentUser.role === 'Seller' || isStaff) && (
                      <button
                        onClick={() => {
                          navigate('seller-dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                      >
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        Seller Dashboard
                      </button>
                    )}

                    {isStaff && (
                      <button
                        onClick={() => {
                          navigate('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-amber-300 hover:bg-amber-950/40 font-medium flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        XCM Admin Panel
                      </button>
                    )}
                  </div>

                  <div className="border-t border-neutral-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 rounded-lg transition-all whitespace-nowrap shadow-md shadow-orange-500/20 active:scale-95"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Global Product Search Expanded Bar */}
      {isSearchOpen && (
        <div className="border-t border-neutral-800 bg-neutral-900/95 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Minecraft, GTA V accounts, Discord Nitro, web development, custom bots..."
              className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-4 space-y-2 text-sm">
          <button
            onClick={() => {
              navigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate('catalog', { categoryId: 'cat-gaming' });
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Gaming Accounts
          </button>
          <button
            onClick={() => {
              navigate('catalog', { categoryId: 'cat-discord' });
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Discord Products
          </button>
          <button
            onClick={() => {
              navigate('catalog', { categoryId: 'cat-services' });
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Digital Services
          </button>
          <button
            onClick={() => {
              navigate('catalog', { categoryId: 'cat-marketplace' });
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              navigate('order-tracking');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Track 8-Digit Order
          </button>
          <button
            onClick={() => {
              navigate('contact');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-neutral-300 hover:text-white"
          >
            Contact / Support
          </button>

          {isStaff && (
            <button
              onClick={() => {
                navigate('admin');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-amber-400 font-semibold"
            >
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
