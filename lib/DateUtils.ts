export function parseLocalDate(s: string): Date | undefined {
  const parts = s.split(/\D+/).map(Number);
  if (parts.length < 3) return undefined;
  const [year, month, day, hour = 0, minute = 0, second = 0, ms = 0] = parts;
  return new Date(year, month - 1, day, hour, minute, second, ms);
}

