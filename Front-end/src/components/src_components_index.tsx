import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';

const NAV_LINKS = ['Shop', 'Collections', 'About', 'Contact'];

// --- Navbar ---
interface NavbarProps {
  logo: string;
}

export const Navbar: React.FC<NavbarProps> = ({ logo }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-[#0B0B0B] border-b border-zinc-800/80 transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_30px_rgba(0,0,0,0.45)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 lg:gap-10">
          <button
            type="button"
            className="material-icons-round text-zinc-400 hover:text-[#39FF14] transition-colors lg:hidden"
            aria-label="Menu"
          >
            menu
          </button>
          <a
            href="#"
            className="text-[#39FF14] font-black text-lg sm:text-xl tracking-tighter uppercase italic shrink-0"
            style={{ textShadow: '0 0 20px rgba(57,255,20,0.35)' }}
          >
            {logo}
          </a>
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="nav-link-glow text-zinc-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-white">
          <button
            type="button"
            className="material-icons-round text-zinc-400 hover:text-[#39FF14] hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)] transition-all"
            aria-label="Search"
          >
            search
          </button>
          <button
            type="button"
            className="relative group"
            aria-label="Cart"
          >
            <span className="material-icons-round text-zinc-300 group-hover:text-[#39FF14] transition-colors">
              shopping_cart
            </span>
            <span className="absolute -top-2 -right-2 bg-[#39FF14] text-[#0B0B0B] text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-[0_0_12px_rgba(57,255,20,0.6)]">
              2
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- HeroSlider ---
interface HeroSliderProps {
  slides: Array<{
    image: string;
    title: string;
    subtitle: string;
    cta: string;
  }>;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides }) => (
  <section className="relative w-full hero-swiper">
    <Swiper
      modules={[Autoplay, Navigation, Pagination, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      loop
      speed={800}
      navigation
      pagination={{ clickable: true }}
      className="h-[75vh] min-h-[520px] max-h-[800px] w-full"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative h-full w-full overflow-hidden bg-[#0B0B0B]">
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/90 via-[#0B0B0B]/55 to-[#0B0B0B]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]/40" />

            <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center">
              <p className="text-[#39FF14] text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] mb-4">
                Cossack International
              </p>
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 tracking-tighter leading-[0.95] italic uppercase max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base mb-10 max-w-lg font-medium leading-relaxed">
                {slide.subtitle}
              </p>
              <button type="button" className="btn-primary w-fit text-sm sm:text-base">
                {slide.cta}
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

// --- CategoryCard ---
interface CategoryCardProps {
  title: string;
  image: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, image }) => (
  <article className="relative group overflow-hidden rounded-sm aspect-[4/5] sm:aspect-[16/10] bg-[#0B0B0B] border border-zinc-800 cursor-pointer transition-all duration-500 hover:border-[#39FF14] hover:shadow-[0_0_35px_rgba(57,255,20,0.25)] hover:scale-[1.02]">
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/30 to-transparent" />
    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 sm:p-8">
      <h3 className="text-white font-black text-2xl sm:text-3xl italic uppercase tracking-tighter mb-2">
        {title}
      </h3>
      <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        Shop Now →
      </span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#39FF14] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 shadow-[0_0_15px_rgba(57,255,20,0.8)]" />
  </article>
);

// --- ProductCard ---
interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  badge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ name, price, image, badge }) => (
  <article className="group bg-white rounded-sm overflow-hidden border border-zinc-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
    <div className="relative aspect-square overflow-hidden bg-zinc-50">
      {badge && (
        <span className="absolute top-3 left-3 z-10 bg-[#39FF14] text-[#0B0B0B] text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-[0_0_12px_rgba(57,255,20,0.4)]">
          {badge}
        </span>
      )}
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
    </div>
    <div className="p-4 sm:p-5">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cossack</p>
      <h3 className="text-sm font-bold text-[#0B0B0B] leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
        {name}
      </h3>
      <p className="text-[#0B0B0B] font-black text-lg mb-4">${price.toFixed(2)}</p>
      <button
        type="button"
        className="w-full bg-[#0B0B0B] text-white py-3.5 rounded-sm font-black text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest transition-all duration-300 hover:bg-[#39FF14] hover:text-[#0B0B0B] hover:shadow-[0_0_25px_rgba(57,255,20,0.45)] group/btn"
      >
        <span className="material-icons-round text-base transition-transform group-hover/btn:scale-110">
          add_shopping_cart
        </span>
        Add to Cart
      </button>
    </div>
  </article>
);

// --- WhyUsCard ---
interface WhyUsCardProps {
  icon: string;
  title: string;
  desc: string;
}

export const WhyUsCard: React.FC<WhyUsCardProps> = ({ icon, title, desc }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-8 rounded-sm border border-zinc-800/80 bg-zinc-900/50 hover:border-[#39FF14]/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.12)] transition-all duration-300 group">
    <div className="w-14 h-14 shrink-0 bg-[#0B0B0B] border border-zinc-700 rounded-sm flex items-center justify-center group-hover:border-[#39FF14] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.35)] transition-all duration-300">
      <span className="material-icons-round text-[#39FF14] text-3xl">{icon}</span>
    </div>
    <div className="space-y-1.5">
      <h3 className="text-white font-black text-sm uppercase italic tracking-wider">{title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">{desc}</p>
    </div>
  </div>
);

// --- Footer ---
const FOOTER_LINKS = {
  shop: ['Women', 'Men', 'Industrial', 'New Arrivals'],
  company: ['About', 'Careers', 'Sustainability', 'Press'],
  support: ['Contact', 'Shipping', 'Returns', 'FAQ'],
};

export const Footer: React.FC = () => (
  <footer className="bg-[#0B0B0B] text-white border-t border-zinc-800">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
        <div className="lg:col-span-4 space-y-5">
          <h4 className="text-[#39FF14] font-black text-2xl italic uppercase tracking-tighter">
            Cossack
          </h4>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
            Technical precision meets textile heritage. Redefining high-fidelity manufacturing for
            the modern industrial world.
          </p>
          <div className="flex gap-3 pt-2">
            {[
              { icon: 'public', label: 'Website' },
              { icon: 'hub', label: 'Network' },
              { icon: 'mail', label: 'Email' },
            ].map(({ icon, label }) => (
              <a
                key={icon}
                href="#"
                aria-label={label}
                className="w-11 h-11 border border-zinc-800 rounded-sm flex items-center justify-center text-zinc-400 hover:border-[#39FF14] hover:text-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.35)] transition-all duration-300"
              >
                <span className="material-icons-round text-xl">{icon}</span>
              </a>
            ))}
          </div>
        </div>

        {(
          [
            ['Shop', FOOTER_LINKS.shop],
            ['Company', FOOTER_LINKS.company],
            ['Support', FOOTER_LINKS.support],
          ] as const
        ).map(([heading, links]) => (
          <div key={heading} className="lg:col-span-2 lg:col-start-auto">
            <h5 className="font-black text-xs mb-5 text-zinc-400 uppercase tracking-widest">
              {heading}
            </h5>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-zinc-500 text-sm hover:text-[#39FF14] transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
          © {new Date().getFullYear()} Cossack International. All rights reserved.
        </p>
        <div className="w-16 h-0.5 bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
      </div>
    </div>
  </footer>
);
