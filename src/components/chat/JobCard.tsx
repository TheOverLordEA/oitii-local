"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Building2, ExternalLink } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type: string;
  url?: string;
  salary?: string;
}

export function JobCard({ title, company, location, type, url, salary }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3 my-2"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-950 text-[16px] leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-zinc-600 text-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-medium">{company}</span>
          </div>
        </div>
        <div className="bg-zinc-100 px-2 py-1 rounded-md text-[11px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
          {type}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </div>
        {salary && (
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <Briefcase className="w-3.5 h-3.5" />
            {salary}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-white bg-black px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          View Role
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
