import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// ==========================================
// 1. USERS
// ==========================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('customer'), // 'customer' | 'seller' | 'admin' | 'support'
  discordTag: text('discord_tag'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  isBanned: boolean('is_banned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 2. SELLER PROFILES
// ==========================================
export const sellerProfiles = pgTable('seller_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  storeName: text('store_name').notNull(),
  bio: text('bio'),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'suspended'
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull().default('10.00'),
  availableBalance: numeric('available_balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
  pendingBalance: numeric('pending_balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalWithdrawn: numeric('total_withdrawn', { precision: 10, scale: 2 }).notNull().default('0.00'),
  payoutMethod: text('payout_method').default('bank_transfer'),
  payoutDetails: text('payout_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 3. CATEGORIES
// ==========================================
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 4. SUBCATEGORIES
// ==========================================
export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'cascade' })
    .notNull(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 5. PRODUCTS
// ==========================================
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  subcategoryId: integer('subcategory_id')
    .references(() => subcategories.id),
  sellerId: integer('seller_id')
    .references(() => users.id, { onDelete: 'set null' }), // NULL for official XCM Store products
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  shortDescription: text('short_description'),
  description: text('description').notNull(),
  images: text('images').notNull(), // JSON-encoded string array
  stockQuantity: integer('stock_quantity').notNull().default(1),
  isService: boolean('is_service').notNull().default(false),
  estimatedDelivery: text('estimated_delivery'),
  warrantyPolicy: text('warranty_policy'),
  customerRequirements: text('customer_requirements'),
  revisionPolicy: text('revision_policy'),
  packages: text('packages'), // JSON-encoded array of service tier packages
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  reviewsCount: integer('reviews_count').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  isBestSeller: boolean('is_best_seller').notNull().default(false),
  isLatest: boolean('is_latest').notNull().default(true),
  status: text('status').notNull().default('active'), // 'active' | 'draft' | 'rejected' | 'sold_out'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 6. ORDERS
// ==========================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderCode: text('order_code').notNull().unique(), // 8-digit unique code e.g. "48291047"
  customerId: integer('customer_id')
    .references(() => users.id)
    .notNull(),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  customerDiscord: text('customer_discord'),
  customerPhone: text('customer_phone'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  couponCode: text('coupon_code'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending_payment'), // 'pending_payment' | 'payment_under_review' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod: text('payment_method').notNull().default('bank_transfer'),
  paymentBankName: text('payment_bank_name'),
  paymentAccountNumber: text('payment_account_number'),
  receiptUrl: text('receipt_url'),
  receiptUploadedAt: timestamp('receipt_uploaded_at'),
  verifiedByUserId: integer('verified_by_user_id').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  deliveryCredentials: text('delivery_credentials'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 7. ORDER ITEMS
// ==========================================
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  sellerId: integer('seller_id')
    .references(() => users.id),
  title: text('title').notNull(),
  packageName: text('package_name'),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 8. REVIEWS
// ==========================================
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'set null' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull().default(5),
  comment: text('comment').notNull(),
  adminReplyComment: text('admin_reply_comment'),
  adminReplyBy: text('admin_reply_by'),
  adminReplyAt: timestamp('admin_reply_at'),
  isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(true),
  status: text('status').notNull().default('approved'), // 'approved' | 'hidden' | 'flagged'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 9. COUPONS
// ==========================================
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull().default('percentage'), // 'percentage' | 'fixed'
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  minPurchase: numeric('min_purchase', { precision: 10, scale: 2 }).notNull().default('0.00'),
  maxDiscount: numeric('max_discount', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  expiryDate: text('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 10. WISHLISTS
// ==========================================
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 12. BANK TRANSFER SETTINGS
// ==========================================
export const bankTransferSettings = pgTable('bank_transfer_settings', {
  id: serial('id').primaryKey(),
  bankName: text('bank_name').notNull(),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number').notNull(),
  branch: text('branch'),
  swiftCode: text('swift_code'),
  instructions: text('instructions'),
  discordTicketUrl: text('discord_ticket_url'),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 13. AUDIT LOGS
// ==========================================
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id')
    .references(() => users.id, { onDelete: 'set null' }),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 14. SELLER PAYOUT REQUESTS
// ==========================================
export const sellerPayoutRequests = pgTable('seller_payout_requests', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payoutMethod: text('payout_method').notNull(),
  accountInfo: text('account_info').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'paid'
  transactionReference: text('transaction_reference'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

// ==========================================
// RELATIONS
// ==========================================
export const usersRelations = relations(users, ({ one, many }) => ({
  sellerProfile: one(sellerProfiles, {
    fields: [users.id],
    references: [sellerProfiles.userId],
  }),
  orders: many(orders),
  reviews: many(reviews),
  wishlists: many(wishlists),
  notifications: many(notifications),
  payoutRequests: many(sellerPayoutRequests),
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [orders.verifiedByUserId],
    references: [users.id],
  }),
  items: many(orderItems),
  reviews: many(reviews),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
