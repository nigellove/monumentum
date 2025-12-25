# AWS SES Email Sending Setup

This document explains how to set up AWS SES for sending outbound sales emails via the Monumentum SaaS platform.

## Overview

Monumentum uses a **SaaS email model** where all outbound sales emails are sent from Monumentum's AWS SES infrastructure (`sales@monumentum.com`), but replies go directly to the user's inbox via the Reply-To header.

### Email Flow

1. **User configures campaign** with sender_name and reply_to_email
2. **Email is sent from:** `"Sender Name" via Monumentum <sales@monumentum.com>`
3. **Prospect sees:** User's name prominently in their inbox
4. **Prospect replies:** Email goes directly to user's reply_to_email address
5. **User receives reply:** In their normal inbox, no Monumentum infrastructure involved

## AWS SES Configuration

### 1. Verify the Domain `monumentum.com`

```bash
# In AWS SES Console:
# 1. Go to "Verified identities"
# 2. Click "Create identity"
# 3. Select "Domain"
# 4. Enter: monumentum.com
# 5. Enable DKIM signing
# 6. Copy the DKIM CNAME records
```

### 2. Add DNS Records

Add these records to your DNS provider (e.g., Cloudflare, Route53):

**DKIM Records** (3 CNAME records provided by AWS SES):
```
_amazonses.monumentum.com -> [AWS verification token]
[key1]._domainkey.monumentum.com -> [DKIM value 1]
[key2]._domainkey.monumentum.com -> [DKIM value 2]
[key3]._domainkey.monumentum.com -> [DKIM value 3]
```

**SPF Record** (TXT record):
```
v=spf1 include:amazonses.com ~all
```

**DMARC Record** (TXT record at _dmarc.monumentum.com):
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@monumentum.com
```

### 3. Verify Email Address `sales@monumentum.com`

```bash
# In AWS SES Console:
# 1. Go to "Verified identities"
# 2. Click "Create identity"
# 3. Select "Email address"
# 4. Enter: sales@monumentum.com
# 5. Check your inbox and click verification link
```

### 4. Request Production Access

By default, AWS SES starts in **Sandbox mode** (limited to 200 emails/day, can only send to verified addresses).

To send to real prospects:
```bash
# In AWS SES Console:
# 1. Go to "Account dashboard"
# 2. Click "Request production access"
# 3. Fill out the form:
#    - Mail type: Transactional
#    - Website URL: https://monumentum.com
#    - Use case: "Outbound sales emails for B2B SaaS platform"
#    - Compliance: Explain your opt-out mechanism
# 4. Submit and wait for approval (usually 24-48 hours)
```

### 5. Create IAM User for Supabase

```bash
# In AWS IAM Console:
# 1. Go to "Users" → "Add users"
# 2. Username: monumentum-ses-supabase
# 3. Select "Access key - Programmatic access"
# 4. Attach policy: AmazonSESFullAccess
# 5. Create user and save credentials:
#    - AWS_ACCESS_KEY_ID
#    - AWS_SECRET_ACCESS_KEY
```

## Supabase Edge Function Secrets

Set these secrets in your Supabase project:

```bash
# Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

## Database Migrations

Run these migrations in order:

```bash
# 1. Create email logs table
supabase/migrations/20251225000000_create_outbound_email_logs.sql

# 2. Add email tracking columns to prospects
supabase/migrations/20251225000001_add_prospect_email_tracking.sql
```

## Deploy Edge Functions

Deploy the email sending functions:

```bash
# Deploy send-outbound-email function
supabase functions deploy send-outbound-email

# Deploy email open tracking function
supabase functions deploy track-email-open
```

## Testing

### Test Email Send

```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-outbound-email \
  -H "Authorization: Bearer [your-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "uuid-here",
    "campaign_id": "uuid-here",
    "user_id": "uuid-here"
  }'
```

### Verify Email Deliverability

1. Send test email to yourself
2. Check inbox - should see: `"Your Name" via Monumentum <sales@monumentum.com>`
3. Click Reply - should populate To: field with your reply_to_email
4. Check email headers for SPF, DKIM, DMARC pass

## Daily Usage Limits

Limits are enforced in the `send-outbound-email` function:

- **Basic tier:** 50 emails/day
- **Pro tier:** 200 emails/day
- **Enterprise tier:** Unlimited (999,999/day)

Limits reset at midnight UTC.

## Email Tracking

### Open Tracking

Emails include a 1x1 transparent tracking pixel:
```html
<img src="https://[project].supabase.co/functions/v1/track-email-open?prospect_id=[id]" />
```

When loaded:
- Updates `outbound_email_logs.opened_at`
- Updates `outbound_prospects.engagement_level` to 'opened'

### Click Tracking

(To be implemented in Path C)

## Troubleshooting

### Email Goes to Spam

**Check:**
1. SPF record is correct
2. DKIM records are verified in AWS SES
3. DMARC policy is set
4. Domain has good reputation (use mail-tester.com)

### Email Not Sending

**Check:**
1. AWS SES is out of sandbox mode
2. `sales@monumentum.com` is verified
3. Supabase secrets are set correctly
4. Daily limit not exceeded (check `outbound_email_logs`)

### Bounces

AWS SES automatically handles bounces. Check:
```sql
SELECT * FROM outbound_email_logs WHERE status = 'bounced';
```

## Security Considerations

1. **Never commit AWS credentials** to git
2. **Use Supabase Edge Function secrets** for AWS keys
3. **Validate all inputs** in edge functions (already implemented)
4. **Rate limit** email sends per user (already implemented)
5. **Monitor for abuse** via email logs table

## Cost Estimation

AWS SES Pricing (as of 2025):
- **First 62,000 emails/month:** FREE (when sent from EC2, Lambda, or Elastic Beanstalk)
- **Otherwise:** $0.10 per 1,000 emails
- **Data transfer:** $0.12 per GB

For 10,000 emails/month:
- Outbound emails: $1.00
- AWS SES costs: ~$1-2/month

Very affordable for a SaaS platform!

## Next Steps

1. ✅ Deploy edge functions
2. ✅ Run database migrations
3. ✅ Set Supabase secrets
4. ⏳ Verify monumentum.com domain in AWS SES
5. ⏳ Verify sales@monumentum.com email in AWS SES
6. ⏳ Request production access
7. ⏳ Test email sending
8. ⏳ Build UI for sending emails (CampaignManager)
