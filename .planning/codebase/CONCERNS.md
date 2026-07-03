# PhoneticMaster — 代码库问题清单

> 记录已知的技术债、脆弱区域和需要关注的问题。**每条必须包含文件路径。**
> 最后更新：2026-07-03

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
- **安全修改方式**：先更新 `src/utils/__tests__/pinyinParser.test.ts` fixture；不改变现有声母/韵母表的结构
- **测试覆盖**：✅ tone-number、diacritics、ü/v、j/q/x+ü、zero-initial、er、neutral tone、round-trip

### 2.1 L1×L2 映射数据质量

- **文件**：`src/l1/zh_en.ts`、`src/l1/en_zh.ts`
- **脆弱原因**：映射数据基于语言学文献但未经大规模验证，可能有遗漏或过度简化
- **常见失败**：某些难点音素未覆盖；minimalPairs 列表可能不够典型
- **安全修改方式**：逐步补充，不删除现有条目；新增条目需标注来源
- **测试覆盖**：✅ `npm run validate:data` 覆盖结构与引用一致性；❌ 不验证语言学正确性

### 2.2 数据校验仍偏结构化

- **文件**：`scripts/validateData.ts`、`src/data/wordBank.ts`、`src/data/zhWordBank.ts`、`src/data/minimalPairBank.ts`
- **脆弱原因**：Phase 2.2 校验能证明字段、identity、notation token 和引用一致，但不能证明每个 IPA/拼音标注在语言学上完全正确
- **常见失败**：错误音标仍可能是“可解析 token”；minimalPairs 可能格式正确但教学价值一般
- **安全修改方式**：后续引入抽样审校、来源字段或专门的词库导入/校验流程
- **测试覆盖**：✅ 结构校验；❌ 内容正确性审校

### 2.3 最小对立体依赖浏览器 TTS

- **文件**：`src/components/MinimalPairView.tsx`、`src/utils/minimalPairs.ts`、`src/data/minimalPairBank.ts`
- **脆弱原因**：Phase 3.1 使用 Web Speech API 播放 prompt；浏览器语音可能无法稳定体现 minimal pair 的关键音系差异，尤其是中文声调和英语元音细微对比
- **常见失败**：TTS 发音不自然、不同浏览器声音差异大、同形中文词的语义读音不可控
- **安全修改方式**：`MinimalPairOption.audioUrl` 已预留；核心 pair 后续应接入人工审校标准音频或高质量 TTS 音频
- **测试覆盖**：✅ 数据结构校验；❌ 发音质量不可自动验证

### 2.4 本地推荐权重仍为启发式

- **文件**：`src/utils/recommendation.ts`
- **脆弱原因**：Phase 4.1 先用历史正确率、低样本提示和 L1 difficulty level 做启发式融合，尚未经过真实学习数据校准。
- **常见失败**：推荐过度偏向低样本历史、过度保守地重复已掌握音素，或 L1 难点权重不符合实际用户感受。
- **安全修改方式**：调整权重前先更新 `src/utils/__tests__/recommendation.test.ts` fixture；保持无 L1、无历史、无 storage 三种降级路径。
- **测试覆盖**：✅ `src/utils/__tests__/recommendation.test.ts` 覆盖普通拼写、minimal pair、training mode 不写入 mastery 和 L1/history/fallback 排序；❌ 权重仍未由真实学习数据校准

## 3. 测试覆盖缺口

| 优先级 | 文件 | 风险 |
|--------|------|------|
| P0 | `scripts/validateData.ts` | 当前作为脚本运行，无单元测试覆盖各类失败样例 |
| P1 | `src/utils/voice.ts` | TTS voice ranking / preference persistence 缺少 fake Web Speech 单元测试 |
| P1 | `src/App.tsx` | 顶层模式切换、训练完成到推荐展示的完整流程仍主要靠手动 QA |
| P2 | `src/components/IPAKeypad.tsx` | 遗留死代码无测试，建议删除而不是补测 |

## 4. 依赖风险

| 依赖 | 风险 | 影响 |
|------|------|------|
| Web Speech API | 浏览器实现差异大；部分浏览器无中文 TTS；minimal pairs 的细微音差可能不稳定 | 汉语训练 TTS 和专项听辨可信度可能受影响 |
| motion (Framer Motion) | 包体积大 (~30KB gzip) | 增加构建产物大小 |
| Tailwind CSS v4 | 仍在活跃迭代 | 升级可能有 breaking change |
| localStorage | 隐私模式下可能抛异常 | 已 try/catch 处理 |
| npm audit | 当前 `npm audit --omit=dev` 为 0 vulnerabilities | 继续在依赖升级后运行 |

## 5. 性能关注点

| 操作 | 预估耗时 | 文件 | 改进方向 |
|------|----------|------|----------|
| 首次 buildPhonemeGroups | ~5ms | `utils/phonemeGroups.ts` | 已缓存，可接受 |
| 构建产物大小 | 863KB / 201KB gzip | 全局 | code splitting |
| 汉语词库加载 | ~2ms | `data/zhWordBank.ts` | 未来可按 HSK 级别懒加载 |

---

*清单更新：2026-07-03*
*问题解决后删除对应条目，新发现问题随时追加*
