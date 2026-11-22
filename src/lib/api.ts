export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  phone?: string;
  discordTag?: string;
  customPermissions?: string[];
  createdAt?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  enabled: boolean;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  warranty: string;
  stockQuantity: number;
  images: string[];
  productType: 'account' | 'service' | 'digital_key' | 'subscription';
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  isMarketplace: boolean;
  specifications?: Record<string, string>;
  servicePackages?: { name: string; price: number; features: string[] }[];
  deliveryEstimate?: string;
  customerRequirements?: string;
  revisionPolicy?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warranty: string;
  deliveryDetails?: string;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Slip Uploaded'
  | 'Under Review'
  | 'Payment Verified'
  | 'Discord Verification'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Refunded'
  | 'Expired';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  actorRole: string;
  notes?: string;
}

export interface OrderBankSnapshot {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch: string;
  paymentInstructions: string;
  paymentDeadlineHours: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  bankSnapshot: OrderBankSnapshot;
  paymentSlipUrl?: string;
  paymentSlipUploadedAt?: string;
  discordUsername?: string;
  discordTicketNumber?: string;
  discordVerifiedAt?: string;
  discordVerifiedBy?: string;
  internalAdminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  active: boolean;
  categoryId?: string;
  productId?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isPinned?: boolean;
  adminReply?: {
    comment: string;
    repliedBy: string;
    repliedAt: string;
  };
  createdAt: string;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch: string;
  paymentInstructions: string;
  paymentDeadlineHours: number;
}

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  estimatedReturnTime: string;
  marketplaceCommissionPercent: number;
  currentTheme: 'default' | 'cyberpunk' | 'christmas' | 'halloween';
  announcementText: string;
  discordInviteUrl: string;
  supportEmail: string;
  storeUrl: string;
}

export interface SellerProfile {
  userId: string;
  storeName: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  rating: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  bankDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Token storage
export const AUTH_TOKEN_KEY = 'xcm_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body: any) => request<{ token: string; user: User }>('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: User }>('/auth/me'),
  updateProfile: (body: any) => request<{ success: boolean; user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (body: any) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: any) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: string) => request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Product[]>(`/products${qs}`);
  },
  getAdminProducts: () => request<Product[]>('/products/admin-all'),
  getProduct: (idOrSlug: string) => request<Product>(`/products/${idOrSlug}`),
  createProduct: (body: any) => request<Product>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Coupons
  validateCoupon: (code: string, cartTotal: number, categoryIds?: string[]) =>
    request<{ valid: boolean; code: string; type: string; value: number; discountAmount: number }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal, categoryIds }),
    }),
  getCoupons: () => request<Coupon[]>('/coupons'),
  createCoupon: (body: any) => request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(body) }),
  updateCoupon: (id: string, body: any) => request<Coupon>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCoupon: (id: string) => request<{ success: boolean }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body: any) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  trackOrder: (codeOrId: string) => request<Order>(`/orders/track/${codeOrId}`),
  getMyOrders: () => request<Order[]>('/orders/my-orders'),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  uploadSlip: (id: string, slipDataUrl: string, notes?: string) =>
    request<{ success: boolean; order: Order }>(`/orders/${id}/upload-slip`, {
      method: 'POST',
      body: JSON.stringify({ slipDataUrl, notes }),
    }),
  updateOrderStatus: (id: string, status: OrderStatus, notes?: string) =>
    request<{ success: boolean; order: Order }>(`/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),
  discordVerifyOrder: (id: string, data: { discordTicketNumber: string; discordUsername?: string; notes?: string }) =>
    request<{ success: boolean; order: Order }>(`/orders/${id}/discord-verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  saveOrderNotes: (id: string, internalNotes: string) =>
    request<{ success: boolean; order: Order }>(`/orders/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ internalNotes }),
    }),

  // Reviews
  getProductReviews: (productId: string) => request<Review[]>(`/reviews/product/${productId}`),
  submitReview: (body: any) => request<Review>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getAdminReviews: () => request<Review[]>('/reviews/admin'),
  updateReviewStatus: (id: string, status: string, isPinned?: boolean) =>
    request<Review>(`/reviews/${id}/status`, { method: 'POST', body: JSON.stringify({ status, isPinned }) }),
  replyReview: (id: string, replyText: string) =>
    request<Review>(`/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify({ replyText }) }),

  // Bank
  getBankDetails: () => request<BankDetails>('/bank-details'),
  updateBankDetails: (body: Partial<BankDetails>) => request<BankDetails>('/bank-details', { method: 'PUT', body: JSON.stringify(body) }),

  // Seller
  applySeller: (body: { storeName: string; bio: string }) => request<SellerProfile>('/seller/apply', { method: 'POST', body: JSON.stringify(body) }),
  getSellerProfile: () => request<SellerProfile>('/seller/profile'),
  getSellerProducts: () => request<Product[]>('/seller/products'),
  requestWithdrawal: (body: { amount: number; bankDetails: string }) => request<WithdrawalRequest>('/seller/withdraw', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminAnalytics: () => request<any>('/admin/analytics'),
  getAdminOrders: () => request<Order[]>('/admin/orders'),
  getAdminStaff: () => request<User[]>('/admin/staff'),
  createStaff: (body: any) => request<User>('/admin/staff', { method: 'POST', body: JSON.stringify(body) }),
  updateStaff: (id: string, body: any) => request<User>(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getAuditLogs: () => request<AuditLog[]>('/admin/audit-logs'),
  getSiteSettings: () => request<SiteSettings>('/admin/settings'),
  updateSiteSettings: (body: Partial<SiteSettings>) => request<SiteSettings>('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
  getAdminWithdrawals: () => request<WithdrawalRequest[]>('/admin/withdrawals'),
  processWithdrawal: (id: string, action: 'approve' | 'reject', notes?: string) =>
    request<WithdrawalRequest>(`/admin/withdrawals/${id}/process`, { method: 'POST', body: JSON.stringify({ action, notes }) }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
};
