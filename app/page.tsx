import Link from "next/link";

const features = [
  { title: "AI scam call", text: "Take a practice call from an AI scammer that changes tactics as you reply." },
  { title: "AI coach agent", text: "Ask why a transfer failed. The coach reads your real transactions to answer." },
  { title: "Real testnet practice", text: "Send, pay fees and face an approval trap on Avalanche Fuji, with no real money." },
  { title: "Proof you passed", text: "Finish the missions to receive a certificate on-chain that cannot be transferred." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <div className="space-y-4">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">Avalanche Fuji testnet · no real money</span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Make your first crypto mistakes here, not with real money.</h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          SafeStart is an AI safety coach for crypto beginners. Practise the mistakes that cost people real money, with AI that scams you,
          coaches you and reads your own transactions.
        </p>
        <Link href="/play" className="inline-block rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
          Start practising
        </Link>
        <p className="text-sm text-zinc-500">No sign-up needed: use a guest wallet, or connect Core / MetaMask.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="mb-1 font-semibold">{f.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
