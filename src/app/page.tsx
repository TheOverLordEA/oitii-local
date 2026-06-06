import { ChatWidget } from "@/components/chat/ChatWidget";
import { AnimatedHeadline } from "@/components/AnimatedHeadline";
import { HeroBackground } from "@/components/HeroBackground";
import { isAiConnected } from "@/lib/aiStatus";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const connected = isAiConnected();
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-24 text-zinc-900 selection:bg-zinc-200">
      <HeroBackground connected={connected} />
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16">
        {/* Hero Section */}
        <div className="flex-1 min-w-0 text-center lg:text-left space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-zinc-200 shadow-sm text-xs font-medium text-zinc-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Beta · AI Career Agent</span>
          </div>

          <AnimatedHeadline />

          <p style={{ fontFamily: 'var(--font-inter)' }} className="text-base md:text-lg text-zinc-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Your AI career agent. Searches, filters, and applies — all from a single chat.
          </p>


          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2 text-xs font-medium text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified jobs
            </span>
            <span className="text-zinc-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Auto-apply
            </span>
            <span className="text-zinc-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Trusted sources
            </span>
          </div>
        </div>

        {/* Chat Widget Section - fixed basis so animated headline can't squeeze it */}
        <div className="w-full max-w-md shrink-0 lg:basis-[28rem] flex justify-center animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
          <ChatWidget />
        </div>
      </div>
    </main>
  );
}