/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Displays phoneme-level differences from JudgeResult.diffs.
 */

import React from 'react';
import type { LanguageProfile, PhonemeDiff } from '../types';

interface PhonemeDiffViewProps {
  diffs: PhonemeDiff[];
  profile: LanguageProfile;
  tone?: 'amber' | 'red';
  limit?: number;
}

function renderSymbol(symbol: string): string {
  return symbol || 'missing';
}

export const PhonemeDiffView: React.FC<PhonemeDiffViewProps> = ({
  diffs,
  profile,
  tone = 'red',
  limit = 6,
}) => {
  if (diffs.length === 0) return null;

  const visibleDiffs = diffs.slice(0, limit);
  const hiddenCount = diffs.length - visibleDiffs.length;
  const isIpa = profile.notationName !== 'Pinyin';
  const toneClasses = tone === 'amber'
    ? 'bg-amber-50 border-amber-100 text-amber-900'
    : 'bg-red-50 border-red-100 text-red-900';

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          Difference Map
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          {diffs.length} {diffs.length === 1 ? 'position' : 'positions'}
        </p>
      </div>
      <div className="mt-3 grid gap-2">
        {visibleDiffs.map(diff => (
          <div
            key={`${diff.position}-${diff.expected}-${diff.actual}`}
            className="grid grid-cols-[64px_1fr_1fr] items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              #{diff.position + 1}
            </span>
            <span>
              <span className="mr-1 text-[10px] font-bold uppercase tracking-widest opacity-50">
                Expected
              </span>
              <span className={`${isIpa ? 'ipa-text' : ''} font-bold`}>
                {renderSymbol(diff.expected)}
              </span>
            </span>
            <span>
              <span className="mr-1 text-[10px] font-bold uppercase tracking-widest opacity-50">
                Yours
              </span>
              <span className={`${isIpa ? 'ipa-text' : ''} font-bold`}>
                {renderSymbol(diff.actual)}
              </span>
            </span>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
          +{hiddenCount} more
        </p>
      )}
    </div>
  );
};
