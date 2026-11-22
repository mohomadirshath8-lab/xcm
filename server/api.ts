import { Router } from 'express';
import crypto from 'node:crypto';
import {
  getDb,
  saveDb,
  generate8DigitOrderCode,
  type Order,
  type Product,
  type Category,
  type Coupon,
  type Review,
  type User,
  type OrderStatus,
  type AuditLog,
  type Notification,
  type WithdrawalRequest,
} from './db.js';
import {
  hashPassword,
  generateToken,
  type AuthenticatedRequest,
  requireAuth,
  requirePermission,
  requireAdmin,
  hasPermission,
} from './auth.js';
import { adminAuth } from '../src/lib/firebase-admin.js';

const router = Router();

function logAudit(
  actor: User,
  action: string,
  targetType: string,
  targetId: string,
  details: string
) {
  const db = getDb();
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action,
    targetType,
    targetId,
    details,
  };
  db.auditLogs.unshift(log);
}

function notify(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  link?: string
) {
  const db = getDb();
  const notif: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
}

// ================= AUTHENTICATION ROUTES =================

router.post('/auth/register', (req, res) => {
  const { email, password, name, phone, discordTag } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  const db = getDb();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    name: name.trim(),
    role: 'Customer',
    status: 'active',
    phone: phone || '',
    discordTag: discordTag || '',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  notify(
    'ADMIN',
    'New Customer Registered',
    `Customer ${newUser.name} (${newUser.email}) just created an account.`,
    'system'
  );

  const token = generateToken(newUser);
  res.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      discordTag: newUser.discordTag,
    },
  });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = getDb();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.passwordHash === hashPassword(password)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email credentials or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      discordTag: user.discordTag,
      customPermissions: user.customPermissions,
    },
  });
});

// Google Sign-In with Firebase verification
router.post('/auth/google', async (req, res) => {
  let { email, name, googleId, idToken } = req.body;

  if (idToken) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      if (decoded.email) email = decoded.email;
      if (decoded.name) name = decoded.name;
      googleId = decoded.uid;
    } catch (err) {
      console.warn('Firebase token verification note:', err);
    }
  }

  if (!email || !name) {
    return res.status(400).json({ error: 'Google profile details missing.' });
  }

  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  const isBootstrapOwner = normalizedEmail === 'dilnathsathnidu750@gmail.com' || normalizedEmail === 'owner@xcmnetwork.com';

  if (!user) {
    user = {
      id: `usr-g-${Date.now()}`,
      email: normalizedEmail,
      passwordHash: hashPassword(googleId || 'google_sso_random_' + Date.now()),
      name: name.trim(),
      role: isBootstrapOwner ? 'Owner' : 'Customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDb(db);
  } else if (isBootstrapOwner && user.role !== 'Owner') {
    user.role = 'Owner';
    saveDb(db);
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      discordTag: user.discordTag,
    },
  });
});

router.get('/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone,
      discordTag: req.user.discordTag,
      customPermissions: req.user.customPermissions,
    },
  });
});

router.put('/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, phone, discordTag, newPassword } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (discordTag !== undefined) user.discordTag = discordTag;
  if (newPassword && newPassword.length >= 6) {
    user.passwordHash = hashPassword(newPassword);
  }

  saveDb(db);
  res.json({ success: true, user });
});

// ================= CATEGORIES ROUTES =================

router.get('/categories', (_req, res) => {
  const db = getDb();
  res.json(db.categories);
});

router.post('/categories', requireAuth, requirePermission('Manage Categories'), (req: AuthenticatedRequest, res) => {
  const { name, slug, icon, description, subcategories } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'Category name and slug are required.' });
  }

  const db = getDb();
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    icon: icon || 'Folder',
    description: description || '',
    order: db.categories.length + 1,
    enabled: true,
    subcategories: subcategories || [],
  };

  db.categories.push(newCat);
  logAudit(req.user!, 'CREATE_CATEGORY', 'CATEGORY', newCat.id, `Created category ${newCat.name}`);
  saveDb(db);
  res.json(newCat);
});

