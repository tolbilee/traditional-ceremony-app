export type CaptionLanguage = 'korean' | 'english';

export function normalizeRoomCode(input?: string): string {
  return (input || '').trim().toLowerCase();
}

export function isCaptionLanguage(input: string): input is CaptionLanguage {
  return input === 'korean' || input === 'english';
}

export function toSafeLimit(input: string | null, fallback = 100, max = 500): number {
  if (!input) return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export function toOptionalText(input: unknown): string {
  return typeof input === 'string' ? input : '';
}

