export function generateCode(prefix: string): string {
  const cleanPrefix = prefix.toUpperCase();
  const time = Date.now().toString(36).toUpperCase().slice(-8);

  return `${cleanPrefix}-${time}`;
}
