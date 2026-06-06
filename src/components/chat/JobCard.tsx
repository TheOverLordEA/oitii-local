"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Building2, Eye } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type: string;
  url?: string;
  salary?: string;
  onViewRole?: () => void;
}

/**
 * Strip leaked markdown formatting from text values that the LLM may have
 * accidentally included inside JSON fields (e.g. **bold**, _italics_, `code`).
 * Card fields are plain text; markdown leaks here as literal characters.
 */
function stripMarkdown(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")  // **bold**
    .replace(/\*(.*?)\*/g, "$1")      // *italic*
    .replace(/__(.*?)__/g, "$1")      // __bold__
    .replace(/_(.*?)_/g, "$1")        // _italic_
    .replace(/`([^`]+)`/g, "$1")      // `code`
    .trim();
}

export function JobCard({ title, company, location, type, url, salary, onViewRole }: JobCardProps) {
  const cleanTitle    = stripMarkdown(title);
  const cleanCompany  = stripMarkdown(company);
  const cleanLocation = stripMarkdown(location);
  const cleanType     = stripMarkdown(type);
  const cleanSalary   = stripMarkdown(salary);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3 my-2 font-sans"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-lg tracking-tight line-clamp-2 break-words">
            {cleanTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm truncate">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{cleanCompany}</span>
          </div>
        </div>
        <div className="bg-zinc-100 px-2 py-1 rounded-md text-xs font-bold tracking-wider uppercase text-gray-500 whitespace-nowrap shrink-0">
          {cleanType}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
          <MapPin className="w-3.5 h-3.5" />
          {cleanLocation}
        </div>
        {cleanSalary && (
          <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
            <Briefcase className="w-3.5 h-3.5" />
            {cleanSalary}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
        <button
          onClick={onViewRole}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-black px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          View Role
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
