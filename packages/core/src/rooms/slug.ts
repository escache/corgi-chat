const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{4,30}[a-z0-9])?$/;

export function isValidRoomSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length >= 6 && slug.length <= 32;
}

function randomSuffix(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return result;
}

export function generateRoomSlug(name?: string): string {
  if (!name?.trim()) {
    return `room-${randomSuffix(8)}`;
  }

  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  const candidate = base ? `${base}-${randomSuffix(4)}` : `room-${randomSuffix(8)}`;
  return candidate.slice(0, 32);
}
