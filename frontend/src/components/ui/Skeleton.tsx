import React from 'react';

// Base shimmer block. Compose these for page-specific skeletons.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#EAE7E4] ${className}`} />;
}

// Mirrors StatCard's layout (label, value, icon box).
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Mirrors a PostCard tile (header, content lines, media, metrics).
export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#EAE7E4] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// A single table row of shimmer cells; pass the column count.
export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-[#EAE7E4]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}
