# PhoneticMaster — 数据模型

> 最后更新：2026-07-02

## Identity Strategy

| 记录 | 稳定身份 | 说明 |
|------|----------|------|
| TrainingItem | `display` + `pronunciation` | 同一词可能有多音（如 "read" /ri:d/ vs /rɛd/），display+pronunciation 联合唯一 |
| PhonemeDef | `symbol` + `category` | 同一符号可能在不同类别中（如 'i' 在 vowel 和 final 中含义不同） |
| L1L2Difficulty | `l1` + `l2` | 每对 (L1, L2) 至多一条映射 |
| PhonemeDifficulty | `phoneme` | 在 L1L2Difficulty 内唯一 |
| FeatureDifficulty | `feature` | 在 L1L2Difficulty 内唯一 |
| TrainingSession | generated `id` | 一轮本地训练会话 |
| MasteryRecord | `l2` + `topic` + `phoneme` | 本地掌握度聚合记录 |

## Core Type Relationships

```
LanguageProfile
├── code: string                    ← ISO 639-1
├── displayName: string
├── notationName: string            ← 'IPA' | 'Pinyin' | ...
├── phonemes: PhonemeDef[]
│   ├── symbol: string
│   ├── category: string            ← open: 'vowel'|'consonant'|'initial'|'final'|'tone'|...
│   └── label: string
├── keypadLayout: KeypadSection[]
│   ├── category: string
│   └── phonemes: string[]          ← references PhonemeDef.symbol
├── ttsLang: string                 ← BCP 47
├── parseNotation: (s) => string[]  ← notation → phoneme symbol array
├── judge: (input, target) => JudgeResult
│   ├── correct: boolean
│   ├── nearMatch: boolean
│   └── diffs: PhonemeDiff[]
│       ├── position: number
│       ├── expected: string
│       └── actual: string
├── soundFeatures: string[]
└── wordBank: Record<Difficulty, TrainingItem[]>
    └── TrainingItem
        ├── display: string         ← 汉字 / English word
        ├── pronunciation: string   ← canonical form (tone numbers for Pinyin)
        ├── pronunciationAlt?: string ← display form (diacritics for Pinyin)
        ├── frequencyTier: Difficulty
        └── definition?: string     ← gloss / translation

L1L2Difficulty
├── l1: string                      ← matches SUPPORTED_L1[].code
├── l2: string                      ← matches LanguageProfile.code
├── hardPhonemes: PhonemeDifficulty[]
│   ├── phoneme: string             ← matches LanguageProfile.phonemes[].symbol
│   ├── level: number               ← 1-5
│   ├── reason: string              ← PAM/SLM explanation
│   ├── l1Equivalence?: string      ← closest L1 sound
│   └── minimalPairs?: string[]     ← e.g. ["ship/sheep"]
└── hardFeatures: FeatureDifficulty[]
    ├── feature: string             ← matches LanguageProfile.soundFeatures[]
    ├── level: number               ← 1-5
    └── reason: string

TrainingSession (planned M2)
├── id: string
├── createdAt: string
├── l1?: string                       ← optional, recommendation only
├── l2: string
├── mode: 'spelling' | 'training' | 'minimal_pair'
├── difficulty: Difficulty
├── topic?: string                    ← phoneme / tone / all
├── total: number
├── correct: number
└── answers: TrainingAnswer[]

TrainingAnswer (planned M2)
├── itemId: string                     ← display + pronunciation
├── expected: string
├── actual?: string
├── correct: boolean
├── nearMatch?: boolean
└── diffs?: PhonemeDiff[]

MasteryRecord (planned M4)
├── l1?: string
├── l2: string
├── topic: string
├── phoneme?: string
├── attempts: number
├── correct: number
├── lastPracticedAt: string
└── source: 'local'
```

## Notation Semantics

### English IPA

- `pronunciation`: US IPA with stress marks, e.g. `ˈæp.əl`
- `pronunciationAlt`: UK IPA (optional), e.g. `ˈæp.əl`
- `parseNotation`: tokenizeIpa — strips stress/syllable markers, normalizes variants

### Chinese Pinyin

- `pronunciation`: tone-number form, e.g. `ni3 hao3` — **canonical**
- `pronunciationAlt`: diacritic form, e.g. `nǐ hǎo` — **display only**
- `parseNotation`: parsePinyin — splits into initial + final + tone components

### Future languages

- Must define which form is canonical (`pronunciation`) vs display-only (`pronunciationAlt`)
- `parseNotation` must return phoneme symbols matching `PhonemeDef.symbol` entries

## Persistence (localStorage)

| Key | 格式 | 用途 |
|-----|------|------|
| `ipa-spelling-l1` | string (ISO 639-1)，可缺省 | 用户母语选择；未选择 L1 时删除或不存在 |
| `ipa-spelling-l2` | string (ISO 639-1) | 用户目标语言选择 |
| `ipa-spelling-voice-{lang}` | string (voiceURI) | TTS 语音偏好（按语言） |
| `phonetic-master-sessions` | TrainingSession[] | 最近训练会话（planned M2） |
| `phonetic-master-mastery` | MasteryRecord[] | 本地掌握度（planned M4） |

所有 localStorage 操作均有 try/catch 保护，隐私模式下静默失败。

MVP 约束：训练流程不能依赖 localStorage 成功写入。存储失败时只丢失历史记录，不影响当前训练。

## Backward Compatibility

```
WordData (legacy)          TrainingItem (current)
─────────────────          ─────────────────────
word        ──────────→    display
ipa_us      ──────────→    pronunciation
ipa_uk      ──────────→    pronunciationAlt
(none)      ──────────→    frequencyTier (injected)
(none)      ──────────→    definition (undefined)
```

Conversion functions: `wordDataToTrainingItem()` / `trainingItemToWordData()` in `types.ts`.
WordData is `@deprecated` — new code must use TrainingItem directly.

Phase 2.2 已将 `src/data/wordBank.ts` 迁移为 `Record<Difficulty, TrainingItem[]>`。`WordData` 与转换函数仅保留给历史文档或外部迁移参考，运行时英语 profile 不再执行 legacy 转换。

## Data Validation Rules

可重复运行入口：

```bash
npm run validate:data
```

校验覆盖：

| 范围 | 规则 |
|------|------|
| Profile | `code` 唯一；`phonemes` / `soundFeatures` 不重复；`keypadLayout` 只能引用已声明音素 |
| Word bank | `display`、`pronunciation`、`frequencyTier` 必填；`frequencyTier` 必须匹配所在难度档 |
| TrainingItem identity | `display + pronunciation` 在同一 profile 内唯一 |
| Notation parsing | `pronunciation` 必须能解析出至少一个 token，且 token 必须存在于 profile phonemes |
| English IPA | 清理 ASCII stress/g、重复 identity 和少量 ASCII IPA 片段；`pronunciation` 为主要美式 IPA |
| Chinese Pinyin | `pronunciation` 必须为正字法 tone-number form，每个音节以 `1-5` 结尾；`pronunciationAlt` 不含数字，仅作显示 |
| L1/L2 map | `l1` / `l2` code 必须已注册；hardPhonemes 引用目标 profile 音素；hardFeatures 引用目标 profile soundFeatures；level 为 1-5 |

当前通过校验的数据规模：

| Profile | Basic | Intermediate | Advanced | Total |
|---------|------:|-------------:|---------:|------:|
| English IPA | 881 | 1,527 | 1,680 | 4,088 |
| 中文 Pinyin | 131 | 99 | 20 | 250 |
