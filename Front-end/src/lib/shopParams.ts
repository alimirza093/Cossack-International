/** Canonical shop route (alias `/shop` renders the same page). */
export const SHOP_PATH = '/products';

export function buildShopQuery(params: { category?: string; search?: string }): string {
  const qs = new URLSearchParams();
  if (params.category && params.category !== 'all') {
    qs.set('category', params.category);
  }
  const term = params.search?.trim();
  if (term) {
    qs.set('search', term);
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export function shopUrl(params: { category?: string; search?: string } = {}): string {
  return `${SHOP_PATH}${buildShopQuery(params)}`;
}
