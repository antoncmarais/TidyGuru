-- Create pending_subscriptions table for subscriptions purchased before user signs up
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whop_user_id TEXT NOT NULL,
  whop_membership_id TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes for quick lookups
  CONSTRAINT unique_whop_membership_id UNIQUE (whop_membership_id)
);

-- Create index for faster lookups by whop_user_id
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_whop_user_id 
ON pending_subscriptions(whop_user_id);

-- Create index for faster lookups by whop_membership_id
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_whop_membership_id 
ON pending_subscriptions(whop_membership_id);

-- Enable RLS
ALTER TABLE pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role can do anything (for webhooks)
CREATE POLICY "Service role has full access to pending_subscriptions"
ON pending_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: Regular users don't need direct access to this table
-- It's only used by webhooks and backend processes

