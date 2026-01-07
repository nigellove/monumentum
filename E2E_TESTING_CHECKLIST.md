# End-to-End Testing Checklist
## Monumentum Platform - Complete Testing Guide

**Date:** January 7, 2026
**Purpose:** Comprehensive validation of all product signup flows, integrations, and admin functionality

---

## 🎯 Pre-Testing Setup

### 1. Environment Verification
- [ ] Cloudflare Pages deployment completed successfully (commit: 6dc4fdd)
- [ ] All Supabase Edge Functions deployed
- [ ] n8n workflows active and running
- [ ] AWS SES configured and verified
- [ ] Test Stripe accounts ready (use test mode cards)

### 2. Test Accounts Needed
- [ ] Admin account with `is_admin: true` flag set in Supabase
- [ ] 5 unique test email addresses for different product signups
- [ ] Stripe test credit card: `4242 4242 4242 4242` (any future expiry, any CVC)

---

## 📦 Product Signup Flow Testing

### Test 1: Inbound Sales Agent ($9.99/month)
**Product ID:** `inbound_sales_agent`
**Expected Trial:** 30 days
**Expected Outcome:** Widget installation instructions email

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Click "Get Started" on Inbound Sales Agent card
3. [ ] Complete Stripe checkout with test card
4. [ ] Verify Stripe webhook fired (check n8n execution logs)
5. [ ] Check `user_products` table for new entry:
   - [ ] `product_id` = 'inbound_sales_agent'
   - [ ] `product_name` = 'Inbound Sales and Lead Capture Agent'
   - [ ] `status` = 'trialing' or 'active'
   - [ ] `trial_ends_at` = 30 days from now
6. [ ] Check email inbox for welcome message
7. [ ] Verify email contains widget installation instructions
8. [ ] Log into user portal at https://monumentum.ai
9. [ ] Verify product shows in dashboard
10. [ ] Test widget installation (follow email instructions)

**Success Criteria:** ✅ User can access portal, widget code generated, email received

---

### Test 2: Customer Service Agent ($12.99/month)
**Product ID:** `customer_service_agent`
**Expected Trial:** 30 days
**Expected Outcome:** Widget installation instructions email

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Click "Get Started" on Customer Service Agent card
3. [ ] Complete Stripe checkout with test card
4. [ ] Verify Stripe webhook fired
5. [ ] Check `user_products` table for new entry with correct product_id
6. [ ] Check email for welcome message with widget instructions
7. [ ] Log into portal and verify product access

**Success Criteria:** ✅ User provisioned, widget accessible, policy documents shown (customer service requires policy)

---

### Test 3: Integrated Agent ($15.99/month)
**Product ID:** `integrated_agent`
**Expected Trial:** No trial (based on products.ts)
**Expected Outcome:** Widget installation instructions email

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Click "Get Started" on Integrated Agent card
3. [ ] Complete Stripe checkout with test card
4. [ ] Verify Stripe webhook fired
5. [ ] Check `user_products` table - verify NO trial period
6. [ ] Check email for welcome message
7. [ ] Log into portal and verify both sales + service features accessible

**Success Criteria:** ✅ User has access to both sales and service features, policy documents required

---

### Test 4: Outbound Sales Starter ($39.99/month)
**Product ID:** `outbound_sales_starter`
**Expected Trial:** 7 days
**Monthly Email Limit:** 750
**Expected Outcome:** Outbound welcome email (NO widget instructions)

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Click "Get Started" on Outbound Starter card
3. [ ] Complete Stripe checkout with test card
4. [ ] Verify Stripe webhook fired
5. [ ] Check `user_products` table:
   - [ ] `product_id` = 'outbound_sales_starter'
   - [ ] `trial_ends_at` = **7 days** from now (not 30!)
   - [ ] `status` = 'trialing'
