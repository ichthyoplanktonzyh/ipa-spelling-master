# PhoneticMaster — DDD 架构分析

> 最后更新：2026-07-02
> 目的：用 Domain-Driven Design 确立核心领域、限界上下文、模型边界和后续代码演进方向。

## 1. 领域定位

PhoneticMaster 的核心领域不是“音标输入 UI”，而是 **语音感知训练**：

> 学习者通过一轮轮训练，把目标语言 L2 的声音从“听起来差不多”变成可区分、可记忆、可复盘的声音范畴。

因此架构应围绕训练会话、语言声音模型、反馈与推荐展开，而不是围绕 React 组件或页面布局展开。

## 2. 统一语言

| 术语 | DDD 含义 | 当前代码概念 |
|---|---|---|
| Learner | 训练者，可选声明 L1 | `l1`, localStorage |
| Target Language (L2) | 当前训练目标语言 | `LanguageProfile.code` |
| Language Profile | 一个目标语言的训练规格聚合 | `LanguageProfile` |
| Notation | 目标语言的声音记号体系 | IPA, Pinyin |
| Phoneme | 可训练的声音单位 | `PhonemeDef` |
| Training Item | 可出题的词/短语及其标准读音 | `TrainingItem` |
| Topic | 本轮训练主题，如全部、音素、声调 | `selectedPhoneme`（应演进为 `TrainingTopic`） |
| Training Session | 一轮固定配置与固定题目的训练 | `SessionState`, planned `TrainingSession` |
| Attempt / Answer | 用户对某一题的作答 | planned `TrainingAnswer` |
| Judgement | 对作答的判定结果 | `JudgeResult` |
| Feedback | 面向学习的结果解释 | Phase 2.3 planned |
| Difficulty Map | L1→L2 感知难点映射 | `L1L2Difficulty` |
| Recommendation | 下一步训练建议 | `SmartRecommend`, future M4 |
| Mastery | 学习者本地掌握度 | planned `MasteryRecord` |

## 3. 子域划分

| 子域 | 类型 | 原因 |
|---|---|---|
| Training Core | Core Domain | 产品能否成立取决于训练会话是否完整、可靠、可复盘 |
| Phonetic Language Model | Core/Supporting | 多语言扩展的关键，承载 profile、音素、记号和词库 |
| Feedback & Results | Core Domain | 从“做题工具”变成“训练器”的关键学习闭环 |
| L1-Aware Coaching | Supporting Domain | 让训练更准，但不能阻塞独立训练 |
| Personalization | Supporting Domain | 基于历史表现的推荐排序，M4 开始成为重要差异点 |
| Delivery Platform | Generic Domain | React、TTS、localStorage、静态部署等技术承载 |

## 4. 限界上下文

### 4.1 Language Catalog Context

回答：这个目标语言如何被训练？

| 内容 | 模型 |
|---|---|
| 聚合根 | `LanguageProfile` |
| 实体 | `TrainingItem`（静态内容实体）、`PhonemeDef` |
| 值对象 | `Difficulty`, `KeypadSection`, notation string |
| 领域服务 | parser (`parseNotation`), judge adapter (`profile.judge`) |
| 当前文件 | `src/profiles/*`, `src/data/*`, `src/utils/ipaParser.ts`, `src/utils/pinyinParser.ts` |

关键不变量：

- `LanguageProfile.code` 在注册表内唯一。
- `keypadLayout.phonemes[]` 必须引用该 profile 的 phoneme symbol。
- `wordBank` 中每个 `TrainingItem.pronunciation` 必须是该 profile 可解析的 canonical notation。
- `pronunciationAlt` 只用于显示，不用于判定。

### 4.2 Training Context

回答：本轮训练怎么开始、推进、结束？

| 内容 | 模型 |
|---|---|
| 聚合根 | `TrainingSession` |
| 实体 | `TrainingAnswer` |
| 值对象 | `TrainingConfig`, `TrainingTopic`, `SessionProgress`, `Score` |
| 领域服务 | item picking, answer judging, scoring policy |
| 当前文件 | `src/utils/trainingSession.ts`, `src/App.tsx` |

关键不变量：

- session 一旦开始，`items` 应固定；设置变化创建新 session。
- session 必须绑定一个 L2 profile；L1 只能影响推荐，不影响 session 是否可开始。
- `wordCount` 是期望上限；实际题数不能超过匹配题池大小。
- 拼写模式需要 `TrainingAnswer`；看词听音模式可以只记录浏览进度。
- score 应由 answers 推导，避免 UI 状态与结果页统计分叉。

