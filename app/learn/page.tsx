import type { Metadata } from "next";
import LearningClient from "@/components/LearningClient";

export const metadata: Metadata = {
  title: "Learn · SafeStart",
  description: "Learn practical crypto safety through four short lessons and linked quizzes.",
};

export default function LearnPage() {
  return <LearningClient />;
}
