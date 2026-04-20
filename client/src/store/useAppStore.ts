import { create } from 'zustand';
import type { RoadmapData } from '../types';

interface Session {
  username: string | null;
  // estados: 'unknown' mientras /api/me no responde, 'authed' si ok, 'anon' si no
  status: 'unknown' | 'authed' | 'anon';
}

interface UIStatus {
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface AppState {
  session: Session;
  setSession: (username: string) => void;
  setAnon: () => void;
  clearSession: () => void;

  questionnaireAnswers: Record<string, string | string[]>;
  setAnswer: (key: string, value: string | string[]) => void;
  resetAnswers: () => void;

  roadmapData: RoadmapData | null;
  setRoadmapData: (data: RoadmapData) => void;

  uiStatus: UIStatus;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  session: { username: null, status: 'unknown' },
  setSession: (username) => set({ session: { username, status: 'authed' } }),
  setAnon: () => set({ session: { username: null, status: 'anon' } }),
  clearSession: () => set({ session: { username: null, status: 'anon' } }),

  questionnaireAnswers: {},
  setAnswer: (key, value) =>
    set((state) => ({
      questionnaireAnswers: { ...state.questionnaireAnswers, [key]: value },
    })),
  resetAnswers: () => set({ questionnaireAnswers: {} }),

  roadmapData: null,
  setRoadmapData: (data) => set({ roadmapData: data }),

  uiStatus: { loading: false, error: null, success: null },
  setLoading: (loading) => set((state) => ({ uiStatus: { ...state.uiStatus, loading } })),
  setError: (error) => set((state) => ({ uiStatus: { ...state.uiStatus, error } })),
  setSuccess: (success) => set((state) => ({ uiStatus: { ...state.uiStatus, success } })),
}));
