-- ============================================================================
-- Dynamic Quiz Lead Magnet System - Supabase Database Schema
-- ============================================================================
-- 
-- This schema supports multiple quiz types (personas) with a single unified
-- structure. All quiz data is stored as snapshots at submission time.
--
-- Created: November 16, 2025
-- Database: Supabase (PostgreSQL)
-- ============================================================================

-- ============================================================================
-- TABLE: quiz_submissions
-- ============================================================================
-- Stores lead contact information and quiz results as a snapshot
-- One row per quiz submission

CREATE TABLE IF NOT EXISTS quiz_submissions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead Contact Info (Required)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Lead Contact Info (Optional)
  company TEXT,
  phone TEXT,
  
  -- Quiz Metadata
  quiz_type TEXT NOT NULL CHECK (quiz_type IN (
    'it-services',
    'professional-services',
    'sales-marketing',
    'executives',
    'interview-coaching'
  )),
  quiz_version TEXT NOT NULL DEFAULT 'v1.0',
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  
  -- Scoring Snapshot (Stored at Submission)
  raw_score INTEGER NOT NULL CHECK (raw_score >= 0 AND raw_score <= 60),
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  score_tier TEXT NOT NULL CHECK (score_tier IN (
    'Conversation-Ready',
    'Million-Dollar Gap',
    'Credibility Block'
  )),
  
  -- Category Scores (JSONB for flexibility)
  -- Format: { clarity: 85, confidence: 42, realTime: 67, negotiation: 50, cultural: 75 }
  category_scores JSONB NOT NULL,
  
  -- Gap Analysis (JSONB)
  -- Format: { category: 'confidence', score: 42, impact: '...', recommendation: '...', urgency: 'high' }
  primary_gap JSONB NOT NULL,
  secondary_gap JSONB NOT NULL,
  
  -- Behavioral Data (Auto-Captured)
  completion_time_ms INTEGER, -- Time from start to submission
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  referrer TEXT,
  
  -- Marketing Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Admin CRM Fields
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',
    'contacted',
    'not-qualified',
    'booked',
    'follow-up'
  )),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for quiz_submissions
-- ============================================================================
-- Optimized for admin dashboard queries

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_created_at 
  ON quiz_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_status 
  ON quiz_submissions(status);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_type 
  ON quiz_submissions(quiz_type);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_email 
  ON quiz_submissions(email);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_score_tier 
  ON quiz_submissions(score_tier);

-- Composite index for common dashboard filters
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_type_status_created 
  ON quiz_submissions(quiz_type, status, created_at DESC);

-- ============================================================================
-- TABLE: quiz_answers
-- ============================================================================
-- Stores individual question responses for detailed analysis
-- Multiple rows per submission (one per question)

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
  
  -- Question Details (Snapshot)
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 6),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_index INTEGER NOT NULL CHECK (answer_index >= 0 AND answer_index <= 3),
  points INTEGER NOT NULL CHECK (points IN (0, 3, 6, 10)),
  category TEXT NOT NULL CHECK (category IN (
    'clarity',
    'confidence',
    'real-time',
    'negotiation',
    'cultural'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for quiz_answers
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_answers_submission_id 
  ON quiz_answers(submission_id);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_category 
  ON quiz_answers(category);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Restricts access to authenticated admin user only

ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
-- IMPORTANT: Replace 'robert@nyenglishteacher.com' with your actual admin email
CREATE POLICY "Admin full access to quiz_submissions" 
  ON quiz_submissions
  FOR ALL
  USING (auth.email() = 'robert@nyenglishteacher.com');

CREATE POLICY "Admin full access to quiz_answers" 
  ON quiz_answers
  FOR ALL
  USING (auth.email() = 'robert@nyenglishteacher.com');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_submissions_updated_at
  BEFORE UPDATE ON quiz_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE QUERIES (For Testing)
-- ============================================================================

-- Get recent submissions
-- SELECT * FROM quiz_submissions ORDER BY created_at DESC LIMIT 20;

-- Get submissions by quiz type
-- SELECT * FROM quiz_submissions WHERE quiz_type = 'it-services' ORDER BY created_at DESC;

-- Get submissions by status
-- SELECT * FROM quiz_submissions WHERE status = 'new' ORDER BY created_at DESC;

-- Get submission with answers
-- SELECT 
--   s.*,
--   json_agg(a.* ORDER BY a.question_number) as answers
-- FROM quiz_submissions s
-- LEFT JOIN quiz_answers a ON a.submission_id = s.id
-- WHERE s.id = 'your-submission-id'
-- GROUP BY s.id;

-- Get conversion stats by quiz type
-- SELECT 
--   quiz_type,
--   COUNT(*) as total_submissions,
--   COUNT(*) FILTER (WHERE status = 'booked') as bookings,
--   ROUND(AVG(total_score), 1) as avg_score,
--   ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'booked') / COUNT(*), 1) as conversion_rate
-- FROM quiz_submissions
-- GROUP BY quiz_type
-- ORDER BY total_submissions DESC;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. Snapshot Approach:
--    All quiz data is stored as-is at submission time. No recalculation needed.
--    If scoring logic changes, old submissions remain unchanged.
--
-- 2. JSONB Fields:
--    category_scores, primary_gap, secondary_gap use JSONB for flexibility.
--    Can query/filter on these fields using PostgreSQL JSON operators.
--
-- 3. Cascade Delete:
--    Deleting a submission automatically deletes its answers (ON DELETE CASCADE).
--
-- 4. Admin Access:
--    RLS policies restrict all access to single admin email.
--    Update the email in the policies before deploying.
--
-- 5. Indexes:
--    Optimized for common admin dashboard queries (filters, sorting).
--    Composite index supports multi-column filters efficiently.
--
-- ============================================================================
