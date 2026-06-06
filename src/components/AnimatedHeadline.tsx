"use client";

import { useEffect, useRef, useState } from "react";

// Short, similar-length phrases keep the layout calm and prevent clipping.
const PHRASES = [
  "find me a job.",
  "apply for me.",
  "fix my resume.",
  "track my apps.",
  "find dev jobs.",
];

// Cycle through all phrases this many times, then settle on the first one.
const TOTAL_CYCLES = 2;

export function AnimatedHeadline() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting" | "done">("typing");
  const [paused, setPaused] = useState(false);
  const cyclesRef = useRef(0);

  // Respect reduced-motion preference + ?demo=0 URL flag → skip animation entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const disabled =
      params.get("demo") === "0" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (disabled) {
      setText(PHRASES[0]);
      setPhase("done");
    }
  }, []);

  // Pause cycling when the tab is hidden to avoid wasted work.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (phase === "done" || paused) return;

    const current = PHRASES[phraseIndex];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), 65);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), 1800);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), 600);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 28);
        return () => clearTimeout(t);
      }
      const nextIndex = (phraseIndex + 1) % PHRASES.length;
      // We just completed one full pass when we wrap back to phrase 0.
      if (nextIndex === 0) cyclesRef.current += 1;

      if (cyclesRef.current >= TOTAL_CYCLES) {
        // Settle on the default phrase and stop.
        setText(PHRASES[0]);
        setPhraseIndex(0);
        setPhase("done");
        return;
      }

      setPhraseIndex(nextIndex);
      setPhase("typing");
    }
  }, [text, phase, phraseIndex, paused]);

  return (
    <h1
      style={{ fontFamily: "var(--font-inter)" }}
      className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] text-zinc-950 leading-[1.05]"
      aria-live="polite"
    >
      <span className="block mb-1">Just type</span>
      {/* Inner line is nowrap so phrase + cursor + closing quote stay on one line.
          Outer h1 is NOT nowrap, so the hero column doesn't expand and squeeze siblings. */}
      <span className="block text-zinc-400 whitespace-nowrap min-h-[1.1em]">
        &ldquo;{text}
        {phase !== "done" && (
          <span
            aria-hidden
            className="inline-block w-[2px] md:w-[3px] h-[0.8em] bg-zinc-900/80 mx-0.5 align-[-0.05em] rounded-sm animate-[blink_1s_steps(2,start)_infinite]"
          />
        )}
        &rdquo;
      </span>
      <style jsx>{`
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </h1>
  );
}
