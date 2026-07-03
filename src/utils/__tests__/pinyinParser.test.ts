/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import {
  getUniquePinyinPhonemes,
  parsePinyin,
  parsePinyinSyllables,
  syllablesToString,
} from '../pinyinParser';

describe('parsePinyin', () => {
  it('parses tone-number syllables into initial, final, and tone tokens', () => {
    expect(parsePinyin('ni3 hao3')).toEqual(['n', 'i', '3', 'h', 'ao', '3']);
  });

  it('converts tone diacritics and ü to canonical internal symbols', () => {
    expect(parsePinyin('nǚ péng yǒu')).toEqual([
      'n', 'v', '3',
      'p', 'eng', '2',
      'iu', '3',
    ]);
  });

  it.each([
    ['qu4', ['q', 'v', '4']],
    ['xue2', ['x', 've', '2']],
    ['yuan2', ['van', '2']],
    ['yue4', ['ve', '4']],
    ['er2', ['er', '2']],
    ['ma5', ['m', 'a', '0']],
  ])('normalizes pinyin edge case %s', (input, expected) => {
    expect(parsePinyin(input)).toEqual(expected);
  });

  it('round-trips parsed syllables to tone-number form', () => {
    const syllables = parsePinyinSyllables('mā ma5');
    expect(syllables).toEqual([
      { initial: 'm', final: 'a', tone: 1 },
      { initial: 'm', final: 'a', tone: 0 },
    ]);
    expect(syllablesToString(syllables)).toBe('ma1 ma5');
  });

  it('returns unique pinyin units in first-seen order', () => {
    expect(getUniquePinyinPhonemes('ni3 nin2')).toEqual(['n', 'i', '3', 'in', '2']);
  });
});
