# Quiz Database Integration Guide

**Created:** October 28, 2025  
**Status:** ✅ Ready for Testing  
**Purpose:** Supabase integration for Communication Confidence Quiz lead capture

---

## 📋 Overview

This integration connects your quiz system to Supabase for:

- ✅ Lead capture and storage
- ✅ Quiz answer backup
- ✅ Admin dashboard for reviewing submissions
- ✅ Marketing attribution tracking

---

## 🗄️ Database Schema

### Table 1: `quiz_submissions`

Stores lead info and calculated scores.

```sql
CREATE TABLE quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead info
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,

  -- Score (calculated by frontend)
  total_score integer NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  raw_score integer CHECK (raw_score >= 0 AND raw_score <= 250),
  score_tier text NOT NULL CHECK (score_tier IN ('Credibility Block', 'Million-Dollar Gap', 'Conversation-Ready')),

  -- Category breakdown
  category_scores jsonb,
  primary_gap text,
  secondary_gap text,

  -- Metadata
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  created_at timestamptz DEFAULT now(),

  -- Marketing attribution
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,

  -- Engagement tracking
  viewed_report boolean DEFAULT true,
  clicked_cta boolean DEFAULT false,
  booked_consultation boolean DEFAULT false,
  booking_date timestamptz,

  -- Privacy
  gdpr_consent boolean DEFAULT false,
  marketing_opt_in boolean DEFAULT false
);
```

### Table 2: `quiz_answers`

Stores individual question responses (10 per submission).

```sql
CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,

  -- Question data
  question_number integer NOT NULL CHECK (question_number >= 1 AND question_number <= 10),
  question_text text NOT NULL,
  answer_text text NOT NULL,
  points integer NOT NULL CHECK (points >= 0 AND points <= 25),
  category text,

  created_at timestamptz DEFAULT now()
);
```

---

## 📁 Files Created

### 1. Supabase Client (`src/lib/supabase.ts`)

- Type-safe Supabase client configuration
- Helper functions for database operations
- TypeScript interfaces for quiz data

**Key Functions:**

- `submitQuiz()` - Submit complete quiz with answers
- `getSubmission()` - Retrieve submission by ID
- `getAllSubmissions()` - Get all submissions (admin)
- `updateBookingStatus()` - Track consultation bookings
- `trackCtaClick()` - Track CTA engagement

### 2. Quiz Submission API (`src/pages/api/quiz/submit.ts`)

- POST endpoint for quiz submissions
- Validates form data
- Calculates score using `scoring.ts`
- Stores in Supabase
- Returns submission ID and score

**Endpoint:** `POST /api/quiz/submit`

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "company": "Acme Corp",
  "phone": "+1-555-0123",
  "answers": {
    "q1": 0,
    "q2": 1,
    ...
  },
  "language": "en",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "quiz-campaign"
}
```

**Response:**

```json
{
  "success": true,
  "submission_id": "uuid",
  "score": 67,
  "score_tier": "Million-Dollar Gap"
}
```

### 3. Updated Results Page (`src/pages/en/quiz/results.astro`)

- Calls API endpoint on form submission
- Shows loading state during submission
- Handles errors gracefully
- Stores submission ID in sessionStorage
- Redirects to report page

### 4. Admin Dashboard (`src/pages/admin/leads.astro`)

- View all quiz submissions
- Filter by score tier, language, booking status
- Search by email
- Pagination (20 per page)
- Stats: total leads, bookings, avg score, conversion rate

**URL:** `/admin/leads`

### 5. Admin API (`src/pages/api/admin/leads.ts`)

- GET endpoint for admin dashboard
- Returns submissions with filtering
- Calculates stats

**Endpoint:** `GET /api/admin/leads?score_tier=&language=&limit=20&offset=0`

### 6. Test Endpoint (`src/pages/api/quiz/test.ts`)

- Tests Supabase connection
- Returns total submission count

**Endpoint:** `GET /api/quiz/test`

---

## 🧪 Testing Steps

### Step 1: Test Database Connection

Start the dev server:

```bash
npm run dev
```

Visit the test endpoint:

```
http://localhost:4321/api/quiz/test
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Supabase connection successful",
  "total_submissions": 0,
  "timestamp": "2025-10-28T..."
}
```

### Step 2: Test Quiz Submission

1. Navigate to: `http://localhost:4321/en/quiz/start`
2. Complete all 10 questions
3. Fill out the lead capture form on `/en/quiz/results`
4. Submit the form

**What Should Happen:**

- Button shows "Submitting..." loading state
- Form submits to `/api/quiz/submit`
- Redirects to `/en/quiz/report/`
- Report page displays your score

**Check Supabase:**

- Go to Supabase dashboard → Table Editor
- View `quiz_submissions` table - should have 1 row
- View `quiz_answers` table - should have 10 rows

### Step 3: Test Admin Dashboard

