export function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function formatPrice(value: string | number): string {
  return `${toNumber(value).toFixed(2)}`;
}

export function formatAdminDate(value: string | undefined | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

export function getProductThumbnail(
  baseImage: string | null | undefined,
  variants: Array<{ images: Array<{ image_url: string; is_primary?: boolean }> }>
): string {
  if (baseImage) return baseImage;
  for (const variant of variants) {
    const primary = variant.images.find((img) => img.is_primary);
    if (primary?.image_url) return primary.image_url;
    if (variant.images[0]?.image_url) return variant.images[0].image_url;
  }
  return '';
}

export function shortId(id: string, length = 8): string {
  return id.length > length ? `${id.slice(0, length)}…` : id;
}
