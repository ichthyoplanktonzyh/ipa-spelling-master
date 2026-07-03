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
import { buildPhonemeDetail } from '../../utils/phonemeDetails';
import { PhonemeDetailPanel } from '../PhonemeDetailPanel';

describe('PhonemeDetailPanel', () => {
  it('renders nothing when no detail is selected', () => {
    const { container } = render(
      <PhonemeDetailPanel
        detail={null}
        profile={englishProfile}
        l1Label={null}
        onClose={vi.fn()}
        onStartSpelling={vi.fn()}
        onStartMinimalPairs={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders detail content and calls close/practice/listen actions', async () => {
    const user = userEvent.setup();
    const detail = buildPhonemeDetail({
      profile: englishProfile,
      l1: 'zh',
      phoneme: 'ɪ',
      exampleLimit: 1,
    });
    const onClose = vi.fn();
    const onStartSpelling = vi.fn();
    const onStartMinimalPairs = vi.fn();

    render(
      <PhonemeDetailPanel
        detail={detail}
        profile={englishProfile}
        l1Label="中文"
        onClose={onClose}
        onStartSpelling={onStartSpelling}
        onStartMinimalPairs={onStartMinimalPairs}
      />,
    );

    expect(screen.getByText('/ɪ/')).toBeInTheDocument();
    expect(screen.getByText('L1 Insight')).toBeInTheDocument();
    expect(screen.getByText(/Mandarin has no lax\/tense vowel contrast/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Practice$/ }));
    await user.click(screen.getByRole('button', { name: /^Listen$/ }));
    await user.click(screen.getByRole('button', { name: 'Close phoneme detail' }));

    expect(onStartSpelling).toHaveBeenCalledWith('ɪ');
    expect(onStartMinimalPairs).toHaveBeenCalledWith('ɪ');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