当前差距：

- `TrainingSession` 还不是正式聚合，只是 `SessionState`。
- session 完成仍由 `alert()` 表达，Phase 2.3 需要引入结果模型。
- `TrainingTopic` 目前被 `selectedPhoneme: string | null` 表示，无法清晰区分 tone/final/feature/minimal-pair。

### 4.3 Feedback Context

回答：用户错在哪里、这轮训练说明了什么？

| 内容 | 模型 |
|---|---|
| 聚合根 | `SessionResult` |
| 实体 | `AnswerFeedback` |
| 值对象 | `JudgeResult`, `PhonemeDiff`, `FeedbackSeverity` |
| 领域服务 | feedback presenter, result summarizer |
| 当前文件 | `src/utils/judge.ts`, `src/App.tsx` feedback state |

关键不变量：

- Feedback 必须由 `LanguageProfile.judge()` 的 `JudgeResult` 驱动。
- `nearMatch` 不能在统计层被无声地等同于 correct；是否计分应由 scoring policy 明确。
- `diffs[]` 是学习反馈的事实来源，UI 只负责展示。
- 结果页应从 session answers 生成，而不是从临时 UI 字段拼接。

### 4.4 Coaching Context

回答：下一步最应该练什么？

| 内容 | 模型 |
|---|---|
| 聚合根 | `RecommendationSet` |
| 实体 | `Recommendation` |
| 值对象 | `L1L2Difficulty`, `PhonemeDifficulty`, `FeatureDifficulty`, `RecommendationReason` |
| 领域服务 | recommendation ranking |
| 当前文件 | `src/l1/*`, `src/components/SmartRecommend.tsx` |

关键不变量：

- 无 L1、L1===L2 或无 difficulty map 时必须降级为空推荐或普通主题推荐。
- Coaching 可以唤起 Training Context，但 Training Context 不能依赖 Coaching。
- 推荐理由要区分“来自 L1 难点”和“来自训练历史”（M4）。

### 4.5 Learner Progress Context

回答：本地训练历史如何变成掌握度？

| 内容 | 模型 |
|---|---|
| 聚合根 | `MasteryRecord` |
| 实体 | `StoredTrainingSession` |
| 值对象 | local storage key, accuracy, lastPracticedAt |
| 领域服务 | mastery updater, history repository |
| 当前文件 | planned `src/utils/storage.ts`, planned `src/utils/recommendation.ts` |

关键不变量：

- localStorage 失败不能影响当前训练。
- 历史记录是增强数据，不是开始训练的前置条件。
- 掌握度按 `(l2, topic, phoneme?)` 聚合，L1 可选。

### 4.6 Delivery Context

回答：领域能力如何呈现给用户和浏览器？

| 内容 | 模型 |
|---|---|
| Shell | `App.tsx` |
| Views | `OnboardingView`, `TrainingView`, future `SessionResultView` |
| Adapters | Web Speech API, localStorage |
| 当前文件 | `src/components/*`, `src/utils/voice.ts`, `server.ts` |

关键不变量：

- React 组件不能成为领域事实来源；它们只编排 use case 和展示状态。
- Web Speech API 是播放 adapter，不能污染 Training Core。
- Express/Vite 只属于开发/发布承载，不属于核心产品域。

## 5. 上下文映射

```text
┌────────────────────┐
│ Delivery Context   │  React UI / TTS / localStorage adapters
└─────────┬──────────┘
          │ calls use cases / renders read models
          ▼
┌────────────────────┐       uses        ┌────────────────────────┐
│ Training Context   │ ────────────────▶ │ Language Catalog       │
│ session lifecycle  │                  │ profiles / word banks  │
└─────────┬──────────┘                  └────────────────────────┘
          │ produces answers/results
          ▼
┌────────────────────┐       feeds       ┌────────────────────────┐
│ Feedback Context   │ ────────────────▶ │ Learner Progress       │
│ diffs / summaries  │                  │ history / mastery      │
└────────────────────┘                  └───────────┬────────────┘
                                                     │ augments
┌────────────────────┐       suggests                ▼
│ Coaching Context   │ ◀──────────────── ┌────────────────────────┐
│ L1-aware ranking   │                   │ L1 Difficulty Maps     │
└─────────┬──────────┘                   └────────────────────────┘
          │ can launch topic
          ▼
┌────────────────────┐
│ Training Context   │
└────────────────────┘
```

依赖方向规则：

