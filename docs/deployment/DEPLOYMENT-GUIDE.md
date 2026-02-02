# 🚀 Deployment Guide: Hostinger + Netlify Hybrid Setup

## **Architecture Overview**

- **Static site** → Hostinger (HTML, CSS, JS, images)
- **API functions** → Netlify Functions (quiz submissions)
- **Database** → Supabase (quiz_submissions table)
- **Domain** → nyenglishteacher.com (no DNS changes needed)

## **Quick Reference: Daily Updates**

```powershell
# For content/code changes:
npm run build
# Then upload dist/ contents to Hostinger via FTP/File Manager
# .htaccess stays untouched - don't overwrite it!

# For API function changes only:
netlify deploy --prod
```

---

## **Prerequisites**

### **Accounts Needed**

- ✅ Hostinger account (existing)
- ✅ Netlify account (free tier)
- ✅ Supabase account (existing)
- ✅ Resend account (for email notifications)

### **Tools Needed**

- ✅ FTP client (FileZilla) OR Hostinger File Manager
- ✅ Node.js installed locally
- ✅ Git (optional, for version control)

---

## **Part 1: Deploy Static Site to Hostinger**

### **Step 1: Build the Site**

```powershell
# Navigate to project directory
cd C:\Users\Robert Cushman\.vscode\Projects\ny-eng

# Install dependencies (if needed)
npm install

# Build the static site
npm run build
```

**Expected output:**

```
✓ Completed in 7.5s
[@astrojs/sitemap] `sitemap-index.xml` created at `dist`
[build] Complete!
```

### **Step 2: Verify Build Output**

Check that `dist/` folder contains:

```
dist/
├── en/              # English pages
├── es/              # Spanish pages
├── _astro/          # CSS/JS bundles
├── images/          # Optimized images
├── sitemap-0.xml    # SEO sitemap
└── robots.txt       # Search directives
```

### **Step 3: Upload to Hostinger**

**Option A: Using Hostinger File Manager (Easiest)**