router.put('/categories/:id', requireAuth, requirePermission('Manage Categories'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, slug, icon, description, enabled, order, subcategories } = req.body;

  const db = getDb();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (name !== undefined) cat.name = name;
  if (slug !== undefined) cat.slug = slug;
  if (icon !== undefined) cat.icon = icon;
  if (description !== undefined) cat.description = description;
  if (enabled !== undefined) cat.enabled = enabled;
  if (order !== undefined) cat.order = order;
  if (subcategories !== undefined) cat.subcategories = subcategories;

  logAudit(req.user!, 'UPDATE_CATEGORY', 'CATEGORY', cat.id, `Updated category ${cat.name}`);
  saveDb(db);
  res.json(cat);
});

router.delete('/categories/:id', requireAuth, requirePermission('Manage Categories'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const removed = db.categories.splice(idx, 1)[0];
  logAudit(req.user!, 'DELETE_CATEGORY', 'CATEGORY', id, `Deleted category ${removed.name}`);
  saveDb(db);
  res.json({ success: true, message: 'Category removed' });
});

// ================= PRODUCTS ROUTES =================

router.get('/products', (req, res) => {
  const db = getDb();
  let result = db.products.filter((p) => p.status === 'active');

  const { categoryId, subcategoryId, search, minPrice, maxPrice, sortBy, featured, isMarketplace } = req.query;

  if (categoryId) {
    result = result.filter((p) => p.categoryId === categoryId);
  }
  if (subcategoryId) {
    result = result.filter((p) => p.subcategoryId === subcategoryId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q)
    );
  }
  if (minPrice) {
    result = result.filter((p) => (p.discountPrice ?? p.originalPrice) >= Number(minPrice));
  }
  if (maxPrice) {
    result = result.filter((p) => (p.discountPrice ?? p.originalPrice) <= Number(maxPrice));
  }
  if (featured === 'true') {
    result = result.filter((p) => p.featured);
  }
  if (isMarketplace === 'true') {
    result = result.filter((p) => p.isMarketplace);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    result.sort((a, b) => (a.discountPrice ?? a.originalPrice) - (b.discountPrice ?? b.originalPrice));
  } else if (sortBy === 'price_desc') {
    result.sort((a, b) => (b.discountPrice ?? b.originalPrice) - (a.discountPrice ?? a.originalPrice));
  } else if (sortBy === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'popular') {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    // Default newest
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result);
});

router.get('/products/admin-all', requireAuth, requirePermission('Manage Products'), (_req, res) => {
  const db = getDb();
  res.json(db.products);
});

