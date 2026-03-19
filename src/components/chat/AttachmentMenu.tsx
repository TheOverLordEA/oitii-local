import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Cloud, Link } from "lucide-react";

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadClick?: () => void;
}

export function AttachmentMenu({ isOpen, onClose, onUploadClick }: AttachmentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      // Close menu if click is outside the menu AND outside the toggle button
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest("#attachment-toggle-btn")
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-16 left-0 mb-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-lg overflow-hidden z-20"
        >
          <div className="flex flex-col py-1">
            {/* Primary Action */}
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-black transition-colors text-left focus:outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-inset focus:ring-black"
              onClick={() => {
                onClose();
                if (onUploadClick) onUploadClick();
              }}
              aria-label="Upload Resume"
            >
              <FileText className="w-4 h-4 text-zinc-600" />
              <span className="font-medium">Upload Resume</span>
            </button>
            
            <div className="h-px bg-zinc-100 my-1 mx-3" />

            {/* Secondary Actions (Disabled) */}
            <button
              type="button"
              disabled
              className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 text-left cursor-not-allowed group relative"
              aria-label="Connect Google Drive (Coming soon)"
            >
              <Cloud className="w-4 h-4 opacity-70" />
              <span>Connect Google Drive</span>
              <span className="absolute right-3 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Cooming Soon</span>
            </button>

            <button
              type="button"
              disabled
              className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 text-left cursor-not-allowed group relative"
              aria-label="Paste URL (Coming soon)"
            >
              <Link className="w-4 h-4 opacity-70" />
              <span>Paste URL</span>
              <span className="absolute right-3 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Coming Soon</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
