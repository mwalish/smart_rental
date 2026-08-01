# TODO — Gated Rental House Website (browse → sign up → log in → full house + landlord details)

## Goal
Users can browse available houses. Committed users create an account and log in to
unlock full property details (bedrooms, bathrooms, size, landlord contact + apply form).
Guest inquiries register them as tenants (linked to their new account) so requests
land on the landlord's "other side" of the system. Landlords see the real applicant
details and can view who applied for each house.

## Backend (Django — rental_bck)
- [x] Existing: `core/house-hunting/register/` (public tenant self-registration)
- [x] Existing: `core/house-hunting/request/` (guest lead + logged-in tenant application)
- [x] `core/models.py` — added `Property.bedrooms`, `Property.bathrooms`, `Property.square_feet`
- [x] Migration `core/0006_property_bathrooms_property_bedrooms_and_more` applied
- [x] `core/serializers.py` — `PropertySerializer` includes real landlord contact (name/phone/email/business)
- [x] `core/serializers.py` — `RentalRequestSerializer` includes real tenant contact (phone/email/id_number)
- [x] `landlord/views.py` + `landlord/urls.py` — `property_applicants` endpoint (who applied per house)

## Frontend (React — rental_front copy)

### Create
- [x] 1. `src/pages/househunting/RegisterPage.jsx` — public tenant self-registration (reuses backend, auto-login).

### Edit
- [x] 2. `src/App.jsx` — add `/houses/register` route + import.
- [x] 3. `src/pages/LoginPage.jsx` — add "New tenant? Create an account" link.
- [x] 4. `src/services/houseHuntingService.js` — add `registerTenant()`.
- [x] 5. `src/pages/househunting/ListingsPage.jsx` — location autocomplete filter; show photos; bedrooms/baths on cards.
- [x] 6. `src/pages/househunting/PropertyDetailPage.jsx` — gated details: guest → sign up prompt; logged-in → landlord contact + apply form; stat cards for bedrooms/bathrooms/size.
- [x] 7. `src/pages/landlord/PropertiesPage.jsx` — photo upload; applicants summary + modal; **new bedrooms/bathrooms/size inputs + card display**.
- [x] 8. `src/pages/landlord/RequestsPage.jsx` — full applicant contact (phone/email/id).
- [x] 9. `src/pages/LandingPage.jsx` — updated copy/CTAs.
- [x] 10. Payment/unlock (KSh 200) removed — contact unlocks after sign-in.

## Landlord-side audit & fixes (current round)
- [x] `src/components/ui.jsx` — `Modal` now centers, scrolls tall content, closes on Escape/click-outside, locks body scroll.
- [x] `src/pages/landlord/RequestsPage.jsx` — Approve/Reject now use `api.patch` (backend only supports GET/PATCH — `PUT` was returning 405).
- [x] `src/pages/landlord/TenantsPage.jsx` — "View" opens a centered Tenant Detail modal (contact, ID, alt phone, joined); "Contact" opens `mailto:`.
- [x] `src/pages/landlord/MeetingsPage.jsx` — guard empty datetime (no more RangeError); empty optional tenant sent as `null`.
- [x] `src/pages/DashboardPage.jsx` — added Portfolio Occupancy progress bar + Recent Rental Requests + Recent Payments panels; `Badge` imported.
- [x] `landlord/urls.py` — fixed `property_applicants` route: `<int:pk>` → `<int:property_id>` (was a 500 TypeError; applicants modal now works).
- [x] Backend restarted; `/api/landlord/properties/1/applicants/` resolves (401 without token = route OK).
- [x] `npm run build` passes cleanly.

## Lease tenant-select fix (current round)
- [x] `core/models.py` — added `Tenant.registered_by` (FK → Landlord, `SET_NULL`, related `registered_tenants`).
- [x] `core/serializers.py` — `TenantCreateSerializer.create()` sets `registered_by` from context when a landlord registers the tenant.
- [x] `core/views.py` — `LandlordCreateTenantView` passes `landlord` context; unified `Register` view sets `registered_by` when a landlord creates a tenant.
- [x] `landlord/views.py` — `tenants` endpoint now returns the landlord's registered tenants **+** tenants with leases on their properties (so the lease form can select every registered tenant, even before a lease exists).
- [x] Migration `0007_tenant_registered_by` created + applied.
- [x] `src/pages/landlord/LeasesPage.jsx` — tenant dropdown shows all registered tenants (name + phone + email); helpful hint added when no tenants registered yet.
- [x] Backend restarted; `/api/properties/available/` → 200. `manage.py check` passes.

## Create Lease button fix
- [x] `src/pages/landlord/LeasesPage.jsx` — removed unsupported `terms` field (backend Lease model has no such field → was returning "Got unexpected fields: terms" and blocking create). Added `saving` state, success notice banner, and payload only sends model-accepted fields (property, tenant, start_date, end_date, monthly_rent, status). `Textarea` import removed.

## Dedicated registered-tenants endpoint (dropdown refinement)
- [x] `landlord/urls.py` — added `registered-tenants/` route.
- [x] `landlord/views.py` — added `registered_tenants` view returning ONLY tenants the landlord personally registered (`registered_by=landlord`).
- [x] `src/pages/landlord/LeasesPage.jsx` — dropdown now loads from `landlord/registered-tenants/`.
- [x] Verified: `/api/landlord/registered-tenants/` → 401 without token (route exists); `npm run build` passes.

## Lead → Tenant conversion (landlord side)
- [x] `landlord/views.py` — `convert_lead_to_tenant(request, request_id)`: converts a house-hunting request into a registered tenant account.
  - If the request already has a linked tenant → adopt (set `registered_by` if empty).
  - If a User already exists with the lead's email (iexact) or phone → **reuse that exact account** (no duplicates); create the Tenant profile if missing, upgrade role to tenant, link the request.
  - Otherwise → create a new tenant User (generated 10-char password, unique username, fallback phone/email) + Tenant profile; link the request.
  - Returns `{ message, reused_existing, tenant, generated_password, login_email, login_phone }`.
- [x] `landlord/urls.py` — added `rental-requests/<int:request_id>/convert-to-tenant/` route.
- [x] `src/services/houseHuntingService.js` — added `convertLeadToTenant(requestId)`.
- [x] `src/pages/landlord/RequestsPage.jsx` — "Register as Tenant" action on guest requests; confirm dialog; on success shows a centered modal with the linked tenant + generated login credentials (or "kept existing login" when reused); success notice banner; list refreshes to show the linked tenant; existing-account badge for requests already linked.
- [x] `src/components/ui.jsx` — `ActionBtn` now supports `disabled` (dimmed + cursor-not-allowed).
- [x] Backend + frontend build verified (route 401 without token = protected; `npm run build` clean).

## Follow-up
- [x] 11. Frontend build verified — `npm run build` passes (no errors).
- [x] 12. Backend restarted; API verified returning `bedrooms`/`bathrooms`/`square_feet` + landlord contact.
- [x] 13. Convert-to-tenant route resolves (401 without token); `/api/properties/available/` → 200.
- [ ] 14. Final manual test: `/houses`, `/houses/:id`, `/houses/register`, login, landlord Properties/Requests pages.

