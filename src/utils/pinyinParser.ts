/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pinyin parser — splits a pinyin string into structured phoneme components.
 *
 * Input: "nǐ hǎo" or "ni3 hao3"
 * Output: ['n', 'i', '3', 'h', 'ao', '3']  (initial, final, tone per syllable)
 *
 * The parser handles both tone-diacritic form (nǐ) and tone-number form (ni3).
 * Tone numbers are the canonical internal representation; diacritics are
 * converted to numbers on entry.
 */

// ── Tone diacritic → tone number mapping ────────────────────────

/**
 * Map of (base vowel + combining tone mark) → (base vowel + tone number).
 * Pinyin uses the following diacritics:
 *   ˉ macron → tone 1
 *   ˊ acute  → tone 2
 *   ˇ caron  → tone 3
 *   ˋ grave  → tone 4
 *
 * We handle both precomposed characters (e.g. ǎ) and base+combining sequences.
 */
const TONE_MARK_MAP: Record<string, string> = {
  // Precomposed vowels with tone marks → base vowel
  'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4',
  'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
  'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4',
  'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
  'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4',
  'ǖ': 'v1', 'ǘ': 'v2', 'ǚ': 'v3', 'ǜ': 'v4',
  // ü with tone marks → v + tone number (internal representation)
};

/**
 * Convert a pinyin string with tone diacritics to tone-number form.
 * e.g. "nǐ hǎo" → "ni3 hao3"
 *
 * Strategy: scan each character; if it's a tone-marked vowel, replace it
 * with the plain vowel + tone number.
 */
function diacriticsToNumbers(pinyin: string): string {
  return pinyin
    .split(/(\s+)/)
    .map(part => {
      if (/^\s+$/.test(part)) return part;

      let body = '';
      let tone = '';

      for (const ch of part) {
        const mapped = TONE_MARK_MAP[ch];
        if (mapped) {
          body += mapped[0];
          tone = mapped[1];
        } else if (ch === 'ü') {
          body += 'v'; // ü → v in tone-number pinyin
        } else {
          body += ch;
        }
      }

      return tone && !/[1-5]$/.test(body) ? `${body}${tone}` : body;
    })
    .join('');
}

// ── Initials (声母) ─────────────────────────────────────────────

/** All 21 Mandarin initials, ordered by length (longer first for greedy match). */
const INITIALS = [
  'zh', 'ch', 'sh',
  'b', 'p', 'm', 'f',
  'd', 't', 'n', 'l',
  'g', 'k', 'h',
  'j', 'q', 'x',
  'r',
  'z', 'c', 's',
];

// ── Finals (韵母) ───────────────────────────────────────────────

/**
 * All Mandarin finals, ordered by length (longer first for greedy match).
 * Includes 'ü' as 'v' for tone-number compatibility.
 */
const FINALS = [
  // 3-character finals
  'iang', 'iong', 'uang', 'iang', 'ieng',
  // Common 3-char (less common omitted for clarity)
  'iao', 'ian', 'uai', 'uan', 'van',
  // 2-character finals
  'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong',
  'ia', 'ie', 'iu', 'in', 'ing', 'ua', 'uo', 'ui', 'un', 've', 'vn',
  // 1-character finals
  'a', 'o', 'e', 'i', 'u', 'v', 'er',
];

// ── Parsed syllable ─────────────────────────────────────────────

export interface ParsedSyllable {
  /** Initial (声母), e.g. 'zh', 'n'. Empty string for zero-initial syllables. */
  initial: string;
  /** Final (韵母), e.g. 'ao', 'i'. */
  final: string;
  /** Tone number 1-4, 0 for neutral tone, or -1 if missing. */
  tone: number;
}

// ── Core parsing ────────────────────────────────────────────────

/**
 * Parse a single pinyin syllable (in tone-number form, e.g. "zhong1")
 * into its initial + final + tone components.
 */
function parseSyllable(syl: string): ParsedSyllable {
  // Extract tone number from the end
  let tone = -1; // missing / unknown
  let body = syl;

  const lastChar = syl[syl.length - 1];
  if (lastChar >= '1' && lastChar <= '4') {
    tone = parseInt(lastChar, 10);
    body = syl.slice(0, -1);
  } else if (lastChar === '5') {
    tone = 0; // tone 5 = neutral in some systems
    body = syl.slice(0, -1);
  }

  // Try to match an initial (greedy, longest first)
  let initial = '';
  for (const init of INITIALS) {
    if (body.startsWith(init)) {
      initial = init;
      body = body.slice(init.length);
      break;
    }
  }

  if (initial === 'j' || initial === 'q' || initial === 'x') {
    body = body.replace(/^u/, 'v');
  }

  if (!initial) {
    body = normalizeZeroInitialFinal(body);
  }

  // The remainder is the final
  const final_ = body || 'e'; // fallback for edge cases like "e"

  return { initial, final: final_, tone };
}

function normalizeZeroInitialFinal(body: string): string {
  const zeroInitialMap: Record<string, string> = {
    ya: 'ia',
    yan: 'ian',
    yang: 'iang',
    yao: 'iao',
    ye: 'ie',
    yi: 'i',
    yin: 'in',
    ying: 'ing',
    yong: 'iong',
    you: 'iu',
    yu: 'v',
    yue: 've',
    yuan: 'van',
    yun: 'vn',
    wa: 'ua',
    wai: 'uai',
    wan: 'uan',
    wang: 'uang',
    wei: 'ui',
    wen: 'un',
    weng: 'ong',
    wo: 'uo',
    wu: 'u',
  };

  return zeroInitialMap[body] ?? body;
}

/**
 * Parse a full pinyin string into an array of ParsedSyllables.
 * Accepts both diacritic form ("nǐ hǎo") and tone-number form ("ni3 hao3").
 */
export function parsePinyinSyllables(pinyin: string): ParsedSyllable[] {
  // Convert diacritics to tone numbers first
  const normalized = diacriticsToNumbers(pinyin.trim());

  // Split on whitespace
  const tokens = normalized.split(/\s+/).filter(t => t.length > 0);

  return tokens.map(parseSyllable);
}

/**
 * Parse a pinyin string into a flat phoneme array for the LanguageProfile API.
 * Each syllable produces [initial?, final, tone] in order.
 *
 * e.g. "nǐ hǎo" → ['n', 'i', '3', 'h', 'ao', '3']
 */
export function parsePinyin(pinyin: string): string[] {
  const syllables = parsePinyinSyllables(pinyin);
  const result: string[] = [];

  for (const syl of syllables) {
    if (syl.initial) {
      result.push(syl.initial);
    }
    result.push(syl.final);
    if (syl.tone >= 0) {
      result.push(String(syl.tone));
    }
  }

  return result;
}

/**
 * Get the set of unique phoneme symbols in a pinyin string.
 */
export function getUniquePinyinPhonemes(pinyin: string): string[] {
  return [...new Set(parsePinyin(pinyin))];
}

/**
 * Reconstruct pinyin with tone numbers from a parsed syllable.
 * e.g. { initial: 'n', final: 'i', tone: 3 } → "ni3"
 */
export function syllableToString(syl: ParsedSyllable): string {
  const tone = syl.tone === 0 ? 5 : syl.tone > 0 ? syl.tone : '';
  return `${syl.initial}${syl.final}${tone}`;
}

/**
 * Reconstruct a full pinyin string (tone-number form) from parsed syllables.
 */
export function syllablesToString(syllables: ParsedSyllable[]): string {
  return syllables.map(syllableToString).join(' ');
}
