'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus, X, Trash2, Loader2, AlertCircle, Link2 } from 'lucide-react';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { Platform } from '@/types/post';
import { api } from '@/lib/api';
import { useAccounts } from '@/hooks/useAccounts';

const PLATFORMS: Platform[] = ['TWITTER', 'INSTAGRAM', 'LINKEDIN', 'FACEBOOK'];

const PlatformBadge = ({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) => (
  <div
    className={`${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-base'} rounded-lg flex items-center justify-center text-white font-bold shrink-0`}
    style={{ backgroundColor: PLATFORM_COLORS[platform] }}
  >
    {PLATFORM_LABELS[platform].charAt(0)}
  </div>
);

const AccountsPage = () => {
  const { getToken } = useAuth();
  const { accounts, isLoading, error, refetch } = useAccounts();

  const [actionError, setActionError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Connect modal (manual add — real OAuth lands in Sprint 3).
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openConnect = (platform: Platform) => {
    setConnectPlatform(platform);
    setUsername('');
    setDisplayName('');
    setAccessToken('');
    setModalError(null);
  };

  const closeConnect = () => setConnectPlatform(null);

  const handleConnect = async () => {
    if (!connectPlatform) return;
    setModalError(null);
    try {
      setSubmitting(true);
      const token = await getToken();
      await api.connectAccount(
        {
          platform: connectPlatform,
          username: username.trim(),
          displayName: displayName.trim() || undefined,
          accessToken: accessToken.trim(),
        },
        token,
      );
      closeConnect();
      await refetch();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to connect account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!window.confirm('Disconnect this account? Scheduled posts targeting it may fail.')) return;
    setActionError(null);
    setDisconnectingId(id);
    try {
      const token = await getToken();
      await api.deleteAccount(id, token);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to disconnect account');
    } finally {
      setDisconnectingId(null);
    }
  };

  const canSubmit = !!username.trim() && !!accessToken.trim() && !submitting;

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

      {/* Action error */}
      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Connected Accounts */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        <h2 className="text-lg font-bold text-[#181817] mb-1">Connected Accounts</h2>
        <p className="text-[#4D4946] text-sm mb-5">Accounts available when creating a post</p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[#4D4946] text-sm py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading accounts...
          </div>
        ) : error ? (
          <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </span>
            <button onClick={() => refetch()} className="font-semibold underline">
              Retry
            </button>
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

      {/* Add an account */}
      <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
        <h2 className="text-lg font-bold text-[#181817] mb-1">Add an account</h2>
        <p className="text-[#4D4946] text-sm mb-5">
          Manual connect for now — full OAuth sign-in arrives in a later release
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
                onClick={() => openConnect(platform)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white text-sm font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all"
              >
                <Plus className="w-4 h-4" />
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Modal */}
      {connectPlatform && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={closeConnect}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#EAE7E4]">
              <div className="flex items-center gap-3">
                <PlatformBadge platform={connectPlatform} size="sm" />
                <h3 className="text-lg font-bold text-[#181817]">
                  Connect {PLATFORM_LABELS[connectPlatform]}
                </h3>
              </div>
              <button onClick={closeConnect} className="p-2 hover:bg-[#F3EFEC] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#4D4946]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#181817] font-semibold text-sm mb-1.5">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="handle without the @"
                  className="w-full px-4 py-2.5 border-2 border-[#EAE7E4] rounded-xl text-[#181817] focus:outline-none focus:border-[#FF9B4F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#181817] font-semibold text-sm mb-1.5">
                  Display name <span className="text-[#4D4946]/50 font-normal">(optional)</span>
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Account display name"
                  className="w-full px-4 py-2.5 border-2 border-[#EAE7E4] rounded-xl text-[#181817] focus:outline-none focus:border-[#FF9B4F] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#181817] font-semibold text-sm mb-1.5">Access token</label>
                <input
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="placeholder token (OAuth replaces this)"
                  className="w-full px-4 py-2.5 border-2 border-[#EAE7E4] rounded-xl text-[#181817] focus:outline-none focus:border-[#FF9B4F] transition-colors"
                />
              </div>

              {modalError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {modalError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#EAE7E4] bg-[#F3EFEC]/30">
              <button
                onClick={closeConnect}
                className="px-5 py-2.5 text-[#4D4946] font-medium hover:bg-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-[0_6px_20px_rgba(255,155,79,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {submitting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
