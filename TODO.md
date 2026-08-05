# TODO: Fix /houses/register page issues

## Steps
- [x] Fix 1: Frontend `RegisterPage.jsx` — send `phone_number` instead of `phone` so backend serializer accepts it
- [x] Fix 2: Backend `serializers.py` — fix `UserSerializer.get_full_name` to safely access `full_name` (User model has no such field) — fixes both registration AND login
- [x] Verify: Test registration endpoint with correct payload
- [x] Verify: Test login endpoint works after fix
