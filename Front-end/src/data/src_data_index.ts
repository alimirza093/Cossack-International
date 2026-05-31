import heroImg from '../assets/hero.png';

const factoryImg =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80';
const productImg =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';

/** Static marketing content for hero — not catalog data */
export const heroSlides = [
  {
    image: factoryImg,
    title: 'Cossack International',
    subtitle: 'Industrial-grade textiles built for performance, precision, and global scale.',
    cta: 'Explore Collection',
  },
  {
    image: productImg,
    title: 'Engineered Apparel',
    subtitle: 'Premium fabrics and technical construction — designed for the modern athlete.',
    cta: 'Shop Now',
  },
  {
    image: heroImg,
    title: 'Heritage. Reinvented.',
    subtitle: 'Decades of manufacturing excellence powering the next generation of sportswear.',
    cta: 'Discover Brand',
  },
];

export const whyUsItems = [
  {
    icon: 'bolt',
    title: 'Rapid Logistics',
    desc: 'Zero-latency global fulfillment across 40+ regions.',
  },
  {
    icon: 'verified',
    title: 'Industrial Grade',
    desc: 'Precision testing protocols on every production batch.',
  },
  {
    icon: 'factory',
    title: 'Legacy Backbone',
    desc: 'Textile manufacturing dominance since 1987.',
  },
];

export const testimonials = [
  {
    id: '1',
    quote:
      'Cossack delivered on every spec — fabric weight, stitch tolerance, and lead time were exactly as quoted.',
    name: 'Elena Vasquez',
    role: 'Procurement Director, Apex Athletics',
  },
  {
    id: '2',
    quote:
      'The technical mesh line held up through our full season stress tests. Genuinely industrial-grade output.',
    name: 'Marcus Chen',
    role: 'Head of Product, Northline Sports',
  },
  {
    id: '3',
    quote:
      'From sample to bulk run, communication was sharp and the quality never drifted. A reliable manufacturing partner.',
    name: 'Sofia Laurent',
    role: 'Brand Lead, Meridian Wear Co.',
  },
];
