'use client';
import { create } from 'zustand';

interface User { id: string; email: string; teamId?: string; isAdmin: boolean; }
interface Team { id: string; teamName: string; paymentStatus: string; submissionStatus: string; leaderEmail: string; }

interface AuthStore {
  user: User | null;
  team: Team | null;
  isLoading: boolean;
  setUser: (u: User | null) => void;
  setTeam: (t: Team | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, team: null, isLoading: true,
  setUser: (user) => set({ user }),
  setTeam: (team) => set({ team }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, team: null });
    window.location.href = '/';
  },
}));
