import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LearningQuiz } from "@/components/LearningQuiz";
import { LessonPanel } from "@/components/LessonPanel";
import { LessonPath, type LessonPathItem } from "@/components/LessonPath";
import { lessons, localizedText } from "@/lib/learning";

describe("LessonPath", () => {
  it("exposes current, completed, and locked lessons accessibly", () => {
    const items: LessonPathItem[] = [
      { id: "1", title: "บทที่หนึ่ง", status: "completed", selected: false },
      { id: "2", title: "บทที่สอง", status: "current", selected: true },
      { id: "3", title: "บทที่สาม", status: "locked", selected: false },
    ];

    const markup = renderToStaticMarkup(
      createElement(LessonPath, { items, locale: "th", onSelect: () => undefined }),
    );

    expect(markup).toContain('aria-label="Learning path"');
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain("เรียนจบแล้ว");
    expect(markup).toContain("ยังไม่ปลดล็อก");
    expect(markup).toMatch(/<button[^>]*disabled[^>]*>[^<]*<span[^>]*>3<\/span>/);
  });
});

describe("LessonPanel", () => {
  it("renders localized lesson copy and key points", () => {
    const lesson = lessons[0];
    const markup = renderToStaticMarkup(
      createElement(LessonPanel, {
        lesson,
        locale: "th",
        review: false,
        onStartQuiz: () => undefined,
      }),
    );

    expect(markup).toContain(localizedText(lesson.title, "th"));
    expect(markup).toContain(localizedText(lesson.lesson, "th"));
    expect(markup).toContain(localizedText(lesson.keyPoints[0], "th"));
    expect(markup).toContain("เริ่มทำแบบทดสอบ");
    expect(markup).toContain("<h3");
    expect(markup).toContain("<h4");
  });
});

describe("LearningQuiz", () => {
  it("renders one accessible question without feedback before checking", () => {
    const lesson = lessons[0];
    const question = lesson.quiz[0];
    const markup = renderToStaticMarkup(
      createElement(LearningQuiz, {
        lesson,
        locale: "th",
        questionIndex: 0,
        selectedOptionId: "",
        checked: false,
        onSelect: () => undefined,
        onCheck: () => undefined,
        onRetry: () => undefined,
        onNext: () => undefined,
      }),
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup.match(/type="radio"/g)).toHaveLength(question.options.length);
    expect(markup).toContain(localizedText(question.prompt, "th"));
    expect(markup).not.toContain(localizedText(question.explanation, "th"));
    expect(markup).toContain("<h3");
  });
});
