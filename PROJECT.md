# SafeStart — AI Crypto Safety Coach

## Overview

SafeStart is a web app where AI trains crypto beginners to stay safe by letting them make real mistakes on Avalanche Fuji testnet instead of with real money. An AI coach agent reads the learner's actual transactions to explain what happened, an AI scammer adapts its tactics to the learner's replies, and an AI explainer translates transactions into plain language before signing. Learners who pass all missions receive a non-transferable certificate on Fuji.

Built for U-Hackathon 2026, AI Track.

## Problem

People new to crypto lose money on their first mistakes: sending to a look-alike address, misunderstanding fees, approving a malicious contract, or giving a seed phrase to someone posing as support. Guides and videos explain these risks but do not let people practise. Mistakes on mainnet are permanent.

## Goals

- Let a beginner practise the most common costly mistakes in a safe sandbox.
- Make AI the core of the experience: diagnosis from real on-chain data, adaptive scam simulation, plain-language transaction explanation.
- Prove completion with a verifiable, non-transferable certificate.

## Success Criteria

- A first-time user with a Core wallet on Fuji completes missions 1–4 and receives a certificate on the deployed site in under 10 minutes, without signing up anywhere.
- The coach agent answers "why did my transaction fail / where did my money go" correctly from live Fuji data, calling tools rather than guessing.
- Every pass/fail decision is reproducible from chain data or a stored structured evaluation.
- The deployed demo runs the full flow without crashing on 3 fresh Core wallets in a row.

## Target Users

- Primary: people opening their first crypto wallet (students, newcomers in Thailand and SEA).
- Secondary: communities, universities and exchanges that onboard new members and want proof they were trained.

## Scope

In scope:
- Missions 1–5 on Fuji testnet plus a bonus tokenomics mission (see `docs/architecture.md`).
- AI coach agent with read-only chain tools.
- AI scam simulator (voice via ElevenLabs, text fallback) with a separate AI evaluator.
- AI transaction explainer shown before signing.
- AI-generated personal safety report.
- Browser connection to a Core wallet on Fuji; the website never creates or stores learner wallets.
- Non-transferable certificate contract on Fuji.

Out of scope:
- Mainnet, real funds, payments.
- User accounts, login, databases of personal data.
- Integration with any specific wallet app or company product.
- U-Bot inside the product (see Major Decisions).
- Mobile apps.

## Current Milestone

Milestone: M0 Setup → M2 Core loop (Thursday 15 Oct)
Objective: missions 1–4 work end-to-end on the public deployment by 18:00. The certificate is optional (2026-10-16).
Completion criteria:
- Contracts deployed on Fuji; addresses set in env vars and the README.
- Deployed URL completes missions 1–4 with a fresh Core wallet; the certificate mint is optional.

Active tasks: see `TODO.md`.

## Current State

Last verified: 2026-10-16
Evidence: 55 unit tests; lint, type check and production build pass; end-to-end API test (23 checks) against a local chain with chain ID 43113 running the real contracts; AI routes exercised against a mock OpenAI-compatible server. The standalone `/learn` flow (13 lessons, 52 questions) was exercised on a local production build on 2026-10-16 at desktop and phone widths: all 13 lessons completed in sequence, wrong answers show a hint without revealing the answer, Thai/English switching and persisted progress (26/26 browser checks). Fuji/Core wallet flow and the authenticated ElevenLabs microphone path have been manually verified on the deployed URL; deployed `/learn` verification and broader multi-wallet smoke testing remain pending. On 2026-10-16 a saved copy of the deployed `/play` showed one Core wallet with missions 1–4 passed on Fuji (mission 3 transaction `0x7d12…6626`, 21,000 gas, fee 3.507e-12 AVAX, matching the explorer) and the coach answering with the real LLM after a read-only transaction tool call; certificate minting failed on the same run (see TODO Bugs).

Working (local chain):
- Mission checks 2, 3, 4 with signed pass receipts; look-alike address rejected.
- Certificate mint with full re-check; second mint refused; forged receipts refused.
- Explain-before-sign risk rules (unlimited approval to the trap = high; AVAX transfer to a look-alike of a previously used address = high, first-time address = medium).
- ElevenLabs voice practice is configured through a server-only signed-URL route; voice is the default mode and text is the fallback.
- Core wallet connection and the Fuji mission flow are working on the deployed demo.

