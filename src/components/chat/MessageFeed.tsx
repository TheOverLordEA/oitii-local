import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Zap, Radar, Cpu, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "../../store/useChatStore";
import { TypingIndicator } from "./TypingIndicator";
import { JobCard } from "./JobCard";
import { InteractiveOptions } from "./InteractiveOptions";
import { ApplyConfirmationCard } from "./ApplyConfirmationCard";
import { ResumeAnalyzingIndicator } from "./ResumeAnalyzingIndicator";
import { ActionDeck, ActionDeckJob } from "./ActionDeck";
import { ActiveSearchForm } from "./ActiveSearchForm";
import { PassiveSearchOptions } from "./PassiveSearchOptions";

interface MessageFeedProps {
  messages: Message[];
  isTransitioning: boolean;
  isTyping?: boolean;
  isAnalyzing?: boolean;
  onSendMessage?: (text: string) => void;
  children?: React.ReactNode;
}

export function MessageFeed({
  messages,
  isTransitioning,
  isTyping,
  isAnalyzing,
  onSendMessage,
  children,
}: MessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  // Auto-scroll to bottom whenever the inner content height changes.
  // Debounced to avoid layout thrashing during container resize transitions.
  useEffect(() => {
    if (!scrollRef.current || !innerRef.current) return;

    let rafId: number | null = null;
    let lastHeight = innerRef.current.scrollHeight;
    let lastMessagesLength = messages.length;
    let isSmoothScrolling = false;
    let smoothScrollTimeout: NodeJS.Timeout;

    const scrollToBottom = (smooth: boolean) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!scrollRef.current || !innerRef.current) return;
        
        const currentHeight = innerRef.current.scrollHeight;
        const currentLength = messages.length;
        
        // Detect if a new message was just added
        const isNewMessage = currentLength > lastMessagesLength;
        lastMessagesLength = currentLength;

        // If a new message was added, trigger a smooth scroll and block 'auto' snaps for 500ms
        if (isNewMessage) {
          isSmoothScrolling = true;
          clearTimeout(smoothScrollTimeout);
          smoothScrollTimeout = setTimeout(() => {
            isSmoothScrolling = false;
          }, 500); // Wait for smooth scroll to finish
          
          scrollToBottom(true);
        } else if (!isSmoothScrolling) {
          // For container resizing or text streaming, use 'auto' to pin to bottom instantly without jitter.
          // We only do this if we aren't currently smooth scrolling to avoid interrupting the animation.
          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
          
          if (isNearBottom || isFirstScroll.current) {
            scrollToBottom(false);
          }
        }
        
        lastHeight = currentHeight;
        isFirstScroll.current = false;
      });
    });

    resizeObserver.observe(innerRef.current);
    resizeObserver.observe(scrollRef.current);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      clearTimeout(smoothScrollTimeout);
    };
  }, [messages.length]); // Add dependency to track length properly

  return (
    <div
      className="flex-1 w-full flex justify-center overflow-y-auto pt-8 pb-32 bg-white"
      role="log"
      aria-live="polite"
      ref={scrollRef}
    >
      <div
        ref={innerRef}
        className="w-full max-w-4xl flex flex-col px-4 sm:px-8 min-h-full"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && !isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center justify-center h-full py-8 my-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-10 mt-16"
              >
                <h3 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">
                  Find your next
                  <br />
                  <span className="text-slate-400">opportunity</span>
                </h3>
              </motion.div>
            </motion.div>
          ) : (
            messages
              .filter(
                (msg, index, self) =>
                  index === self.findIndex((m) => m.id === msg.id),
              )
              .map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={msg.type === "user" ? "flex w-full justify-end mb-6 group" : "flex w-full mb-8 group"}
                >
                  {/* Content Column */}
                  <div className={msg.type === "user" ? "max-w-[80%]" : "flex flex-col w-full min-w-0"}>

                    {/* Message Body */}
                    <div
                      className={
                        msg.type === "user"
                          ? "bg-zinc-100 border border-zinc-200/50 px-5 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed text-zinc-800 break-words"
                          : "text-[15px] leading-relaxed text-zinc-800 break-words"
                      }
                    >
                      <div className="space-y-4 wrap-break-word">
                        {/* Render tool invocations as cards */}
                        {msg.toolInvocations?.map((invocation, idx) => {
                          if (
                            invocation.toolName === "request_apply" &&
                            invocation.result &&
                            typeof invocation.result === "object" &&
                            invocation.result !== null &&
                            "ok" in invocation.result &&
                            invocation.result.ok === true &&
                            "confirm" in invocation.result
                          ) {
                            const confirm = invocation.result.confirm as {
                              applicationId: string;
                              jobTitle: string;
                              company: string;
                              location?: string | null;
                              jobUrl: string;
                            };
                            return (
                              <ApplyConfirmationCard
                                key={invocation.toolCallId || idx}
                                {...confirm}
                              />
                            );
                          }

                          if (
                            invocation.toolName === "render_job_list" &&
                            invocation.result &&
                            typeof invocation.result === "object" &&
                            invocation.result !== null &&
                            "ok" in invocation.result &&
                            invocation.result.ok === true &&
                            "jobs" in invocation.result
                          ) {
                            const jobs = invocation.result
                              .jobs as ActionDeckJob[];
                            return (
                              <div
                                key={invocation.toolCallId || idx}
                                className="my-5 w-full"
                              >
                                <ActionDeck jobs={jobs} />
                              </div>
                            );
                          }

                          if (
                            invocation.toolName === "render_calibration_options"
                          ) {
                            return (
                              <div
                                key={invocation.toolCallId || idx}
                                className="flex flex-col mt-2 w-full"
                              >
                                <div className="my-4 text-center max-w-sm mx-auto">
                                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Initialization
                                  </span>
                                  <h2 className="text-sm font-medium text-gray-700 tracking-tight leading-normal mt-2">
                                    System initialized. Define your target
                                    deployment parameters.
                                  </h2>
                                </div>

                                <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                      type: "spring",
                                      bounce: 0,
                                      duration: 0.2,
                                    }}
                                    onClick={() =>
                                      onSendMessage?.(
                                        "User selected: Active Search",
                                      )
                                    }
                                    className="group relative w-full flex items-center justify-between p-5 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 hover:bg-gray-50 transition-colors text-left overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                                    <div className="relative flex items-center gap-4">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <Zap className="w-5 h-5" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-base font-semibold text-gray-900">
                                          Actively Searching
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 mt-0.5">
                                          High urgency, immediate market
                                          scanning
                                        </span>
                                      </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all relative" />
                                  </motion.button>

                                  <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                      type: "spring",
                                      bounce: 0,
                                      duration: 0.2,
                                    }}
                                    onClick={() =>
                                      onSendMessage?.(
                                        "User selected: Passive Search",
                                      )
                                    }
                                    className="group relative w-full flex items-center justify-between p-5 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 hover:bg-gray-50 transition-colors text-left overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                                    <div className="relative flex items-center gap-4">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                        <Radar className="w-5 h-5" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-base font-semibold text-gray-900">
                                          Passively Browsing
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 mt-0.5">
                                          Low urgency, silent monitoring for
                                          perfect matches
                                        </span>
                                      </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all relative" />
                                  </motion.button>
                                </div>
                              </div>
                            );
                          }

                          if (invocation.toolName === "configure_active_mode") {
                            return (
                              <div
                                key={invocation.toolCallId || idx}
                                className="my-3 w-full"
                              >
                                <ActiveSearchForm
                                  onSubmit={(data) =>
                                    onSendMessage?.(
                                      `Active mode configured: ${JSON.stringify(data)}`,
                                    )
                                  }
                                />
                              </div>
                            );
                          }

                          if (
                            invocation.toolName === "configure_passive_mode"
                          ) {
                            return (
                              <div
                                key={invocation.toolCallId || idx}
                                className="my-3 w-full"
                              >
                                <PassiveSearchOptions
                                  onSelect={(option) =>
                                    onSendMessage?.(
                                      `Passive mode selected: ${option}`,
                                    )
                                  }
                                />
                              </div>
                            );
                          }

                          return null;
                        })}

                        {/* Markdown Killswitch / Interceptor */}
                        {(() => {
                          // Check 1: If render_job_list tool was successfully called, suppress text.
                          const hasRenderJobListTool =
                            msg.toolInvocations?.some(
                              (inv) => inv.toolName === "render_job_list",
                            );
                          const hasCalibrationTool = msg.toolInvocations?.some(
                            (inv) =>
                              inv.toolName === "render_calibration_options",
                          );
                          if (hasRenderJobListTool || hasCalibrationTool)
                            return null;

                          // Check 2: Fallback regex interceptor for raw markdown job lists.
                          // Looks for patterns like "1. **Title**" or "[View Role]"
                          const isMarkdownJobList =
                            /(?:\d+\.\s*\*\*.+\*\*[^\n]+)|(?:\[View Role\])/i.test(
                              msg.text,
                            );
                          if (isMarkdownJobList && msg.type === "bot") {
                            return (
                              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm flex flex-col gap-2">
                                <p className="font-semibold">
                                  ⚠️ UI Rendering Error
                                </p>
                                <p>
                                  The AI failed to use the Generative UI tool
                                  and outputted raw markdown. Please ask the AI
                                  to try searching again.
                                </p>
                              </div>
                            );
                          }

                          // Render normally if it passed the killswitch
                          return (
                            <div className="text-[15px] leading-relaxed text-zinc-800 break-words">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p
                                      className="leading-relaxed m-0"
                                      {...props}
                                    />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc pl-5 m-0 space-y-1"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal pl-5 m-0 space-y-1"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="pl-1" {...props} />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className="font-semibold"
                                      {...props}
                                    />
                                  ),
                                  a: ({ node, href, children, ...props }) => (
                                    <button
                                      type="button"
                                      className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Block the redirect. This ensures the user stays in the chat.
                                      }}
                                    >
                                      {children}
                                    </button>
                                  ),
                                  code: ({
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }: any) => {
                                    const matchJobs = /language-jobs/.exec(
                                      className || "",
                                    );
                                    const matchOptions =
                                      /language-options/.exec(className || "");
                                    const matchJson = /language-json/.exec(
                                      className || "",
                                    );

                                    // Try to parse the fenced content as JSON.
                                    const tryParse = () => {
                                      try {
                                        return JSON.parse(
                                          String(children).replace(/\n/g, ""),
                                        );
                                      } catch {
                                        return null;
                                      }
                                    };

                                    const renderJobs = (data: any[]) => (
                                      <div className="my-2 w-full">
                                        <ActionDeck jobs={data} />
                                      </div>
                                    );

                                    const renderOptions = (data: string[]) => (
                                      <InteractiveOptions
                                        options={data}
                                        onSelect={(option) =>
                                          onSendMessage?.(option)
                                        }
                                      />
                                    );

                                    if (!inline && matchJobs) {
                                      const data = tryParse();
                                      if (Array.isArray(data))
                                        return renderJobs(data);
                                    }

                                    if (!inline && matchOptions) {
                                      const data = tryParse();
                                      if (Array.isArray(data))
                                        return renderOptions(data);
                                    }

                                    // Defensive fallback: legacy ```json options / ```json jobs
                                    // blocks. Inspect parsed content and route to the right renderer.
                                    if (!inline && matchJson) {
                                      const data = tryParse();
                                      if (
                                        Array.isArray(data) &&
                                        data.length > 0
                                      ) {
                                        const first = data[0];
                                        if (typeof first === "string")
                                          return renderOptions(data);
                                        if (
                                          typeof first === "object" &&
                                          first?.title
                                        )
                                          return renderJobs(data);
                                      }
                                    }

                                    return (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          )}

          {isAnalyzing && (
            <ResumeAnalyzingIndicator key="analyzing-indicator" />
          )}
          {isTyping && !isAnalyzing && (
            <TypingIndicator key="typing-indicator" />
          )}
        </AnimatePresence>

        {children}
      </div>
    </div>
  );
}
