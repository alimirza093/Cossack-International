import React from 'react';
import heroBanner from '../../assets/hero.png';

const PromoBanner: React.FC = () => (
  <section className="relative py-28 md:py-36 px-6 overflow-hidden bg-[#0B0B0B]">
    <img
      src={heroBanner}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale"
      loading="lazy"
      aria-hidden
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-[#0B0B0B]/60" />
    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <p className="text-[#39FF14] text-xs font-black uppercase tracking-[0.35em] mb-4">
        Limited Offer
      </p>
      <h2 className="text-white font-black text-3xl md:text-5xl mb-5 italic uppercase tracking-tighter">
        Built for Performance
      </h2>
      <p className="text-zinc-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">
        Crafted in high-fidelity environments with industrial-grade standards. Explore the full
        collection today.
      </p>
      <button type="button" className="btn-primary">
        Shop Collection
      </button>
    </div>
  </section>
);

export default React.memo(PromoBanner);
