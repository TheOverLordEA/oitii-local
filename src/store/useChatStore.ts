import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ToolInvocation = {
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  result?: unknown;
};

export type Message = {
  id: string;
  type: "bot" | "user";
  text: string;
  toolInvocations?: ToolInvocation[];
};

export type OnboardingStatus = 'PENDING' | 'INDUSTRY' | 'ANY';

export type QuickActionMenu = 'MAIN' | 'STATUS_SUBMENU' | 'RESUME_ROOT_MENU' | 'RESUME_TWEAK_MENU' | 'CREATE_RESUME_MENU' | 'EMPTY_STATUS_MENU' | 'HIDDEN';

export interface ChatState {
  messages: Message[];
  onboardingStatus: OnboardingStatus;
  isTyping: boolean;
  isAnalyzing: boolean;
  quickActionMenu: QuickActionMenu;
  hasGreetedThisSession: boolean;
  activeTask: string | null;
  isWidgetExpanded: boolean;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  completeOnboarding: (status: OnboardingStatus) => void;
  clearChat: () => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setQuickActionMenu: (menu: QuickActionMenu) => void;
  setHasGreetedThisSession: (greeted: boolean) => void;
  setActiveTask: (task: string | null) => void;
  setIsWidgetExpanded: (expanded: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [], 
      onboardingStatus: 'PENDING',
      isTyping: false,
      isAnalyzing: false,
      quickActionMenu: 'HIDDEN',
      hasGreetedThisSession: false,
      activeTask: null,
      isWidgetExpanded: false,
      addMessage: (message) =>
        set((state) => {
          if (state.messages.some((m) => m.id === message.id)) return state;
          return { messages: [...state.messages, message] };
        }),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      completeOnboarding: (status) =>
        set(() => ({ onboardingStatus: status })),
      clearChat: () =>
        set(() => ({ 
          messages: [], 
          onboardingStatus: 'PENDING',
          quickActionMenu: 'MAIN',
          activeTask: null,
        })),
      setIsTyping: (isTyping) => set(() => ({ isTyping })),
      setIsAnalyzing: (analyzing) => set(() => ({ isAnalyzing: analyzing })),
      setQuickActionMenu: (menu) => set(() => ({ quickActionMenu: menu })),
      setHasGreetedThisSession: (greeted) => set(() => ({ hasGreetedThisSession: greeted })),
      setActiveTask: (task) => set(() => ({ activeTask: task })),
      setIsWidgetExpanded: (expanded) => set(() => ({ isWidgetExpanded: expanded })),
    }),
    {
      name: 'oitii-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Exclude transient UI state from persistence
        const { hasGreetedThisSession, isWidgetExpanded, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);
