import type { ProductVariant } from '../types/api';
import { parsePrice } from './product';

export interface SelectedOptionRef {
  configId: string;
  optionId: string;
  configName: string;
  optionValue: string;
  priceModifier: number;
}

export interface PriceBreakdown {
  basePrice: number;
  variantModifier: number;
  optionModifiers: SelectedOptionRef[];
  appliedModifier: number;
  unitPrice: number;
}

/** Matches backend cart: base + max(variant_modifier, largest option modifier). */
export function calculateUnitPrice(
  basePrice: number,
  variant: ProductVariant | null,
  selectedOptions: SelectedOptionRef[]
): PriceBreakdown {
  const variantModifier = variant ? parsePrice(variant.price_modifier) : 0;
  const largestOptionModifier = selectedOptions.reduce(
    (max, opt) => Math.max(max, opt.priceModifier),
    0
  );
  const appliedModifier = Math.max(variantModifier, largestOptionModifier);

  return {
    basePrice,
    variantModifier,
    optionModifiers: selectedOptions,
    appliedModifier,
    unitPrice: basePrice + appliedModifier,
  };
}

export function formatModifier(amount: number): string {
  if (amount === 0) return '';
  const sign = amount > 0 ? '+' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function getStockStatus(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  return 'in_stock';
}

export const STOCK_LABELS = {
  in_stock: { label: 'In Stock', className: 'text-[#39FF14]' },
  low_stock: { label: 'Low Stock', className: 'text-amber-500' },
  out_of_stock: { label: 'Out Of Stock', className: 'text-red-500' },
} as const;
