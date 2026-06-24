import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

export const WhatsAppFloatingButton: React.FC = () => {
  const { pathname } = useLocation();

  // Hide the floating button on admin dashboard/management routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-24 md:right-6 md:bottom-28 z-[9999] pointer-events-auto">
      <a
        href="https://wa.me/923084639171"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white transition-all duration-300 hover:bg-[#20ba5a] hover:scale-110 active:scale-95 shadow-[0_4px_15px_rgba(37,211,102,0.4),0_0_10px_rgba(37,211,102,0.2)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.6),0_0_20px_rgba(37,211,102,0.4)]"
      >
        <FaWhatsapp className="w-7 h-7" />
        
        {/* Tooltip - Hidden on mobile, shown on hover on desktop */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#0B0B0B] border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shadow-[0_8px_30px_rgba(0,0,0,0.55)] hidden md:block">
          Chat with us on WhatsApp
          {/* Subtle tooltip arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-2.5 h-2.5 bg-[#0B0B0B] border-t border-r border-zinc-800 rotate-45" />
        </div>
      </a>
    </div>
  );
};
