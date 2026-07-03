/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import { englishProfile } from '../../profiles/en';
import {
  buildMinimalPairQuestions,
  buildMinimalPairResult,
  createMinimalPairAnswer,
  createMinimalPairSession,
  getMinimalPairAudioText,
  getMinimalPairSets,
  hasMinimalPairs,
} from '../minimalPairs';

describe('minimalPairs utilities', () => {
  it('filters minimal-pair sets by target language and topic', () => {
    expect(hasMinimalPairs(englishProfile, 'ɪ')).toBe(true);
    const sets = getMinimalPairSets(englishProfile, 'ɪ');
    expect(sets.length).toBeGreaterThan(0);
    expect(sets.every(set => (
      set.l2 === 'en'
      && (set.targetPhoneme === 'ɪ' || set.contrastPhoneme === 'ɪ')
    ))).toBe(true);
  });

  it('builds questions up to the requested count and cycles when needed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const pair = getMinimalPairSets(englishProfile, 'ɪ')[0];
    const questions = buildMinimalPairQuestions([pair], pair.options.length + 1);

    expect(questions).toHaveLength(pair.options.length + 1);
    expect(new Set(questions.map(question => question.pairSetId))).toEqual(new Set([pair.id]));
    expect(questions.at(-1)?.id.endsWith(':1')).toBe(true);
  });

  it('creates answers and summarizes minimal-pair results', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const session = createMinimalPairSession({
      profile: englishProfile,
      l1: 'zh',
      topic: 'ɪ',
      questionCount: 2,
    });
    const correct = createMinimalPairAnswer(session.questions[0], session.questions[0].prompt.id);
    const incorrect = createMinimalPairAnswer(session.questions[1], session.questions[1].options
      .find(option => option.id !== session.questions[1].prompt.id)?.id ?? 'missing');

    const result = buildMinimalPairResult({
      ...session,
      completedAt: '2026-07-03T10:00:00.000Z',
      answers: [correct, incorrect],
    });

    expect(result).toMatchObject({
      l1: 'zh',
      l2: 'en',
      topic: 'ɪ',
      total: 2,
      correct: 1,
      accuracy: 50,
    });
    expect(result.mistakes).toEqual([incorrect]);
  });

  it('uses audioText when present and display text otherwise', () => {
    expect(getMinimalPairAudioText({ id: 'a', display: 'ship', pronunciation: 'ʃɪp' }))
      .toBe('ship');
    expect(getMinimalPairAudioText({
      id: 'b',
      display: '行',
      pronunciation: 'xing2',
      audioText: 'xíng',
    })).toBe('xíng');
  });
});