router.get('/products/:id', (req, res) => {
  const db = getDb();
  const product = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

router.post('/products', requireAuth, (req: AuthenticatedRequest, res) => {
  const isStaff = hasPermission(req.user!, 'Manage Products');
  const isSeller = req.user!.role === 'Seller';

  if (!isStaff && !isSeller) {
    return res.status(403).json({ error: 'Permission denied to list products' });
  }

  const {
    name,
    categoryId,
    subcategoryId,
    description,
    originalPrice,
    discountPrice,
    warranty,
    stockQuantity,
    images,
    productType,
    featured,
    specifications,
    servicePackages,
    deliveryEstimate,
    customerRequirements,
    revisionPolicy,
  } = req.body;

  if (!name || !categoryId || !originalPrice) {
    return res.status(400).json({ error: 'Name, Category, and Original Price are required.' });
  }

  const db = getDb();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    categoryId,
    subcategoryId: subcategoryId || '',
    description: description || '',
    originalPrice: Number(originalPrice),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    warranty: warranty || 'Standard Product Warranty',
    stockQuantity: Number(stockQuantity) || 1,
    images: images && images.length ? images : ['/src/assets/images/hero_marketplace_gaming_1794043365368.jpg'],
    productType: productType || 'digital_key',
    featured: isStaff ? Boolean(featured) : false,
    status: 'active',
    rating: 5.0,
    reviewCount: 0,
    sellerId: isSeller ? req.user!.id : 'xcm-official',
    sellerName: isSeller ? req.user!.name : 'XCM Network Official',
    isMarketplace: isSeller,
    specifications: specifications || {},
    servicePackages: servicePackages || [],
    deliveryEstimate,
    customerRequirements,
    revisionPolicy,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  logAudit(req.user!, 'CREATE_PRODUCT', 'PRODUCT', newProduct.id, `Created product ${newProduct.name}`);
  saveDb(db);
  res.json(newProduct);
});

router.put('/products/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const isStaff = hasPermission(req.user!, 'Manage Products');
  const isOwnerSeller = req.user!.role === 'Seller' && product.sellerId === req.user!.id;

  if (!isStaff && !isOwnerSeller) {
    return res.status(403).json({ error: 'Unauthorized to modify this product' });
  }

  Object.assign(product, req.body);
  logAudit(req.user!, 'UPDATE_PRODUCT', 'PRODUCT', product.id, `Updated product ${product.name}`);
  saveDb(db);
  res.json(product);
});

router.delete('/products/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const isStaff = hasPermission(req.user!, 'Manage Products');
  const isOwnerSeller = req.user!.role === 'Seller' && db.products[idx].sellerId === req.user!.id;

  if (!isStaff && !isOwnerSeller) {
    return res.status(403).json({ error: 'Unauthorized to delete this product' });
  }

  const removed = db.products.splice(idx, 1)[0];
  logAudit(req.user!, 'DELETE_PRODUCT', 'PRODUCT', id, `Deleted product ${removed.name}`);
  saveDb(db);
  res.json({ success: true, message: 'Product deleted' });
});

// ================= COUPONS ROUTES =================

router.post('/coupons/validate', (req, res) => {
  const { code, cartTotal, categoryIds } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  const db = getDb();
  const coupon = db.coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
  );

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or inactive coupon code.' });
  }

  // Check expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This coupon has expired.' });
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
    return res.status(400).json({ error: 'This coupon has reached its maximum usage limit.' });
  }

  // Check min purchase
  const total = Number(cartTotal) || 0;
  if (coupon.minPurchase && total < coupon.minPurchase) {
    return res.status(400).json({
      error: `Minimum order amount for this coupon is $${coupon.minPurchase.toFixed(2)}.`,
    });
  }

  // Check category restriction if applicable
  if (coupon.categoryId && Array.isArray(categoryIds) && categoryIds.length > 0) {
    if (!categoryIds.includes(coupon.categoryId)) {
      return res.status(400).json({
        error: 'This coupon is not applicable to the items in your cart.',
      });
    }
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (total * coupon.value) / 100;
  } else {
    discountAmount = Math.min(coupon.value, total);
  }

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount: Number(discountAmount.toFixed(2)),
  });
});

router.get('/coupons', requireAuth, requirePermission('Manage Coupons'), (_req, res) => {
  const db = getDb();
  res.json(db.coupons);
});

router.post('/coupons', requireAuth, requirePermission('Manage Coupons'), (req: AuthenticatedRequest, res) => {
  const { code, type, value, minPurchase, expiryDate, usageLimit, categoryId, productId } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'Code, type, and value are required.' });
  }

  const db = getDb();
  if (db.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase())) {
    return res.status(400).json({ error: 'Coupon code already exists.' });
  }

  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    minPurchase: Number(minPurchase) || 0,
    expiryDate: expiryDate || '2027-12-31',
    usageLimit: Number(usageLimit) || 500,
    timesUsed: 0,
    active: true,
    categoryId: categoryId || undefined,
    productId: productId || undefined,
  };

  db.coupons.push(newCoupon);
  logAudit(req.user!, 'CREATE_COUPON', 'COUPON', newCoupon.id, `Created coupon ${newCoupon.code}`);
  saveDb(db);
  res.json(newCoupon);
});

