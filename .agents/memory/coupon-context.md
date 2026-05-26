---
name: Coupon state in CartContext
description: appliedCoupon state lives in CartContext, not CartDrawer — both detail pages and CartDrawer share it.
---

`appliedCoupon`, `setAppliedCoupon`, and `discountAmount` are in `CartContext`, exposed via `useCart()`.

CartDrawer reads them from context instead of local state. ProductDetail and ComboDetail CouponCard components call `setAppliedCoupon` directly from `useCart()`.

**Why:** Coupons need to persist when the cart drawer is closed/opened and be pre-selectable from product/combo detail pages.

**How to apply:** Any new page/component wanting to apply or read the active coupon should use `useCart()` — do NOT add local coupon state.

Auto-invalidation useEffects (drop below minOrderAmount, clear on empty cart) live in CartContext, not CartDrawer.
