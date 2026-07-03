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
import type { Recommendation } from '../../types';
import { SmartRecommend } from '../SmartRecommend';

const recommendation: Recommendation = {
  phoneme: 'ɪ',
  label: 'ih',
  category: 'vowel',
  score: 1,
  source: 'personalized',
  attempts: 2,
  accuracy: 0,
  l1Level: 5,
  wordCount: 10,
  reasons: [
    { kind: 'history', text: '历史正确率偏低: 0% (2 次)' },
    { kind: 'l1', text: 'L1 难度 5/5' },
  ],
};

describe('SmartRecommend', () => {
  it('renders empty state when no recommendations exist', () => {
    render(
      <SmartRecommend
        l1={null}
        l2="en"
        profile={englishProfile}
        recommendations={[]}
        masteryRecordCount={0}
        onSelectPhoneme={vi.fn()}
      />,
    );

    expect(screen.getByText('English 本地推荐')).toBeInTheDocument();
    expect(screen.getByText(/完成一次拼写或听辨训练后/)).toBeInTheDocument();
  });

  it('calls select, inspect, and clear callbacks from recommendation controls', async () => {
    const user = userEvent.setup();
    const onSelectPhoneme = vi.fn();
    const onInspectPhoneme = vi.fn();
    const onClearPersonalization = vi.fn();

    render(
      <SmartRecommend
        l1="zh"
        l2="en"
        profile={englishProfile}
        recommendations={[recommendation]}
        masteryRecordCount={3}
        onSelectPhoneme={onSelectPhoneme}
        onInspectPhoneme={onInspectPhoneme}
        onClearPersonalization={onClearPersonalization}
      />,
    );

    await user.click(screen.getByText('/ɪ/'));
    await user.click(screen.getByRole('button', { name: '查看详情' }));
    await user.click(screen.getByRole('button', { name: '清除个性化数据' }));

    expect(onSelectPhoneme).toHaveBeenCalledWith('ɪ');
    expect(onInspectPhoneme).toHaveBeenCalledWith('ɪ');
    expect(onClearPersonalization).toHaveBeenCalledTimes(1);
  });
});
