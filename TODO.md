# TODO — Implementation Plan

Deadline: **Friday 16 Oct 2026, 14:00 GMT+7** (submissions close; judges score the submitted version).
Target submit time: **13:30 Friday**, leaving 30 minutes of buffer.

Roles (owners below):
- **AI** — coach agent, LLM client, explainer, report
- **VOICE** — AI scammer, evaluator, ElevenLabs
- **WEB3** — contracts, wallet, verification, deployment
- **FRONTEND** — pages and UI polish (can be the same person as WEB3)
- **OPS** — content, testing, registration, submission, deck

Rule: missions 1–4 and the coach agent are never cut. The certificate is optional (`docs/decisions.md`, 2026-10-16). If time runs short, cut in this order: live board → bonus mission → voice call (text mode stays).

---

## M0 · Setup — Thu 13:30–14:30

- [ ] OPS — Register the team on hub.team1.network **today**; organisers must approve the team before it can submit. Confirm approval status.
- [x] Scaffold Next.js 16 app in `D:\Projects\uhack` with docs, contracts and `.env.example`.
- [x] WEB3 — Public GitHub repo is pushed, the app is imported to Vercel, and `/` plus `/play` load.
- [x] WEB3 — Deploy `TestUSDC`, `FakeAirdrop`, `SafeStartCert` on Fuji and configure the app addresses through environment variables. Public README/explorer links remain to be filled.
- [x] AI — Configure Gemini as primary and Groq as fallback; the coach route is wired for both providers. Deployed smoke testing remains below.
- [x] VOICE — ElevenLabs credits/API key and authenticated scammer agent are configured; the agent is published, capped at 120 seconds, and tested in the dashboard.
- [ ] OPS — Tokenomist account with the team leader's email; request the API grant; test one request.
- [ ] OPS — Book a technical mentor slot (office hours end 18:00 today).

Done when: the Vercel URL loads, all three contracts show on the Fuji explorer, and both LLM providers answer.

## M1 · Vertical slice — Thu 14:30–16:30

Code is written and verified on a local chain (see `PROJECT.md` Current State). Remaining work is running it for real.

- [x] `lib/chain.ts`, `lib/config.ts`, `lib/abi.ts`, `lib/wallet.ts` (Core wallet connect, switch to Fuji).
- [x] `lib/verify.ts` for missions 1–5; `lib/decoys.ts`; `lib/receipt.ts`; unit tests.
- [x] `lib/tools.ts` (all six read-only tools); `/api/coach`; tool calls shown as steps in the UI.
- [x] `/api/scam/turn` (text scammer) and `/api/scam/evaluate` (zod-validated JSON, fail closed).
- [x] `content/missions/1–4.json` and `content/scam-personas.json` (2 personas).
- [x] WEB3 — On Fuji with real env vars: Core wallet + faucet → mission 2 → mission 3 pass on `/play`.
- [x] AI — Coach route is connected to the configured LLM providers and exposes read-only tool steps; deployed smoke testing remains below.
- [ ] OPS — Rewrite mission text in `content/` (Thai and English) and add a third scam persona.

Done when: on the deployed URL a fresh Core wallet passes missions 2 and 3, and the coach explains the mission 3 transaction using live chain data.

## M2 · Core loop — Thu 16:30–18:00

- [x] Mission 1 (text call + evaluator), mission 4 check, `/api/mint` with full re-check, certificate link — all on `/play`.
- [x] VOICE — Play the scam call with the authenticated ElevenLabs agent; text mode remains the fallback and evaluator path is shared.
- [x] FRONTEND — Integrate the `frontend` landing design and shared navigation into `main`.
- [x] FRONTEND — Add standalone `/learn` lessons and linked quizzes with Thai/English copy, sequential local progress and landing-page visual language; keep `/play` missions unchanged.
- [x] CONTENT — Expand `/learn` to 13 lessons in three chapters from the research question bank, four questions each with hints (Thai translation done in-repo).
- [ ] AI — On the deployed URL, ask the `/learn` lesson tutor 2–3 questions (Thai and English, one asking for a quiz answer) and check the real-LLM replies stay on topic and give hints, not answers.
- [ ] OPS — Native Thai speaker reviews the new Thai lesson and quiz copy (lessons 1–8, 13 and the added questions in 9–12).
- [ ] FRONTEND — Polish `/play` (layout, mission map/progress, Thai UI text, mobile). Logic stays in `lib/`.
- [x] OPS — End-to-end test on the deployed URL with a fresh Core wallet: missions 1–3 passed (2026-10-16); `/play` and `/learn` checked on the deployed URL.
- [x] OPS — Update "Current State" in `PROJECT.md`.

