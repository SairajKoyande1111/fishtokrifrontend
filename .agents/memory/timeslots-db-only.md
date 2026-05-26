---
name: Timeslots are DB-only
description: No auto-seeding, no hardcoded client slots — admin manages all timeslots from the admin panel.
---

`GET /api/timeslots` just returns `hub.Timeslot.find({ isActive: true }).sort({ sortOrder: 1 })`. No DEFAULT_TIMESLOTS seeding loop, no INSTANT_TIMESLOT hardcoded prepend.

CartDrawer has no NEXT_DAY_TIMESLOT constant or sub-slot rendering. All timeslots (including instant delivery) come from MongoDB.

**Why:** Admin requested full control over timeslots from the admin panel without any hardcoded overrides.

**How to apply:** If instant delivery is needed, admin creates a timeslot with `isInstant: true` and `extraCharge: 49`. The frontend already handles `isInstant` styling from the timeslot document.
