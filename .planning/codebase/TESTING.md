# PhoneticMaster — 测试体系

> 最后更新：2026-07-02

## 1. 测试层次

```
          ┌─────────────────────┐
          │   E2E Tests (M5+)   │   ← Playwright / 手动 QA
          ├─────────────────────┤
          │  Integration Tests  │   ← 组件 + profile 集成
          ├─────────────────────┤
          │    Unit Tests       │   ← parser, judge, difficultyMap
          ├─────────────────────┤
          │ Data Validation     │   ← profile / wordBank / L1 map consistency ✅ 已有
          ├─────────────────────┤
          │   Type Checking     │   ← tsc --noEmit ✅ 已有
          ├─────────────────────┤
          │    Build Check      │   ← vite build ✅ 已有
          └─────────────────────┘
```

## 2. 当前测试能力

### 2.1 静态检查（已有）

| 检查 | 命令 | 状态 |
|------|------|------|
| TypeScript 类型检查 | `npx tsc --noEmit` | ✅ 零错误 |
| 生产构建 | `npm run build` | ✅ 通过 |
| 数据一致性校验 | `npm run validate:data` | ✅ 覆盖 profile / 词库 / L1 映射 |
| Phase 2.3 手动 QA | `.planning/phases/2.3-feedback-session-results/2.3-QA.md` | ✅ 覆盖结果页、diff、本地历史清除冒烟 |

### 2.2 数据校验（已有）

Phase 2.2 新增 `scripts/validateData.ts`，作为本地可重复运行的数据质量入口。

| 检查范围 | 覆盖内容 |
|----------|----------|
| Profile | code 唯一、音素/特征不重复、keypad 引用已声明音素 |
| Word bank | 字段完整、identity 去重、difficulty tier 一致 |
| Notation | `pronunciation` 可解析且 token 全部存在于 profile phonemes |
| Chinese Pinyin | `pronunciation` 为 tone-number form；`pronunciationAlt` 不含数字 |
| L1/L2 maps | code 已注册、level 1-5、hardPhonemes/hardFeatures 引用目标 profile |

当前限制：该脚本验证结构和引用一致性，不验证每条 IPA/拼音标注的语言学正确性。

### 2.3 单元测试（尚未建立）

当前项目没有测试框架。以下模块优先需要单元测试：

| 优先级 | 模块 | 关键测试点 |
|--------|------|------------|
| P0 | `utils/ipaParser.ts` | tokenizeIpa 对双字符音素 / 变体标准化的正确性 |
| P0 | `utils/pinyinParser.ts` | diacriticsToNumbers / parseSyllable / 边界音节 |
| P0 | `utils/judge.ts` | phonemeJudge 正确/nearMatch/incorrect / 长度差异 |
| P0 | `utils/storage.ts` | localStorage 读写失败降级 / history limit / malformed JSON |
| P1 | `l1/difficultyMap.ts` | getTopHardPhonemes 排序 / 无映射降级 |
| P1 | `profiles/en.ts` | englishProfile.judge 端到端 |
| P1 | `profiles/zh.ts` | chineseProfile.judge 端到端 / 声调容错 |
| P2 | `utils/phonemeGroups.ts` | getItemsByPhoneme 筛选 / 缓存行为 |
| P2 | `utils/voice.ts` | scoreVoice 优先级 / lang 筛选 |

### 2.4 组件测试（尚未建立）

| 优先级 | 组件 | 关键测试点 |
|--------|------|------------|
| P1 | `PhoneticKeypad` | 渲染 profile.keypadLayout 所有分区 / 点击回调 |
| P1 | `OnboardingView` | L1/L2 选择 / L1===L2 阻断 / onComplete 回调 |
| P2 | `SmartRecommend` | 无映射降级 / 音素点击 / 空状态 |
| P2 | `TrainingView` | TrainingItem 渲染 / IPA vs Pinyin 显示逻辑 |

## 3. 推荐测试框架

| 选项 | 优势 | 劣势 |
|------|------|------|
| Vitest | 与 Vite 原生集成，零配置 | — |
| Jest | 社区最大 | 需要额外配置 ESM + Vite |

**推荐**：Vitest，与现有 Vite 构建管道无缝集成。

## 4. 关键测试命令

```bash
# 类型检查
npx tsc --noEmit

# 生产构建
npm run build

# 数据校验
npm run validate:data

# Phase 2.3 手动 QA
# 见 .planning/phases/2.3-feedback-session-results/2.3-QA.md

# 单元测试（Vitest，待建立）
# npx vitest run

# 单元测试 watch 模式
# npx vitest

# 覆盖率
# npx vitest run --coverage
```

## 5. 测试缺口

| 优先级 | 缺口 | 风险 | 建议措施 |
|--------|------|------|----------|
| P0 | validateData 无单元测试 | 校验器自身规则回归时只靠真实数据发现 | 添加 fixture-based validator tests |
| P0 | 无 parser 单元测试 | 拼音解析边界错误（ü, er, 独立韵母） | M2 前添加 Vitest + parser 测试 |
| P0 | 无 judge 单元测试 | nearMatch 判定逻辑回归 | 引入 Vitest 后添加 judge 测试 |
| P0 | 无 storage 单元测试 | localStorage 异常或 malformed history 回归 | 引入 Vitest 后添加 storage 测试 |
| P1 | 无 profile 集成测试 | judge 端到端错误 | 添加 profile.judge 快照测试 |
| P2 | 无组件测试 | UI 行为回归 | 视需要添加 |
| P2 | 无 E2E 测试 | 用户流程断链 | M5 考虑 Playwright |
