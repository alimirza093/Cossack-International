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
  created_at?: string | null;
  static_configs: ProductStaticConfig[];
  configs: ProductConfig[];
  variants: ProductVariant[];
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface CartSelectedOption {
  config_id: string;
  config_name: string;
  option_id: string;
  option_value: string;
  price_modifier: string | number;
}

export interface CartVariant {
  id: string;
  color: string;
  stock: number;
  price_modifier: string | number;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: CartVariant | null;
  selected_options: CartSelectedOption[];
  quantity: number;
  final_price: string | number;
  item_total: string | number;
  created_at: string;
}

export interface Cart {
  id?: string | null;
  user_id: string;
  grand_total: string | number;
  items: CartItem[];
  created_at?: string | null;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderVariant {
  id: string;
  color: string;
  price_modifier: string | number;
}

export interface OrderSelectedOption {
  config_id: string;
  config_name: string;
  option_id: string;
  option_value: string;
  price_modifier: string | number;
}

export interface OrderItem {
  id: string;
  product: Product | null;
  variant: OrderVariant | null;
  selected_options: OrderSelectedOption[];
  quantity: number;
  final_price: string | number;
  item_total: string | number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: string | number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}