6. [ ] Check email for Outbound-specific welcome message
7. [ ] Verify email mentions "7-day free trial"
8. [ ] Verify email does NOT contain widget installation instructions
9. [ ] Log into portal and access Outbound section
10. [ ] Test prospect generation functionality
11. [ ] Generate a test campaign with 1-2 prospects
12. [ ] Approve prospects and attempt to send email
13. [ ] Verify email sends successfully (check `outbound_email_logs`)
14. [ ] Check email limit tracking shows 1/750 emails used

**Success Criteria:** ✅ Trial period is 7 days, Outbound features work, email limit tracked correctly

---

### Test 5: Outbound Sales Pro ($59.99/month)
**Product ID:** `outbound_sales_pro`
**Expected Trial:** 7 days
**Monthly Email Limit:** 2,500
**Expected Outcome:** Outbound welcome email (NO widget instructions)

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Click "Get Started" on Outbound Pro card
3. [ ] Complete Stripe checkout with test card
4. [ ] Verify all steps from Test 4 above
5. [ ] Verify email limit shows 2,500 instead of 750
6. [ ] Test sending multiple emails (5-10) to verify limit tracking

**Success Criteria:** ✅ 7-day trial, higher email limit (2,500), all Outbound features work

---

## 🔒 Security & Limits Testing

### Test 6: Outbound Email Limits Enforcement
**Purpose:** Verify monthly email limits are enforced correctly

**Steps:**
1. [ ] Using Outbound Starter test account from Test 4
2. [ ] Manually update `outbound_email_logs` to simulate 749 emails sent this month:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO outbound_email_logs (user_id, customer_id, campaign_id, status, sent_at)
   SELECT
     '<your_test_user_id>',
     '<your_test_customer_id>',
     gen_random_uuid(),
     'sent',
     NOW()
   FROM generate_series(1, 749);
   ```
3. [ ] Attempt to send 1 more email (should succeed - at 750 limit)
4. [ ] Attempt to send another email (should FAIL with 429 error)
5. [ ] Verify error message shows: "Monthly email limit reached"
6. [ ] Check response includes: limit, sent count, product_id

**Success Criteria:** ✅ Limit enforced at exactly 750, clear error message returned

---

### Test 7: Trial Status Email Sending
**Purpose:** Verify 'trialing' status allows email sending

**Steps:**
1. [ ] Using Outbound Pro test account from Test 5
2. [ ] Verify `user_products.status` = 'trialing'
3. [ ] Attempt to send test email
4. [ ] Verify email sends successfully (no "subscription required" error)
5. [ ] Check `send-outbound-email` function accepts both 'active' and 'trialing' status

**Success Criteria:** ✅ Trial users can send emails without restrictions (until limit reached)

---

### Test 8: Tenant Isolation
**Purpose:** Verify users cannot access other customers' data

**Steps:**
1. [ ] Create two test Outbound accounts with different customer_ids
2. [ ] User A creates a campaign and prospects
3. [ ] Attempt to send email using User A's auth token but User B's prospect_id
4. [ ] Verify request fails with "Tenant isolation violation" error (403)
5. [ ] Check `send-outbound-email` function line 88-100 for customer_id validation

**Success Criteria:** ✅ Cross-tenant access blocked, appropriate error returned

---

## 👑 Admin Panel Testing

### Test 9: Admin Access Control
**Purpose:** Verify admin panel is only accessible to admins

**Steps:**
1. [ ] Set `is_admin: true` in Supabase for your test admin account:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
   WHERE email = 'your-admin-email@example.com';
   ```
2. [ ] Log into monumentum.ai with admin account
3. [ ] Verify purple "Admin" button appears in navigation
4. [ ] Click Admin button - should navigate to /admin
5. [ ] Log out and log in with regular user account
6. [ ] Verify Admin button does NOT appear
7. [ ] Manually navigate to /admin - should redirect to home

**Success Criteria:** ✅ Admin button visible only to admins, route protected

---

