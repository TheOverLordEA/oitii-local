import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "../../store/useChatStore";
import { TypingIndicator } from "./TypingIndicator";
import ReactMarkdown from "react-markdown";

interface MessageFeedProps {
  messages: Message[];
  isTransitioning: boolean;
  isTyping?: boolean;
  onSendMessage?: (text: string) => void;
  children?: React.ReactNode;
}

import { JobCard } from "./JobCard";
import { InteractiveOptions } from "./InteractiveOptions";

export function MessageFeed({ messages, isTransitioning, isTyping, onSendMessage, children }: MessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  return (
    <motion.div 
      className="flex-1 overflow-y-auto bg-grainy relative px-4 md:px-6" 
      role="log" 
      aria-live="polite" 
      ref={scrollRef}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ opacity: { duration: 0.2, ease: "easeInOut" } }}
    >
      <div className="max-w-2xl mx-auto py-6 space-y-6 flex flex-col">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.type === "user" ? "justify-end pl-12" : "justify-start pr-12"}`}
            >
              <div
                className={`max-w-[380px] px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                  msg.type === "user"
                    ? "bg-black text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-zinc-800 border border-zinc-200 rounded-2xl rounded-tl-sm"
                }`}
              >
                <div className="space-y-3 wrap-break-word">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="leading-relaxed m-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 m-0 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 m-0 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      code: ({ inline, className, children, ...props }: any) => {
                        const matchJobs = /language-jobs/.exec(className || "");
                        const matchOptions = /language-options/.exec(className || "");
                        
                        if (!inline && matchJobs) {
                          try {
                            const data = JSON.parse(String(children).replace(/\n/g, ""));
                            return (
                              <div className="flex flex-col gap-2 mt-2">
                                {data.map((job: any, i: number) => (
                                  <JobCard key={i} {...job} />
                                ))}
                              </div>
                            );
                          } catch (e) {
                            return <code className={className} {...props}>{children}</code>;
                          }
                        }

                        if (!inline && matchOptions) {
                          try {
                            const data = JSON.parse(String(children).replace(/\n/g, ""));
                            return (
                              <InteractiveOptions 
                                options={data} 
                                onSelect={(option) => onSendMessage?.(option)} 
                              />
                            );
                          } catch (e) {
                            return <code className={className} {...props}>{children}</code>;
                          }
                        }

                        return <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && <TypingIndicator key="typing-indicator" />}
        </AnimatePresence>
        
        {children}
      </div>
    </motion.div>
  );
}
