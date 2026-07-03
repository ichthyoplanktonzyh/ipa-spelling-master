/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { chineseProfile } from '../../profiles/zh';
import { TrainingView } from '../TrainingView';

describe('TrainingView', () => {
  it('renders current item, uses display notation, and calls navigation actions', async () => {
    const user = userEvent.setup();
    const onPlayAudio = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onNewWordSet = vi.fn();

    render(
      <TrainingView
        items={[{
          display: '你好',
          pronunciation: 'ni3 hao3',
          pronunciationAlt: 'nǐ hǎo',
          frequencyTier: 'basic',
        }]}
        currentIndex={0}
        profile={chineseProfile}
        isPlaying={false}
        onPlayAudio={onPlayAudio}
        onPrev={onPrev}
        onNext={onNext}
        onNewWordSet={onNewWordSet}
      />,
    );

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '播放发音 (Space)' }));
    await user.click(screen.getByRole('button', { name: /Complete Session/ }));
    await user.click(screen.getByRole('button', { name: /New Word Set/ }));

    expect(onPlayAudio).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNewWordSet).toHaveBeenCalledTimes(1);
  });
});
