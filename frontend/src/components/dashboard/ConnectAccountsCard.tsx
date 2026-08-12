'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2, Plus, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  ALL_PLATFORMS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  platformUnavailableReason,
} from '@/lib/constants';
import { Platform } from '@/types/post';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

interface ConnectAccountsCardProps {
  availablePlatforms: Platform[];
}

const ConnectAccountsCard = ({ availablePlatforms }: ConnectAccountsCardProps) => {
  const { getToken } = useAuth();
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const available = new Set(availablePlatforms);

  const handleConnect = async (platform: Platform) => {
    setConnectingPlatform(platform);
    try {
      const token = await getToken();
      const { url } = await api.getOAuthUrl(platform, token);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start connection');
      setConnectingPlatform(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B4F]/15 to-[#FF6E00]/15 flex items-center justify-center shrink-0">
          <Link2 className="w-6 h-6 text-[#FF6E00]" />
        </div>
        <div>
          <h2 className="text-[#181817] text-lg font-bold mb-1">Connect a social account</h2>
          <p className="text-[#4D4946] text-sm">
            PostPilot publishes to the accounts you connect. Start with X or LinkedIn — Instagram
            and Facebook will be available after Meta business verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ALL_PLATFORMS.map((platform) => {
          const canConnect = available.has(platform);
          return (
            <div
              key={platform}
              className="flex flex-col items-center gap-3 p-5 border-2 border-[#EAE7E4] rounded-xl"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: PLATFORM_COLORS[platform] }}
              >
                <PlatformIcon platform={platform} className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#181817]">{PLATFORM_LABELS[platform]}</span>
              {canConnect ? (
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
              ) : (
                <p className="text-[#4D4946]/70 text-xs text-center leading-snug">
                  {platformUnavailableReason(platform)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectAccountsCard;
