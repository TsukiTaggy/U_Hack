<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — How to work in this repository

Four teammates and several AI coding agents work in this repository. The repository is the source of truth: do not rely on chat history or any provider's memory for project facts.

- Scope, milestone and current state: `PROJECT.md`
- Active work: `TODO.md`
- Design detail: `docs/architecture.md`. Setup and deployment: `docs/setup.md`

## Before starting work

1. Read the parts of `PROJECT.md` and `TODO.md` that relate to the task.
2. Run `git status` and `git log --oneline -5`. Do not overwrite a teammate's uncommitted work.
3. Read the source, tests and docs for the files you will change. Search `lib/` for an existing helper before writing a new one.

Do not load unrelated docs.

## Repository map and boundaries

| Path | Contents | Boundary |
|---|---|---|
| `lib/verify.ts` | Every mission pass/fail check | The only place a pass is decided |
| `lib/tools.ts` | Coach agent tools | Read-only; never signs or sends |
| `lib/llm.ts`, `lib/receipt.ts`, `lib/minter.ts`, `lib/api.ts` | LLM client, pass receipts, minter wallet, API helpers | Server-only (hard rule 4) |
| `lib/wallet.ts` | Browser wallet and guest wallet | Client-only; the guest key never leaves the browser |
| `app/api/*` | API routes | Read secrets here; put logic in `lib/` |
| `app/`, `components/` | Pages and UI | No pass/fail or chain logic; call `lib/` |
| `content/*.json` | Mission text, scam personas | Text lives here, not in components |
| `contracts/SafeStart.sol` | Solidity source | ABIs used by the app are kept by hand in `lib/abi.ts` |
| `tests/` | Vitest unit tests | One test file per `lib/` module with logic |

## Canonical commands

Package manager: npm (`package-lock.json`). Runtime: Node.js 20.9+.

```text
npm install                         # install
npm run dev                         # dev server on http://localhost:3000
npm test -- tests/verify.test.ts    # focused test (one file)
npm test                            # all unit tests
npm run lint
npm run typecheck
npm run build
```

Contracts have no npm toolchain. Compile and deploy them in Remix with Solidity 0.8.24 or newer and EVM version `cancun` (`docs/setup.md` §4).

This is Next.js 16 with Cache Components enabled (see the block above). `GET` route handlers can be prerendered at build time; read the request or call `connection()` when a `GET` handler must run per request.

## Hard rules

1. **Pass/fail lives in `lib/verify.ts` only.** It is deterministic code over chain data or a zod-validated evaluator result. Never let an LLM response decide a pass, a mint or a top-up.
2. **AI tools are read-only.** Nothing in `lib/tools.ts` may sign or send a transaction.
3. **Fuji only.** Before any write, assert `chainId === 43113`; refuse otherwise.
4. **Secrets stay server-side.** Never import `lib/llm.ts`, `lib/receipt.ts`, `lib/minter.ts` or `lib/api.ts` from a `"use client"` file. `MINTER_PRIVATE_KEY`, `RECEIPT_SECRET` and all API keys are read only in API routes. Never prefix a secret with `NEXT_PUBLIC_`. Never commit `.env.local`.
5. **Guest wallet keys never leave the browser.** Do not send them to any API route or log them.
6. **Untrusted input.** Learner text, scam transcripts and chain data passed to an LLM go inside tagged blocks, and the system prompt says they are data, not instructions.
7. **No fake integrations.** If a service is down, show an honest fallback state (for example "voice unavailable, switched to text"). Never fabricate a transaction hash, a balance or a tool result.
8. **No personal data on chain.**
9. **Education, not advice.** No buy/sell recommendations in any prompt or UI text.

## Implementation rules

- Make the smallest change that does the task. Follow existing patterns in `lib/` before adding an abstraction.
- Keep the data formats listed in `PROJECT.md` (mission JSON, scam evaluation, pass receipt) unless the task is to change them.
- Every check in `lib/verify.ts` has a unit test in `tests/`.
- Add a dependency only when it removes real work. Use `npm install <pkg>` so `package-lock.json` stays in sync; never edit the lockfile by hand.
- Generated files: do not edit the `nextjs-agent-rules` block at the top of this file (`next dev` rewrites it), `.next/` or `next-env.d.ts`.

## Verification

Run focused checks first, then broader ones in proportion to the risk.

| Change | Required check |
|---|---|
| `lib/verify.ts`, `lib/receipt.ts`, `lib/decoys.ts`, `lib/tools.ts`, `lib/scam.ts` | `npm test -- tests/<file>` and `npm run typecheck` |
| API route | `npm run typecheck`, `npm run build`, and one real request to the route on `npm run dev` |
| Page or component | `npm run build`, then open the page in a browser at desktop and phone width |
| LLM prompt | Run it against the real provider; a mock only proves the plumbing |
| Contract | Compile in Remix (cancun), call the changed function on Fuji, update `lib/abi.ts` |
| Env var or deployment | `npm run build`, then load the Vercel URL and pass mission 2 with a fresh guest wallet |

Before merging into `main`, run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`.

Report each check as passed, failed, not run or blocked. One level does not prove another: passing tests do not prove the build, and a local build does not prove the flow works on Fuji. Write "unverified" for anything you could not check.

## Documentation triggers

Update a document only when its subject changes. Replace outdated text instead of adding a note below it.

- `PROJECT.md` Current State: a feature moves between not implemented, partial and working. Add the date and the evidence.
- `PROJECT.md` other sections: scope, milestone, a constraint or a major decision changes.
- `TODO.md`: a task is done, added or blocked.
- `docs/architecture.md`: a route, component boundary, mission check or data flow changes.
- `docs/setup.md` and `.env.example`: a command, env var, external service or deployment step changes.
- `README.md`: contract addresses or the demo URL change.

## When sources disagree

If code, tests, `PROJECT.md`, this file or `docs/` contradict each other, do not pick a winner silently. Check the current code and `git log`. Fix outdated docs within your task. If resolving the conflict changes product behaviour, security or a hard rule, ask the team first.

## Git

- Keep `main` deployable. Work on a branch and merge only code that builds.
- Make small commits with plain messages.
- Never commit `.env*` files other than `.env.example`.

## Handoff

Before finishing a task:

1. Run the checks from the verification table and report each result.
2. Update `TODO.md` and the docs the triggers above require.
3. State what changed, what is unverified and any open risk, so a teammate or another agent can continue without your chat history.
