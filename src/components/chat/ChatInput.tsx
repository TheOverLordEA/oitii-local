import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X, Image, FileText, Smile } from "lucide-react";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
      textareaRef.current.style.height = "24px";
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Attachment Badge */}
      {selectedFile && (
        <div className="flex items-center gap-2 self-start bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full border border-gray-200">
          <Paperclip className="w-3.5 h-3.5 text-gray-500" />
          <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-0.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
            aria-label="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form 
        className="relative bg-white rounded-[18px] transition-all"
        style={{
          boxShadow: isFocused 
            ? "0 0 0 1px rgba(0,0,0,0.12), 0 4px 24px -4px rgba(0,0,0,0.12)" 
            : "0 0 0 1px rgba(0,0,0,0.06), 0 2px 12px -4px rgba(0,0,0,0.08)"
        }}
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
        
        {/* Toolbar icons row */}
        <div className="flex items-center gap-0.5 px-3 pt-3">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!inputEnabled || isDisabled}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="size-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            <Image className="size-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            <FileText className="size-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
            <Smile className="size-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>

        {/* Textarea */}
        <div className="px-4 pb-4 pt-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={4000}
            rows={1}
            placeholder={isDisabled ? disabledPlaceholder : (inputEnabled ? "Ask anything about your job search..." : "Waiting for response...")}
            disabled={!inputEnabled || isDisabled}
            onFocus={() => {
              setIsFocused(true);
              onFocus();
            }}
            onBlur={() => setIsFocused(false)}
            aria-disabled={(!inputEnabled || isDisabled) ? "true" : "false"}
            className="w-full resize-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed pr-12 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ 
              minHeight: "24px", 
              maxHeight: "120px",
              transition: "height 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)"
            }}
          />
        </div>

        {/* Send Button */}
        <div className="absolute bottom-3.5 right-3.5">
          <button
            type="submit"
            disabled={!inputEnabled || isDisabled || (!inputValue.trim() && !selectedFile)}
            aria-label="Send message"
            aria-disabled={!inputEnabled || isDisabled || (!inputValue.trim() && !selectedFile) ? "true" : "false"}
            className={`flex items-center justify-center size-9 rounded-full transition-all duration-200 shadow-none focus:outline-none ${
              (inputValue.trim() || selectedFile) && inputEnabled && !isDisabled
                ? "bg-black hover:bg-slate-800 text-white hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="size-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
