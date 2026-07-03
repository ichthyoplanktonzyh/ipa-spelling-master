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
import { PhonemeDiffView } from '../PhonemeDiffView';

describe('PhonemeDiffView', () => {
  it('renders visible diffs, truncates overflow, and opens phoneme detail', async () => {
    const user = userEvent.setup();
    const onInspectPhoneme = vi.fn();

    render(
      <PhonemeDiffView
        profile={englishProfile}
        limit={2}
        onInspectPhoneme={onInspectPhoneme}
        diffs={[
          { position: 0, expected: 'θ', actual: 's' },
          { position: 1, expected: 'ɪ', actual: '' },
          { position: 2, expected: 'p', actual: 'b' },
        ]}
      />,
    );

    expect(screen.getByText('Difference Map')).toBeInTheDocument();
    expect(screen.getByText('missing')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'θ' }));
    expect(onInspectPhoneme).toHaveBeenCalledWith('θ');
  });
});