### Test 10: Admin Dashboard - Platform Stats
**Purpose:** Verify platform health metrics display correctly

**Steps:**
1. [ ] Access admin panel at /admin
2. [ ] Verify Dashboard shows 4 metric cards:
   - [ ] Total Users (should match count in `business_profiles` table)
   - [ ] Active Subscriptions (should match 'active' status in `user_products`)
   - [ ] Monthly Revenue (should calculate from product pricing × active products)
   - [ ] Emails Sent (30d) (should match sent emails in `outbound_email_logs`)
3. [ ] Verify "Recent Activity" section shows admin audit log entries
4. [ ] Check that activity log shows most recent actions first
5. [ ] Verify action badges have correct colors (block=red, approve=green, etc.)

**Success Criteria:** ✅ All metrics accurate, audit log displays recent admin actions

---

### Test 11: Admin User Management
**Purpose:** Verify admin can view and manage users

**Steps:**
1. [ ] Navigate to /admin/users
2. [ ] Verify user list displays all registered users
3. [ ] Check each user shows:
   - [ ] Email address
   - [ ] Business name
   - [ ] Customer ID
   - [ ] Subscription product and status
   - [ ] Created date
4. [ ] Test "Block User" action on test account
5. [ ] Verify user status updates in table
6. [ ] Test "Unblock User" action
7. [ ] Verify audit log entry created for both actions
8. [ ] Check blocked user cannot log in (test this)

**Success Criteria:** ✅ User list accurate, block/unblock works, audit trail created

---

### Test 12: Admin Subscription Management
**Purpose:** Verify admin can manage user subscriptions

**Steps:**
1. [ ] From /admin/users, select a test user
2. [ ] Test "Pause Subscription" action
3. [ ] Verify `user_products.status` changes to 'paused'
4. [ ] Test user cannot access Outbound features while paused
5. [ ] Test "Resume Subscription" action
6. [ ] Verify status changes back to 'active'
7. [ ] Test "Change Product" action (e.g., Starter → Pro)
8. [ ] Verify `product_id` updates in `user_products`
9. [ ] Verify email limits update accordingly
10. [ ] Test "Cancel Subscription" action
11. [ ] Verify status = 'canceled' and user access revoked

**Success Criteria:** ✅ All subscription actions work, user access changes accordingly, audit log tracks changes

---

### Test 13: Admin Audit Log
**Purpose:** Verify all admin actions are logged

**Steps:**
1. [ ] Navigate to /admin/audit
2. [ ] Perform several admin actions (block user, pause subscription, etc.)
3. [ ] Refresh audit log page
4. [ ] Verify all actions appear in chronological order
5. [ ] Check each log entry shows:
   - [ ] Admin email who performed action
   - [ ] Action type (block, pause, resume, etc.)
   - [ ] Resource type (user, user_product, etc.)
   - [ ] Resource ID
   - [ ] Before/after state (in changes field)
   - [ ] Timestamp
6. [ ] Verify filtering and search work (if implemented)

**Success Criteria:** ✅ Complete audit trail, all actions logged with full context

---

## 📧 Email & Integration Testing

### Test 14: Welcome Email Content
**Purpose:** Verify correct welcome emails sent for each product type

**Inbound Products (Sales, Service, Integrated):**
- [ ] Email subject: "Welcome to Monumentum!"
- [ ] Email contains widget installation instructions
- [ ] Email includes embeddable code snippet
- [ ] Email mentions trial period (30 days)
- [ ] Email has link to portal/dashboard

**Outbound Products (Starter, Pro):**
- [ ] Email subject: "Welcome to Monumentum Outbound!"
- [ ] Email does NOT contain widget instructions
- [ ] Email mentions 7-day trial period
- [ ] Email explains prospect generation and approval workflow
- [ ] Email includes link to Outbound section in portal

**Success Criteria:** ✅ Correct email template used for each product type

---

