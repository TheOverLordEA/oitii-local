"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, QuickActionMenu } from "../../store/useChatStore";
import { ChatHeader } from "./ChatHeader";
import { MessageFeed } from "./MessageFeed";
import { QuickActions } from "./QuickActions";
import { getPendingApplicationsCount } from "@/actions/applications";
import { getCuratedJobs } from "@/actions/jobs";

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
    quickActionMenu,
    hasGreetedThisSession,
    activeTask,
    completeOnboarding, 
    addMessage, 
    clearChat, 
    setIsTyping,
    setQuickActionMenu,
    setHasGreetedThisSession,
    setActiveTask
  } = useChatStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isInitialMount = useRef(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Fix hydration mismatch for persisted Zustand state
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Dynamic session greetings logic
  useEffect(() => {
    if (!hasHydrated || hasGreetedThisSession) return;

    if (messages.length === 0) {
      addMessage({ 
        id: "fresh-greeting", 
        type: "bot", 
        text: "👋 Welcome! Let's get you hired. What kind of work are you looking for right now?" 
      });
    }

    setHasGreetedThisSession(true);
    setQuickActionMenu('MAIN');
  }, [hasHydrated, hasGreetedThisSession, messages.length, addMessage, setHasGreetedThisSession, setQuickActionMenu]);

  // Apply blur/fade out during size transition
  useEffect(() => {
    if (!hasHydrated) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Matches the 0.5s transition duration
    return () => clearTimeout(timer);
  }, [isExpanded, hasHydrated]);

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
            botResponse = `Let me pull up your dashboard. You have ${count} applications pending review. What would you like to do?`;
            nextMenu = 'STATUS_SUBMENU';
          } else {
            botResponse = "Your dashboard is currently empty. Let's get your resume out there and start landing some interviews!";
            nextMenu = 'EMPTY_STATUS_MENU';
          }
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
            botResponse = "I found these verified, scam-free listings for you:\n\n" + 
              jobs.map((job, i) => `${i + 1}. **${job.title}** at ${job.company}\n\n[View Role](${job.url})`).join('\n\n');
          }
          nextMenu = 'HIDDEN';
          break;
        }
        case 'MSG_EMPLOYER':
          botResponse = "Opening our secure messaging portal... I've drafted a follow-up for you. Shall I send it?";
          nextMenu = 'HIDDEN';
          break;
        case 'WITHDRAW_APP':
          botResponse = "Are you sure you want to withdraw? I can help you find alternatives if the role isn't a fit.";
          nextMenu = 'HIDDEN';
          break;
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

      const data = await response.json();
      const botResponseText = data.text || "I'm sorry, I couldn't process that.";
      
      addMessage({
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: botResponseText,
      });
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
    // 1. Immediate UI update
    addMessage({ id: Date.now().toString(), type: "user", text: `📎 ${file.name}` });
    setIsTyping(true);

    try {
      // 2. Real API Call
      const formData = new FormData();
      formData.append("file", file); // Must match 'file' key in the API route
      
      const response = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const result = await response.json();
      
      // 3. Bot Success Response
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: result.message || `Got it! I've saved "${file.name}" to your profile. I've finished parsing the text for our AI—ready to start finding jobs?`
      });
    } catch (error) {
      console.error("Upload error:", error);
      // 4. Error Handling
      addMessage({ 
        id: Date.now().toString(), 
        type: "bot", 
        text: "I'm sorry, I had trouble saving your resume. Could you try uploading it again?" 
      });
    } finally {
      setIsTyping(false);
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

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <>
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
          <motion.section 
            layout
            transition={{ 
              type: "spring", 
              bounce: 0, 
              duration: 0.5,
              layout: { duration: 0.5, ease: "easeInOut" }
            }}
            aria-label="Oitii Job Assistant"
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col pointer-events-auto origin-bottom ${
              isExpanded ? "w-full max-w-3xl h-[600px] absolute" : "w-full h-full relative"
            }`}
          >
            {isExpanded && (
              <div className="w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse h-[2px]"></div>
            )}
            
            {/* Inner Content wrapper */}
            <motion.div 
              layout="position"
              className={`flex flex-col h-full w-full ${isTransitioning ? "pointer-events-none" : ""}`}
            >
              <ChatHeader 
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                showOptionsMenu={showOptionsMenu}
                setShowOptionsMenu={setShowOptionsMenu}
                handleNewChat={handleNewChat}
              />

              <MessageFeed 
                messages={messages} 
                isTransitioning={isTransitioning}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
              >
                <QuickActions 
                  currentMenu={quickActionMenu} 
                  onSelect={handleQuickAction} 
                />
              </MessageFeed>

              <ChatInput 
                inputEnabled={!isTyping} 
                onSendMessage={handleSendMessage} 
                onFocus={() => setIsExpanded(true)} 
                onFileUpload={handleFileUpload}
                isDisabled={quickActionMenu !== 'HIDDEN'}
                disabledPlaceholder={quickActionMenu !== 'HIDDEN' ? "Please select an option above..." : "Waiting for response..."}
              />
            </motion.div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
