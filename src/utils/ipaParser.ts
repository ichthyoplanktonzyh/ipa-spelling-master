/**
 * IPA 音标解析器 —— 将 IPA 字符串拆分为单个音素
 * 美式音标 (General American) 专用
 */

// 40 个音素（按长度降序排列，优先匹配多字符音素）
const PHONEMES_BY_LENGTH: string[] = [
  // 2 字符音素（双元音 + 塞擦音）
  'eɪ', 'oʊ', 'aɪ', 'aʊ', 'ɔɪ', 'tʃ', 'dʒ',
  // 1 字符音素 —— 元音
  'i', 'ɪ', 'ɛ', 'æ', 'ɑ', 'ɔ', 'ʊ', 'u', 'ʌ', 'ɚ', 'ə',
  // 1 字符音素 —— 辅音
  'p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 'θ', 'ð',
  's', 'z', 'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ', 'l', 'r', 'j', 'w',
];

// 变体符号 → 键盘标准符号映射
const NORMALIZE_MAP: Record<string, string> = {
  'e': 'eɪ',   // 美式 FACE 元音单音化
  'o': 'oʊ',   // 美式 GOAT 元音单音化
  'ɜ': 'ɚ',    // NURSE / r 化元音
  'ɒ': 'ɑ',    // LOT 元音（仅 1 个词，英式残留）
};

/**
 * 将 IPA 字符串拆分为音素数组。
 * 自动去除重音标记 ˈˌ、长音标记 ː:、音节分隔符 . 和括号 ()。
 * 变体符号会被标准化为键盘标准符号。
 */
export function tokenizeIpa(ipa: string): string[] {
  const cleaned = ipa
    .replace(/[ˈˌ.:ː()]/g, '')
    .trim();

  if (!cleaned) return [];

  const tokens: string[] = [];
  let pos = 0;

  while (pos < cleaned.length) {
    let matched = false;

    // 优先匹配 2 字符音素
    for (const ph of PHONEMES_BY_LENGTH) {
      if (ph.length === 2 && cleaned.startsWith(ph, pos)) {
        tokens.push(ph);
        pos += 2;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const char = cleaned[pos];
      if (PHONEMES_BY_LENGTH.includes(char)) {
        tokens.push(char);
      } else if (NORMALIZE_MAP[char]) {
        tokens.push(NORMALIZE_MAP[char]);
      }
      // 无法识别的字符直接跳过
      pos++;
    }
  }

  return tokens;
}

/**
 * 获取 IPA 字符串中包含的所有不重复音素。
 */
export function getUniquePhonemes(ipa: string): string[] {
  return [...new Set(tokenizeIpa(ipa))];
}
