/**
 * 音素分组工具 —— 按音标对词库单词进行分类
 */

import { WordData, Difficulty } from '../types';
import { wordBank } from '../data/wordBank';
import { getUniquePhonemes } from './ipaParser';

/** 全部 40 个音素（与键盘布局一致） */
export const ALL_PHONEMES: string[] = [
  // 元音 (16)
  'i', 'ɪ', 'eɪ', 'ɛ', 'æ', 'ɑ', 'ɔ', 'oʊ', 'ʊ', 'u', 'ʌ', 'ɚ', 'ə', 'aɪ', 'aʊ', 'ɔɪ',
  // 辅音 (24)
  'p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h',
  'm', 'n', 'ŋ', 'l', 'r', 'j', 'w', 'tʃ', 'dʒ',
];

let _phonemeGroups: Record<string, WordData[]> | null = null;

/**
 * 构建 音素 → 单词列表 映射（结果缓存）。
 * 基于美式音标 (ipa_us) 分类。
 */
export function buildPhonemeGroups(): Record<string, WordData[]> {
  if (_phonemeGroups) return _phonemeGroups;

  const allWords = [
    ...wordBank.basic,
    ...wordBank.intermediate,
    ...wordBank.advanced,
  ];

  const groups: Record<string, WordData[]> = {};
  for (const ph of ALL_PHONEMES) {
    groups[ph] = [];
  }

  for (const word of allWords) {
    const phonemes = getUniquePhonemes(word.ipa_us);
    for (const ph of phonemes) {
      if (groups[ph]) {
        groups[ph].push(word);
      }
    }
  }

  _phonemeGroups = groups;
  return groups;
}

/**
 * 获取包含指定音素的所有单词，可选按难度筛选。
 */
export function getWordsByPhoneme(phoneme: string, difficulty?: Difficulty): WordData[] {
  const groups = buildPhonemeGroups();
  let words = groups[phoneme] || [];

  if (difficulty) {
    const poolSet = new Set(wordBank[difficulty].map(w => w.word));
    words = words.filter(w => poolSet.has(w.word));
  }

  return words;
}

/**
 * 获取各音素的单词数量统计，按数量降序排列。
 */
export function getPhonemeStats(): { phoneme: string; count: number }[] {
  const groups = buildPhonemeGroups();
  return ALL_PHONEMES
    .map(ph => ({ phoneme: ph, count: groups[ph]?.length || 0 }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);
}
