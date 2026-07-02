/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * English language profile for American IPA training.
 * Extracts and consolidates all English-specific logic that was previously
 * scattered across ipaParser.ts, IPAKeypad.tsx, phonemeGroups.ts.
 */

import type { LanguageProfile, PhonemeDef } from '../types';
import { tokenizeIpa } from '../utils/ipaParser';
import { phonemeJudge } from '../utils/judge';
import { wordBank } from '../data/wordBank';

// ── Phoneme inventory ───────────────────────────────────────────

const EN_VOWELS: PhonemeDef[] = [
  { symbol: 'i', category: 'vowel', label: 'ee' },
  { symbol: 'ɪ', category: 'vowel', label: 'ih' },
  { symbol: 'eɪ', category: 'vowel', label: 'ay' },
  { symbol: 'ɛ', category: 'vowel', label: 'eh' },
  { symbol: 'æ', category: 'vowel', label: 'a (cat)' },
  { symbol: 'ɑ', category: 'vowel', label: 'ah (father)' },
  { symbol: 'ɔ', category: 'vowel', label: 'aw' },
  { symbol: 'oʊ', category: 'vowel', label: 'oh' },
  { symbol: 'ʊ', category: 'vowel', label: 'oo (book)' },
  { symbol: 'u', category: 'vowel', label: 'oo (boot)' },
  { symbol: 'ʌ', category: 'vowel', label: 'uh (cup)' },
  { symbol: 'ɚ', category: 'vowel', label: 'er' },
  { symbol: 'ə', category: 'vowel', label: 'schwa' },
  { symbol: 'aɪ', category: 'vowel', label: 'eye' },
  { symbol: 'aʊ', category: 'vowel', label: 'ow' },
  { symbol: 'ɔɪ', category: 'vowel', label: 'oy' },
];

const EN_CONSONANTS: PhonemeDef[] = [
  { symbol: 'p', category: 'consonant', label: 'p' },
  { symbol: 'b', category: 'consonant', label: 'b' },
  { symbol: 't', category: 'consonant', label: 't' },
  { symbol: 'd', category: 'consonant', label: 'd' },
  { symbol: 'k', category: 'consonant', label: 'k' },
  { symbol: 'ɡ', category: 'consonant', label: 'g' },
  { symbol: 'f', category: 'consonant', label: 'f' },
  { symbol: 'v', category: 'consonant', label: 'v' },
  { symbol: 'θ', category: 'consonant', label: 'th (think)' },
  { symbol: 'ð', category: 'consonant', label: 'th (the)' },
  { symbol: 's', category: 'consonant', label: 's' },
  { symbol: 'z', category: 'consonant', label: 'z' },
  { symbol: 'ʃ', category: 'consonant', label: 'sh' },
  { symbol: 'ʒ', category: 'consonant', label: 'zh' },
  { symbol: 'h', category: 'consonant', label: 'h' },
  { symbol: 'm', category: 'consonant', label: 'm' },
  { symbol: 'n', category: 'consonant', label: 'n' },
  { symbol: 'ŋ', category: 'consonant', label: 'ng' },
  { symbol: 'l', category: 'consonant', label: 'l' },
  { symbol: 'r', category: 'consonant', label: 'r' },
  { symbol: 'j', category: 'consonant', label: 'y' },
  { symbol: 'w', category: 'consonant', label: 'w' },
  { symbol: 'tʃ', category: 'consonant', label: 'ch' },
  { symbol: 'dʒ', category: 'consonant', label: 'j' },
];

const EN_MARKS: PhonemeDef[] = [
  { symbol: 'ˈ', category: 'mark', label: 'Primary stress' },
  { symbol: 'ˌ', category: 'mark', label: 'Secondary stress' },
  { symbol: '.', category: 'mark', label: 'Syllable break' },
  { symbol: ' ', category: 'mark', label: 'Space' },
];

const ALL_EN_PHONEMES: PhonemeDef[] = [
  ...EN_VOWELS,
  ...EN_CONSONANTS,
  ...EN_MARKS,
];

// ── Keypad layout ───────────────────────────────────────────────

const EN_KEYPAD = [
  {
    category: 'Vowels',
    phonemes: EN_VOWELS.map(p => p.symbol),
  },
  {
    category: 'Consonants',
    phonemes: EN_CONSONANTS.map(p => p.symbol),
  },
  {
    category: 'Marks & Stress',
    phonemes: EN_MARKS.map(p => p.symbol),
  },
];

// ── IPA judge ───────────────────────────────────────────────────

function enJudge(input: string, target: string) {
  return phonemeJudge(input, target, tokenizeIpa);
}

// ── Profile ─────────────────────────────────────────────────────

export const englishProfile: LanguageProfile = {
  code: 'en',
  displayName: 'English',
  notationName: 'IPA',
  phonemes: ALL_EN_PHONEMES,
  keypadLayout: EN_KEYPAD,
  ttsLang: 'en-US',
  parseNotation: tokenizeIpa,
  judge: enJudge,
  soundFeatures: ['stress', 'weak_form', 'linking', 'vowel_reduction', 'elision', 'assimilation'],
  wordBank,
};
