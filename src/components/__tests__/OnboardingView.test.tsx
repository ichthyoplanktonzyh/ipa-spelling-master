/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OnboardingView } from '../OnboardingView';

describe('OnboardingView', () => {
  it('requires a target language and allows starting without L1', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingView currentL1={null} currentL2={null} onComplete={onComplete} />);

    const start = screen.getByRole('button', { name: /开始训练/ });
    expect(start).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /English IPA/ }));
    expect(screen.getByRole('button', { name: 'English' })).toBeDisabled();

    await user.click(start);
    expect(onComplete).toHaveBeenCalledWith(null, 'en');
  });

  it('submits selected L1 when it differs from L2', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<OnboardingView currentL1={null} currentL2={null} onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: /English IPA/ }));
    await user.click(screen.getByRole('button', { name: '中文' }));
    await user.click(screen.getByRole('button', { name: /^开始训练$/ }));

    expect(onComplete).toHaveBeenCalledWith('zh', 'en');
  });
});
