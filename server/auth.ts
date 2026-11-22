import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { getDb, type User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'xcm_secret_jwt_key_store_network_2026';

export const ALL_PERMISSIONS = [
  'View Orders',
  'Edit Orders',
  'Approve Payments',
  'Reject Payments',
  'Issue Refunds',
  'Manage Products',
  'Manage Categories',
  'Manage Coupons',
  'Manage Customers',
  'Manage Sellers',
  'Manage Reviews',
  'Manage Staff',
  'Change Website Settings',
  'Enable Maintenance Mode',
  'View Analytics',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Owner': [...ALL_PERMISSIONS],
  'Super Admin': [...ALL_PERMISSIONS],
  'Admin': [
    'View Orders',
    'Edit Orders',
    'Approve Payments',
    'Reject Payments',
    'Manage Products',
    'Manage Categories',
    'Manage Coupons',
    'Manage Customers',
    'Manage Sellers',
    'Manage Reviews',
    'View Analytics',
  ],
  'Finance Manager': [
    'View Orders',
    'Approve Payments',
    'Reject Payments',
    'Issue Refunds',
    'View Analytics',
  ],
  'Order Manager': [
    'View Orders',
    'Edit Orders',
    'Manage Reviews',
  ],
  'Product Manager': [
    'Manage Products',
    'Manage Categories',
  ],
  'Support Manager': [
    'View Orders',
    'Manage Reviews',
  ],
  'Moderator': [
    'Manage Reviews',
  ],
  'Seller': [],
  'Customer': [],
};

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_xcm_salt_2026').digest('hex');
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('base64url');
  return `${str}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
    if (expectedSig !== signature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.expiresAt < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return next();
  }

  const db = getDb();
  const user = db.users.find(u => u.id === decoded.userId);
  if (user && user.status === 'active') {
    req.user = user;
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function hasPermission(user: User, permission: Permission): boolean {
  if (user.role === 'Owner' || user.role === 'Super Admin') return true;

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  if (defaultPerms.includes(permission)) return true;

  if (user.customPermissions && user.customPermissions.includes(permission)) {
    return true;
  }

  return false;
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: `Forbidden. Missing permission: ${permission}` });
    }

    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const staffRoles = ['Owner', 'Super Admin', 'Admin', 'Finance Manager', 'Order Manager', 'Product Manager', 'Support Manager', 'Moderator'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Administrator or staff account required.' });
  }

  next();
}
