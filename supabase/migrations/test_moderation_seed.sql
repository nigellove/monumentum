-- ============================================================================
-- TEST MODERATION WORKFLOW SEED DATA
-- ============================================================================
-- Creates test prospects in various states to test the full moderation workflow
-- Run this in Supabase SQL Editor after running simple_seed.sql
-- ============================================================================

-- Create additional test prospects for moderation workflow testing
INSERT INTO outbound_prospects (
  id,
  user_id,
  customer_id,
  campaign_id,
  prospect_name,
  prospect_email,
  company_name,
  draft_subject,
  draft_message,
  review_status
) VALUES
-- Prospect 1: Pending Review (needs approval)
(
  '11111111-1111-1111-1111-111111111111',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'Sarah Johnson',
  'nigel@monumentum.ai',
  'TechStart Solutions',
  'Scaling Your Sales Team with AI',
  E'Hi Sarah,\n\nI noticed TechStart Solutions is growing rapidly. I wanted to reach out about how AI-powered sales tools can help you scale without adding headcount.\n\nWould you be open to a quick 15-minute call next week?\n\nBest regards,\nNigel',
  'pending_review'
),
-- Prospect 2: Pending Review (needs approval)
(
  '22222222-2222-2222-2222-222222222222',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'Michael Chen',
  'nigel@monumentum.ai',
  'DataFlow Inc',
  'Automating Your Outbound Sales',
  E'Hi Michael,\n\nI saw that DataFlow Inc recently raised Series A funding. Congrats!\n\nAs you scale your sales team, I thought you might be interested in learning how AI can help automate your outbound prospecting.\n\nInterested in learning more?\n\nBest,\nNigel',
  'pending_review'
),
-- Prospect 3: Pending Review (needs approval)
(
  '33333333-3333-3333-3333-333333333333',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'Emily Rodriguez',
  'nigel@monumentum.ai',
  'CloudScale Systems',
  'Reducing Sales Team Workload',
  E'Hi Emily,\n\nI noticed CloudScale Systems is hiring multiple SDRs. Have you considered how AI could help your existing team reach more prospects?\n\nWe help sales teams automate 80% of their outbound workflow.\n\nWorth a conversation?\n\nCheers,\nNigel',
  'pending_review'
),
-- Prospect 4: Already Approved (ready to send)
(
  '44444444-4444-4444-4444-444444444444',
  '3cc701a5-eee4-44ed-926e-7d9cc956f223',
  'test-customer-001',
  'bbbbbbbb-1111-2222-3333-444444444444',
  'David Park',
  'nigel@monumentum.ai',
  'Growth Labs',
  'AI-Powered Sales Outreach',
  E'Hi David,\n\nCongratulations on Growth Labs reaching 100 customers!\n\nI wanted to share how we help companies like yours scale outbound sales with AI.\n\nCan we schedule a brief call?\n\nBest regards,\nNigel',
  'approved'
);

SELECT '✅ Test moderation data created!' as status;
SELECT 'Navigate to Review Queue tab to see 3 pending prospects' as next_step;
