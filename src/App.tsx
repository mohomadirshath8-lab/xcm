import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { ProductDetailsPage } from './pages/ProductDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { CustomerDashboard } from './pages/CustomerDashboard.js';
import { SellerDashboard } from './pages/SellerDashboard.js';
import { AdminPanel } from './pages/AdminPanel.js';
import { SupportPage } from './pages/SupportPage.js';
import { LegalPage } from './pages/LegalPage.js';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentPage, siteSettings, currentUser } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check Maintenance Mode
  const isStaff = currentUser && [
    'Owner',
    'Super Admin',
    'Admin',
    'Finance Manager',
    'Order Manager',
    'Product Manager',
    'Support Manager',
  ].includes(currentUser.role);

  if (siteSettings?.maintenanceMode && !isStaff && currentPage !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-display text-white mb-2">Scheduled Maintenance in Progress</h1>
        <p className="text-sm text-neutral-400 max-w-md leading-relaxed mb-4">
          {siteSettings.maintenanceMessage}
        </p>
        <div className="text-xs font-mono text-neutral-500">
          Estimated Return: {siteSettings.estimatedReturnTime}
        </div>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="mt-8 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-medium border border-neutral-800 transition-colors"
        >
          Staff Sign-In Bypass
        </button>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  // Render Page Content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'product-details':
        return <ProductDetailsPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'order-tracking':
        return <OrderTrackingPage />;
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'seller-dashboard':
        return <SellerDashboard />;
      case 'admin':
        return <AdminPanel />;
      case 'contact':
        return <SupportPage />;
      case 'faq':
        return <HomePage />;
      case 'terms':
        return <LegalPage initialTab="terms" />;
      case 'privacy':
        return <LegalPage initialTab="privacy" />;
      case 'refund-policy':
        return <LegalPage initialTab="refund" />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Dynamic Viewport */}
      <div className="flex-1 w-full">
        {renderPage()}
      </div>

      {/* Universal Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Universal Sign-In / Registration Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Bottom Footer */}
      {currentPage !== 'admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
