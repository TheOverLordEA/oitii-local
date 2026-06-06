"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Clock,
  MessageSquare,
  Award,
  X,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { getJobHuntStats, getJobHuntApplications, type JobHuntStats, type JobHuntApplication } from "@/actions/jobHunt";
import { calculateInterviewProbability } from "@/lib/interviewProbability";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface JobHuntPanelProps {
  /** When true, render as a compact overlay (mobile expanded view) */
  isOverlay?: boolean;
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: <Clock className="w-3 h-3" />,
  },
  APPLIED: {
    label: "Applied",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: <Briefcase className="w-3 h-3" />,
  },
  INTERVIEWING: {
    label: "Interviewing",
    color: "text-purple-700",
    bg: "bg-purple-50",
    icon: <MessageSquare className="w-3 h-3" />,
  },
  OFFER: {
    label: "Offer",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: <Award className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    icon: <X className="w-3 h-3" />,
  },
};

function daysSince(date: Date | string): number {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getProbabilityColor(probability: number): string {
  if (probability >= 70) return "text-emerald-600 bg-emerald-50";
  if (probability >= 40) return "text-blue-600 bg-blue-50";
  if (probability >= 20) return "text-amber-600 bg-amber-50";
  return "text-zinc-500 bg-zinc-100";
}

function getProbabilityLabel(probability: number): string {
  if (probability >= 70) return "High";
  if (probability >= 40) return "Moderate";
  if (probability >= 20) return "Low";
  return "Very Low";
}

/* ------------------------------------------------------------------ */
/* Stats Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-zinc-200 rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm"
    >
      <div className={`w-7 h-7 rounded-lg ${accent} flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-xl font-bold text-zinc-900 tracking-tight">{value}</span>
      <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Application Row                                                     */
/* ------------------------------------------------------------------ */

function ApplicationRow({ app }: { app: JobHuntApplication }) {
  const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
  const days = daysSince(app.appliedAt);
  const probability = calculateInterviewProbability(app.status, days);
  const probColor = getProbabilityColor(probability);
  const probLabel = getProbabilityLabel(probability);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-3 py-3 px-1 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 rounded-xl transition-colors cursor-default"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 truncate">
            {app.company}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} shrink-0`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">{app.role}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${probColor}`}
          title={`${probability}% interview probability`}
        >
          <TrendingUp className="w-3 h-3" />
          {probLabel}
        </span>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Panel                                                          */
/* ------------------------------------------------------------------ */

export function JobHuntPanel({ isOverlay, onClose }: JobHuntPanelProps) {
  const [stats, setStats] = useState<JobHuntStats | null>(null);
  const [applications, setApplications] = useState<JobHuntApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([getJobHuntStats(), getJobHuntApplications(8)])
      .then(([s, a]) => {
        if (!isMounted) return;
        setStats(s);
        setApplications(a);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const containerClass = isOverlay
    ? "bg-white w-full h-full flex flex-col overflow-hidden"
    : "bg-zinc-50/60 border-l border-zinc-200 flex-1 flex flex-col h-full overflow-hidden shrink-0";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-zinc-900" />
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
            Job Hunt
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            title="Close panel"
          >
            <X className="w-3.5 h-3.5 text-zinc-600" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      ) : !stats || stats.total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500">
            No applications yet.
          </p>
          <p className="text-xs text-zinc-400">
            Start a job search and Oitii will track everything here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Applied"
              value={stats.applied}
              icon={<Briefcase className="w-3.5 h-3.5 text-blue-600" />}
              accent="bg-blue-50"
            />
            <StatCard
              label="Interviewing"
              value={stats.interviewing}
              icon={<MessageSquare className="w-3.5 h-3.5 text-purple-600" />}
              accent="bg-purple-50"
            />
            <StatCard
              label="Offers"
              value={stats.offer}
              icon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
              accent="bg-emerald-50"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={<X className="w-3.5 h-3.5 text-red-600" />}
              accent="bg-red-50"
            />
          </div>

          {/* Applications List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Recent Applications
              </h4>
              <span className="text-[11px] text-zinc-400 font-medium">
                {stats.total} total
              </span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-3 shadow-sm">
              {applications.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">
                  No applications tracked yet.
                </p>
              ) : (
                applications.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))
              )}
            </div>
          </div>

          {/* Interview Probability Summary */}
          {stats.interviewing + stats.offer > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">
                  Pipeline Active
                </span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {stats.interviewing > 0
                  ? `${stats.interviewing} role${stats.interviewing > 1 ? "s" : ""} in the interview stage. Stay sharp!`
                  : ""}
                {stats.offer > 0
                  ? ` ${stats.offer} offer${stats.offer > 1 ? "s" : ""} on the table. 🎉`
                  : ""}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile Bubble (triggers overlay)                                    */
/* ------------------------------------------------------------------ */

export function JobHuntBubble({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 bg-zinc-900 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg hover:bg-zinc-800 transition-colors"
    >
      <BarChart3 className="w-3.5 h-3.5" />
      <span>View {count} applied job{count !== 1 ? "s" : ""}</span>
      <ChevronRight className="w-3 h-3 text-zinc-400" />
    </motion.button>
  );
}
