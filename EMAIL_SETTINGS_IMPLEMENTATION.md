# Email Settings Implementation (SaaS Model)

## Overview
Added email configuration to campaigns using a SaaS model where Monumentum handles all email infrastructure. Users simply configure their sender name and reply-to address - no AWS setup required.

## SaaS Email Architecture

**How it works:**
- Emails are sent FROM: `"Sender Name" via Monumentum <hello@monumentum.com>`
- Replies are routed TO: User's specified reply-to email
- Monumentum manages all AWS SES infrastructure
- Users don't need to verify domains or configure AWS
- Professional appearance with automatic reply routing

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20251224000000_add_campaign_email_settings.sql`

Added the following columns to `outbound_campaigns`:
- `sender_name` - Name that appears in "From" field (e.g., "John Smith")
- `reply_to_email` - Email address where prospect replies should go (user's email)
- `calendar_link` - Optional meeting booking link (Calendly, Cal.com, etc.)
- `email_signature` - Optional signature to append to all emails

### 2. TypeScript Types
**File:** `src/lib/outbound.ts`

Updated `OutboundCampaign` interface to include email settings fields.

### 3. UI Changes
**File:** `src/components/outbound/CampaignManager.tsx`

#### Simplified Email Settings Section:
- **Sender Name** (Required) - Name displayed in "From" field
- **Reply-To Email** (Required) - Where prospect replies are routed
- **Calendar Link** (Optional) - Calendly/Cal.com URL for easy meeting booking
- **Email Signature** (Optional) - Appended to all campaign emails

#### Auto-Population Logic:
- For new campaigns, automatically populates:
  - `sender_name` from `business_profiles.business_name`
  - `reply_to_email` from `business_profiles.business_email` or user's auth email
- For existing campaigns, shows saved values

#### UI Messaging:
- Shows preview: `"Sender Name" via Monumentum <hello@monumentum.com>`
- Clarifies that emails are sent via Monumentum infrastructure
- Explains replies go directly to user's inbox

## How It Works (SaaS Model)

### Email Flow:
1. **From Field**: `"John Smith" via Monumentum <hello@monumentum.com>`
2. **Reply-To Header**: Set to user's `reply_to_email`
3. **When prospect replies**: Email goes directly to user's inbox
4. **Infrastructure**: Monumentum manages all AWS SES, deliverability, and reputation

### Benefits of SaaS Model:
- **No AWS Setup**: Users don't need AWS accounts or SES configuration
- **Instant Setup**: Works immediately after signup
- **Professional Appearance**: Branded "via Monumentum" sender
- **Reliable Deliverability**: Monumentum maintains email reputation
- **Direct Replies**: Prospects reply directly to user's email
- **Simplified UX**: Just 2 required fields instead of complex email setup

### Example Configuration:

```text
Sender Name: "Sarah Johnson"
Reply-To Email: "sarah@acme.com"
Calendar Link: "https://calendly.com/sarah-acme"

Result:
FROM: "Sarah Johnson" via Monumentum <hello@monumentum.com>
REPLY-TO: sarah@acme.com

When prospect replies → Goes to sarah@acme.com
When prospect clicks calendar link → Books on Sarah's Calendly
```

## Next Steps for Full Implementation

### 1. Update n8n AI Prompt Workflow
The Claude AI prompt in the n8n workflow needs to be updated to:
- Include calendar link when generating emails (if provided)
- Append email signature to generated messages
- Use sender_name in email personalization

**Files to update:**
- `n8n-flows/Generate_Prospects_From_ICP_PAID.json`
- `n8n-flows/Generate_Prospects_From_ICP.json`

**Example prompt addition:**
```javascript
let calendarSection = '';
if (campaign.calendar_link) {
  calendarSection = `\\n\\nIf interested, book time on my calendar: ${campaign.calendar_link}`;
}

let signature = campaign.email_signature || '';
if (signature) {
  signature = `\\n\\n${signature}`;
}
```

### 2. Update Email Sending in AWS SES
When implementing actual email sending (Path A: Email Sending via SES):

```javascript
// Send email using Monumentum's AWS SES account
await sesClient.send(new SendEmailCommand({
  Source: `"${campaign.sender_name}" via Monumentum <hello@monumentum.com>`,
  Destination: {
    ToAddresses: [prospect.prospect_email]
  },
  ReplyToAddresses: [campaign.reply_to_email],
  Message: {
    Subject: { Data: prospect.edited_subject || prospect.draft_subject },
    Body: {
      Html: {
        Data: `${prospect.edited_message || prospect.draft_message}${signature}`
      }
    }
  }
}));
```

**Key Points:**
- `Source` uses Monumentum's verified domain `hello@monumentum.com`
- Sender name personalized with campaign's `sender_name`
- `ReplyToAddresses` routes responses to user's email
- No user email verification needed

### 3. Validation
Add validation to ensure:
- `reply_to_email` is a valid email format
- `calendar_link` is a valid URL (if provided)
- All required fields (`sender_name`, `reply_to_email`) are filled before generating prospects
- Rate limits enforced based on subscription tier

## Benefits

✅ **Zero Configuration**: No AWS setup, SES verification, or DNS configuration required
✅ **Instant Activation**: Users can send emails immediately after signup
✅ **Professional Appearance**: Branded "via Monumentum" sender builds trust
✅ **Direct Reply Routing**: Prospect replies go straight to user's inbox
✅ **Managed Infrastructure**: Monumentum handles deliverability, reputation, and compliance
✅ **Easy Booking**: Optional calendar links reduce friction for prospect meetings
✅ **Professional Signatures**: Consistent branding across all campaign emails
✅ **Simple UX**: Just 2 required fields (sender name + reply-to email)
✅ **User-Friendly**: Auto-populates from existing profile data

## Security Considerations

- **Monumentum-Managed Sending**: Only Monumentum's verified domain sends emails (prevents spoofing)
- **Reply-To Validation**: Ensures replies don't go to invalid addresses
- **URL Validation**: Calendar links must be valid URLs
- **User Isolation**: RLS policies ensure users can only modify their own campaigns
- **Rate Limiting**: Enforced per subscription tier to prevent abuse
- **Content Moderation**: Review system ensures quality before sending
