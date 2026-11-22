import React, { useState } from 'react';
import { Heart, ShoppingBag, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { type Product } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [imageError, setImageError] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.discountPrice ?? product.originalPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.originalPrice;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => navigate('product-details', { productId: product.id })}
      className="group relative flex flex-col bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
        {!imageError && product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/30">
            <ShieldCheck className="w-8 h-8 text-amber-400 mb-2 opacity-60" />
            <span className="text-xs font-medium text-neutral-400 line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Favorite Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md transition-colors ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-neutral-950/60 text-neutral-400 hover:text-white hover:bg-neutral-950/80'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quiet Discount percentage text */}
        {hasDiscount && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-neutral-950/80 text-emerald-400 backdrop-blur-sm border border-emerald-500/30">
            Save ${(product.originalPrice - product.discountPrice!).toFixed(2)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
          <span>{product.sellerName}</span>
          <span aria-hidden="true">·</span>
          <span>{product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Made to Order'}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="tabular-nums font-mono text-neutral-300">{product.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-3 leading-snug">
          {product.name}
        </h3>

        {/* Price and Action Section */}
        <div className="mt-auto pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white font-mono tabular-nums">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-500 line-through font-mono tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 truncate">{product.warranty}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleAddToCart}
              className="p-2 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              title="Add to Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={handleBuyNow}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 rounded-lg transition-colors shadow-sm shadow-orange-600/20 flex items-center gap-1"
            >
              Buy
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
