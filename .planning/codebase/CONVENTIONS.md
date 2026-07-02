# PhoneticMaster — 项目级代码约定

> 回答"怎么写"。编码风格由 TypeScript + Tailwind 隐式约束，本文件记录工具管不到的架构级约定。
> 最后更新：2026-06-22

## 1. 依赖方向

```
components → profiles → utils / data / l1
    │                        ▲
    └────────────────────────┘
         (通过 profile 间接使用，不直接 import)
```

**硬规则**：
- `components/` **不得**直接 import `data/` 或 `utils/ipaParser.ts` / `utils/pinyinParser.ts`
- 所有数据访问通过 `profile.wordBank`，所有解析通过 `profile.parseNotation`
- `l1/` 模块只依赖 `types`，不依赖具体 profile
- `utils/` 模块互不依赖（ipaParser 和 pinyinParser 完全独立）

## 2. 类型约定

### 2.1 类型来源唯一

所有接口和类型定义在 `src/types.ts`，其他模块只 import 不定义新接口。

```ts
// ✅ 正确
import type { TrainingItem, LanguageProfile } from '../types';

// ❌ 错误：在组件文件中定义接口
interface MyTrainingItem { ... }
```

### 2.2 开放类别用 string，不用 enum

音素类别（vowel / consonant / initial / final / tone）是开放集合，用 `string` 类型：

```ts
// ✅ 正确
{ symbol: 'b', category: 'initial', label: '玻' }

// ❌ 错误：封闭枚举不利于扩展
enum PhonemeCategory { Vowel, Consonant, Initial, Final, Tone }
```

### 2.3 难度级别用 1-5 整数

```ts
// ✅ 正确
level: 5  // 最难

// ❌ 错误
level: 'hard'
level: 0.8
```

## 3. Profile 约定

### 3.1 Profile 必须自包含

每个 profile 文件必须导出一个完整的 `LanguageProfile` 对象，不能依赖外部注入：

```ts
// ✅ 正确
export const chineseProfile: LanguageProfile = {
  code: 'zh',
  parseNotation: parsePinyin,      // 从同项目 utils import
  judge: zhJudge,                   // 在 profile 文件内定义
  wordBank: zhWordBank,             // 从同项目 data import
  ...
};

// ❌ 错误：运行时注入
function createChineseProfile(parser, judge, wordBank) { ... }
```

### 3.2 新语言接入清单

添加新语言时需要：

1. 创建 `src/profiles/{code}.ts` — 导出 `{language}Profile`
2. 创建 `src/data/{code}WordBank.ts` — 导出 TrainingItem[] 词库
3. 在 `src/profiles/index.ts` 中 import 并加入 SUPPORTED_L2
4. （可选）创建 `src/utils/{code}Parser.ts` — 如有新记号体系
5. （可选）创建 `src/l1/{l1}_{l2}.ts` — L1 难度映射

**不得**修改 `types.ts`、`App.tsx` 或任何组件文件。

### 3.3 judge 函数必须处理边界

```ts
function zhJudge(input: string, target: string): JudgeResult {
  // 必须处理：空输入、斜线包裹、空白
  const cleanInput = input.trim().replace(/^\/|\/$/g, '');
  const cleanTarget = target.trim().replace(/^\/|\/$/g, '');
  ...
}
```

## 4. 组件约定

### 4.1 Props 类型内联

组件 Props 用 interface 定义在组件文件内，不放到 types.ts：

```ts
// ✅ 正确
interface TrainingViewProps {
  items: TrainingItem[];
  profile: LanguageProfile;
  ...
}
```

### 4.2 Profile 作为 prop 传递

需要 profile 的组件必须通过 props 接收，不自行 import：

```tsx
// ✅ 正确
<PhoneticKeypad profile={profile} onInsert={handleCharInsert} />

// ❌ 错误
import { englishProfile } from '../profiles/en';
<PhoneticKeypad profile={englishProfile} ... />
```

### 4.3 语言特定 UI 通过 profile 属性判断

```tsx
// ✅ 正确：用 profile.notationName 判断
placeholder={profile.notationName === 'Pinyin' ? '输入拼音...' : 'Enter IPA...'}

// ❌ 错误：用 profile.code 判断
placeholder={profile.code === 'zh' ? '输入拼音...' : 'Enter IPA...'}
```

## 5. 数据约定

### 5.1 词库格式统一为 TrainingItem

新词库必须使用 `TrainingItem[]`，不使用 `WordData[]`：

```ts
// ✅ 正确（新词库）
const zhWordBank: Record<Difficulty, TrainingItem[]> = { ... };

// ❌ 错误（遗留格式）
const jaWordBank: Record<Difficulty, WordData[]> = { ... };
```

### 5.2 拼音记号形式

- 存储/比较用：**数字声调** (`ni3 hao3`)
- 显示用：**声调符号** (`nǐ hǎo`)，存于 `pronunciationAlt`
- `pronunciation` 字段始终用数字声调形式（规范形式）

### 5.3 L1×L2 映射数据结构

```ts
export const zh_en: L1L2Difficulty = {
  l1: 'zh',           // 必须与 SUPPORTED_L1 中的 code 一致
  l2: 'en',           // 必须与 profile.code 一致
  hardPhonemes: [...], // 按 level 降序排列
  hardFeatures: [...], // 按 level 降序排列
};
```

### 5.4 数据校验

修改 `src/profiles/*`、`src/data/*` 或 `src/l1/*` 后必须运行：

```bash
npm run validate:data
```

该命令校验字段完整性、TrainingItem identity、difficulty tier、notation token、keypad 引用和 L1/L2 映射引用。

## 6. 样式约定

- 使用 Tailwind utility classes，不写自定义 CSS
- 音标符号使用 `ipa-text` CSS class（定义在 index.css 中）
- 拼音文字不使用 `ipa-text`（用默认字体渲染即可）
- 圆角使用 `rounded-[40px]`（卡片）或 `rounded-2xl`（面板）
- 间距以 Tailwind 的 4px 基准为准

## 7. 许可证头

每个源文件必须以 SPDX 许可证头开头：

```ts
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
```
