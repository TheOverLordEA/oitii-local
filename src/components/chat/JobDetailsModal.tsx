"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Rocket,
  MapPin,
  Building2,
  Clock,
  CalendarDays,
  DollarSign,
  BarChart3,
  Briefcase,
  Shield,
  Cpu,
} from "lucide-react";

export interface JobDetailsData {
  id?: string;
  company: string;
  title: string;
  matchScore: number;
  reasoning: string;
  salary?: string;
  location?: string;
  techStack?: string[];
  description?: string;
  url?: string;
  experienceLevel?: string;
  postedAt?: string;
  timeline?: string;
  hiringProcess?: string[];
  workLocation?: string[];
  visaSponsorship?: string;
}

export interface JobDetailsModalProps {
  isOpen: boolean;
  job: JobDetailsData | null;
  onClose: () => void;
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
        <circle
          cx="28" cy="28" r={radius}
          className="stroke-gray-100 fill-none"
          strokeWidth="5"
        />
        <motion.circle
          cx="28" cy="28" r={radius}
          className={`${ringColor} fill-none`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
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

/* ── Main component ────────────────────────────────────────────── */
export function JobDetailsModal({ isOpen, job, onClose, onDeploy }: JobDetailsModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleDeploy = async () => {
    if (!job) return;
    setIsDeploying(true);
    try {
      await onDeploy(job.id);
      onClose();
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && job && (
        <motion.div
          key="job-modal-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Container */}
          <motion.div
            key="job-modal-panel"
            className="relative z-10 w-full max-w-3xl max-h-[90vh] mx-4 bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Close Button (absolute top-right) ─────────────── */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-30 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── Scrollable Body ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 pt-8 pb-6 space-y-7">

              {/* Header — Job Title */}
              <div className="pr-10">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                  {job.title}
                </h2>
              </div>

              {/* Sub-header Row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {job.location}
                  </span>
                )}
                {job.postedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {job.postedAt}
                  </span>
                )}
                {job.timeline && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    {job.timeline}
                  </span>
                )}
              </div>

              {/* ── Stats Grid (Two Columns) ────────────────────── */}
              <div className="grid grid-cols-2 gap-6">
                {/* Salary */}
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <DollarSign className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                    Salary
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {job.salary || "Not disclosed"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Estimated annual compensation</p>
                </div>
                {/* Experience Level */}
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <BarChart3 className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                    Experience Level
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {job.experienceLevel || "Not specified"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Required seniority for this role</p>
                </div>
              </div>

              <div className="border-b border-gray-100" />

              {/* ── AI Reasoning ─────────────────────────────────── */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                  AI Match Analysis
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{job.reasoning}</p>
              </div>

              {/* ── About the Role ───────────────────────────────── */}
              {job.description && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">About the Role</h3>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>
              )}

              {/* ── Hiring Process Pills ─────────────────────────── */}
              {job.hiringProcess && job.hiringProcess.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Hiring Process</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.hiringProcess.map((step, i) => (
                      <span
                        key={i}
                        className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Work Location Pills ──────────────────────────── */}
              {job.workLocation && job.workLocation.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Work Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.workLocation.map((loc, i) => (
                      <span
                        key={i}
                        className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Skills Pills ─────────────────────────────────── */}
              {job.techStack && job.techStack.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.techStack.map((tech, i) => (
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

              {/* ── Visa Sponsorship ─────────────────────────────── */}
              {job.visaSponsorship && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Visa Sponsorship</h3>
                  <span className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    {job.visaSponsorship}
                  </span>
                </div>
              )}
            </div>

            {/* ── Sticky Action Footer ──────────────────────────── */}
            <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-8 py-5 flex justify-between items-center">
              {/* Left: Score Ring */}
              <ScoreRing score={job.matchScore} />

              {/* Right: Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-base font-bold rounded-2xl transition-all focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg cursor-pointer"
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
