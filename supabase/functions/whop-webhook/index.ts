// Supabase Edge Function for Whop Webhooks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const WHOP_WEBHOOK_SECRET = Deno.env.get("WHOP_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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

async function verifyWhopSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WHOP_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = hexToBuffer(signature);
    const dataBuffer = encoder.encode(payload);

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      dataBuffer
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Whop-Signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get the signature from headers
    const signature = req.headers.get("x-whop-signature");
    if (!signature) {
      console.error("No signature provided");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get raw payload
    const rawPayload = await req.text();

    // Verify signature
    const isValid = await verifyWhopSignature(rawPayload, signature);
    if (!isValid) {
      console.error("Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse event
    const event: WhopWebhookEvent = JSON.parse(rawPayload);
    console.log("Received Whop event:", event.action);

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different event types
    switch (event.action) {
      case "membership.went_valid":
      case "membership.renewed":
        // User subscribed or renewed
        await handleMembershipActivated(supabase, event.data);
        break;

      case "membership.went_invalid":
      case "membership.cancelled":
        // User cancelled or subscription expired
        await handleMembershipDeactivated(supabase, event.data);
        break;

      default:
        console.log("Unhandled event type:", event.action);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

async function handleMembershipActivated(supabase: any, data: any) {
  try {
    // Get the user's email from Whop metadata or use Whop user ID
    const userEmail = data.metadata?.email;
    const whopUserId = data.user;
    const membershipId = data.id;

    console.log("Activating membership for:", { userEmail, whopUserId, membershipId });

    // Find the Supabase user by email if provided
    let supabaseUserId = null;
    if (userEmail) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      if (!userError && userData?.users) {
        const matchedUser = userData.users.find((u: any) => u.email === userEmail);
        if (matchedUser) {
          supabaseUserId = matchedUser.id;
        }
      }
    }

    if (!supabaseUserId) {
      console.log("No matching Supabase user found, storing with Whop user ID only");
      // You might want to create a pending subscription record here
      return;
    }

    // Create or update subscription
    const { error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: supabaseUserId,
        whop_user_id: whopUserId,
        whop_membership_id: membershipId,
        product_id: data.product,
        status: data.status === "trialing" ? "trialing" : "active",
        current_period_end: data.renewal_period_end
          ? new Date(data.renewal_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Error upserting subscription:", error);
      throw error;
    }

    console.log("Subscription activated successfully");
  } catch (error) {
    console.error("Error in handleMembershipActivated:", error);
    throw error;
  }
}

async function handleMembershipDeactivated(supabase: any, data: any) {
  try {
    const membershipId = data.id;
    console.log("Deactivating membership:", membershipId);

    // Update subscription status
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("whop_membership_id", membershipId);

    if (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }

    console.log("Subscription deactivated successfully");
  } catch (error) {
    console.error("Error in handleMembershipDeactivated:", error);
    throw error;
  }
}

