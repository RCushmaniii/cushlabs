# Quiz Testing Guide - IT Services Quiz

## 🚀 Quick Start

### **Test the IT Services Quiz:**

1. **Start dev server:**

   ```powershell
   npm run dev
   ```

2. **Open in browser:**

   ```
   http://localhost:4321/en/quiz/it-services/
   ```

3. **Or use the redirect:**
   ```
   http://localhost:4321/en/quiz/
   ```
   (Automatically redirects to IT Services)

---

## ✅ Testing Checklist

### **1. Landing Page** (`/en/quiz/it-services/`)

- [ ] Page loads without errors
- [ ] Title displays: "IT Communication Confidence Assessment"
- [ ] Subtitle displays correctly
- [ ] "Start Free 90-Second Assessment" button works
- [ ] ReportCarousel displays
- [ ] Trust signals show (90 seconds, Instant results, etc.)

### **2. Question Flow** (`/en/quiz/it-services/question/1/`)

- [ ] Question 1 displays with 4 answer options
- [ ] Progress bar shows "Question 1 of 6"
- [ ] Can select an answer (radio button)
- [ ] "Next Question →" button works
- [ ] Answer is saved to sessionStorage (check DevTools)
- [ ] Navigates to Question 2
- [ ] Repeat for all 6 questions
- [ ] Last question shows "See My Results →" button

### **3. Results Page** (`/en/quiz/it-services/results/`)

- [ ] Lead capture form displays
- [ ] Form requires name and email
- [ ] Company and phone are optional
- [ ] Privacy policy link works
- [ ] Form submission works
- [ ] Score displays after submission
- [ ] Score tier displays (Conversation-Ready, Million-Dollar Gap, or Credibility Block)
- [ ] "View Full Report →" button appears

### **4. Report Page** (`/en/quiz/it-services/report/`)

- [ ] Report displays with user's name
- [ ] Total score shows (0-100)
- [ ] Score tier badge displays with correct color
- [ ] Category breakdown shows all 5 categories
- [ ] Primary gap displays with urgency badge
- [ ] Secondary gap displays with urgency badge
- [ ] Impact and recommendation text displays
- [ ] "Book Your Strategy Call →" button works
- [ ] "Print Report" button works

---

## 🔍 Technical Checks

### **SessionStorage Keys** (Check in DevTools → Application → Session Storage)

After taking quiz, you should see:

```
quiz_it-services_answers: {"q1":2,"q2":1,"q3":0,"q4":3,"q5":2,"q6":1}
quiz_it-services_start: 1700000000000
quiz_it-services_lead: {"name":"John","email":"john@test.com",...}
quiz_it-services_score: 67
```

### **API Submission** (Check Network tab)

When submitting lead form:

- [ ] POST to `/api/quiz/submit`
- [ ] Payload includes: `quizType: "it-services"`
- [ ] Payload includes: `answers`, `name`, `email`, `language: "en"`
- [ ] Response returns: `success: true`, `submission_id`, `score`, `score_tier`

### **Console Errors**

- [ ] No TypeScript errors
- [ ] No import errors
- [ ] No missing config errors
- [ ] Validator passes (check for "✅ Quiz config validated" message)

---

## 🐛 Common Issues & Fixes

### **Issue: "Cannot find module './it-services'"**

**Fix:** Restart TypeScript server

- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### **Issue: "Quiz config not found for type: it-services"**

**Fix:** Check that config is imported in `src/data/quiz/configs/index.ts`

```typescript
import { itServicesConfig } from "./it-services";
```

### **Issue: Page shows "Quiz Not Completed" warning**

**Fix:** Start from Question 1 and answer all questions in order

### **Issue: API returns 400 error**

**Fix:** Check that payload includes all required fields:

- `name`, `email`, `answers`, `language`, `quizType`

---

## 📊 Expected Scores

### **Sample Test Answers:**

If you answer all questions with the **first option** (best answers):

- **Total Score:** ~100
- **Tier:** Conversation-Ready
- **All categories:** 100/100

If you answer all questions with the **last option** (worst answers):

- **Total Score:** 0
- **Tier:** Credibility Block
- **All categories:** 0/100

If you mix answers (e.g., 2nd and 3rd options):

- **Total Score:** 40-70
- **Tier:** Million-Dollar Gap
- **Categories:** Mixed scores

---

## 🔄 Testing Different Quiz Types

Once IT Services works, test other quiz types by changing the URL:

```
/en/quiz/professional-services/
/en/quiz/sales-marketing/
/en/quiz/executives/
/en/quiz/interview-coaching/
```

**Note:** Only IT Services has a config right now. Others will show 404 until we create their configs.

---

## 🚨 Before Going Live

- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify Supabase tables exist (run SQL schema)
- [ ] Test actual submission to Supabase
- [ ] Verify email in Supabase matches admin RLS policy
- [ ] Test print functionality on report page
- [ ] Verify all links work (contact page, privacy policy, etc.)
- [ ] Check SEO metadata (title, description, og:tags)
- [ ] Test language switcher (once Spanish version is ready)

---

## 📝 Notes

- **Old quiz pages** still exist at `/en/quiz/question/1/` (without `[quizType]`)
- **New quiz pages** are at `/en/quiz/it-services/question/1/` (with `[quizType]`)
- **Redirects** send `/en/quiz/` → `/en/quiz/it-services/` automatically
- **Storage** is namespaced, so taking multiple quizzes won't conflict

---

## ✅ Success Criteria

The quiz is working correctly if:

1. ✅ User can complete all 6 questions
2. ✅ Lead form submits successfully
3. ✅ Score displays correctly
4. ✅ Report shows gap analysis
5. ✅ No console errors
6. ✅ Data saves to sessionStorage
7. ✅ API submission returns success

---

**Ready to test? Run `npm run dev` and visit `/en/quiz/it-services/`!**
