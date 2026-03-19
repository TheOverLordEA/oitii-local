import React from "react";
import { Bot, MoreHorizontal, X } from "lucide-react";
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
    <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-white">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100"
          aria-hidden="true"
        >
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-zinc-900 text-sm">Oitii Agent</h2>
          <p className="text-xs text-zinc-500 font-medium">Online 24/7</p>
        </div>
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
          className={`p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-black ${
            showOptionsMenu ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-black hover:bg-zinc-50"
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            aria-label="Close Focus Mode"
            className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
