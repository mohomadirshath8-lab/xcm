import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Star,
  ShoppingBag,
  ArrowRight,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Package,
  Share2,
} from 'lucide-react';
import { api, type Product, type Review } from '../lib/api.js';
import { useStore } from '../context/StoreContext.js';

export const ProductDetailsPage: React.FC = () => {
  const { pageParams, navigate, addToCart, toggleWishlist, isInWishlist, currentUser } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const productId = pageParams?.productId || 'prod-mc-cape';

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await api.getProduct(productId);
        setProduct(prod);
        setSelectedImage(prod.images[0] || '/src/assets/images/hero_marketplace_gaming_1794043365368.jpg');
        if (prod.servicePackages && prod.servicePackages.length > 0) {
          setSelectedPackage(prod.servicePackages[0]);
        }
        const revs = await api.getProductReviews(prod.id);
        setReviews(revs);
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-neutral-400 text-sm">
        Loading product information...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <button
          onClick={() => navigate('catalog')}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950/40"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const activePrice = selectedPackage
    ? selectedPackage.price
    : product.discountPrice ?? product.originalPrice;
  const hasDiscount = !selectedPackage && product.discountPrice && product.discountPrice < product.originalPrice;

  const handleAddToCart = () => {
    addToCart(product, 1, selectedPackage || undefined);
  };

  const handleBuyNow = () => {
    addToCart(product, 1, selectedPackage || undefined);
    navigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSubmitting(true);
    try {
      await api.submitReview({
        productId: product.id,
        rating: ratingInput,
        comment: commentInput,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setCommentInput('');
      }, 1500);
      const revs = await api.getProductReviews(product.id);
      setReviews(revs);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <button onClick={() => navigate('home')} className="hover:text-white transition-colors">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => navigate('catalog', { categoryId: product.categoryId })}
          className="hover:text-white transition-colors"
        >
          {product.categoryId.replace('cat-', '').toUpperCase()}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-200 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main 2-Column Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative group">
            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                isFavorited
                  ? 'bg-rose-500 text-white'
                  : 'bg-neutral-950/70 text-neutral-300 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-amber-500 scale-105' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Product Specifications */}
          <div className="rounded-xl bg-neutral-900/40 border border-neutral-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">
              Technical Specifications & Invariants
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Seller / Provenance</span>
                <span className="font-semibold text-neutral-200">{product.sellerName}</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Delivery Channel</span>
                <span className="font-semibold text-neutral-200">
                  {product.productType === 'service' ? 'Discord Staging & Handover' : 'Discord Ticket Dispatch'}
                </span>
              </div>
              {product.specifications &&
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">{key}</span>
                    <span className="font-semibold text-neutral-200">{val}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
            {/* Seller & Rating unboxed */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{product.sellerName}</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-mono font-semibold text-neutral-200">{product.rating.toFixed(1)}</span>
                <span className="text-neutral-500">({product.reviewCount} verified reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display leading-snug">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-800/80">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                ${activePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-base text-neutral-500 line-through font-mono tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Save ${(product.originalPrice - product.discountPrice!).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Service Packages Selector (If applicable) */}
            {product.servicePackages && product.servicePackages.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-300">
                  Select Service Package
                </label>
                <div className="space-y-2">
                  {product.servicePackages.map((pkg, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedPackage?.name === pkg.name
                          ? 'border-amber-500 bg-amber-950/20 text-white'
                          : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{pkg.name}</span>
                        <span className="font-mono text-amber-400">${pkg.price.toFixed(2)}</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-[11px] text-neutral-400">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty & Availability Notice */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-medium">{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {product.deliveryEstimate
                    ? `Estimated Delivery: ${product.deliveryEstimate}`
                    : 'Dispatch: Within 15-30 mins of ticket verification'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                Buy Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Add to Shopping Cart
              </button>
            </div>

            {/* Manual Bank Transfer Security Footnote */}
            <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 text-center leading-relaxed">
              Order generates a unique 8-digit verification code. Pay via direct bank wire; receipt verified manually before credential release.
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-neutral-900/40 border border-neutral-800 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Full Product Description</h3>
            <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {product.customerRequirements && (
              <div className="mt-4 pt-4 border-t border-neutral-800 text-xs">
                <span className="font-semibold text-amber-300 block mb-1">Customer Requirements:</span>
                <p className="text-neutral-400 leading-relaxed">{product.customerRequirements}</p>
              </div>
            )}

            {product.revisionPolicy && (
              <div className="mt-3 text-xs">
                <span className="font-semibold text-neutral-300 block mb-1">Revision Policy:</span>
                <p className="text-neutral-400 leading-relaxed">{product.revisionPolicy}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-neutral-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Customer Reviews</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified purchaser reviews submitted upon order completion
            </p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 self-start cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <div className="col-span-2 p-8 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center text-xs text-neutral-500">
              No customer reviews yet for this product. Be the first verified buyer to leave feedback!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{rev.userName}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic">"{rev.comment}"</p>
                {rev.adminReply && (
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] space-y-1">
                    <span className="font-semibold text-amber-400">{rev.adminReply.repliedBy}:</span>
                    <p className="text-neutral-400">{rev.adminReply.comment}</p>
                  </div>
                )}
                <div className="text-[10px] text-neutral-500">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Write a Verified Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Thank you! Your verified review has been submitted.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                {reviewError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className={`p-1 ${ratingInput >= star ? 'text-amber-400' : 'text-neutral-600'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Review Details</label>
                  <textarea
                    required
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Share your experience regarding credential transfer, verification speed, or service quality..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>

                <div className="text-[11px] text-neutral-500">
                  * Note: Only buyers with a completed order for this item are authorized to submit verified reviews.
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-orange-950/40 cursor-pointer"
                >
                  {reviewSubmitting ? 'Verifying...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
