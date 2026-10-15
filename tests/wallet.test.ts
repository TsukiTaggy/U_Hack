import { describe, expect, it } from "vitest";
import type { EIP1193Provider } from "viem";
import { detectCoreProvider, type CoreProviderTarget } from "../lib/wallet";

function provider(): EIP1193Provider {
  return { request: async () => [] } as unknown as EIP1193Provider;
}

function target(avalanche?: EIP1193Provider): CoreProviderTarget {
  const events = new EventTarget();
  return {
    avalanche,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
}

describe("detectCoreProvider", () => {
  it("uses the Core provider announced through EIP-6963", () => {
    const core = provider();
    const browser = target();
    browser.addEventListener("eip6963:requestProvider", () => {
      const announcement = new Event("eip6963:announceProvider");
      Object.defineProperty(announcement, "detail", {
        value: { info: { rdns: "app.core.extension" }, provider: core },
      });
      browser.dispatchEvent(announcement);
    });

    expect(detectCoreProvider(browser)).toBe(core);
  });

  it("falls back to Core's conflict-free window.avalanche provider", () => {
    const core = provider();
    expect(detectCoreProvider(target(core))).toBe(core);
  });

  it("returns undefined when Core is not installed", () => {
    expect(detectCoreProvider(target())).toBeUndefined();
  });
});
