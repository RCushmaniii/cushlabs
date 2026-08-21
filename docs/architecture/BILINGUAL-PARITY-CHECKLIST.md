> ## ⚠️ NOT THIS REPO
>
> It instructs you to check `/en/` and `/es/` files. **There is no `/en/` here** — English is unprefixed. The checklist's shape is still useful; its paths are not.
>
> **Do not follow the file paths, commands, or counts in this document literally.**
> Verify anything it names actually exists before acting on it. Kept for the reasoning,
> not the specifics. See technical debt #18 in `docs/SESSION_LOG.md`.

---
# 🌍 Bilingual Parity Checklist

## CRITICAL RULE: Always Check Both Languages

**This is a bilingual site (English + Spanish). ANY change to one language MUST be applied to the other.**

---

## 📋 **Mandatory Checklist for Every Code Change**

When making ANY change to:

- ✅ Page templates (`.astro` files)
- ✅ Components
- ✅ Layouts
- ✅ SEO configurations
- ✅ Meta tags
- ✅ Hreflang logic
- ✅ Canonical URLs
- ✅ Data files

**ALWAYS check BOTH:**

1. `/en/` (English) files
2. `/es/` (Spanish) files

---

## 🚨 **Common Mistakes to Avoid**

### ❌ **BAD:**

```
1. Fix issue in /en/blog/[slug].astro
2. Mark as complete
3. Move on
```

### ✅ **GOOD:**

```
1. Fix issue in /en/blog/[slug].astro
2. IMMEDIATELY check /es/blog/[slug].astro
3. Apply same fix to Spanish version
4. Verify both work
5. Mark as complete
```

---

## 📁 **File Pairs to Always Check**

### **Blog Posts:**

- `/src/pages/en/blog/[slug].astro`
- `/src/pages/es/blog/[slug].astro`

### **Blog Index:**

- `/src/pages/en/blog/index.astro`
- `/src/pages/es/blog/index.astro`

### **Blog Pagination:**

- `/src/pages/en/blog/[page].astro`
- `/src/pages/es/blog/[page].astro`

### **Category Pages:**

- `/src/pages/en/category/[category].astro`
- `/src/pages/es/categoria/[category].astro`

### **Service Pages:**

- `/src/pages/en/services/*.astro`
- `/src/pages/es/servicios/*.astro`

### **Static Pages:**

- `/src/pages/en/*.astro`
- `/src/pages/es/*.astro`

---

## 🎯 **Quick Verification Commands**

After making changes, verify both languages:

```powershell
# Check if both files exist
Test-Path "src/pages/en/blog/[slug].astro"
Test-Path "src/pages/es/blog/[slug].astro"

# Search for specific code in both
Get-Content "src/pages/en/blog/[slug].astro" | Select-String "tkey"
Get-Content "src/pages/es/blog/[slug].astro" | Select-String "tkey"
```

---

## 💡 **Mental Model**

Think of this codebase as **TWINS**:

- Whatever you do to one, you MUST do to the other
- They should be mirror images (except for language-specific content)
- If you only fix one, you've only done 50% of the work

---

## ✅ **Before Marking Any Task Complete**

Ask yourself:

1. ✅ Did I check the English version?
2. ✅ Did I check the Spanish version?
3. ✅ Did I apply the fix to BOTH?
4. ✅ Did I verify both work?

**If any answer is NO, the task is NOT complete.**

---

## 🔥 **Remember:**

> "There is no such thing as fixing just the English side or just the Spanish side.
> There is only fixing BOTH sides or fixing NOTHING."

---

**Last Updated:** 2025-10-03  
**Reason:** Repeated instances of fixing only one language and forgetting the other.
