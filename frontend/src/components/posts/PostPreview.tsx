'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Send, ThumbsUp, Bookmark, MoreHorizontal, Globe } from 'lucide-react';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { getCharacterLimit } from '@/lib/utils';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { Platform } from '@/types/post';

interface PostPreviewProps {
  platform: Platform;
  content: string;
  images?: string[];
  authorName?: string;
  authorHandle?: string;
  avatarUrl?: string | null;
}

// How much caption is shown before a "…more" fold, per platform (Twitter shows
// all within its hard 280 limit).
const VISIBLE_LIMIT: Partial<Record<Platform, number>> = {
  LINKEDIN: 210,
  FACEBOOK: 250,
  INSTAGRAM: 125,
};

function Avatar({
  platform,
  authorName,
  avatarUrl,
  size = 'md',
}: {
  platform: Platform;
  authorName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={authorName} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
    >
      {authorName.slice(0, 1).toUpperCase()}
    </div>
  );
}

// Renders the caption with a platform-appropriate "…more" fold and an
// over-limit warning.
function Caption({ platform, content }: { platform: Platform; content: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = getCharacterLimit(platform);
  const over = content.length - limit;
  const fold = VISIBLE_LIMIT[platform];
  const folded = !expanded && fold !== undefined && content.length > fold;
  const shown = folded ? content.slice(0, fold).trimEnd() : content;

  return (
    <div>
      <p className="text-[#181817] text-sm whitespace-pre-wrap break-words">
        {shown}
        {folded && (
          <>
            …{' '}
            <button
              onClick={() => setExpanded(true)}
              className="text-[#4D4946]/60 hover:underline"
            >
              more
            </button>
          </>
        )}
      </p>
      {over > 0 && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {over} character{over === 1 ? '' : 's'} over the {PLATFORM_LABELS[platform]} limit
        </p>
      )}
    </div>
  );
}

// Platform-appropriate media treatment: Instagram is a square hero; others use a
// rounded single image or a 2-up grid.
function Media({ platform, images }: { platform: Platform; images: string[] }) {
  if (images.length === 0) return null;

  if (platform === 'INSTAGRAM') {
    return (
      <div className="relative w-full aspect-square bg-[#F3EFEC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
        {images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            1/{images.length}
          </span>
        )}
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-video bg-[#F3EFEC] rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
      {images.slice(0, 4).map((src, i) => (
        <div key={i} className="relative aspect-square bg-[#F3EFEC]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
              +{images.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const Action = ({ icon: Icon, label }: { icon: typeof Heart; label?: string }) => (
  <span className="flex items-center gap-1.5 text-[#4D4946]/60 text-xs">
    <Icon className="w-4 h-4" />
    {label}
  </span>
);

// Renders a faithful-enough preview of how a post appears on a given platform.
export function PostPreview({
  platform,
  content,
  images = [],
  authorName,
  authorHandle,
  avatarUrl,
}: PostPreviewProps) {
  const name = authorName || 'Your Name';
  const handle = authorHandle || 'yourhandle';

  // Instagram leads with the image; the rest lead with the author + text.
  if (platform === 'INSTAGRAM') {
    return (
      <div className="bg-white rounded-xl border border-[#EAE7E4] overflow-hidden">
        <div className="flex items-center gap-2 p-3">
          <Avatar platform={platform} authorName={name} avatarUrl={avatarUrl} size="sm" />
          <span className="text-[#181817] text-sm font-semibold">{handle}</span>
          <MoreHorizontal className="w-4 h-4 text-[#4D4946]/50 ml-auto" />
        </div>
        <Media platform={platform} images={images} />
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 text-[#4D4946]/70" />
            <MessageCircle className="w-5 h-5 text-[#4D4946]/70" />
            <Send className="w-5 h-5 text-[#4D4946]/70" />
            <Bookmark className="w-5 h-5 text-[#4D4946]/70 ml-auto" />
          </div>
          <p className="text-[#181817] text-sm">
            <span className="font-semibold mr-1">{handle}</span>
          </p>
          <Caption platform={platform} content={content} />
          {images.length === 0 && (
            <p className="text-xs text-amber-600">Instagram requires at least one image.</p>
          )}
        </div>
      </div>
    );
  }

  const subtitle =
    platform === 'TWITTER'
      ? `@${handle}`
      : platform === 'LINKEDIN'
        ? 'Your headline · 1st'
        : 'Just now · Public';

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-4">
      <div className="flex items-start gap-3">
        <Avatar platform={platform} authorName={name} avatarUrl={avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[#181817] text-sm font-semibold truncate">{name}</span>
            {platform === 'TWITTER' && (
              <span className="text-[#4D4946]/60 text-sm truncate">{subtitle}</span>
            )}
          </div>
          {platform !== 'TWITTER' && (
            <p className="text-[#4D4946]/60 text-xs flex items-center gap-1">
              {subtitle}
              {platform === 'FACEBOOK' && <Globe className="w-3 h-3" />}
            </p>
          )}
        </div>
        <MoreHorizontal className="w-4 h-4 text-[#4D4946]/50 shrink-0" />
      </div>

      <div className="mt-3 space-y-3">
        <Caption platform={platform} content={content} />
        <Media platform={platform} images={images} />
      </div>

      <div className="mt-3 pt-3 border-t border-[#EAE7E4] flex items-center justify-between">
        {platform === 'TWITTER' ? (
          <>
            <Action icon={MessageCircle} />
            <Action icon={Repeat2} />
            <Action icon={Heart} />
            <Action icon={Send} />
          </>
        ) : (
          <>
            <Action icon={ThumbsUp} label="Like" />
            <Action icon={MessageCircle} label="Comment" />
            <Action icon={Send} label="Share" />
          </>
        )}
      </div>
    </div>
  );
}

export default PostPreview;
