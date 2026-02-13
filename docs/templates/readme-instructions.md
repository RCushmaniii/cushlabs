# README Generation Instructions for AI

> Save this alongside the template and use both when generating READMEs for any CushLabs repo.

---

## Context Extraction Prompt

```markdown
You are generating a production-grade README.md file using the provided template.

## PROJECT CONTEXT

First, analyze the repository and extract:

1. **Core Function**: What does this solve? (1 sentence)
2. **Target User**: Who is this for? (specific persona)
3. **Key Metrics**: Any measurable results/benchmarks?
4. **Tech Stack**: Main dependencies (Next.js, Supabase, etc.)
5. **Current State**: Is this production-ready, MVP, or experimental?
6. **Unique Value**: What makes this different from alternatives?

Scan these files for context:
- `/package.json` — dependencies, scripts
- `/app/` or `/src/` — architecture patterns
- `/.env.example` — required configuration
- `/docs/` — existing documentation
- `/supabase/migrations/` — database schema
- Any existing README.md — preserve useful content

## TONE & VOICE REQUIREMENTS

✅ **DO:**
- Use calm, professional tone (executive-level)
- Lead with outcomes and benefits
- Include concrete metrics when available
- Be specific with commands and file paths
- Use technical precision without jargon
- State assumptions clearly
- Assume Windows 11 + PowerShell for all commands

❌ **DON'T:**
- Use hype language ("revolutionary", "game-changing", "cutting-edge")
- Make unsupported claims
- Use emoji excessively (functional icons only)
- Write vague descriptions
- Skip file paths in code examples
- Use placeholder text like "Coming soon" without context

## CONTENT RULES

### 1. Overview Section
- **Maximum 3 sentences** for description
- Include 1 concrete value proposition
- If metrics exist (e.g., "52% ticket deflection"), feature prominently
- Example: ❌ "A powerful tool for automation" → ✅ "Reduces manual data entry time by 73% through AI-powered document processing"

### 2. Features Section
- **Benefits over features**: ✅ "Sub-2s response time" not ❌ "Fast performance"
- Use table format for feature/benefit mapping
- Include 4-6 core capabilities maximum
- Each feature needs measurable or observable outcome

### 3. Quick Start Section
- **All commands must be PowerShell-ready**
- Include full file paths: `notepad .env.local` not `edit .env`
- Number steps clearly (1, 2, 3, 4)
- Test commands yourself or flag if untested
- Include expected output or success indicators

### 4. Live Demo
- If live demo exists → make it prominent (top 3 sections)
- If no demo → remove section entirely (don't say "coming soon")
- Include 2-3 specific test scenarios users can try
- Add screenshot with descriptive caption

### 5. Project Structure
- Show actual directory structure from repository
- Include 1-line comment per key directory
- Maximum 2 levels deep unless critical
- Format as code block with proper tree structure

### 6. Performance/Metrics
- Only include if you have real data
- Show targets vs actuals in table format
- Use P95/P99 percentiles for latency
- Source from monitoring tools or benchmarks

### 7. Security Section
- List implemented security measures (✅ checkmark)
- Reference separate SECURITY.md if exists
- Flag missing critical security (rate limiting, RLS, etc.)
- No generic "we take security seriously" statements

## FILE PATH CONVENTIONS

Always use Windows-style paths in commands:

```powershell
# ✅ Correct
notepad .env.local
code .\src\lib\config.ts
cd .\app\api

# ❌ Wrong
vim .env.local
nano config.ts
```

For cross-platform file references in documentation, use forward slashes:
```markdown
See `src/lib/config.ts` for configuration
```

## VALIDATION CHECKLIST

Before finalizing, verify:

- [ ] No placeholder text remains ("TODO", "Coming soon", "[Your X]")
- [ ] All commands are PowerShell-compatible
- [ ] Metrics are sourced or marked as estimates
- [ ] Live demo link works (or section removed)
- [ ] File paths match actual repository structure
- [ ] All code blocks have language specified
- [ ] Screenshots exist for visual sections
- [ ] No marketing hype in technical sections
- [ ] Prerequisites are complete and versioned
- [ ] License file exists and is referenced correctly

## DECISION TREE FOR OPTIONAL SECTIONS

**Include "Live Demo" if:**
- Deployed URL exists AND is stable
- Demo is representative of actual functionality
- No authentication required for basic testing

**Include "Performance" if:**
- Real metrics from production/staging exist
- OR benchmarks have been run with methodology
- Skip if only theoretical expectations

**Include "Roadmap" if:**
- Specific features with timeline exist
- OR active GitHub project board exists
- Mark completed items with strikethrough

**Include "vs. Alternatives" if:**
- Direct competitors exist and are well-known
- Meaningful differentiation can be shown
- Comparison is factual, not marketing

**Include "Video Walkthrough" if:**
- Professional video exists (not placeholder)
- Video adds value beyond screenshots
- URL is permanent (YouTube, Vimeo)

## OUTPUT FORMAT

Generate in this order:

1. **Summary** (50 words): Brief description of what you're documenting
2. **Assumptions Made**: List any gaps you filled with reasonable defaults
3. **README.md Content**: Full markdown following template
4. **Missing Elements**: What couldn't be determined from repo (screenshots, metrics, etc.)
5. **Recommendations**: 2-3 suggestions to improve documentation

## EXAMPLE QUALITY MARKERS

### ✅ GOOD - Specific, measurable, calm
> "Processes 10,000 documents/hour with 99.3% accuracy using GPT-4 Vision. Reduces manual review time from 8 hours to 45 minutes per batch."

### ❌ BAD - Vague, hypey, unmeasurable
> "Revolutionary AI-powered solution that transforms your document workflow. Experience the future of automation!"

### ✅ GOOD - Clear command with context
```powershell
# Install dependencies (requires Node.js 18.17+)
pnpm install

# Expected output: "Packages: +247 (30s)"
```

### ❌ BAD - Unclear command, no context
```bash
npm i
```

## FINAL CHECK

Ask yourself:
1. Could an experienced developer deploy this in <30 minutes?
2. Does every claim have evidence or clear attribution?
3. Would a non-technical executive understand the value?
4. Are there zero instances of hype language?
5. Do all code examples include file paths?

If any answer is "no", revise before delivering.
```

---

## Usage Pattern

**Step 1**: Give AI the template + these instructions + repository access

**Step 2**: Run this prompt:

```markdown
Using the README template and generation instructions provided, create a world-class README.md for this repository.

Repository URL: [your-github-url]
OR
Repository files attached: [list key files]

Additional context:
- Production status: [MVP / Beta / Production / Experimental]
- Live demo: [URL or "none"]
- Key metrics: [any known performance/business metrics]
- Target audience: [SMBs / Developers / Enterprises / etc.]

Follow all tone, formatting, and validation requirements exactly.
```

**Step 3**: AI outputs:
1. Summary of project understanding
2. Assumptions made
3. Complete README.md
4. List of missing elements (screenshots, etc.)
5. Recommendations

---

## Quality Gates

Before accepting the generated README, verify:

| Criteria | Pass/Fail |
|----------|-----------|
| Zero placeholder text | ⬜ |
| All commands are PowerShell | ⬜ |
| No hype language present | ⬜ |
| Live demo works (or removed) | ⬜ |
| File paths match repo structure | ⬜ |
| Metrics are sourced or flagged | ⬜ |
| Quick start is <5 steps | ⬜ |
| Code blocks have language tags | ⬜ |