router.put('/coupons/:id', requireAuth, requirePermission('Manage Coupons'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const coupon = db.coupons.find((c) => c.id === id);
  if (!coupon) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  Object.assign(coupon, req.body);
  logAudit(req.user!, 'UPDATE_COUPON', 'COUPON', coupon.id, `Updated coupon ${coupon.code}`);
  saveDb(db);
  res.json(coupon);
});

router.delete('/coupons/:id', requireAuth, requirePermission('Manage Coupons'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.coupons.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  const removed = db.coupons.splice(idx, 1)[0];
  logAudit(req.user!, 'DELETE_COUPON', 'COUPON', id, `Deleted coupon ${removed.code}`);
  saveDb(db);
  res.json({ success: true, message: 'Coupon deleted' });
});

// ================= ORDERS ROUTES =================

router.post('/orders', (req: AuthenticatedRequest, res) => {
  const { items, couponCode, customerName, customerEmail, discordUsername } = req.body;
  if (!items || !items.length || !customerName || !customerEmail) {
    return res.status(400).json({ error: 'Cart items, customer name, and customer email are required.' });
  }

  const db = getDb();

  // Validate items & calculate original price
  let originalPrice = 0;
  const orderItems = [];
  const existingCodes = new Set(db.orders.map((o) => o.orderCode));

  for (const item of items) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product ID ${item.productId} not found.` });
    }
    const unitPrice = prod.discountPrice ?? prod.originalPrice;
    const qty = Number(item.quantity) || 1;
    originalPrice += unitPrice * qty;

    orderItems.push({
      productId: prod.id,
      productName: prod.name,
      productImage: prod.images[0] || '/src/assets/images/hero_marketplace_gaming_1794043365368.jpg',
      productType: prod.productType,
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
      warranty: prod.warranty,
      deliveryDetails: item.deliveryDetails,
    });
  }

  // Calculate discount if coupon applied
  let discountAmount = 0;
  let appliedCoupon: Coupon | undefined;
  if (couponCode) {
    appliedCoupon = db.coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active
    );
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discountAmount = (originalPrice * appliedCoupon.value) / 100;
      } else {
        discountAmount = Math.min(appliedCoupon.value, originalPrice);
      }
      appliedCoupon.timesUsed += 1;
    }
  }

  const finalPrice = Math.max(0, Number((originalPrice - discountAmount).toFixed(2)));

  // Generate unique 8-digit order code
  const orderCode = generate8DigitOrderCode(existingCodes);

  // Snapshot current bank details
  const bankSnapshot = {
    bankName: db.bankDetails.bankName,
    accountHolder: db.bankDetails.accountHolder,
    accountNumber: db.bankDetails.accountNumber,
    branch: db.bankDetails.branch,
    paymentInstructions: db.bankDetails.paymentInstructions,
    paymentDeadlineHours: db.bankDetails.paymentDeadlineHours,
  };

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderCode,
    customerId: req.user ? req.user.id : `guest-${Date.now()}`,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    items: orderItems,
    originalPrice: Number(originalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    status: 'Pending Payment',
    statusHistory: [
      {
        status: 'Pending Payment',
        timestamp: new Date().toISOString(),
        actor: customerName.trim(),
        actorRole: req.user?.role || 'Customer',
        notes: 'Order initiated with manual bank transfer payment instructions.',
      },
    ],
    bankSnapshot,
    discordUsername: discordUsername || req.user?.discordTag || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);

  // Notify admin
  notify(
    'ADMIN',
    `New Order Created (#${orderCode})`,
    `${newOrder.customerName} placed an order for $${finalPrice.toFixed(2)}. Verification code: ${orderCode}`,
    'order',
    `/admin/orders`
  );

  saveDb(db);
  res.json(newOrder);
});

// Track order by 8-digit code or order ID
router.get('/orders/track/:query', (req, res) => {
  const { query } = req.params;
  const db = getDb();
  const order = db.orders.find(
    (o) => o.orderCode === query.trim() || o.id === query.trim()
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found with provided reference code.' });
  }

  res.json(order);
});