Visit: `http://localhost:4321/admin/leads`

**What Should Display:**

- Stats cards (total leads, bookings, avg score, conversion rate)
- Table with your submission
- Filters and search functionality

**Test Filters:**

- Filter by score tier
- Filter by language
- Search by email

### Step 4: Test Error Handling

**Test 1: Missing quiz data**

- Navigate directly to `/en/quiz/results` without taking quiz
- Should redirect to `/en/quiz/start`

**Test 2: Network error**

- Disconnect internet
- Try submitting quiz
- Should show error alert
- Button should re-enable

---

## 🔒 Security Considerations

### ⚠️ BEFORE PRODUCTION:

1. **Add Authentication to Admin Dashboard**

   ```typescript
   // Add to admin/leads.astro
   const session = await getSession(Astro.request);
   if (!session) {
     return Astro.redirect("/login");
   }
   ```

2. **Set Up Row Level Security (RLS) in Supabase**

   ```sql
   -- Allow anonymous inserts to quiz_submissions
   CREATE POLICY "Allow anonymous quiz submissions"
   ON quiz_submissions FOR INSERT
   TO anon
   WITH CHECK (true);

   -- Prevent anonymous reads
   CREATE POLICY "Prevent anonymous reads"
   ON quiz_submissions FOR SELECT
   TO anon
   USING (false);

   -- Allow service role full access
   CREATE POLICY "Service role full access"
   ON quiz_submissions
   TO service_role
   USING (true);
   ```

3. **Rate Limiting**
   - Add rate limiting to `/api/quiz/submit`
   - Prevent spam submissions

4. **Email Validation**
   - Add server-side email validation
   - Check for disposable email domains

---

## 📊 Admin Dashboard Features

### Current Features:

- ✅ View all submissions
- ✅ Filter by score tier
- ✅ Filter by language
- ✅ Filter by booking status
- ✅ Search by email
- ✅ Pagination
- ✅ Stats dashboard

### Future Enhancements:

- [ ] Export to CSV
- [ ] View individual submission details
- [ ] Email integration (send follow-ups)
- [ ] Charts and analytics
- [ ] Bulk actions
- [ ] Notes on submissions

---

## 🔄 Workflow Summary

```
User Flow:
1. Takes quiz (10 questions) → sessionStorage
2. Fills out lead form → /api/quiz/submit
3. API calculates score → stores in Supabase
4. Redirects to report page → shows personalized results
5. Clicks CTA → tracks engagement

Admin Flow:
1. Visits /admin/leads
2. Views all submissions
3. Filters/searches leads
4. Reviews individual submissions
5. Tracks booking conversions
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Check `.env` file has:

```
SUPABASE_URL="https://rfhqbylzorsdoqwmiiqw.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### Issue: "Failed to submit quiz"

**Check:**

1. Supabase tables exist
2. RLS policies allow anonymous inserts
3. Network tab in browser DevTools for error details
4. Server console for error logs

### Issue: Admin dashboard shows "Error loading submissions"

**Check:**

1. `/api/admin/leads` endpoint is accessible
2. Supabase connection is working
3. Browser console for JavaScript errors

### Issue: TypeScript errors

**Solution:**

```bash
npm run build:check
```

Fix any type errors before deploying.

---

## 📈 Next Steps

### Immediate:

1. ✅ Test quiz submission flow
2. ✅ Verify data in Supabase
3. ✅ Test admin dashboard
4. ⏳ Add authentication to admin routes

### Short-term:

- [ ] Set up email notifications (new lead alert)
- [ ] Add CSV export functionality
- [ ] Create detail view for submissions
- [ ] Track CTA clicks from report page

### Long-term:

- [ ] Email automation (follow-up sequences)
- [ ] Analytics dashboard (conversion funnels)
- [ ] A/B testing for quiz questions
- [ ] Integration with CRM (HubSpot, Salesforce)

---

## 📝 Environment Variables

Required in `.env`:

```bash
SUPABASE_URL="https://rfhqbylzorsdoqwmiiqw.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_PROJECT_ID="rfhqbylzorsdoqwmiiqw"
SUPABASE_SECRET="your-service-role-key" # For admin operations
```

---

## 🎯 Success Metrics

Track these KPIs:

- **Quiz Completion Rate:** Start → Submit
- **Form Submission Rate:** Complete quiz → Submit form
- **CTA Click Rate:** View report → Click CTA
- **Booking Conversion:** Submit quiz → Book consultation
- **Overall Conversion:** Quiz start → Consultation booked

**Target Benchmarks:**

- Quiz completion: >60%
- Form submission: >80%
- CTA click: >15%
- Booking conversion: >5%

---

## 🔗 Related Documentation

- [Quiz Lead Magnet System](./QUIZ-LEAD-MAGNET-SYSTEM.md)
- [Booking System](./BOOKING-SYSTEM.md)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** October 28, 2025  
**Maintained By:** Development Team
