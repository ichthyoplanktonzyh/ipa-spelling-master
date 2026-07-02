/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Multi-language phonetic training types.
 * The core model is LanguageProfile-driven: each target language (L2) declares
 * its phoneme inventory, notation system, keypad layout, judge logic, and
 * sound features. The L1 dimension enables smart difficulty-based recommendations.
 */

// ── Difficulty ──────────────────────────────────────────────────

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

// ── Training Session ───────────────────────────────────────────

export type TrainingMode = 'spelling' | 'training';

export type TrainingFeedback = 'correct' | 'near' | 'incorrect' | 'neutral';

export type TrainingSessionStatus = 'in_progress' | 'completed';

// ── Training Item ───────────────────────────────────────────────

/** A single training item (word + pronunciation), language-agnostic. */
export interface TrainingItem {
  /** Display text: English word / Chinese characters / etc. */
  display: string;
  /** Pronunciation notation: IPA string / Pinyin / etc. */
  pronunciation: string;
  /** Alternate notation form (e.g. Pinyin with tone numbers, British IPA). */
  pronunciationAlt?: string;
  /** Frequency tier for difficulty grouping. */
  frequencyTier: Difficulty;
  /** Optional definition / gloss (e.g. English translation for Chinese words). */
  definition?: string;
}

export interface TrainingSessionConfig {
  l1?: string;
  l2: string;
  mode: TrainingMode;
  difficulty: Difficulty;
  topic: string | null;
  wordCount: number;
}

export interface TrainingAnswer {
  itemId: string;
  item: TrainingItem;
  expected: string;
  actual: string;
  judgeResult: JudgeResult;
  submittedAt: string;
}

export interface TrainingSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  status: TrainingSessionStatus;
  config: TrainingSessionConfig;
  items: TrainingItem[];
  answers: TrainingAnswer[];
}

export interface SessionResult {
  id: string;
  sessionId: string;
  createdAt: string;
  completedAt: string;
  config: TrainingSessionConfig;
  total: number;
  answered: number;
  correct: number;
  nearMatch: number;
  incorrect: number;
  accuracy: number | null;
  answers: TrainingAnswer[];
  mistakes: TrainingAnswer[];
}

// ── Backward compatibility ──────────────────────────────────────

/**
 * @deprecated Use TrainingItem instead. Kept for gradual migration.
 * Maps 1:1 to TrainingItem: word→display, ipa_us→pronunciation, ipa_uk→pronunciationAlt.
 */
export interface WordData {
  word: string;
  ipa_uk: string;
  ipa_us: string;
}

/** Convert legacy WordData to TrainingItem. */
export function wordDataToTrainingItem(w: WordData, tier: Difficulty): TrainingItem {
  return {
    display: w.word,
    pronunciation: w.ipa_us,
    pronunciationAlt: w.ipa_uk,
    frequencyTier: tier,
  };
}

/** Convert TrainingItem back to legacy WordData (for gradual migration). */
export function trainingItemToWordData(item: TrainingItem): WordData {
  return {
    word: item.display,
    ipa_uk: item.pronunciationAlt ?? '',
    ipa_us: item.pronunciation,
  };
}

// ── Phoneme Definitions ────────────────────────────────────────

/** A single phoneme/sound unit in a language's inventory. */
export interface PhonemeDef {
  /** Symbol used in notation (e.g. 'eɪ', 'zh', '1'). */
  symbol: string;
  /** Display category: 'vowel', 'consonant', 'initial', 'final', 'tone', etc. */
  category: string;
  /** Human-readable label for the UI (e.g. 'ay sound', '玻'). */
  label: string;
}

// ── Language Profile ────────────────────────────────────────────

/**
 * Complete declaration of a target language's phonetic training specification.
 * UI and training logic are driven by the profile — no language-specific code
 * outside of this interface.
 */
export interface LanguageProfile {
  /** ISO 639-1 code: 'en', 'zh', ... */
  code: string;
  /** Human-readable name: 'English', '中文', ... */
  displayName: string;
  /** Name of the notation system: 'IPA', 'Pinyin', ... */
  notationName: string;
  /** Full phoneme inventory for this language. */
  phonemes: PhonemeDef[];
  /** Keypad layout: groups of phonemes by category for the on-screen keyboard. */
  keypadLayout: KeypadSection[];
  /** BCP 47 language tag for TTS: 'en-US', 'zh-CN', ... */
  ttsLang: string;
  /** Parse a notation string into an ordered phoneme symbol array. */
  parseNotation: (notation: string) => string[];
  /** Judge user input against the target notation. */
  judge: (input: string, target: string) => JudgeResult;
  /** Sound features relevant to this language (used for L1 contrast). */
  soundFeatures: string[];
  /** Available word banks organized by difficulty. */
  wordBank: Record<Difficulty, TrainingItem[]>;
}

/** One section of the on-screen keypad (e.g. "Vowels" or "声母"). */
export interface KeypadSection {
  /** Section heading displayed above the row. */
  category: string;
  /** Phoneme symbols in this section, in display order. */
  phonemes: string[];
}

// ── Judge Result ────────────────────────────────────────────────

/** Result of judging user input against a target notation. */
export interface JudgeResult {
  /** Whether the input exactly matches the target. */
  correct: boolean;
  /** Whether the input is a near-match (most phonemes correct). */
  nearMatch: boolean;
  /** Per-position differences for feedback display. */
  diffs: PhonemeDiff[];
}

/** A single position difference between expected and actual phoneme. */
export interface PhonemeDiff {
  /** Position in the phoneme sequence. */
  position: number;
  /** Expected phoneme symbol. */
  expected: string;
  /** Actual phoneme symbol entered by user. */
  actual: string;
}

// ── L1 × L2 Difficulty ─────────────────────────────────────────

/** Difficulty mapping for a specific (L1, L2) pair. */
export interface L1L2Difficulty {
  /** Source language (learner's native language). */
  l1: string;
  /** Target language. */
  l2: string;
  /** Phonemes that are hard for this L1→L2 pair, sorted by difficulty desc. */
  hardPhonemes: PhonemeDifficulty[];
  /** Sound features that are hard for this L1→L2 pair. */
  hardFeatures: FeatureDifficulty[];
}

/** Difficulty info for a single phoneme in an L1→L2 context. */
export interface PhonemeDifficulty {
  /** The L2 phoneme symbol. */
  phoneme: string;
  /** Difficulty level 1–5 (5 = hardest). */
  level: number;
  /** Why this is hard (PAM/SLM reasoning). */
  reason: string;
  /** Closest equivalent in L1 (source of perceptual assimilation). */
  l1Equivalence?: string;
  /** Suggested minimal pairs for targeted practice. */
  minimalPairs?: string[];
}

/** Difficulty info for a sound feature in an L1→L2 context. */
export interface FeatureDifficulty {
  /** Feature identifier (e.g. 'weak_form', 'tone'). */
  feature: string;
  /** Difficulty level 1–5. */
  level: number;
  /** Why this is hard. */
  reason: string;
}
