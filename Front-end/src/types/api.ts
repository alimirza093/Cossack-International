export interface Category {
  id: string;
  name: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  color: string;
  stock: number;
  price_modifier: string | number;
  images: ProductImage[];
}

export interface ProductConfigOption {
  id: string;
  value: string;
  price_modifier: string | number;
}

export interface ProductConfig {
  id: string;
  name: string;
  type: 'size' | 'custom' | string;
  options: ProductConfigOption[];
}

export interface ProductStaticConfig {
  id: string;
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  base_price: string | number;
  base_image?: string | null;
  category_id?: string | null;
  category?: Category | null;
  static_configs: ProductStaticConfig[];
  configs: ProductConfig[];
  variants: ProductVariant[];
}

export interface ApiError {
  message: string;
  status?: number;
}
