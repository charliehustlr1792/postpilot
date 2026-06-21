'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import type { SocialAccount } from '@/types/post';

export interface UseAccountsResult {
  accounts: SocialAccount[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Failed to load accounts';
}

/** Fetches the current user's connected social accounts. */
export function useAccounts(): UseAccountsResult {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.getAccounts(token);
      setAccounts(res.accounts);
    } catch (err) {
      setError(toMessage(err));
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoading, error, refetch: fetchAccounts };
}

export default useAccounts;