1. Log in to Hostinger control panel
2. Go to **Files** → **File Manager**
3. Navigate to `public_html/` (or your domain's root)
4. **Delete old files** (backup first!)
5. **Upload entire `dist/` folder contents**
6. Wait for upload to complete (~2-5 minutes)

**Option B: Using FTP (Faster for updates)**

1. Open FileZilla
2. Connect to Hostinger:
   - Host: `ftp.nyenglishteacher.com`
   - Username: Your Hostinger FTP username
   - Password: Your Hostinger FTP password
   - Port: 21
3. Navigate to `public_html/`
4. Upload `dist/` contents

### **Step 5: Test Static Site**

Visit these URLs to verify:

- ✅ `https://www.nyenglishteacher.com/` → Should redirect to `/en/`
- ✅ `https://www.nyenglishteacher.com/en/` → Homepage loads
- ✅ `https://www.nyenglishteacher.com/en/blog/` → Blog index loads
- ✅ `https://www.nyenglishteacher.com/es/` → Spanish homepage loads

---

## **Part 2: Deploy API Functions to Netlify**

### **Step 1: Install Netlify CLI**

```powershell
npm install -g netlify-cli
```

### **Step 2: Login to Netlify**

```powershell
netlify login
```

This opens a browser window. Authorize the CLI.

### **Step 3: Create Netlify Site**

```powershell
# In your project directory
cd C:\Users\Robert Cushman\.vscode\Projects\ny-eng

# Initialize Netlify site
netlify init
```

**Follow the prompts:**

1. **Create & configure a new site**
2. **Team:** Select your team
3. **Site name:** `ny-eng-api` (or your preferred name)
4. **Build command:** `npm run build`
5. **Publish directory:** `dist`

### **Step 4: Configure Environment Variables**

In Netlify dashboard (https://app.netlify.com):

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET=your-service-role-key-here  # NOT anon key - use service_role to bypass RLS
SUPABASE_ANON_KEY=your-anon-key-here
RESEND_API_KEY=re_your-resend-key-here
NOTIFICATION_EMAIL=your-email@example.com
```

**Where to find these:**

- **Supabase:** Project Settings → API → "Legacy anon, service_role API keys" tab
  - Use the `service_role` key for `SUPABASE_SECRET` (bypasses RLS)
- **Resend:** Dashboard → API Keys

**IMPORTANT:** The function uses `SUPABASE_SECRET` to bypass Row Level Security. The anon key won't work for inserts.

### **Step 5: Deploy to Netlify**

```powershell
# Deploy to production
netlify deploy --prod
```

**Expected output:**

```
✔ Deploy is live!
  Unique Deploy URL: https://6abc123--ny-eng-api.netlify.app
  Website URL:       https://ny-eng-api.netlify.app
```

### **Step 6: Test API Functions**

Test the quiz submission endpoint:

```powershell
# Using curl (PowerShell)
curl -X POST https://ny-eng-api.netlify.app/.netlify/functions/quiz-submit `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "quizType": "it-services",
    "language": "en",
    "answers": {"q1": 0, "q2": 1, "q3": 2}
  }'
```

**Expected response:**

```json
{
  "success": true,
  "submission_id": "abc-123",
  "score": 45,
  "score_tier": "Million-Dollar Gap"
}
```

**Valid score_tier values:** `Credibility Block`, `Million-Dollar Gap`, `Conversation-Ready`

---

## **Part 3: Verify End-to-End Integration**

### **Test the Full Flow**

1. **Visit your site:** `https://www.nyenglishteacher.com/en/quiz/it-services/`
2. **Start the quiz**
3. **Answer questions**
4. **Submit with email**
5. **Check Supabase:** Verify submission appears in `quiz_submissions` table
6. **Check email:** Verify notification received (if configured)

### **Check API is Working**

Open browser DevTools (F12) → Network tab:

1. Submit quiz
2. Look for request to `https://ny-eng-api.netlify.app/.netlify/functions/quiz-submit`
3. **Status should be 200**
4. **Response should have `success: true`**

**Note:** The frontend calls Netlify directly (not via proxy) because Hostinger doesn't support `mod_proxy`.

---

## **Part 4: Update Workflow (Future Deployments)**

### **When You Update Content**

```powershell
# 1. Make changes to Astro files
# 2. Build
npm run build

# 3. Upload dist/ to Hostinger (FTP or File Manager)
# Done!
```

### **When You Update API Functions**

```powershell
# 1. Make changes to src/pages/api/*.ts
# 2. Deploy to Netlify
netlify deploy --prod

# Done!
```

### **When You Update Both**

```powershell
# 1. Build
npm run build

# 2. Upload dist/ to Hostinger
# 3. Deploy to Netlify
netlify deploy --prod
```

---

## **Troubleshooting**

### **Problem: Quiz submissions fail with RLS error**

**Error:** `new row violates row-level security policy`

**Fix:** Make sure Netlify is using `SUPABASE_SECRET` (service_role key), not the anon key.

### **Problem: Quiz submissions fail with schema error**

**Error:** `Could not find column 'answers'`

**Fix:** Run this SQL in Supabase:

```sql
ALTER TABLE quiz_submissions ADD COLUMN IF NOT EXISTS answers JSONB;
```

### **Problem: CSP blocking API calls**

**Error:** `Refused to connect because it violates Content Security Policy`

**Fix:** Add Netlify domain to `.htaccess` CSP header:

```apache
<IfModule mod_headers.c>
Header set Content-Security-Policy "
    default-src 'self';
    connect-src 'self' https://ny-eng-api.netlify.app https://www.google-analytics.com;
    script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
"
</IfModule>
```

### **Problem: 404 on quiz pages**

**Cause:** Dynamic pages not pre-rendered.

**Fix:** Ensure all `[quizType]` pages have `getStaticPaths()` and `export const prerender = true`.

### **Problem: Score tier constraint error**

**Error:** `violates check constraint "quiz_submissions_score_tier_check"`

**Fix:** The Netlify function must use these exact values: `Credibility Block`, `Million-Dollar Gap`, `Conversation-Ready`

### **Problem: CORS errors**

**Fix:** Add CORS headers to Netlify function:

```javascript
return {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "https://www.nyenglishteacher.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: JSON.stringify({ success: true }),
};
```

### **Problem: Slow page loads**

**Check:**

1. ✅ Images are optimized (WebP format)
2. ✅ Caching headers in `.htaccess`
3. ✅ Hostinger CDN is enabled

**Enable Hostinger CDN:**

1. Go to Hostinger control panel
2. **Websites** → **Manage** → **Performance**
3. Enable **Cloudflare CDN**

---

## **Performance Optimization**

### **Enable Gzip Compression**

Add to `.htaccess`:

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### **Preload Critical Resources**

Add to HTML `<head>`:

```html
<link rel="preload" href="/_astro/main.css" as="style" />
<link rel="preload" href="/_astro/main.js" as="script" />
```

### **Lazy Load Images**

Already implemented via Astro's `<Image>` component with `loading="lazy"`.

---

## **Security Checklist**

Before going live:

- [ ] HTTPS enabled (force redirect in `.htaccess`)
- [ ] Environment variables secured (Netlify dashboard only)
- [ ] Admin dashboard protected (add authentication)
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured (Netlify auto-limits)
- [ ] CORS headers restrictive (only your domain)
- [ ] `.env` files in `.gitignore`
- [ ] Security headers in `.htaccess`

---

## **Monitoring Setup**

### **Netlify Analytics**

1. Go to Netlify dashboard
2. **Analytics** → Enable (free tier available)
3. Track function invocations, errors, response times

### **Supabase Monitoring**

1. Go to Supabase dashboard
2. **Database** → **Logs**
3. Monitor query performance, errors

### **Google Search Console**

1. Add site: `https://www.nyenglishteacher.com`
2. Submit sitemap: `https://www.nyenglishteacher.com/sitemap-0.xml`
3. Monitor indexing status, errors

---

## **Backup Strategy**

### **Code Backup**

```powershell
# Push to GitHub (recommended)
git add .
git commit -m "Production deployment $(Get-Date -Format 'yyyy-MM-dd')"
git push origin main
```

### **Database Backup**

Supabase auto-backups daily (free tier: 7 days retention).

**Manual backup:**

1. Supabase dashboard → **Database** → **Backups**
2. **Download backup**

### **Static Site Backup**

Download `public_html/` from Hostinger monthly via FTP.

---

## **Cost Breakdown**

| Service       | Plan           | Cost/Month       |
| ------------- | -------------- | ---------------- |
| **Hostinger** | Shared hosting | $3-10            |
| **Netlify**   | Free tier      | $0               |
| **Supabase**  | Free tier      | $0               |
| **Resend**    | Free tier      | $0               |
| **Domain**    | Renewal        | ~$15/year        |
| **TOTAL**     |                | **~$5-12/month** |

**Scalability:**

- Netlify free tier: 100GB bandwidth, 125k function invocations
- Supabase free tier: 500MB database, 2GB bandwidth
- Hostinger: Unlimited bandwidth (fair use)

---

## **Support Resources**

### **Hostinger**

- Support: 24/7 live chat
- Docs: https://support.hostinger.com

### **Netlify**

- Support: Community forum (free tier)
- Docs: https://docs.netlify.com

### **Supabase**

- Support: Discord community
- Docs: https://supabase.com/docs

---

## **Next Steps**

After successful deployment:

1. ✅ **Test all quiz types** (IT Services, Executives, etc.)
2. ✅ **Submit test leads** to verify Supabase integration
3. ✅ **Check email notifications** via Resend
4. ✅ **Run Lighthouse audit** (target: 95+ score)
5. ✅ **Submit sitemap to Google Search Console**
6. ✅ **Monitor for 48 hours** (check Netlify logs)
7. ✅ **Add authentication to admin dashboard**

---

## **Complete .htaccess File**

```apache
# Enable rewriting
RewriteEngine On

# =========================================================
# Force HTTPS
# =========================================================
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# =========================================================
# Force www
# =========================================================
RewriteCond %{HTTP_HOST} ^nyenglishteacher\.com [NC]
RewriteRule ^(.*)$ https://www.nyenglishteacher.com/$1 [L,R=301]

# =========================================================
# Redirect root to /en/
# =========================================================
RewriteCond %{REQUEST_URI} ^/?$
RewriteRule ^$ /en/ [L,R=302]

# =========================================================
# Add trailing slash (except for files)
# =========================================================
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !(.*)/$
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1/ [L,R=301]

# =========================================================
# Default index.html
# =========================================================
DirectoryIndex index.html

# =========================================================
# Content Security Policy
# =========================================================
<IfModule mod_headers.c>
Header set Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://www.google-analytics.com https://plain-mode-42c4.rcushmaniii.workers.dev https://ny-eng-api.netlify.app;
    object-src 'none';
    base-uri 'self';
"
</IfModule>
```

---

_Last updated: November 27, 2025_
_Deployment architecture: Hybrid (Hostinger + Netlify)_
