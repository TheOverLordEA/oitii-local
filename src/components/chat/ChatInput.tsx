import React, { useState, useRef, useEffect } from "react";
import { Plus, Send, Paperclip, X } from "lucide-react";
import { AttachmentMenu } from "./AttachmentMenu";

interface ChatInputProps {
  inputEnabled: boolean;
  onSendMessage: (text: string) => void;
  onFocus: () => void;
  onFileUpload?: (file: File) => void;
  isDisabled?: boolean;
  disabledPlaceholder?: string;
}

export function ChatInput({ 
  inputEnabled, 
  onSendMessage, 
  onFocus, 
  onFileUpload,
  isDisabled = false,
  disabledPlaceholder = "Please select an option above..."
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !inputEnabled || isDisabled) return;
    
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile);
    }
    
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
    }
    
    setInputValue("");
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <footer className="p-4 bg-white border-t border-zinc-100 flex flex-col gap-2 relative">
      {/* Attachment Badge */}
      {selectedFile && (
        <div className="flex items-center gap-2 self-start bg-zinc-100 text-zinc-800 text-xs px-3 py-1.5 rounded-full border border-zinc-200">
          <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
          <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-0.5 hover:bg-zinc-200 rounded-full text-zinc-500 hover:text-black transition-colors focus:outline-none"
            aria-label="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form 
        className="relative flex items-end bg-zinc-50 border border-zinc-200 rounded-[24px] transition-all"
        onSubmit={handleSubmit}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".pdf,.doc,.docx" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
            // Reset input so the same file could be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
          }} 
        />
        <AttachmentMenu 
          isOpen={showPlusMenu} 
          onClose={() => setShowPlusMenu(false)} 
          onUploadClick={() => fileInputRef.current?.click()}
        />
        <button
          id="attachment-toggle-btn"
          type="button"
          onClick={() => setShowPlusMenu(!showPlusMenu)}
          disabled={!inputEnabled || isDisabled}
          className="h-[48px] pl-4 pr-2 shrink-0 flex items-center text-zinc-500 hover:text-black transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add attachment"
        >
          <Plus className={`w-5 h-5 transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} />
        </button>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
          rows={1}
          placeholder={isDisabled ? disabledPlaceholder : (inputEnabled ? "Type your message..." : "Waiting for response...")}
          disabled={!inputEnabled || isDisabled}
          onFocus={onFocus}
          aria-disabled={(!inputEnabled || isDisabled) ? "true" : "false"}
          className="w-full bg-transparent py-3.5 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed resize-none overflow-y-auto"
          style={{ minHeight: "48px" }}
        />
        <button
          type="submit"
          disabled={!inputEnabled || isDisabled || (!inputValue.trim() && !selectedFile)}
          aria-label="Send message"
          aria-disabled={!inputEnabled || isDisabled || (!inputValue.trim() && !selectedFile) ? "true" : "false"}
          className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Send className="w-4 h-4 ml-[2px] mt-px" />
        </button>
      </form>
    </footer>
  );
}
