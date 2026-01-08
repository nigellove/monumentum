# Testing Quick Start Guide

## 🚀 Run Automated Tests (5 minutes)

### Step 1: Set Up Environment
```bash
# Copy the example env file
cp .env.test.example .env.test

# Edit .env.test and add your Supabase credentials
# (Use TEST environment, not production!)
```

### Step 2: Run Tests
```bash
# Run all automated tests
npm test

# Or run with UI dashboard
npm run test:ui
```

### What Gets Tested Automatically:
✅ **Email Limits** (750 for Starter, 2500 for Pro)
✅ **Trial Status** (trialing users can send)
✅ **Tenant Isolation** (cross-customer protection)
✅ **Subscription Validation** (paused/canceled rejection)

**Time:** ~20-30 seconds
**Coverage:** Critical business logic (50% of manual tests)

---

## 📋 Manual Testing Checklist (2-3 hours)

Use the comprehensive checklist: [E2E_TESTING_CHECKLIST.md](E2E_TESTING_CHECKLIST.md)

### Priority Tests to Run Manually:

#### 1. Outbound Starter Signup (15 min)
- [ ] Go to monumentum.ai/pricing
- [ ] Click "Get Started" on Outbound Starter
- [ ] Complete Stripe checkout (test card: 4242 4242 4242 4242)
- [ ] Verify email received with "7-day trial"
- [ ] Log in and test prospect generation
- [ ] Send test email and verify limit shows 1/750

#### 2. Outbound Pro Signup (15 min)
- [ ] Same as above but for Pro tier
- [ ] Verify limit shows 1/2500

#### 3. Inbound Product Signup (15 min each)
- [ ] Test Inbound Sales Agent
- [ ] Test Customer Service Agent
- [ ] Test Integrated Agent
- [ ] Verify widget installation emails received

#### 4. Admin Panel (30 min)
- [ ] Set `is_admin: true` in Supabase for your account
- [ ] Access /admin on monumentum.ai
- [ ] Verify dashboard shows correct metrics
- [ ] Test user management (view, block/unblock)
- [ ] Test subscription management (pause/resume)
- [ ] Verify audit log captures actions

---

## 🎯 Pre-Production Checklist

Before going live, ensure:

### Automated Tests
- [ ] All tests pass: `npm test`
- [ ] No console errors

### Critical Manual Tests
- [ ] At least one full signup for each product type
- [ ] Email limits enforced correctly
- [ ] Admin panel accessible and functional
- [ ] Welcome emails sent with correct content

### Infrastructure
- [ ] Cloudflare Pages deployed successfully
- [ ] All Edge Functions deployed
- [ ] n8n workflows active
- [ ] AWS SES configured and verified

---

## 🐛 Common Issues

### Tests Fail with "Failed to create test user"
**Fix:** Check `.env.test` has correct `SUPABASE_SERVICE_ROLE_KEY`

### "fetch failed" errors
**Fix:** Deploy Edge Functions:
```bash
npx supabase functions deploy send-outbound-email
```

### AWS SES errors in tests
**Expected!** Tests validate logic, not actual email sending.

### Stripe webhook not firing
**Fix:** Check webhook URL in Stripe Dashboard → Developers → Webhooks

---

## 📊 Test Results

### Automated Tests Cover:
- ✅ 50% of E2E checklist (critical API logic)
- ✅ Security (tenant isolation)
- ✅ Business rules (email limits, trial status)
- ✅ Subscription validation

### Manual Tests Required For:
- 👁️ Visual verification (UI, emails)
- 👁️ End-to-end flows (Stripe → n8n → database)
- 👁️ Widget installation
- 👁️ Complex integrations (trial conversion)

---

## ⏱️ Time Estimates

| Activity | Time | Value |
|----------|------|-------|
| **Automated tests** | 30 seconds | ⭐⭐⭐⭐⭐ High |
| **Critical manual tests** | 1 hour | ⭐⭐⭐⭐ High |
| **Full E2E checklist** | 2-3 hours | ⭐⭐⭐ Medium |
| **Exploratory testing** | 1-2 hours | ⭐⭐ Low |

**Recommended for each deploy:** Automated + 1 signup test per product = **15 minutes**

---

## 🎉 You're Ready!

1. Run automated tests: `npm test` ✅
2. Test one Outbound signup manually ✅
3. Verify admin panel works ✅
4. Deploy to production 🚀

**Full checklist:** See [E2E_TESTING_CHECKLIST.md](E2E_TESTING_CHECKLIST.md) for comprehensive 20-test suite.
