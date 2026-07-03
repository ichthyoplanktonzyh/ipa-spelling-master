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
import { PhoneticKeypad } from '../PhoneticKeypad';

describe('PhoneticKeypad', () => {
  it('renders Pinyin display labels while inserting canonical symbols', async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(<PhoneticKeypad profile={chineseProfile} onInsert={onInsert} />);

    await user.click(screen.getByRole('button', { name: 'ü' }));
    await user.click(screen.getByRole('button', { name: '5' }));

    expect(onInsert).toHaveBeenNthCalledWith(1, 'v');
    expect(onInsert).toHaveBeenNthCalledWith(2, '5');
  });
});
