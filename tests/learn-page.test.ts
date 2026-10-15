import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LearnPage, { metadata } from "@/app/learn/page";
import { homeActions, primaryNavigation } from "@/lib/site-navigation";

describe("learning route", () => {
  it("renders a Thai-first standalone learning main without wallet props", () => {
    const markup = renderToStaticMarkup(createElement(LearnPage));

    expect(metadata.title).toBe("Learn · SafeStart");
    expect(markup).toContain('<main class="flex-1" lang="th"');
    const heading = markup.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "");
    expect(heading).toBe("เรียนรู้ก่อนลงมือจริง");
    expect(markup).toContain("เส้นทางการเรียนรู้");
    expect(markup.match(/<h1(?:\s|>)/g)).toHaveLength(1);
  });
});

describe("shared navigation", () => {
  it("maps product navigation to the live routes", () => {
    expect(primaryNavigation).toEqual([
      { label: "Home", href: "/" },
      { label: "Learn", href: "/learn" },
      { label: "Missions", href: "/play" },
    ]);
  });

  it("maps landing actions to learning and missions", () => {
    expect(homeActions).toEqual({
      learn: { label: "Start practising", href: "/learn" },
      missions: { label: "View missions", href: "/play" },
      launch: { label: "Launch SafeStart", href: "/play" },
    });
  });
});
