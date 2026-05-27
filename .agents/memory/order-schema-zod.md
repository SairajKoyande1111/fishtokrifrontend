---
name: Order schema strips unknown fields
description: Any new field sent in the order creation payload must be declared in insertOrderRequestSchema (shared/schema.ts) or Zod will silently strip it before the route handler reads it.
---

The order creation route at `server/routes.ts` uses `api.orders.create.input.parse(req.body)`, where `api.orders.create.input` is `insertOrderRequestSchema` from `shared/schema.ts`. Zod's `.parse()` strips any field not declared in the schema.

**Why:** `walletAmountUsed` was sent from CartDrawer and reached the server in `req.body`, but was silently removed by `.parse()` before the deduction code ran — resulting in `walletAmountUsed` always being `0` and no MongoDB update ever firing.

**How to apply:** Whenever a new field needs to flow from the frontend order payload to the server handler (e.g. walletAmountUsed, promoCode, giftNote), add it to `insertOrderRequestSchema` in `shared/schema.ts` first.
