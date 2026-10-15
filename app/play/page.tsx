import type { Metadata } from "next";
import PlayClient from "@/components/PlayClient";

export const metadata: Metadata = {
  title: "Missions · SafeStart",
};

export default function PlayPage() {
  return <PlayClient />;
}
