import React from "react";
import { MoreHorizontal, X } from "lucide-react";
import { OptionsMenu } from "./OptionsMenu";

interface ChatHeaderProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  showOptionsMenu: boolean;
  setShowOptionsMenu: (val: boolean) => void;
  handleNewChat: () => void;
}

export function ChatHeader({
  isExpanded,
  setIsExpanded,
  showOptionsMenu,
  setShowOptionsMenu,
  handleNewChat
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-50">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ready</span>
      </div>
      <div className="flex items-center gap-1 relative">
        <OptionsMenu 
          isOpen={showOptionsMenu} 
          onClose={() => setShowOptionsMenu(false)} 
          onNewChat={handleNewChat} 
        />
        <button 
          id="options-toggle-btn"
          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          aria-label="More options"
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none"
        >
          <svg className="size-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            aria-label="Close Focus Mode"
            className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-100 focus:outline-none"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
