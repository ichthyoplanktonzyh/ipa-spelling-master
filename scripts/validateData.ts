/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Data validation entrypoint for language profiles, word banks, and L1/L2 maps.
 */

import type { Difficulty, LanguageProfile, L1L2Difficulty, TrainingItem } from '../src/types';
import { getAllProfiles, getSupportedL2Codes, SUPPORTED_L1 } from '../src/profiles';
import { getAllDifficultyMaps } from '../src/l1/difficultyMap';

const TIERS: Difficulty[] = ['basic', 'intermediate', 'advanced'];

interface ValidationIssue {
  scope: string;
  message: string;
}

function addIssue(issues: ValidationIssue[], scope: string, message: string) {
  issues.push({ scope, message });
}

function ensureUnique(
  issues: ValidationIssue[],
  scope: string,
  values: string[],
  label: string,
) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      addIssue(issues, scope, `Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function validateIpaCoverage(profile: LanguageProfile, item: TrainingItem): string[] {
  const declared = new Set(profile.phonemes.map(p => p.symbol));
  const aliases = new Map<string, string>([
    ['e', 'eɪ'],
    ['o', 'oʊ'],
    ['ɜ', 'ɚ'],
    ['ɒ', 'ɑ'],
    ['g', 'ɡ'],
  ]);
  const matchable = [...declared, ...aliases.keys()].sort((a, b) => b.length - a.length);
  const cleaned = item.pronunciation.replace(/[ˈˌ'’.:ː()\/\s]/g, '');
  const unknown: string[] = [];
  let pos = 0;

  while (pos < cleaned.length) {
    const matched = matchable.find(symbol => cleaned.startsWith(symbol, pos));
    if (matched) {
      pos += matched.length;
      continue;
    }
    unknown.push(cleaned[pos]);
    pos += 1;
  }

  return unknown;
}

function validateCanonicalPinyin(item: TrainingItem): string[] {
  const issues: string[] = [];
  const syllables = item.pronunciation.trim().split(/\s+/).filter(Boolean);

  for (const syllable of syllables) {
    if (!/^[a-zv]+[1-5]$/i.test(syllable)) {
      issues.push(`Non-canonical tone-number syllable "${syllable}"`);
    }
  }

  if (item.pronunciationAlt && /\d/.test(item.pronunciationAlt)) {
    issues.push('pronunciationAlt should be display-only diacritic form, not tone-number form');
  }

  return issues;
}

function validateProfile(profile: LanguageProfile, issues: ValidationIssue[]) {
  const scope = `profile:${profile.code}`;
  const phonemeSymbols = profile.phonemes.map(p => p.symbol);
  const phonemeSet = new Set(phonemeSymbols);
  const featureSet = new Set(profile.soundFeatures);

  if (!profile.code.trim()) addIssue(issues, scope, 'Missing code');
  if (!profile.displayName.trim()) addIssue(issues, scope, 'Missing displayName');
  if (!profile.notationName.trim()) addIssue(issues, scope, 'Missing notationName');
  if (!profile.ttsLang.trim()) addIssue(issues, scope, 'Missing ttsLang');

  ensureUnique(issues, scope, phonemeSymbols, 'phoneme symbol');
  ensureUnique(issues, scope, profile.soundFeatures, 'sound feature');

  for (const phoneme of profile.phonemes) {
    if (phoneme.symbol.length === 0) addIssue(issues, scope, 'Phoneme with empty symbol');
    if (!phoneme.category.trim()) addIssue(issues, scope, `Phoneme ${phoneme.symbol} has empty category`);
    if (!phoneme.label.trim()) addIssue(issues, scope, `Phoneme ${phoneme.symbol} has empty label`);
  }

  for (const section of profile.keypadLayout) {
    if (!section.category.trim()) addIssue(issues, scope, 'Keypad section with empty category');
    ensureUnique(issues, `${scope}:keypad:${section.category}`, section.phonemes, 'keypad phoneme');
    for (const symbol of section.phonemes) {
      if (!phonemeSet.has(symbol)) {
        addIssue(issues, `${scope}:keypad:${section.category}`, `Undeclared keypad phoneme: ${symbol}`);
      }
    }
  }

  for (const tier of TIERS) {
    if (!Array.isArray(profile.wordBank[tier])) {
      addIssue(issues, scope, `Missing wordBank tier: ${tier}`);
    }
  }

  validateWordBank(profile, phonemeSet, featureSet, issues);
}

function validateWordBank(
  profile: LanguageProfile,
  phonemeSet: Set<string>,
  _featureSet: Set<string>,
  issues: ValidationIssue[],
) {
  const identities = new Set<string>();

  for (const tier of TIERS) {
    const items = profile.wordBank[tier];
    for (const [index, item] of items.entries()) {
      const scope = `wordBank:${profile.code}:${tier}:${index}`;
      const identity = `${item.display}::${item.pronunciation}`;

      if (!item.display?.trim()) addIssue(issues, scope, 'Missing display');
      if (!item.pronunciation?.trim()) addIssue(issues, scope, 'Missing pronunciation');
      if (item.frequencyTier !== tier) {
        addIssue(issues, scope, `frequencyTier "${item.frequencyTier}" does not match enclosing tier "${tier}"`);
      }
      if (identities.has(identity)) {
        addIssue(issues, scope, `Duplicate TrainingItem identity: ${identity}`);
      }
      identities.add(identity);

      if (profile.notationName === 'IPA') {
        const unknown = validateIpaCoverage(profile, item);
        if (unknown.length > 0) {
          addIssue(issues, scope, `IPA contains unrecognized symbols: ${[...new Set(unknown)].join(', ')}`);
        }
      }

      if (profile.notationName === 'Pinyin') {
        for (const issue of validateCanonicalPinyin(item)) {
          addIssue(issues, scope, issue);
        }
      }

      const tokens = profile.parseNotation(item.pronunciation);
      if (tokens.length === 0) {
        addIssue(issues, scope, `Pronunciation did not parse into any ${profile.notationName} tokens`);
      }
      for (const token of tokens) {
        if (!phonemeSet.has(token)) {
          addIssue(issues, scope, `Parsed token "${token}" is not declared in profile phonemes`);
        }
      }
    }
  }
}

function validateDifficultyMaps(
  maps: L1L2Difficulty[],
  profiles: LanguageProfile[],
  issues: ValidationIssue[],
) {
  const supportedL1 = new Set<string>(SUPPORTED_L1.map(l => l.code));
  const supportedL2 = new Set(getSupportedL2Codes());
  const profileByCode = new Map(profiles.map(profile => [profile.code, profile]));
  const pairKeys = new Set<string>();

  for (const map of maps) {
    const scope = `difficultyMap:${map.l1}->${map.l2}`;
    const pairKey = `${map.l1}->${map.l2}`;
    const profile = profileByCode.get(map.l2);

    if (pairKeys.has(pairKey)) addIssue(issues, scope, `Duplicate difficulty map pair: ${pairKey}`);
    pairKeys.add(pairKey);

    if (!supportedL1.has(map.l1)) addIssue(issues, scope, `Unsupported L1 code: ${map.l1}`);
    if (!supportedL2.has(map.l2)) addIssue(issues, scope, `Unsupported L2 code: ${map.l2}`);
    if (!profile) continue;

    const phonemeSet = new Set(profile.phonemes.map(p => p.symbol));
    const featureSet = new Set(profile.soundFeatures);
    const hardPhonemes = new Set<string>();
    const hardFeatures = new Set<string>();

    for (const item of map.hardPhonemes) {
      if (hardPhonemes.has(item.phoneme)) {
        addIssue(issues, scope, `Duplicate hard phoneme: ${item.phoneme}`);
      }
      hardPhonemes.add(item.phoneme);

      if (!phonemeSet.has(item.phoneme)) {
        addIssue(issues, scope, `Hard phoneme "${item.phoneme}" is not declared by ${profile.code}`);
      }
      if (!Number.isInteger(item.level) || item.level < 1 || item.level > 5) {
        addIssue(issues, scope, `Hard phoneme "${item.phoneme}" has invalid level: ${item.level}`);
      }
      if (!item.reason.trim()) {
        addIssue(issues, scope, `Hard phoneme "${item.phoneme}" is missing a reason`);
      }
      if (item.l1Equivalence !== undefined && !item.l1Equivalence.trim()) {
        addIssue(issues, scope, `Hard phoneme "${item.phoneme}" has empty l1Equivalence`);
      }
      for (const pair of item.minimalPairs ?? []) {
        if (!pair.trim() || !pair.includes('/')) {
          addIssue(issues, scope, `Hard phoneme "${item.phoneme}" has malformed minimal pair: ${pair}`);
        }
      }
    }

    for (const item of map.hardFeatures) {
      if (hardFeatures.has(item.feature)) {
        addIssue(issues, scope, `Duplicate hard feature: ${item.feature}`);
      }
      hardFeatures.add(item.feature);

      if (!featureSet.has(item.feature)) {
        addIssue(issues, scope, `Hard feature "${item.feature}" is not declared by ${profile.code}`);
      }
      if (!Number.isInteger(item.level) || item.level < 1 || item.level > 5) {
        addIssue(issues, scope, `Hard feature "${item.feature}" has invalid level: ${item.level}`);
      }
      if (!item.reason.trim()) {
        addIssue(issues, scope, `Hard feature "${item.feature}" is missing a reason`);
      }
    }
  }
}

function main() {
  const issues: ValidationIssue[] = [];
  const profiles = getAllProfiles();

  ensureUnique(issues, 'profiles', profiles.map(profile => profile.code), 'profile code');
  for (const profile of profiles) {
    validateProfile(profile, issues);
  }
  validateDifficultyMaps(getAllDifficultyMaps(), profiles, issues);

  if (issues.length > 0) {
    console.error(`Data validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.error(`- [${issue.scope}] ${issue.message}`);
    }
    process.exit(1);
  }

  const wordCount = profiles.reduce(
    (total, profile) => total + TIERS.reduce((sum, tier) => sum + profile.wordBank[tier].length, 0),
    0,
  );
  console.log(`Data validation passed: ${profiles.length} profiles, ${wordCount} training items, ${getAllDifficultyMaps().length} L1/L2 maps.`);
}

main();
