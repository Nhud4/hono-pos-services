export function generateCode(prefix: string): string {
  const cleanPrefix = prefix.toUpperCase();
  const time = Date.now().toString(36).toUpperCase().slice(-8);

  return `${cleanPrefix}-${time}`;
}

export function getDiscountPrice(
  type: string | null,
  price: number,
  discount: number
) {
  if (type === 'percentage' && discount > 0) return Math.round(price * (1 - discount / 100))

  if (type === 'nominal' && discount > 0) return discount

  return 0
}