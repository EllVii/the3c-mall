-- Supabase Database Setup for Compliance
-- Run these SQL queries in your Supabase SQL editor to set up the required tables

-- ============================================
-- Waitlist & Beta Code Tracking (Reporting)
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  client_ip INET,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_timestamp ON waitlist(timestamp DESC);

-- Beta code usage attempts
CREATE TABLE IF NOT EXISTS beta_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  client_ip INET,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_attempts_code ON beta_attempts(code);
CREATE INDEX IF NOT EXISTS idx_beta_attempts_success ON beta_attempts(success);
CREATE INDEX IF NOT EXISTS idx_beta_attempts_timestamp ON beta_attempts(timestamp DESC);

-- ============================================
-- Email Consent Tracking (CAN-SPAM Compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS email_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  consent_status TEXT NOT NULL DEFAULT 'pending',
  -- pending: No consent recorded yet
  -- explicit_consent: User explicitly opted in
  -- implied_consent: Transactional emails only
  -- opted_out: User unsubscribed
  
  consents_marketing BOOLEAN DEFAULT FALSE,
  consents_promotional BOOLEAN DEFAULT FALSE,
  consents_transactional BOOLEAN DEFAULT TRUE,
  consents_account BOOLEAN DEFAULT TRUE,
  consents_security BOOLEAN DEFAULT TRUE,
  consents_waitlist BOOLEAN DEFAULT FALSE,
  
  consented_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_consents_email ON email_consents(email);
CREATE INDEX IF NOT EXISTS idx_email_consents_consent_status ON email_consents(consent_status);

-- ============================================
-- User Preferences (Data Management)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- User Activity (Audit Logging)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  -- search: product search
  -- view: page view
  -- save: saved recipe/item
  -- export: data export request
  -- delete: account deletion
  
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- ============================================
-- User Recipes (Data Portability)
-- ============================================
CREATE TABLE IF NOT EXISTS user_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipe_data JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);

-- ============================================
-- API Cache (Data Retention Limits)
-- ============================================
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  -- KROGER, WALMART, etc.
  
  cache_key TEXT NOT NULL,
  cache_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_cache_user_id ON api_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_api_cache_provider ON api_cache(provider);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Trigger to auto-delete expired cache entries
-- (Requires pg_cron extension or manual cleanup job)

-- ============================================
-- Audit Logs (Compliance Monitoring)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  -- API_REQUEST: API call tracked
  -- DATA_CACHED: Data stored with retention limit
  -- COMPLIANCE_VIOLATION: Rate limit/policy violation
  -- SECURITY_BREACH: Security incident
  -- ACCOUNT_DELETION: User account deleted
  -- BREACH_NOTIFIED: Breach notification sent
  
  provider TEXT,
  user_id UUID,
  details JSONB,
  severity TEXT DEFAULT 'info',
  -- info, warning, error, critical
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- API Usage Tracking (Rate Limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  provider TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  
  requests_today INTEGER DEFAULT 0,
  requests_this_hour INTEGER DEFAULT 0,
  requests_this_minute INTEGER DEFAULT 0,
  
  last_request_at TIMESTAMP WITH TIME ZONE,
  reset_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider_endpoint ON api_usage(provider, endpoint);

-- ============================================
-- Security Breaches (Incident Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id TEXT PRIMARY KEY,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_user_count INTEGER,
  severity TEXT NOT NULL,
  -- low, medium, high, critical
  
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  status TEXT NOT NULL DEFAULT 'PENDING_NOTIFICATION',
  notification_method TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_notification_deadline ON security_incidents(notification_deadline);

-- ============================================
-- Rights Management (Future Use)
-- ============================================
CREATE TABLE IF NOT EXISTS user_data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL,
  -- export: data export request
  -- deletion: account deletion request
  
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending: Awaiting verification
  -- verified: Email verified, ready to process
  -- processing: In progress
  -- completed: Finished
  -- failed: Error occurred
  
  verification_token TEXT UNIQUE,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_requests_user_id ON user_data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_requests_status ON user_data_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_data_requests_verification_token ON user_data_requests(verification_token);

-- ============================================
-- Enable Row Level Security (Optional)
-- ============================================
-- Uncomment if using Supabase RLS

-- ALTER TABLE email_consents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Notes
-- ============================================
-- 1. Run these migrations in your Supabase SQL editor
-- 2. All tables use UUID primary keys for security
-- 3. All tables include created_at/updated_at for audit trails
-- 4. Indexes are automatically created for performance
-- 5. Sensitive data is stored in JSONB for flexibility
-- 6. Retention policies will be managed by application code
-- 7. Consider enabling Row Level Security (RLS) for multi-tenancy
