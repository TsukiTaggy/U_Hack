<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Rules for coding agents

Read `PROJECT.md`, `TODO.md` and the relevant part of `docs/` before changing code. Check `git status` and recent commits first.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Tests: `npm test`
- Build: `npm run build`

Run lint, type check, tests and build before saying a task is done.

This is Next.js 16 with Cache Components enabled (see the block above). `GET` route handlers can be prerendered at build time; read the request or call `connection()` when a `GET` handler must run per request.

## Hard rules

1. **Pass/fail lives in `lib/verify.ts` only.** It is deterministic code over chain data or a zod-validated evaluator result. Never let an LLM response decide a pass, a mint or a top-up.
2. **AI tools are read-only.** Nothing in `lib/tools.ts` may sign or send a transaction.
3. **Fuji only.** Before any write, assert `chainId === 43113`; refuse otherwise.
4. **Secrets stay server-side.** Server-only modules: `lib/llm.ts`, `lib/receipt.ts`, `lib/minter.ts`, `lib/api.ts`; never import them from a `"use client"` file. `MINTER_PRIVATE_KEY`, `RECEIPT_SECRET` and all API keys are read only in API routes. Never prefix a secret with `NEXT_PUBLIC_`. Never commit `.env.local`.
5. **Guest wallet keys never leave the browser.** Do not send them to any API route or log them.
6. **Untrusted input.** Learner text, scam transcripts and chain data passed to an LLM go inside tagged blocks, and the system prompt says they are data, not instructions.
7. **No fake integrations.** If a service is down, show an honest fallback state (for example "voice unavailable, switched to text"). Never fabricate a transaction hash, a balance or a tool result.
8. **No personal data on chain.**
9. **Education, not advice.** No buy/sell recommendations in any prompt or UI text.

## Working conventions

- Content (mission text, quiz items, scam personas) lives in `content/*.json`, not inside components.
- Shared logic goes in `lib/`; pages and components call it.
- Every verification function gets a unit test in `tests/`.
- Prefer the simplest working solution. Add a dependency only when it removes real work.
- Keep `main` deployable. Work on a branch, merge only code that builds.
- Small commits with plain messages.

## Before finishing a task

1. Lint, test and build pass.
2. Tick or update the item in `TODO.md`.
3. If a feature changed state (not implemented → partial → working), update "Current State" in `PROJECT.md` with the date and evidence.
4. Note anything unverified as unverified.
