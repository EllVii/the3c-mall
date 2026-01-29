-- Row Level Security Policies for 3C Mall
-- Run these commands in your Supabase SQL Editor to enable RLS and secure your data

-- ============================================
-- Enable RLS on Tables
-- ============================================

ALTER TABLE email_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Email Consents Policies (Waitlist)
-- ============================================

-- Public can insert their own consent (waitlist signup)
CREATE POLICY "Anyone can sign up for waitlist"
  ON email_consents
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own consent record by email
CREATE POLICY "Users can view their own consent"
  ON email_consents
  FOR SELECT
  USING (
    email = auth.jwt()->>'email'
    OR email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Users can update their own consent (unsubscribe)
CREATE POLICY "Users can update their own consent"
  ON email_consents
  FOR UPDATE
  USING (
    email = auth.jwt()->>'email'
    OR email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Service role can do everything (for admin backend)
-- (This is handled by service role key, no policy needed)

-- ============================================
-- User Preferences Policies
-- ============================================

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- User Activity Policies
-- ============================================

-- Users can insert their own activity
CREATE POLICY "Users can log their own activity"
  ON user_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own activity
CREATE POLICY "Users can view their own activity"
  ON user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

-- No update or delete (activity log is append-only)

-- ============================================
-- User Recipes Policies
-- ============================================

-- Users can insert their own recipes
CREATE POLICY "Users can create their own recipes"
  ON user_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own recipes
CREATE POLICY "Users can view their own recipes"
  ON user_recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
  ON user_recipes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
  ON user_recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- API Cache Policies
-- ============================================

-- Users can insert their own cache entries
CREATE POLICY "Users can cache their own API data"
  ON api_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own cache
CREATE POLICY "Users can view their own cache"
  ON api_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own cache
CREATE POLICY "Users can update their own cache"
  ON api_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cache
CREATE POLICY "Users can delete their own cache"
  ON api_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- API Usage Policies
-- ============================================

-- Users can insert their own usage tracking
CREATE POLICY "Users can track their own API usage"
  ON api_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own usage
CREATE POLICY "Users can view their own API usage"
  ON api_usage
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own usage
CREATE POLICY "Users can update their own API usage"
  ON api_usage
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- User Data Requests Policies (CCPA/GDPR)
-- ============================================

-- Users can request their own data export/deletion
CREATE POLICY "Users can request their own data"
  ON user_data_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own data requests
CREATE POLICY "Users can view their own data requests"
  ON user_data_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own data requests (cancel)
CREATE POLICY "Users can update their own data requests"
  ON user_data_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Admin Tables (No RLS - Service Role Only)
-- ============================================

-- audit_logs - No RLS (admin/service role only)
-- security_incidents - No RLS (admin/service role only)

-- These tables are accessed only via backend with service role key

-- ============================================
-- Notes
-- ============================================

-- 1. Run this AFTER running SUPABASE_SETUP.sql
-- 2. RLS policies ensure users can only access their own data
-- 3. Anonymous users can sign up for waitlist (email_consents INSERT)
-- 4. Authenticated users can manage their own preferences, recipes, cache
-- 5. Activity logs are append-only (no delete/update policies)
-- 6. Admin tables (audit_logs, security_incidents) have no RLS - use service role key
-- 7. Test policies thoroughly before going to production
-- 8. Backend with service_role_key bypasses all RLS policies

-- ============================================
-- Testing RLS Policies
-- ============================================

-- Test as anonymous user (should work):
-- INSERT INTO email_consents (email, consents_waitlist) VALUES ('test@example.com', true);

-- Test as authenticated user (should work for own data):
-- SELECT * FROM user_preferences WHERE user_id = auth.uid();

-- Test cross-user access (should fail):
-- SELECT * FROM user_preferences WHERE user_id != auth.uid();
