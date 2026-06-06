"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useChatStore, QuickActionMenu } from "../../store/useChatStore";
import { ChatHeader } from "./ChatHeader";
import { MessageFeed } from "./MessageFeed";
import { QuickActions } from "./QuickActions";
import { getPendingApplicationsCount } from "@/actions/applications";
import { getCuratedJobs } from "@/actions/jobs";
import { SniperCard } from "./SniperCard";
import { JobDetailsModal } from "./JobDetailsModal";
import { JobHuntPanel, JobHuntBubble } from "./JobHuntPanel";
import { getPendingSniperMatch, skipSniperMatch, deploySniperMatch } from "@/actions/sniper";

/**
 * Maps user typed text to deterministic Action IDs to save API costs.
 */
function analyzeIntent(text: string): string | null {
  const query = text.toLowerCase().trim();
  
  // EDIT_RESUME: ("edit" | "update" | "fix") AND ("resume" | "cv")
  if (
    (query.includes("edit") || query.includes("update") || query.includes("fix")) && 
    (query.includes("resume") || query.includes("cv"))
  ) {
    return "EDIT_RESUME";
  }

  // CHECK_STATUS: ("check" | "status" | "update") AND ("application" | "applied")
  if (
    (query.includes("check") || query.includes("status") || query.includes("update")) && 
    (query.includes("application") || query.includes("applied"))
  ) {
    return "CHECK_STATUS";
  }

  // FIND_NEW: ("find" | "search" | "looking") AND ("job" | "work" || "role")
  if (
    (query.includes("find") || query.includes("search") || query.includes("looking")) && 
    (query.includes("job") || query.includes("work") || query.includes("role"))
  ) {
    return "FIND_NEW";
  }

  return null;
}
import { ChatInput } from "./ChatInput";

interface ChatWidgetProps {
  onOptionSelect?: (option: string) => void;
}

