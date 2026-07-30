# Redesign TODO

## Step 1: Fix DashboardPage navigation bug
- Fix LANDLORD_NAV: change `/dashboard/tenants` → `/dashboard/maintenance` for "Maintenance" link
- Add proper "Tenants" link with correct path `/dashboard/tenants`

## Step 2: Create proper Tenants page for landlords
- Build `src/pages/landlord/TenantsPage.jsx` with tenant listing, search, and management

## Step 3: Clean up App.css (remove Vite boilerplate)
- Remove unused `.counter`, `.hero`, `#center`, `#next-steps`, `#spacer`, `.ticks` styles

## Step 4: Clean up commented-out code in multiple files
- App.jsx
- AuthContext.jsx
- dashboardService.js
- LandingPage.jsx
- LoginPage.jsx
- RegisterPage.jsx

## Step 5: Remove old HTML prototype
- Delete `components/index.html`

## Step 6: Polish index.css
- Add subtle refinements for a polished look

