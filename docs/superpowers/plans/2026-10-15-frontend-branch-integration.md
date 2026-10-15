# Frontend Branch Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the `frontend` branch landing-page design on `main` without breaking Core wallet, missions, voice, or deployment.

**Architecture:** Merge `origin/frontend` into a temporary integration branch, then repair missing presentation components and replace unavailable image assets with self-contained markup. Keep `/play`, API routes, wallet logic, and voice flow unchanged. Fast-forward `main` only after full verification.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4

**Spec:** `PROJECT.md`, `AGENTS.md`, and the request to adopt `origin/frontend` on `main`

## Global Constraints

- Core wallet only; never restore guest-wallet copy or behavior.
- Avalanche Fuji only; preserve chain ID `43113` behavior.
- Do not expose secrets or move server modules into client components.
- Add no dependency for presentation-only components.
- Keep `main` deployable; rollback is `git revert -m 1 <merge-commit>`.

## Review Focus

- Missing imported components must fail typecheck before repair and resolve afterward.
- Missing sponsor images must not produce broken requests.
- Landing copy must match four currently available missions and Core wallet requirement.
- Shared navigation must remain usable at desktop and phone widths.
- `/play` wallet, voice, mission, and coach controls must remain present.

---

### Task 1: Merge frontend branch safely

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `components/Navigation.tsx`

- [ ] Merge `origin/frontend` with `--no-commit --no-ff`.
- [ ] Run typecheck and record expected missing-component failures.

### Task 2: Repair presentation compatibility

**Files:**
- Create: `components/AnimatedSection.tsx`
- Create: `components/BentoGrid.tsx`
- Create: `components/Section.tsx`
- Create: `components/StatCard.tsx`
- Modify: `components/Navigation.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] Add small typed presentation components matching imports from `app/page.tsx`.
- [ ] Replace missing sponsor images with accessible text marks.
- [ ] Replace guest-wallet and unimplemented-mission claims with current product behavior.
- [ ] Mount functional Home/Missions navigation without fake controls.
- [ ] Run focused typecheck and lint.

### Task 3: Verify and integrate main

**Files:**
- Modify: `PROJECT.md` only if Current State evidence changes.
- Modify: `TODO.md` only if a tracked UI task is completed.

- [ ] Run all tests, lint, typecheck, production build, and `git diff --check`.
- [ ] Open `/` and `/play` at desktop and phone widths.
- [ ] Confirm no secret patterns or `.env.local` are staged.
- [ ] Commit the merge, fast-forward local `main`, and push `origin/main`.
