# PhoneticMaster — 代码库问题清单

> 记录已知的技术债、脆弱区域和需要关注的问题。**每条必须包含文件路径。**
> 最后更新：2026-07-02

## 1. 技术债

### 1.1 旧 IPAKeypad 组件残留

- **文件**：`src/components/IPAKeypad.tsx`
- **问题**：此文件已不再被任何模块引用（App.tsx 使用 PhoneticKeypad），属于死代码
- **影响**：增加维护困惑；新开发者可能误用
- **修复方向**：直接删除
- **当前状态**：待清理

### 1.2 phonemeGroups 缓存无主动失效

- **文件**：`src/utils/phonemeGroups.ts:14`
- **问题**：GROUP_CACHE 以 profile.code 为 key 缓存，但同一 profile 的 wordBank 如果在运行时被修改，缓存不会更新
- **影响**：当前无运行时修改词库的场景，风险极低
- **修复方向**：添加 `invalidateCache(code?)` 函数
- **当前状态**：低风险，可延后

## 2. 脆弱区域

### 2.0 拼音解析器

- **文件**：`src/utils/pinyinParser.ts`
- **脆弱原因**：拼音音节边界判定依赖声母表 + 韵母表 + 贪心匹配，边界情况多（如 "er"、"yuan"、"nv"）
- **常见失败**：非标准拼写（如 "ng" 做韵母）、省写形式（如 "ju" 实际为 j+ü）
- **安全修改方式**：添加测试后再改动；不改变现有声母/韵母表的结构
- **测试覆盖**：❌ 无

### 2.1 phonemeJudge 长度差异

- **文件**：`src/utils/judge.ts:32-43`
- **脆弱原因**：当 input 和 target 长度差异较大时，nearMatch 判定可能不准确（只检查 diffs.length ≤ 1）
- **常见失败**：用户只输入了一半音素，仍被判为 nearMatch
- **安全修改方式**：增加长度差异比例检查
- **测试覆盖**：❌ 无

### 2.2 L1×L2 映射数据质量

- **文件**：`src/l1/zh_en.ts`、`src/l1/en_zh.ts`
- **脆弱原因**：映射数据基于语言学文献但未经大规模验证，可能有遗漏或过度简化
- **常见失败**：某些难点音素未覆盖；minimalPairs 列表可能不够典型
- **安全修改方式**：逐步补充，不删除现有条目；新增条目需标注来源
- **测试覆盖**：✅ `npm run validate:data` 覆盖结构与引用一致性；❌ 不验证语言学正确性

### 2.3 数据校验仍偏结构化

- **文件**：`scripts/validateData.ts`、`src/data/wordBank.ts`、`src/data/zhWordBank.ts`
- **脆弱原因**：Phase 2.2 校验能证明字段、identity、notation token 和引用一致，但不能证明每个 IPA/拼音标注在语言学上完全正确
- **常见失败**：错误音标仍可能是“可解析 token”；minimalPairs 可能格式正确但教学价值一般
- **安全修改方式**：后续引入抽样审校、来源字段或专门的词库导入/校验流程
- **测试覆盖**：✅ 结构校验；❌ 内容正确性审校

## 3. 测试覆盖缺口

| 优先级 | 文件 | 风险 |
|--------|------|------|
| P0 | `scripts/validateData.ts` | 当前作为脚本运行，无单元测试覆盖各类失败样例 |
| P0 | `src/utils/pinyinParser.ts` | 边界音节解析错误直接影响汉语训练 |
| P0 | `src/utils/judge.ts` | 判定逻辑错误影响所有语言的反馈 |
| P0 | `src/utils/ipaParser.ts` | 双字符音素匹配顺序影响英语训练 |
| P1 | `src/l1/difficultyMap.ts` | 排序/降级逻辑错误影响推荐 |
| P1 | `src/profiles/zh.ts` | zhJudge 声调容错逻辑 |
| P2 | `src/components/OnboardingView.tsx` | L1===L2 阻断逻辑 |

## 4. 依赖风险

| 依赖 | 风险 | 影响 |
|------|------|------|
| Web Speech API | 浏览器实现差异大；部分浏览器无中文 TTS | 汉语训练 TTS 可能不可用 |
| motion (Framer Motion) | 包体积大 (~30KB gzip) | 增加构建产物大小 |
| Tailwind CSS v4 | 仍在活跃迭代 | 升级可能有 breaking change |
| localStorage | 隐私模式下可能抛异常 | 已 try/catch 处理 |

## 5. 性能关注点

| 操作 | 预估耗时 | 文件 | 改进方向 |
|------|----------|------|----------|
| 首次 buildPhonemeGroups | ~5ms | `utils/phonemeGroups.ts` | 已缓存，可接受 |
| 构建产物大小 | 668KB / 193KB gzip | 全局 | code splitting |
| 汉语词库加载 | ~2ms | `data/zhWordBank.ts` | 未来可按 HSK 级别懒加载 |

---

*清单更新：2026-07-02*
*问题解决后删除对应条目，新发现问题随时追加*
