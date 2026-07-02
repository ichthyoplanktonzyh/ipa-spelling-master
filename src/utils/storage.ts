/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Browser storage helpers for local training history.
 * Storage is optional infrastructure: failures must never block a session.
 */

import type { SessionResult } from '../types';

const SESSION_HISTORY_KEY = 'phonetic-master-sessions';
const SESSION_HISTORY_LIMIT = 12;

function isSessionResult(value: unknown): value is SessionResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<SessionResult>;
  return typeof result.id === 'string'
    && typeof result.sessionId === 'string'
    && typeof result.completedAt === 'string'
    && typeof result.total === 'number'
    && typeof result.correct === 'number'
    && typeof result.nearMatch === 'number'
    && typeof result.incorrect === 'number'
    && Array.isArray(result.answers)
    && Array.isArray(result.mistakes);
}

export function loadSessionResults(): SessionResult[] {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSessionResult).slice(0, SESSION_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function saveSessionResult(result: SessionResult): boolean {
  try {
    const existing = loadSessionResults().filter(item => item.id !== result.id);
    const next = [result, ...existing].slice(0, SESSION_HISTORY_LIMIT);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearSessionResults(): boolean {
  try {
    localStorage.removeItem(SESSION_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
