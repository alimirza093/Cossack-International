import React from 'react';
import type { ApiError } from '../../types/api';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-red-200/80 bg-red-50/50 rounded-sm">
    <span className="material-icons-round text-red-500 text-4xl mb-4">error_outline</span>
    <p className="text-sm font-bold text-[#0B0B0B] mb-1">Something went wrong</p>
    <p className="text-xs text-zinc-500 max-w-md mb-6">{message ?? 'Please try again later.'}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-primary text-xs px-6 py-2.5">
        Retry
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description = 'Check back soon for new items.',
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-zinc-200 bg-white rounded-sm">
    <span className="material-icons-round text-zinc-300 text-4xl mb-4">inventory_2</span>
    <p className="text-sm font-bold text-[#0B0B0B] mb-1">{title}</p>
    <p className="text-xs text-zinc-500 max-w-md">{description}</p>
  </div>
);

interface CatalogErrorBannerProps {
  error: ApiError;
  onRetry: () => void;
}

export const CatalogErrorBanner: React.FC<CatalogErrorBannerProps> = ({ error, onRetry }) => (
  <div className="mb-8">
    <ErrorState message={error.message} onRetry={onRetry} />
  </div>
);
