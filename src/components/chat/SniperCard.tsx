import React, { useState } from "react";
import { Target, X, Rocket } from "lucide-react";

export interface SniperCardProps {
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
  onDeploy: (id?: string) => Promise<void> | void;
  onSkip: (id?: string) => void;
  onViewDetails?: () => void;
}

export function SniperCard({
  id,
  company,
  title,
  matchScore,
  reasoning,
  salary,
  location,
  techStack,
  onDeploy,
  onSkip,
  onViewDetails,
}: SniperCardProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplying(true);
    try {
      await onDeploy(id);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSkip(id);
  };

  return (
    <div
      onClick={onViewDetails}
      role={onViewDetails ? "button" : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      className={`font-sans w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative border border-gray-100 ${
        onViewDetails ? "cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]" : ""
      }`}
    >
      <div className="p-6 md:p-8">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-lg tracking-tight leading-tight mb-1 line-clamp-2 break-words">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-gray-500 font-medium text-sm truncate max-w-full">{company}</span>
            {location && (
              <>
                <span className="text-gray-300 shrink-0">•</span>
                <span className="text-gray-500 font-medium text-sm truncate max-w-full">{location}</span>
              </>
            )}
          </div>
        </div>

        {/* Metadata Pills - Minimalist style */}
        <div className="flex flex-wrap gap-2 mb-4">
          {salary && (
            <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-full">
              {salary}
            </span>
          )}
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {matchScore}% Match
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
          {reasoning}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDeploy}
            disabled={isApplying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-medium rounded-xl transition-colors focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Applying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Apply
              </span>
            )}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={isApplying}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 text-sm font-medium rounded-xl transition-colors focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          >
            <X className="w-4 h-4" />
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
