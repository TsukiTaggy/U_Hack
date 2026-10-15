# SafeStart — AI Crypto Safety Coach

Practise the costliest crypto mistakes on Avalanche Fuji testnet, with AI that scams you, coaches you and reads your real transactions — before you ever touch real money.

**Demo:** https://u-hack-mu.vercel.app · missions at [`/play`](https://u-hack-mu.vercel.app/play) · lessons at [`/learn`](https://u-hack-mu.vercel.app/learn)
**Track:** U-Hackathon 2026 · AI Track

## What it does

- **AI coach agent** — calls read-only chain tools to diagnose the learner's own transactions ("why did my transfer fail?", "how much gas did I pay?").
- **AI scam simulator** — a voice or text "support agent" that adapts its pressure tactics to the learner's replies; a separate AI evaluator scores the conversation.
- **AI explain-before-sign** — decodes a transaction and explains it in one plain sentence with a risk level.
- **On-chain missions** (`/play`) — survive a scam support call, get test AVAX, send to the right person despite a look-alike (poisoned) address, and read your own gas fee from the real receipt.
- **Lessons** (`/learn`) — 13 short Thai/English lessons in three chapters with quizzes, plus an AI lesson tutor that explains without giving away answers. No wallet needed.

Connect a Core wallet on Avalanche Fuji to use the app. The website never creates or stores a wallet for the learner.

## Partner technology

- **Avalanche Fuji** — learner wallets, real transactions, three contracts, on-chain verification.
- **ElevenLabs** — conversational voice for the scam-call simulation.

## Contracts (Fuji, chain ID 43113)

| Contract | Address |
|---|---|
| TestUSDC | [`0x8968AD6CC50Af2F2085364b2Ebde8A6C68e9c687`](https://explorer-test.avax.network/c-chain/address/0x8968AD6CC50Af2F2085364b2Ebde8A6C68e9c687) |
| FakeAirdrop | [`0xA3c86f7703CA67f7e6c8b279792E868427ED54d1`](https://explorer-test.avax.network/c-chain/address/0xA3c86f7703CA67f7e6c8b279792E868427ED54d1) |
| SafeStartCert | [`0x8e8a8ab41428868792bc722bfc0b7b6165bd0632`](https://explorer-test.avax.network/c-chain/address/0x8e8a8ab41428868792bc722bfc0b7b6165bd0632) |

`SafeStartCert` is a non-transferable certificate contract. Minting from the app is turned off for this submission.

Source: `contracts/SafeStart.sol`

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Full setup: `docs/setup.md` · Architecture: `docs/architecture.md` · Decisions: `docs/decisions.md` · Project context: `PROJECT.md`

Testnet only. Educational content, not financial advice.
