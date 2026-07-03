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
import type { MinimalPairSession } from '../../types';
import { MinimalPairView } from '../MinimalPairView';

const session: MinimalPairSession = {
  id: 'minimal-1',
  createdAt: '2026-07-03T10:00:00.000Z',
  l2: 'en',
  topic: 'ɪ',
  questions: [
    {
      id: 'q1',
      pairSetId: 'ship-sheep',
      targetPhoneme: 'ɪ',
      contrastPhoneme: 'i',
      prompt: { id: 'ship', display: 'ship', pronunciation: 'ʃɪp' },
      options: [
        { id: 'ship', display: 'ship', pronunciation: 'ʃɪp' },
        { id: 'sheep', display: 'sheep', pronunciation: 'ʃip' },
      ],
    },
  ],
  answers: [],
};

describe('MinimalPairView', () => {
  it('renders empty material fallback', async () => {
    const user = userEvent.setup();
    const onClearTopic = vi.fn();

    render(
      <MinimalPairView
        session={{ ...session, questions: [] }}
        result={null}
        currentIndex={0}
        selectedOptionId={null}
        profile={englishProfile}
        isPlaying={false}
        onPlayPrompt={vi.fn()}
        onSelectOption={vi.fn()}
        onNext={vi.fn()}
        onNewSet={vi.fn()}
        onClearTopic={onClearTopic}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'All Pair Topics' }));
    expect(onClearTopic).toHaveBeenCalledTimes(1);
  });

  it('plays prompts, selects options, and enables next only after an answer', async () => {
    const user = userEvent.setup();
    const onPlayPrompt = vi.fn();
    const onSelectOption = vi.fn();
    const onNext = vi.fn();

    const { rerender } = render(
      <MinimalPairView
        session={session}
        result={null}
        currentIndex={0}
        selectedOptionId={null}
        profile={englishProfile}
        isPlaying={false}
        onPlayPrompt={onPlayPrompt}
        onSelectOption={onSelectOption}
        onNext={onNext}
        onNewSet={vi.fn()}
        onClearTopic={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Complete Session/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '播放目标发音' }));
    await user.click(screen.getByRole('button', { name: /sheep/ }));

    expect(onPlayPrompt).toHaveBeenCalledWith(session.questions[0].prompt);
    expect(onSelectOption).toHaveBeenCalledWith('sheep');

    rerender(
      <MinimalPairView
        session={session}
        result={null}
        currentIndex={0}
        selectedOptionId="ship"
        profile={englishProfile}
        isPlaying={false}
        onPlayPrompt={onPlayPrompt}
        onSelectOption={onSelectOption}
        onNext={onNext}
        onNewSet={vi.fn()}
        onClearTopic={vi.fn()}
      />,
    );

    expect(screen.getByText('Correct')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Complete Session/ }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
