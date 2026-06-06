"use client";

import React, { useState } from "react";
import { SniperCard } from "./SniperCard";
import { JobDetailsModal } from "./JobDetailsModal";
import { JobExplorerModal } from "./JobExplorerModal";
import { deploySniperMatch, skipSniperMatch } from "@/actions/sniper";
import { useChatStore } from "../../store/useChatStore";
import { ChevronRight } from "lucide-react";

export interface ActionDeckJob {
  id: string;
  company: string;
  title: string;
  matchScore: number;
  reasoning: string;
  salary?: string;
  location?: string;
  techStack?: string[];
  description?: string;
  url: string;
}

export interface ActionDeckProps {
  jobs: ActionDeckJob[];
}

export function ActionDeck({ jobs }: ActionDeckProps) {
  const { addMessage } = useChatStore();
  const [handledJobs, setHandledJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<ActionDeckJob | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const handleDeploy = async (id?: string) => {
    if (!id) return;
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    try {
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: `Starting local Playwright engine for ${job.company}...` 
      });
      
      const res = await deploySniperMatch(job.id, job.url);
      
      if (res.success) {
        addMessage({ 
          id: Date.now().toString(), 
          type: "bot", 
          text: `Successfully applied to ${job.company}! I've taken a screenshot of the confirmation page and saved it to your profile.` 
        });
        setHandledJobs((prev) => new Set(prev).add(job.id));
      }
    } catch (err: any) {
      console.error(err);
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: `Failed to deploy application to ${job.company}: ${err.message}` 
      });
    }
  };

  const handleSkip = async (id?: string) => {
    if (!id) return;
    try {
      await skipSniperMatch(id);
      setHandledJobs((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter out jobs that have already been handled
  const visibleJobs = jobs.filter((job) => !handledJobs.has(job.id));

  if (visibleJobs.length === 0) {
    return null;
  }

  const carouselJobs = visibleJobs.length > 3 ? visibleJobs.slice(0, 3) : visibleJobs;
  const showExplorer = visibleJobs.length >= 1;

  return (
    <>
      <div className="w-full flex flex-col gap-3 pt-2">
        {carouselJobs.map((job, idx) => (
          <div key={job.id ?? idx} className="w-full">
            <SniperCard
              id={job.id}
              company={job.company}
              title={job.title}
              matchScore={job.matchScore}
              reasoning={job.reasoning}
              salary={job.salary}
              location={job.location}
              techStack={job.techStack}
              onDeploy={handleDeploy}
              onSkip={handleSkip}
              onViewDetails={() => setSelectedJob(job)}
            />
          </div>
        ))}

        {showExplorer && (
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {visibleJobs.length > 3 ? `View All ${visibleJobs.length} Matches` : "Open Job Explorer"}
                </p>
                <p className="text-xs text-gray-400">
                  {visibleJobs.length > 3
                    ? `${visibleJobs.length - 3} more role${visibleJobs.length - 3 !== 1 ? "s" : ""} available`
                    : "Full details & side-by-side view"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </button>
        )}
      </div>

      <JobDetailsModal
        isOpen={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onDeploy={handleDeploy}
      />

      <JobExplorerModal
        isOpen={isExplorerOpen}
        jobs={visibleJobs}
        onClose={() => setIsExplorerOpen(false)}
        onDeploy={handleDeploy}
      />
    </>
  );
}
