/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { getAllProfiles, getProfile, SUPPORTED_L1 } from '..';
import { englishProfile } from '../en';
import { chineseProfile } from '../zh';

describe('profile registry', () => {
  it('registers English and Chinese profiles', () => {
    expect(getProfile('en')).toBe(englishProfile);
    expect(getProfile('zh')).toBe(chineseProfile);
    expect(getAllProfiles().map(profile => profile.code)).toEqual(['en', 'zh']);
    expect(SUPPORTED_L1.map(l1 => l1.code)).toEqual(expect.arrayContaining(['zh', 'en']));
    expect(new Set(SUPPORTED_L1.map(l1 => l1.code)).size).toBe(SUPPORTED_L1.length);
  });
});

describe('profile judge adapters', () => {
  it('judges English IPA with notation artifacts ignored', () => {
    expect(englishProfile.judge('/tʃeɪn/', 'ˈtʃeɪn')).toEqual({
      correct: true,
      nearMatch: false,
      diffs: [],
    });

    expect(englishProfile.judge('ʃip', 'ʃɪp')).toMatchObject({
      correct: false,
      nearMatch: true,
      diffs: [{ position: 1, expected: 'ɪ', actual: 'i' }],
    });
  });

  it('judges Chinese Pinyin tone-number and diacritic forms equivalently', () => {
    expect(chineseProfile.judge('nǐ hǎo', 'ni3 hao3')).toEqual({
      correct: true,
      nearMatch: false,
      diffs: [],
    });

    expect(chineseProfile.judge('ni2 hao3', 'ni3 hao3')).toMatchObject({
      correct: false,
      nearMatch: true,
      diffs: [{ position: 2, expected: '3', actual: '2' }],
    });
  });
});
