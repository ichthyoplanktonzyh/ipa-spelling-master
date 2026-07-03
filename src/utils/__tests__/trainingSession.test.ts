/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import type { LanguageProfile, TrainingItem } from '../../types';
import {
  appendTrainingAnswer,
  buildSessionResult,
  createFreshSession,
  createTrainingAnswer,
  getTrainingItemId,
  pickItems,
} from '../trainingSession';

const item = (display: string, pronunciation: string): TrainingItem => ({
  display,
  pronunciation,
  frequencyTier: 'basic',
});

const profile: LanguageProfile = {
  code: 'fx',
  displayName: 'Fixture',
  notationName: 'IPA',
  phonemes: [
    { symbol: 'a', category: 'vowel', label: 'a' },
    { symbol: 'b', category: 'consonant', label: 'b' },
  ],
  keypadLayout: [],
  ttsLang: 'en-US',
  parseNotation: value => value.split(/\s+/).filter(Boolean),
  judge: () => ({ correct: true, nearMatch: false, diffs: [] }),
  soundFeatures: [],
  wordBank: {
    basic: [item('alpha', 'a'), item('beta', 'b'), item('both', 'a b')],
    intermediate: [],
    advanced: [],
  },
};

describe('trainingSession utilities', () => {
  it('builds stable item ids from display and pronunciation', () => {
    expect(getTrainingItemId(item('read', 'r ɛ d'))).toBe('read::r ɛ d');
  });

  it('picks items by phoneme and difficulty without exceeding the pool', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const picked = pickItems(profile, 'basic', 'a', 10);
    expect(picked.map(entry => entry.display).sort()).toEqual(['alpha', 'both']);
  });

  it('deduplicates replacement answers and summarizes exact/near/incorrect scoring', () => {
    const sessionState = createFreshSession({
      profile,
      l1: null,
      difficulty: 'basic',
      phoneme: null,
      wordCount: 3,
      mode: 'spelling',
    }, profile.wordBank.basic);

    const exact = createTrainingAnswer(profile.wordBank.basic[0], 'a', {
      correct: true,
      nearMatch: false,
      diffs: [],
    });
    const near = createTrainingAnswer(profile.wordBank.basic[1], 'p', {
      correct: false,
      nearMatch: true,
      diffs: [{ position: 0, expected: 'b', actual: 'p' }],
    });
    const replacementIncorrect = createTrainingAnswer(profile.wordBank.basic[1], '', {
      correct: false,
      nearMatch: false,
      diffs: [{ position: 0, expected: 'b', actual: '' }],
    });

    const answered = appendTrainingAnswer(
      appendTrainingAnswer(
        appendTrainingAnswer(sessionState.session, exact),
        near,
      ),
      replacementIncorrect,
    );
    const result = buildSessionResult({ ...answered, status: 'completed' });

    expect(answered.answers).toHaveLength(2);
    expect(result).toMatchObject({
      total: 3,
      answered: 2,
      correct: 1,
      nearMatch: 0,
      incorrect: 1,
      accuracy: 33,
    });
    expect(result.mistakes).toHaveLength(1);
  });
});
