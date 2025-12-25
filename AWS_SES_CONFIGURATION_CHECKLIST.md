# AWS SES Configuration Checklist

## ✅ Completed Steps

- [x] Created Edge Functions (send-outbound-email, track-email-open)
- [x] Created database migrations (email_logs, prospect_tracking, RLS fix)
- [x] Deployed Edge Functions to Supabase
- [x] Committed all code to git

## 🔄 Next Steps

### 1. Set Supabase Edge Function Secrets

Go to: https://supabase.com/dashboard/project/nkwmfqbuhvtloihbrwef/settings/functions

Add these secrets:
```
AWS_ACCESS_KEY_ID=[your AWS access key from IAM user]
AWS_SECRET_ACCESS_KEY=[your AWS secret key from IAM user]
AWS_REGION=us-east-1
```

**⚠️ IMPORTANT:** Don't add these to the `.env` file - they should only exist in Supabase Edge Function secrets.

---

### 2. Create IAM User for Supabase (if not done)

1. Go to AWS Console → IAM → Users → Add users
2. Username: `monumentum-ses-supabase`
3. Select: "Access key - Programmatic access"
4. Attach policy: `AmazonSESFullAccess`
5. Create user and save credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

### 3. Verify Domain: monumentum.com

**In AWS SES Console:**

1. Go to: https://console.aws.amazon.com/ses/home?region=us-east-1#/verified-identities
2. Click "Create identity"
3. Select "Domain"
4. Enter: `monumentum.com`
5. ✅ Enable "DKIM signing"
6. Click "Create identity"
7. **Copy the DNS records** (you'll need these for step 5)

---

### 4. Verify Email: sales@monumentum.com

**In AWS SES Console:**

1. Click "Create identity" again
2. Select "Email address"
3. Enter: `sales@monumentum.com`
4. Click "Create identity"
5. Check your inbox (sales@monumentum.com)
6. Click the verification link from AWS

---

### 5. Add DNS Records

**Go to your DNS provider** (Cloudflare, Route53, etc.) and add these records:

#### A. DKIM Records (from AWS SES verification)
You'll get 3 CNAME records that look like:
```
Record 1:
Name: [random-string]._domainkey.monumentum.com
Type: CNAME
Value: [random-string].dkim.amazonses.com

Record 2:
Name: [random-string]._domainkey.monumentum.com
Type: CNAME
Value: [random-string].dkim.amazonses.com

Record 3:
Name: [random-string]._domainkey.monumentum.com
Type: CNAME
Value: [random-string].dkim.amazonses.com
```

#### B. SPF Record
```
Type: TXT
Name: monumentum.com (or @)
Value: v=spf1 include:amazonses.com ~all
```

**⚠️ Note:** If you already have an SPF record, append `include:amazonses.com` to it. You can only have ONE SPF record.

Example: `v=spf1 include:_spf.google.com include:amazonses.com ~all`

#### C. DMARC Record
```
Type: TXT
Name: _dmarc.monumentum.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@monumentum.com
```

#### D. Domain Verification (from AWS)
```
Type: TXT
Name: _amazonses.monumentum.com
Value: [verification token from AWS]
```

**Wait for DNS propagation** (5-30 minutes). You can check status in AWS SES Console.

---

### 6. Request Production Access

**⚠️ CRITICAL:** By default, AWS SES is in "Sandbox Mode" which limits you to:
- 200 emails/day
- Can only send to verified email addresses

To send to real prospects, you MUST request production access:

1. Go to: https://console.aws.amazon.com/ses/home?region=us-east-1#/account
2. Click "Request production access"
3. Fill out the form:
   - **Mail type:** Transactional
   - **Website URL:** https://monumentum.com
   - **Use case description:**
     ```
     Monumentum is a B2B SaaS platform that helps businesses automate
     outbound sales outreach. We send personalized sales emails on behalf
     of our customers to their prospects. All emails include clear
     unsubscribe mechanisms and comply with CAN-SPAM regulations.

     Estimated volume: 10,000-50,000 emails/month
     ```
   - **Compliance statement:**
     ```
     We maintain strict opt-out lists and honor all unsubscribe requests
     immediately. Each email includes an unsubscribe link. We do not
     purchase email lists and only send to business contacts that our
     customers have identified as relevant prospects.
     ```
4. Submit the request
5. **Wait for approval** (usually 24-48 hours, sometimes instant)

---

### 7. Test Email Sending

Once domain is verified and you're out of sandbox:

```bash
# Test the send-outbound-email function
curl -X POST https://nkwmfqbuhvtloihbrwef.supabase.co/functions/v1/send-outbound-email \
  -H "Authorization: Bearer [your-supabase-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "[test-prospect-uuid]",
    "campaign_id": "[test-campaign-uuid]",
    "user_id": "[your-user-uuid]"
  }'
```

**Check:**
1. Email arrives in prospect's inbox
2. From field shows: `"Sender Name" via Monumentum <sales@monumentum.com>`
3. Clicking Reply populates To: field with `reply_to_email` from campaign
4. Check email headers for SPF/DKIM/DMARC pass (use mail-tester.com)

---

## Verification Commands

### Check DNS Records
```bash
# Check DKIM
dig +short [random-string]._domainkey.monumentum.com CNAME

# Check SPF
dig +short monumentum.com TXT | grep spf

# Check DMARC
dig +short _dmarc.monumentum.com TXT

# Check domain verification
dig +short _amazonses.monumentum.com TXT
```

### Check AWS SES Status
```bash
aws ses get-identity-verification-attributes \
  --identities monumentum.com sales@monumentum.com \
  --region us-east-1
```

---

## Troubleshooting

### Domain not verifying
- Wait 30 minutes for DNS propagation
- Check DNS records are correct (no typos)
- Use `dig` commands above to verify

### Emails going to spam
- Ensure SPF, DKIM, DMARC are all passing
- Use https://www.mail-tester.com to check deliverability score
- Warm up your domain by starting with low volume

### Still in sandbox mode
- Check AWS SES dashboard for production access status
- If rejected, revise your use case and resubmit
- Can take 24-48 hours for approval

---

## Production Limits

Once approved for production access:

**Sending Limits:**
- Starts at: 200 emails/day, 1 email/second
- Increases automatically based on usage and reputation
- Can request limit increase via AWS Support

**Pricing:**
- First 62,000 emails/month: FREE (from Lambda/EC2)
- Otherwise: $0.10 per 1,000 emails
- Very affordable!

---

## Next Steps After AWS Setup

1. Build UI for sending emails in CampaignManager.tsx
2. Add email approval workflow (moderation)
3. Implement bounce/complaint handling
4. Add email analytics dashboard
5. Test end-to-end with real prospects
