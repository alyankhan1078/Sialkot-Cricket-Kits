-- Migration: Add Policy Agreement columns to orders table
-- Version: 1.0 Policy Agreement

ALTER TABLE orders ADD COLUMN IF NOT EXISTS policies_accepted BOOLEAN DEFAULT true;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS policy_version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS policy_accepted_at TIMESTAMPTZ;
