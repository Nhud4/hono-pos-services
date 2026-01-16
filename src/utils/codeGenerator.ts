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
  if (type === 'percentage') return Math.round(price * (1 - discount / 100))

  if (type === 'nominal') return discount

  return 0
}