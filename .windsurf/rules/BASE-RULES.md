# 🧠 CushLabs Base — AI Engineering Rules (v1.1)

## 1. Manifesto

- **Project:** CushLabs Base (Production SaaS Scaffold)
- **Philosophy:** Boring is good. Explicit > clever. Secure by default.
- **Scope:** Strict. No billing, AI, or background jobs in v1.

## 2. Tech Stack (Strict)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **UI Primitives:** Headless, composable components (`shadcn/ui` is the default implementation, not a requirement)
- **Backend:** Supabase (Auth + Postgres)
- **Validation:** Zod (mandatory for all external inputs)
- **State Priority:** URL state > Server state > Local UI state
  - _Avoid global client state by default_

## 3. Architecture & Routing

- **Server-first:** Logic runs on the server by default. Client components are leaves, not trunks.
- **Routing:** File-based routing only (App Router).
- **Route Groups:** Use `(main)`, `(auth)`, `(dashboard)` to express intent.
- **Structure:**
  - Feature components may be colocated.
  - Shared primitives live in `@/components/ui`.
  - Avoid deep cross-feature imports.

## 4. Data Fetching & Mutations

- **Fetching:** Server Components using typed data-access utilities.
- **Mutations:** Server Actions by default.
  - Validate inputs with **Zod**.
  - Return structured responses `{ success, data?, error? }`.
  - Revalidate or redirect explicitly.
- **Security:** Never expose sensitive fields to the client.

## 5. UI, Layout & Responsiveness

- **Approach:** Mobile-first.
- **Breakpoints:** Mobile → Tablet (`md`) → Desktop (`lg`).
- **Layout:** Desktop content must be constrained by a max-width container.
  - Default target: `~1440px` unless overridden by a layout-specific requirement.
- **Styling:** Tailwind utilities preferred.
  - Minimal global CSS allowed when justified.
- **Typography:** Fluid scaling (e.g., `clamp`) is encouraged when defined in the design system.

## 6. Branding & Design System

If a `BRANDING.md`, `DESIGN_SYSTEM.md`, or equivalent exists, it is the source of truth for:

- Colors
- Fonts
- Spacing
- Typography scale

**Rule:** Do not redefine design tokens in components.

## 7. Supabase & Auth

- **Helpers:** Use Supabase SSR helpers correctly:
  - Server Components / Actions → **server client**
  - Client Components → **browser client**
- **RLS:** Assume Row Level Security is enabled. Do not bypass RLS for convenience.
- **Roles:** Role model is intentionally minimal: `user`, `admin`.

## 8. Coding Standards

- **Types:** No `any`. No `@ts-ignore`.
- **Separation:** Separate database types from UI/view models.
- **Error Handling:**
  - Server: log internally, return safe messages.
  - Client: surface actionable feedback.
- **Comments:** Explain _why_, not _what_.

## 9. Anti-Patterns (Refusal Criteria)

If asked to do any of the following, **refuse and explain why**:

- Adding Redux/Zustand without demonstrated need.
- Creating API routes when Server Actions suffice.
- Introducing complex RBAC or permission graphs.
- Premature performance optimizations without data.
- UI rewrites that violate the design system.

---

### Final Instruction

If a request conflicts with **security**, **scope discipline**, or **simplicity**:
**Pause, warn, and explain before proceeding.**