// My orders (Customer)
router.get('/orders/my-orders', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const userEmail = req.user!.email.toLowerCase();
  const userId = req.user!.id;

  const orders = db.orders.filter(
    (o) => o.customerId === userId || o.customerEmail.toLowerCase() === userEmail
  );
  res.json(orders);
});

// Order detail
router.get('/orders/:id', (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const order = db.orders.find((o) => o.id === req.params.id || o.orderCode === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Payment slip upload
router.post('/orders/:id/upload-slip', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { slipDataUrl, notes } = req.body;

  if (!slipDataUrl) {
    return res.status(400).json({ error: 'Payment slip file is required.' });
  }

  const db = getDb();
  const order = db.orders.find((o) => o.id === id || o.orderCode === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentSlipUrl = slipDataUrl;
  order.paymentSlipUploadedAt = new Date().toISOString();
  order.status = 'Slip Uploaded';
  order.updatedAt = new Date().toISOString();

  order.statusHistory.push({
    status: 'Slip Uploaded',
    timestamp: new Date().toISOString(),
    actor: req.user?.name || order.customerName,
    actorRole: req.user?.role || 'Customer',
    notes: notes || 'Customer submitted bank transfer receipt for verification.',
  });

  notify(
    'ADMIN',
    `Receipt Uploaded for Order #${order.orderCode}`,
    `Customer ${order.customerName} uploaded a payment slip for $${order.finalPrice.toFixed(2)}. Verification required.`,
    'payment',
    `/admin/orders`
  );

  saveDb(db);
  res.json({ success: true, order });
});

// Admin status change
router.post('/orders/:id/status', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, notes } = req.body as { status: OrderStatus; notes?: string };

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const db = getDb();
  const order = db.orders.find((o) => o.id === id || o.orderCode === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    actor: req.user!.name,
    actorRole: req.user!.role,
    notes: notes || `Order status updated to ${status}`,
  });

  logAudit(
    req.user!,
    'UPDATE_ORDER_STATUS',
    'ORDER',
    order.id,
    `Updated status of order #${order.orderCode} to ${status}. Notes: ${notes || 'none'}`
  );

  // Notify customer
  notify(
    order.customerId,
    `Order #${order.orderCode} Update`,
    `Your order status has changed to: ${status}. ${notes ? `Note: ${notes}` : ''}`,
    'order',
    `/orders/${order.orderCode}`
  );

  // Release marketplace commission if completed
  if (status === 'Completed' && order.items) {
    for (const itm of order.items) {
      const prod = db.products.find((p) => p.id === itm.productId);
      if (prod && prod.isMarketplace && prod.sellerId) {
        const seller = db.sellerProfiles.find((s) => s.userId === prod.sellerId);
        if (seller) {
          const commRate = seller.commissionRate || 10;
          const commission = (itm.totalPrice * commRate) / 100;
          const netEarnings = itm.totalPrice - commission;
          seller.balance = Number((seller.balance + netEarnings).toFixed(2));
          notify(
            seller.userId,
            'Marketplace Sale Completed',
            `Order #${order.orderCode} for "${itm.productName}" completed. $${netEarnings.toFixed(2)} added to your balance.`,
            'seller'
          );
        }
      }
    }
  }

  saveDb(db);
  res.json({ success: true, order });
});