### Test 15: Stripe Trial to Active Conversion
**Purpose:** Verify Stripe automatically converts trial to active

**Steps:**
1. [ ] Create test subscription with 7-day trial
2. [ ] Note the `trial_ends_at` date in `user_products`
3. [ ] Use Stripe Dashboard to manually advance trial end date:
   - Go to Stripe Dashboard → Customers → Find test customer
   - Click subscription → "Update subscription"
   - Change trial end date to "Now"
4. [ ] Wait for Stripe webhook to fire
5. [ ] Check `user_products.status` updated to 'active'
6. [ ] Verify user still has full access to features
7. [ ] Verify billing starts (check Stripe invoice created)

**Success Criteria:** ✅ Stripe handles conversion automatically, no manual intervention needed

---

### Test 16: Outbound Email Sending (AWS SES)
**Purpose:** Verify emails send correctly via AWS SES

**Steps:**
1. [ ] Using Outbound test account, create campaign
2. [ ] Generate 3 test prospects with different email addresses
3. [ ] Approve all prospects
4. [ ] Click "Send Email" on first prospect
5. [ ] Verify success response returned
6. [ ] Check `outbound_email_logs` for entry:
   - [ ] status = 'sent'
   - [ ] message_id present (from SES)
   - [ ] sent_at timestamp recorded
7. [ ] Check recipient email inbox for message
8. [ ] Verify email shows:
   - [ ] From: "Sender Name via Monumentum <sales@monumentum.ai>"
   - [ ] Reply-To: user's actual email
   - [ ] Subject: prospect's draft_subject
   - [ ] Body: prospect's draft_message + signature
   - [ ] Tracking pixel embedded (1x1 image)
9. [ ] Reply to email and verify it goes to user's Reply-To address

**Success Criteria:** ✅ Email delivers successfully, tracking pixel present, reply-to works

---

## 🔄 Database & Integration Checks

### Test 17: user_products Table Validation
**Purpose:** Verify all products correctly populate user_products

**Steps:**
1. [ ] After completing all signup tests (Tests 1-5), query `user_products`:
   ```sql
   SELECT
     user_id,
     product_id,
     product_name,
     status,
     stripe_subscription_id,
     trial_ends_at,
     created_at
   FROM user_products
   ORDER BY created_at DESC;
   ```
2. [ ] Verify each test signup created correct entry
3. [ ] Check NO entries exist in old `subscriptions` table (if it exists)
4. [ ] Verify `product_id` matches expected values:
   - 'inbound_sales_agent'
   - 'customer_service_agent'
   - 'integrated_agent'
   - 'outbound_sales_starter'
   - 'outbound_sales_pro'
5. [ ] Verify `product_name` is human-readable
6. [ ] Verify `stripe_subscription_id` populated from Stripe webhook

**Success Criteria:** ✅ Single source of truth (user_products only), all fields populated correctly

---

### Test 18: n8n Webhook Processing
**Purpose:** Verify n8n correctly provisions all product types

**Steps:**
1. [ ] Access n8n at your n8n instance URL
2. [ ] Open "Onboarding Provision Agent Final X copy (5)" workflow
3. [ ] Check execution history for recent runs
4. [ ] For each product signup test:
   - [ ] Verify webhook received from Stripe
   - [ ] Verify "Check Stripe and Extract Fields" node extracted correct data
   - [ ] Verify IF node correctly routed Outbound vs Inbound products
   - [ ] Verify HTTP POST to Supabase inserted correct data
   - [ ] Verify welcome email node executed with correct template
5. [ ] Check for any failed executions
6. [ ] Review error logs if any failures occurred

**Success Criteria:** ✅ All product types correctly routed, no failed executions

---

## 🎨 Frontend Display Testing

### Test 19: Pricing Page Display
**Purpose:** Verify pricing page shows correct information

