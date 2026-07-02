# PhoneticMaster — 系统架构

> 最后更新：2026-07-02
> DDD 分析与目标分层见 `DDD-ARCHITECTURE.md`

## 1. 架构全景

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                             │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Language  │  │  App (Shell) │  │   Header     │               │
│  │ Selector  │──│  L2 + 可选L1 │──│  控制面板    │               │
│  └──────────┘  └──────┬───────┘  └──────────────┘               │
│                       │                                          │
│          ┌────────────┼────────────────┐                        │
│          │            │                │                         │
│  ┌───────▼──────┐ ┌───▼────────┐ ┌────▼───────┐               │
│  │  Spelling    │ │ Training   │ │  Smart     │               │
│  │  Mode        │ │ Mode       │ │  Recommend │               │
│  │ (输入+判定)  │ │ (浏览记忆) │ │ (可选教练) │               │
│  └───────┬──────┘ └───┬────────┘ └────┬───────┘               │
│          │            │                │                         │
│  ┌───────▼────────────▼────────────────▼───────┐               │
│  │          LanguageProfile (接口层)            │               │
│  │  phonemes / keypadLayout / parseNotation /  │               │
│  │  judge / wordBank / soundFeatures / ttsLang │               │
│  └───────────────────┬─────────────────────────┘               │
│                      │                                           │
│       ┌──────────────┼──────────────┐                           │
│       │              │              │                            │
│  ┌────▼─────┐  ┌─────▼─────┐  ┌────▼─────┐                    │
│  │ en.ts    │  │ zh.ts     │  │ 未来语言  │                    │
│  │ English  │  │ Chinese   │  │ ja/es/.. │                    │
│  │ Profile  │  │ Profile   │  │ Profile  │                    │
│  └────┬─────┘  └─────┬─────┘  └──────────┘                    │
│       │              │                                           │
│  ┌────▼─────┐  ┌─────▼──────┐                                  │
│  │ wordBank │  │ zhWordBank │   ← TrainingItem[]               │
│  │ (legacy) │  │ (HSK 1-3) │                                  │
│  └──────────┘  └────────────┘                                  │
│                                                                  │
│  ┌───────────────────────────────────────────────┐              │
│  │           L1 Difficulty Layer                  │              │
│  │  difficultyMap.ts ← zh_en.ts / en_zh.ts / ... │              │
│  └───────────────────────────────────────────────┘              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │ judge.ts     │  │ ipaParser.ts │  │ pinyinParser  │         │
│  │ (phonemeJudge│  │ (tokenizeIpa)│  │ (parsePinyin) │         │
│  │  stringJudge)│  │              │  │               │         │
│  └──────────────┘  └──────────────┘  └───────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ voice.ts     │  │ phonemeGroups│  │trainingSession│         │
│  │ (TTS 管理)   │  │ (音素分组)   │  │(抽题/会话)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────┐              │
│  │            Web Speech API (TTS)               │              │
│  └───────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

## 2. 数据流

### 2.0 独立训练入口流程

```
首次访问 → 选择目标语言 L2（L1 可选）
         → 选择训练类型 / 难度 / 主题
         → 基于 LanguageProfile 抽题
         → 进入训练会话

约束：L1 缺失、无 difficultyMap、localStorage 写入失败，都不能阻塞训练。
```

### 2.1 拼写模式流程

```
用户选择 L2 → getProfile(code) → LanguageProfile
                                    │
用户听音 ← TTS(playAudio) ← profile.ttsLang
                                    │
用户输入 → userInput 字符串 → profile.judge(input, target) → JudgeResult
                                    │
                            correct → 绿色反馈
                            nearMatch → "Almost Correct"
                            incorrect → 红色反馈 + diffs
```

### 2.2 L1 推荐流程

```
用户选择 L1 + L2 → getTopHardPhonemes(l1, l2, profile, n)
                                    │
                difficultyMap 查询 → L1L2Difficulty
                                    │
                hardPhonemes[] → 星级 + PAM/SLM 原因
                hardFeatures[] → 星级 + 原因
                                    │
                用户点击音素 → handleSmartPhonemeSelect → 启动训练
```

### 2.3 语言选择流程

```
首次访问 → localStorage 无 L2 → 显示语言选择
                                        │
                    必选 L2 (getAllProfiles()) + 可选 L1 (SUPPORTED_L1)
                                        │
                    保存到 localStorage → 进入主界面
                                        │
                    点击设置按钮 → 重新显示语言选择
```

## 3. 模块职责

