/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { phonemeJudge, stringJudge } from '../judge';

const split = (value: string): string[] => value.split(/\s+/).filter(Boolean);

describe('phonemeJudge', () => {
  it('accepts exact matches after trimming wrapper slashes', () => {
    expect(phonemeJudge('/p ɪ n/', 'p ɪ n', split)).toEqual({
      correct: true,
      nearMatch: false,
      diffs: [],
    });
  });

  it('marks one same-length phoneme difference as nearMatch', () => {
    expect(phonemeJudge('s ɪ p', 'ʃ ɪ p', split)).toEqual({
      correct: false,
      nearMatch: true,
      diffs: [{ position: 0, expected: 'ʃ', actual: 's' }],
    });
  });

  it('marks multiple same-length differences as incorrect', () => {
    expect(phonemeJudge('s i p', 'ʃ ɪ p', split)).toMatchObject({
      correct: false,
      nearMatch: false,
      diffs: [
        { position: 0, expected: 'ʃ', actual: 's' },
        { position: 1, expected: 'ɪ', actual: 'i' },
      ],
    });
  });

  it('does not mark length differences as nearMatch', () => {
    expect(phonemeJudge('p ɪ', 'p ɪ n', split)).toEqual({
      correct: false,
      nearMatch: false,
      diffs: [{ position: 2, expected: 'n', actual: '' }],
    });
  });
});

describe('stringJudge', () => {
  it('compares cleaned raw strings exactly', () => {
    expect(stringJudge('/ni3 hao3/', 'ni3 hao3')).toEqual({
      correct: true,
      nearMatch: false,
      diffs: [],
    });
  });

  it('returns a single whole-string diff for mismatch', () => {
    expect(stringJudge('ni2 hao3', 'ni3 hao3')).toEqual({
      correct: false,
      nearMatch: false,
      diffs: [{ position: 0, expected: 'ni3 hao3', actual: 'ni2 hao3' }],
    });
  });
});