// Discord ticket verification
router.post('/orders/:id/discord-verify', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { discordTicketNumber, discordUsername, notes } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === id || o.orderCode === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.discordTicketNumber = discordTicketNumber || order.discordTicketNumber;
  if (discordUsername) order.discordUsername = discordUsername;
  order.discordVerifiedAt = new Date().toISOString();
  order.discordVerifiedBy = req.user!.name;
  order.status = 'Processing';
  order.updatedAt = new Date().toISOString();

  order.statusHistory.push({
    status: 'Processing',
    timestamp: new Date().toISOString(),
    actor: req.user!.name,
    actorRole: req.user!.role,
    notes: `Discord ticket verified (#${discordTicketNumber || 'N/A'}). ${notes || 'Identity confirmed.'}`,
  });

  logAudit(
    req.user!,
    'DISCORD_VERIFY_ORDER',
    'ORDER',
    order.id,
    `Discord verified order #${order.orderCode} via ticket ${discordTicketNumber}`
  );

  notify(
    order.customerId,
    `Discord Ticket Verified (#${order.orderCode})`,
    `Your order has been verified in our official Discord server and is now processing for delivery!`,
    'order',
    `/orders/${order.orderCode}`
  );

  saveDb(db);
  res.json({ success: true, order });
});

// Admin internal notes
router.post('/orders/:id/notes', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { internalNotes } = req.body;

  const db = getDb();
  const order = db.orders.find((o) => o.id === id || o.orderCode === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.internalAdminNotes = internalNotes;
  order.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, order });
});

// ================= REVIEWS ROUTES =================

router.get('/reviews/product/:productId', (req, res) => {
  const db = getDb();
  const reviews = db.reviews.filter(
    (r) => r.productId === req.params.productId && r.status === 'approved'
  );
  res.json(reviews);
});

router.post('/reviews', requireAuth, (req: AuthenticatedRequest, res) => {
  const { productId, orderId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Product, rating, and comment are required.' });
  }

  const db = getDb();
  // Verify purchase
  const hasPurchased = db.orders.some(
    (o) =>
      o.customerId === req.user!.id &&
      o.status === 'Completed' &&
      o.items.some((i) => i.productId === productId)
  );

  if (!hasPurchased) {
    return res.status(403).json({
      error: 'Only verified purchasers with completed orders can submit a review.',
    });
  }

  const prod = db.products.find((p) => p.id === productId);

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    productName: prod ? prod.name : 'Digital Product',
    orderId: orderId || '',
    userId: req.user!.id,
    userName: req.user!.name,
    rating: Number(rating),
    comment: comment.trim(),
    status: 'approved', // Auto-approved or pending based on policy
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Update product average rating
  if (prod) {
    const allProdReviews = db.reviews.filter(
      (r) => r.productId === productId && r.status === 'approved'
    );
    const avg =
      allProdReviews.reduce((acc, r) => acc + r.rating, 0) / (allProdReviews.length || 1);
    prod.rating = Number(avg.toFixed(1));
    prod.reviewCount = allProdReviews.length;
  }

  saveDb(db);
  res.json(newReview);
});

router.get('/reviews/admin', requireAuth, requirePermission('Manage Reviews'), (_req, res) => {
  const db = getDb();
  res.json(db.reviews);
});

router.post('/reviews/:id/status', requireAuth, requirePermission('Manage Reviews'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, isPinned } = req.body;

  const db = getDb();
  const review = db.reviews.find((r) => r.id === id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (status) review.status = status;
  if (isPinned !== undefined) review.isPinned = isPinned;

  saveDb(db);
  res.json(review);
});

