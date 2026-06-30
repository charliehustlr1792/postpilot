'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus, Trash2, Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { Platform } from '@/types/post';
import { api } from '@/lib/api';
import { useAccounts } from '@/hooks/useAccounts';
import { ErrorState } from '@/components/ui/ErrorState';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

const PLATFORMS: Platform[] = ['TWITTER', 'INSTAGRAM', 'LINKEDIN', 'FACEBOOK'];

// Human-readable copy for the failure reasons the callback can hand back.
const CONNECT_ERROR_REASONS: Record<string, string> = {
  invalid_state: 'the request expired or was tampered with — please try again',
  exchange_failed: "we couldn't complete the sign-in with the provider",
  user_not_found: 'your account could not be found',
  access_denied: 'the request was denied on the provider',
};

const PlatformBadge = ({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) => (
  <div
    className={`${size === 'sm' ? 'w-8 h-8' : 'w-11 h-11'} rounded-lg flex items-center justify-center text-white shrink-0`}
    style={{ backgroundColor: PLATFORM_COLORS[platform] }}
  >
    <PlatformIcon platform={platform} className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
  </div>
);

const AccountsPage = () => {
  const { getToken } = useAuth();
  const { accounts, isLoading, error, refetch } = useAccounts();

  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);

  // Surface the result of the OAuth round-trip (we land back here with a
  // ?connected=success|error query param), then strip it from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    if (!connected) return;

    if (connected === 'success') {
      const platform = params.get('platform');
      const label = platform
        ? PLATFORM_LABELS[platform.toUpperCase() as Platform] ?? 'Account'
        : 'Account';
      toast.success(`${label} connected`);
      refetch();
    } else {
      const reason = params.get('reason');
      const detail = reason ? CONNECT_ERROR_REASONS[reason] ?? reason : '';
      toast.error(detail ? `Couldn't connect account: ${detail}` : "Couldn't connect account");
    }

    window.history.replaceState({}, '', '/accounts');
    // Run once on mount; refetch is stable enough for this read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async (platform: Platform) => {
    setConnectingPlatform(platform);
    try {
      const token = await getToken();
      const { url } = await api.getOAuthUrl(platform, token);
      // Hand off to the provider's consent screen.
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start connection');
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!window.confirm('Disconnect this account? Scheduled posts targeting it may fail.')) return;
    setDisconnectingId(id);
    try {
      const token = await getToken();
      await api.deleteAccount(id, token);
      await refetch();
      toast.success('Account disconnected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect account');
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181817]">Social Accounts</h1>
          <p className="text-[#4D4946] text-sm mt-1">
            Connect the accounts you want to publish to
          </p>
        </div>
      </div>

      {/* Connected Accounts */}
      {error ? (
        <ErrorState title="Couldn't load your accounts" message={error} onRetry={refetch} />
      ) : (
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        <h2 className="text-lg font-bold text-[#181817] mb-1">Connected Accounts</h2>
        <p className="text-[#4D4946] text-sm mb-5">Accounts available when creating a post</p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#4D4946] text-sm py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="border-2 border-dashed border-[#EAE7E4] rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-[#F3EFEC] rounded-full flex items-center justify-center mx-auto mb-3">
              <Link2 className="w-6 h-6 text-[#4D4946]/50" />
            </div>
            <p className="text-[#181817] font-semibold text-sm mb-1">No accounts connected yet</p>
            <p className="text-[#4D4946]/70 text-sm">Connect one below to start scheduling posts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 p-4 border border-[#EAE7E4] rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PlatformBadge platform={account.platform} />
                  <div className="min-w-0">
                    <p className="text-[#181817] text-sm font-semibold truncate">
                      {account.displayName || `@${account.username}`}
                    </p>
                    <p className="text-[#4D4946]/70 text-xs truncate">
                      {PLATFORM_LABELS[account.platform]} · @{account.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(account.id)}
                  disabled={disconnectingId === account.id}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {disconnectingId === account.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Add an account */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        <h2 className="text-lg font-bold text-[#181817] mb-1">Add an account</h2>
        <p className="text-[#4D4946] text-sm mb-5">
          Sign in with the platform to authorize PostPilot to publish on your behalf
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform}
              className="flex flex-col items-center gap-3 p-5 border-2 border-[#EAE7E4] rounded-xl hover:border-[#FFD4B2] transition-colors"
            >
              <PlatformBadge platform={platform} />
              <span className="text-sm font-medium text-[#181817]">{PLATFORM_LABELS[platform]}</span>
              <button
                onClick={() => handleConnect(platform)}
                disabled={connectingPlatform !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connectingPlatform === platform ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
