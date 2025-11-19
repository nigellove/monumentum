# Supabase Email Configuration

## Current Issues
1. Password reset emails look like spam (plain text, no branding)
2. Password reset links redirect to localhost instead of your Netlify URL

## ✅ Fixes Applied

### 1. Code Changes
- **SignIn.tsx**: Updated password reset redirect to use your production domain
- **Stripe Checkout**: Updated success/cancel URLs to use production domain
- OAuth redirects now use `window.location.origin` (works in both dev and production)

---

## 🔧 Supabase Dashboard Configuration Required

### Step 1: Update Site URL in Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/nkwmfqbuhvtloihbrwef
2. Navigate to **Authentication** → **URL Configuration**
3. Update these settings:
   - **Site URL**: `https://monumentum.netlify.app`
   - **Redirect URLs**: Add `https://monumentum.netlify.app/**`

### Step 2: Customize Email Templates

1. Go to **Authentication** → **Email Templates**
2. You'll see templates for:
   - Confirm signup
   - Invite user
   - Magic Link
   - **Reset Password** ← This is the one you need to fix
   - Email change

3. Click on **Reset Password** template

4. Replace the default template with a branded version:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Monumentum</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Monumentum</h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 14px;">AI Business Solutions</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; padding: 12px; background-color: #f1f5f9; border-radius: 6px; word-break: break-all; font-size: 13px; color: #475569;">
                {{ .ConfirmationURL }}
              </p>

              <p style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; line-height: 1.6;">
                <strong>Didn't request this?</strong><br>
                If you didn't request a password reset, you can safely ignore this email. Your password won't change.
              </p>

              <p style="margin: 15px 0 0; color: #94a3b8; font-size: 13px;">
                This link expires in 1 hour.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                © 2024 Monumentum. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #94a3b8; font-size: 12px;">
                If you have questions, reply to this email or contact support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

5. **Important**: Update the Subject line to: `Reset your Monumentum password`

6. Click **Save** at the bottom

### Step 3: Test the Email

1. Go to your sign-in page
2. Try to sign in with wrong password
3. Click "Forgot Password?"
4. Enter your email
5. Check your email - it should now be branded and beautiful!

---

## 📧 Other Email Templates to Customize

You should also customize these templates for a professional look:

### Confirm Signup Email
Used when users first register. Should welcome them and confirm their email.

### Magic Link Email
If you ever enable magic link login, this is the email users receive.

---

## 🎨 Customization Tips

1. **Use your logo**: Upload your logo to a CDN and replace the text header with an `<img>` tag
2. **Match your brand colors**: Update the gradient colors to match your brand
3. **Add social links**: Include footer links to your social media
4. **Update sender name**: In Email Settings, change the sender name from "Supabase" to "Monumentum"

---

## 🔒 Security Notes

- The `{{ .ConfirmationURL }}` variable is automatically populated by Supabase with a secure token
- Links expire in 1 hour by default (configurable in Auth settings)
- The redirect URL is now correctly set to your production domain

---

## Testing Checklist

- [ ] Update Site URL in Supabase Dashboard
- [ ] Add redirect URLs for production domain
- [ ] Customize password reset email template
- [ ] Update email subject line
- [ ] Test password reset flow
- [ ] Verify email doesn't look like spam
- [ ] Confirm link redirects to production site (not localhost)
- [ ] Optional: Customize other email templates
- [ ] Optional: Update sender name and email in settings
