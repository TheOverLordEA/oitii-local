"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export function ResumeAnalyzingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start pr-12"
    >
      <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[320px] w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-zinc-700 text-sm font-medium">Analyzing your resume…</span>
        </div>
        <div className="space-y-2">
          {["Extracting work history", "Inferring seniority & salary", "Identifying preferences"].map(
            (label, i) => (
              <div key={label} className="flex items-center gap-2">
                <motion.div
                  className="h-1.5 rounded-full bg-zinc-100 overflow-hidden flex-1"
                >
                  <motion.div
                    className="h-full bg-blue-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "90%", "60%", "95%"] }}
                    transition={{
                      duration: 2.5,
                      delay: i * 0.4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                <span className="text-[11px] text-zinc-400 whitespace-nowrap">{label}</span>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
