# Deployment-Readiness Fixes — Task Tracker

Phase 1: Bug Fixes & Unused Code Cleanup (current)

## Backend (Django)
- [x] 1. Fix `landlord/views.py` dashboard — payment status case bug (`"completed"` → `"COMPLETED"`)
- [x] 2. Fix `landlord/views.py` dashboard — naive `datetime.today()` → timezone-aware (`timezone.now()`)
- [x] 3. Fix `core/views.py` `payment_list_create` — inefficient/incorrect summary aggregates (now SQL `Q`+`Sum`)
- [x] 4. Add DB indexes on hot filter fields (Payment.status, RentalRequest.status, Maintenance.status, Lease.status, created_at)
- [x] 5. Harden `core/mpesa.py` — error handling + response validation for external API calls
- [x] 6. Add basic validation to M-Pesa callback endpoint
- [x] 7. Add pagination (limit/offset) to `admin_all_users`
- [x] 8. Remove dead apps: `expenditure`, `payments`, `propeties`, `tenants`
- [x] 9. Remove dead files: `landlord/api_views.py`, `landlord/forms.py`, `landlord/serializers.py`, commented `admin.py`
- [x] 10. Create `requirements.txt` (pinned deps incl. django-environ, whitenoise, Pillow)
- [x] 11. NEW: Externalize all secrets from `settings.py` to environment variables via `django-environ`
- [x] 12. NEW: Add production security hardening (Debug off, CORS restricted, HTTPS/HSTS, WhiteNoise)
- [x] 13. NEW: Generate migration `0011` for new DB indexes + apply (`migrate core`)

## Frontend (React/Vite)
- [x] 14. Remove unused `axis` dependency from package.json
- [x] 15. Add proper property-detail endpoint + fix `getPropertyDetail` (no full-list fetch)
- [x] 16. Remove `document.write` XSS risk in `ui.jsx` receipt print handler (sanitize scripts + iframe fallback)
- [x] 17. Centralize API/media base URLs via env/config (replace hardcoded `127.0.0.1:8000`)
- [x] 18. Add `.env.example` + `.gitignore` entries for frontend env files

## Housekeeping / Verify
- [x] 19. Backend `manage.py check` passes (0 issues)
- [x] 20. Backend `makemigrations --check` reports "No changes detected"
- [x] 21. Frontend `vite build` succeeds
- [x] 22. Created backend `.env` + frontend `.env.example` and updated `.gitignore` files

## Remaining / Recommended (not blocking deploy)
- [ ] Fix pre-existing `DashboardPage.jsx` lint warnings (Avatar in render, unused vars, useEffect deps)
- [ ] Reduce frontend bundle size (>500 kB chunk warning) via code-splitting / lazy route imports
- [ ] Add automated test suite (currently none exist)
- [ ] Set `SECURE_SSL_REDIRECT` + verify TLS termination proxy in production

## Post-review cleanup (senior dev pass)
- [x] 23. Cleaned dead imports `Count`, `Q` from `landlord/views.py` (only `Sum` + `transaction` used)
- [x] 24. Fixed `requirements.txt` driver mismatch — PyMySQL (installed/working) instead of mysqlclient
- [x] 25. Verified `manage.py check --database default` passes (DB connectivity confirmed)
- [x] 26. Final `vite build` passes clean

## Forgot Password (Phone OTP) — Frontend
- [x] 1. Add `sendResetCode(phone)` + `confirmPasswordReset(phone, code, new_password)` to `src/services/authService.js`
- [x] 2. Create `src/pages/ForgotPasswordPage.jsx` (3-step wizard: phone → OTP → new password) with resend countdown
- [x] 3. Add `/forgot-password` route to `src/App.jsx`
- [x] 4. Wire the "Forgot password?" link on `LoginPage.jsx` to `/forgot-password`
- [x] 5. Verify `vite build` passes
- [x] 6. Mark reset endpoints as public routes in `src/services/api.js` interceptor

## Forgot Password — Email OTP Alternative (zero credentials)
- [x] 7. Backend `send_reset_code` now accepts `email` OR `phone`, sends OTP via Django email (console backend in dev) or SMS
- [x] 8. Backend `confirm_password_reset` now accepts `email` OR `phone` to look up the user
- [x] 9. Backend `settings.py` — added EMAIL_* env config (console default, SMTP ready)
- [x] 10. Frontend `authService.js` — added `sendEmailResetCode(email)`
- [x] 11. Frontend `ForgotPasswordPage.jsx` — added Email/SMS method toggle, email input, dynamic "sent to" display
- [x] 12. Verified `vite build` passes + backend Python syntax OK

## Forgot Password — Production Email (Gmail SMTP)
- [x] 13. Added Gmail SMTP credentials to backend `.env` (EMAIL_BACKEND=smtp, host smtp.gmail.com:587, TLS, smartrentals343@gmail.com)
- [x] 14. Updated `.env.example` with documented email variables (placeholders, no real secret)
- [x] 15. Confirmed `.env` is git-ignored (credentials safe from commits)
- [x] 16. Verified settings.py already reads all EMAIL_* vars from env (django-environ)
- [~] 17. NOTE: `manage.py check` can't run in this shell (missing `django-environ` in system Python) — run inside the project's virtualenv

