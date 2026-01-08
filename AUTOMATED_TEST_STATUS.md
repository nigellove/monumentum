# Automated Test Status

Last updated: 2026-01-08

## Test Results Summary

**Total Tests:** 9
**Passing:** 3 ✅
**Failing:** 6 ❌ (due to Edge Function implementation, not test setup)

## ✅ Passing Tests

1. **should reject email sending when user has no Outbound product** - Tests that users without an Outbound product subscription cannot send emails
2. **should allow same-tenant access** - Tests that users can access their own data within their tenant
3. **should reject paused subscriptions** - Tests that paused subscriptions are properly rejected

## ❌ Failing Tests (Edge Function needs fixes)

### 1. Trial Status Support
**Test:** `should allow trialing users to send emails`
**Issue:** Edge Function rejects users with 'trialing' status
**Fix Needed:** Update `send-outbound-email` Edge Function to allow `status: 'trialing'` in addition to `status: 'active'`

### 2. Email Limit Enforcement (Starter - 750)
**Test:** `should enforce 750 email limit for Starter tier`
**Issue:** Returns 403 instead of 429 when limit exceeded
**Fix Needed:** Edge Function should return HTTP 429 (Too Many Requests) not 403 (Forbidden)

### 3. Email Limit Enforcement (Pro - 2500)
**Test:** `should enforce 2500 email limit for Pro tier`
**Issue:** Returns 403 instead of 429 when limit exceeded
**Fix Needed:** Same as above - return 429 for rate limits

### 4. Tenant Isolation - Cross-tenant prospect access
**Test:** `should block User A from accessing User B prospect`
**Issue:** Returns 404 instead of 403
**Fix Needed:** Edge Function should return 403 (Forbidden) when detecting cross-tenant access attempts

### 5. Tenant Isolation - Cross-tenant campaign access
**Test:** `should block User B from accessing User A campaign`
**Issue:** Returns 404 instead of 403
**Fix Needed:** Same as above - return 403 for security violations

### 6. Data Corruption Protection
**Test:** `should prevent prospect with mismatched customer_id`
**Issue:** Prospect insert failing (test setup issue with badProspect data)
**Fix Needed:** Review test setup to ensure badProspect can be created for testing

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run tests/api/outbound-limits.test.ts
npx vitest run tests/api/tenant-isolation.test.ts

# Run with UI dashboard
npm run test:ui
```

## Environment Setup

Tests require environment variables in `.env.test`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

## Next Steps

1. Fix `send-outbound-email` Edge Function to:
   - Accept 'trialing' status users
   - Return 429 for rate limit violations (not 403)
   - Return 403 for tenant isolation violations (not 404)
2. Review badProspect test data creation
3. All tests should pass after Edge Function fixes
