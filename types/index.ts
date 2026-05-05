export interface TeamMember {
  name: string;
  email: string;
  phone?: string;
  role: 'leader' | 'member';
}

export interface Team {
  id: string;
  teamName: string;
  collegeName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: TeamMember[];
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'rejected';
  submissionStatus: 'not_submitted' | 'submitted';
  zipUrl?: string;
  pdfUrl?: string;
  videoLink?: string;
  submittedAt?: string;
  registeredAt: string;
  scores?: TeamScores;
  rank?: 1 | 2 | 3;
}

export interface TeamScores {
  innovation: number;
  relevance: number;
  technical: number;
  uiux: number;
  total: number;
}

export interface HackathonSettings {
  problemRevealEnabled: boolean;
  problemRevealDate: string;
  problemStatement: string;
  registrationDeadline: string;
  submissionDeadline: string;
  hackathonDate: string;
  registrationFee: number;
}

export interface User {
  id: string;
  email: string;
  teamId?: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  team: Team | null;
  isLoading: boolean;
}

export interface Submission {
  teamId: string;
  teamName: string;
  zipUrl?: string;
  pdfUrl?: string;
  videoLink?: string;
  submittedAt: string;
}