router.post('/reviews/:id/reply', requireAuth, requirePermission('Manage Reviews'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { replyText } = req.body;

  const db = getDb();
  const review = db.reviews.find((r) => r.id === id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.adminReply = {
    comment: replyText,
    repliedBy: req.user!.name,
    repliedAt: new Date().toISOString(),
  };

  saveDb(db);
  res.json(review);
});

// ================= BANK DETAILS MANAGEMENT =================

router.get('/bank-details', (_req, res) => {
  const db = getDb();
  res.json(db.bankDetails);
});

router.put('/bank-details', requireAuth, requirePermission('Change Website Settings'), (req: AuthenticatedRequest, res) => {
  const { bankName, accountHolder, accountNumber, branch, paymentInstructions, paymentDeadlineHours } = req.body;
  const db = getDb();

  if (bankName) db.bankDetails.bankName = bankName;
  if (accountHolder) db.bankDetails.accountHolder = accountHolder;
  if (accountNumber) db.bankDetails.accountNumber = accountNumber;
  if (branch) db.bankDetails.branch = branch;
  if (paymentInstructions) db.bankDetails.paymentInstructions = paymentInstructions;
  if (paymentDeadlineHours) db.bankDetails.paymentDeadlineHours = Number(paymentDeadlineHours);

  logAudit(req.user!, 'UPDATE_BANK_DETAILS', 'SETTINGS', 'bankDetails', 'Updated store bank details');
  saveDb(db);
  res.json(db.bankDetails);
});

// ================= SELLER DASHBOARD & MARKETPLACE =================

router.post('/seller/apply', requireAuth, (req: AuthenticatedRequest, res) => {
  const { storeName, bio } = req.body;
  if (!storeName) {
    return res.status(400).json({ error: 'Store name is required.' });
  }

  const db = getDb();
  let profile = db.sellerProfiles.find((s) => s.userId === req.user!.id);
  if (profile) {
    return res.status(400).json({ error: 'Seller profile already exists for this account.' });
  }

  profile = {
    userId: req.user!.id,
    storeName: storeName.trim(),
    bio: bio || '',
    status: 'pending',
    commissionRate: db.siteSettings.marketplaceCommissionPercent || 10,
    balance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  };

  db.sellerProfiles.push(profile);
  notify('ADMIN', 'New Seller Application', `Store "${profile.storeName}" applied for marketplace verification.`, 'seller');
  saveDb(db);
  res.json(profile);
});

router.get('/seller/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const profile = db.sellerProfiles.find((s) => s.userId === req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'No seller profile found.' });
  }
  res.json(profile);
});

router.get('/seller/products', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const prods = db.products.filter((p) => p.sellerId === req.user!.id);
  res.json(prods);
});

router.post('/seller/withdraw', requireAuth, (req: AuthenticatedRequest, res) => {
  const { amount, bankDetails } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid withdrawal amount is required.' });
  }

  const db = getDb();
  const profile = db.sellerProfiles.find((s) => s.userId === req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  if (profile.balance < numAmount) {
    return res.status(400).json({ error: `Insufficient balance. Available: $${profile.balance.toFixed(2)}` });
  }

  profile.balance = Number((profile.balance - numAmount).toFixed(2));

  const withdrawal: WithdrawalRequest = {
    id: `wth-${Date.now()}`,
    sellerId: profile.userId,
    sellerName: profile.storeName,
    amount: numAmount,
    bankDetails: bankDetails || 'Registered Wire Account',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  db.withdrawals.unshift(withdrawal);
  notify('ADMIN', 'Withdrawal Requested', `${profile.storeName} requested payout of $${numAmount.toFixed(2)}.`, 'seller');
  saveDb(db);
  res.json(withdrawal);
});

// ================= ADMIN PANEL ROUTES =================

router.get('/admin/analytics', requireAuth, requireAdmin, (_req, res) => {
  const db = getDb();
  const totalRevenue = db.orders
    .filter((o) => o.status === 'Completed' || o.status === 'Payment Verified' || o.status === 'Processing')
    .reduce((sum, o) => sum + o.finalPrice, 0);

  const pendingOrders = db.orders.filter(
    (o) => o.status === 'Pending Payment' || o.status === 'Slip Uploaded' || o.status === 'Under Review'
  ).length;

  const completedOrders = db.orders.filter((o) => o.status === 'Completed').length;
  const pendingSlips = db.orders.filter((o) => o.status === 'Slip Uploaded' || o.status === 'Under Review').length;

  res.json({
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders: db.orders.length,
    pendingOrders,
    completedOrders,
    totalCustomers: db.users.filter((u) => u.role === 'Customer').length,
    totalProducts: db.products.length,
    activeSellers: db.sellerProfiles.filter((s) => s.status === 'approved').length,
    totalReviews: db.reviews.length,
    pendingSlips,
    recentOrders: db.orders.slice(0, 10),
    recentCustomers: db.users.slice(-8).reverse(),
  });
});

router.get('/admin/orders', requireAuth, requireAdmin, (_req, res) => {
  const db = getDb();
  res.json(db.orders);
});

router.get('/admin/staff', requireAuth, requirePermission('Manage Staff'), (_req, res) => {
  const db = getDb();
  const staff = db.users.filter((u) => u.role !== 'Customer');
  res.json(staff);
});

router.post('/admin/staff', requireAuth, requirePermission('Manage Staff'), (req: AuthenticatedRequest, res) => {
  const { name, email, password, role, customPermissions } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  const db = getDb();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const newStaff: User = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    role,
    customPermissions: customPermissions || [],
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newStaff);
  logAudit(req.user!, 'CREATE_STAFF', 'STAFF', newStaff.id, `Created staff member ${newStaff.name} with role ${role}`);
  saveDb(db);
  res.json(newStaff);
});

