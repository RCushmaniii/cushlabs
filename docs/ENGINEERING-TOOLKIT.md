# CushLabs Engineering Toolkit

**File:** `docs/ENGINEERING-TOOLKIT.md`
**Purpose:** Documents the tools, skills, and automation CushLabs uses to enforce engineering quality at every stage of development.

---

## Philosophy

Tools don't replace discipline — they enforce it. A good toolkit makes the right thing easy and the wrong thing hard. Every tool in this stack earns its place by preventing a specific category of failure.

We keep the toolkit lean. More tools means more context, more maintenance, and more things that can break. Each tool below was evaluated against one question: **Does this prevent bugs from reaching clients?**

---

## The Stack

### Development Environment

| Tool | Purpose |
|---|---|
| **Claude Code (CLI)** | AI-assisted development — the primary engineering interface |
| **Next.js (App Router)** | Production web framework — server-first, TypeScript, built-in optimization |
| **Tailwind CSS** | Utility-first styling — consistent, maintainable, no dead CSS |
| **shadcn/ui** | Component foundation — customized per project, never used stock |
| **TypeScript (strict mode)** | Type safety — catches an entire category of bugs at compile time |
| **pnpm** | Package management — fast, disk-efficient, strict dependency resolution |

### Quality Automation (Claude Code Skills)

These skills run automatically during development, catching issues before they become bugs.

#### Security — OWASP Security Skill

**Source:** [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp)
**Trigger:** Auto-activates when building authentication, authorization, APIs, or handling user input.

What it catches:
- OWASP Top 10:2025 violations
- ASVS 5.0 compliance gaps
- Agentic AI security risks (2026 patterns)
- Injection, XSS, CSRF, broken access control, security misconfiguration

**Why it matters:** Security vulnerabilities in client deliverables are unacceptable. This skill ensures security review happens during development, not as an afterthought.

#### Testing — Webapp Testing Skill

**Source:** [anthropics/skills/webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)
**Trigger:** Used when verifying frontend functionality, debugging UI issues, or running automated checks.

What it provides:
- Playwright-based browser automation
- Server lifecycle management for test environments
- Screenshot capture and visual verification
- Browser console log inspection
- Semantic selector patterns (text-based, role-based)

**Why it matters:** "It works in dev" isn't proof. Automated browser testing catches rendering issues, interaction bugs, and integration failures that manual inspection misses.

#### Code Review — Code Review Plugin

**Source:** [anthropics/claude-code/plugins/code-review](https://github.com/anthropics/claude-code/tree/main/plugins/code-review)
**Trigger:** Invoked via `/code-review` on any branch with a pull request.

What it does:
- Runs 5 parallel review agents against the diff
- Each agent evaluates from a different perspective (correctness, security, performance, maintainability, style)
- Confidence-based scoring determines if the PR passes
- Can post review comments directly to GitHub

**Why it matters:** A single perspective misses things. Multi-agent review systematically covers blind spots that any individual reviewer — human or AI — would miss.

#### Stack Expertise — Next.js Skills

**Source:** [wsimmonds/claude-nextjs-skills](https://github.com/wsimmonds/claude-nextjs-skills)
**Trigger:** Auto-activates when working in Next.js projects.

10 focused modules covering:
- App Router fundamentals and migration patterns
- Server vs. client component decision-making
- Dynamic routes and parameter handling
- Search params with Suspense boundaries
- Cookie patterns for client components
- Server-side navigation without unnecessary `'use client'`
- Common anti-patterns and how to avoid them
- Advanced routing (parallel routes, intercepting routes, streaming)
- Vercel AI SDK v5 integration

**Why it matters:** Next.js App Router has subtle patterns that, when done wrong, cause hydration errors, performance degradation, and maintenance nightmares. These skills encode the correct patterns so every component is built right the first time.

#### Frontend Design — Frontend Design Skill (CushLabs Edition)

**Source:** Custom skill, adapted from [anthropics/skills/frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
**Trigger:** Auto-activates when building UI components, pages, or applications.

What it enforces:
- Distinctive, intentional design — no generic AI aesthetics
- `next/font` for performance-safe font loading
- Mobile-first responsive design (320px to ultrawide)
- Systematic dark mode via CSS variables
- WCAG 2.1 AA accessibility
- Tailwind + shadcn/ui customization patterns
- `prefers-reduced-motion` respect
- Handoff-ready component architecture

**Why it matters:** Design quality is the first thing clients see. This skill ensures every interface is visually distinctive, technically sound, and maintainable by the client's team after handoff.

#### Repository Standards — Repo Standardizer

**Source:** Custom CushLabs skill.
**Trigger:** Invoked via `/repo-standardizer` when setting up or auditing a repository.

What it enforces:
- Consistent repo structure across all CushLabs projects
- Required files (README, LICENSE, CLAUDE.md, .gitignore)
- Standard configuration patterns

**Why it matters:** Consistency across projects reduces cognitive load and ensures every repo meets the same baseline quality.

---

## What We Evaluated and Declined

Not every tool makes the cut. These were considered and intentionally excluded:

| Tool | Why We Skipped It |
|---|---|
| **ClaudeKit** (20+ subagents) | Kitchen-sink bloat. The pieces we need are covered better by focused, individual skills. |
| **AgentSys** (43 agents, 30 skills) | Designed for large teams, not a solo operator + AI workflow. |
| **Mega-collections** (60-270+ skills) | Context window pollution. More skills = more tokens spent on trigger evaluation = slower, less focused responses. |
| **xlsx skill** | Niche. We don't do spreadsheet work regularly. Can be added in minutes if a client engagement requires it. |
| **web-artifacts-builder** | Builds throwaway HTML demos for claude.ai chat, not production applications. |
| **VibeSec** | Overlaps heavily with OWASP skill. One comprehensive security skill is better than two overlapping ones. |
| **Trail of Bits skills** | Professional security research tools (CodeQL, Semgrep). Heavyweight tooling we don't need for application development. |

**Principle:** A lean toolkit with six focused skills beats a bloated toolkit with sixty unfocused ones. Every skill consumes context window space and competes for activation. Keep it tight.

---

## How It All Fits Together

```
Developer Request
       │
       ▼
┌──────────────┐
│  Claude Code  │ ◄── Next.js Skills (stack expertise)
│   (CLI)       │ ◄── Frontend Design (aesthetics + standards)
│               │ ◄── OWASP Security (real-time security review)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Code Written │
│  & Tested     │ ◄── Webapp Testing (Playwright verification)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PR Created   │
│  & Reviewed   │ ◄── Code Review Plugin (5-agent review)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Shipped      │ ◄── Repo Standardizer (consistency check)
└──────────────┘
```

Security is active at every stage. Testing validates before merge. Review catches what development missed. Standards ensure consistency across projects.

---

## Adding New Tools

Before adding any skill, plugin, or tool to the stack, it must pass this checklist:

- [ ] **Does it prevent a specific category of failure?** If not, skip it.
- [ ] **Is there already a tool covering this?** Overlap creates confusion.
- [ ] **Does it work on Windows 11?** Our environment is non-negotiable.
- [ ] **Is the context window cost justified?** Every skill competes for attention.
- [ ] **Is it maintained?** Abandoned tools become liabilities.
- [ ] **Can it be added later?** If the need isn't immediate, wait.

> **The best toolkit is the smallest one that catches every category of bug.**