Partial:
- Missions 3–4 interactive flow (merged to `main` 2026-10-16): practice chat, labelled simulated wallet history with look-alike transfers, explain-before-sign card with gas-reserve check, receipt-based fee breakdown, landing-style `/play`. Evidence: unit tests, lint, typecheck and production build pass; on 2026-10-16 one Core wallet passed missions 3 and 4 on the deployed URL with a real Fuji transaction. Gaps: the tested wallet was the configured tutor address itself and the decoy (look-alike) path was not run on Fuji. Mission 4 now compares the fee paid with the max fee Core signed (`gas × maxFeePerGas` from the transaction), not with SafeStart's earlier estimate.
- Coach agent tool loop: answered on the deployed URL with the real LLM after a read-only transaction lookup (2026-10-16). Text scam call and scam evaluator: mechanics verified with a mock LLM only; mission 1 passed on the deployed URL.
- Frontend landing page and shared navigation are integrated from `frontend`; desktop DOM verification passed locally, with deployed browser validation still pending.
- `/learn` provides 13 standalone Thai/English lessons in three chapters (blockchain basics, using crypto, Web3 safety), each with a four-question quiz, a hint after a wrong answer, sequential unlocks and versioned local progress, plus an AI lesson tutor per lesson (`/api/learn-coach`, added 2026-10-16; checked locally without LLM keys only, real-LLM answers unverified); deployment verification remains pending.
- `/play` page: missions 1–4, coach panel and Core wallet/Fuji flow are working on the deployed URL; a fresh Core wallet passed missions 1–3 on the deployed URL (2026-10-16); certificate minting fails there (invalid `MINTER_PRIVATE_KEY`) and is optional.
- ElevenLabs private-agent voice flow: signed URL route, Voice/Text toggle, published authenticated agent, 120-second limit and transcript-to-evaluator integration are implemented; a full deployed microphone call has passed.

Not implemented:
- Mission 5 page and route, personal safety report, bonus mission (Tokenomist), live board.

## Architecture Summary

```
Browser (Next.js pages)
 ├─ wallet: Core wallet on Fuji (injected EIP-1193 provider)
 ├─ sends learner transactions directly to Fuji
 └─ calls API routes
API routes (Next.js, server)
 ├─ /api/coach        AI agent + read-only chain tools
 ├─ /api/learn-coach AI lesson tutor for /learn (no tools, no wallet)
 ├─ /api/explain-tx   decode calldata (viem) + AI plain-language explanation
 ├─ /api/scam/*       AI scammer turns (text) + AI evaluator → structured JSON
 ├─ /api/elevenlabs/* server-only signed URL for the private voice agent
 ├─ /api/verify/[id]  deterministic mission checks → signed pass receipt
 ├─ /api/mint         re-checks everything, then mints certificate
 └─ /api/unlocks      Tokenomist data for the bonus mission (cached)
Avalanche Fuji C-Chain
 └─ TestUSDC, FakeAirdrop, SafeStartCert (contracts/SafeStart.sol)
```

Detailed design: `docs/architecture.md`

## Repository Map

- `app/` — pages (`/`, `/play`, `/learn`) and API routes (`app/api/*`)
- `components/` — client components (`PlayClient.tsx` runs the mission flow; `LearningClient.tsx` runs the standalone learning flow)
- `lib/` — config, chain client, ABIs, wallet, verification, receipts, decoys, LLM client, agent tools, scam prompts, minter
- `content/` — mission text, standalone lessons and scam personas (JSON)
- `contracts/` — Solidity source (ABIs used by the app are in `lib/abi.ts`)
- `tests/` — unit tests
- `docs/` — architecture and setup

## Domain Rules

- Pass/fail is decided only by deterministic code in `lib/verify.ts`, using chain data or a structured evaluator result. The LLM never decides a pass.
- All writes target Fuji (chain ID 43113). Any other chain is rejected before sending.
- Agent tools are read-only. No AI component holds or can use a signing key.
- One certificate per address; certificates cannot be transferred.
- Nothing personal goes on chain: only addresses, levels and transaction data.
- Scam simulations are always labelled as practice, never ask for a real secret, and learner replies are used only for the evaluation in that session.
- Content is education, not financial advice. No buy/sell recommendations.

