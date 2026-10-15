# SafeStart Learning Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone Thai-first `/learn` course with four linked crypto-safety lessons and quizzes while preserving the existing landing page and `/play` mission flow.

**Architecture:** Keep `app/learn/page.tsx` as a small Server Component and place browser state in `LearningClient`. Store bilingual lesson data in new JSON files, keep quiz and progress rules in pure tested helpers, and render the experience with focused presentation components that reuse the landing page's Tailwind visual language.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, React DOM server rendering, localStorage.

**Spec:** `docs/superpowers/specs/2026-10-15-learning-center-design.md`

## Global Constraints

- Preserve the existing `/` and `/play` structure, behavior, mission data, wallet flow, voice practice, receipts, Fuji verification, coach, and certificate logic.
- The only existing UI change is a `Learn` link added to the shared navigation using its current style.
- New content lives in `content/lessons/`; do not modify `content/missions/1.json` through `4.json`.
- Default locale is Thai; the page has an English toggle and missing requested-locale copy falls back to English.
- Each of the four lessons has exactly three multiple-choice questions that are answerable from that lesson.
- Learning completion is browser-local state at `safestart.learning.v1`; it never creates mission receipts or affects `/play` or certificate readiness.
- Add no API route, runtime dependency, database, authentication, wallet call, or blockchain call.
- Use the landing page's existing typography, zinc palette, red accent, borders, card radii, dark mode, responsive spacing, and reduced-motion behavior.
- Do not add XP, streaks, hearts, leaderboards, fabricated metrics, gradients, glows, glassmorphism, or financial recommendations.
- Do not stage, commit, push, or deploy unless the user explicitly requests it; repository instructions override the plan skill's normal commit steps.

## Review Focus

- Malformed, old-version, or partially valid localStorage data resets or normalizes without crashing or unlocking lessons incorrectly; Task 2 tests each form.
- Unknown lesson and option IDs never unlock or complete content; Tasks 1 and 2 test both boundaries.
- Missing Thai copy renders English fallback rather than empty UI; Task 1 tests this with a literal fixture.
- localStorage read/write exceptions leave the course usable in memory and do not claim persistence; Task 2 tests both exception paths and Task 4 confirms the UI remains usable.
- The new shared navigation link and `/learn` route do not change landing or `/play` content and behavior; Task 4 renders navigation/page boundaries and Task 5 performs browser regression checks.

---

### Task 1: Localized lesson content and quiz rules

**Files:**
- Create: `content/lessons/1.json`
- Create: `content/lessons/2.json`
- Create: `content/lessons/3.json`
- Create: `content/lessons/4.json`
- Create: `lib/learning.ts`
- Create: `tests/learning.test.ts`

**Interfaces:**
- Produces: `Locale`, `LocalizedText`, `LessonId`, `QuizOption`, `QuizQuestion`, `LessonContent`, `QuizAnswers`.
- Produces: `lessons`, `lessonById(id: string): LessonContent | undefined`, `localizedText(value: LocalizedText, locale: Locale): string`.
- Produces: `evaluateLearningAnswer(question: QuizQuestion, optionId: string): { correct: boolean; explanation: LocalizedText }` and `isLearningQuizPassed(lesson: LessonContent, answers: QuizAnswers): boolean`.

- [ ] **Step 1: Write failing content-contract tests**

Add tests that assert there are four lessons with IDs `1`–`4`; each localized field has non-empty `th` and `en`; each lesson has at least three key points and exactly three questions; question and option IDs are unique in their scope; and each `correctOptionId` matches exactly one option.

