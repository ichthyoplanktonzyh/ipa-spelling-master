# PhoneticMaster — 代码库物理结构

> 回答"文件放在哪"。概念分层见 ARCHITECTURE.md。
> 最后更新：2026-07-03

## 1. 顶层目录布局

```
ipa-spelling/
├── .planning/              ← 项目规划文档
│   ├── PROJECT.md
│   ├── STATE.md
│   ├── ROADMAP.md
│   ├── REQUIREMENTS.md
│   ├── codebase/
│   ├── phases/
│   └── handoff/
├── dist/                   ← 构建产物（gitignore）
├── public/                 ← 静态资源
├── scripts/                ← 本地维护/校验脚本
├── src/
│   ├── components/         ← React UI 组件
│   │   └── __tests__/      ← Testing Library 组件测试
│   ├── data/               ← 词库数据
│   ├── l1/                 ← L1×L2 难度映射
│   │   └── __tests__/      ← difficulty map 单元测试
│   ├── profiles/           ← 语言 Profile 定义
│   │   └── __tests__/      ← profile registry / judge 集成测试
│   ├── test/               ← Vitest setup
│   ├── utils/              ← 工具函数（解析、判定、语音）
│   │   └── __tests__/      ← Vitest 单元测试（utils fixtures）
│   ├── App.tsx             ← 应用入口组件
│   ├── index.css           ← 全局样式
│   ├── main.tsx            ← React 渲染入口
│   └── types.ts            ← 全局类型定义
├── AGENT.md                ← AI 代理维护指南
├── index.html              ← HTML 入口
├── package.json
├── server.ts               ← Express 开发/生产服务器
├── tsconfig.json
└── vite.config.ts
```

## 2. 目录职责

### `.planning/codebase/`

| 文件 | 职责 |
|------|------|
| `ARCHITECTURE.md` | 当前系统骨架、数据流、模块职责和架构边界 |
| `DDD-ARCHITECTURE.md` | DDD 分析：统一语言、子域、限界上下文、聚合和演进分层 |
| `STRUCTURE.md` | 代码库物理结构和新代码放置规则 |
| `STACK.md` | 技术栈、依赖和构建命令 |
| `CONVENTIONS.md` | 项目级代码约定 |
| `DATA-MODEL.md` | 类型关系、身份策略和持久化语义 |
| `TESTING.md` | 测试层次、当前覆盖和缺口 |
| `CONCERNS.md` | 技术债、脆弱区域和风险 |

### `src/components/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `App.tsx` | 应用壳：L1/L2 状态、模式切换、组件编排 | types, profiles, utils, 所有组件 |
| `OnboardingView.tsx` | 首次使用引导：L1/L2 选择 | profiles |
| `TrainingView.tsx` | 训练模式视图：卡片 + 播放 + 导航 | types |
| `PhoneticKeypad.tsx` | Profile-driven 音标/拼音键盘 | types |
| `PhonemeDiffView.tsx` | 音素/拼音单元差异展示 | types |
| `PhonemeDetailPanel.tsx` | 音素/拼音单元详情抽屉，展示 L1 难点、例词和最小对立体入口 | types |
| `SessionResultView.tsx` | 会话结果页、错题复盘、下一步建议和最近记录 | types, PhonemeDiffView |
| `MinimalPairView.tsx` | 最小对立体 A/B 听辨、即时反馈和本轮结果 | types |
| `SmartRecommend.tsx` | 可选 Coach 面板，展示本地历史 + L1-aware 推荐和清除个性化数据入口 | types, l1/difficultyMap, profiles |
| `IPAKeypad.tsx` | 旧英语键盘（遗留，可删除） | — |

### `src/components/__tests__/`

| 文件 | 职责 | 覆盖 |
|------|------|------|
| `PhoneticKeypad.test.tsx` | Profile-driven 键盘组件测试 | Pinyin label/canonical insert |
| `OnboardingView.test.tsx` | 首次选择流程组件测试 | L2 必选、L1 可选、L1===L2 阻断 |
| `TrainingView.test.tsx` | 看词听音视图组件测试 | 当前题展示、播放/下一题/换题回调 |
| `SessionResultView.test.tsx` | 结果页组件测试 | score、mistake review、推荐和历史 action |
| `MinimalPairView.test.tsx` | A/B 听辨组件测试 | 空材料降级、播放、选择、完成按钮状态 |
| `SmartRecommend.test.tsx` | Coach 面板组件测试 | 空状态、推荐/详情/清除回调 |
| `PhonemeDetailPanel.test.tsx` | 音素详情抽屉组件测试 | 空状态、L1 insight、practice/listen/close |

### `src/data/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `wordBank.ts` | 英语词库（TrainingItem 格式，COCA 去重数据） | types |
| `zhWordBank.ts` | 汉语词库（TrainingItem 格式，HSK 1-3） | types |
| `minimalPairBank.ts` | 英语/中文结构化最小对立体材料 | types |

### `scripts/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `validateData.ts` | 校验 profile、词库、L1/L2 映射和 minimal pair 数据一致性 | src/types, profiles, l1, data, pinyinParser |

### `src/l1/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `difficultyMap.ts` | L1×L2 难度注册表 + 查询 API | types, zh_en, en_zh |
| `zh_en.ts` | 中文→英语难度映射 | types |
| `en_zh.ts` | 英语→中文难度映射 | types |

### `src/l1/__tests__/`

| 文件 | 职责 | 覆盖 |
|------|------|------|
| `difficultyMap.test.ts` | L1 difficulty query 单元测试 | 排序、无映射降级、hard features |

### `src/profiles/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `index.ts` | Profile 注册表 + L1 列表 | types, en, zh |
| `en.ts` | 英语 LanguageProfile | types, ipaParser, judge, wordBank |
| `zh.ts` | 汉语 LanguageProfile | types, pinyinParser, judge, zhWordBank |

