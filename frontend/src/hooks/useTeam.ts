'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import type { TeamMember } from '@/types/team';

export interface UseTeamResult {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Failed to load team';
}

/** Fetches the current user's team members. */
export function useTeam(): UseTeamResult {
  const { getToken } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.getTeam(token);
      setMembers(res.members);
    } catch (err) {
      setError(toMessage(err));
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return { members, isLoading, error, refetch: fetchTeam };
}

export default useTeam;
