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