**Steps:**
1. [ ] Navigate to https://monumentum.ai/pricing
2. [ ] Verify 6 product cards display:
   - [ ] Inbound Sales Agent - $9.99/mo
   - [ ] Customer Service Agent - $12.99/mo
   - [ ] Integrated Agent - $15.99/mo
   - [ ] Outbound Starter - $39.99/mo - "7-day trial"
   - [ ] Outbound Pro - $59.99/mo - "7-day trial"
   - [ ] Outbound Enterprise - "Contact Us"
3. [ ] Verify trial period badges show correctly
4. [ ] Verify feature lists accurate
5. [ ] Click each "Get Started" button - should go to Stripe checkout
6. [ ] Verify Stripe checkout pre-fills with correct product/price

**Success Criteria:** ✅ All products display correctly, trial periods accurate, checkout links work

---

### Test 20: User Portal Access
**Purpose:** Verify users can access their purchased products

**Steps:**
1. [ ] Log in with each test account created in Tests 1-5
2. [ ] For Inbound products:
   - [ ] Verify "Inbound" section visible
   - [ ] Verify widget code accessible
   - [ ] Test widget customization options
3. [ ] For Outbound products:
   - [ ] Verify "Outbound" section visible
   - [ ] Verify "Campaigns" page accessible
   - [ ] Verify "Prospects" page accessible
   - [ ] Test campaign creation
   - [ ] Test prospect generation
4. [ ] Verify subscription details show correct:
   - [ ] Product name
   - [ ] Price
   - [ ] Trial end date (if applicable)
   - [ ] Next billing date

**Success Criteria:** ✅ Users can access all features for their product tier

---

## 📊 Final Validation Checklist

### Database Integrity
- [ ] All test signups have entries in `user_products`
- [ ] No orphaned entries in old tables
- [ ] All customer_ids match between tables
- [ ] All stripe_subscription_ids valid

### Email Delivery
- [ ] All welcome emails received
- [ ] Correct template used for each product
- [ ] No broken links in emails
- [ ] Unsubscribe links work (if applicable)

### Access Control
- [ ] Admin panel only accessible to admins
- [ ] Tenant isolation working (users can't see others' data)
- [ ] Product features gated correctly by subscription

### Monitoring & Logging
- [ ] Admin audit log captures all actions
- [ ] Outbound email logs tracking correctly
- [ ] Error logs available in Supabase Edge Function logs
- [ ] Stripe webhook logs show successful processing

### Performance
- [ ] Page load times acceptable (<3s)
- [ ] Admin dashboard loads without errors
- [ ] Email sending completes in reasonable time
- [ ] Database queries optimized (check slow query log)

---

## 🐛 Known Issues to Monitor

**Potential Issues:**
1. Cloudflare Pages caching may require hard refresh (Ctrl+Shift+R)
2. Stripe test mode webhooks may have delays (up to 5 min)
3. AWS SES emails may land in spam (check spam folder)
4. n8n webhook timeout if execution takes >30s

**Troubleshooting:**
- Check Supabase Edge Function logs for errors
- Review n8n execution history for failed workflows
- Verify Stripe webhook delivery in Stripe Dashboard → Developers → Webhooks
- Check AWS SES sending statistics for bounces/complaints

---

## 📝 Test Results Summary

**Date Tested:** _________________
**Tested By:** _________________
**Total Tests:** 20
**Tests Passed:** _____ / 20
**Tests Failed:** _____ / 20

**Critical Issues Found:**
- _____________________________________
- _____________________________________
- _____________________________________

**Minor Issues Found:**
- _____________________________________
- _____________________________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## ✅ Sign-Off

**Ready for Production:** [ ] Yes [ ] No

**Signatures:**
- **Developer:** _____________________ Date: _______
- **QA/Tester:** _____________________ Date: _______
- **Product Owner:** _________________ Date: _______

---

*This checklist covers the complete Monumentum platform including all product signup flows, admin panel functionality, email integrations, and security features implemented as of January 7, 2026.*
