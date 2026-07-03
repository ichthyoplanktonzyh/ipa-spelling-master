# PhoneticMaster — 测试体系

> 最后更新：2026-07-03

## 1. 测试层次

```
          ┌─────────────────────┐
          │   E2E Tests (M5+)   │   ← Playwright / 手动 QA
          ├─────────────────────┤
          │  Integration Tests  │   ← Testing Library + profile 集成 ✅ 部分已有
          ├─────────────────────┤
          │    Unit Tests       │   ← Vitest: parser/judge/training/storage/recommendation ✅ 已建立
          ├─────────────────────┤
          │ Data Validation     │   ← profile / wordBank / L1 map / minimal pairs ✅ 已有
          ├─────────────────────┤
          │   Type Checking     │   ← tsc --noEmit ✅ 已有
          ├─────────────────────┤
          │    Build Check      │   ← vite build ✅ 已有
          └─────────────────────┘
```

## 2. 当前测试能力

| 检查 | 命令 | 状态 |
|------|------|------|
| TypeScript 类型检查 | `npx tsc --noEmit` / `npm run lint` | ✅ 零错误 |
| Vitest 单元/组件测试 | `npm run test` | ✅ 18 files / 66 tests |
| 覆盖率报告 | `npm run test:coverage` | ✅ V8 coverage baseline；不设阈值 |
| 生产构建 | `npm run build` | ✅ 通过 |
| 数据一致性校验 | `npm run validate:data` | ✅ 覆盖 profile / 词库 / L1 映射 / minimal pairs |
| 依赖审计 | `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| Phase 2.3 手动 QA | `.planning/phases/2.3-feedback-session-results/2.3-QA.md` | ✅ 覆盖结果页、diff、本地历史清除冒烟 |
| Phase 3.3 手动 QA | `.planning/phases/3.3-phoneme-detail-panel/3.3-QA.md` | ✅ 覆盖详情入口、降级、专项训练跳转 |

### 2.1 数据校验（已有）

Phase 2.2 新增 `scripts/validateData.ts`，作为本地可重复运行的数据质量入口。

| 检查范围 | 覆盖内容 |
|----------|----------|
| Profile | code 唯一、音素/特征不重复、keypad 引用已声明音素 |
| Word bank | 字段完整、identity 去重、difficulty tier 一致 |
| Notation | `pronunciation` 可解析且 token 全部存在于 profile phonemes |
| Chinese Pinyin | `pronunciation` 为 tone-number form；`pronunciationAlt` 不含数字 |
| L1/L2 maps | code 已注册、level 1-5、hardPhonemes/hardFeatures 引用目标 profile |
| Minimal pairs | l2 已注册、target/contrast 引用目标 profile、候选 pronunciation 可解析、候选覆盖 target/contrast、audioUrl 非空 |

当前限制：该脚本验证结构和引用一致性，不验证每条 IPA/拼音标注的语言学正确性。

### 2.2 单元和集成测试

| 优先级 | 模块 | 覆盖 |
|--------|------|------|
| P0 | `utils/ipaParser.ts` | ✅ 多字符音素贪心匹配、标记清理、变体标准化、未知字符跳过、unique 顺序 |
| P0 | `utils/pinyinParser.ts` | ✅ tone-number、diacritics、ü/v、j/q/x+ü、zero-initial、er、neutral tone、round-trip |
| P0 | `utils/judge.ts` | ✅ exact、nearMatch、incorrect、多 diff、长度差异、stringJudge |
| P0 | `utils/storage.ts` | ✅ localStorage 读写失败静默降级、malformed JSON、clear、history limit、mastery load/save/clear |
| P1 | `utils/recommendation.ts` | ✅ 普通拼写 mastery、nearMatch/incorrect 音素归因、minimal pair、推荐降级/排序、training mode 不写入 |
| P1 | `utils/trainingSession.ts` | ✅ item identity、phoneme picking、answer replacement、result scoring |
| P1 | `utils/minimalPairs.ts` | ✅ pair filtering、question cycling、answer/result summary、audioText fallback |
| P1 | `utils/phonemeDetails.ts` | ✅ 无 L1 降级、L1 难点合并、examples fallback、minimal pair 聚合 |
| P1 | `l1/difficultyMap.ts` | ✅ hard phoneme 排序、无映射降级、hard features |
| P1 | `profiles/*` | ✅ registry、English IPA judge、Chinese Pinyin judge 端到端 |
| P2 | `utils/phonemeGroups.ts` | ✅ 通过 recommendation、trainingSession、phonemeDetails 间接覆盖 |

### 2.3 组件测试

组件测试使用 Testing Library + jsdom，按用户可见文本和交互回调断言，不做 className 快照。

| 优先级 | 组件 | 覆盖 |
|--------|------|------|
| P1 | `PhoneticKeypad` | ✅ Pinyin display label 与 canonical insert |
| P1 | `OnboardingView` | ✅ L2 必选、L1 可选、L1===L2 阻断、onComplete |
| P1 | `TrainingView` | ✅ 当前题展示、Pinyin display notation、播放/下一题/换题回调 |
| P1 | `SessionResultView` | ✅ score、mistake review、next recommendation、history/action callbacks |
| P1 | `MinimalPairView` | ✅ 空材料降级、播放、候选选择、完成按钮状态 |
| P2 | `SmartRecommend` | ✅ 空状态、推荐点击、详情、清除个性化数据 |
| P2 | `PhonemeDetailPanel` | ✅ 空 detail、L1 insight、examples/minimal pair action、关闭 |

## 3. 测试命令

```bash
# 类型检查
npm run lint

# 生产构建
npm run build

# 数据校验
npm run validate:data

# 单元/组件测试
npm run test

# watch 模式
npm run test:watch

# 覆盖率报告
npm run test:coverage

# 生产依赖审计
npm audit --omit=dev
```

## 4. 当前缺口

| 优先级 | 缺口 | 风险 | 建议措施 |
|--------|------|------|----------|
| P0 | validateData 无单元测试 | 校验器自身规则回归时只靠真实数据发现 | 添加 fixture-based validator tests |
| P1 | `utils/voice.ts` 无单元测试 | TTS voice ranking / localStorage preference 逻辑仍靠手动验证 | 添加 fake speechSynthesis / localStorage fixtures |
| P1 | `App.tsx` 无 E2E/集成测试 | 顶层模式切换和完整用户流程断链只能靠手动 QA 发现 | M5 考虑 Playwright 或较薄的 shell integration tests |
| P2 | coverage 只建 baseline、未设阈值 | 覆盖率可能后续下降而不阻断 | 稳定后设置分层阈值，先从 utils 开始 |
| P2 | 无 E2E 测试 | 用户流程断链 | M5 考虑 Playwright |
