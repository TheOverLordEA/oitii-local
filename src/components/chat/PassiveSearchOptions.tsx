"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Building2, Layers } from "lucide-react";

interface PassiveSearchOptionsProps {
  onSelect: (option: string) => void;
}

const OPTIONS = [
  {
    label: "Significant Salary Bump (+20%)",
    icon: TrendingUp,
    description: "Only roles that offer a 20% or higher increase.",
  },
  {
    label: "Top-Tier Companies Only",
    icon: Building2,
    description: "Filter to FAANG, Fortune 500, and well-funded startups.",
  },
  {
    label: "Perfect Tech-Stack Matches",
    icon: Layers,
    description: "Roles that match your exact preferred technologies.",
  },
];

export function PassiveSearchOptions({ onSelect }: PassiveSearchOptionsProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-sm font-semibold text-zinc-900 tracking-tight">
        Configure Passive Surveillance
      </p>

      {OPTIONS.map((opt, idx) => {
        const Icon = opt.icon;
        return (
          <motion.button
            key={idx}
            onClick={() => onSelect(opt.label)}
            className="w-full text-left bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl p-4 transition-colors group shadow-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.06, ease: "easeOut" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 transition-colors">
                <Icon className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-zinc-900 truncate">
                  {opt.label}
                </span>
                <span className="text-xs text-zinc-500 mt-0.5 leading-snug">
                  {opt.description}
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