Add literal behavior tests asserting `localizedText({ th: "", en: "Fallback" }, "th") === "Fallback"`, unknown lesson lookup returns `undefined`, an unknown option is incorrect, a missing answer prevents completion, and only three correct answers pass a lesson.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/learning.test.ts`

Expected: FAIL because `lib/learning.ts` and the lesson JSON files do not exist.

- [ ] **Step 3: Implement the four lesson JSON files**

Write Thai and English copy for the approved topics: recovery phrase protection, fake websites and links, transaction review before signing, and social engineering. Make every question traceable to a statement in its lesson or key points and include a localized explanation.

- [ ] **Step 4: Implement `lib/learning.ts`**

Import and expose the four lessons through the exact interfaces above. Normalize imported JSON IDs to `LessonId`, use English fallback for missing requested-locale text, reject unknown options, and require every question to be answered correctly.

- [ ] **Step 5: Run the focused and full suites and verify GREEN**

Run: `npm test -- tests/learning.test.ts`

Expected: the new test file passes.

Run: `npm test`

Expected: all existing 34 tests plus the new learning tests pass.

- [ ] **Step 6: Review the task diff without staging or committing**

Run: `git diff --check`

Expected: no whitespace errors; only Task 1 files are new.

### Task 2: Versioned learning progress and sequential unlocking

**Files:**
- Create: `lib/learning-progress.ts`
- Create: `tests/learning-progress.test.ts`

**Interfaces:**
- Consumes: `Locale`, `LessonId` from `lib/learning.ts`.
- Produces: `LEARNING_STORAGE_KEY = "safestart.learning.v1"`.
- Produces: `LearningProgress = { version: 1; locale: Locale; completedLessonIds: LessonId[] }`.
- Produces: `defaultLearningProgress(): LearningProgress`, `parseLearningProgress(value: unknown): LearningProgress`, `markLessonCompleted(progress: LearningProgress, lessonId: string): LearningProgress`, `isLessonCompleted(progress: LearningProgress, lessonId: string): boolean`, `canOpenLesson(progress: LearningProgress, lessonId: string): boolean`, and `nextLessonId(progress: LearningProgress): LessonId | undefined`.
- Produces: `readLearningProgress(storage: Pick<Storage, "getItem">): LearningProgress` and `writeLearningProgress(storage: Pick<Storage, "setItem">, progress: LearningProgress): boolean`.

- [ ] **Step 1: Write failing progress tests**

Assert the exact Thai-first default; JSON-like malformed values and `version: 0` reset; unknown locale resets to `th`; duplicate IDs are deduplicated in lesson order; unknown IDs are removed; unknown IDs passed to `markLessonCompleted` are ignored; completion is immutable and idempotent; lesson 1 is initially open; lesson `n` opens only when every previous lesson is complete; and `nextLessonId` returns the first incomplete lesson or `undefined` after all four. Use minimal fake storage objects to assert a throwing `getItem` returns the default, a throwing `setItem` returns `false`, and a successful write stores JSON under `safestart.learning.v1` and returns `true`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/learning-progress.test.ts`

Expected: FAIL because `lib/learning-progress.ts` does not exist.

- [ ] **Step 3: Implement `lib/learning-progress.ts`**

Use the canonical lesson order from `lib/learning.ts`; never trust array order or IDs from stored input. Return new objects from update functions and never mutate caller-owned arrays. Catch storage and JSON errors inside the read/write helpers so UI code does not duplicate persistence policy.

- [ ] **Step 4: Run the focused and full suites and verify GREEN**

Run: `npm test -- tests/learning-progress.test.ts`

Expected: all progress tests pass.

Run: `npm test`

Expected: all tests pass with no warnings or errors.

- [ ] **Step 5: Review the task diff without staging or committing**

Run: `git diff --check`

Expected: no whitespace errors.

### Task 3: Accessible learning presentation components

**Files:**
- Create: `components/LessonPath.tsx`
- Create: `components/LessonPanel.tsx`
- Create: `components/LearningQuiz.tsx`
- Create: `tests/learning-ui.test.ts`

**Interfaces:**
- Consumes: content types and `localizedText` from `lib/learning.ts`.
- Produces: `LessonPathItem = { id: LessonId; title: string; status: "locked" | "current" | "completed"; selected: boolean }`.
- Produces: `LessonPath({ items, onSelect })`, where locked items render disabled and the selected item exposes `aria-current="step"`.
- Produces: `LessonPanel({ lesson, locale, review, onStartQuiz })`.
- Produces: `LearningQuiz({ lesson, locale, questionIndex, selectedOptionId, checked, onSelect, onCheck, onRetry, onNext })`; it renders native radio inputs and localized explanation after checking.

- [ ] **Step 1: Write failing accessible-markup tests**

Use `react-dom/server` with `createElement` to assert that `LessonPath` renders a navigation landmark, disables locked lessons, labels completed status, and sets `aria-current="step"` on the selected lesson. Assert that `LessonPanel` renders localized lesson and key-point text, and that `LearningQuiz` renders one radiogroup with the current question's options and no feedback before checking.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/learning-ui.test.ts`

Expected: FAIL because the three components do not exist.

- [ ] **Step 3: Implement the presentation components**

Use existing Tailwind tokens and patterns from `Navigation`, `Section`, and `BentoCard`. Keep components controlled and presentation-focused. Ensure buttons and option labels meet the 44-by-44 CSS-pixel target, visible text accompanies status color, and locked items use native disabled behavior.

- [ ] **Step 4: Run focused checks and verify GREEN**

Run: `npm test -- tests/learning-ui.test.ts`

Expected: accessible-markup tests pass.

Run: `npm run typecheck`

Expected: no TypeScript errors.

