# PhoneticMaster — 文档体系维护规则

> 最后更新：2026-07-02
> 基于 LLPlayerNext 的 GSD 文件结构体系，结合本项目实践制定

---

## 一、文件职责速查

| 文件 | 更新频率 | 职责 | 语气 |
|---|---|---|---|
| `STATE.md` | 每个 phase 完成时 | 记录现在在哪、下一步干什么。项目活记忆。 | 情境描述 |
| `PROJECT.md` | 产品方向变化时 | 战略描述：愿景、定位、核心概念、非目标 | 宏观 |
| `REQUIREMENTS.md` | 需求增删改时 | 战术描述：可实施、可测试的需求项 | 精确 |
| `ROADMAP.md` | 路线调整时 | 阶段管理：里程碑划分、优先级、依赖关系 | 规划 |

| codebase 文件 | 更新频率 | 职责 | 语气 |
|---|---|---|---|
| `ARCHITECTURE.md` | 架构变化时 | 系统骨架：全景图、数据流、模块职责、边界 | 结构化 |
| `DDD-ARCHITECTURE.md` | 领域边界变化时 | DDD 视角：统一语言、子域、限界上下文、聚合、演进分层 | 决策性 |
| `STRUCTURE.md` | 文件增删时 | 代码库地图：目录树、新代码放哪 | 查询导向 |
| `STACK.md` | 依赖变化时 | 技术栈清单：版本、用途、构建命令 | 参考 |
| `CONVENTIONS.md` | 编码约定变化时 | 架构级规则：依赖方向、Profile 规范、数据格式 | 规范性 |
| `DATA-MODEL.md` | 类型/持久化变化时 | 类型关系、记号语义、存储策略 | 精确 |
| `TESTING.md` | 测试体系变化时 | 测试层次、覆盖情况、缺口 | 诊断性 |
| `CONCERNS.md` | 发现/解决问题时 | 技术债、脆弱区域、风险 | 诚实诊断 |

---

## 二、目录职责

### `.planning/` — 项目管理中枢

| 目录 | 存放内容 | 生命周期 |
|---|---|---|
| `phases/X.X-feature-name/` | phase 的计划、上下文、总结。**一个 phase 一个文件夹，内聚完整。** | 完成 → 冻结 |
| `codebase/` | 系统架构骨架。**帮助新会话快速建立全局理解。** | 随架构演进更新 |
| `handoff/` | 会话交接记录。**精简为上，STATE.md 已承载大部分交接信息。** | 按需创建 |

### phase 标准文件

```
X.X-feature-name/
├── X.X-PLAN.md          ← 执行计划（必须）
├── X.X-CONTEXT.md       ← 上下文：从哪些讨论来、关键决策（按需）
├── X.X-SUMMARY.md       ← 完成总结（完成时必须）
└── design-notes/        ← 上游设计参考（按需）
```

---

## 三、Phase 生命周期

### 3.1 创建 phase

```bash
# 约定：phase 目录名 = 编号 + 短横线 + 功能描述
.planning/phases/X.X-feature-name/
```

编号规则：与 ROADMAP.md 中的里程碑编号对齐。例如 M2 下的第一个 phase 为 `2.1`。

### 3.2 phase 标准文件模板

#### PLAN.md

```markdown
# Phase X.X: 功能描述

## 目标
<!-- 一句话说明本 phase 要达成什么 -->

## 任务
- [ ] X.X.1 任务描述
- [ ] X.X.2 任务描述

## 退出条件
- [ ] 条件 1
- [ ] 条件 2

## 影响文件
<!-- 列出预计修改/新增的文件路径 -->
```

#### CONTEXT.md

```markdown
# Phase X.X 上下文

## 来源
<!-- 从哪个讨论/决策/上一个 phase 衍生 -->

## 关键决策
<!-- 进入本 phase 前已经确定的决策 -->

## 约束
<!-- 技术约束、时间约束、范围约束 -->
```

#### SUMMARY.md

```markdown
# Phase X.X 完成总结

## 完成日期
YYYY-MM-DD

## 交付物
<!-- 实际交付的文件和功能 -->

## 偏离计划
<!-- 如果有任务调整、范围变更，说明原因 -->

## 遗留问题
<!-- 未在本 phase 解决的问题，链接到后续 phase -->

## 经验
<!-- 做对了什么、做错了什么、下次注意什么 -->
```

### 3.3 phase 完成流程

1. 所有任务完成，`npx tsc --noEmit` 和 `npm run build` 通过
2. 撰写 `X.X-SUMMARY.md`
3. 更新 `STATE.md`（当前状态、下一步、最近决策）
4. 更新 `ROADMAP.md`（里程碑状态标注）
5. **phase 文件夹冻结**，不再修改

---

## 四、文档更新触发规则

### 何时更新什么

| 事件 | 必须更新 | 可能更新 |
|------|----------|----------|
| 完成 phase | STATE.md | ROADMAP.md, REQUIREMENTS.md |
| 新增/修改需求 | REQUIREMENTS.md | ROADMAP.md, PROJECT.md |
| 产品方向变化 | PROJECT.md | ROADMAP.md, REQUIREMENTS.md |
| 新增语言 Profile | STRUCTURE.md | ARCHITECTURE.md, CONCERNS.md |
| 新增 L1×L2 映射 | STRUCTURE.md | DATA-MODEL.md |
| 新增/升级依赖 | STACK.md | ARCHITECTURE.md |
| 类型接口变化 | DATA-MODEL.md | ARCHITECTURE.md, CONVENTIONS.md |
| 领域边界/聚合变化 | DDD-ARCHITECTURE.md | ARCHITECTURE.md, DATA-MODEL.md |
| 发现技术债 | CONCERNS.md | — |
| 解决技术债 | CONCERNS.md（删除条目） | 相关 codebase 文档 |
| 新增测试 | TESTING.md | CONCERNS.md（更新覆盖缺口） |
| 编码约定变化 | CONVENTIONS.md | — |

