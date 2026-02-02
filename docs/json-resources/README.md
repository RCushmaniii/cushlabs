# JSON Resource Audit System

Comprehensive validation system for bilingual free resource JSON files.

## What It Checks

### 1. **Schema Compliance**

- ✅ No legacy keys (`letter`, `name`, `description`, `tip`, `template`, etc.)
- ✅ All items have required fields (`number`, `title`)
- ✅ Proper structure with `sections` and `items`

### 2. **Language Consistency**

- ✅ **No English text in Spanish sections**
- ✅ No Spanish text in English sections
- ✅ Detects mixed-language content using word frequency analysis

### 3. **Bilingual Parity**

- ✅ English and Spanish sections have same number of sections
- ✅ Matching section IDs between languages
- ✅ Same number of items in corresponding sections

### 4. **Required Fields**

- ✅ Root metadata fields present
- ✅ Language-specific fields (title, subtitle, description)
- ✅ SEO fields and slugs

### 5. **Content Quality**

- ✅ No TODO/TBD/FIXME placeholders
- ✅ No empty strings
- ✅ No excessively long text (>5000 chars)

## Usage

### Run Standalone Audit

```bash
python scripts/audit-json-resources.py
```

### Automatic Pre-Build Check

The audit runs automatically before every build:

```bash
npm run build  # Runs audit first, then builds
```

### Manual Validation Only

```bash
.\scripts\validate-json-schema.ps1  # PowerShell - schema only
```

## Output Format

```
📋 COMPREHENSIVE JSON RESOURCE AUDIT
====================================

✅ valid-file.json
❌ problem-file.json
  ❌ Spanish section contains English text at es.sections[0].title: 'Example text...'
  ⚠️  Placeholder text found at root.es.description: 'TODO'

SUMMARY
=======
Total Files: 21
✅ Valid: 18
❌ Invalid: 3
❌ Total Errors: 3
⚠️  Total Warnings: 31
```

## Error Types

### ❌ Errors (Build-Blocking)

- Legacy schema keys present
- English text in Spanish sections
- Section count mismatch between languages
- Missing required language sections

### ⚠️ Warnings (Non-Blocking)

- TODO placeholders
- Missing optional fields
- Content quality issues
- Minor structural inconsistencies

## Common Issues & Fixes

### Issue: "Spanish section contains English text"

**Cause:** Copy-pasted English content into Spanish section  
**Fix:** Translate the flagged text to Spanish

### Issue: "Section count mismatch: EN has 10, ES has 6"

**Cause:** Missing Spanish translations for some sections  
**Fix:** Add missing Spanish sections to match English structure

### Issue: "Placeholder text found: 'TODO'"

**Cause:** Incomplete translations  
**Fix:** Replace TODO with actual translated content

### Issue: "Legacy key: 'letter'"

**Cause:** Old schema format not migrated  
**Fix:** Run migration scripts:

```bash
python scripts/fix-final-two.py
python scripts/migrate-apology-framework.py
```

## Integration with CI/CD

The audit is integrated into the build pipeline:

1. **Pre-Build** (`npm run build`)
   - Runs `audit-json-resources.py`
   - Fails build if errors found
   - Continues with warnings

2. **Pre-Deploy** (`npm run pre-deploy`)
   - Runs full site validation
   - Includes JSON audit results
   - Generates deployment report

## Maintenance

### Adding New Checks

Edit `scripts/audit-json-resources.py`:

```python
def _check_custom_rule(self, data: Dict, filename: str):
    """Add your custom validation logic"""
    for lang in ['en', 'es']:
        # Your check here
        if condition:
            self.errors.append("Error message")
```

Then add to `audit_file()` method:

```python
self._check_custom_rule(data, filepath.name)
```

### Language Detection Tuning

Adjust indicators in `audit-json-resources.py`:

```python
ENGLISH_INDICATORS = ['the', 'and', 'you', ...]  # Add more
SPANISH_INDICATORS = ['el', 'la', 'que', ...]    # Add more
```

## Files

- `scripts/audit-json-resources.py` - Main comprehensive audit
- `scripts/validate-json-schema.ps1` - PowerShell schema validator
- `scripts/fix-final-two.py` - Auto-fix common issues
- `scripts/migrate-apology-framework.py` - Legacy migration tool
- `scripts/fix-missing-numbers.ps1` - Auto-add missing numbers

## Exit Codes

- `0` - All files pass (may have warnings)
- `1` - One or more files have errors

## Best Practices

1. **Run audit before committing**

   ```bash
   python scripts/audit-json-resources.py
   ```

2. **Fix errors before warnings**
   - Errors block builds
   - Warnings are informational

3. **Keep English and Spanish in sync**
   - Same number of sections
   - Same number of items
   - Same structure

4. **No placeholders in production**
   - Replace all TODO markers
   - Complete all translations

5. **Test after migration**
   ```bash
   python scripts/audit-json-resources.py
   npm run build
   ```