- [ ] **Step 5: Review the task diff without staging or committing**

Run: `git diff --check`

Expected: no whitespace errors.

### Task 4: Integrate the `/learn` course runner and navigation

**Files:**
- Create: `components/LearningClient.tsx`
- Create: `app/learn/page.tsx`
- Create: `tests/learn-page.test.ts`
- Modify: `components/Navigation.tsx`

**Interfaces:**
- Consumes: `lessons` and quiz helpers from `lib/learning.ts`; progress helpers and `LEARNING_STORAGE_KEY` from `lib/learning-progress.ts`; the Task 3 components.
- Produces: a static `/learn` Server Component page with metadata title `Learn · SafeStart`.
- Produces: a client-only course runner with phase `"lesson" | "quiz" | "completed"`, Thai-first locale, sequential lesson selection, quiz answer state, and defensive localStorage persistence.

- [ ] **Step 1: Write failing route and navigation tests**

Use `react-dom/server` to assert that `Navigation` still contains Home and Missions links and adds desktop/mobile links to `/learn`. Render the learn page without wallet or mission props and assert it includes a main landmark and the Thai course heading.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/learn-page.test.ts`

Expected: FAIL because the `/learn` page and navigation link do not exist.

- [ ] **Step 3: Implement `LearningClient.tsx`**

Initialize server and first-client render from `defaultLearningProgress()` to avoid hydration differences. In a mount effect, call `readLearningProgress(window.localStorage)`; persist through `writeLearningProgress` while preserving in-memory state when storage fails. Reset question state when changing lessons or retrying. Call `markLessonCompleted` only after `isLearningQuizPassed` returns true.

- [ ] **Step 4: Implement `app/learn/page.tsx` and update navigation**

Keep the route page as a Server Component that exports metadata and renders `LearningClient`. Add `Learn` to both desktop and mobile navigation with the existing link classes; do not alter landing or mission page components.

- [ ] **Step 5: Run focused and repository checks**

Run: `npm test -- tests/learn-page.test.ts`

Expected: route/navigation tests pass.

Run: `npm run lint`

Expected: no lint errors.

Run: `npm run typecheck`

Expected: no TypeScript errors.

Run: `npm test`

Expected: the complete test suite passes.

- [ ] **Step 6: Browser acceptance on the development server**

Open `/`, `/play`, and `/learn` at desktop and phone widths. Verify `/` and `/play` retain their existing content and interactions. On `/learn`, verify Thai default, English switching, lesson 1 available without a wallet, locked lessons disabled, wrong-answer explanation and retry, all-correct completion, sequential unlock, completed-lesson review, refresh persistence, keyboard operation, visible focus, and usable behavior when localStorage reads and writes throw.

- [ ] **Step 7: Review the task diff without staging or committing**

Run: `git diff --check`

Expected: no whitespace errors and no changes under `app/play`, `components/PlayClient.tsx`, `content/missions`, `lib/verify.ts`, wallet, receipt, API, or contract files.

### Task 5: Durable documentation and final verification

**Files:**
- Modify: `PROJECT.md`
- Modify: `TODO.md`
- Modify: `docs/architecture.md`

**Interfaces:**
- Consumes: the verified `/learn` implementation from Tasks 1–4.
- Produces: durable project state describing the route, content contract, browser-local progress, and explicit separation from mission authority.

- [ ] **Step 1: Update only relevant documentation sections**

Update `PROJECT.md` Current State and canonical data formats, the relevant frontend task in `TODO.md`, and route/component/data-flow sections in `docs/architecture.md`. Record the actual date and checks run; mark browser states or environments not exercised as unverified.

- [ ] **Step 2: Run the complete verification matrix**

Run: `npm test -- tests/learning.test.ts tests/learning-progress.test.ts tests/learning-ui.test.ts tests/learn-page.test.ts`

Expected: all new focused tests pass.

Run: `npm run lint`

Expected: pass.

Run: `npm run typecheck`

Expected: pass.

Run: `npm test`

Expected: all tests pass.

Run: `npm run build`

Expected: production build succeeds and includes `/learn`.

Run: `git diff --check`

Expected: pass.

- [ ] **Step 3: Perform final browser regression review**

Recheck `/`, `/play`, and `/learn` at desktop and phone widths after the production build. Confirm keyboard focus and reduced-motion behavior, and distinguish verified local behavior from unverified deployment, wallet, Fuji, and external-service behavior.

- [ ] **Step 4: Report the final branch state without committing**

List changed files, check results, unverified items, and any warning. Leave `codex/lesson-learning-ui` uncommitted until the user explicitly requests a commit, push, or pull request.

