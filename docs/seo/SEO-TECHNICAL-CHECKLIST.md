# 🎯 SEO & Technical Functionality Checklist

**Date:** 2025-10-03  
**Status:** In Progress  
**Goal:** 95+ SEO Score + Perfect Bilingual Functionality

---

## ✅ **Completed Fixes**

### Phase 1-6: Architecture Consolidation

- ✅ Single layout system (Base.astro)
- ✅ Single i18n system (lib/i18n.ts)
- ✅ Removed duplicate routes
- ✅ Added redirects for non-prefixed URLs
- ✅ 123 pages building successfully

### Language Switcher

- ✅ Fixed Header component to use Base.astro translation slugs
- ✅ Fixed mobile menu language switcher
- ✅ Testimonials page language switching works
- ✅ Contact page language switching works

### Spanish Filtering

- ✅ Fixed TestimonialsGrid to use Spanish industry labels
- ✅ Spanish testimonials filtering now uses correct data

---

## 🔍 **Remaining Critical Issues**

### 1. Blog Filtering & Pagination

**Status:** ⚠️ Needs Investigation

**Potential Issues:**

- Blog category filtering on Spanish side
- Blog pagination URLs
- Blog post language switching
- Blog post hreflang tags

**Files to Check:**

- `/src/pages/en/blog/[slug].astro`
- `/src/pages/es/blog/[slug].astro`
- `/src/pages/en/blog/[page].astro`
- `/src/pages/es/blog/[page].astro`
- `/src/pages/en/category/[category].astro`
- `/src/pages/es/categoria/[category].astro`
- `/src/components/blog/PaginatedBlogLayout.astro`

**Expected Behavior:**

- Spanish blog filtering should use Spanish category labels
- Pagination should work in both languages
- Language switcher should work on blog posts
- Category pages should filter correctly

### 2. OG Tags & Social Sharing

**Status:** ⚠️ Needs Verification

**Requirements (from memories):**

- ✅ Absolute URLs for all OG tags
- ✅ Dynamic OG images (blog uses featured image, services use hero)
- ✅ Proper og:locale format (en_US, es_MX)
- ✅ og:locale:alternate tags
- ⚠️ Need to verify on all page types

**Files to Check:**

- `/src/layouts/Base.astro` (OG tag generation)
- Blog post pages (featured image as OG)
- Service pages (hero image as OG)

**Test:**

- Run Facebook Debugger on key pages
- Verify Twitter Card validator
- Check LinkedIn preview

### 3. Hreflang Reciprocity

**Status:** ⚠️ Needs Validation

**Requirements:**

- Perfect reciprocal hreflang links
- No 301/404 in hreflang chains
- Consistent trailing slashes
- x-default pointing to English

**Test Pages:**

- Homepage (EN/ES)
- Blog index (EN/ES)
- Blog posts (EN/ES)
- Category pages (EN/ES)
- Service pages (EN/ES)
- Testimonials (EN/ES)

### 4. Canonical URLs

**Status:** ⚠️ Needs Validation

**Requirements:**

- Canonical URLs must match serving URLs
- No 301 redirects on canonical URLs
- Consistent trailing slashes
- Absolute URLs

**Known Issues from Memories:**

- Pagination canonical URLs
- Blog post canonical URLs
- Category page canonical URLs

### 5. Internal Links

**Status:** ⚠️ Needs Audit

**Known Issues from Memories:**

- `/en/category/english-for-executives` should be `/en/category/executive-english`
- Missing blog post: `/en/blog/executive-presence-on-video-calls`
- Cross-language blog links may be broken

**Action:**

- Run internal link validator
- Fix broken category links
- Add missing blog post or redirect

---

## 📋 **Testing Protocol**

### Manual Testing Checklist

#### Language Switching

- [ ] Test on homepage (EN ↔ ES)
- [ ] Test on blog index (EN ↔ ES)
- [ ] Test on blog post (EN ↔ ES)
- [ ] Test on category page (EN ↔ ES)
- [ ] Test on service page (EN ↔ ES)
- [ ] Test on testimonials (EN ↔ ES)
- [ ] Test on contact (EN ↔ ES)

#### Filtering

- [ ] English testimonials filter by industry
- [ ] Spanish testimonials filter by industry
- [ ] English blog filter by category
- [ ] Spanish blog filter by category
- [ ] Blog pagination (EN)
- [ ] Blog pagination (ES)

#### SEO Tags

- [ ] View source on 5 key pages
- [ ] Verify hreflang tags present
- [ ] Verify canonical URLs correct
- [ ] Verify OG tags with absolute URLs
- [ ] Verify og:locale format
- [ ] Verify x-default present

### Automated Testing

#### Run Validation Scripts

```bash
# From scripts/ directory
node validate-hreflang.mjs
node validate-canonical-urls.mjs
node validate-internal-links.mjs
node validate-url-structure.mjs
```

#### SEO Audit Tools

- [ ] Run Lighthouse on 10 key pages
- [ ] Run Screaming Frog crawl
- [ ] Check Google Search Console
- [ ] Validate structured data

---

## 🎯 **Success Criteria**

### Must Have (95+ SEO Score)

1. ✅ All pages build without errors
2. ⚠️ Perfect hreflang reciprocity (no 404s, no 301s)
3. ⚠️ Canonical URLs match serving URLs
4. ⚠️ All OG tags use absolute URLs
5. ⚠️ No broken internal links
6. ⚠️ Language switcher works on all pages
7. ⚠️ Filtering works in both languages
8. ⚠️ Blog pagination works in both languages

### Nice to Have (World-Class)

- [ ] Core Web Vitals: LCP < 2.5s
- [ ] Core Web Vitals: CLS < 0.1
- [ ] Core Web Vitals: FID < 100ms
- [ ] Accessibility score > 95
- [ ] Best Practices score > 95

---

## 🚨 **Known Risks**

### From Previous Memories

1. **"Plug one hole, create another"** - Fixing one SEO issue can break another
   - **Mitigation:** Test thoroughly after each fix
   - **Mitigation:** Run full validation suite before deployment

2. **Blog routing complexity** - Double language prefixes, URL cleaning hacks
   - **Current Status:** Workarounds in place (url-cleaner.ts)
   - **Long-term:** Simplify blog routing architecture

3. **Performance issues** - Spanish category pages showing slow TTFB
   - **Current Status:** Not addressed yet
   - **Impact:** May affect SEO score if Core Web Vitals are poor

4. **Dual systems cleanup incomplete** - url-cleaner.ts and i18nRoutes.ts still exist
   - **Current Status:** Kept for blog page compatibility
   - **Long-term:** Refactor blog pages to remove dependency

---

## 📝 **Next Steps**

### Immediate (Today)

1. ✅ Fix Spanish testimonials filtering
2. ⚠️ Test blog filtering in Spanish
3. ⚠️ Verify OG tags on key pages
4. ⚠️ Run hreflang validation

### Short-term (This Week)

1. Fix any broken internal links
2. Verify canonical URLs on all page types
3. Test pagination in both languages
4. Run full SEO audit

### Long-term (Future)

1. Simplify blog routing (remove url-cleaner workarounds)
2. Optimize performance (address slow TTFB)
3. Add automated SEO testing to CI/CD
4. Document all SEO best practices

---

**Status:** Ready for comprehensive testing. The foundation is solid, now we need to verify all the details work correctly.
