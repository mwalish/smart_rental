
## Goal
- Receipt shows who issued/verified it ("Issued By") and when ("Issued On").
- When verifying a payment, the user can enter a name (in case the landlord is absent) which appears on the receipt.

## Fix Plan
- [x] 1. Backend `core/views.py` — `payment_receipt`: add `issued_by` to the receipt response.
- [x] 2. Frontend `src/components/ui.jsx` — `ReceiptModal`: add an "Issued By" row.
- [x] 3. Frontend `src/pages/admin/AdminPaymentsPage.jsx` — verify prompt sends `issued_by`.
- [x] 4. Backend `landlord/views.py` — `payment_detail` PUT: set `issued_by` + receipt fields when marked COMPLETED.
- [x] 5. Frontend `src/pages/landlord/PaymentsPage.jsx` — add verify-with-name flow.
- [x] 6. Verify Python syntax + frontend build.

okay now i wanted that a tenant can have muliple houeses with deiffrent landlords so lets  impliment that and also we dont want the landlord to create anothe account by just approving