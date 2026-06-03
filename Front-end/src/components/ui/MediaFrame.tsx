import React from 'react';

interface MediaFrameProps {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}

/** Full-area image with blurred backdrop to avoid harsh letterboxing. */
export const MediaFrame: React.FC<MediaFrameProps> = ({
  src,
  alt,
  loading = 'lazy',
  className = '',
}) => (
  <div className={`relative w-full h-full overflow-hidden bg-[#0B0B0B] ${className}`}>
    <img
      src={src}
      alt=""
      aria-hidden
      loading={loading}
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-35"
    />
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className="relative z-[1] w-full h-full object-contain"
    />
  </div>
);
