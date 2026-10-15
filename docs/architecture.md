# Architecture

SafeStart has three layers: browser pages that hold the wallet and send transactions, server API routes that run AI and verification, and three contracts on Avalanche Fuji. AI explains, simulates and diagnoses; deterministic code decides passes and mints.

## Network

| Property | Value |
|---|---|
| Network | Avalanche Fuji C-Chain |
| Chain ID | 43113 (`0xa869`) |
| RPC | `https://api.avax-test.network/ext/bc/C/rpc` |
| Explorer | `https://explorer-test.avax.network/c-chain` |
| Faucet | `https://build.avax.network/console/primary-network/faucet` |

In code use `avalancheFuji` from `viem/chains`.

## Components

| Component | Location | Responsibility |
|---|---|---|
| Pages | `app/page.tsx`, `app/play/page.tsx`, `app/learn/page.tsx` | Landing page; existing mission route; standalone learning route |
| Page clients | `components/PlayClient.tsx`, `components/LearningClient.tsx` | Wallet-backed mission flow; browser-only lesson and quiz flow |
| Config | `lib/config.ts` | Chain ID, RPC, explorer links, contract addresses from `NEXT_PUBLIC_*` |
| ABIs | `lib/abi.ts` | Human-readable ABIs for the three contracts |
| Wallet layer | `lib/wallet.ts` | Connect Core wallet, switch to Fuji, send AVAX |
| Chain client | `lib/chain.ts` | viem public client for Fuji |
| Agent tools | `lib/tools.ts` | Read-only functions the coach agent can call; rule-based risk for decoded calls |
| LLM client | `lib/llm.ts` | OpenAI-compatible client, primary + fallback, tool-call loop, JSON mode with zod |
| Scam prompts | `lib/scam.ts` | Personas, transcript validation, scammer and evaluator prompts |
| Voice client | `components/VoicePracticeCall.tsx`, `lib/voice.ts` | ElevenLabs WebSocket session, microphone state, transcript normalization |
| ElevenLabs client | `lib/elevenlabs.ts` | Server-only signed URL request for the private agent |
| Verification | `lib/verify.ts` | Deterministic pass/fail for every mission |
| Receipts | `lib/receipt.ts` | HMAC sign/verify pass receipts |
| Minter | `lib/minter.ts` | Server wallet client from `MINTER_PRIVATE_KEY` |
| Decoys | `lib/decoys.ts` | Look-alike addresses for mission 3 |
| Send checks | `lib/send.ts` | Wallet-style warnings before signing: known / look-alike / first-time recipient, gas reserve, base fee + tip split. Warnings only; never a pass |
| Mission UI | `components/missions/` | Landing-style mission cards, practice chat (`PhoneFrame`), simulated wallet history, explain-before-sign card, fee breakdown, coach agent steps |
| API helpers | `lib/api.ts` | JSON body parsing, errors, in-memory rate limit |
| Content | `content/missions/`, `content/lessons/`, `content/scam-personas.json` | Mission text; localized standalone lessons and quizzes; scam personas |
| Contracts | `contracts/SafeStart.sol` | TestUSDC, FakeAirdrop, SafeStartCert |

## Standalone learning center

`/learn` is separate from the wallet-backed missions on `/play`. It presents 13 Thai/English lessons in sequence, grouped into three chapters:

| Chapter | Lessons |
|---|---|
| Blockchain basics (`basics`) | 1 What is a blockchain · 2 Crypto, coins and tokens · 3 Transactions, blocks and consensus · 4 Smart contracts, networks and testnets |
| Using crypto (`using`) | 5 Wallets, accounts and addresses · 6 Sending and receiving · 7 Gas fees and transaction status · 8 Block explorers and dapps |
| Web3 safety (`safety`) | 9 Recovery phrase · 10 Fake websites and links · 11 Reviewing a transaction before signing · 12 Social engineering · 13 Safe habits and scam response |

Each lesson has four multiple-choice or true/false questions answerable from its lesson text. A wrong answer shows the question's hint and a retry; the explanation appears once the answer is right. Lessons 1–8 and 13, and the fourth question of lessons 9–12, come from the team's research question bank (2026-10-15), which states its facts were checked against ethereum.org, Avalanche Builder Hub, MetaMask Help Center, OWASP Smart Contract Security and official explorers; Thai copy was translated for the course. Research questions that repeated lessons 9–12 were left out.

`lib/learning.ts` owns the lesson schema, localization fallback and quiz evaluation. `lib/learning-progress.ts` owns parsing, sequential unlock rules and resilient browser storage under `safestart.learning.v2` (v1 belonged to the earlier four-lesson numbering and is not reused). This progress is a learning aid only: it never creates a pass receipt, affects certificate readiness or replaces any check in `lib/verify.ts`.

## Missions and verification

