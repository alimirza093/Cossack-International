import React from 'react';
import { SITE_LOGO } from '../../lib/siteAssets';

interface SiteLogoProps {
  className?: string;
  showText?: boolean;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({ className = 'h-11 w-auto', showText = false }) => (
  <span className="inline-flex items-center gap-2 shrink-0">
    <img
      src={SITE_LOGO}
      alt="Cossack International"
      className={className}
      decoding="async"
    />
    {showText && (
      <span className="text-[#39FF14] font-black text-lg sm:text-xl tracking-tighter uppercase italic">
        Cossack
      </span>
    )}
  </span>
);
