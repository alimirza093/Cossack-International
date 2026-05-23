import heroImg from '../assets/hero.png';

const factoryImg =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80';
const productImg =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80';
const brandImg =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80';

export const products = [
  {
    id: '1',
    name: 'Merino Silk Technical',
    price: 24.99,
    image: productImg,
    badge: 'NEW',
  },
  {
    id: '2',
    name: 'Industrial Ribbed Knit',
    price: 34.99,
    image: factoryImg,
    badge: 'TOP SELLER',
  },
  {
    id: '3',
    name: 'Precision Weave Mesh',
    price: 29.99,
    image: heroImg,
  },
  {
    id: '4',
    name: 'Executive Classic Fiber',
    price: 44.99,
    image: brandImg,
  },
];

export const categories = [
  { id: '1', title: 'Women', image: brandImg },
  { id: '2', title: 'Men', image: productImg },
  { id: '3', title: 'Industrial', image: factoryImg },
];

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
