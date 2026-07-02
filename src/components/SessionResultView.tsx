/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Session completion panel with score, mistakes, and local history.
 */

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  History,
  RefreshCw,
  RotateCcw,
  Trash2,
  Trophy,
} from 'lucide-react';
import type { LanguageProfile, SessionResult } from '../types';
import { PhonemeDiffView } from './PhonemeDiffView';

interface SessionResultViewProps {
  result: SessionResult;
  recentResults: SessionResult[];
  profile: LanguageProfile;
  onPracticeAgain: () => void;
  onNewWordSet: () => void;
  onClearHistory: () => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatTopic(result: SessionResult, profile: LanguageProfile): string {
  const topic = result.config.topic;
  if (!topic) return 'All topics';

  return profile.notationName === 'Pinyin' ? topic : `/${topic}/`;
}

function formatMode(mode: SessionResult['config']['mode']): string {
  return mode === 'spelling' ? 'Spelling' : 'Listen';
}

function formatAnswer(result: SessionResult, profile: LanguageProfile, value: string): string {
  if (profile.notationName === 'Pinyin') return value;
  return `/${value}/`;
}

export const SessionResultView: React.FC<SessionResultViewProps> = ({
  result,
  recentResults,
  profile,
  onPracticeAgain,
  onNewWordSet,
  onClearHistory,
}) => {
  const isSpelling = result.config.mode === 'spelling';
  const isIpa = profile.notationName !== 'Pinyin';
  const reviewItems = recentResults.slice(0, 5);

  return (
    <div className="w-full max-w-5xl space-y-8">
      <section className="flex flex-col gap-6 rounded-[40px] bg-white p-10 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-indigo-600">
              <Trophy className="w-7 h-7" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                Session Complete
              </p>
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              {isSpelling ? `${result.correct}/${result.total} exact` : `${result.total} words reviewed`}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {formatMode(result.config.mode)} • {result.config.difficulty} • {formatTopic(result, profile)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onPracticeAgain}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
            <button
              onClick={onNewWordSet}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              New Set
            </button>
          </div>
        </div>

        {isSpelling && (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accuracy</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{result.accuracy ?? 0}%</p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Exact</p>
              <p className="mt-2 text-3xl font-bold text-green-700">{result.correct}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Near</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{result.nearMatch}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Missed</p>
              <p className="mt-2 text-3xl font-bold text-red-700">{result.incorrect}</p>
            </div>
          </div>
        )}
      </section>

      {isSpelling && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.mistakes.length === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Review
              </h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {result.mistakes.length} to revisit
            </p>
          </div>

          {result.mistakes.length === 0 ? (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-sm font-medium text-green-800">
              Every submitted answer was exact.
            </div>
          ) : (
            <div className="grid gap-4">
              {result.mistakes.map(answer => (
                <article
                  key={`${answer.itemId}-${answer.submittedAt}`}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">{answer.item.display}</p>
                      {answer.item.definition && (
                        <p className="mt-1 text-xs font-medium text-slate-400">{answer.item.definition}</p>
                      )}
                    </div>
                    <div className="grid gap-1 text-right text-xs">
                      <span className="font-bold uppercase tracking-widest text-slate-300">Expected</span>
                      <span className={`${isIpa ? 'ipa-text' : ''} font-bold text-slate-700`}>
                        {formatAnswer(result, profile, answer.expected)}
                      </span>
                      <span className="mt-2 font-bold uppercase tracking-widest text-slate-300">Yours</span>
                      <span className={`${isIpa ? 'ipa-text' : ''} font-bold text-slate-700`}>
                        {formatAnswer(result, profile, answer.actual || 'missing')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <PhonemeDiffView
                      diffs={answer.judgeResult.diffs}
                      profile={profile}
                      tone={answer.judgeResult.nearMatch ? 'amber' : 'red'}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Recent Sessions
            </h3>
          </div>
          {reviewItems.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {reviewItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm font-medium text-slate-400">
            No saved sessions yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {reviewItems.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm shadow-sm"
              >
                <div>
                  <p className="font-bold text-slate-700">
                    {formatDate(item.completedAt)} • {formatMode(item.config.mode)} • {item.config.difficulty}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {item.config.topic ? formatTopic(item, profile) : 'All topics'}
                  </p>
                </div>
                <p className="text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                  {item.accuracy === null ? `${item.total} reviewed` : `${item.correct}/${item.total} exact`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
