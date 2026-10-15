# SafeStart Standalone Learning Center Design

**Date:** 2026-10-15
**Status:** Draft for written review
**Branch:** `codex/lesson-learning-ui`

## Goal

Add a standalone learning experience at `/learn` where beginners study four crypto-safety lessons and answer questions that directly assess each lesson. The new page must use the visual language of the existing landing page while leaving the current landing page, `/play` mission flow, wallet behavior, receipts, Fuji transactions, coach, voice practice, and certificate logic intact.

## Scope

The learning center contains four sequential lessons:

1. Protecting a recovery phrase.
2. Detecting fake websites and links.
3. Reviewing a transaction before signing.
4. Responding to social engineering.

Each lesson contains localized lesson copy, key points, and exactly three multiple-choice questions. A learner must answer all three questions correctly to complete the lesson and unlock the next lesson. Incorrect answers show an explanation and can be retried without a limit.

The page defaults to Thai and offers an English toggle. Learning progress is local browser state only. It is not proof of mission completion and has no authority over `/play`, receipts, certificate eligibility, wallet actions, or blockchain verification.

## Non-goals

- Do not redesign `/` or `/play`.
- Do not change mission 1–4 content, verification, receipts, APIs, wallet code, voice practice, coach behavior, or certificate minting.
- Do not introduce XP, streaks, hearts, leaderboards, fabricated metrics, or financial recommendations.
- Do not add an API route, database, authentication flow, runtime dependency, or blockchain interaction for learning progress.

## Information Architecture

`/learn` is a single course runner. It shows one active lesson at a time and moves through four phases:

```text
lesson -> key points -> quiz -> completed
```

The page contains:

1. The existing shared navigation, with a `Learn` destination added using the current navigation style.
2. A short course introduction.
3. A learning path showing `locked`, `current`, and `completed` states.
4. The active lesson surface.
5. A three-question quiz shown one question at a time.
6. A completion state that allows review or continues to the next unlocked lesson.

Completed lessons remain available for review. Locked lessons explain that the previous lesson must be completed first.

Lesson 1 is available initially. Lesson `n` is available only when every earlier lesson is completed. The current lesson is the first incomplete available lesson; selecting a completed lesson opens it in review mode without changing later progress.

## Visual Direction

The new route reuses the landing page's existing components and CSS conventions rather than creating a separate visual system. It uses the same navigation, section widths, typography, neutral zinc palette, borders, card radii, button treatment, dark mode behavior, responsive spacing, and restrained animation patterns.

The page must not add gradients, glows, glassmorphism, oversized decorative cards, or pill-heavy status UI. Status is communicated through hierarchy, border treatment, text, and accessible labels. Desktop uses a path-and-content layout; narrow screens stack the path above the active lesson. Interactive touch targets are at least 44 by 44 CSS pixels.

## Content Model

New learning content lives under `content/lessons/` and does not modify `content/missions/1.json` through `4.json`.

```ts
type Locale = "th" | "en";
type LocalizedText = { th: string; en: string };

type QuizOption = {
  id: string;
  text: LocalizedText;
};

type QuizQuestion = {
  id: string;
  prompt: LocalizedText;
  options: QuizOption[];
  correctOptionId: string;
  explanation: LocalizedText;
};

type LessonContent = {
  id: "1" | "2" | "3" | "4";
  title: LocalizedText;
  summary: LocalizedText;
  lesson: LocalizedText;
  keyPoints: LocalizedText[];
  quiz: QuizQuestion[];
};
```

Every quiz question must be answerable from its lesson text or key points. Each lesson has exactly three questions, option IDs are unique within a question, and `correctOptionId` must identify exactly one option. Missing requested-locale copy falls back to English.

## Lesson Content Requirements

### Lesson 1: Protecting a recovery phrase

- Explain what a recovery phrase controls.
- State that legitimate support staff and websites never need it.
- Teach offline storage and safe refusal.
- Quiz scenarios distinguish safe storage and legitimate requests from attempts to steal the phrase.

### Lesson 2: Detecting fake websites and links

