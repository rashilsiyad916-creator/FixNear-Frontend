const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into',
  'nor', 'of', 'on', 'onto', 'or', 'over', 'per', 'the', 'to', 'up', 'via', 'with'
]);

const ACRONYMS = new Set([
  'ac', 'tv', 'led', 'lcd', 'cctv', 'pc', 'faq', 'hvac', 'ups', 'ro', 'ir',
  'gps', 'usb', 'hdmi', 'diy'
]);

const SPECIAL_CASES: Record<string, string> = {
  wifi: 'WiFi',
  iphone: 'iPhone',
  ipad: 'iPad',
  imac: 'iMac',
  macbook: 'MacBook',
  airpods: 'AirPods',
  youtube: 'YouTube'
};

/**
 * Formats user-entered service text into clean Title Case without destroying
 * acronyms (AC, TV, CCTV) or brand-style names (iPhone, WiFi).
 */
export function titleCase(value: string | null | undefined): string {
  if (!value) return '';

  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) => {
      if (!word) return word;

      const bare = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const isAllLower = word === word.toLowerCase();

      // Keep intentional mixed casing the provider already typed (iPhone, WiFi).
      if (/[A-Z]/.test(word) && !/^[A-Z]+$/.test(word)) return word;

      if (isAllLower && SPECIAL_CASES[bare]) return SPECIAL_CASES[bare];
      if (ACRONYMS.has(bare)) return word.toUpperCase();

      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;

      return lower.replace(/(^|[-/])([a-z])/g, (_, prefix, letter) =>
        prefix + letter.toUpperCase()
      );
    })
    .join(' ');
}
