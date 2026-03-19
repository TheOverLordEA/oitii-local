import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export function OptionsMenu({ isOpen, onClose, onNewChat }: OptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      // Close menu if click is outside the menu AND outside the toggle button
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest("#options-toggle-btn")
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute top-full right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-20"
        >
          <div className="flex flex-col py-1">
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors text-left focus:outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-inset focus:ring-black"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              aria-label="Start new chat"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Start new chat
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
