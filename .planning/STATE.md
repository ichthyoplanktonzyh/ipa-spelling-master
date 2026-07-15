---
gsd_state_version: 1.0
milestone: M5
milestone_name: 可信内容与练习体验扩展
status: planned
last_updated: "2026-07-15T09:31:00+08:00"
progress:
  total_phases: 6
  completed_phases: 0
  in_progress_phases: 0
---

# PhoneticMaster — 项目活记忆

> 最后更新：2026-07-15
> 更新原因：参考 iSpeakerReact 调整并建立 M5 可信内容与练习体验 phases

## 当前位置

| 维度 | 值 |
|------|------|
| 里程碑 | M5 — 可信内容与练习体验扩展（已规划） |
| 阶段 | 下一步：Phase 5.1 Content Foundation |
| 分支 | `main` (ipa-spelling) |
| 版本 | v1.3 M4 complete |

## Phase 状态

### Phase 2.1: Standalone Training Core ✅

- **目标**：用户无需 L1 诊断、无需账号、无需后端即可开始并完成训练
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/2.1-standalone-training-core/2.1-PLAN.md`
- **总结文件**：`.planning/phases/2.1-standalone-training-core/2.1-SUMMARY.md`

### Phase 2.2: Data Cleaning ✅

- **目标**：清洗并校验训练数据、语言 Profile 数据和 L1×L2 映射数据，为反馈/结果/推荐提供可信数据基础
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/2.2-data-cleaning/2.2-PLAN.md`
- **上下文文件**：`.planning/phases/2.2-data-cleaning/2.2-CONTEXT.md`
- **总结文件**：`.planning/phases/2.2-data-cleaning/2.2-SUMMARY.md`

### Phase 2.3: Feedback & Session Results 🧭

- **目标**：补齐 nearMatch/diff 反馈、会话结果页和本地最近训练记录
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/2.3-feedback-session-results/2.3-PLAN.md`
- **总结文件**：`.planning/phases/2.3-feedback-session-results/2.3-SUMMARY.md`
- **QA 文件**：`.planning/phases/2.3-feedback-session-results/2.3-QA.md`

### Phase 2.4: Publish Readiness 🧭

- **目标**：静态部署检查、README/PRD 对齐和发布前手动 QA 清单
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/2.4-publish-readiness/2.4-PLAN.md`
- **总结文件**：`.planning/phases/2.4-publish-readiness/2.4-SUMMARY.md`
- **QA 文件**：`.planning/phases/2.4-publish-readiness/2.4-QA.md`

### Phase 3.1: Targeted Minimal Pairs 🧭

