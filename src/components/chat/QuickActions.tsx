"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  FileText, 
  Activity, 
  MessageSquare, 
  XCircle, 
  ChevronRight,
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
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all text-left group relative overflow-hidden"
    >
      <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mr-4">
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <span className="text-xs text-zinc-500 mt-0.5">{subtitle}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
    </motion.button>
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
  STATUS_SUBMENU: [
    { 
      id: 'MSG_EMPLOYER', 
      title: "Message Employer", 
      subtitle: "Open secure messaging portal",
      icon: <MessageSquare className="w-5 h-5" />
    },
    { 
      id: 'WITHDRAW_APP', 
      title: "Withdraw Application", 
      subtitle: "Are you sure you want to withdraw?",
      icon: <XCircle className="w-5 h-5" />
    }
  ],
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
      className="flex flex-col gap-3 p-4 px-5"
    >
      <div className="grid grid-cols-1 gap-3">
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
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('BACK_MAIN', "Back to main menu")}
          className="flex items-center justify-center w-full py-2.5 mt-4 bg-white border border-zinc-200 rounded-xl shadow-sm text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all focus:outline-hidden focus:ring-2 focus:ring-zinc-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-zinc-400" />
          Back to main menu
        </motion.button>
      )}
      
      <button
        onClick={() => onSelect('TYPE_CUSTOM', "Write in the chat")}
        className="w-full block text-center py-2 mt-2 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-hidden"
      >
        Write in the chat
      </button>
    </motion.div>
  );
}
