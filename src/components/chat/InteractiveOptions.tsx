"use client";

import React from "react";
import { motion } from "framer-motion";

interface InteractiveOptionsProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function InteractiveOptions({ options, onSelect }: InteractiveOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2 my-4 justify-start">
      {options.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02, backgroundColor: "#f4f4f5" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option)}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-300 transition-all flex items-center justify-center min-w-[100px]"
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}
