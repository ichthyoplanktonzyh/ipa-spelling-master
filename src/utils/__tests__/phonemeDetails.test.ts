/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { englishProfile } from '../../profiles/en';
import { chineseProfile } from '../../profiles/zh';
import { buildPhonemeDetail } from '../phonemeDetails';

describe('buildPhonemeDetail', () => {
  it('returns profile metadata, examples, minimal pairs, and L1 difficulty when available', () => {
    const detail = buildPhonemeDetail({
      profile: englishProfile,
      l1: 'zh',
      phoneme: 'ɪ',
      difficulty: 'basic',
      exampleLimit: 3,
    });

    expect(detail).toMatchObject({
      symbol: 'ɪ',
      label: 'ih',
      category: 'vowel',
      profileCode: 'en',
      notationName: 'IPA',
      difficulty: { phoneme: 'ɪ', level: 5 },
    });
    expect(detail?.examples.length).toBeLessThanOrEqual(3);
    expect(detail?.exampleCount).toBeGreaterThan(0);
    expect(detail?.minimalPairs.length).toBeGreaterThan(0);
  });

  it('degrades without L1 difficulty while keeping examples', () => {
    const detail = buildPhonemeDetail({
      profile: chineseProfile,
      l1: null,
      phoneme: '3',
      exampleLimit: 2,
    });

    expect(detail?.difficulty).toBeUndefined();
    expect(detail?.examples.length).toBeLessThanOrEqual(2);
    expect(detail?.exampleCount).toBeGreaterThan(0);
  });

  it('returns null for unknown phonemes', () => {
    expect(buildPhonemeDetail({
      profile: englishProfile,
      l1: 'zh',
      phoneme: 'not-a-phoneme',
    })).toBeNull();
  });
});
