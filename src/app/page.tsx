import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-zinc-50 text-zinc-900 selection:bg-zinc-200">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-24">
        {/* Hero Section */}
        <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.1]">
              Find work that <br className="hidden lg:block" />
              <span className="text-zinc-500">works for you.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to Oitii. We connect you with verified jobs and immediate openings in your area. Chat with our intelligent agent to get started seamlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <div className="px-4 py-2 bg-white rounded-full border border-zinc-200 shadow-sm text-sm font-medium text-zinc-700 flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Engine Online
            </div>
            <div className="px-4 py-2 bg-zinc-100 rounded-full text-sm font-medium text-zinc-600">
              OpenClaw Active
            </div>
          </div>
        </div>

        {/* Chat Widget Section */}
        <div className="flex-1 w-full max-w-md flex justify-center animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
          <ChatWidget />
        </div>
      </div>
    </main>
  );
}