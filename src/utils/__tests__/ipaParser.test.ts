/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { getUniquePhonemes, tokenizeIpa } from '../ipaParser';

describe('tokenizeIpa', () => {
  it.each([
    ['ˈtʃeɪn', ['tʃ', 'eɪ', 'n']],
    ['dʒoʊ', ['dʒ', 'oʊ']],
    ['aɪ.aʊ ɔɪ', ['aɪ', 'aʊ', 'ɔɪ']],
  ])('matches multi-character phonemes greedily for %s', (input, expected) => {
    expect(tokenizeIpa(input)).toEqual(expected);
  });

  it('removes stress, length, syllable, and parenthesis notation artifacts', () => {
    expect(tokenizeIpa('/(ˌfɑː.ðɚ)/')).toEqual(['f', 'ɑ', 'ð', 'ɚ']);
  });

  it('normalizes common IPA variants to keyboard symbols', () => {
    expect(tokenizeIpa('eoɜɒ')).toEqual(['eɪ', 'oʊ', 'ɚ', 'ɑ']);
  });

  it('skips unknown characters without breaking known tokens', () => {
    expect(tokenizeIpa('xθ?z')).toEqual(['θ', 'z']);
  });

  it('returns unique phonemes in first-seen order', () => {
    expect(getUniquePhonemes('bɪtbɪt')).toEqual(['b', 'ɪ', 't']);
  });
});