export function ChatWidget({ onOptionSelect }: ChatWidgetProps) {
  const { 
    messages, 
    onboardingStatus, 
    isTyping,
    isAnalyzing,
    quickActionMenu,
    hasGreetedThisSession,
    activeTask,
    completeOnboarding, 
    addMessage, 
    updateMessage,
    clearChat, 
    setIsTyping,
    setIsAnalyzing,
    setQuickActionMenu,
    setHasGreetedThisSession,
    setActiveTask,
    setIsWidgetExpanded
  } = useChatStore();
  const [isExpanded, setIsExpanded] = useState(false);
  // Use a ref for workspace size so we don't trigger constant React re-renders during a native drag
  const workspaceSizeRef = useRef({ width: 960, height: 640 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState<'welcome' | 'chat'>('welcome');
  const widgetRef = useRef<HTMLDivElement>(null);

  // JobHuntPanel visibility & width (desktop expanded only)
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(320);

  // Load saved workspace size & panel width from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oitii_workspace_size');
      if (saved) {
        workspaceSizeRef.current = JSON.parse(saved);
      }
      const savedPanelWidth = localStorage.getItem('oitii_panel_width');
      if (savedPanelWidth) {
        const w = parseInt(savedPanelWidth, 10);
        if (!isNaN(w) && w >= 200 && w <= 600) setPanelWidth(w);
      }
      const savedPanelVisible = localStorage.getItem('oitii_panel_visible');
      if (savedPanelVisible !== null) {
        setPanelVisible(savedPanelVisible === 'true');
      }
    } catch (err) {
      console.error("Failed to parse workspace size", err);
    }
  }, []);

  // ResizeObserver to track when the user drags the native CSS resize handle
  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      // Only track resizing when expanded
      if (!isExpanded) return;

      for (const entry of entries) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const target = entry.target as HTMLDivElement;
          // getBoundingClientRect ensures we get the actual final rendered size including borders
          const rect = target.getBoundingClientRect();
          const newWidth = Math.round(rect.width);
          const newHeight = Math.round(rect.height);
          
          const prev = workspaceSizeRef.current;
          // Only update and save if the size actually changed
          if (prev.width !== newWidth || prev.height !== newHeight) {
            workspaceSizeRef.current = { width: newWidth, height: newHeight };
            localStorage.setItem('oitii_workspace_size', JSON.stringify({ width: newWidth, height: newHeight }));
          }
        }, 100); // debounce slightly
      }
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isExpanded]); // re-run if isExpanded changes so it only tracks when expanded

  // Global mouse handlers for panel resize drag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startXRef.current - e.clientX; // dragging left = wider
      const newWidth = Math.min(600, Math.max(200, startWidthRef.current + delta));
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('oitii_panel_width', String(panelWidth));
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [panelWidth]);

  // Apply the expanded width/height manually so React doesn't diff and override 
  // the browser's native resize handle modifications
  useLayoutEffect(() => {
    if (isExpanded && widgetRef.current) {
      widgetRef.current.style.width = `${workspaceSizeRef.current.width}px`;
      widgetRef.current.style.height = `${workspaceSizeRef.current.height}px`;
    } else if (widgetRef.current) {
      // Clean up the inline styles so the collapsed state classes/React-styles take over
      widgetRef.current.style.width = '';
      widgetRef.current.style.height = '';
    }
  }, [isExpanded]);

  // Sync local expansion state to the global store so other UI (e.g. the
  // animated headline) can react and avoid distracting motion while the
  // widget is in focus.
  useEffect(() => {
    setIsWidgetExpanded(isExpanded);
  }, [isExpanded, setIsWidgetExpanded]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [pendingMatch, setPendingMatch] = useState<any>(null);
  const [selectedPendingJob, setSelectedPendingJob] = useState<any>(null);
  const [showJobHuntPanel, setShowJobHuntPanel] = useState(false);
  const [pendingAppCount, setPendingAppCount] = useState(0);

  // Fix hydration mismatch for persisted Zustand state
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Profile-aware greeting: reads local SQLite profile via /api/profile-summary.
  // If a resume has been parsed before, greet by name and surface inferred data
  // so the user can confirm or correct it via natural language.
  // Falls back to the generic greeting for fresh sessions with no profile.
  useEffect(() => {
    let isMounted = true;
    
    if (!hasHydrated || hasGreetedThisSession) return;
    if (messages.length > 0) {
      setHasGreetedThisSession(true);
      const complete = localStorage.getItem('oitii_onboarding_complete');
      setQuickActionMenu(complete === 'true' ? 'MAIN' : 'HIDDEN');
      return;
    }

    const buildGreeting = async () => {
      try {
        const res = await fetch("/api/profile-summary");
        if (!isMounted) return;
        
        if (res.ok) {
          const { profile } = await res.json();
          if (profile) {
            const firstName = profile.basicDetails?.firstName;
            const seniority = profile.inferredSeniority;
            
            let greetingText = "System online. What is our objective today?";
            
            if (firstName && seniority) {
               greetingText = `Welcome back, ${firstName}. Your profile is calibrated for **${seniority}**-level roles. What's the directive?`;
            } else if (firstName) {
               greetingText = `Welcome back, ${firstName}. What's the directive?`;
            }

            addMessage({
              id: Date.now().toString(),
              type: "bot",
              text: greetingText,
            });
            const complete = localStorage.getItem('oitii_onboarding_complete');
            setQuickActionMenu(complete === 'true' ? 'MAIN' : 'HIDDEN');
            setHasGreetedThisSession(true);
            return;
          }
        }
      } catch (e) {
        // silent fallback
      }

      if (!isMounted) return;
      // No profile found — fresh session default
      addMessage({
        id: "fresh-greeting",
        type: "bot",
        text: "👋 I'm Oitii — your AI career agent. Drop your resume to get started, or tell me what kind of role you're looking for.",
      });
      setHasGreetedThisSession(true);
      // If they haven't completed onboarding, keep the menu hidden so the calibration tool takes priority
      const complete = localStorage.getItem('oitii_onboarding_complete');
      setQuickActionMenu(complete === 'true' ? 'MAIN' : 'HIDDEN');
    };

    buildGreeting();
    
    return () => {
      isMounted = false;
    };
  }, [hasHydrated, hasGreetedThisSession, messages.length, setHasGreetedThisSession, setQuickActionMenu, addMessage]);


  // Prevent background scrolling when widget is expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const handleQuickAction = (actionId: string, actionText: string) => {
    // 0. Handle escape hatches / non-message actions first
    if (actionId === 'TYPE_CUSTOM') {
      setQuickActionMenu('HIDDEN');
      return;
    }
    
    if (actionId === 'BACK_MAIN') {
      setQuickActionMenu('MAIN');
      return;
    }

    // 1. Log user action
    addMessage({ id: Date.now().toString(), type: "user", text: actionText });
    
    // CRITICAL: Trigger typing indicator IMMEDIATELY before the async DB/Action call
    setIsTyping(true);

    // 2. Cascading switchboard
    // Immediately hide the menu to provide instant feedback
    const previousMenu = quickActionMenu;
    setQuickActionMenu('HIDDEN');

    setTimeout(async () => {
      let botResponse = "";
      let nextMenu: QuickActionMenu = 'HIDDEN';

      switch (actionId) {
        case 'CHECK_STATUS': {
          const count = await getPendingApplicationsCount();
          if (count > 0) {
            botResponse = `Let me pull up your dashboard. You have ${count} applications pending review.`;
          } else {
            botResponse = "Your dashboard is currently empty. Let's get your resume out there and start landing some interviews!";
          }
          nextMenu = 'HIDDEN';
          break;
        }
        case 'EDIT_RESUME':
          botResponse = "Are we building a brand new resume from scratch, or are we updating an existing one?";
          nextMenu = 'RESUME_ROOT_MENU';
          break;
        case 'CREATE_RESUME':
          botResponse = "Great. You can upload an existing resume to give me a head start, or we can build a brand new one using Oitii.";
          nextMenu = 'CREATE_RESUME_MENU';
          break;
        case 'UPLOAD_BASE':
          botResponse = "Please click the paperclip icon below to upload your file, and I'll extract your history.";
          nextMenu = 'HIDDEN';
          break;
        case 'START_SCRATCH':
          botResponse = "Let's build it. First, what is your target job title?";
          nextMenu = 'HIDDEN';
          break;
        case 'EDIT_EXISTING':
          botResponse = "Perfect. You can upload your PDF using the paperclip icon below, or choose a specific section you'd like me to rewrite.";
          nextMenu = 'RESUME_TWEAK_MENU';
          break;
        case 'TWEAK_BIO':
          setActiveTask('AWAITING_BIO_TEXT');
          botResponse = "Let's punch up that bio. Paste your current summary or tell me the vibe you are going for.";
          nextMenu = 'HIDDEN';
          break;
        case 'ADD_EXPERIENCE':
          botResponse = "Let's add that experience. What was your role, the company name, and your biggest achievement there?";
          nextMenu = 'HIDDEN';
          break;
        case 'FIND_NEW': {
          const jobs = await getCuratedJobs();
          if (!jobs || jobs.length === 0) {
            botResponse = "I just scanned the network, but I don't see any new scam-free roles matching our strict criteria right now. Check back soon!";
          } else {
            const mappedJobs = jobs.map((job: any) => ({
              title: job.title,
              company: job.company,
              location: job.location || "Remote",
              type: "Full-time",
              url: job.url
            }));
            botResponse = "I found these verified, scam-free listings for you:\n\n```json\n" + JSON.stringify(mappedJobs, null, 2) + "\n```";
          }
          nextMenu = 'HIDDEN';
          break;
        }
        default:
          botResponse = "I'm ready to help. What's on your mind?";
          nextMenu = 'HIDDEN';
      }

      addMessage({ id: Date.now().toString(), type: "bot", text: botResponse });
      setQuickActionMenu(nextMenu);
      setIsTyping(false);
    }, 250);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (activeTask === 'AWAITING_BIO_TEXT') {
      setActiveTask(null); // Reset immediately
      addMessage({ id: Date.now().toString(), type: "user", text });
      setIsTyping(true);
      
      try {
        // Call a new specific endpoint for tweaking bios
        const response = await fetch("/api/tailor-bio", {
          method: "POST",
          body: JSON.stringify({ currentBio: text })
        });
        const data = await response.json();
        addMessage({ id: (Date.now() + 1).toString(), type: "bot", text: data.polishedBio });
      } catch (error) {
        addMessage({ id: (Date.now() + 1).toString(), type: "bot", text: "I hit a snag rewriting that. Let's try again." });
      } finally {
        setIsTyping(false);
      }
      return; // Exit early
    }

    // --- Intent Interceptor ---
    // Check if the typed text matches a known deterministic action
    const matchedActionId = analyzeIntent(text);
    if (matchedActionId) {
      handleQuickAction(matchedActionId, text);
      return;
    }

    // Step 1: Optimistic UI update
    const userMessageId = Date.now().toString();
    addMessage({ id: userMessageId, type: "user", text });
    setIsTyping(true);

    try {
      // API Call with conversation history mapping
      const history = messages.map((msg) => ({
        role: msg.type === "bot" ? "assistant" : "user",
        content: msg.text,
      }));

      const payload = {
        messages: [...history, { role: "user", content: text }],
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      // Create an empty bot message that we'll stream into
      const botMessageId = (Date.now() + 1).toString();
      addMessage({ id: botMessageId, type: "bot", text: "" });

      // Consume the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          updateMessage(botMessageId, { text: accumulated });
        }
      }

      // Final update in case decoder had pending bytes
      updateMessage(botMessageId, { text: accumulated || "I'm sorry, I couldn't process that." });
    } catch (error) {
      console.error("Chat API Error:", error);
      addMessage({
        id: Date.now().toString(),
        type: "bot",
        text: "Sorry, my servers are currently offline or unreachable. Please try again later.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    addMessage({ id: Date.now().toString(), type: "user", text: `📎 ${file.name}` });
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Build a personalized deduction message from the inferred profile
      const p = result.profile ?? {};
      const name = p.name ? `**${p.name}**` : "you";
      const seniority = p.seniority ?? "experienced";
      const salary = p.salary ? `~$${(p.salary / 1000).toFixed(0)}k` : null;
      const arrangement = p.workArrangement && p.workArrangement !== "any" ? p.workArrangement : null;
      const dealbreakers: string[] = p.dealbreakers ?? [];

      let deduction = `Got it — I've read ${name}'s resume. Here's what I inferred:\n\n`;
      deduction += `- **Seniority:** ${seniority}\n`;
      if (salary) deduction += `- **Baseline salary:** ${salary}/yr\n`;
      if (arrangement) deduction += `- **Work preference:** ${arrangement}\n`;
      if (dealbreakers.length > 0) deduction += `- **Dealbreakers:** ${dealbreakers.join(", ")}\n`;
      deduction += `\nDoes that look right? Correct anything, or tell me what kind of role to search for.`;

      addMessage({ id: Date.now().toString(), type: "bot", text: deduction });
    } catch (error) {
      console.error("Upload error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      addMessage({
        id: Date.now().toString(),
        type: "bot",
        text: `I couldn't process that resume — ${msg}. Please check your API key in \`.env.local\` and try again.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!hasHydrated) return;
    
    // Poll every 5 seconds for a pending match
    const pollMatches = async () => {
      try {
        const match = await getPendingSniperMatch();
        setPendingMatch(match);
      } catch (err) {
        // Ignore silent errors for polling
      }
    };

    pollMatches();
    const interval = setInterval(pollMatches, 15000); // Poll every 15s instead of 5s
    return () => clearInterval(interval);
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    const pollCount = async () => {
      try {
        const count = await getPendingApplicationsCount();
        setPendingAppCount(count);
      } catch {
        // silent
      }
    };

    pollCount();
    const countInterval = setInterval(pollCount, 30000);
    return () => clearInterval(countInterval);
  }, [hasHydrated]);

  const handleSniperDeploy = async () => {
    if (!pendingMatch) return;
    try {
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: `Starting local Playwright engine for ${pendingMatch.company}...` 
      });
      
      const res = await deploySniperMatch(pendingMatch.id, pendingMatch.jobUrl);
      
      if (res.success) {
        setPendingMatch(null);
        addMessage({ 
          id: Date.now().toString(), 
          type: "bot", 
          text: `Successfully applied to ${pendingMatch.company}! I've taken a screenshot of the confirmation page and saved it to your profile.` 
        });
      }
    } catch (err: any) {
      console.error(err);
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: `Failed to deploy application: ${err.message}` 
      });
      setPendingMatch(null);
    }
  };

  const handleSniperSkip = async () => {
    if (!pendingMatch) return;
    try {
      await skipSniperMatch(pendingMatch.id);
      setPendingMatch(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    } else if (file) {
      addMessage({
        id: Date.now().toString(),
        type: "bot",
        text: "Only PDF files are supported for resume uploads.",
      });
    }
  };

  const handleNewChat = () => {
    clearChat();
    setIsTyping(false);
    setShowOptionsMenu(false);
    setHasGreetedThisSession(false);
  };

  // We should wait until client render for hydration match for persist middleware
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const complete = localStorage.getItem('oitii_onboarding_complete');
      if (complete === 'true') {
        setOnboardingStage('chat');
      }
    } catch (e) {
      // localStorage unavailable
    }
  }, []);

  // Seed initial calibration message for brand-new users.
  // Two guards are required:
  //   1. hasSeededRef  – prevents StrictMode double-invoke (refs survive remounts, closures don't)
  //   2. messages.some – prevents re-seeding after persist rehydration restores a previous init-msg
  // 'messages' is intentionally omitted from deps: this is a one-shot seeder, not a reactor.
  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (hasSeededRef.current || !hasHydrated || onboardingStage !== 'welcome') return;
    if (messages.some((m) => m.id === 'init-msg')) {
      hasSeededRef.current = true;
      return;
    }
    hasSeededRef.current = true;
    addMessage({
      id: 'init-msg',
      type: 'bot',
      text: 'System initialized. Define your target deployment parameters.',
      toolInvocations: [{
        toolCallId: 'init-calibration',
        toolName: 'render_calibration_options',
        args: {},
      }],
    });
    setQuickActionMenu('HIDDEN');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, onboardingStage, addMessage, setQuickActionMenu]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <>
      {/* Dev-only: reset onboarding for rapid QA */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.removeItem('oitii_onboarding_complete');
            window.location.reload();
          }}
          className="fixed bottom-2 left-2 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded opacity-50 hover:opacity-100 z-50"
        >
          Reset Onboarding
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="backdrop-blur-sm bg-black/20 z-40 fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className={`w-full max-w-md h-[600px] relative pointer-events-none ${isExpanded ? "z-50" : "z-10"}`}>
        <div 
          className={
            isExpanded 
              ? "fixed inset-0 flex items-center justify-center p-4 pointer-events-none" 
              : "absolute inset-0 flex items-center justify-center pointer-events-none"
          }
        >
          <section 
            ref={widgetRef}
            aria-label="Oitii Job Assistant"
            onClick={(e) => e.stopPropagation()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={isExpanded 
              ? { 
                  transition: 'box-shadow 0.3s ease' 
                } 
              : { 
                  width: '100%', 
                  maxWidth: '448px', 
                  height: '600px',
                  transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), max-width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease' 
                }
            }
            className={`bg-white rounded-[24px] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] flex flex-col pointer-events-auto ${
              isExpanded 
                ? "resize overflow-hidden min-w-[800px] min-h-[600px] max-w-[95vw] max-h-[95vh]" 
                : "overflow-hidden h-[600px] w-full max-w-[460px] min-h-[520px]"
            } ${isDragOver ? "border-2 border-blue-400 ring-4 ring-blue-100" : ""}`}
          >
            {isExpanded && (
              <div className="w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse h-[2px] shrink-0"></div>
            )}
            
            {/* Inner Content wrapper */}
            <div className={`relative h-full w-full overflow-hidden ${isExpanded ? 'flex flex-row' : 'flex flex-col'}`}>
              {/* Welcome Overlay */}
              <AnimatePresence>
                {onboardingStage === 'welcome' && (
                  <motion.div
                    className="absolute inset-0 z-50 bg-white flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 2.3, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                      setOnboardingStage('chat');
                      try {
                        localStorage.setItem('oitii_onboarding_complete', 'true');
                      } catch (e) {
                        // localStorage unavailable
                      }
                    }}
                  >
                    <motion.span
                      style={{ fontFamily: "var(--font-inter)" }}
                      className="text-4xl font-semibold tracking-[-0.04em] text-zinc-950"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      Welcome.
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Content Column */}
              <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
                <ChatHeader 
                  isExpanded={isExpanded}
                  setIsExpanded={setIsExpanded}
                  showOptionsMenu={showOptionsMenu}
                  setShowOptionsMenu={setShowOptionsMenu}
                  handleNewChat={handleNewChat}
                />

                {!hasHydrated ? (
                  <div className="flex-1 overflow-y-auto bg-white relative" />
                ) : (
                  <MessageFeed 
                    messages={messages} 
                    isTransitioning={false}
                    isTyping={isTyping}
                    isAnalyzing={isAnalyzing}
                    onSendMessage={handleSendMessage}
                  >
                    {pendingMatch && (
                      <SniperCard
                        company={pendingMatch.company}
                        title={pendingMatch.title}
                        matchScore={pendingMatch.matchScore}
                        reasoning={pendingMatch.reasoning}
                        onDeploy={handleSniperDeploy}
                        onSkip={handleSniperSkip}
                        onViewDetails={() => setSelectedPendingJob(pendingMatch)}
                      />
                    )}
                    {onboardingStage === 'chat' && quickActionMenu !== 'HIDDEN' && (
                      <QuickActions 
                        currentMenu={quickActionMenu} 
                        onSelect={handleQuickAction} 
                      />
                    )}
                  </MessageFeed>
                )}

                {/* Mobile bubble - only in collapsed mode */}
                {!isExpanded && pendingAppCount > 0 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 lg:hidden">
                    <JobHuntBubble
                      onClick={() => {
                        setIsExpanded(true);
                        setShowJobHuntPanel(true);
                      }}
                      count={pendingAppCount}
                    />
                  </div>
                )}

                <div className="pb-4 px-4">
                  <ChatInput 
                    inputEnabled={!isTyping && !isAnalyzing} 
                    onSendMessage={handleSendMessage} 
                    onFocus={() => {
                      setIsExpanded(true);
                      if (quickActionMenu !== 'HIDDEN') {
                        setQuickActionMenu('HIDDEN');
                      }
                    }} 
                    onFileUpload={handleFileUpload}
                    isDisabled={isAnalyzing}
                    disabledPlaceholder={isAnalyzing ? "Analyzing your resume…" : "Waiting for response..."}
                  />
                </div>
              </div>

              {/* Desktop side panel - only when expanded and visible */}
              {isExpanded && panelVisible && (
                <div className="relative flex h-full shrink-0" style={{ width: panelWidth }}>
                  <JobHuntPanel onClose={() => {
                    setPanelVisible(false);
                    localStorage.setItem('oitii_panel_visible', 'false');
                  }} />
                  {/* Resize handle */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400/30 transition-colors z-10"
                    onMouseDown={(e) => {
                      isResizingRef.current = true;
                      startXRef.current = e.clientX;
                      startWidthRef.current = panelWidth;
                      document.body.style.cursor = 'col-resize';
                      document.body.style.userSelect = 'none';
                    }}
                  />
                </div>
              )}

              {/* Toggle button when panel is hidden */}
              {isExpanded && !panelVisible && (
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={() => {
                      setPanelVisible(true);
                      localStorage.setItem('oitii_panel_visible', 'true');
                    }}
                    className="flex items-center gap-1.5 bg-zinc-900 text-white text-[11px] font-semibold px-3 py-2 rounded-full shadow-lg hover:bg-zinc-800 transition-colors"
                    title="Show Job Hunt panel"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Job Hunt</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {/* Mobile JobHuntPanel Overlay */}
      <AnimatePresence>
        {showJobHuntPanel && (
          <motion.div
            className="fixed inset-0 z-60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowJobHuntPanel(false)}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-95 bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <JobHuntPanel
                isOverlay
                onClose={() => setShowJobHuntPanel(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <JobDetailsModal
        isOpen={!!selectedPendingJob}
        job={selectedPendingJob}
        onClose={() => setSelectedPendingJob(null)}
        onDeploy={handleSniperDeploy}
      />
    </>
  );
}
