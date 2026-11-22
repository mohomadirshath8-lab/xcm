# XCM STORE - Zero-Trust Firestore Security Specification

## 1. System Invariants
1. **Admin Hierarchy Invariant**: Only documented admins verified in `/admins/$(request.auth.uid)` or matching authenticated system email can approve bank payments, modify store settings, adjust commission rates, or manage staff.
2. **Order Integrity & Escrow Invariant**: An order's `status` cannot be changed from `Pending Payment` or `Slip Uploaded` to `Payment Verified`, `Processing`, or `Completed` by a customer. Only authenticated staff/admins can mark payments verified.
3. **Self-Assigned Role Invariant**: On user registration or profile update, callers cannot elevate their own `role` to `Admin`, `Super Admin`, `Owner`, or `Finance Manager`.
4. **Order Ownership Invariant**: An order document can only be read by the ordering customer (`resource.data.customerId == request.auth.uid`) or an administrator.
5. **Slip Upload Invariant**: Customers may only update their order to add `paymentSlipUrl` and transition state from `Pending Payment` to `Slip Uploaded`. All other order fields (`finalPrice`, `items`, `customerId`) are strictly immutable.
6. **Review Authenticity Invariant**: A review can only be submitted by the authenticated user whose `userId` matches `request.auth.uid`. Admin replies can only be written by admins.
7. **Store Settings Invariant**: Only authorized admins can write to `/settings/bankDetails` or `/settings/siteSettings`. Public read is permitted for store display.
8. **Products & Catalog Invariant**: Public read is permitted for `active` products and categories. Only verified sellers (for their own products) or admins can create/update listings.

---

## 2. The "Dirty Dozen" Attack Payloads

1. **Payload 1 (Privilege Escalation on User Create)**: A non-admin registers a user document setting `"role": "Super Admin"`.
2. **Payload 2 (Admin Role Spoofing)**: A non-admin attempts to create a document at `/admins/hacker_uid` to bypass `isAdmin()` checks.
3. **Payload 3 (Order Status Tampering)**: Customer attempts to update `status` from `"Pending Payment"` directly to `"Payment Verified"` without staff approval.
4. **Payload 4 (Price Tampering on Order Create)**: Customer submits order with `finalPrice: 0.01` while purchasing high-value items.
5. **Payload 5 (Cross-Customer Order Snoop)**: User B attempts to read User A's order containing Discord tags and digital keys.
6. **Payload 6 (Bank Detail Hijacking)**: Non-admin writes to `/settings/bankDetails` replacing company wire details with personal IBAN.
7. **Payload 7 (Ghost Field Injection)**: Attacker sends an order update with an undocumented field `{"isFreePass": true}` to test update gap.
8. **Payload 8 (Review Impersonation)**: User submits a product review setting `userId: "victim_user"` and `userName: "Official XCM Admin"`.
9. **Payload 9 (Product Price Modification by Buyer)**: Non-seller/non-admin attempts to update a Minecraft account price from $34.99 to $1.00.
10. **Payload 10 (Coupon Creation by Non-Staff)**: Regular customer creates a coupon code `{"code": "HACK100", "value": 100, "type": "percentage"}`.
11. **Payload 11 (ID Poisoning Attack)**: Attacker attempts to create an order with a 2KB junk character string as ID to cause resource exhaustion.
12. **Payload 12 (Audit Log Tampering)**: Seller attempts to delete or alter historical `/auditLogs` records of payment rejections.

---

## 3. Defense Blueprint & Verification
All 12 attacks are blocked deterministically by:
- `isAdmin()` verification via `/admins/$(request.auth.uid)` and system admin email checks.
- `isValidId()` enforcing `id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`.
- Action-based update guards using `incoming().diff(existing()).affectedKeys().hasOnly(...)`.
- Strict immutable field checks (`incoming().customerId == existing().customerId`, `incoming().finalPrice == existing().finalPrice`).
