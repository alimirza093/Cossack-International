import type { Product, ProductImage, ProductVariant } from '../types/api';
import { HERO_IMAGES } from '../lib/siteAssets';
import { getProductImage } from './product';

const categoryFallback = HERO_IMAGES.hozri1;

export function getVariantImages(variant: ProductVariant | null, product: Product): ProductImage[] {
  if (variant?.images?.length) {
    return variant.images;
  }
  if (product.base_image) {
    return [{ id: 'base', image_url: product.base_image, is_primary: true }];
  }
  return [{ id: 'fallback', image_url: categoryFallback, is_primary: true }];
}

export function findVariantByColor(product: Product, color: string): ProductVariant | undefined {
  return product.variants.find((v) => v.color.trim().toLowerCase() === color.trim().toLowerCase());
}

export function getDefaultVariant(product: Product): ProductVariant | null {
  if (product.variants.length === 0) return null;
  const inStock = product.variants.find((v) => v.stock > 0);
  return inStock ?? product.variants[0];
}

export function getInitialSelections(product: Product): {
  variant: ProductVariant | null;
  configSelections: Record<string, string>;
} {
  const variant = getDefaultVariant(product);
  const configSelections: Record<string, string> = {};
  for (const config of product.configs) {
    if (config.options[0]) {
      configSelections[config.id] = config.options[0].id;
    }
  }
  return { variant, configSelections };
}

export { getProductImage };