| From | May depend on | Must not depend on |
|---|---|---|
| Delivery | all application services and read models | raw data files except through profiles/services |
| Training | Language Catalog, Feedback value types | Coaching, React, Web Speech API |
| Feedback | Training answer facts, Language Catalog notation metadata | React, Coaching |
| Coaching | L1 maps, Language Catalog, Learner Progress | Training session internals |
| Learner Progress | Training result DTOs | React, Web Speech API |
| Language Catalog | parsers, static word banks | Training, Coaching, UI |

## 6. 目标分层

当前项目可以渐进演进为以下层次，不需要一次性大迁移：

```text
src/
├── domain/
│   ├── language/          ← LanguageProfile, phoneme, notation, word bank contracts
│   ├── training/          ← TrainingSession, TrainingConfig, topic, scoring
│   ├── feedback/          ← JudgeResult, diffs, result summary
│   ├── coaching/          ← L1 difficulty, recommendation
│   └── progress/          ← Session history, mastery
├── application/
│   ├── startTrainingSession.ts
│   ├── submitTrainingAnswer.ts
│   ├── completeTrainingSession.ts
│   └── recommendNextTopic.ts
├── infrastructure/
│   ├── profiles/          ← current src/profiles
│   ├── data/              ← current src/data
│   ├── storage/           ← localStorage repository
│   └── speech/            ← Web Speech adapter
├── components/            ← React presentation components
└── App.tsx                ← shell / composition root
```

M2 不要求立即创建这些目录。当前阶段更实际的落点是：

| 当前文件 | DDD 归属 | 近期处理 |
|---|---|---|
| `src/types.ts` | Shared domain contracts | 继续保留；类型变多后再拆到 `domain/*` |
| `src/utils/trainingSession.ts` | Training application/domain service | Phase 2.3 扩展为正式 `TrainingSession` 聚合和结果生成 |
| `src/utils/judge.ts` | Feedback/Language service | 保持无 UI 依赖；补测试 |
| `src/utils/phonemeGroups.ts` | Language query service | 保持 profile-driven |
| `src/l1/*` | Coaching domain data/service | M4 前不让 Training 反向依赖 |
| `src/utils/voice.ts` | Infrastructure adapter | 未来移到 `infrastructure/speech` |
| `src/App.tsx` | Delivery composition root | 逐步抽出 use case，避免继续膨胀 |

## 7. Phase 2.3 架构准则

Phase 2.2 MVP Scope Triage 会先给出必要需求/伪需求边界；Phase 2.3 只实现裁剪后仍属于 MVP 训练闭环的反馈与结果能力。

Phase 2.3 是 DDD 落地到训练反馈的第一个关键点。不要只做一个 UI 结果页，应先确立结果模型。

建议新增/扩展：

| 模型 | 归属 | 说明 |
|---|---|---|
| `TrainingSession` | Training Context | id, config, items, answers, status |
| `TrainingAnswer` | Training Context | item identity, expected, actual, judgeResult |
| `SessionResult` | Feedback Context | total, correct, nearMatch, incorrect, accuracy, mistakes |
| `ScoringPolicy` | Feedback/Training service | 明确 nearMatch 是否计分 |
| `SessionHistoryRepository` | Learner Progress adapter | localStorage 读写，失败静默降级 |

Phase 2.3 的理想数据流：

```text
submit answer
  → profile.judge(input, target)
  → append TrainingAnswer
  → derive per-question feedback
  → complete session
  → build SessionResult from answers
  → try save SessionResult to localStorage
  → render SessionResultView
```

## 8. 架构决策

| 决策 | 状态 | 说明 |
|---|---|---|
| DDD 核心域是 Training Core + Feedback，而不是 UI 或词库 | Accepted | UI 服务于训练闭环 |
| LanguageProfile 是 Language Catalog Context 的聚合根 | Accepted | 新语言扩展围绕 profile 完成 |
| TrainingSession 应成为 Phase 2.3 的正式聚合 | Accepted | 结果页和历史记录都必须从 session facts 生成 |
| Coaching 不阻塞 Training | Accepted | L1-aware 是可选增强层 |
| localStorage 是 Infrastructure/Repository，不是领域模型 | Accepted | 存储失败必须降级 |
| 先渐进重构，不立即搬成多目录 DDD | Accepted | 当前代码规模仍适合轻量演进 |

## 9. 非目标

- 不为 DDD 引入后端、数据库或账号系统。
- 不为了“看起来分层”而拆碎当前可工作的模块。
- 不把 React state 直接定义成领域模型。
- 不在 Phase 2.3 之前实现完整个性化推荐；那属于 M4。
