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
| Pages | `app/page.tsx`, `app/play/page.tsx`, `components/PlayClient.tsx` | Landing page; mission flow with wallet panel, missions 1–4, certificate and coach panel |
| Config | `lib/config.ts` | Chain ID, RPC, explorer links, contract addresses from `NEXT_PUBLIC_*` |
| ABIs | `lib/abi.ts` | Human-readable ABIs for the three contracts |
| Wallet layer | `lib/wallet.ts` | Connect injected wallet, switch to Fuji, create/load guest wallet, send AVAX |
| Chain client | `lib/chain.ts` | viem public client for Fuji |
| Agent tools | `lib/tools.ts` | Read-only functions the coach agent can call; rule-based risk for decoded calls |
| LLM client | `lib/llm.ts` | OpenAI-compatible client, primary + fallback, tool-call loop, JSON mode with zod |
| Scam prompts | `lib/scam.ts` | Personas, transcript validation, scammer and evaluator prompts |
| Verification | `lib/verify.ts` | Deterministic pass/fail for every mission |
| Receipts | `lib/receipt.ts` | HMAC sign/verify pass receipts |
| Minter | `lib/minter.ts` | Server wallet client from `MINTER_PRIVATE_KEY` |
| Decoys | `lib/decoys.ts` | Look-alike addresses for mission 3 |
| API helpers | `lib/api.ts` | JSON body parsing, errors, in-memory rate limit |
| Content | `content/` | Mission text, scam personas |
| Contracts | `contracts/SafeStart.sol` | TestUSDC, FakeAirdrop, SafeStartCert |

## Missions and verification

| # | Learner action | Deterministic check (`lib/verify.ts`) | AI role |
|---|---|---|---|
| 1 | Connect wallet on Fuji, then take a practice "support call" | `chainId === 43113`; scam evaluation has `sharedSecret === false` and `followedLink === false` | AI scammer adapts tactics; AI evaluator returns the scam evaluation JSON |
| 2 | Get test AVAX (faucet for real wallets, top-up for guest wallets) | `getBalance(address) > 0` | Coach explains testnet and gas; agent diagnoses if balance is zero |
| 3 | Send 0.01 AVAX to the correct address chosen from look-alikes | Receipt `status === "success"`, `from === learner`, `to === tutorAddress`, `value >= 0.01 AVAX` | Writes the scenario message; if wrong, agent opens the real tx and shows which characters differ |
| 4 | Answer how much gas the mission 3 tx cost | `abs(answer - gasUsed * effectiveGasPrice) <= 1%` | Agent reads the receipt and explains the fee |
| 5 | Face a "free tUSDC" site asking for unlimited approval | `allowance(learner, FakeAirdrop) === 0` after the trap was shown; records whether learner approved | Explain-before-sign card; if approved, guides the revoke |
| Bonus | Answer questions about a real upcoming unlock | Answer matches the value computed from the Tokenomist response | Generates the question and explanation from real data |

Each successful check returns a pass receipt. `/api/mint` mints only if: chain-verifiable missions (2, 3, 5) re-check true now, off-chain missions (1, 4) have valid receipts, and `balanceOf(learner) === 0` on the certificate contract.

Decoys for mission 3: take the tutor address, change 2–4 hex characters in the middle, then re-checksum with `getAddress`. Prefix and suffix stay identical, like a real address-poisoning attack.

## AI components

All LLM calls go through `lib/llm.ts` (OpenAI-compatible API, primary then fallback on error or timeout).

| Component | Route | Input | Output | Notes |
|---|---|---|---|---|
| Coach agent | `/api/coach` | Learner question + address + mission id | Answer text + list of tool calls made | Tool-calling loop, max 5 tool calls per turn |
| Transaction explainer | `/api/explain-tx` | Unsigned tx `{ to, data, value }` | One-sentence explanation + risk level | Risk level comes from rules in code; AI only explains |
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
| `/api/verify/[mission]` | POST | Run a mission check, return a pass receipt |
| `/api/mint` | POST | Final checks, mint certificate |
| `/api/guest-topup` | POST | Send 0.05 test AVAX to a guest wallet whose balance is below 0.02 |
| `/api/unlocks` | GET | Cached Tokenomist upcoming unlocks |
| `/api/report` | POST | Personal safety report |
| `/api/board` | GET | Certificate count and recent mission-3 transactions read from chain |

## Contracts

Source: `contracts/SafeStart.sol` (Solidity ^0.8.24, EVM version cancun, OpenZeppelin v5). Behaviour verified on a local Cancun chain: mint, approve-and-drain, revoke, one certificate per address, blocked transfers, owner-only minting.

- `TestUSDC` — ERC-20 test token; owner mints tUSDC to learners for mission 5.
- `FakeAirdrop` — demo "free airdrop"; `drain(victim)` pulls approved tUSDC to show what an unlimited approval allows.
- `SafeStartCert` — ERC-721 certificate; only the owner (team minter) can mint; transfers revert.

The team minter wallet deploys and owns all three. Its private key lives only in server environment variables.

## Guest wallet

Created in the browser with viem (`generatePrivateKey`, `privateKeyToAccount`), stored in `localStorage`, never sent to the server, labelled "testnet only". `/api/guest-topup` funds it from the team wallet with a small capped amount so judges can finish without a faucet sign-up.

## Environment variables

See `.env.example`. Secrets never use the `NEXT_PUBLIC_` prefix.