| 模块 | 职责 | 关键导出 |
|------|------|----------|
| `types.ts` | 全局类型定义 | TrainingItem, LanguageProfile, JudgeResult, L1L2Difficulty, Difficulty |
| `profiles/index.ts` | Profile 注册表 + L1 列表 | getProfile(), getAllProfiles(), SUPPORTED_L1 |
| `profiles/en.ts` | 英语 Profile | englishProfile |
| `profiles/zh.ts` | 汉语 Profile | chineseProfile |
| `data/wordBank.ts` | 英语词库 (legacy WordData) | wordBank, pickWords() |
| `data/zhWordBank.ts` | 汉语词库 (TrainingItem) | zhWordBank, pickZhWords() |
| `utils/ipaParser.ts` | IPA 音素分词 | tokenizeIpa(), getUniquePhonemes() |
| `utils/pinyinParser.ts` | 拼音解析 | parsePinyin(), parsePinyinSyllables(), diacriticsToNumbers() |
| `utils/judge.ts` | 音素级判定 | phonemeJudge(), stringJudge() |
| `utils/voice.ts` | TTS 语音管理 | getVoicesForLang(), selectBestVoice(), saveVoicePreference() |
| `utils/phonemeGroups.ts` | 音素分组查询 | getItemsByPhoneme(), getPhonemeStats() |
| `utils/trainingSession.ts` | 训练题组抽取 + fresh session 初始化 | pickItems(), refreshSession(), createFreshSession() |
| `l1/difficultyMap.ts` | L1×L2 难度注册表 | getDifficultyMap(), getTopHardPhonemes(), getHardFeatures() |
| `l1/zh_en.ts` | 中文→英语映射 | zh_en |
| `l1/en_zh.ts` | 英语→中文映射 | en_zh |

## 4. 关键架构边界

| 边界 | 规则 | 原因 |
|------|------|------|
| UI ↔ Profile | UI 不含语言特定 if/else；所有语言行为通过 profile 驱动 | 可扩展性 |
| Profile ↔ Parser | 每个 profile 自带 parseNotation；UI 不直接调用解析器 | 解耦 |
| Profile ↔ Judge | 每个 profile 自带 judge；判定逻辑不散落在组件中 | 单一职责 |
| L1 Layer ↔ Profile | difficultyMap 接受 profile 参数但不修改 profile | 只读依赖 |
| Training ↔ L1 Layer | 训练器不能依赖 L1；推荐层可以唤起训练器 | 保证独立训练闭环 |
| Components ↔ Data | 组件不直接 import 词库；词库通过 profile.wordBank 访问 | 统一入口 |
| voice.ts ↔ Profile | voice 函数接受 lang 参数（来自 profile.ttsLang） | 多语言 |
| Frontend ↔ Backend | MVP 不依赖后端；未来云端能力通过 storage/provider 替换 | 静态发布与渐进扩展 |

## 4.1 DDD 架构定位

| 限界上下文 | 当前代表模块 | 说明 |
|---|---|---|
| Language Catalog | `profiles/*`, `data/*`, parser utils | 目标语言如何被训练 |
| Training | `utils/trainingSession.ts`, `App.tsx` session state | 一轮训练如何开始、推进、完成 |
| Feedback | `utils/judge.ts`, planned result models | 用户错在哪里、训练结果说明什么 |
| Coaching | `l1/*`, `SmartRecommend.tsx` | L1-aware 推荐，不阻塞训练 |
| Learner Progress | planned `storage.ts`, `recommendation.ts` | 本地历史和掌握度 |
| Delivery | `components/*`, `App.tsx`, `voice.ts` | React UI、TTS、localStorage 适配 |

架构决策：Phase 2.3 Feedback & Session Results 应让 `TrainingSession` 和 `SessionResult` 成为明确模型，避免结果页和历史记录从临时 React state 拼接。

## 5. 已知架构债务

| # | 债务 | 影响 | 清偿方向 |
|---|------|------|----------|
| 1 | `data/wordBank.ts` 仍使用 WordData 格式 | en.ts 需要 convertWordBank() 运行时转换 | 直接迁移为 TrainingItem 格式 |
| 2 | `components/IPAKeypad.tsx` 仍然存在但不再被引用 | 死代码 | 删除旧文件 |
| 3 | phonemeGroups 有 GROUP_CACHE 但无失效机制 | 切换 profile 时可能返回旧数据 | 以 profile.code 做 key（已实现） |
| 4 | judge.ts 不处理长度差异较大的输入 | 可能误判 nearMatch | 增加长度差异惩罚 |
