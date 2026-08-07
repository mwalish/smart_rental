# Payment Receipt & Lease Validation Fix Plan

## Goal
1. **Landlord issues receipts** — the `issued_by` on every receipt must default to the **landlord's** name (not the tenant's).
2. **Lease date validation** — validate start date (not in the past) and end date (must be after start date).

## Steps

### Backend — Receipt Issuer (Landlord)
- [x] 1. `core/models.py` — `Payment.save()`: change default `issued_by` from **tenant** name → **landlord** name (`lease.property.landlord.full_name`), fallback `'System'`.
- [x] 2. `core/views.py` — `mpesa_callback`: change default `issued_by` from tenant name → **landlord** name.
- [x] 3. `core/views.py` — `verify_payment`: reorder issuer fallback so landlord name takes priority (landlord → user full_name → admin → username).
- [x] 4. `landlord/views.py` — `payment_detail`: already uses landlord fallback; verified consistent.

### Backend — Lease Date Validation
- [x] 5. `core/serializers.py` — `LeaseSerializer.validate()`: require both dates; reject past `start_date` (on create); enforce `end_date > start_date`.

### Frontend — Lease Form
- [x] 6. `src/pages/landlord/LeasesPage.jsx` — set `min={today}` on start date; add submit-time validation (end > start; start not in past).

### Frontend — Payment UI (Landlord Issuer)
- [x] 7. `src/pages/landlord/PaymentsPage.jsx` — prefill verify modal issuer name with the landlord's name so the receipt shows the landlord by default.

### Verification
- [x] 8. Verify Python syntax (`python3 -m py_compile` on edited files) — PASSED.
- [x] 9. Verify frontend build (`npm run build`) — PASSED.

