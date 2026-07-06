export type TeamRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type TeamMemberStatus = 'PENDING' | 'ACTIVE';

export interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  createdAt: string;
}
