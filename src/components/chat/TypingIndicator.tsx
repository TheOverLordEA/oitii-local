import React from "react";
import { motion } from "framer-motion";

export function TypingIndicator() {
  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: i * 0.15,
        ease: "easeInOut" as const,
      },
    }),
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9 }} 
      className="flex w-full justify-start"
    >
      <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center space-x-1.5 shadow-sm w-fit">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            className="w-2 h-2 bg-zinc-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
