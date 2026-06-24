import { HERO_IMAGES } from '../lib/siteAssets';
import { shopUrl } from '../lib/shopParams';

/** Static marketing content for hero — not catalog data */
export const heroSlides = [
  {
    image: HERO_IMAGES.hozri1,
    title: 'Premium Hosiery',
    subtitle: 'Precision-knit hosiery engineered for comfort, durability, and consistent fit at scale.',
    cta: 'Shop Hosiery',
    ctaLink: shopUrl({ category: '019ead1d-8fad-713e-a58e-04df1dd0e701' }),
  },
  {
    image: HERO_IMAGES.puffer1,
    title: 'Technical Outerwear',
    subtitle: 'Insulated puffer jackets built with industrial-grade materials and refined construction.',
    cta: 'Shop Jackets',
    ctaLink: shopUrl({ category: '019ead1d-f149-71b8-b478-79a642e3f7cb' }),
  },
  {
    image: HERO_IMAGES.hozri3,
    title: 'Cossack International',
    subtitle: 'Industrial-grade textiles built for performance, precision, and global manufacturing.',
    cta: 'View Products',
    ctaLink: shopUrl(),
  },
  {
    image: HERO_IMAGES.puffer2,
    title: 'Built for Performance',
    subtitle: 'From yarn selection to final inspection — every garment meets export-quality standards.',
    cta: 'Shop Now',
    ctaLink: shopUrl(),
  },
  {
    image: HERO_IMAGES.hozri5,
    title: 'Heritage. Reinvented.',
    subtitle: 'Decades of textile manufacturing excellence powering the next generation of apparel.',
    cta: 'View Products',
    ctaLink: shopUrl(),
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
