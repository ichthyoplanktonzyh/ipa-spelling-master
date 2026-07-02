/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Training session utilities.
 * Extracts word-picking and session-reset logic from App.tsx
 * so the top-level component stays focused on state orchestration.
 */

import type {
  Difficulty,
  JudgeResult,
  LanguageProfile,
  SessionResult,
  TrainingAnswer,
  TrainingFeedback,
  TrainingItem,
  TrainingMode,
  TrainingSession,
} from '../types';
import { getItemsByPhoneme } from './phonemeGroups';

// ── Training session config ────────────────────────────────────────

/** Configuration for a training session. */
export interface TrainingConfig {
  /** Target language profile. */
  profile: LanguageProfile;
  /** Optional learner native language, used only as session metadata. */
  l1: string | null;
  /** Difficulty tier. */
  difficulty: Difficulty;
  /** Selected phoneme filter (null = all phonemes). */
  phoneme: string | null;
  /** Number of items in this session. */
  wordCount: number;
  /** Training mode: 'spelling' = input + judge, 'training' = browse + listen. */
  mode: TrainingMode;
}

/** State snapshot of an in-progress training session. */
export interface SessionState {
  session: TrainingSession;
  items: TrainingItem[];
  currentIndex: number;
  userInput: string;
  feedback: TrainingFeedback;
}

/** Create a fresh session state. */
export function createFreshSession(config: TrainingConfig, items: TrainingItem[]): SessionState {
  return {
    session: createTrainingSession(config, items),
    items,
    currentIndex: 0,
    userInput: '',
    feedback: 'neutral',
  };
}

export function getTrainingItemId(item: TrainingItem): string {
  return `${item.display}::${item.pronunciation}`;
}

export function createTrainingAnswer(
  item: TrainingItem,
  actual: string,
  judgeResult: JudgeResult,
): TrainingAnswer {
  return {
    itemId: getTrainingItemId(item),
    item,
    expected: item.pronunciation,
    actual,
    judgeResult,
    submittedAt: new Date().toISOString(),
  };
}

export function appendTrainingAnswer(
  session: TrainingSession,
  answer: TrainingAnswer,
): TrainingSession {
  const answers = session.answers.filter(existing => existing.itemId !== answer.itemId);
  return {
    ...session,
    answers: [...answers, answer],
  };
}

export function completeTrainingSession(session: TrainingSession): TrainingSession {
  return {
    ...session,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
}

export function buildSessionResult(session: TrainingSession): SessionResult {
  const completedAt = session.completedAt ?? new Date().toISOString();
  const correct = session.answers.filter(answer => answer.judgeResult.correct).length;
  const nearMatch = session.answers.filter(answer => answer.judgeResult.nearMatch).length;
  const incorrect = session.answers.filter(answer => (
    !answer.judgeResult.correct && !answer.judgeResult.nearMatch
  )).length;
  const accuracy = session.config.mode === 'spelling' && session.items.length > 0
    ? Math.round((correct / session.items.length) * 100)
    : null;

  return {
    id: `result-${session.id}`,
    sessionId: session.id,
    createdAt: session.createdAt,
    completedAt,
    config: session.config,
    total: session.items.length,
    answered: session.answers.length,
    correct,
    nearMatch,
    incorrect,
    accuracy,
    answers: session.answers,
    mistakes: session.answers.filter(answer => !answer.judgeResult.correct),
  };
}

function createTrainingSession(config: TrainingConfig, items: TrainingItem[]): TrainingSession {
  const createdAt = new Date().toISOString();

  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    status: 'in_progress',
    config: {
      l1: config.l1 ?? undefined,
      l2: config.profile.code,
      mode: config.mode,
      difficulty: config.difficulty,
      topic: config.phoneme,
      wordCount: config.wordCount,
    },
    items,
    answers: [],
  };
}

// ── Word picking ───────────────────────────────────────────────────

/**
 * Pick training items for a session based on config.
 *
 * If a phoneme filter is active, only items containing that phoneme
 * (within the chosen difficulty) are included. Items are shuffled
 * randomly.
 */
export function pickItems(
  profile: LanguageProfile,
  difficulty: Difficulty,
  phoneme: string | null,
  count: number,
): TrainingItem[] {
  if (phoneme) {
    const pool = getItemsByPhoneme(phoneme, profile, difficulty);
    if (pool.length === 0) return [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, pool.length));
  }
  const bank = profile.wordBank[difficulty];
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bank.length));
}

/**
 * Re-pick items with updated config, returning a fresh SessionState.
 */
export function refreshSession(config: TrainingConfig): SessionState {
  const items = pickItems(config.profile, config.difficulty, config.phoneme, config.wordCount);
  return createFreshSession(config, items);
}