| # | Learner action | Deterministic check (`lib/verify.ts`) | AI role |
|---|---|---|---|
| 1 | Connect wallet on Fuji, then take a practice "support call" | `chainId === 43113`; scam evaluation has `sharedSecret === false` and `followedLink === false` | AI scammer adapts tactics; AI evaluator returns the scam evaluation JSON |
| 2 | Get test AVAX from the Avalanche Fuji faucet | `getBalance(address) > 0` | Coach explains testnet and gas; agent diagnoses if balance is zero |
| 3 | Tutor asks for 0.01 AVAX in a practice chat; a simulated, labelled wallet history holds two newer 0 AVAX look-alike transfers. Learner copies an address, reviews it, sends with Core | Receipt `status === "success"`, `from === learner`, `to === tutorAddress`, `value >= 0.01 AVAX` | Explain-before-sign card before Core opens (rules in `lib/send.ts` set the risk; AI writes one sentence). If wrong, the coach opens the real tx and shows which characters differ |
| 4 | Read gas used and effective gas price from the real mission 3 receipt and work out the fee | `abs(answer - gasUsed * effectiveGasPrice) <= 1%` | After passing: breakdown of max fee shown before signing vs fee paid, base fee + tip; the coach explains the difference from the receipt |
| 5 | Face a "free tUSDC" site asking for unlimited approval | `allowance(learner, FakeAirdrop) === 0` after the trap was shown; records whether learner approved | Explain-before-sign card; if approved, guides the revoke |
| Bonus | Answer questions about a real upcoming unlock | Answer matches the value computed from the Tokenomist response | Generates the question and explanation from real data |

Each successful check returns a pass receipt. `/api/mint` mints only if: chain-verifiable missions (2, 3, 5) re-check true now, off-chain missions (1, 4) have valid receipts, and `balanceOf(learner) === 0` on the certificate contract.

Decoys for mission 3: take the tutor address, change 2–4 hex characters in the middle, then re-checksum with `getAddress`. Prefix and suffix stay identical, like a real address-poisoning attack.

## AI components

All LLM calls go through `lib/llm.ts` (OpenAI-compatible API, primary then fallback on error or timeout).

| Component | Route | Input | Output | Notes |
|---|---|---|---|---|
| Coach agent | `/api/coach` | Learner question + address + mission id | Answer text + list of tool calls made | Tool-calling loop, max 5 tool calls per turn |
| Transaction explainer | `/api/explain-tx` | Unsigned tx `{ to, data, value, knownRecipients? }` | One-sentence explanation + risk level, `source` (`ai` or `rules`) and, for AVAX transfers, `recipient` (`known`, `look-alike` or `new`, plus differing positions) | Risk level comes from rules in code (`lib/send.ts`, `lib/tools.ts`); AI only explains |
| Scammer (text mode) | `/api/scam/turn` | Persona id + transcript | Next scammer line | Max 8 turns; persona from `content/scam-personas.json` |
| Scam evaluator | `/api/scam/evaluate` | Transcript | Scam evaluation JSON | Separate prompt from scammer; parse with zod; on parse failure → fail closed and ask to retry |
| Report writer | `/api/report` | Mission results + learner tx list | Short personal safety report | Uses only provided facts |
| Bonus question | `/api/unlocks` | Tokenomist upcoming unlocks | Question + correct answer computed in code | AI writes wording only |

### Coach agent tools (read-only)

| Tool | Arguments | Returns |
|---|---|---|
| `get_balance` | `address` | AVAX and tUSDC balances |
| `get_transaction` | `hash` | from, to, value, status, gasUsed, effectiveGasPrice, fee |
| `get_recent_transactions` | `address` | Transactions the learner sent through the app this session (hashes kept in the browser and passed with the request); an explorer API can replace this later |
| `get_allowance` | `owner`, `spender` | tUSDC allowance |
| `decode_call` | `to`, `data` | Function name and arguments (known ABIs) |
| `get_mission_status` | `address` | Result of each check in `lib/verify.ts` |

The UI shows each tool call as a step ("Reading transaction 0x12…") so judges can see the agent work.

### Prompt-injection handling

Learner text, scam transcripts and any chain data passed to an LLM are wrapped in tagged blocks and the system prompt states they are untrusted data. No AI output can trigger a transaction, a mint or a pass.

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/coach` | POST | Coach agent turn |
| `/api/explain-tx` | POST | Explain a transaction before signing |
| `/api/scam/turn` | POST | Text-mode scammer reply |
| `/api/scam/evaluate` | POST | Evaluate a scam transcript |
| `/api/elevenlabs/signed-url` | POST | Return a short-lived signed WebSocket URL for the private ElevenLabs agent |
| `/api/verify/[mission]` | POST | Run a mission check, return a pass receipt |
| `/api/mint` | POST | Final checks, mint certificate |
| `/api/unlocks` | GET | Cached Tokenomist upcoming unlocks |
| `/api/report` | POST | Personal safety report |
| `/api/board` | GET | Certificate count and recent mission-3 transactions read from chain |

## Contracts

Source: `contracts/SafeStart.sol` (Solidity ^0.8.24, EVM version cancun, OpenZeppelin v5). Behaviour verified on a local Cancun chain: mint, approve-and-drain, revoke, one certificate per address, blocked transfers, owner-only minting.

- `TestUSDC` — ERC-20 test token; owner mints tUSDC to learners for mission 5.
- `FakeAirdrop` — demo "free airdrop"; `drain(victim)` pulls approved tUSDC to show what an unlimited approval allows.
- `SafeStartCert` — ERC-721 certificate; only the owner (team minter) can mint; transfers revert.

The team minter wallet deploys and owns all three. Its private key lives only in server environment variables.

## Wallet requirement

The learner must connect an existing Core wallet through the injected EIP-1193 provider and switch to Avalanche Fuji. The website never generates, imports, stores, or funds a learner wallet. The learner obtains test AVAX from the Avalanche Fuji faucet before Mission 2.

## Environment variables

See `.env.example`. Secrets never use the `NEXT_PUBLIC_` prefix.

`ELEVENLABS_API_KEY` is read only by `/api/elevenlabs/signed-url`. The browser receives a short-lived signed URL, never the API key. `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is public configuration. Voice is the default Mission 1 mode; text remains available when microphone or ElevenLabs access fails.
