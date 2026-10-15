import { formatEther, isHex } from "viem";
import { clientIp, fail, langOf, rateLimited, readJson } from "@/lib/api";
import { chat, untrusted, UNTRUSTED_RULE } from "@/lib/llm";
import { decodeCall } from "@/lib/tools";
import { assessRecipient, type RecipientCheck } from "@/lib/send";
import { parseAddress } from "@/lib/verify";

// Explain-before-sign: decode a transaction, set risk with rules, let AI explain it in one sentence.
// For a plain AVAX transfer the recipient is compared with addresses the learner sent to before
// (address-poisoning check). Rules set the risk; the AI only explains it.

export async function POST(request: Request) {
  if (rateLimited(`explain:${clientIp(request)}`, 30, 60_000)) return fail(429, "Slow down a little.");

  const body = await readJson(request);
  const to = parseAddress(body.to);
  const data = typeof body.data === "string" && isHex(body.data) ? body.data : "0x";
  const valueWei = typeof body.value === "string" && /^\d+$/.test(body.value) ? BigInt(body.value) : 0n;
  const lang = langOf(body.lang);
  if (!to) return fail(400, "Invalid recipient.");
  const known = Array.isArray(body.knownRecipients)
    ? body.knownRecipients.slice(0, 10).map(parseAddress).filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  let recipient: RecipientCheck | undefined;
  let decoded;
  if (data === "0x") {
    recipient = assessRecipient(to, known);
    decoded = {
      function: "transfer AVAX",
      args: [],
      risk: recipient.risk,
      reasons: [`Sends ${formatEther(valueWei)} AVAX to ${to}.`, ...recipient.reasons],
    };
  } else {
    decoded = decodeCall(to, data);
  }

  const facts = JSON.stringify({ to, valueAvax: formatEther(valueWei), ...decoded });
  let explanation = decoded.reasons.join(" ");
  let source: "ai" | "rules" = "rules";
  try {
    const { text } = await chat(
      [
        {
          role: "system",
          content: `Explain to a crypto beginner, in ONE short sentence, what signing this transaction will do. If the risk is medium or high, name the main danger from the reasons. Use the given risk level; never change it. ${UNTRUSTED_RULE} Reply in ${lang === "th" ? "Thai" : "English"}.`,
        },
        { role: "user", content: untrusted("chain_data", facts) },
      ],
      120,
    );
    if (text) {
      explanation = text;
      source = "ai";
    }
  } catch {
    // Keep the rule-based explanation if the AI is unavailable.
  }
  return Response.json({
    ...decoded,
    explanation,
    source,
    recipient: recipient && { kind: recipient.kind, match: recipient.match, diff: recipient.diff },
  });
}
