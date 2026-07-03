/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { englishProfile } from '../../profiles/en';
import {
  getHardFeatures,
  getRecommendedPhonemes,
  getTopHardPhonemes,
  hasDifficultyMap,
} from '../difficultyMap';

describe('difficulty map queries', () => {
  it('returns hard phonemes ordered by L1 difficulty', () => {
    const top = getTopHardPhonemes('zh', 'en', englishProfile, 3);
    expect(top.map(item => [item.phoneme, item.level])).toEqual([
      ['ɪ', 5],
      ['v', 4],
      ['θ', 4],
    ]);
  });

  it('falls back to level 0 phonemes without a usable L1 mapping', () => {
    const fallback = getRecommendedPhonemes(null, 'en', englishProfile);
    expect(fallback).toHaveLength(englishProfile.phonemes.length);
    expect(fallback.every(item => item.level === 0)).toBe(true);
    expect(getTopHardPhonemes('en', 'en', englishProfile)).toEqual([]);
  });

  it('reports registered maps and hard features', () => {
    expect(hasDifficultyMap('zh', 'en')).toBe(true);
    expect(hasDifficultyMap('fr', 'en')).toBe(false);
    expect(getHardFeatures('zh', 'en')[0]).toMatchObject({
      feature: 'weak_form',
      level: 5,
    });
    expect(getHardFeatures(null, 'en')).toEqual([]);
  });
});
