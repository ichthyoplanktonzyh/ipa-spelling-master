/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { englishProfile } from '../../profiles/en';
import type { Recommendation, SessionResult, TrainingAnswer } from '../../types';
import { SessionResultView } from '../SessionResultView';

const answer: TrainingAnswer = {
  itemId: 'thin::θɪn',
  item: {
    display: 'thin',
    pronunciation: 'θɪn',
    frequencyTier: 'basic',
    definition: 'not thick',
  },
  expected: 'θɪn',
  actual: 'sɪn',
  judgeResult: {
    correct: false,
    nearMatch: true,
    diffs: [{ position: 0, expected: 'θ', actual: 's' }],
  },
  submittedAt: '2026-07-03T10:00:00.000Z',
};

const result: SessionResult = {
  id: 'result-1',
  sessionId: 'session-1',
  createdAt: '2026-07-03T09:55:00.000Z',
  completedAt: '2026-07-03T10:00:00.000Z',
  config: {
    l2: 'en',
    mode: 'spelling',
    difficulty: 'basic',
    topic: null,
    wordCount: 1,
  },
  total: 1,
  answered: 1,
  correct: 0,
  nearMatch: 1,
  incorrect: 0,
  accuracy: 0,
  answers: [answer],
  mistakes: [answer],
};

const recommendation: Recommendation = {
  phoneme: 'θ',
  label: 'th',
  category: 'consonant',
  score: 1,
  source: 'personalized',
  attempts: 1,
  accuracy: 0,
  l1Level: 4,
  wordCount: 5,
  reasons: [{ kind: 'history', text: '历史正确率偏低: 0% (1 次)' }],
};

describe('SessionResultView', () => {
  it('renders score, mistakes, next recommendation, and action callbacks', async () => {
    const user = userEvent.setup();
    const onPracticeAgain = vi.fn();
    const onNewWordSet = vi.fn();
    const onClearHistory = vi.fn();
    const onInspectPhoneme = vi.fn();
    const onSelectRecommendation = vi.fn();

    render(
      <SessionResultView
        result={result}
        recentResults={[result]}
        profile={englishProfile}
        onPracticeAgain={onPracticeAgain}
        onNewWordSet={onNewWordSet}
        onClearHistory={onClearHistory}
        onInspectPhoneme={onInspectPhoneme}
        nextRecommendations={[recommendation]}
        onSelectRecommendation={onSelectRecommendation}
      />,
    );

    expect(screen.getAllByText('0/1 exact')).toHaveLength(2);
    expect(screen.getByText('thin')).toBeInTheDocument();
    expect(screen.getByText('not thick')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Practice Again/ }));
    await user.click(screen.getByRole('button', { name: /New Set/ }));
    await user.click(screen.getByRole('button', { name: /^Practice$/ }));
    await user.click(screen.getByRole('button', { name: 'θ' }));
    await user.click(screen.getByRole('button', { name: /Clear/ }));

    expect(onPracticeAgain).toHaveBeenCalledTimes(1);
    expect(onNewWordSet).toHaveBeenCalledTimes(1);
    expect(onSelectRecommendation).toHaveBeenCalledWith('θ');
    expect(onInspectPhoneme).toHaveBeenCalledWith('θ');
    expect(onClearHistory).toHaveBeenCalledTimes(1);
  });
});
