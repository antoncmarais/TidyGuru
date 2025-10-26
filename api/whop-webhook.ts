import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface WhopWebhookEvent {
  action: string;
  data: {
    id: string;
    user: string;
    product: string;
    plan: string;
    status: string;
    valid: boolean;
    created_at: number;
    expires_at: number | null;
    renewal_period_start: number | null;
    renewal_period_end: number | null;
    metadata: Record<string, any>;
  };
}

// Disable automatic body parsing so we can verify signature
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

function verifyWhopSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get signature from headers
    const signature = req.headers['x-whop-signature'] as string;
    if (!signature) {
      console.error('No signature provided');
      return res.status(401).json({ error: 'No signature' });
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(req);

    // Verify signature
    if (WHOP_WEBHOOK_SECRET) {
      const isValid = verifyWhopSignature(rawBody, signature, WHOP_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid signature');
        console.error('Raw body length:', rawBody.length);
        console.error('Signature:', signature);
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else {
      console.warn('WHOP_WEBHOOK_SECRET not set - skipping signature verification');
    }

    // Parse event
    const event: WhopWebhookEvent = JSON.parse(rawBody);
    console.log('Received Whop event:', event.action, event.data.id);

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different event types
    switch (event.action) {
      case 'membership.went_valid':
      case 'membership.renewed':
        await handleMembershipActivated(supabase, event.data);
        break;

      case 'membership.went_invalid':
      case 'membership.cancelled':
        await handleMembershipDeactivated(supabase, event.data);
        break;

      default:
        console.log('Unhandled event type:', event.action);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleMembershipActivated(supabase: any, data: any) {
  try {
    const whopUserId = data.user;
    const membershipId = data.id;
    const userEmail = data.metadata?.email;

    console.log('Activating membership:', { membershipId, whopUserId, userEmail });

    // Try to find Supabase user by email if provided
    let supabaseUserId = null;
    if (userEmail) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (!error && users) {
        const matchedUser = users.find((u: any) => u.email === userEmail);
        if (matchedUser) {
          supabaseUserId = matchedUser.id;
        }
      }
    }

    // If no user found, try to find by whop_user_id
    if (!supabaseUserId) {
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('whop_user_id', whopUserId)
        .maybeSingle();

      if (existingSub) {
        supabaseUserId = existingSub.user_id;
      }
    }

    // If still no user, try to find by membership_id
    if (!supabaseUserId) {
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('whop_membership_id', membershipId)
        .maybeSingle();

      if (existingSub) {
        supabaseUserId = existingSub.user_id;
      }
    }

    if (!supabaseUserId) {
      console.log('No matching Supabase user found - will activate when user logs in');
      // Store orphaned subscription that will be claimed when user logs in
      const { error } = await supabase
        .from('pending_subscriptions')
        .upsert({
          whop_user_id: whopUserId,
          whop_membership_id: membershipId,
          product_id: data.product,
          status: data.status === 'trialing' ? 'trialing' : 'active',
          current_period_end: data.renewal_period_end
            ? new Date(data.renewal_period_end * 1000).toISOString()
            : null,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'whop_membership_id',
        });

      if (error) console.error('Error storing pending subscription:', error);
      return;
    }

    // Create or update subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: supabaseUserId,
        whop_user_id: whopUserId,
        whop_membership_id: membershipId,
        product_id: data.product,
        status: data.status === 'trialing' ? 'trialing' : 'active',
        current_period_end: data.renewal_period_end
          ? new Date(data.renewal_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error upserting subscription:', error);
      throw error;
    }

    console.log('Subscription activated successfully');
  } catch (error) {
    console.error('Error in handleMembershipActivated:', error);
    throw error;
  }
}

async function handleMembershipDeactivated(supabase: any, data: any) {
  try {
    const membershipId = data.id;
    console.log('Deactivating membership:', membershipId);

    // Update subscription status
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('whop_membership_id', membershipId);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    console.log('Subscription deactivated successfully');
  } catch (error) {
    console.error('Error in handleMembershipDeactivated:', error);
    throw error;
  }
}

