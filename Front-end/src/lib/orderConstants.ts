export const PAYMENT_METHOD_COD = 'cash_on_delivery';

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash_on_delivery: 'Cash on Delivery',
};

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHOD_LABEL[method] ?? 'Cash on Delivery';
}
