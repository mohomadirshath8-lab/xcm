import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
  order: number;
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
  orderCode: string; // 8-digit unique code
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
  sellerCommissions?: { sellerId: string; amount: number; rate: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
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

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'Owner' | 'Super Admin' | 'Admin' | 'Finance Manager' | 'Order Manager' | 'Product Manager' | 'Support Manager' | 'Moderator' | 'Seller' | 'Customer';
  customPermissions?: string[];
  status: 'active' | 'suspended';
  avatarUrl?: string;
  phone?: string;
  discordTag?: string;
  createdAt: string;
}

export interface SellerProfile {
  userId: string;
  storeName: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number; // e.g. 10%
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

export interface Notification {
  id: string;
  userId: string; // or 'ADMIN'
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'seller' | 'review';
  link?: string;
  read: boolean;
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

export interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  users: User[];
  sellerProfiles: SellerProfile[];
  withdrawals: WithdrawalRequest[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  bankDetails: BankDetails;
  siteSettings: SiteSettings;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'xcm_database.json');

// Memory cache
let dbCache: DatabaseSchema | null = null;

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_xcm_salt_2026').digest('hex');
}

export function generate8DigitOrderCode(existingCodes: Set<string>): string {
  let code = '';
  let attempts = 0;
  do {
    // Cryptographically secure random 8-digit number (10000000 - 99999999)
    const randomBuffer = crypto.randomBytes(4);
    const num = 10000000 + (randomBuffer.readUInt32BE(0) % 90000000);
    code = num.toString();
    attempts++;
    if (attempts > 1000) {
      throw new Error('Collision exhaustion generating unique order code');
    }
  } while (existingCodes.has(code));
  return code;
}

function getInitialDatabase(): DatabaseSchema {
  return {
    siteSettings: {
      maintenanceMode: false,
      maintenanceMessage: 'XCM Store is currently undergoing scheduled infrastructure upgrades. We will be back online shortly.',
      estimatedReturnTime: '2026-11-07 16:00 UTC',
      marketplaceCommissionPercent: 10,
      currentTheme: 'default',
      announcementText: 'EXCLUSIVE: Use coupon code XCM25 for 25% OFF your entire digital gaming & Discord cart!',
      discordInviteUrl: 'https://discord.gg/xcmnetwork',
      supportEmail: 'support@xcmnetwork.com',
      storeUrl: 'store.xcmnetwork.com',
    },
    bankDetails: {
      bankName: 'XCM Global Commerce Bank',
      accountHolder: 'XCM NETWORK DIGITAL SERVICES LLC',
      accountNumber: '9042-8812-7741-002',
      branch: 'International Tech Financial Center, Suite 400',
      paymentInstructions: '1. Transfer the exact order total via online banking or direct wire.\n2. In the transfer reference or notes field, enter your unique 8-digit Order Code.\n3. Save a screenshot or PDF of the receipt.\n4. Upload the receipt file using the slip uploader.\n5. XCM Financial Staff will verify the payment and authorize Discord Ticket Verification.',
      paymentDeadlineHours: 24,
    },
    categories: [
      {
        id: 'cat-gaming',
        name: 'Gaming Accounts',
        slug: 'gaming-accounts',
        icon: 'Gamepad2',
        description: 'Pristine, verified gaming accounts with full email transfer, warranties, and clean records.',
        order: 1,
        enabled: true,
        subcategories: [
          { id: 'sub-mc', name: 'Minecraft', slug: 'minecraft', description: 'Java & Bedrock migrated accounts with ranks and capes', enabled: true, order: 1 },
          { id: 'sub-gta', name: 'GTA V', slug: 'gta-v', description: 'Modded and clean GTA V accounts with high balance', enabled: true, order: 2 },
          { id: 'sub-rdr2', name: 'Red Dead Redemption 2', slug: 'red-dead-redemption-2', description: 'Full outlaw progression accounts', enabled: true, order: 3 },
          { id: 'sub-ark', name: 'ARK: Survival', slug: 'ark-survival', description: 'Ascended and Evolved high-tier accounts', enabled: true, order: 4 },
          { id: 'sub-othergames', name: 'Other Games', slug: 'other-games', description: 'Steam, Epic, and Battle.net accounts', enabled: true, order: 5 },
        ],
      },
      {
        id: 'cat-discord',
        name: 'Discord Products',
        slug: 'discord-products',
        icon: 'MessageSquare',
        description: 'Authentic Discord Nitro gifts, server boost packages, bot systems, and complete server infrastructure.',
        order: 2,
        enabled: true,
        subcategories: [
          { id: 'sub-nitro', name: 'Discord Nitro', slug: 'discord-nitro', description: 'Legitimate monthly and yearly Nitro gifts', enabled: true, order: 1 },
          { id: 'sub-boosts', name: 'Discord Server Boosts', slug: 'discord-server-boosts', description: 'Level 1, 2, and 3 boost bundles', enabled: true, order: 2 },
          { id: 'sub-setup', name: 'Discord Server Setup', slug: 'discord-server-setup', description: 'Bespoke community and gaming servers', enabled: true, order: 3 },
          { id: 'sub-bots', name: 'Discord Bots', slug: 'discord-bots', description: 'Custom moderation and economy bots', enabled: true, order: 4 },
          { id: 'sub-otherdiscord', name: 'Other Discord Products', slug: 'other-discord-products', description: 'Vanity links, banners, and badges', enabled: true, order: 5 },
        ],
      },
      {
        id: 'cat-services',
        name: 'Digital Services',
        slug: 'digital-services',
        icon: 'Code',
        description: 'Professional development, management, video editing, and design services delivered by XCM specialists.',
        order: 3,
        enabled: true,
        subcategories: [
          { id: 'sub-srv-mgmt', name: 'Discord Server Management', slug: 'discord-server-management', description: '24/7 moderation and event hosting', enabled: true, order: 1 },
          { id: 'sub-srv-social', name: 'Social Media Management', slug: 'social-media-management', description: 'Audience growth and content scheduling', enabled: true, order: 2 },
          { id: 'sub-srv-design', name: 'Graphic Design', slug: 'graphic-design', description: 'Branding, banners, thumbnails, and icons', enabled: true, order: 3 },
          { id: 'sub-srv-video', name: 'Video Editing', slug: 'video-editing', description: 'Gaming montages, YouTube videos, and TikToks', enabled: true, order: 4 },
          { id: 'sub-srv-web', name: 'Website Development', slug: 'website-development', description: 'React, Next.js, and full-stack web solutions', enabled: true, order: 5 },
          { id: 'sub-srv-custom', name: 'Custom Digital Services', slug: 'custom-digital-services', description: 'Tailored enterprise tech workflows', enabled: true, order: 6 },
        ],
      },
      {
        id: 'cat-marketplace',
        name: 'Marketplace',
        slug: 'marketplace',
        icon: 'Store',
        description: 'Verified digital products and custom creative assets from vetted third-party sellers on XCM Network.',
        order: 4,
        enabled: true,
        subcategories: [
          { id: 'sub-mkt-gaming', name: 'Gaming Products', slug: 'gaming-products', description: 'Third-party game guides and digital items', enabled: true, order: 1 },
          { id: 'sub-mkt-discord', name: 'Discord Products', slug: 'discord-products', description: 'Seller-provided templates and bots', enabled: true, order: 2 },
          { id: 'sub-mkt-services', name: 'Digital Services', slug: 'digital-services', description: 'Freelancer specialized tech services', enabled: true, order: 3 },
          { id: 'sub-mkt-other', name: 'Other Digital Products', slug: 'other-digital-products', description: 'Music stems, 3D models, and presets', enabled: true, order: 4 },
        ],
      },
    ],
    products: [
      {
        id: 'prod-mc-cape',
        name: 'Minecraft Java & Bedrock VIP Account (Migrated + Dragon Cape)',
        slug: 'minecraft-vip-migrated-account-dragon-cape',
        categoryId: 'cat-gaming',
        subcategoryId: 'sub-mc',
        description: 'Full-access official Minecraft account migrated to Microsoft. Includes rare Migrator and 15th Anniversary Dragon Capes, clean ban history on Hypixel (VIP+ rank active), instant full email and security question transfer. Backed by our 30-day replacement warranty.',
        originalPrice: 49.99,
        discountPrice: 34.99,
        warranty: '30-Day Full Replacement Warranty',
        stockQuantity: 14,
        images: ['/src/assets/images/product_minecraft_account_1794043365430.jpg'],
        productType: 'account',
        featured: true,
        status: 'active',
        rating: 4.9,
        reviewCount: 48,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        specifications: {
          'Edition': 'Java + Bedrock Bundle',
          'Hypixel Rank': 'VIP+ (Level 68)',
          'Capes': 'Dragon Cape & Migrator Cape',
          'Transfer Type': 'Direct Microsoft Email Switch',
          'Name Change': 'Available Immediately',
        },
        createdAt: '2026-10-15T10:00:00Z',
      },
      {
        id: 'prod-discord-nitro-year',
        name: 'Discord Nitro 1-Year Subscription (Official Gift Activation)',
        slug: 'discord-nitro-1-year-subscription-gift',
        categoryId: 'cat-discord',
        subcategoryId: 'sub-nitro',
        description: 'Legitimate 12-month Discord Nitro gift activation link. Unlocks two free Server Boosts monthly, 500MB file uploads, custom HD streaming at 4K 60FPS, custom emojis anywhere, special animated profile badge, and super reactions. Zero risk of revocation.',
        originalPrice: 99.99,
        discountPrice: 64.99,
        warranty: '12-Month Activation & Stability Guarantee',
        stockQuantity: 32,
        images: ['/src/assets/images/product_discord_nitro_1794043366446.jpg'],
        productType: 'digital_key',
        featured: true,
        status: 'active',
        rating: 5.0,
        reviewCount: 92,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        specifications: {
          'Duration': '12 Full Months',
          'Delivery Method': 'Discord Ticket Code / Official Gift URL',
          'Region': 'Worldwide (Global)',
          'Included Boosts': '2x Monthly Server Boosts',
        },
        createdAt: '2026-10-18T14:30:00Z',
      },
      {
        id: 'prod-gta5-billionaire',
        name: 'Grand Theft Auto V Premium Billionaire Modded Account (PC / Rockstar)',
        slug: 'gta-v-billionaire-modded-account-pc',
        categoryId: 'cat-gaming',
        subcategoryId: 'sub-gta',
        description: 'Pristine GTA V Online account with $2.5 Billion banked cash, Rank 250, all research items unlocked, Pegasus vehicles, maxed CEO Garages loaded with rare Deluxos and Oppressors, and clean anti-cheat standing.',
        originalPrice: 59.99,
        discountPrice: 39.99,
        warranty: 'Lifetime Ban-Proof Guarantee',
        stockQuantity: 9,
        images: ['/src/assets/images/product_gta_v_account_1794043367273.jpg'],
        productType: 'account',
        featured: true,
        status: 'active',
        rating: 4.8,
        reviewCount: 37,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        specifications: {
          'Bank Cash': '$2,500,000,000+',
          'Rank Level': '250 (Legit Stats Look)',
          'Platform': 'PC (Rockstar Games Launcher)',
          'Bunker Research': '100% Complete',
        },
        createdAt: '2026-10-20T12:00:00Z',
      },
      {
        id: 'prod-srv-discord-setup',
        name: 'Professional Discord Community Infrastructure & Bot Configuration',
        slug: 'professional-discord-community-server-setup',
        categoryId: 'cat-services',
        subcategoryId: 'sub-setup',
        description: 'Complete custom architectural build of an enterprise-grade Discord server. Includes customized category hierarchy, self-assignable roles, verification gatekeeper bots, automated ticket system, anti-raid protection, custom welcome banners, and staff audit logs.',
        originalPrice: 149.99,
        discountPrice: 119.99,
        warranty: '14-Day Post-Launch Direct Support',
        stockQuantity: 99,
        images: ['/src/assets/images/product_server_setup_service_1794043367242.jpg'],
        productType: 'service',
        featured: true,
        status: 'active',
        rating: 5.0,
        reviewCount: 23,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        deliveryEstimate: '48 Hours',
        customerRequirements: 'Provide server name, intended theme/community niche, branding assets (logo/colors), and list of required bot integrations.',
        revisionPolicy: 'Up to 3 rounds of modifications included within 7 days of server handover.',
        servicePackages: [
          { name: 'Standard Community', price: 119.99, features: ['Up to 25 Channels & Categories', 'Auto-Role & Reaction Verification', 'Ticketing Bot Integration', '14-Day Support'] },
          { name: 'Enterprise Gaming Guild', price: 189.99, features: ['Unlimited Channels', 'Custom Webhook Announcements', 'Economy & Levelling Systems', 'Anti-Raid Firewall', '30-Day VIP Support'] },
        ],
        createdAt: '2026-10-22T08:00:00Z',
      },
      {
        id: 'prod-boost-14x',
        name: 'Discord Server 14x Level 3 Boost Pack (3-Month Duration)',
        slug: 'discord-server-14x-level-3-boost-pack-3-months',
        categoryId: 'cat-discord',
        subcategoryId: 'sub-boosts',
        description: 'Elevate your Discord server instantly to Level 3 perks for 3 full months. Unlocks 384kbps audio quality, 100MB upload limits for all members, custom invite URL, 100 extra emoji slots, and animated server icon.',
        originalPrice: 39.99,
        discountPrice: 24.99,
        warranty: '3-Month Uptime Guarantee with Auto-Replacement',
        stockQuantity: 45,
        images: ['/src/assets/images/product_discord_nitro_1794043366446.jpg'],
        productType: 'digital_key',
        featured: true,
        status: 'active',
        rating: 4.9,
        reviewCount: 64,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        specifications: {
          'Boost Quantity': '14 Server Boosts',
          'Target Server Level': 'Level 3 Maximum',
          'Duration': '90 Days Guarantee',
          'Activation Time': 'Within 15 minutes of Discord ticket verification',
        },
        createdAt: '2026-10-25T16:00:00Z',
      },
      {
        id: 'prod-web-dev',
        name: 'Custom High-Performance Full-Stack Web Development',
        slug: 'custom-high-performance-web-development-service',
        categoryId: 'cat-services',
        subcategoryId: 'sub-srv-web',
        description: 'Bespoke web application development crafted with Next.js/React, Tailwind CSS, high-speed API backends, and responsive UX. Ideal for gaming clans, SaaS landing pages, portfolio sites, and e-commerce stores.',
        originalPrice: 599.99,
        discountPrice: 449.99,
        warranty: '60-Day Bug Fix & Security Warranty',
        stockQuantity: 5,
        images: ['/src/assets/images/hero_marketplace_gaming_1794043365368.jpg'],
        productType: 'service',
        featured: true,
        status: 'active',
        rating: 5.0,
        reviewCount: 19,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        deliveryEstimate: '5 - 7 Business Days',
        customerRequirements: 'Provide project brief, design preferences or wireframes, domain details, and required third-party integrations.',
        revisionPolicy: 'Unlimited revisions during staging phase until client sign-off.',
        createdAt: '2026-10-26T11:00:00Z',
      },
      {
        id: 'prod-mkt-banner-pack',
        name: 'Cyberpunk Animated Discord Banners & Emote Suite',
        slug: 'cyberpunk-animated-discord-banners-emotes',
        categoryId: 'cat-marketplace',
        subcategoryId: 'sub-mkt-discord',
        description: 'Handcrafted neon cyberpunk aesthetic graphics bundle created by approved creator VortexDesign. Contains 12 looping animated GIF banners, 24 custom SVG/PNG server emojis, and 6 role badges.',
        originalPrice: 29.99,
        discountPrice: 19.99,
        warranty: 'Instant Asset Download & Lifetime License',
        stockQuantity: 80,
        images: ['/src/assets/images/product_discord_nitro_1794043366446.jpg'],
        productType: 'digital_key',
        featured: false,
        status: 'active',
        rating: 4.9,
        reviewCount: 31,
        sellerId: 'seller-vortex',
        sellerName: 'VortexDesign (Approved Seller)',
        isMarketplace: true,
        specifications: {
          'File Format': 'GIF, PNG, SVG vector source',
          'Resolution': '1920x1080 banner, 512x512 icons',
          'License': 'Commercial Server Rights',
        },
        createdAt: '2026-10-28T14:00:00Z',
      },
      {
        id: 'prod-rdr2-outlaw',
        name: 'Red Dead Redemption 2 PC Account (Rank 120 + All Roles)',
        slug: 'rdr2-pc-account-rank-120-all-roles',
        categoryId: 'cat-gaming',
        subcategoryId: 'sub-rdr2',
        description: 'Complete outlaw profile for RDR2 Online. All 5 specialist roles maxed out (Bounty Hunter, Trader, Collector, Moonshiner, Naturalist), 350 Gold Bars, $45,000 cash, and top-tier Arabian horse.',
        originalPrice: 44.99,
        discountPrice: 29.99,
        warranty: '30-Day Account Guarantee',
        stockQuantity: 7,
        images: ['/src/assets/images/hero_marketplace_gaming_1794043365368.jpg'],
        productType: 'account',
        featured: false,
        status: 'active',
        rating: 4.7,
        reviewCount: 15,
        sellerId: 'xcm-official',
        sellerName: 'XCM Network Official',
        isMarketplace: false,
        specifications: {
          'Gold Bars': '350 Gold',
          'Cash Balance': '$45,000',
          'Roles Maxed': '5 of 5 Roles Max Level',
          'Platform': 'Rockstar Games Launcher (PC)',
        },
        createdAt: '2026-10-29T19:00:00Z',
      },
    ],
    coupons: [
      {
        id: 'coup-xcm25',
        code: 'XCM25',
        type: 'percentage',
        value: 25,
        minPurchase: 0,
        expiryDate: '2027-12-31',
        usageLimit: 500,
        timesUsed: 42,
        active: true,
      },
      {
        id: 'coup-welcome15',
        code: 'WELCOME15',
        type: 'percentage',
        value: 15,
        minPurchase: 0,
        expiryDate: '2027-12-31',
        usageLimit: 1000,
        timesUsed: 128,
        active: true,
      },
      {
        id: 'coup-gaming20',
        code: 'GAMER20',
        type: 'percentage',
        value: 20,
        minPurchase: 25,
        expiryDate: '2027-12-31',
        usageLimit: 200,
        timesUsed: 19,
        active: true,
        categoryId: 'cat-gaming',
      },
      {
        id: 'coup-fixed10',
        code: 'DISCORD10',
        type: 'fixed',
        value: 10,
        minPurchase: 30,
        expiryDate: '2027-12-31',
        usageLimit: 100,
        timesUsed: 31,
        active: true,
        categoryId: 'cat-discord',
      },
    ],
    users: [
      {
        id: 'usr-owner',
        email: 'owner@xcmnetwork.com',
        passwordHash: hashPassword('xcm_owner_2026'),
        name: 'XCM System Owner',
        role: 'Owner',
        status: 'active',
        phone: '+1 800-926-6387',
        discordTag: 'XCM_Executive#0001',
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'usr-finance',
        email: 'finance@xcmnetwork.com',
        passwordHash: hashPassword('finance_xcm_2026'),
        name: 'Sarah Chen (Finance Lead)',
        role: 'Finance Manager',
        status: 'active',
        phone: '+1 800-926-6388',
        discordTag: 'Sarah_Finance#1002',
        createdAt: '2026-09-15T00:00:00Z',
      },
      {
        id: 'usr-order-mgr',
        email: 'orders@xcmnetwork.com',
        passwordHash: hashPassword('orders_xcm_2026'),
        name: 'Marcus Vance (Order Dispatch)',
        role: 'Order Manager',
        status: 'active',
        phone: '+1 800-926-6389',
        discordTag: 'Marcus_Orders#2004',
        createdAt: '2026-09-20T00:00:00Z',
      },
      {
        id: 'usr-demo-customer',
        email: 'alex.buyer@gmail.com',
        passwordHash: hashPassword('password123'),
        name: 'Alex Mercer',
        role: 'Customer',
        status: 'active',
        phone: '+1 555-019-2834',
        discordTag: 'AlexM_Gaming#7721',
        createdAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 'usr-demo-seller',
        email: 'vortex@creatives.io',
        passwordHash: hashPassword('password123'),
        name: 'Vortex Design Studio',
        role: 'Seller',
        status: 'active',
        phone: '+1 555-018-9922',
        discordTag: 'Vortex_Dev#9910',
        createdAt: '2026-10-05T00:00:00Z',
      },
    ],
    sellerProfiles: [
      {
        userId: 'usr-demo-seller',
        storeName: 'VortexDesign',
        bio: 'Specialized digital agency crafting custom animated banners, bots, and graphics for gaming communities and Discord networks.',
        status: 'approved',
        commissionRate: 10,
        balance: 180.00,
        pendingBalance: 36.00,
        totalWithdrawn: 420.00,
        rating: 4.9,
        createdAt: '2026-10-05T00:00:00Z',
      },
    ],
    withdrawals: [
      {
        id: 'wth-001',
        sellerId: 'usr-demo-seller',
        sellerName: 'VortexDesign',
        amount: 250.00,
        bankDetails: 'Bank of America, Checking: ***4419',
        status: 'approved',
        requestedAt: '2026-10-25T11:00:00Z',
        processedAt: '2026-10-26T09:30:00Z',
        processedBy: 'finance@xcmnetwork.com',
        notes: 'Monthly payout approved via direct wire.',
      },
    ],
    orders: [
      {
        id: 'ord-101',
        orderCode: '48291047',
        customerId: 'usr-demo-customer',
        customerName: 'Alex Mercer',
        customerEmail: 'alex.buyer@gmail.com',
        items: [
          {
            productId: 'prod-discord-nitro-year',
            productName: 'Discord Nitro 1-Year Subscription (Official Gift Activation)',
            productImage: '/src/assets/images/product_discord_nitro_1794043366446.jpg',
            productType: 'digital_key',
            quantity: 1,
            unitPrice: 64.99,
            totalPrice: 64.99,
            warranty: '12-Month Activation & Stability Guarantee',
          },
        ],
        originalPrice: 64.99,
        discountAmount: 16.25,
        finalPrice: 48.74,
        couponCode: 'XCM25',
        status: 'Completed',
        statusHistory: [
          { status: 'Pending Payment', timestamp: '2026-10-28T14:10:00Z', actor: 'Alex Mercer', actorRole: 'Customer' },
          { status: 'Slip Uploaded', timestamp: '2026-10-28T14:22:00Z', actor: 'Alex Mercer', actorRole: 'Customer' },
          { status: 'Payment Verified', timestamp: '2026-10-28T15:00:00Z', actor: 'finance@xcmnetwork.com', actorRole: 'Finance Manager', notes: 'Wire transfer of $48.74 confirmed in account.' },
          { status: 'Discord Verification', timestamp: '2026-10-28T15:05:00Z', actor: 'System', actorRole: 'System' },
          { status: 'Processing', timestamp: '2026-10-28T15:20:00Z', actor: 'orders@xcmnetwork.com', actorRole: 'Order Manager', notes: 'Discord ticket #XCM-9941 opened and validated.' },
          { status: 'Completed', timestamp: '2026-10-28T15:35:00Z', actor: 'orders@xcmnetwork.com', actorRole: 'Order Manager', notes: 'Gift activation code successfully delivered to customer in ticket.' },
        ],
        bankSnapshot: {
          bankName: 'XCM Global Commerce Bank',
          accountHolder: 'XCM NETWORK DIGITAL SERVICES LLC',
          accountNumber: '9042-8812-7741-002',
          branch: 'International Tech Financial Center, Suite 400',
          paymentInstructions: 'Transfer exact amount with order code in reference note.',
          paymentDeadlineHours: 24,
        },
        paymentSlipUrl: '/src/assets/images/product_discord_nitro_1794043366446.jpg',
        paymentSlipUploadedAt: '2026-10-28T14:22:00Z',
        discordUsername: 'AlexM_Gaming#7721',
        discordTicketNumber: 'XCM-9941',
        discordVerifiedAt: '2026-10-28T15:20:00Z',
        discordVerifiedBy: 'orders@xcmnetwork.com',
        createdAt: '2026-10-28T14:10:00Z',
        updatedAt: '2026-10-28T15:35:00Z',
      },
      {
        id: 'ord-102',
        orderCode: '73910284',
        customerId: 'usr-demo-customer',
        customerName: 'Alex Mercer',
        customerEmail: 'alex.buyer@gmail.com',
        items: [
          {
            productId: 'prod-mc-cape',
            productName: 'Minecraft Java & Bedrock VIP Account (Migrated + Dragon Cape)',
            productImage: '/src/assets/images/product_minecraft_account_1794043365430.jpg',
            productType: 'account',
            quantity: 1,
            unitPrice: 34.99,
            totalPrice: 34.99,
            warranty: '30-Day Full Replacement Warranty',
          },
        ],
        originalPrice: 34.99,
        discountAmount: 0,
        finalPrice: 34.99,
        status: 'Slip Uploaded',
        statusHistory: [
          { status: 'Pending Payment', timestamp: '2026-11-06T19:00:00Z', actor: 'Alex Mercer', actorRole: 'Customer' },
          { status: 'Slip Uploaded', timestamp: '2026-11-06T19:15:00Z', actor: 'Alex Mercer', actorRole: 'Customer', notes: 'Payment receipt uploaded awaiting staff review.' },
        ],
        bankSnapshot: {
          bankName: 'XCM Global Commerce Bank',
          accountHolder: 'XCM NETWORK DIGITAL SERVICES LLC',
          accountNumber: '9042-8812-7741-002',
          branch: 'International Tech Financial Center, Suite 400',
          paymentInstructions: 'Transfer exact amount with order code in reference note.',
          paymentDeadlineHours: 24,
        },
        paymentSlipUrl: '/src/assets/images/hero_marketplace_gaming_1794043365368.jpg',
        paymentSlipUploadedAt: '2026-11-06T19:15:00Z',
        createdAt: '2026-11-06T19:00:00Z',
        updatedAt: '2026-11-06T19:15:00Z',
      },
    ],
    reviews: [
      {
        id: 'rev-01',
        productId: 'prod-discord-nitro-year',
        productName: 'Discord Nitro 1-Year Subscription (Official Gift Activation)',
        orderId: 'ord-101',
        userId: 'usr-demo-customer',
        userName: 'Alex Mercer',
        rating: 5,
        comment: 'Unbelievably smooth experience! Followed the bank wire instructions, uploaded my receipt, and within 20 minutes the staff opened my Discord ticket and provided the legit 1-year link. Will definitely be purchasing my server boosts here next month.',
        status: 'approved',
        isPinned: true,
        adminReply: {
          comment: 'Thank you for choosing XCM Store, Alex! Enjoy the 4K streaming and boosts!',
          repliedBy: 'XCM Network Support',
          repliedAt: '2026-10-28T16:00:00Z',
        },
        createdAt: '2026-10-28T15:45:00Z',
      },
      {
        id: 'rev-02',
        productId: 'prod-mc-cape',
        productName: 'Minecraft Java & Bedrock VIP Account',
        orderId: 'ord-legacy-01',
        userId: 'usr-verified-buyer-2',
        userName: 'Jordan K.',
        rating: 5,
        comment: 'Received full email transfer credentials. Both capes were present and account clean on Hypixel. A+ seller and secure manual verification.',
        status: 'approved',
        isPinned: false,
        createdAt: '2026-10-20T12:00:00Z',
      },
      {
        id: 'rev-03',
        productId: 'prod-gta5-billionaire',
        productName: 'Grand Theft Auto V Premium Billionaire Modded Account',
        orderId: 'ord-legacy-02',
        userId: 'usr-verified-buyer-3',
        userName: 'Tyler S.',
        rating: 5,
        comment: 'Exactly as described. $2.5B in bank and all research completed without any issues. Super fast support team.',
        status: 'approved',
        isPinned: false,
        createdAt: '2026-10-24T18:30:00Z',
      },
    ],
    auditLogs: [
      {
        id: 'log-001',
        timestamp: '2026-10-28T15:00:00Z',
        actorId: 'usr-finance',
        actorEmail: 'finance@xcmnetwork.com',
        actorRole: 'Finance Manager',
        action: 'APPROVE_PAYMENT',
        targetType: 'ORDER',
        targetId: 'ord-101',
        details: 'Approved manual bank transfer receipt for order 48291047 ($48.74).',
      },
      {
        id: 'log-002',
        timestamp: '2026-10-28T15:35:00Z',
        actorId: 'usr-order-mgr',
        actorEmail: 'orders@xcmnetwork.com',
        actorRole: 'Order Manager',
        action: 'COMPLETE_ORDER',
        targetType: 'ORDER',
        targetId: 'ord-101',
        details: 'Completed order after Discord ticket verification (#XCM-9941).',
      },
    ],
    notifications: [
      {
        id: 'notif-01',
        userId: 'usr-demo-customer',
        title: 'Order #48291047 Completed',
        message: 'Your Discord Nitro subscription has been delivered and verified via Discord ticket #XCM-9941. You can now leave a review!',
        type: 'order',
        link: '/orders/48291047',
        read: false,
        createdAt: '2026-10-28T15:36:00Z',
      },
      {
        id: 'notif-02',
        userId: 'ADMIN',
        title: 'New Payment Slip Uploaded',
        message: 'Customer Alex Mercer uploaded a payment slip for Order #73910284 ($34.99). Please verify in Admin Orders.',
        type: 'payment',
        link: '/admin/orders',
        read: false,
        createdAt: '2026-11-06T19:15:00Z',
      },
    ],
  };
}

export function getDb(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    }
  } catch (err) {
    console.error('Failed to read db file, initializing default:', err);
  }

  const initial = getInitialDatabase();
  saveDb(initial);
  return initial;
}

export function saveDb(data: DatabaseSchema): void {
  dbCache = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}
