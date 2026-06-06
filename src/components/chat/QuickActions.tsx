"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  FileText, 
  Activity, 
  PlusCircle,
  ArrowLeft,
  Zap,
  Upload,
  PenTool,
  UploadCloud,
  FilePlus
} from "lucide-react";
import { QuickActionMenu } from "../../store/useChatStore";

interface QuickActionsProps {
  currentMenu: QuickActionMenu;
  onSelect: (actionId: string, actionText: string) => void;
}

/**
 * PREMIUM ACTION CARD COMPONENT
 * Inspired by Linear/Vercel SaaS interfaces.
 */
interface ActionCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

function ActionCard({ onClick, icon, title, subtitle }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-left group"
    >
      {/* Icon — raw muted, no background circle */}
      <div className="shrink-0 text-zinc-400 group-hover:text-zinc-600 mt-0.5 mr-3 transition-colors">
        <div className="[&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">
          {title}
        </span>
        <span className="text-[12px] text-zinc-500 mt-0.5 line-clamp-1">
          {subtitle}
        </span>
      </div>
    </button>
  );
}

const MENU_DATA: Record<string, { 
  id: string; 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode;
  isSecondary?: boolean;
}[]> = {
  MAIN: [
    { 
      id: 'CHECK_STATUS', 
      title: "Application Status", 
      subtitle: "Track your pending reviews",
      icon: <Activity className="w-5 h-5" />
    },
    { 
      id: 'FIND_NEW', 
      title: "Find a new job", 
      subtitle: "Scan verified remote & local listings",
      icon: <Briefcase className="w-5 h-5" />
    },
    { 
      id: 'EDIT_RESUME', 
      title: "Edit my resume", 
      subtitle: "Update sections or upload a new PDF",
      icon: <FileText className="w-5 h-5" />
    }
  ],
  STATUS_SUBMENU: [],
  RESUME_ROOT_MENU: [
    { 
      id: 'CREATE_RESUME', 
      title: "Create new resume", 
      subtitle: "Build a tailored resume from scratch",
      icon: <FileText className="w-5 h-5" />
    },
    { 
      id: 'EDIT_EXISTING', 
      title: "Edit existing resume", 
      subtitle: "Upload a PDF or tweak sections",
      icon: <Upload className="w-5 h-5" />
    }
  ],
  RESUME_TWEAK_MENU: [
    { 
      id: 'TWEAK_BIO', 
      title: "Tweak professional bio", 
      subtitle: "Make your summary stand out",
      icon: <PenTool className="w-5 h-5" />
    },
    { 
      id: 'ADD_EXPERIENCE', 
      title: "Add work experience", 
      subtitle: "Format a new job entry perfectly",
      icon: <Briefcase className="w-5 h-5" />
    }
  ],
  CREATE_RESUME_MENU: [
    { 
      id: 'UPLOAD_BASE', 
      title: "Upload your resume", 
      subtitle: "Extract data from an existing PDF",
      icon: <UploadCloud className="w-5 h-5" />
    },
    { 
      id: 'START_SCRATCH', 
      title: "Create a new resume using Oitii", 
      subtitle: "Build from scratch with AI",
      icon: <FilePlus className="w-5 h-5" />
    }
  ],
  EMPTY_STATUS_MENU: [
    {
      id: 'FIND_NEW',
      title: "Start new Application",
      subtitle: "Find roles matching your skills",
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      id: 'FIND_ANY',
      title: "Find immediate gigs",
      subtitle: "Quick freelance or contract work",
      icon: <Zap className="w-5 h-5" />
    }
  ]
};

export function QuickActions({ currentMenu, onSelect }: QuickActionsProps) {
  if (currentMenu === 'HIDDEN' || !MENU_DATA[currentMenu]) return null;

  const actions = MENU_DATA[currentMenu];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-2 w-full pt-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            title={action.title}
            subtitle={action.subtitle}
            icon={action.icon}
            onClick={() => onSelect(action.id, action.title)}
          />
        ))}
      </div>

      {currentMenu !== 'MAIN' && (
        <button
          onClick={() => onSelect('BACK_MAIN', "Back to main menu")}
          className="self-start flex items-center text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors mt-2 px-1 py-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to main menu
        </button>
      )}
    </motion.div>
  );
}
