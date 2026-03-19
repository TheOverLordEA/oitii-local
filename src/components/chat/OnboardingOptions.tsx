import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingOptionsProps {
  isVisible: boolean;
  onSelect: (option: "industry" | "any") => void;
}

export function OnboardingOptions({ isVisible, onSelect }: OnboardingOptionsProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, pointerEvents: "none" }}
          className="flex flex-col gap-2 pt-2 items-end mt-auto"
        >
          <button
            onClick={() => onSelect("industry")}
            className="bg-white border border-zinc-200 text-zinc-800 font-medium px-5 py-3 rounded-2xl shadow-sm hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm w-fit text-right"
          >
            Looking for a job in my industry
          </button>
          <button
            onClick={() => onSelect("any")}
            className="bg-white border border-zinc-200 text-zinc-800 font-medium px-5 py-3 rounded-2xl shadow-sm hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm w-fit text-right"
          >
            Looking for any work
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