- **目标**：在独立训练器成立后，提供最小对立体专项听辨
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/3.1-targeted-minimal-pairs/3.1-PLAN.md`
- **总结文件**：`.planning/phases/3.1-targeted-minimal-pairs/3.1-SUMMARY.md`

### Phase 3.2: Chinese Structured Input 🧭

- **目标**：将中文拼音输入从简单字符串追加演进为声母 → 韵母 → 声调的结构化输入原型
- **状态**：已完成（2026-07-02）
- **计划文件**：`.planning/phases/3.2-chinese-structured-input/3.2-PLAN.md`
- **上下文文件**：`.planning/phases/3.2-chinese-structured-input/3.2-CONTEXT.md`
- **总结文件**：`.planning/phases/3.2-chinese-structured-input/3.2-SUMMARY.md`
- **QA 文件**：`.planning/phases/3.2-chinese-structured-input/3.2-QA.md`

### Phase 3.3: Phoneme Detail Panel 🧭

- **目标**：补充音素/拼音单元详情、PAM/SLM 原因和例词/最小对立体入口
- **状态**：已完成（2026-07-03）
- **计划文件**：`.planning/phases/3.3-phoneme-detail-panel/3.3-PLAN.md`
- **总结文件**：`.planning/phases/3.3-phoneme-detail-panel/3.3-SUMMARY.md`
- **QA 文件**：`.planning/phases/3.3-phoneme-detail-panel/3.3-QA.md`

### Phase 4.1: Local Personalization 🧭

- **目标**：用本地训练历史和 L1-aware 难点生成下一步推荐
- **状态**：已完成（2026-07-03）
- **计划文件**：`.planning/phases/4.1-local-personalization/4.1-PLAN.md`
- **总结文件**：`.planning/phases/4.1-local-personalization/4.1-SUMMARY.md`

### Phase 5.1: Content Foundation 🧭

- **目标**：建立学习内容、媒体来源与授权元数据的通用契约和校验门禁
- **状态**：已规划，待开始
- **计划文件**：`.planning/phases/5.1-content-foundation/5.1-PLAN.md`
- **上下文文件**：`.planning/phases/5.1-content-foundation/5.1-CONTEXT.md`

### Phase 5.2: Trusted Audio & Accent Variants 🧭

- **目标**：标准音频优先、TTS 安全降级和语言自定义口音变体
- **状态**：已规划，依赖 5.1
- **计划文件**：`.planning/phases/5.2-trusted-audio-accents/5.2-PLAN.md`
- **上下文文件**：`.planning/phases/5.2-trusted-audio-accents/5.2-CONTEXT.md`

### Phase 5.3: Guided Phoneme Lessons 🧭

- **目标**：将音素详情深化为示范、上下文例词和专项练习的连续短课程
- **状态**：已规划，依赖 5.1、5.2
- **计划文件**：`.planning/phases/5.3-guided-phoneme-lessons/5.3-PLAN.md`
- **上下文文件**：`.planning/phases/5.3-guided-phoneme-lessons/5.3-CONTEXT.md`

### Phase 5.4: Local Record & Review 🧭

- **目标**：用 MediaRecorder + IndexedDB 提供本地录音、回放和删除
- **状态**：已规划，依赖 5.3
- **计划文件**：`.planning/phases/5.4-local-record-review/5.4-PLAN.md`
- **上下文文件**：`.planning/phases/5.4-local-record-review/5.4-CONTEXT.md`

### Phase 5.5: Data-driven Exercise Templates 🧭

- **目标**：建立共享练习模型并交付至少两种新的声音感知练习
- **状态**：已规划，依赖 5.1；可与 5.4 分别推进
- **计划文件**：`.planning/phases/5.5-data-driven-exercises/5.5-PLAN.md`
- **上下文文件**：`.planning/phases/5.5-data-driven-exercises/5.5-CONTEXT.md`

### Phase 5.6: New Language Pilot 🧭

- **目标**：接入第 3 种语言，验证内容、媒体和练习能力的可选扩展边界
- **状态**：已规划，依赖 5.1-5.5 的接口稳定
- **计划文件**：`.planning/phases/5.6-new-language-pilot/5.6-PLAN.md`
- **上下文文件**：`.planning/phases/5.6-new-language-pilot/5.6-CONTEXT.md`

## 已完成历史

### Phase 4.1: Local Personalization ✅

- **目标**：用本地训练历史和 L1-aware 难点生成下一步推荐
- **完成日期**：2026-07-03
- **交付物**：
  - `src/types.ts` — 新增 `MasteryRecord`、`Recommendation` 等本地个性化模型
  - `src/utils/storage.ts` — 新增 guarded mastery localStorage repository
  - `src/utils/recommendation.ts` — 新增普通拼写/minimal pair mastery 更新和推荐排序服务
  - `src/App.tsx` — 训练完成时更新 mastery，完成页展示下一步建议，Coach 面板改为手动打开
  - `src/components/SmartRecommend.tsx` — 改为可选 Coach，并提供清除个性化数据入口
  - `src/components/SessionResultView.tsx`、`src/components/MinimalPairView.tsx` — 展示“下一步建议”
  - `npm run validate:data`、`npm run lint`、`npm run build` 通过

### Phase 3.3: Phoneme Detail Panel ✅

- **目标**：补充音素/拼音单元详情、PAM/SLM 原因、例词和最小对立体入口
- **完成日期**：2026-07-03
- **交付物**：
  - `src/types.ts` — 新增 `PhonemeDetail` read model
  - `src/utils/phonemeDetails.ts` — 聚合 profile 元数据、L1 难点、例词和 minimal pairs
  - `src/components/PhonemeDetailPanel.tsx` — 新增详情抽屉，支持 Practice / Listen 行动
  - `src/App.tsx` — 新增主题、推荐、diff、minimal pair 复盘的详情入口
  - `src/components/SmartRecommend.tsx`、`src/components/PhonemeDiffView.tsx`、`src/components/SessionResultView.tsx`、`src/components/MinimalPairView.tsx` — 接入音素详情打开回调
  - `npm run validate:data`、`npm run lint`、`npm run build` 通过

### Phase 3.2: Chinese Structured Input ✅

- **目标**：将中文拼音输入升级为声母 → 韵母 → 声调结构化辅助
- **完成日期**：2026-07-02
- **交付物**：
  - `src/App.tsx` — 中文输入框 placeholder 提示“声母→韵母→声调”，保留自由输入
  - `src/components/PhoneticKeypad.tsx` — 中文轻声按钮显示并输入为 `5`，韵母按钮显示 `ü`
  - `.planning/phases/3.2-chinese-structured-input/3.2-QA.md` — 自动检查、规则检查和浏览器冒烟清单
  - `npm run validate:data`、`npm run lint`、`npm run build` 通过

### Phase 3.1: Targeted Minimal Pairs ✅

- **目标**：提供最小对立体 A/B 听辨训练
- **完成日期**：2026-07-02
- **交付物**：
  - `src/types.ts` — 新增 MinimalPairSet、MinimalPairSession、MinimalPairResult 等模型
  - `src/data/minimalPairBank.ts` — 新增 15 组结构化 minimal pair 数据（英语 8、中文 7）
  - `src/utils/minimalPairs.ts` — 题目生成、答案记录、完成和结果汇总服务
  - `src/components/MinimalPairView.tsx` — A/B 听辨视图、即时反馈和错题复盘
  - `src/App.tsx` — 新增 `minimal-pair` app mode，复用 Topic / Words / Voice 控件
  - `scripts/validateData.ts` — minimal pair 数据结构和 notation 校验
  - `npm run validate:data`、`npm run lint`、`npm run build` 通过

### Phase 2.4: Publish Readiness ✅

- **目标**：静态部署检查、README/PRD 对齐和发布前手动 QA 清单
- **完成日期**：2026-07-02
- **交付物**：
  - `README.md`、`README_EN.md` — 对齐多语言纯前端训练器定位和静态部署说明
  - `PRD.md` — 从旧英语 IPA PRD 更新为当前 M2/M3 产品需求
  - `index.html` — 更新页面标题
  - `.planning/phases/2.4-publish-readiness/2.4-QA.md` — 发布前 QA 清单
  - `GITHUB_PAGES=true npm run build` 和公开 Pages HTTP 200 验证通过

### Phase 2.3: Feedback & Session Results ✅

- **目标**：补齐 nearMatch/diff 反馈、会话结果页和本地最近训练记录
- **完成日期**：2026-07-02
- **交付物**：
  - `src/types.ts` — 新增 TrainingSession、TrainingAnswer、SessionResult 等会话/结果模型
  - `src/utils/trainingSession.ts` — 会话创建、答案追加、完成和结果汇总服务
  - `src/utils/storage.ts` — 本地最近训练结果读取、保存和清除
  - `src/components/PhonemeDiffView.tsx` — JudgeResult.diffs 差异展示
  - `src/components/SessionResultView.tsx` — 会话结果页、错题复盘和最近记录
  - `npm run lint`、`npm run build`、`npm run validate:data` 通过

### Phase 2.2: Data Cleaning ✅

- **目标**：清洗并校验训练数据、语言 Profile 数据和 L1×L2 映射数据
- **完成日期**：2026-07-02
- **交付物**：
  - `src/data/wordBank.ts` — 英语词库迁移为 `TrainingItem[]` 并按 identity 去重
  - `src/utils/pinyinParser.ts` — 轻声和拼音零声母/ü 规则归一
  - `scripts/validateData.ts` — Profile / 词库 / L1 映射校验入口
  - `npm run validate:data`、`npx tsc --noEmit`、`npm run build` 通过

### Phase 2.1: Standalone Training Core ✅

- **目标**：用户无需 L1 诊断、无需账号、无需后端即可开始并完成训练
- **完成日期**：2026-07-02
- **交付物**：
  - `src/components/OnboardingView.tsx` — L2 必选、L1 可选的入口
  - `src/App.tsx` — 无 L1 直接训练、训练设置、推荐层降级
  - `src/utils/trainingSession.ts` — 抽题与 fresh session 初始化工具
  - `src/components/TrainingView.tsx` — 看词听音 Previous/Next 导航
  - `npx tsc --noEmit` 和 `npm run build` 通过

### Phase 1.1: 类型系统 + Profile 架构 ✅

- **目标**：定义 LanguageProfile、TrainingItem、JudgeResult 等核心类型
- **完成日期**：2026-06-22
- **交付物**：
  - `src/types.ts` — 完整类型定义 + WordData 向后兼容
  - `src/utils/judge.ts` — phonemeJudge + stringJudge
  - `src/profiles/index.ts` — Profile 注册表 + SUPPORTED_L1

### Phase 1.2: 汉语 Profile + 词库 ✅

- **目标**：创建汉语拼音训练所需的全部数据
- **完成日期**：2026-06-22
- **交付物**：
  - `src/profiles/zh.ts` — 21 声母 + 35 韵母 + 5 声调 + 拼音判定
  - `src/utils/pinyinParser.ts` — 声调符号→数字转换 + 音节解析
  - `src/data/zhWordBank.ts` — HSK 1-3 词库（~250 条目）
  - `src/profiles/en.ts` — 英语 Profile（从散落逻辑整合）

### Phase 1.3: L1-Aware 推荐 ✅

- **目标**：基于 PAM/SLM 理论的 L1→L2 难度映射与查询 API
- **完成日期**：2026-06-22
- **交付物**：
  - `src/l1/zh_en.ts` — 中文母语者学英语的 11 个难点音素 + 6 个难点特征
  - `src/l1/en_zh.ts` — 英语母语者学中文的 12 个难点音素 + 4 个难点特征
  - `src/l1/difficultyMap.ts` — 注册表 + 查询 API（getTopHardPhonemes 等）

### Phase 1.4: UI 重构 ✅

- **目标**：将硬编码英语 UI 改为 profile-driven + 新增 Onboarding + SmartRecommend
- **完成日期**：2026-06-22
- **交付物**：
  - `src/components/PhoneticKeypad.tsx` — Profile-driven 键盘
  - `src/components/TrainingView.tsx` — 适配 TrainingItem + LanguageProfile
  - `src/components/SmartRecommend.tsx` — L1-aware 推荐面板
  - `src/components/OnboardingView.tsx` — 首次使用引导
  - `src/App.tsx` — 完整重写（L1/L2 管理 + 双栏布局）
  - `src/utils/voice.ts` — 多语言 TTS
  - `src/utils/phonemeGroups.ts` — Profile-driven 音素分组

### Phase 1.5: 编译验证 + 修复 ✅

- **目标**：零错误编译 + 生产构建通过
- **完成日期**：2026-06-22
- **交付物**：
  - `types.ts` 添加 `definition?: string` 修复 zhWordBank 类型错误
  - `npx tsc --noEmit` 零错误
  - `npm run build` 成功

## 最近重要决策

1. **2026-06-22** — 产品阶段重排：训练器本身必须完整；L1-aware 推荐是智能教练层，不作为开始训练的前置门槛
2. **2026-06-22** — MVP 架构决策：M2-M4 坚持纯前端，本地存储训练状态；后端进入 M6 可选增强
3. **2026-06-22** — 路线重排：M2 独立训练器，M3 专项训练/最小对立体，M4 本地个性化，M5 新语言，M6 云端增强
4. **2026-06-22** — Profile 架构：每个语言声明为 LanguageProfile 对象，UI 不含语言特定逻辑
5. **2026-06-22** — 拼音输入形式：拼写模式接受数字声调 (ni3)，训练模式显示声调符号 (nǐ)
6. **2026-06-22** — L1 数据结构：使用 PhonemeDifficulty (level 1-5) + FeatureDifficulty，不使用连续分数
7. **2026-06-22** — WordData 兼容：保留旧类型 + 转换函数，渐进式迁移
8. **2026-06-22** — IPAKeypad 旧组件：移除 require() 别名，App.tsx 直接使用 PhoneticKeypad
9. **2026-07-02** — 独立训练入口：L2 是进入训练的最小必要选择，L1 仅启用可选推荐层
10. **2026-07-02** — 抽题逻辑：训练题组初始化集中到 `src/utils/trainingSession.ts`
11. **2026-07-02** — DDD 架构：核心域确认为 Training Core + Feedback，Feedback 阶段应以 `TrainingSession` 和 `SessionResult` 为模型中心
12. **2026-07-02** — 路线调整：新增 Phase 2.2 Data Cleaning，先清理训练数据、Profile 和 L1×L2 映射，再进入 Feedback & Session Results
13. **2026-07-02** — 数据门禁：新增 `npm run validate:data`，后续修改 profile/词库/L1 映射必须通过结构与引用校验
14. **2026-07-02** — 英语词库格式：`wordBank.ts` 已迁移为 `TrainingItem[]`，`englishProfile` 不再运行时转换 legacy `WordData`
15. **2026-07-02** — 拼音解析语义：tone-number 正字法与内部 token 序列分离，`5` 轻声解析为 profile 声调 token `0`
16. **2026-07-02** — 训练反馈闭环：`TrainingSession.answers` 成为 score/result/history 的事实来源，nearMatch 独立于 exact correct 计分，本地历史保存 `SessionResult[]`
17. **2026-07-02** — M2 发布准备关闭：GitHub Pages 静态构建与公开 URL 已验证，README/PRD 对外叙事已对齐
18. **2026-07-02** — M3 启动：Phase 3.1 先做结构化 minimal pair 数据、A/B 听辨和本轮结果统计，仍不引入后端音频服务
19. **2026-07-02** — Minimal pair 数据独立为 `minimalPairBank`，不再把练习生成建立在 L1 映射里的 `"ship/sheep"` 字符串上
20. **2026-07-02** — Minimal pair 当前使用 Web Speech API，`MinimalPairOption.audioUrl` 预留给未来标准音频
21. **2026-07-02** — 3.1 QA 结论：Web Speech API 勉强可用，后续 minimal pair 应更换标准音频或更高质量 TTS
22. **2026-07-02** — 中文结构化输入定位为教学辅助，不取消 `ni3 hao3` 自由输入兜底
23. **2026-07-02** — 拼音结构化输入输出正字法 tone-number（如 `qu4`、`xue2`、`yue4`），解析层继续归一到内部 token
24. **2026-07-02** — 产品焦点暂停继续推进 Phase 3.3，先进入 Research R1 用户需求调研，验证训练方式、TTS 信任、反馈解释和 L1-aware 推荐价值
25. **2026-07-03** — Phase 3.3 恢复产品主线并完成：音素详情作为 Feedback/Coaching read model，不要求 L1，也不改变 Training Core
26. **2026-07-03** — Phase 4.1 完成：本地 mastery 成为 Learner Progress 聚合，推荐排序融合历史正确率与 L1 difficulty level；SmartRecommend 降级为手动打开的 Coach 层
27. **2026-07-15** — M5 路线调整：先借鉴 iSpeakerReact 建立可信内容、标准音频、引导式课程、本地录音和数据驱动练习，再进行新语言试点；不复制授权不明的课程/媒体，不在 M5 引入发音评分

## 当前阻塞项

无。

## 下一步工作

进入 Phase 5.1 Content Foundation：

- 先盘点现有 `TrainingItem`、`PhonemeDetail`、minimal pair 和音频字段，避免重复模型
- 定义来源、许可证、可再分发状态和 profile-facing 内容查询接口
- 用英语/中文小规模 fixture 验证同一契约与缺失内容降级
- 新语言选型推迟到 5.6，避免在内容接口尚未稳定时引入第三套特例

## 指标

| 指标 | 当前值 |
|------|--------|
| 支持语言数 | 2 (en, zh) |
| L1×L2 映射数 | 2 (zh→en, en→zh) |
| 最小对立体组数 | 15 (en 8, zh 7) |
| 英语词库条目 | 4,088 (COCA 去重后) |
| 汉语词库条目 | 250 (HSK 去重后) |
| 数据校验 | `npm run validate:data` 通过 |
| TypeScript 编译错误 | 0 |
| 构建产物大小 | ~863 KB (gzip ~201 KB) |
