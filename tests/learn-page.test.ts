import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LearnPage, { metadata } from "@/app/learn/page";
import { Navigation } from "@/components/Navigation";

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
  it("keeps Home and Missions while exposing Learn in the rendered navigation", () => {
    const markup = renderToStaticMarkup(createElement(Navigation));

    expect(markup).toContain('href="/"');
    expect(markup).toContain('href="/play"');
    expect(markup.match(/href="\/learn"/g)).toHaveLength(1);
  });
});