router.put('/admin/staff/:id', requireAuth, requirePermission('Manage Staff'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { role, customPermissions, status } = req.body;
  const db = getDb();
  const staff = db.users.find((u) => u.id === id);
  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found.' });
  }

  if (role) staff.role = role;
  if (customPermissions !== undefined) staff.customPermissions = customPermissions;
  if (status) staff.status = status;

  logAudit(req.user!, 'UPDATE_STAFF', 'STAFF', staff.id, `Updated staff ${staff.name} role/permissions`);
  saveDb(db);
  res.json(staff);
});

router.get('/admin/audit-logs', requireAuth, requireAdmin, (_req, res) => {
  const db = getDb();
  res.json(db.auditLogs);
});

router.get('/admin/settings', (_req, res) => {
  const db = getDb();
  res.json(db.siteSettings);
});

router.put('/admin/settings', requireAuth, requirePermission('Change Website Settings'), (req: AuthenticatedRequest, res) => {
  const db = getDb();
  Object.assign(db.siteSettings, req.body);
  logAudit(req.user!, 'UPDATE_SETTINGS', 'SITE_SETTINGS', 'settings', 'Updated global site settings');
  saveDb(db);
  res.json(db.siteSettings);
});

router.get('/admin/withdrawals', requireAuth, requirePermission('Approve Payments'), (_req, res) => {
  const db = getDb();
  res.json(db.withdrawals);
});

router.post('/admin/withdrawals/:id/process', requireAuth, requirePermission('Approve Payments'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { action, notes } = req.body; // 'approve' or 'reject'

  const db = getDb();
  const item = db.withdrawals.find((w) => w.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Withdrawal not found.' });
  }

  item.status = action === 'approve' ? 'approved' : 'rejected';
  item.processedAt = new Date().toISOString();
  item.processedBy = req.user!.email;
  item.notes = notes;

  if (action === 'approve') {
    const profile = db.sellerProfiles.find((s) => s.userId === item.sellerId);
    if (profile) {
      profile.totalWithdrawn += item.amount;
    }
  } else {
    // refund back to balance
    const profile = db.sellerProfiles.find((s) => s.userId === item.sellerId);
    if (profile) {
      profile.balance = Number((profile.balance + item.amount).toFixed(2));
    }
  }

  logAudit(req.user!, 'PROCESS_WITHDRAWAL', 'WITHDRAWAL', item.id, `${action} withdrawal for ${item.sellerName}`);
  saveDb(db);
  res.json(item);
});

// ================= NOTIFICATIONS ROUTES =================

router.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const isAdmin = ['Owner', 'Super Admin', 'Admin', 'Finance Manager', 'Order Manager'].includes(req.user!.role);
  const userNotifs = db.notifications.filter(
    (n) => n.userId === req.user!.id || (isAdmin && n.userId === 'ADMIN')
  );
  res.json(userNotifs.slice(0, 30));
});

router.post('/notifications/:id/read', requireAuth, (req, res) => {
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

export default router;
