import type { Category, Product } from '../types/api';
import categoryFallback from '../assets/hero.png';

const CATEGORY_FALLBACKS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
];

export function parsePrice(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function getProductImage(product: Product): string {
  if (product.base_image) return product.base_image;

  for (const variant of product.variants) {
    const primary = variant.images.find((img) => img.is_primary);
    if (primary?.image_url) return primary.image_url;
    if (variant.images[0]?.image_url) return variant.images[0].image_url;
  }

  return categoryFallback;
}

export function getVariantColors(product: Product): string[] {
  const seen = new Set<string>();
  const colors: string[] = [];
  for (const v of product.variants) {
    const key = v.color.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      colors.push(v.color.trim());
    }
  }
  return colors;
}

export function getConfigOptionsCount(product: Product): number {
  return product.configs.reduce((sum, cfg) => sum + cfg.options.length, 0);
}

export function getProductBadge(product: Product, index: number): string | undefined {
  const featured = product.static_configs.find(
    (c) => c.key.toLowerCase() === 'badge' || c.key.toLowerCase() === 'featured'
  );
  if (featured?.value) return featured.value.toUpperCase();
  if (index === 0) return 'NEW';
  return undefined;
}

export function getCategoryImage(
  category: Category,
  products: Product[],
  index: number
): string {
  const match = products.find((p) => p.category_id === category.id || p.category?.id === category.id);
  if (match) return getProductImage(match);
  return CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length] ?? categoryFallback;
}

export function selectFeaturedProducts(products: Product[], limit = 4): Product[] {
  return products.slice(0, limit);
}

export function selectNewArrivals(products: Product[], limit = 4): Product[] {
  if (products.length <= limit) return [...products].reverse();
  return products.slice(-limit).reverse();
}

export function toProductCardModel(product: Product, index = 0) {
  return {
    id: product.id,
    name: product.name,
    price: parsePrice(product.base_price),
    image: getProductImage(product),
    categoryName: product.category?.name ?? 'Cossack',
    badge: getProductBadge(product, index),
    colors: getVariantColors(product),
    configOptionsCount: getConfigOptionsCount(product),
    product,
  };
}

export type ProductCardModel = ReturnType<typeof toProductCardModel>;
