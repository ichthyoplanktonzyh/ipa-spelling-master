/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * L1 × L2 difficulty map registry and query API.
 *
 * This is the central module for L1-aware smart recommendations.
 * Given (l1, l2), it returns the difficulty mapping that describes
 * which L2 phonemes and features are hardest for speakers of L1.
 *
 * When no mapping exists for a given (l1, l2) pair, a default
 * "all phonemes at difficulty 0" mapping is returned — so the UI
 * always works, just without L1-specific prioritization.
 */

import type {
  L1L2Difficulty,
  LanguageProfile,
  PhonemeDifficulty,
} from '../types';
import { zh_en } from './zh_en';
import { en_zh } from './en_zh';

// ── Registry ────────────────────────────────────────────────────

const DIFFICULTY_MAPS: Map<string, L1L2Difficulty> = new Map();

function registerMap(map: L1L2Difficulty) {
  const key = `${map.l1}->${map.l2}`;
  DIFFICULTY_MAPS.set(key, map);
}

registerMap(zh_en);
registerMap(en_zh);

// ── Query API ───────────────────────────────────────────────────

/**
 * Look up the difficulty map for a specific (L1, L2) pair.
 * Returns undefined if no data exists for this pair.
 */
export function getDifficultyMap(l1: string, l2: string): L1L2Difficulty | undefined {
  const key = `${l1}->${l2}`;
  return DIFFICULTY_MAPS.get(key);
}

/**
 * Return all registered difficulty maps.
 * Used by data validation and future maintenance tooling.
 */
export function getAllDifficultyMaps(): L1L2Difficulty[] {
  return [...DIFFICULTY_MAPS.values()];
}

/**
 * Get recommended phonemes for practice, ordered by L1-specific difficulty.
 *
 * If no L1×L2 mapping exists, returns all phonemes from the profile
 * with difficulty level 0 (no prioritization).
 */
export function getRecommendedPhonemes(
  l1: string | null,
  l2: string,
  profile: LanguageProfile,
): PhonemeDifficulty[] {
  if (!l1 || l1 === l2) {
    // No L1 specified, or L1 === L2: no L1-specific difficulty
    return profile.phonemes.map(p => ({
      phoneme: p.symbol,
      level: 0,
      reason: '',
    }));
  }

  const map = getDifficultyMap(l1, l2);
  if (!map) {
    // No data for this pair: return all phonemes at level 0
    return profile.phonemes.map(p => ({
      phoneme: p.symbol,
      level: 0,
      reason: '',
    }));
  }

  // Merge: hard phonemes from the map + remaining phonemes at level 0
  const hardSet = new Set(map.hardPhonemes.map(p => p.phoneme));
  const hardPhonemes = [...map.hardPhonemes].sort((a, b) => b.level - a.level);

  const otherPhonemes = profile.phonemes
    .filter(p => !hardSet.has(p.symbol))
    .map(p => ({
      phoneme: p.symbol,
      level: 0,
      reason: '',
    }));

  return [...hardPhonemes, ...otherPhonemes];
}

/**
 * Get the top N hardest phonemes for a given (L1, L2) pair.
 * Useful for the "smart recommendation" panel.
 */
export function getTopHardPhonemes(
  l1: string | null,
  l2: string,
  profile: LanguageProfile,
  n: number = 5,
): PhonemeDifficulty[] {
  return getRecommendedPhonemes(l1, l2, profile)
    .filter(p => p.level > 0)
    .slice(0, n);
}

/**
 * Get hard features for a given (L1, L2) pair.
 */
export function getHardFeatures(
  l1: string | null,
  l2: string,
): { feature: string; level: number; reason: string }[] {
  if (!l1 || l1 === l2) return [];

  const map = getDifficultyMap(l1, l2);
  if (!map) return [];

  return [...map.hardFeatures].sort((a, b) => b.level - a.level);
}

/**
 * Check whether a difficulty mapping exists for a given (L1, L2) pair.
 */
export function hasDifficultyMap(l1: string, l2: string): boolean {
  return DIFFICULTY_MAPS.has(`${l1}->${l2}`);
}
