import { supabase, isSupabaseConfigured } from './supabase';
import type { Team, HackathonSettings } from '@/types';

// Fallback in-memory store when Supabase is not configured
let memoryTeams: Team[] = [];
let memoryUsers: Array<{ id: string; email: string; password: string; isAdmin: boolean; teamId?: string; googleId?: string }> = [
  {
    id: 'admin-001',
    email: 'admin@midnightpizza.com',
    password: '$2b$10$rQnJ8Y7Y1j1Y1Y1Y1Y1Y1e',
    isAdmin: true,
    teamId: undefined,
  }
];

let memorySettings: HackathonSettings = {
  problemRevealEnabled: false,
  problemRevealDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  problemStatement: `Between 12 AM and 4 AM, the world behaves differently. Build a solution that improves life during late-night hours. Your solution must include at least one feature designed specifically for midnight behavior — whether that's for night-shift workers, insomniacs, late-night coders, or anyone navigating the world while everyone else sleeps.

Think about: late-night food delivery UX, safety for solo travelers at night, productivity for night owls, mental wellness at 3 AM, or anything else that makes midnight feel less lonely.

Constraints:
- Must have a working prototype/demo
- At least one AI/ML component
- Must address a real midnight-hour pain point
- Open source preferred`,
  registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  registrationFee: 200,
  resultsRevealEnabled: false,
};

const useSupabase = () => isSupabaseConfigured();

// Database operations - uses Supabase when configured, falls back to memory
export const db = {
  // ============ TEAMS ============
  async addTeam(team: Team) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      memoryTeams.push(team);
      return team;
    }
  },

  async getTeamById(id: string) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      return memoryTeams.find(t => t.id === id) || null;
    }
  },

  async getTeamByEmail(email: string) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('leaderEmail', email.toLowerCase())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      return memoryTeams.find(t => t.leaderEmail === email.toLowerCase()) || null;
    }
  },

  async updateTeam(id: string, updates: Partial<Team>) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } else {
      const idx = memoryTeams.findIndex(t => t.id === id);
      if (idx !== -1) {
        memoryTeams[idx] = { ...memoryTeams[idx], ...updates };
        return memoryTeams[idx];
      }
      return null;
    }
  },

  async deleteTeam(id: string) {
    if (useSupabase()) {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const idx = memoryTeams.findIndex(t => t.id === id);
      if (idx !== -1) {
        memoryTeams.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  async getAllTeams() {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('registeredAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return [...memoryTeams];
    }
  },

  // ============ USERS ============
  async getUserByEmail(email: string) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } else {
      return memoryUsers.find(u => u.email === email.toLowerCase()) || null;
    }
  },

  async addUser(user: { id: string; email: string; password: string; isAdmin: boolean; teamId?: string; googleId?: string }) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...user,
          email: user.email.toLowerCase(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      memoryUsers.push({ ...user, email: user.email.toLowerCase() });
      return user;
    }
  },

  // ============ SETTINGS ============
  async getSettings() {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || memorySettings;
    } else {
      return memorySettings;
    }
  },

  async updateSettings(updates: Partial<HackathonSettings>) {
    const validKeys: Array<keyof HackathonSettings> = [
      'problemRevealEnabled',
      'problemRevealDate',
      'problemStatement',
      'registrationDeadline',
      'submissionDeadline',
      'registrationFee',
      'resultsRevealEnabled',
    ];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => validKeys.includes(key as keyof HackathonSettings)),
    );

    if (useSupabase()) {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ id: 'main', ...filteredUpdates })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      memorySettings = { ...memorySettings, ...filteredUpdates };
      return memorySettings;
    }
  },
};

// Seed demo teams for admin view (only in memory mode)
memoryTeams.push({
  id: 'team-demo-001',
  teamName: 'Null Pointers',
  collegeName: 'Model Engineering College',
  leaderName: 'Appu Kumar',
  leaderEmail: 'appu@mec.ac.in',
  leaderPhone: '9876543210',
  members: [
    { name: 'Appu Kumar', email: 'appu@mec.ac.in', phone: '9876543210', role: 'leader' },
    { name: 'Priya S', email: 'priya@mec.ac.in', role: 'member' },
    { name: 'Rahul Nair', email: 'rahul@mec.ac.in', role: 'member' },
  ],
  paymentStatus: 'paid',
  submissionStatus: 'submitted',
  zipUrl: 'https://example.com/null-pointers.zip',
  pdfUrl: 'https://example.com/null-pointers.pdf',
  videoLink: 'https://youtube.com/watch?v=demo',
  submittedAt: new Date(Date.now() - 3600000).toISOString(),
  registeredAt: new Date(Date.now() - 86400000).toISOString(),
  scores: { innovation: 9, relevance: 8, technical: 9, uiux: 8, total: 34 },
});

memoryTeams.push({
  id: 'team-demo-002',
  teamName: 'Midnight Owls',
  collegeName: 'NIT Calicut',
  leaderName: 'Sreelakshmi V',
  leaderEmail: 'sree@nitc.ac.in',
  leaderPhone: '9123456789',
  members: [
    { name: 'Sreelakshmi V', email: 'sree@nitc.ac.in', role: 'leader' },
    { name: 'Aditya R', email: 'aditya@nitc.ac.in', role: 'member' },
  ],
  paymentStatus: 'paid',
  submissionStatus: 'not_submitted',
  registeredAt: new Date(Date.now() - 43200000).toISOString(),
});

memoryTeams.push({
  id: 'team-demo-003',
  teamName: 'Bug Hunters',
  collegeName: 'CUSAT',
  leaderName: 'Vishnu M',
  leaderEmail: 'vishnu@cusat.ac.in',
  leaderPhone: '9988776655',
  members: [
    { name: 'Vishnu M', email: 'vishnu@cusat.ac.in', role: 'leader' },
    { name: 'Anjali T', email: 'anjali@cusat.ac.in', role: 'member' },
    { name: 'Kiran J', email: 'kiran@cusat.ac.in', role: 'member' },
    { name: 'Meera P', email: 'meera@cusat.ac.in', role: 'member' },
  ],
  paymentStatus: 'pending',
  submissionStatus: 'not_submitted',
  registeredAt: new Date(Date.now() - 7200000).toISOString(),
});
