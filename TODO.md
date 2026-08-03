# Fix: Submit Button on House-Hunting Property Detail Page

## Goal
Make the submit button work reliably on `http://localhost:5174/houses/5`.

## Root Cause
The guest submit flow in `PropertyDetailPage.jsx` did a fragile sequence:
register account → auto-login → submit inquiry. If registration failed
(e.g. email/phone already exists, weak password), the whole request was never
created. Also `submitRentalInquiry` only sent `{ property, message }`, which
doesn't satisfy the backend's guest-inquiry requirement of `full_name`/`phone`.

## Fix Plan
- [x] 1. Submit the rental inquiry FIRST with guest contact info
      (`lead_name`, `lead_phone`, `lead_email`) so the request is always created.
- [x] 2. Then create the tenant account + auto-login as a best-effort step
      (wrapped in its own try/catch) so account failure doesn't block submission.
- [x] 3. Show a clear success message either way.
- [x] 4. Build verification (vite build succeeds).

# Add: Horizontal Top Navigation Bar (DashboardPage)

## Goal
Let users navigate without needing to use the sidebar collapse arrows.

## Fix Plan
- [x] 1. Add a horizontal navigation bar below the header with role-based nav links.
- [x] 2. Highlight the active link with a teal underline + tint.
- [x] 3. Show on medium+ screens (hidden on mobile, where the hamburger drawer is used).
- [x] 4. Build verification (vite build succeeds).
- [x] 5. Nest all dashboard sub-routes under DashboardPage in App.jsx so the
      nav bar (and sidebar/header) appear inside every child component
      (Properties, Tenants, Requests, etc.) via <Outlet />.

# Add: Smart Notifications (DashboardPage)

## Goal
- Mark a notification as read only when the user clears it (red/unread).
- Separate notifications into "Tenants" vs "Guests" so they're not mixed.

## Fix Plan
- [x] 1. Track read/unread state per notification id (persisted to localStorage).
- [x] 2. Bell badge shows the real unread count (red when > 0).
- [x] 3. Each unread notification shows a red dot + a "Mark as read" (✓) button;
      clicking it clears only that notification (read ones keep no button).
- [x] 4. "Mark all read" button clears all unread at once.
- [x] 5. Audience filter tabs (All / Tenants / Guests) with counts, so tenant
      and guest notifications are separated.
- [x] 6. Requests are tagged as tenant vs guest based on whether a tenant is linked.
- [x] 7. Build verification (vite build succeeds).

# Add: Restrict Unregistered Tenant Notifications & Access

## Goal
- A new tenant who self-registers via house-hunting must NOT get notifications
  until a landlord registers them (i.e. they are linked to a house).
- Enforce this across the UI.

## Fix Plan
- [x] 1. `DashboardPage.jsx` — compute `isTenantRegistered` from
      `profile.registered_by_name`/`registered_by` or an active lease.
- [x] 2. Notifications are skipped entirely for unregistered tenants
      (empty list, no fetch).
- [x] 3. `ProtectedRoute.jsx` — added `allowUnregisteredTenant` prop.
      Unregistered tenants are redirected to `/not-authorized` for tenant
      feature pages (my-property, tenant-payments, maintenance, notices,
      my-requests) but still allowed on `/houses/*` (house-hunting).
- [x] 4. `App.jsx` — house-hunting routes and the dashboard shell pass
      `allowUnregisteredTenant`; tenant feature routes stay restricted.
- [x] 5. `DashboardPage.jsx` — amber "Pending landlord registration" banner on
      the overview for unregistered tenants, with a link to browse properties.
- [x] 6. Build verification (vite build succeeds).

# Redesign Error Pages (404 / 403) to Match SmartRent Design System

## Goal
- Rebuild the 404 and 403 error pages to match the SmartRent brand
  (dark slate gradient, teal/cyan accents, ambient glows, animations).

## Fix Plan
- [x] 1. `NotFound.jsx` — dark `slate-900 → teal-950 → slate-900` gradient,
  ambient teal/cyan glows, gradient "404" text, SmartRent brand, Back + Go Home.
- [x] 2. `NotAuthorized.jsx` — matching dark gradient, amber/red glows,
  shield-lock icon, gradient "403" text, role-aware messaging, Back + Go to Dashboard.
- [x] 3. Build verification (vite build succeeds).
