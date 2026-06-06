"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  X,
  Rocket,
  MapPin,
  Building2,
  Clock,
  CalendarDays,
  DollarSign,
  BarChart3,
  Cpu,
  Shield,
  ChevronRight,
  Search,
  Filter,
  Zap,
} from "lucide-react";
import type { ActionDeckJob } from "./ActionDeck";

export interface JobExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: ActionDeckJob[];
  onDeploy: (id?: string) => Promise<void> | void;
}

/* ── Circular score ring (SVG) ─────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringColor =
    score >= 90 ? "stroke-emerald-500" : score >= 75 ? "stroke-blue-500" : "stroke-amber-500";
  const textColor =
    score >= 90 ? "text-emerald-600" : score >= 75 ? "text-blue-600" : "text-amber-600";

  return (
    <div className="relative flex items-center gap-3">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={radius} className="stroke-gray-100 fill-none" strokeWidth="5" />
        <motion.circle
          cx="28" cy="28" r={radius}
          className={`${ringColor} fill-none`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center w-[56px]">
        <span className={`text-sm font-black ${textColor}`}>{score}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quality</span>
        <span className="text-xs font-semibold text-gray-600">AI Match</span>
      </div>
    </div>
  );
}

/* ── Score badge for list items ─────────────────────────────────── */
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-50 text-emerald-700"
      : score >= 75
      ? "bg-blue-50 text-blue-700"
      : "bg-amber-50 text-amber-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}%</span>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export function JobExplorerModal({ isOpen, onClose, jobs, onDeploy }: JobExplorerModalProps) {
  const [activeJob, setActiveJob] = useState<ActionDeckJob>(jobs[0]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({ remote: false, salary: '', date: '' });

  // Reset active job when jobs array changes or modal opens
  useEffect(() => {
    if (isOpen && jobs.length > 0) {
      setActiveJob(jobs[0]);
    }
  }, [isOpen, jobs]);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleDeploy = async () => {
    if (!activeJob) return;
    setIsDeploying(true);
    try {
      await onDeploy(activeJob.id);
    } finally {
      setIsDeploying(false);
    }
  };

  if (jobs.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="explorer-backdrop"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Container — split pane */}
          <motion.div
            key="explorer-panel"
            className="relative z-10 w-[95vw] max-w-7xl h-[85vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden font-sans text-gray-900 antialiased"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 30, stiffness: 380, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT PANE: Master List ─────────────────────────── */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50 flex flex-col shrink-0 relative">
              {/* Sticky search/filter header */}
              <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">{jobs.length} Matched Roles</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search roles..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="flex items-center justify-center px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                    <Filter className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Job list */}
              <div className="flex flex-col w-full bg-white">
                {/* Derive a stable active index so missing/duplicate IDs don't break the active state */}
                {(() => {
                  const activeIndex = activeJob
                    ? jobs.findIndex((j) => j === activeJob || (j.id && activeJob.id && j.id === activeJob.id))
                    : -1;

                  return (
                    <LayoutGroup>
                      {jobs.map((job, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <motion.div
                        key={job.id ?? idx}
                        onClick={() => setActiveJob(job)}
                        className="relative flex gap-4 p-4 border-b border-gray-200 cursor-pointer text-gray-600"
                        animate={{ backgroundColor: isActive ? 'rgb(219 234 254 / 0.4)' : 'rgb(255 255 255 / 1)' }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Active State Left Bar */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          />
                        )}

                        {/* Logo Placeholder (Left) */}
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xl font-bold text-gray-400">
                            {job.company ? job.company.charAt(0) : 'C'}
                          </span>
                        </div>

                        {/* Content Stack (Right) */}
                        <div className="flex flex-col text-left flex-1 min-w-0">
                          <h3 className={`text-base leading-tight mb-1 truncate ${
                            isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                          }`}>
                            {job.title}
                          </h3>
                          <span className="text-sm text-gray-900 mb-0.5 truncate">{job.company}</span>
                          <span className="text-sm text-gray-500 mb-2 truncate">{job.location}</span>

                          {/* Meta Row (Time & Match) */}
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-semibold text-green-700">Actively recruiting</span>
                            <span className="text-xs font-medium text-gray-500">{job.matchScore || '95'}% Match</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                    </LayoutGroup>
                  );
                })()}
              </div>

              {/* Sticky Deploy to All footer */}
              <div className="sticky bottom-0 bg-white z-10 p-4 border-t border-gray-100 mt-auto">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  onClick={() => console.log('Applying to all...')}
                >
                  Apply to All Matches
                </button>
              </div>
            </div>

            {/* ── RIGHT PANE: Detail View ────────────────────────── */}
            <div className="w-2/3 overflow-y-auto relative flex flex-col">
              {/* Sticky Header */}
              <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                    {activeJob?.company}
                  </p>
                  <p className="text-base font-bold text-gray-900 truncate">{activeJob?.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content body */}
              <div className="flex-1 px-8 pt-7 pb-6 space-y-7">
                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 leading-tight">
                    {activeJob?.title}
                  </h2>
                </div>

                {/* Sub-header meta row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {activeJob?.company}
                  </span>
                  {activeJob?.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {activeJob.location}
                    </span>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 mt-6">
                      <DollarSign className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                      Salary
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {activeJob?.salary || "Not disclosed"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Estimated annual compensation</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 mt-6">
                      <BarChart3 className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                      AI Match Score
                    </p>
                    <p className="text-xl font-bold text-gray-900">{activeJob?.matchScore}%</p>
                    <p className="text-xs text-gray-400 mt-0.5">Calculated against your profile</p>
                  </div>
                </div>

                <div className="border-b border-gray-100" />

                {/* AI Reasoning */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 mt-6">
                    AI Match Analysis
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{activeJob?.reasoning}</p>
                </div>

                {/* About the Role */}
                {activeJob?.description && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">About the Role</h3>
                    <div className="leading-relaxed text-gray-600 text-sm whitespace-pre-wrap">
                      {activeJob.description}
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {activeJob?.techStack && activeJob.techStack.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeJob.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium"
                        >
                          <Cpu className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gray-400" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sticky Action Footer ──────────────────────────── */}
              <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-8 py-5 flex justify-between items-center">
                <ScoreRing score={activeJob?.matchScore ?? 0} />
                <div className="flex items-center gap-3">
                  {activeJob?.url && (
                    <a
                      href={activeJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      View Listing
                    </a>
                  )}
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-base font-bold rounded-2xl transition-all focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg cursor-pointer"
                  >
                    {isDeploying ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deploying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Deploy Application
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