- Teach learners to inspect the complete domain.
- Prefer bookmarks and independently reached official channels.
- Explain urgency, look-alike pages, and deceptive links.
- Quiz scenarios ask what to verify before connecting a wallet or entering information.

### Lesson 3: Reviewing a transaction before signing

- Teach checking network, recipient, amount, and requested contract action.
- Explain the difference between sending assets, approvals, and unlimited approvals.
- Teach rejecting a transaction when displayed details do not match intent.
- Quiz scenarios model a wallet confirmation screen without triggering a real wallet action.

### Lesson 4: Responding to social engineering

- Teach learners to recognize urgency, authority, fear, and rewards.
- Encourage pausing instead of reacting immediately.
- Verify identity through a separate trusted channel.
- Quiz scenarios ask for the safest response to manipulative messages or calls.

## Client State and Progress

Learning progress uses localStorage key `safestart.learning.v1`.

```ts
type LearningProgress = {
  version: 1;
  locale: Locale;
  completedLessonIds: Array<"1" | "2" | "3" | "4">;
};
```

The parser accepts unknown input and returns a safe default when the value is malformed, has an unsupported version, or contains invalid fields. Duplicate and unknown lesson IDs are removed. If localStorage is unavailable, progress remains in memory for the current session.

Completing a quiz marks only learning progress. It never writes a mission receipt, changes certificate readiness, calls a verification API, or marks a `/play` mission complete.

## Component Boundaries

- `app/learn/page.tsx` owns route metadata and renders the learning client.
- `components/LearningClient.tsx` coordinates locale, selected lesson, phase, answers, and persisted learning progress.
- `components/LessonPath.tsx` renders the ordered lesson states and selection controls.
- `components/LessonPanel.tsx` renders localized lesson copy and key points.
- `components/LearningQuiz.tsx` renders one question at a time, native radio options, feedback, retry, and progression controls.
- `lib/learning.ts` owns content types, normalization, locale fallback, lesson lookup, and quiz evaluation.
- `lib/learning-progress.ts` owns defensive parsing and immutable progress updates.

Components remain presentation-focused. No mission pass/fail, signing, minting, chain, receipt, or API logic moves into the learning UI.

## Error and Edge-case Handling

- A malformed or old localStorage value resets to Thai with no completed lessons.
- An unknown option ID is always incorrect and cannot complete a lesson.
- A missing answer cannot advance the quiz.
- Missing Thai copy falls back to English instead of rendering an empty string.
- A locked lesson cannot be opened through a stale UI control.
- Reloading restores completed lessons and locale when storage is available.
- Storage failure keeps the page usable in memory and does not claim persistence.

## Accessibility

- Use semantic headings and navigation landmarks.
- Use native radio controls and buttons for quiz interactions.
- Expose the current lesson with `aria-current` and locked lessons with native disabled behavior.
- Provide visible keyboard focus, sufficient contrast, and readable Thai and English line lengths.
- Do not rely on color alone for lesson or answer status.
- Respect reduced-motion preferences and keep animations nonessential.

## Verification

Unit tests cover:

- Content schema and exactly three quiz questions per lesson.
- Complete Thai and English copy with English fallback behavior.
- Unique option IDs and valid correct option references.
- Correct, incorrect, unknown, and missing answers.
- All-correct completion requirements.
- Malformed, outdated, duplicate, and unknown localStorage values.
- Sequential unlocking and review of completed lessons.

Repository verification runs focused tests, `npm run lint`, `npm run typecheck`, the full `npm test`, and `npm run build`.

Browser acceptance checks `/`, `/play`, and `/learn` at desktop and phone widths. It verifies that `/` and `/play` retain their existing behavior and visual structure, while `/learn` supports Thai-first content, English switching, incorrect-answer feedback, retry, sequential unlock, refresh persistence, keyboard operation, and clear focus states.

## Documentation Updates

After implementation, update only the relevant sections of `PROJECT.md`, `TODO.md`, and `docs/architecture.md` to describe `/learn`, its content contract, and the fact that local learning progress is not mission authority.
