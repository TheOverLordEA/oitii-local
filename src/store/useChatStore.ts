import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Message = {
  id: string;
  type: "bot" | "user";
  text: string;
};

export type OnboardingStatus = 'PENDING' | 'INDUSTRY' | 'ANY';

export type QuickActionMenu = 'MAIN' | 'STATUS_SUBMENU' | 'RESUME_ROOT_MENU' | 'RESUME_TWEAK_MENU' | 'CREATE_RESUME_MENU' | 'EMPTY_STATUS_MENU' | 'HIDDEN';

export interface ChatState {
  messages: Message[];
  onboardingStatus: OnboardingStatus;
  isTyping: boolean;
  quickActionMenu: QuickActionMenu;
  hasGreetedThisSession: boolean;
  activeTask: string | null;
  addMessage: (message: Message) => void;
  completeOnboarding: (status: OnboardingStatus) => void;
  clearChat: () => void;
  setIsTyping: (isTyping: boolean) => void;
  setQuickActionMenu: (menu: QuickActionMenu) => void;
  setHasGreetedThisSession: (greeted: boolean) => void;
  setActiveTask: (task: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [], 
      onboardingStatus: 'PENDING',
      isTyping: false,
      quickActionMenu: 'HIDDEN',
      hasGreetedThisSession: false,
      activeTask: null,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
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
      setQuickActionMenu: (menu) => set(() => ({ quickActionMenu: menu })),
      setHasGreetedThisSession: (greeted) => set(() => ({ hasGreetedThisSession: greeted })),
      setActiveTask: (task) => set(() => ({ activeTask: task })),
    }),
    {
      name: 'oitii-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Exclude hasGreetedThisSession from persistence to prevent greeting spam on reload
        const { hasGreetedThisSession, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);
