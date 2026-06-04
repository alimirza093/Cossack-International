import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SiteLogo } from './ui/SiteLogo';
import { MediaFrame } from './ui/MediaFrame';
import { ProductSearchInput } from './ui/ProductSearchInput';
import { shopUrl, SHOP_PATH } from '../lib/shopParams';

const NAV_LINKS: Array<{ label: string; to: string }> = [
  { label: 'Shop', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const NavbarAuthControls: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  if (isLoading) {
    return <div className="w-20 h-8 bg-zinc-800 rounded-sm animate-pulse" aria-hidden />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/login"
          className="text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:text-[#39FF14] transition-colors px-2 py-1"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-[#39FF14] text-[#0B0B0B] px-3 sm:px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.45)] transition-all"
        >
          Register
        </Link>
      </div>
    );
  }

  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  const isAdmin = user.role === 'admin';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-[#39FF14]">
          {initials}
        </span>
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest max-w-[100px] truncate">
          {user.first_name}
        </span>
        <span className="material-icons-round text-lg text-zinc-500">expand_more</span>
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B0B0B] border border-zinc-800 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.45)] py-2 z-50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-white text-xs font-bold truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-zinc-500 text-[10px] truncate mt-0.5">{user.email}</p>
          </div>
          {/* Profile is always available for signed-in users */}
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
          >
            Profile
          </Link>

          {isAdmin ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/products"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
              >
                Manage Products
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
              >
                Manage Orders
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
              >
                Manage Categories
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
              >
                My Orders
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-900/80 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const NavbarSearch: React.FC<{
  className?: string;
  size?: 'sm' | 'md';
  onNavigate?: () => void;
}> = ({ className = '', size = 'md', onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState('');

  useEffect(() => {
    const onShop =
      location.pathname === SHOP_PATH || location.pathname === '/shop';
    if (onShop) {
      const q = new URLSearchParams(location.search).get('search') ?? '';
      setTerm(q);
    }
  }, [location.pathname, location.search]);

  const goToShop = (query: string) => {
    navigate(shopUrl({ search: query }));
    onNavigate?.();
  };

  return (
    <ProductSearchInput
      value={term}
      onChange={setTerm}
      onSubmit={() => goToShop(term)}
      size={size}
      className={className}
    />
  );
};

// --- Navbar ---
export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 bg-[#0B0B0B] border-b border-zinc-800/80 transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_30px_rgba(0,0,0,0.45)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[4.5rem] flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10 min-w-0 flex-1">
          <Link to="/" className="shrink-0" onClick={() => setMobileNavOpen(false)}>
            <SiteLogo className="h-11 sm:h-12 lg:h-14 w-auto max-w-[min(220px,42vw)]" />
          </Link>
          <ul className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="nav-link-glow text-zinc-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex flex-1 max-w-md min-w-[12rem]">
            <NavbarSearch className="w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-white shrink-0">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-[#39FF14] hover:border-[#39FF14]/50 transition-colors"
            >
              <span className="material-icons-round text-base text-[#39FF14]">dashboard</span>
              Admin Dashboard
            </Link>
          )}
          {!isAdmin && (
            <Link to="/cart" className="relative group" aria-label="Cart">
              <span className="material-icons-round text-zinc-300 group-hover:text-[#39FF14] transition-colors">
                shopping_cart
              </span>
              {isAuthenticated && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#39FF14] text-[#0B0B0B] text-[10px] font-black leading-[18px] text-center shadow-[0_0_10px_rgba(57,255,20,0.55)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <NavbarAuthControls />
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="flex lg:hidden items-center justify-center w-10 h-10 -mr-1 material-icons-round text-zinc-400 hover:text-[#39FF14] transition-colors"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 bg-[#0B0B0B] border-b border-zinc-800 lg:hidden">
            <div className="px-4 pt-4 pb-2">
              <NavbarSearch
                size="sm"
                className="w-full"
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
            <ul className="px-4 pb-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-[#39FF14] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-[#39FF14] transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </>
      )}
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
    ctaLink?: string;
  }>;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides }) => (
  <section className="relative w-full hero-swiper">
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      loop
      speed={800}
      pagination={{ clickable: true }}
      className="h-[75vh] min-h-[520px] max-h-[800px] w-full"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index} className="!h-auto min-h-full">
          <div className="relative h-full w-full min-h-[520px]">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <MediaFrame
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/85 via-[#0B0B0B]/45 to-transparent pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-[#0B0B0B]/25 pointer-events-none z-[1]" />

            <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center pointer-events-auto">
              <p className="text-[#39FF14] text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] mb-4">
                Cossack International
              </p>
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 tracking-tighter leading-[0.95] italic uppercase max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base mb-10 max-w-lg font-medium leading-relaxed">
                {slide.subtitle}
              </p>
              {slide.ctaLink ? (
                <Link to={slide.ctaLink} className="btn-primary w-fit text-sm sm:text-base">
                  {slide.cta}
                </Link>
              ) : (
                <Link to="/products" className="btn-primary w-fit text-sm sm:text-base">
                  {slide.cta}
                </Link>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

// --- CategoryCard ---
interface CategoryCardProps {
  id: string;
  title: string;
  image: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ id, title, image }) => (
  <Link
    to={`/products?category=${id}`}
    className="block relative group overflow-hidden rounded-sm aspect-[4/5] sm:aspect-[16/10] bg-[#0B0B0B] border border-zinc-800 transition-all duration-500 hover:border-[#39FF14] hover:shadow-[0_0_35px_rgba(57,255,20,0.25)] hover:scale-[1.02]"
  >
    <img
      src={image}
      alt={title}
      loading="lazy"
      decoding="async"
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
  </Link>
);

// --- ProductCard ---
const MAX_COLOR_SWATCHES = 5;

function colorToSwatchStyle(color: string): React.CSSProperties {
  const trimmed = color.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return { backgroundColor: trimmed };
  }
  return { backgroundColor: trimmed };
}

interface ProductCardProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string;
  badge?: string;
  colors?: string[];
  configOptionsCount?: number;
  onQuickView?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  productId,
  name,
  price,
  image,
  categoryName = 'Cossack',
  badge,
  colors = [],
  configOptionsCount = 0,
  onQuickView,
}) => {
  const visibleColors = colors.slice(0, MAX_COLOR_SWATCHES);
  const extraColors = colors.length - visibleColors.length;

  const handleQuickView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(e);
  };

  return (
    <Link
      to={`/products/${productId}`}
      className="block group bg-white rounded-sm overflow-hidden border border-zinc-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
    >
      <article>
        <div className="relative aspect-square overflow-hidden bg-zinc-50">
          {badge && (
            <span className="absolute top-3 left-3 z-10 bg-[#39FF14] text-[#0B0B0B] text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-[0_0_12px_rgba(57,255,20,0.4)]">
              {badge}
            </span>
          )}
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickView}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/95 text-[#0B0B0B] px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm border border-zinc-200 hover:border-[#39FF14] hover:text-[#0B0B0B] shadow-lg"
            >
              Quick View
            </button>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 line-clamp-1">
            {categoryName}
          </p>
          <h3 className="text-sm font-bold text-[#0B0B0B] leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>
          <p className="text-[#0B0B0B] font-black text-lg mb-2">Rs. {price.toFixed(2)}</p>

          {(visibleColors.length > 0 || configOptionsCount > 0) && (
            <div className="flex flex-wrap items-center gap-2 min-h-[1.25rem]">
              {visibleColors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {visibleColors.map((color) => (
                      <span
                        key={color}
                        title={color}
                        className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                        style={colorToSwatchStyle(color)}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    {colors.length} {colors.length === 1 ? 'color' : 'colors'}
                  </span>
                  {extraColors > 0 && (
                    <span className="text-[9px] text-zinc-400">+{extraColors}</span>
                  )}
                </div>
              )}
              {configOptionsCount > 0 && (
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  {configOptionsCount} {configOptionsCount === 1 ? 'option' : 'options'}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export const ProductCard = React.memo(ProductCardComponent);

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
const FOOTER_COMPANY: Array<{ label: string; to: string }> = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Shop', to: '/products' },
];

interface FooterProps {
  categories?: Array<{ id: string; name: string }>;
}

export const Footer: React.FC<FooterProps> = ({ categories = [] }) => {
  const shopLinks =
    categories.length > 0
      ? categories.map((c) => ({ label: c.name, to: `/products?category=${c.id}` }))
      : [{ label: 'All Products', to: '/products' }];

  return (
  <footer className="bg-[#0B0B0B] text-white border-t border-zinc-800">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
        <div className="lg:col-span-4 space-y-5">
          <Link to="/">
            <SiteLogo className="h-12 w-auto" />
          </Link>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
            Technical precision meets textile heritage. Redefining high-fidelity manufacturing for
            the modern industrial world.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#39FF14] transition-colors"
          >
            <span className="material-icons-round text-base">mail</span>
            Get in Touch
          </Link>
          <div className="pt-2 flex flex-col gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <a 
            href="tel:+923084639171" 
            className="inline-flex items-center gap-2 hover:text-[#39FF14] transition-colors"
            >
            <span className="material-icons-round text-base">phone</span>
            +92 308 4639171
            </a>
            <a 
            href="tel:+923228702004" 
            className="inline-flex items-center gap-2 hover:text-[#39FF14] transition-colors"
            >
            <span className="material-icons-round text-base">phone</span>
            +92 322 8702004
            </a>
          </div>
        </div>

        {(
          [
            ['Shop', shopLinks],
            ['Company', FOOTER_COMPANY],
          ] as const
        ).map(([heading, links]) => (
          <div key={heading} className="lg:col-span-2 lg:col-start-auto">
            <h5 className="font-black text-xs mb-5 text-zinc-400 uppercase tracking-widest">
              {heading}
            </h5>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-zinc-500 text-sm hover:text-[#39FF14] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-zinc-900 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
          © {new Date().getFullYear()} Cossack International. All rights reserved.
        </p>
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
          cossackinternational68@gmail.com
        </p>
        <div className="w-16 h-0.5 bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.5)]" />
      </div>
    </div>
  </footer>
  );
};
