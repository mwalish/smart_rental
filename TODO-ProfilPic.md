# Add: My Profile Page + Profile Picture (next to tenant name)

## Goal
- New "My Profile" page where the user can view their details and upload/change a profile picture.
- The profile picture shows at the top, next to the user's name, in the dashboard header (and sidebar/mobile avatars).
- The picture must STAY PUT — no flickering / disappearing.

## Fix Plan
- [x] 1. `src/services/authService.js` — add `getProfile()` / `updateProfile()` helpers (use `core/profile/`).
- [x] 2. `src/pages/ProfilePage.jsx` — new page: big avatar at top next to the name, "Change photo" upload with preview, view/edit basic info. Saves via multipart PATCH.
- [x] 3. `src/App.jsx` — register `/dashboard/profile` route (landlord/admin/tenant).
- [x] 4. `src/pages/DashboardPage.jsx` — add "My Profile" to LANDLORD/ADMIN/TENANT nav; render uploaded picture in header (next to name), sidebar user pill, and mobile avatar.
- [x] 5. `src/pages/househunting/TenantDashboardPage.jsx` — show profile picture next to tenant name in the house-hunting navbar (fallback to initial).
- [x] 6. `src/AuthContext.jsx` — **FIX THE FLICKER**: `setProfile`/`setUser` now persist to localStorage, and the app re-fetches `core/profile/` on boot so the picture is always the latest and never reverts to a stale/initial value on reload or re-render.
- [x] 7. Update TODO.md + build verification (vite build succeeds).

## Change Password (added)
- [x] Backend `rental/core/views.py` — new `change_password` view: verifies current password, enforces min length & different-from-current, updates via `make_password`, and blacklists all refresh tokens so old sessions are invalidated.
- [x] Backend `rental/core/urls.py` — registered `core/change-password/` route.
- [x] Frontend `src/services/authService.js` — added `changePassword()` helper.
- [x] Frontend `src/pages/ProfilePage.jsx` — added a "Change Password" card (current / new / confirm) with client-side validation (required, match, min 6), success/error messages, and auto-logout → login after a successful change.
- [x] Verified: backend Python syntax OK + `npm run build` passes.

