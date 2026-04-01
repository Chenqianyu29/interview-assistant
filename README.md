# InterviewCopilot – AI 面试回答助手产品需求文档（PRD）

## 一、产品概述

### 1.1 产品背景

在求职面试过程中，候选人往往面临“知道怎么做但不会说”、“回答逻辑混乱”、“缺乏结构化表达”等痛点。InterviewCopilot 旨在通过 AI 技术，为用户提供角色化的回答生成、专业的 STAR 结构优化以及模拟追问训练，帮助用户提升面试表达能力，从容应对面试挑战。

### 1.2 产品定位

基于 AI 的面试回答生成与训练工具，支持角色化回答生成、STAR 结构优化以及模拟追问，帮助用户提升面试表达能力。

### 1.3 目标用户

- **在校学生（Student）**：缺乏实战经验，重点展示基础理论、学习潜力和校内项目。
- **职场人士（Professional）**：
  - **初级（1-3年）**：强调执行力、基础问题解决。
  - **中级（3-5年）**：强调独立负责模块、系统设计能力。
  - **资深（5年以上）**：强调架构思维、业务价值、团队影响力（涵盖原管理岗能力）。

---

## 二、功能架构

### 2.1 系统架构图

```
InterviewCopilot
├── 用户认证 ✅
│   ├── 登录/登出
│   └── 路由守卫（中间件 + 客户端）
├── 核心业务流程
│   ├── 角色设定（全局 + 单次覆盖） ✅
│   ├── 问题输入 ✅
│   ├── 回答生成（流式输出） ✅
│   ├── 确认保存 / 撤销保存（二次确认） ✅
│   ├── STAR优化（流式输出） ✅
│   ├── 模拟追问（追问可进入下一轮） ✅
│   └── 收藏与分类 ✅
├── 角色系统 ✅
│   ├── 身份：学生 / 职场人
│   ├── 年限：1-3年 / 3-5年 / 5年以上
│   └── 场景：大厂 / 中厂 / 小厂 / 创业公司 / 外企
├── 数据管理
│   ├── 题目维度存储（localStorage） ✅
│   ├── 历史记录回溯 ✅
│   ├── 收藏夹管理（文件夹 + 拖拽） ✅
│   └── 数据库持久化（Neon Postgres） 🔜
└── 练习模式 [二期] 🔜
```

### 2.2 技术栈