## Canonical Data Formats

- Mission definition: `content/missions/<id>.json` — `{ id, title, lesson, task, verify: { type, params } }` — optional extras: `story` (mission 3 practice chat and history labels), `hint` (mission 4)
- Standalone lesson: `content/lessons/<id>.json` — localized `{ id, chapter: { id, title }, title, summary, lesson, keyPoints, quiz }`, each quiz question with `options`, `correctOptionId`, `explanation` and an optional `hint`; quiz completion is browser-only learning progress under `safestart.learning.v2`, never mission pass/fail evidence.
- Scam evaluation: `{ sharedSecret: boolean, followedLink: boolean, verifiedViaOfficialChannel: boolean, tacticsSeen: string[], feedback: string }`
- Pass receipt: `{ address, missionId, passedAt, evidence, sig }` — `sig` is an HMAC over the other fields with `RECEIPT_SECRET`.

Details: `docs/architecture.md`

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, system fonts (no build-time font download)
- Chain: viem, Avalanche Fuji C-Chain, Solidity 0.8.24+ (EVM version cancun) with OpenZeppelin v5
- AI: OpenAI-compatible chat API with tool calling (primary + fallback provider)
- Voice: ElevenLabs (agents SDK for the scam call, TTS for coach)
- Data: Tokenomist API (bonus mission)
- Hosting: Vercel

## Constraints

- Time: build ends Friday 16 Oct 2026, 14:00 GMT+7. Judges score exactly the submitted version.
- Submission requires a public GitHub repo, a demo website showing the real product, and a pitch deck link.
- New builds only; all judged code is written during the hackathon.
- Venue hall closes 18:00 Thursday and opens 10:00 Friday.
- Free-tier AI and voice APIs are rate-limited; design for fallbacks.
- Testnet only.

## Major Decisions

- Web app on Next.js + viem, because wallet connection and signing must run in the browser.
- No database: progress is derived from chain data plus signed pass receipts.
- Core wallet connection is required; learners get test AVAX from the Avalanche Fuji faucet.
- U-Bot is not part of the product; the team uses it only as a development helper. Consequence: the 5% "U-Bot integration" criterion (U-Bot as a core part of the experience) is not targeted.
- Not tied to any company's wallet or app; works with any EVM wallet on Fuji.

## External Dependencies

| Service | Purpose | Required | Fallback |
|---|---|---:|---|
| Avalanche Fuji RPC | Read chain, send transactions | Yes | Alternative public RPC |
| Avalanche faucet | Test AVAX for learner wallets | Yes | None; learner must fund the Core wallet |
| LLM (primary) | Coach agent, explainer, scammer, evaluator, report | Yes | Fallback provider |
| ElevenLabs | Voice scam call, coach voice | No | Text scam chat |
| Tokenomist API | Bonus mission data | No | Cached JSON snapshot |
| Vercel | Hosting | Yes | Local demo + recorded video |

Never place credentials in this document. Variable names: `.env.example`.

## Environment and Commands

- Runtime: Node.js 20.9+ (Next.js 16, Cache Components enabled)
- Package manager: npm
- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`

Setup: `docs/setup.md`

## Known Risks

- Free LLM tool calling may be unreliable → test both providers early; keep deterministic fallbacks.
- Fuji congestion or RPC outage during the demo → pending states, retry, backup video.
- Learner Core wallet has no test AVAX → show faucet path and block mission verification until funded.
- ElevenLabs agent may not support Thai well → English voice, Thai text.

## Open Questions

- Does the Avalanche faucet require sign-in or a mainnet balance for team wallets?
- Which ElevenLabs voice and language work best for the scam call?
- Tokenomist API grant approval time and quota.

## Further Reading

- Architecture: `docs/architecture.md`
- Setup: `docs/setup.md`
- Decision log: `docs/decisions.md`
- Tasks: `TODO.md`
- Agent rules: `AGENTS.md`
