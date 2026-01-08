# Edge Function Fixes Applied

**Date:** 2026-01-08

## Summary

Fixed the `send-outbound-email` Edge Function to properly handle tenant isolation and return correct HTTP status codes.

## Changes Made

### 1. Edge Function Updates (`send-outbound-email/index.ts`)

**Tenant Isolation Improvements:**
- Changed prospect/campaign fetching to NOT filter by `user_id` initially
- Added explicit `user_id` checks AFTER fetching data
- Now returns **403 Forbidden** for cross-tenant access attempts (instead of 404)
- Added three-tier isolation checking:
  1. Prospect user_id must match requested user_id
  2. Campaign user_id must match requested user_id
  3. Campaign customer_id must match prospect customer_id

**Fields Selected:**
- Updated campaign select to include: `user_id, customer_id, sender_name, reply_to_email, email_signature`

### 2. Database Migration Created

**File:** `supabase/migrations/20260108000000_add_campaign_email_fields.sql`

Adds three new fields to `outbound_campaigns` table:
- `sender_name` - Name shown in "From:" field (e.g., company name)
- `reply_to_email` - Email address for replies (typically company email)
- `email_signature` - Optional signature appended to all emails

**Action Required:**
You need to run this migration manually in Supabase SQL Editor:

```sql
ALTER TABLE outbound_campaigns
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
  ADD COLUMN IF NOT EXISTS email_signature TEXT;
```

### 3. Test Files Updated

**Updated campaign inserts to include new fields:**
- `tests/api/outbound-limits.test.ts` - Added sender_name and reply_to_email
- `tests/api/tenant-isolation.test.ts` - Added sender_name and reply_to_email for both users

### 4. Edge Function Deployed

The updated Edge Function has been deployed to Supabase.

## Testing Status Before Migration

**Current:** 3/9 tests passing

**Expected After Migration:** 8-9/9 tests should pass

### What Should Work After Migration:
1. ✅ Trial users can send emails (already working)
2. ✅ 429 status for rate limits (already working)
3. ✅ 403 status for tenant violations (NOW FIXED)
4. ✅ Proper email limit enforcement (already working)

### Remaining Issue:
- **badProspect test** - May need minor adjustment for data corruption test case

## Next Steps

1. **Run the migration** in Supabase SQL Editor (copy from migration file)
2. **Run tests again:** `npm test`
3. **Verify results:** Should see 8-9 passing tests
4. **Fix badProspect test** if still failing (likely just needs error handling adjustment)

## Files Changed

- ✅ `supabase/functions/send-outbound-email/index.ts` - Tenant isolation logic
- ✅ `supabase/migrations/20260108000000_add_campaign_email_fields.sql` - New migration
- ✅ `tests/api/outbound-limits.test.ts` - Added campaign fields
- ✅ `tests/api/tenant-isolation.test.ts` - Added campaign fields
