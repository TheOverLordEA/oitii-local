"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const PROMPTS = [
  "find me remote dev jobs in NYC",
  "apply to 5 senior PM roles this week",
  "track my pending applications",
  "rewrite my bio for a startup vibe",
];

export function TypingDemo() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    const current = PROMPTS[promptIndex];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), 1600);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), 600);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 25);
        return () => clearTimeout(t);
      }
      setPromptIndex((i) => (i + 1) % PROMPTS.length);
      setPhase("typing");
    }
  }, [text, phase, promptIndex]);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-zinc-200 rounded-full shadow-sm font-mono text-sm text-zinc-700 min-w-[280px]">
      <span className="text-zinc-400">{"›"}</span>
      <span className="flex-1 text-left">
        {text}
        <span className="inline-block w-[1.5px] h-4 bg-zinc-900 ml-0.5 align-middle animate-pulse" />
      </span>
      <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </div>
  );
}
