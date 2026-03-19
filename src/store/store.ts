import { create } from 'zustand';

export type AppState = 'INITIALIZING' | 'AWAITING_DOCS' | 'PARSER_FALLBACK' | 'READY';

export interface Resume {
  id: string;
  fileName: string;
  roleTag: string;
  availableForAiEdits: boolean;
  parsedData: Record<string, string> | null;
}

export interface User {
  email: string | null;
}

export interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface AppStoreState {
  resumes: Resume[];
  user: User | null;
  chatHistory: Message[];
  currentAppState: AppState;

  // Actions
  initializeSession: (userData: User | null, existingResumes: Resume[], history: Message[]) => void;
  processUploadedResume: (file: File) => Promise<void>;
  updateParsedData: (resumeId: string, missingFields: Record<string, string>) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  resumes: [],
  user: null,
  chatHistory: [],
  currentAppState: 'INITIALIZING',

  initializeSession: (userData, existingResumes, history) => {
    const hasEmail = userData?.email != null && userData.email.trim() !== '';
    const hasResumes = existingResumes.length > 0;
    const hasHistory = history.length > 0;

    // Check if returning user has necessary docs (email, resume) and history
    if (hasEmail && hasResumes && hasHistory) {
      set({
        user: userData,
        resumes: existingResumes,
        chatHistory: history,
        currentAppState: 'READY',
      });
    } else {
      set({
        user: userData,
        resumes: existingResumes,
        chatHistory: history,
        currentAppState: 'AWAITING_DOCS',
      });
    }
  },

  processUploadedResume: async (file) => {
    // 1. Enforce naming convention: [Role]_[Date]_resume
    // For this demonstration, we parse the roleTag from the file name. 
    // Fallback to "Unknown" if it doesn't match the convention perfectly.
    const nameParts = file.name.split('_');
    const roleTag = nameParts.length > 0 ? nameParts[0] : 'Unknown';

    // 2. Simulate Parser extracting key fields
    // Here we use a fake promise to represent the parsing process
    const isMockParserSuccess = await new Promise<boolean>((resolve) => {
      // Mock failure condition: e.g., if a file is extremely small or specific type
      setTimeout(() => {
        resolve(file.size > 1024); // simplistic mock condition for success
      }, 500);
    });

    const newResume: Resume = {
      // In a real app, use crypto.randomUUID() or let the DB assign an ID
      id: Math.random().toString(36).substring(2, 9), 
      fileName: file.name,
      roleTag,
      availableForAiEdits: true, // required by schema
      parsedData: isMockParserSuccess 
        ? { name: "Mock Name", email: "mock@example.com", skills: "TypeScript, React" } 
        : null // Parser fallback triggered if null
    };

    set((state) => {
      const updatedResumes = [...state.resumes, newResume];
      
      // Determine next state
      const nextState = isMockParserSuccess ? 'READY' : 'PARSER_FALLBACK';
      
      return {
        resumes: updatedResumes,
        currentAppState: nextState,
      };
    });
  },

  updateParsedData: (resumeId, missingFields) => {
    set((state) => {
      const updatedResumes = state.resumes.map((resume) => {
        if (resume.id === resumeId) {
          return {
            ...resume,
            parsedData: {
              ...(resume.parsedData || {}),
              ...missingFields,
            },
          };
        }
        return resume;
      });

      return {
        resumes: updatedResumes,
        // Once manual data entry updates the missing fields, fallback resolves to READY
        currentAppState: 'READY', 
      };
    });
  },
}));
