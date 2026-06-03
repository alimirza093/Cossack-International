import React from 'react';

interface AdminTableSkeletonProps {
  rows?: number;
}

export const AdminTableSkeleton: React.FC<AdminTableSkeletonProps> = ({ rows = 6 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
        <div className="h-4 bg-zinc-100 rounded w-1/3 mb-3" />
        <div className="h-8 bg-zinc-100 rounded w-full" />
      </div>
    ))}
  </div>
);