### `src/profiles/__tests__/`

| 文件 | 职责 | 覆盖 |
|------|------|------|
| `profiles.test.ts` | Profile registry 和 judge adapter 集成测试 | en/zh 注册、English IPA judge、Chinese Pinyin judge |

### `src/utils/`

| 文件 | 职责 | 依赖 |
|------|------|------|
| `ipaParser.ts` | IPA 音素分词 + 变体标准化 | — |
| `pinyinParser.ts` | 拼音解析（声调符号→数字→声母韵母声调） | — |
| `judge.ts` | 音素级判定 + 字符串判定 | types |
| `voice.ts` | TTS 语音管理（获取、选择、持久化） | — |
| `phonemeGroups.ts` | 音素分组查询（profile-driven） | types |
| `phonemeDetails.ts` | 音素详情读模型查询：profile 元数据、L1 难点、例词和 minimal pairs | types, l1, phonemeGroups, minimalPairs |
| `trainingSession.ts` | 训练题组抽取、会话创建、答案追加和结果汇总 | types, phonemeGroups |
| `minimalPairs.ts` | 最小对立体题目生成、答案记录和结果汇总 | types, minimalPairBank |
| `storage.ts` | 最近训练结果与本地 mastery 的 localStorage repository | types |
| `recommendation.ts` | 本地 mastery 聚合与下一步推荐排序 | types, l1/difficultyMap, phonemeGroups |

### `src/utils/__tests__/`

| 文件 | 职责 | 覆盖 |
|------|------|------|
| `recommendation.test.ts` | Phase 4.1 本地个性化 fixture 单测 | mastery 聚合、nearMatch/incorrect 音素归因、minimal pair、推荐降级/排序、training mode 不写入 |
| `storage.test.ts` | localStorage repository 单测 | 读写失败静默降级、malformed JSON、clear、history limit、mastery load/save/clear |
| `ipaParser.test.ts` | IPA parser fixture 单测 | 多字符音素、标记清理、变体标准化、unknown skip |
| `pinyinParser.test.ts` | Pinyin parser fixture 单测 | tone-number、diacritics、ü/v、zero-initial、neutral tone |
| `judgeMatrix.test.ts` | judge 判定矩阵 | exact、nearMatch、incorrect、长度差异、stringJudge |
| `trainingSession.test.ts` | 训练 session 工具单测 | item identity、pickItems、answer replacement、scoring |
| `minimalPairs.test.ts` | minimal pair 工具单测 | filtering、question cycling、answer/result summary |
| `phonemeDetails.test.ts` | 音素详情 read model 单测 | L1/no-L1、examples、minimal pair 聚合 |

### `src/test/`

| 文件 | 职责 |
|------|------|
| `setup.ts` | Vitest setup，安装 jest-dom matcher 并在每个测试后 cleanup Testing Library DOM |

## 3. 命名约定

| 维度 | 约定 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `OnboardingView.tsx`, `PhoneticKeypad.tsx` |
| 工具文件 | camelCase.ts | `ipaParser.ts`, `pinyinParser.ts` |
| 数据文件 | camelCase.ts | `wordBank.ts`, `zhWordBank.ts` |
| L1 映射文件 | `{l1}_{l2}.ts` | `zh_en.ts`, `en_zh.ts` |
| Profile 文件 | `{code}.ts` | `en.ts`, `zh.ts` |
| 导出主对象 | camelCase (profile) / PascalCase (component) | `englishProfile`, `PhoneticKeypad` |
| 类型 | PascalCase | `TrainingItem`, `LanguageProfile` |
| CSS class | Tailwind utility classes | — |

## 4. 新代码应该放哪

| 场景 | 位置 | 示例 |
|------|------|------|
| 添加新语言 | `src/profiles/{code}.ts` + `src/data/{code}WordBank.ts` | `ja.ts` + `jaWordBank.ts` |
| 添加专项最小对立体数据 | `src/data/minimalPairBank.ts` | 新增 `MinimalPairSet` |
| 添加新 L1×L2 映射 | `src/l1/{l1}_{l2}.ts` | `ja_en.ts` |
| 添加新 UI 组件 | `src/components/{Name}.tsx` | `MinimalPairView.tsx` |
| 添加组件测试 | `src/components/__tests__/{Name}.test.tsx` | `TrainingView.test.tsx` |
| 添加新工具函数 | `src/utils/{name}.ts` | `statsCalculator.ts` |
| 添加工具函数单元测试 | `src/utils/__tests__/{name}.test.ts` | `recommendation.test.ts` |
| 添加本地浏览器存储 adapter | `src/utils/{name}.ts` | `storage.ts` |
| 添加维护/校验脚本 | `scripts/{name}.ts` | `validateData.ts` |
| 添加新类型 | `src/types.ts`（同一文件） | 新增接口 |
| 添加新 L1 选项 | `src/profiles/index.ts` 的 SUPPORTED_L1 数组 | `{code: 'th', label: 'ไทย'}` |

## 5. 特殊文件

| 文件 | 说明 |
|------|------|
| `AGENT.md` | AI 代理维护入口，压缩引用 `.planning/` 的核心规则 |
| `src/types.ts` | 全局类型唯一来源，所有模块从此 import 类型 |
| `src/profiles/index.ts` | Profile 注册中心，新增语言必须在此 import 并注册 |
| `scripts/validateData.ts` | 数据质量门禁，新增 profile/词库/L1 映射/minimal pair 后必须通过 |
| `src/main.tsx` | React 入口，仅做 ReactDOM.createRoot + App 渲染 |
| `server.ts` | Express 服务器，开发模式用 Vite 中间件，生产模式 serve dist/ |