### 何时不动

| 场景 | 规则 |
|------|------|
| 已冻结的 phase 文件 | ❄️ 冻结即历史事实。新发现写入新 phase 的 CONTEXT.md |
| REQUIREMENTS.md 中的稳定 ID | 已分配的 ID 永不修改；废弃用标记 `~~删除线~~` + 原因 |
| ROADMAP.md 中已完成的里程碑状态 | 只追加完成日期，不改描述 |

---

## 五、禁止事项（反模式）

| 反模式 | 正确做法 |
|---|---|
| ❌ 把实现细节写入 PROJECT.md | 战略级描述，不涉及具体实现 |
| ❌ 同一 phase 的文档散落在多个目录 | 一个 phase 的所有产物放在一个 phase 文件夹下 |
| ❌ 修改已冻结的 phase 文件 | 冻结即历史事实。新发现写入新 phase 的 CONTEXT.md |
| ❌ STATE.md 写成历史日志 | STATE 是当前状态机（"现在在哪"），不是历史列表 |
| ❌ codebase/ 写成了 README 的翻版 | codebase/ 是架构骨架（模型+依赖+边界+测试），不是使用说明 |
| ❌ CONCERNS.md 不写文件路径 | 每条问题必须包含具体文件路径 |
| ❌ 新增语言时修改 types.ts 或组件文件 | 新语言 = profile + 词库 + 1 行 import，零框架改动 |
| ❌ REQUIREMENTS 不写验收标准 | 每条需求必须有可验证的验收标准 |

---

## 六、日常维护 checklist

### 每次提交

- [ ] 相关 codebase 文档是否需要更新（新文件？新依赖？）
- [ ] 根目录 `CHANGELOG.md` 是否已记录本次变更，时间戳精确到分钟（`YYYY-MM-DD HH:mm Z`）

### 每次 phase 完成

- [ ] 撰写 `X.X-SUMMARY.md`
- [ ] 更新 `STATE.md`：当前位置、下一步、最近决策
- [ ] 更新 `ROADMAP.md`：里程碑状态标注
- [ ] `npx tsc --noEmit` 零错误、`npm run build` 通过

### 产品方向/需求变化

- [ ] 更新 `PROJECT.md`（战略层面）
- [ ] 更新 `REQUIREMENTS.md`（战术层面：新增/修改/废弃需求）
- [ ] 更新 `ROADMAP.md`（阶段重排）
- [ ] 在 `STATE.md` 中记录变化摘要和时间戳

### 架构变化

- [ ] 更新 `codebase/ARCHITECTURE.md`（模块依赖、数据流、边界）
- [ ] 更新 `codebase/DDD-ARCHITECTURE.md`（领域边界、限界上下文、聚合）
- [ ] 更新 `codebase/STRUCTURE.md`（新增文件/目录）
- [ ] 更新 `codebase/STACK.md`（新增/替换依赖）
- [ ] 更新 `codebase/DATA-MODEL.md`（类型变化、持久化变化）
- [ ] 更新 `codebase/CONVENTIONS.md`（新约定）

### 发现/解决问题

- [ ] 新问题 → 追加到 `codebase/CONCERNS.md`（必须包含文件路径）
- [ ] 解决问题 → 从 `codebase/CONCERNS.md` 删除对应条目
- [ ] 新增测试 → 更新 `codebase/TESTING.md`

---

## 七、新会话启动指南

新开发会话（包括 AI 辅助会话）启动时，按以下顺序阅读文档：

```
1. STATE.md            ← 当前在哪？下一步做什么？
2. ARCHITECTURE.md     ← 系统骨架是什么？模块怎么关联？
3. DDD-ARCHITECTURE.md ← 领域边界和下一阶段模型怎么切？
4. STRUCTURE.md        ← 文件在哪？新代码放哪？
5. STACK.md            ← 用了什么技术？怎么构建？
6. DATA-MODEL.md       ← 核心类型长什么样？怎么存的？
7. 按需深入 →
   ├── ROADMAP.md      ← 整体路线规划
   ├── REQUIREMENTS.md ← 具体需求条目和验收标准
   ├── CONVENTIONS.md  ← 代码约定和规则
   ├── CONCERNS.md     ← 已知问题和脆弱区域
   ├── TESTING.md      ← 测试体系和缺口
   └── phases/X.X/     ← 具体 phase 的计划和上下文
```

### 最小阅读集（5 分钟快速上手）

如果时间有限，只读：

1. **STATE.md** — 当前位置 + 下一步
2. **ARCHITECTURE.md** 第 1-2 节 — 全景图 + 数据流
3. **DDD-ARCHITECTURE.md** 第 4、7 节 — 限界上下文 + 当前 phase 架构准则

---

## 八、文档质量标准

| 维度 | 标准 |
|------|------|
| 文件路径 | CONCERNS.md 每条必须包含；其他文档提及具体代码时尽量包含 |
| 最后更新 | 每个 codebase/ 文件顶部必须有 `> 最后更新：YYYY-MM-DD` |
| 交叉引用 | 文档间引用使用相对路径（如 `codebase/ARCHITECTURE.md`） |
| 需求 ID | REQUIREMENTS.md 中每条需求有稳定 ID，其他文档引用时用 ID |
| 表格优先 | 结构化信息用 Markdown 表格，不用散文罗列 |
| ASCII 图 | 架构图用 ASCII art（````text` 块），不用外部图片 |