Done when: missions 1–4 → certificate works end-to-end on the public URL. Leave the venue by 18:00.

## Thursday night — remote, stop by 23:00

- [ ] OPS — Mission 5 content, more scam scripts, test cases for each mission.
- [x] VOICE — ElevenLabs voice call with `@elevenlabs/react` behind a toggle; transcript → `/api/scam/evaluate`. Text mode stays as fallback.
- [x] VOICE — Full microphone call passed on the deployed URL with a connected Core wallet; signed URL, transcript and evaluation flow confirmed.
- [x] `/api/explain-tx` with `decodeCall` and rule-based risk level.
- [x] AI — Show the explain-before-sign card in mission 3 before sending (branch `missions-ui`).
- [x] FRONTEND — `/play` restyled with landing components; mission 3 practice chat + poisoned history + look-alike warning; mission 4 receipt-based fee breakdown and Max/gas-reserve check (branch `missions-ui`).
- [ ] OPS — On the deployed URL, run mission 3 to the decoy with a wallet that is not the tutor address, and check the explain-before-sign text from the real LLM. (2026-10-16: the tutor path and mission 4 passed on Fuji; the tested wallet was the tutor address itself.)
- [ ] Everyone — sleep.

## M3 · Differentiators — Fri 10:00–12:30

- [ ] WEB3 — Mission 5 trap page: approve flow, `drain` demo, revoke, verification.
- [ ] AI — Explain-before-sign card in missions 3 and 5.
- [x] VOICE — Voice call is the default practice mode and the published agent adapts tactics per persona; text remains available as fallback.
- [ ] AI — `/api/report` personal safety report.
- [ ] OPS — Bonus mission with `/api/unlocks` (cached Tokenomist data); `/board` page.
- [ ] OPS — Attend the submission briefing (11:30–12:00).

Done when: missions 1–5, report and certificate run on the deployed URL.

## M4 · Freeze & submit — Fri 12:30–14:00

- [ ] Everyone — 12:30 feature freeze; bug fixes only.
- [ ] OPS — End-to-end test with 3 fresh Core wallets on the deployed URL.
- [ ] OPS — Record a 2–3 minute backup video of the full flow.
- [ ] WEB3 — README: demo URL, contract explorer links, how to run, partner tech used. Repo is public.
- [ ] OPS — Pitch deck link (Google Drive or deck site) set to "Anyone with the link can view". Required for submission even though only finalists present on stage.
- [ ] OPS — Submit on hub.team1.network by 13:30 (repo, demo website, deck). Updates are allowed until 14:00.
- [ ] WEB3 — `git tag submission-v1` on the submitted commit.

## If selected as a finalist — announced Fri 17:00, demos at 20:00

- [ ] 3-minute live demo script; rehearse 3 times.
- [ ] Keep a funded Core wallet and backup video ready; phone hotspot.

---

## Bugs and notes

(Add items here during testing. Move resolved items into Git history, not this list.)

- [ ] WEB3 (optional, not planned before submission) — Certificate mint fails on the deployed URL: "Minting failed: invalid private key, expected hex or 32 bytes, got string" (2026-10-16, all 4 missions passed). `MINTER_PRIVATE_KEY` on Vercel is not a 64-hex-character key (check for quotes, spaces, a newline or a wrong value), then redeploy and mint again.
