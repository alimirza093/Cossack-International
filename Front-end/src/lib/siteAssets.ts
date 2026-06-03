/** Public assets served from /public/assets */
export const SITE_LOGO = '/logo.png';

export const HERO_IMAGES = {
  hozri1: '/assets/hozri1.jpeg',
  hozri2: '/assets/hozri2.jpeg',
  hozri3: '/assets/hozri3.jpeg',
  hozri4: '/assets/hozri4.jpeg',
  hozri5: '/assets/hozri5.jpeg',
  puffer1: '/assets/puffer-jacket1.jpeg',
  puffer2: '/assets/puffer-jacket2.jpeg',
  puffer3: '/assets/puffer-jacket3.jpeg',
} as const;

export const CATEGORY_FALLBACK_IMAGES = [
  HERO_IMAGES.hozri1,
  HERO_IMAGES.puffer1,
  HERO_IMAGES.hozri3,
  HERO_IMAGES.puffer2,
  HERO_IMAGES.hozri5,
];

export const GALLERY_IMAGES = [
  { src: HERO_IMAGES.hozri1, alt: 'Premium hosiery collection' },
  { src: HERO_IMAGES.hozri2, alt: 'Technical knit hosiery' },
  { src: HERO_IMAGES.hozri3, alt: 'Performance hosiery line' },
  { src: HERO_IMAGES.hozri4, alt: 'Export-quality hosiery' },
  { src: HERO_IMAGES.hozri5, alt: 'Heritage hosiery manufacturing' },
  { src: HERO_IMAGES.puffer1, alt: 'Insulated puffer jacket' },
  { src: HERO_IMAGES.puffer2, alt: 'Technical outerwear jacket' },
  { src: HERO_IMAGES.puffer3, alt: 'Industrial-grade puffer jacket' },
];
