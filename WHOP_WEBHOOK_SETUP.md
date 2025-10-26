# 🔗 Whop Webhook Integration Guide

This guide will help you set up Whop webhooks with your TidyGuru SaaS app to handle subscription payments.

## 📋 Overview

Instead of building a native Whop App, we're using **Whop for payments only** via webhooks. Your beautiful SaaS app stays exactly as it is!

## 🛠️ Setup Steps

### Step 1: Deploy the Webhook Endpoint

#### Option A: Using Supabase Edge Functions (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`

4. **Set environment variables**:
   ```bash
   supabase secrets set WHOP_WEBHOOK_SECRET="your_whop_webhook_secret"
   ```
   
   Get your webhook secret from: Whop Developer Dashboard > Your App > Webhooks

5. **Deploy the webhook function**:
   ```bash
   supabase functions deploy whop-webhook
   ```

6. **Get your webhook URL**:
   Your webhook URL will be:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/whop-webhook
   ```

#### Option B: Using Netlify Functions

If you're deploying to Netlify, create:

**File: `netlify/functions/whop-webhook.ts`**

```typescript
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const signature = event.headers['x-whop-signature'];
    if (!signature) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No signature' }) };
    }

    // Verify signature (implement crypto verification)
    // ... (similar logic to Supabase function)

    const payload = JSON.parse(event.body || '{}');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle webhook events
    // ... (similar logic to Supabase function)

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};
```

Then add to **netlify.toml**:
```toml
[build]
  functions = "netlify/functions"
```

### Step 2: Configure Whop Webhooks

1. **Go to Whop Developer Dashboard**:
   https://whop.com/developers

2. **Select your TidyGuru app**

3. **Navigate to "Webhooks" section**

4. **Add new webhook**:
   - **URL**: Your webhook endpoint (from Step 1)
   - **Events to subscribe**:
     - ✅ `membership.went_valid` (user subscribed)
     - ✅ `membership.renewed` (subscription renewed)
     - ✅ `membership.went_invalid` (subscription expired)
     - ✅ `membership.cancelled` (user cancelled)

5. **Save webhook secret**: Copy the secret and save it in your environment variables

### Step 3: Update Environment Variables

Add to your `.env.local`:

```bash
# Whop Configuration
VITE_WHOP_PRODUCT_ID="prod_xxxxx"
VITE_WHOP_COMPANY_ID="biz_xxxxx"
WHOP_API_KEY="your_api_key"
WHOP_WEBHOOK_SECRET="your_webhook_secret"

# Supabase (if using Supabase functions)
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Step 4: Update Subscription Flow

The subscription flow is already set up in your app:

1. **User clicks "Subscribe"** → Redirected to Whop checkout
2. **User completes payment on Whop**
3. **Whop sends webhook** → Your endpoint processes it
4. **Subscription created in Supabase** → User gets access
5. **User returns to app** → Sees dashboard (subscription verified)

### Step 5: Test the Integration

1. **Test mode**: Enable test mode in Whop Developer Dashboard

2. **Create test subscription**:
   - Go to your app's dashboard
   - Click "Subscribe Now"
   - Complete checkout with test card: `4242 4242 4242 4242`

3. **Verify webhook received**:
   - Check Supabase logs: `supabase functions logs whop-webhook`
   - Check Whop Developer Dashboard > Webhooks > Logs

4. **Verify database**:
   ```sql
   SELECT * FROM user_subscriptions;
   ```

## 🔍 Troubleshooting

### Webhook not receiving events

1. **Check webhook URL is correct** in Whop dashboard
2. **Verify webhook secret** matches in environment
3. **Check function logs**:
   ```bash
   supabase functions logs whop-webhook --tail
   ```

### Signature verification failing

- Ensure `WHOP_WEBHOOK_SECRET` is set correctly
- Check you're using the raw request body (not parsed JSON)

### Subscription not updating in database

1. **Check Supabase RLS policies** - webhook uses service role so should bypass RLS
2. **Verify table schema** matches the code
3. **Check function logs** for errors

## 🎯 What Gets Stored

When a webhook is received, we store:

```typescript
{
  user_id: string;              // Supabase user ID
  whop_user_id: string;         // Whop user ID
  whop_membership_id: string;   // Whop membership ID
  product_id: string;           // Your Whop product ID
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  current_period_end: string;   // When subscription renews/ends
  created_at: string;
  updated_at: string;
}
```

## 🚀 Going Live

1. **Switch to production mode** in Whop dashboard
2. **Update webhook URL** to your production URL
3. **Set production API keys** in environment variables
4. **Test with real payment**
5. **Monitor webhook logs** for first few transactions

## 📧 Support

If you run into issues:
- Check Whop webhook logs: Developer Dashboard > Webhooks > Logs
- Check Supabase function logs: `supabase functions logs whop-webhook`
- Verify Whop API key has correct permissions

---

**Next Steps**: Deploy your webhook endpoint and configure Whop webhooks!

