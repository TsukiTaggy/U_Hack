# SafeStart — AI Crypto Safety Coach

Practise the costliest crypto mistakes on Avalanche Fuji testnet, with AI that scams you, coaches you and reads your real transactions — before you ever touch real money.

**Demo:** _add deployed URL_
**Track:** U-Hackathon 2026 · AI Track

## What it does

- **AI coach agent** — calls read-only chain tools to diagnose the learner's own transactions ("why did my transfer fail?", "how much gas did I pay?").
- **AI scam simulator** — a voice or text "support agent" that adapts its pressure tactics to the learner's replies; a separate AI evaluator scores the conversation.
- **AI explain-before-sign** — decodes a transaction and explains it in one plain sentence with a risk level.
- **On-chain missions** — connect a wallet, get test AVAX, avoid a look-alike address, read your own gas fee, survive an unlimited-approval trap.
- **Certificate** — a non-transferable NFT on Fuji for learners who pass.

Connect a Core wallet on Avalanche Fuji to use the app. The website never creates or stores a wallet for the learner.

## Partner technology

- **Avalanche Fuji** — learner wallets, real transactions, three contracts, on-chain verification.
- **ElevenLabs** — conversational voice for the scam-call simulation.
- **Tokenomist** — real token unlock data for the bonus mission.

## Contracts (Fuji, chain ID 43113)

| Contract | Address |
|---|---|
| TestUSDC | _add_ |
| FakeAirdrop | _add_ |
| SafeStartCert | _add_ |

Source: `contracts/SafeStart.sol`

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Full setup: `docs/setup.md` · Architecture: `docs/architecture.md` · Decisions: `docs/decisions.md` · Project context: `PROJECT.md`

Testnet only. Educational content, not financial advice.
