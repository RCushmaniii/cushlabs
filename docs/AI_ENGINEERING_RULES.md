# AI Engineering Rules

**File:** `docs/AI_ENGINEERING_RULES.md`  
**Purpose:** A single, platform-agnostic rulebook for any AI coding assistant contributing to this project.

These rules govern **engineering decisions, architecture, UI behavior, and delivery quality**.
They are **authoritative**. If a change conflicts with these rules, the change is wrong.

---

## 0) Operating Mode

- Think like a senior production engineer.
- Default to clarity, restraint, and predictable systems.
- Optimize for maintainability and calm execution.

---

## 1) Think in Systems, Not Files

Never reason about a file in isolation.

Always identify:

- runtime context (server / client / edge / worker)
- lifecycle (build-time / request-time / runtime)
- ownership of responsibility (data / layout / interaction)

If the system cannot be explained in **3–5 sentences**, stop and clarify.

---

## 2) Default to the Simplest Viable Architecture

Prefer boring, proven solutions.

- Avoid novelty unless it solves a documented problem.
- Complexity must earn its place.
- Avoid speculative extensibility.

Innovation belongs in the **experience**, not dependencies.

---

## 3) Hard Boundaries and Clean Responsibilities

Separate concerns aggressively:

**Data**

- loading, validation, parsing, transformation

**UI Structure**

- layout composition, typography, spacing, content presentation

**Interaction**

- state, events, observers, animations, browser APIs

Do not mix interaction logic into data loading/parsing.
Do not let UI composition hide runtime behavior.

---

## 4) Explicit Behavior Only

Avoid patterns that hide costs, side-effects, or runtime boundaries.

- Prefer explicit state and effects only when required.
- If behavior is implicit, it is suspect.

---

## 5) Every Interactive Feature Must Be Justified

Interaction is not “free.”

- If a feature adds motion, state, or complexity, justify it.
- If the justification is weak, remove it or refactor it.

---

## 6) Animation Is Communication

Motion must reinforce meaning, pacing, and comprehension.

Rules:

- No spectacle by default (no bounce/spring unless explicitly required)
- Favor subtle opacity/transform and slow ease-out
- One major animated moment per page (at most)
- Always respect `prefers-reduced-motion`
- Never introduce layout shift or unstable layout behavior

---

## 7) Typography Is a Core System

Typography is structure, not decoration.

Protect:

- reading width
- line height and rhythm
- paragraph spacing and pacing
- whitespace as “silence”

Long-form content must feel calm and readable.

---

## 8) Build for Failure States

Assume:

- missing content
- slow networks
- unexpected screen sizes
- partial data

The system must:

- degrade gracefully
- avoid layout shift
- avoid runtime-only surprises

Failure should be quiet and dignified.

---

## 9) Compilation and Verifiable Correctness

Work is not complete until:

- the project builds cleanly
- warnings are not ignored
- deprecated APIs are removed
- correctness is verified (not assumed)

No “probably works” finishes.

---

## 10) Write Code for the Next Reader

Favor clarity over cleverness.

- Name things honestly.
- Comment **why**, not what.
- Reduce cognitive load wherever possible.

Good code is calm code.

---

## 11) Avoid Over-Engineering Small Projects

Small scope demands clean execution, not abstraction.

- No premature generalization.
- No speculative extensibility.
- Finish small things cleanly.

---

## 12) Ambiguity Protocol (Clarify Before Guessing)

If anything is ambiguous:

- do not invent constraints
- do not assume preferences
- state what is unclear
- ask the minimum questions needed to proceed
- if you must proceed, use the safest defaults and document assumptions

Senior engineers clarify, then build.

---

## 13) Respect the User’s Attention

Every decision must answer:

> “Does this respect the user’s time, focus, and emotional state?”

If not, remove it.

---

## 14) Think Like a Product, Not a Demo

Even internal work represents:

- judgment
- taste
- restraint

Assume it will be evaluated accordingly.

---

## Final Rule

> **Restraint is a feature.**

When in doubt:

- choose clarity
- choose silence
- choose simplicity

---

# Execution Profiles

Profiles apply **only when the project uses that platform**.
They are extensions of the rules above, not replacements.

---

## Profile: Next.js App Router (Server/Client Discipline)

### Default Mode

- Assume Server-first.
- Introduce Client behavior only when required.

### Responsibilities

**Server**

- load data/content
- parse/transform content
- compose layout and render static UI

**Client**

- user interaction
- browser APIs (`window`, `document`, `IntersectionObserver`, etc.)
- animations and viewport observation

### Client-Only Justification Header

Every client-only file must include a short justification at the top:

```ts
// Client Component because: uses IntersectionObserver for scroll-triggered fades
```

If the justification is weak, refactor.

### Boundary Integrity

- Keep parsing/loading in server utilities or server components.
- Keep effects/observers in isolated client components.
- Do not allow accidental mixing of server and client responsibilities.

### Styling

- Prefer Tailwind CSS and explicit global styles.
- Avoid styling approaches that hide client-only behavior or runtime costs.
