import { supabase } from "@/lib/supabase";
import { config } from "@/config/env";

export interface UserSubscription {
  id: string;
  user_id: string;
  whop_user_id: string | null;
  whop_membership_id: string | null;
  product_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export const subscriptionService = {
  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  // Get user subscription details
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  },

  // Create or update subscription
  async upsertSubscription(subscriptionData: {
    whop_user_id?: string;
    whop_membership_id?: string;
    status: 'active' | 'cancelled' | 'expired' | 'trialing';
    current_period_end?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          product_id: config.whop.productId,
          ...subscriptionData,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error upserting subscription:', error);
      return false;
    }
  },

  // Verify Whop membership via API
  async verifyWhopMembership(membershipId: string): Promise<{ valid: boolean; data?: any }> {
    try {
      const response = await fetch(
        `https://api.whop.com/api/v5/memberships/${membershipId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.whop.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Whop API error:', response.statusText);
        return { valid: false };
      }

      const data = await response.json();
      
      // Check if membership is valid and for the correct product
      const isValid = data.valid === true && 
                      data.product === config.whop.productId &&
                      (data.status === 'active' || data.status === 'trialing');

      return { valid: isValid, data };
    } catch (error) {
      console.error('Error verifying Whop membership:', error);
      return { valid: false };
    }
  },

  // Get Whop checkout URL
  getCheckoutUrl(userEmail?: string): string {
    const baseUrl = `https://whop.com/${config.whop.companyId.replace('biz_', '')}`;
    
    // Try to get product from URL or fallback to direct product page
    const productUrl = `${baseUrl}/tidyguru-pro`;
    
    if (userEmail) {
      const params = new URLSearchParams({ email: userEmail });
      return `${productUrl}?${params.toString()}`;
    }
    
    return productUrl;
  },

  // Sync subscription from Whop
  async syncFromWhop(membershipId: string): Promise<boolean> {
    try {
      const { valid, data } = await this.verifyWhopMembership(membershipId);
      
      if (!valid || !data) {
        return false;
      }

      // Update or create subscription
      await this.upsertSubscription({
        whop_user_id: data.user,
        whop_membership_id: membershipId,
        status: data.status === 'trialing' ? 'trialing' : 'active',
        current_period_end: data.expires_at || data.renewal_period_end,
      });

      return true;
    } catch (error) {
      console.error('Error syncing from Whop:', error);
      return false;
    }
  },

  // Cancel subscription (mark as cancelled, actual cancellation happens on Whop)
  async cancelSubscription(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  },
};

