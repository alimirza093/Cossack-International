import type { Product } from '../types/api';

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesProductSearch(product: Product, query: string): boolean {
  const term = normalizeSearchQuery(query);
  if (!term) return true;

  const name = (product.name ?? '').toLowerCase();
  const description = (product.description ?? '').toLowerCase();
  return name.includes(term) || description.includes(term);
}

export function filterProductsBySearch(products: Product[], query: string): Product[] {
  const term = normalizeSearchQuery(query);
  if (!term) return products;
  return products.filter((p) => matchesProductSearch(p, term));
}