- **前端框架**: Next.js 16 (App Router) + React 19
- **AI 后端**: [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/openai`, 当前模型 `gpt-4o-mini`)
- **状态管理**: Zustand 5（`persist` 中间件持久化至 localStorage）
- **样式库**: TailwindCSS 4 + shadcn/ui + @base-ui/react
- **AI 服务**: OpenAI API（计划支持 DeepSeek）
- **数据库**: [Neon](https://neon.tech/) (Serverless Postgres) 🔜
- **ORM**: Drizzle ORM 🔜
- **部署**: [Vercel](https://vercel.com/)
- **包管理**: pnpm

---

## 三、功能模块详细设计

### 3.1 核心功能流程

#### 3.1.1 业务流程

用户输入面试问题 -> 选择角色 -> 生成AI回答 -> **用户确认并保存回答** -> (解锁) 优化回答（STAR） / (解锁) 模拟追问 -> 保存题目记录

### 3.2 角色系统（亮点功能）

#### 3.2.1 功能描述

用户根据自身情况选择身份和经验年限。

- **混合模式（Hybrid Mode）**：
  1.  **全局默认**：用户首次登录（或在设置页）设定自己的真实身份，作为全局默认角色。
  2.  **单次覆盖**：在提问框旁展示当前角色标签（默认回显全局设置）。用户可点击修改，**仅对本次提问生效**，不影响全局默认值。
  3.  **历史回溯**：每条历史记录（Question）必须完整记录当时提问时所使用的角色快照（Snapshot）。

#### 3.2.2 角色选项结构

**1. 身份与年限**

| 身份 (Identity)           | 年限 (Experience) | AI 侧重点/提示词策略                                                                                                                                                                                    |
| :------------------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **学生 (Student)**        | -                 | **视角**：应届毕业生/在校生<br>**重点**：扎实的计算机基础、学习能力、潜力、校内项目经历。<br>**提示词**：“请用计算机专业应届生的视角回答，强调学习潜力和基础知识。”                                     |
| **职场人 (Professional)** | **1-3年**         | **视角**：初级工程师<br>**重点**：执行力、具体技术栈熟练度、基础Bug解决能力。<br>**提示词**：“请以1-3年经验的工程师视角回答，强调执行力和具体技术细节。”                                                |
| **职场人 (Professional)** | **3-5年**         | **视角**：中级/高级工程师<br>**重点**：独立负责模块、性能优化、系统设计、 mentorship。<br>**提示词**：“请以3-5年经验的工程师视角回答，强调系统设计能力和问题解决深度。”                                 |
| **职场人 (Professional)** | **5年以上**       | **视角**：资深/架构师/技术专家（涵盖原管理岗）<br>**重点**：架构思维、业务价值、团队影响力、技术选型决策。<br>**提示词**：“请以5年以上资深专家的视角回答，强调架构思维、业务价值及技术决策背后的考量。” |

**2. 场景（意向公司）**

| 场景 (Scenario)   | 侧重点/提示词策略                                                                 |
| :---------------- | :-------------------------------------------------------------------------------- |
| **大厂**          | **重点**：基础扎实、原理深度、高并发/高性能场景、系统设计、软技能（沟通/协作）。    |
| **中厂**          | **重点**：业务落地能力、技术广度、独立解决问题能力、性价比。                      |
| **小厂**          | **重点**：全栈能力、快速上手、多面手、成本意识。                                  |
| **创业公司**      | **重点**：极客精神、快速迭代、抗压能力、从0到1的经验、对产品的热情。              |
| **外企**          | **重点**：英语能力、Work-Life Balance、代码规范、测试驱动开发(TDD)、敏捷开发流程。|

### 3.3 核心功能模块

#### 3.3.1 角色设定模块

- **全局设置（Global Setting）**：
  - 入口：顶部栏用户信息/设置页。
  - 作用：设定用户的真实身份，作为所有提问的**默认基准**。
- **单次覆盖（One-time Override）**：
  - 入口：提问输入框旁的角色标签（如 `当前视角：3年经验`）。
  - 交互：点击弹出简易选择器，修改后**仅对本次提问生效**。
  - 状态：若当前选择与全局默认不一致，应有视觉提示（如高亮）。

#### 3.3.2 面试问题输入

- **页面**：首页
- **操作**：用户输入具体的面试问题，例如：“为什么使用 React？”
- **输入控件**：文本输入框（Textarea/Input）

#### 3.3.3 AI 生成回答

- **触发**：点击“生成回答”按钮
- **逻辑**：
  1.  调用 AI 接口，传入“问题”和“角色设定”。
  2.  展示 AI 生成的回答内容。
  3.  提供 **“重新生成”** 和 **“确认并保存”** 按钮。
      - **重新生成**：再次调用 AI 生成新的回答，覆盖当前内容。
      - **确认并保存**：用户满意当前回答后点击，将此回答作为该问题的**主答案模板**进行保存。
  4.  **撤销保存（Undo Save）**：
      - 已保存状态下，提供 **“撤销保存”** 或 **“修改答案”** 按钮。
      - **交互提示**：若当前已生成了 STAR 优化或模拟追问数据，点击撤销时**必须弹出二次确认框**：“撤销保存将清空已生成的 STAR 优化和追问记录，是否继续？”
      - **确认后果**：清空 STAR 和追问数据，状态回退至“未保存”，允许用户重新生成或手动编辑主答案。
- **状态流转**：
  - 未保存前：仅可“重新生成”或修改角色/问题。
  - 保存后：**解锁**“STAR 优化”和“模拟追问”功能入口。
  - 撤销保存后：**重新锁定**后续功能，清空衍生数据。

#### 3.3.4 STAR 结构优化

- **前置条件**：用户已点击“确认并保存”主答案。
- **触发**：在回答结果页点击“STAR 优化”按钮
- **逻辑**：AI 将已保存的主答案重构为 STAR 模型。
- **输出展示**：
  - **Situation (情境)**：背景描述
  - **Task (任务)**：面临的挑战
  - **Action (行动)**：采取的具体措施（代码拆分、架构调整等）
  - **Result (结果)**：量化的成果（如：加载时间减少 40%）

#### 3.3.5 模拟追问（亮点）

- **前置条件**：用户已点击“确认并保存”主答案。
- **触发**：点击“模拟追问”按钮
- **逻辑**：AI 基于当前问题和已保存的回答，生成 3 个可能的深度追问。
- **示例**：
  - 追问1：如果性能问题再次出现怎么办？
  - 追问2：React 和 Vue 在这个问题上的处理有何不同？
- **交互（关键）**：
  - 用户点击某一个追问问题时，系统将该追问视为一个新的**主问题**。
  - 系统自动跳转/重置状态，将该追问填入“问题输入框”，并自动触发“生成回答”流程。
  - 该追问会生成一条**新的历史记录**，用户可以在此基础上继续进行 STAR 优化或生成下一轮追问，实现无限深挖。

### 3.4 题目存储逻辑

#### 3.4.1 存储结构

数据按 **题目维度** 进行存储，无论是用户手动输入的问题，还是点击追问生成的衍生问题，都作为独立的记录存储。每条记录都包含当时生成该回答所使用的**角色快照**。

结构如下：

```typescript
// QuestionRecord（当前实现）
interface QuestionRecord {
  id: number;                    // Date.now() 时间戳作为 ID
  question: string;
  roleSnapshot: Role;            // { identity, experience?, scenario }
  answer: string;
  starAnswer: string;
  followUps: string[];
  parentId: number | null;       // 追问链的父题 ID
  folderId: number | null;       // 所属收藏夹 ID（null = 未收藏）
  category: string;              // 用户自定义分类标签
  createdAt: number;             // 时间戳
}

// FavoriteFolder（收藏夹）
interface FavoriteFolder {
  id: number;
  name: string;
  createdAt: number;
}
```

#### 3.4.2 存储方式

- **当前（MVP）**：Zustand `persist` → `localStorage`（已实现）
  - `interview-copilot-history`：题目记录 + 收藏夹
  - `interview-copilot-role`：全局角色设置
  - `interview-copilot-auth`：登录状态
- **下一阶段**：Neon Serverless Postgres + Drizzle ORM（见第八章数据库设计方案）

---

## 四、页面设计

### 4.1 页面规划

| 页面 | 路由 | 状态 | 说明 |
|------|------|------|------|
| 登录页 | `/login` | ✅ | 用户名密码登录，已登录自动跳转首页 |
| 首页 | `/` | ✅ | 输入问题、选择角色（单次覆盖）、⌘+Enter 提交 |
| 回答结果页 | `/result` | ✅ | 流式回答、Markdown 渲染、保存/撤销、STAR 优化、模拟追问 |
| 历史记录页 | `/history` | ✅ | 搜索、全部/收藏筛选、分类 chip、查看/删除/收藏 |
| 练习模式 | `/practice` | 🔜 | Header 已有占位入口（disabled） |

### 4.2 全局布局组件

- **AppShell**：根布局容器，`/login` 裸渲染，其他页面包含 Header + Sidebar + 主内容区。未认证时客户端跳转 `/login`。
- **Header**：Logo、导航（首页/历史/练习）、全局角色 Popover、用户信息与登出。
- **Sidebar**：
  - 历史 Tab：最近 50 条记录列表，点击回溯查看。
  - 收藏 Tab：收藏夹树形结构，支持**拖拽记录到文件夹**、文件夹重命名/删除、取消收藏确认。

### 4.3 页面详细

1.  **登录页 (Login)** ✅
    - 表单：用户名 + 密码。
    - 认证：`POST /api/auth` → 校验环境变量中的 Demo 账号 → httpOnly Cookie。
    - 路由守卫：`middleware.ts`（服务端）+ `AppShell`（客户端）双重保护。
2.  **首页 (Home)** ✅
    - 功能：输入问题、选择角色（显示当前角色标签，点击弹出单次覆盖选择器）、⌘/Ctrl+Enter 提交。
    - 提交后跳转 `/result`。
3.  **回答结果页 (Result)** ✅
    - 流式展示 AI 回答（Markdown 渲染，自动滚动跟随）。
    - 未保存时可"重新生成"；保存后解锁 STAR 优化和模拟追问。
    - STAR 优化：流式生成，四段卡片展示。
    - 模拟追问：生成 3 个追问，点击追问进入新一轮问答（自动带 `parentId`）。
    - 从历史记录打开时不重复生成主答案。
4.  **历史记录页 (History)** ✅
    - 搜索过滤、全部/收藏 Tab 切换、分类标签筛选。
    - 操作：查看详情、收藏/取消收藏（`FavoriteDialog`）、设置分类、删除（二次确认）。
5.  **练习模式 (Practice) [二期]** 🔜
    - **出题逻辑**：基于艾宾浩斯记忆法生成出题顺序。
    - **优先级**：
        1. **收藏夹**（高优复习）
        2. **历史记录**（主问题及其追问）
        3. **随机提问**（查漏补缺）
    - **流程**：AI 出题 -> 用户回答（语音/文字） -> AI 评分与建议。

---

## 五、接口与 Prompt 设计

### 5.1 AI Prompt 设计（关键）

#### 生成回答

> 你是一位经验丰富的面试官。
> 当前候选人身份为：**{身份}**，经验年限为：**{年限}**（如果是职场人），意向公司场景为：**{场景}**。
>
> 请以符合该候选人背景的视角，回答以下面试问题：
>
> **问题**：{用户问题}
>
> **回答要求**：
>
> - 视角：{根据身份/年限动态调整}
> - 场景侧重：{根据场景动态调整，例如大厂强调原理，创业公司强调落地}
> - 逻辑清晰
> - 有实际案例（针对资深人员需体现架构思维）
> - 结构化表达

#### STAR 优化

> 请将以下回答改写为 STAR 结构，务必体现 **{年限}** 经验职场人的深度（或学生的学习能力），并结合 **{场景}** 的侧重点：
>
> - Situation
> - Task
> - Action
> - Result
>
> **原回答**：{AI生成的回答}

#### 模拟追问

> 基于以下回答，生成 3 个可能的面试追问。
> **追问难度与方向**：请完全匹配 **{身份} - {年限} - {场景}** 的面试标准。（例如：大厂需追问底层原理、高并发；创业公司需追问落地能力）。
> **回答内容**：{AI生成的回答}

---

## 六、非功能性需求

### 6.1 性能需求

- 页面加载时间 < 1.5秒
- AI 回答流式输出（Stream）或 Loading 状态提示友好

### 6.2 兼容性

- 适配移动端和 PC 端（TailwindCSS 响应式布局）

---

## 七、项目结构

```
interview-assistant/
├── middleware.ts                    # 路由守卫（Cookie 校验）
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局（AppShell 包裹）
│   │   ├── page.tsx                # 首页 /
│   │   ├── login/page.tsx          # 登录 /login
│   │   ├── result/page.tsx         # 结果页 /result
│   │   ├── history/page.tsx        # 历史记录 /history
│   │   ├── globals.css
│   │   └── api/
│   │       ├── auth/route.ts       # POST 登录认证
│   │       ├── chat/route.ts       # POST 流式生成回答
│   │       ├── star/route.ts       # POST 流式 STAR 优化
│   │       └── follow-up/route.ts  # POST 生成追问
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-shell.tsx       # 全局布局容器
│   │   │   ├── header.tsx          # 顶栏（导航 + 全局角色 + 用户）
│   │   │   └── sidebar.tsx         # 侧栏（历史 + 收藏夹树）
│   │   ├── role-selector.tsx       # 角色选择面板
│   │   ├── star-card.tsx           # STAR 四段展示卡片
│   │   ├── follow-up-list.tsx      # 追问列表
│   │   ├── favorite-dialog.tsx     # 收藏夹选择/新建弹窗
│   │   └── ui/
│   │       ├── button.tsx          # 基础按钮（CVA 变体）
│   │       └── confirm-dialog.tsx  # 通用确认弹窗
│   ├── stores/
│   │   ├── auth.ts                 # 登录状态（persist）
│   │   ├── role.ts                 # 角色设置（persist globalRole）
│   │   ├── question.ts             # 当前会话状态（非持久化）
│   │   └── history.ts              # 历史记录 + 收藏夹（persist）
│   ├── lib/
│   │   ├── prompts.ts              # AI System Prompt 构建
│   │   └── utils.ts                # 工具函数
│   └── types/
│       └── role.ts                 # 角色类型定义与常量
├── .env.local                       # 环境变量（API Key、Demo 账号）
├── package.json
└── tsconfig.json
```

---

## 八、数据库设计方案

### 8.1 总体方案

| 项目 | 选型 | 说明 |
|------|------|------|
| 数据库 | Neon Serverless Postgres | 免费层够用，Vercel 原生集成，冷启动快 |
| ORM | Drizzle ORM | 类型安全、零运行时、Schema-first，与 Next.js Server Components 天然契合 |
| 连接方式 | `@neondatabase/serverless` | HTTP / WebSocket 驱动，无需连接池，适配 Edge Runtime |
| 迁移 | `drizzle-kit` | `drizzle-kit generate` + `drizzle-kit migrate` |

### 8.2 ER 图

```
┌──────────┐       ┌──────────────────┐       ┌─────────────────┐
│  users   │──1:N──│ question_records  │──N:1──│ favorite_folders │
└──────────┘       └──────────────────┘       └─────────────────┘
     │                     │ self-ref (parentId)
     │              ┌──────┘
     └──1:N──┐      │
      ┌──────────────┐
      │ user_settings │
      └──────────────┘
```

### 8.3 表结构设计（Drizzle Schema）

#### users — 用户表

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

> **迁移策略**：当前 Demo 账号（环境变量硬编码）→ 数据库用户表 + bcrypt 哈希。后续可对接 OAuth（GitHub/Google）。

#### user_settings — 用户设置

```typescript
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  globalIdentity: varchar("global_identity", { length: 20 }).notNull().default("professional"),
  globalExperience: varchar("global_experience", { length: 10 }),
  globalScenario: varchar("global_scenario", { length: 20 }).notNull().default("big-company"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

> 对应当前 `useRoleStore` 的 `globalRole`，一对一关系。

#### favorite_folders — 收藏夹

```typescript
export const favoriteFolders = pgTable("favorite_folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### question_records — 题目记录

```typescript
export const questionRecords = pgTable("question_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  question: text("question").notNull(),

  // 角色快照（保存生成时的角色设定，不随全局修改而变化）
  roleIdentity: varchar("role_identity", { length: 20 }).notNull(),
  roleExperience: varchar("role_experience", { length: 10 }),
  roleScenario: varchar("role_scenario", { length: 20 }).notNull(),

  answer: text("answer").notNull().default(""),
  starAnswer: text("star_answer").notNull().default(""),
  followUps: jsonb("follow_ups").$type<string[]>().notNull().default([]),

  parentId: integer("parent_id").references((): AnyPgColumn => questionRecords.id, { onDelete: "set null" }),
  folderId: integer("folder_id").references(() => favoriteFolders.id, { onDelete: "set null" }),
  category: varchar("category", { length: 50 }).notNull().default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

> **设计要点**：
> - `roleSnapshot` 拆为三个列而非 JSONB，方便按角色维度查询/统计（如"我在大厂视角下练了多少题"）。
> - `followUps` 用 JSONB 存 `string[]`，追问内容无需独立检索。
> - `parentId` 自引用实现追问链，`onDelete: "set null"` 防止级联删除断链。
> - `folderId` 为 null 表示未收藏，非 null 即归属某收藏夹（替代原 `isFavorite` 布尔值）。

### 8.4 索引设计

```typescript
// question_records 表索引
export const qrUserIdx = index("qr_user_idx").on(questionRecords.userId);
export const qrFolderIdx = index("qr_folder_idx").on(questionRecords.folderId);
export const qrParentIdx = index("qr_parent_idx").on(questionRecords.parentId);
export const qrCreatedIdx = index("qr_created_idx").on(questionRecords.userId, questionRecords.createdAt);

// favorite_folders 表索引
export const ffUserIdx = index("ff_user_idx").on(favoriteFolders.userId);
```

### 8.5 接入计划

#### Phase 1：基础接入

1. `pnpm add drizzle-orm @neondatabase/serverless` + `pnpm add -D drizzle-kit`
2. 新增 `src/db/` 目录：
   ```
   src/db/
   ├── index.ts          # Neon 连接实例
   ├── schema.ts          # Drizzle Schema（上述表定义）
   └── migrate.ts         # 迁移入口
   ```
3. `.env.local` 加入 `DATABASE_URL`（Neon 连接串）
4. `drizzle.config.ts` 配置迁移输出目录

#### Phase 2：API 路由改造

| 路由 | 改造内容 |
|------|---------|
| `POST /api/auth` | 查 `users` 表 + bcrypt 校验 → 签发 JWT（替换明文 Cookie） |
| `POST /api/chat` | 无变化（纯 AI 调用） |
| `POST /api/star` | 无变化 |
| `POST /api/follow-up` | 无变化 |
| 🆕 `GET/POST /api/records` | CRUD 题目记录（替代 localStorage） |
| 🆕 `GET/POST /api/folders` | CRUD 收藏夹 |
| 🆕 `GET/PUT /api/settings` | 读写用户全局角色 |

#### Phase 3：前端 Store 迁移

- `useHistoryStore`：从 localStorage 读写改为调用 `/api/records` + `/api/folders`，保留 Zustand 作为客户端缓存层（乐观更新）。
- `useRoleStore`：`globalRole` 的持久化改为 `/api/settings`。
- `useAuthStore`：JWT 解码获取 userId，传入后续请求。
- 数据迁移：首次登录时检测 localStorage 旧数据，一次性批量写入数据库后清除本地缓存。

### 8.6 环境变量补充

```bash
# .env.local 新增
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/interview_copilot?sslmode=require
JWT_SECRET=your-jwt-secret-key
```
