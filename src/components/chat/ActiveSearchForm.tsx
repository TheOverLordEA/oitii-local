"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Briefcase, DollarSign, MapPin } from "lucide-react";

interface ActiveSearchFormProps {
  onSubmit: (data: {
    targetTitle: string;
    minSalary: string;
    location: string;
  }) => void;
}

export function ActiveSearchForm({ onSubmit }: ActiveSearchFormProps) {
  const [targetTitle, setTargetTitle] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    onSubmit({ targetTitle, minSalary, location });
  };

  const isValid = targetTitle.trim().length > 0;

  return (
    <motion.div
      className="w-full bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">
        Configure Active Deployment
      </p>

      <div className="flex flex-col gap-3">
        {/* Target Title */}
        <div className="relative">
          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Target Title (e.g. Senior SWE)"
            value={targetTitle}
            onChange={(e) => setTargetTitle(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 transition-all"
          />
        </div>

        {/* Minimum Salary */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Minimum Salary (e.g. $150,000)"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 transition-all"
          />
        </div>

        {/* Location / Remote */}
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Location or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="mt-1 w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-3 transition-colors focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          <Lock className="h-4 w-4" />
          Lock Parameters
        </button>
      </div>
    </motion.div>
  );
}
