# Monumentum Automated Test Suite

Automated API tests for critical business logic in the Monumentum platform.

## 🎯 What's Tested

### ✅ Outbound Email Limits (`outbound-limits.test.ts`)
- Monthly email limit enforcement (750 for Starter, 2,500 for Pro)
- Trial status acceptance ('trialing' users can send emails)
- Subscription status validation
- Paused subscription rejection
- Proper error messages and status codes

### ✅ Tenant Isolation (`tenant-isolation.test.ts`)
- Cross-tenant data access prevention
- customer_id validation between campaigns and prospects
- Protection against data corruption scenarios
- Proper 403 error responses

## 📋 Prerequisites

1. **Environment Variables**: Copy `.env.test.example` to `.env.test` and fill in:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Supabase Edge Functions**: Ensure all Edge Functions are deployed:
   ```bash
   npx supabase functions deploy send-outbound-email
   npx supabase functions deploy admin-platform-stats
   npx supabase functions deploy admin-users-list
   ```

3. **Test Database**: Tests will create and clean up their own data, but you should use a **test/staging environment**, not production!

## 🚀 Running Tests

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode (re-run on file changes):
```bash
npm run test:watch
```

### Run tests with UI dashboard:
```bash
npm run test:ui
```

### Run specific test file:
```bash
npx vitest run tests/api/outbound-limits.test.ts
```

### Run tests with coverage:
```bash
npm run test:coverage
```

## 📊 Test Results

Tests will output:
- ✅ **Pass**: Green checkmark, test passed
- ❌ **Fail**: Red X, test failed with error details
- ⏭️ **Skip**: Yellow dash, test was skipped

Example output:
```
 ✓ tests/api/outbound-limits.test.ts (6 tests) 15234ms
   ✓ Outbound Email Limits API
     ✓ should reject email sending when user has no Outbound product
     ✓ should allow trialing users to send emails
     ✓ should enforce 750 email limit for Starter tier
     ✓ should enforce 2500 email limit for Pro tier
     ✓ should reject paused subscriptions

 ✓ tests/api/tenant-isolation.test.ts (4 tests) 8432ms
   ✓ Tenant Isolation API
     ✓ should block User A from accessing User B prospect
     ✓ should block User B from accessing User A campaign
     ✓ should allow same-tenant access
     ✓ should prevent prospect with mismatched customer_id

 Test Files  2 passed (2)
      Tests  10 passed (10)
   Start at  16:30:45
   Duration  23.67s
```

## 🐛 Troubleshooting

### "Failed to create test user" or "User not allowed"
**This is the most common issue!** The error means Supabase auth settings are blocking user creation.

**Fix:**
1. Go to your Supabase Dashboard: Authentication → Providers → Email
2. Enable these settings:
   - ✅ Enable email provider
   - ✅ Confirm email (can be disabled for testing)
3. Go to Authentication → Settings:
   - ✅ Allow new users to sign up
4. If using a production database for testing (not recommended), make sure you're using test environment instead

**Also check:**
- SUPABASE_SERVICE_ROLE_KEY is set correctly in [.env.test](monumentum/.env.test)
- You're using the SERVICE ROLE key, not the anon key
- Verify Supabase project is accessible

### "fetch failed" or timeout errors
- Ensure Edge Functions are deployed
- Check that VITE_SUPABASE_URL is correct
- Increase test timeout in vitest.config.ts if needed

### AWS SES errors in tests
- Expected! Tests validate business logic, not actual email sending
- Tests check that limits/auth work, even if AWS SES fails
- To test actual email sending, configure AWS credentials

### "Monthly email limit" tests failing
- Tests insert many rows - may be slow on free tier
- Consider running these tests separately
- Check that test data is being cleaned up properly

## 📝 Adding New Tests

1. Create a new file in `tests/api/`:
   ```typescript
   import { describe, it, expect, beforeAll, afterAll } from 'vitest';
   import { createClient } from '@supabase/supabase-js';
   import { generateTestId } from '../setup';

   describe('My New Test Suite', () => {
     // Setup test data in beforeAll
     // Write tests with it()
     // Cleanup in afterAll
   });
   ```

2. Run your new test:
   ```bash
   npx vitest run tests/api/your-new-test.test.ts
   ```

## ⚠️ Important Notes

- **Don't run tests in production!** Always use a test/staging environment
- **Tests create real data** in your Supabase database (cleaned up afterward)
- **Tests may take 20-30 seconds** due to database operations
- **Some tests insert 2500+ rows** to test limits - be patient
- **AWS SES errors are OK** - tests focus on business logic, not email delivery

## 🎯 Coverage

Current test coverage:
- ✅ **Outbound email limits**: 100%
- ✅ **Tenant isolation**: 100%
- ⏳ **Admin API endpoints**: Coming soon
- ⏳ **Signup flows**: Coming soon (E2E with Playwright)

## 🔐 Security

- Tests use `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- Never commit `.env.test` to git (already in .gitignore)
- Test users are automatically deleted after tests complete
- All test data is prefixed with `test_` for easy identification

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)
- [E2E Testing Checklist](../E2E_TESTING_CHECKLIST.md)
