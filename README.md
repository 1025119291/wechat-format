# 微信公众号排版工具

将 Markdown 或飞书文档粘贴内容一键排版为适配微信公众号的精美图文，支持 8 套模板、代码高亮、移动端/PC 端预览、一键复制到公众号编辑器。

---

## 目录

- [快速开始](#快速开始)
- [功能概览](#功能概览)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [核心模块详解](#核心模块详解)
  - [内容解析](#1-内容解析)
  - [样式引擎与装饰节点](#2-样式引擎与装饰节点)
  - [代码高亮](#3-代码高亮)
  - [剪贴板导出](#4-剪贴板导出)
  - [状态管理](#5-状态管理)
- [模板系统](#模板系统)
  - [模板列表](#模板列表)
  - [模板数据结构](#模板数据结构)
  - [如何新增模板](#如何新增模板)
- [公众号兼容性说明](#公众号兼容性说明)
- [交互流程](#交互流程)
- [图片处理方案](#图片处理方案)
- [后续迭代规划](#后续迭代规划)

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

启动后访问 http://127.0.0.1:5173/

---

## 功能概览

| 功能 | 说明 |
|------|------|
| Markdown 编辑 | 左侧 textarea 实时输入，右侧实时预览 |
| 飞书/富文本粘贴 | 支持 Ctrl/⌘+V 粘贴飞书、Word、网页内容，自动归一化 |
| 8 套排版模板 | 极简 / 技术向 / 赛博科技 / 运营图文 / 优雅商务 / 卡片杂志 / 清新文艺 / 新媒体 |
| 代码高亮 | Shiki 引擎，输出内联样式，公众号完美兼容 |
| 移动端/PC 预览 | 📱 手机 375px（带刘海外框）/ 💻 PC 677px（公众号编辑器宽度） |
| 一键复制 | 双 MIME（text/html + text/plain）写入剪贴板，粘贴到公众号即用 |
| 下载 HTML | 导出完整 HTML 文件 |
| Base64 图片检测 | 复制前自动检测并提示 |

---

## 技术架构

```
技术栈：Vite 5 + React 18 + TypeScript + Zustand
解析管线：unified (remark-parse → remark-gfm → remark-rehype → rehype-raw)
样式注入：自定义 rehype 插件 (rehypeInlineTheme)
代码高亮：Shiki（VS Code 同款引擎，输出 inline style）
粘贴归一化：DOMPurify + 自定义 DOM 清洗
剪贴板：Clipboard API + execCommand 降级
```

数据流：

```
[Markdown / 粘贴 HTML]
        ↓
   [Parser 统一管线]
        ↓              ↓
[Shiki 代码高亮]   [飞书粘贴归一化]
        ↓              ↓
   [rehypeInlineTheme] ← Theme (styles + decorations)
        ↓
   [带 inline style 的 HTML]
      ↓        ↓
   [预览]    [剪贴板 / 下载]
```

---

## 项目结构

```
src/
├── main.tsx                          # React 入口
├── App.tsx                           # 主界面（编辑器 + 预览 + 工具栏）
├── store/
│   └── index.ts                      # Zustand 全局状态
├── core/
│   ├── parser/
│   │   ├── markdown.ts               # Markdown → HTML 管线（unified 全家桶）
│   │   └── larkHtml.ts               # 飞书/富文本粘贴归一化 + DOMPurify
│   ├── renderer/
│   │   └── inlineStyle.ts            # rehype 插件：inline style 注入 + 装饰节点注入
│   ├── code/
│   │   └── highlight.ts              # Shiki 代码高亮封装
│   ├── exporter/
│   │   └── clipboard.ts              # 剪贴板双 MIME 写入 + HTML 下载
│   └── themes/
│       ├── types.ts                  # Theme / ThemeStyles / ThemeDecorations 类型
│       ├── index.ts                  # 模板注册表
│       ├── minimal.ts                # 极简
│       ├── tech.ts                   # 技术向
│       ├── cyber.ts                  # 赛博科技
│       ├── marketing.ts              # 运营图文
│       ├── business.ts               # 优雅商务
│       ├── magazine.ts               # 卡片杂志
│       ├── literary.ts               # 清新文艺
│       └── trendy.ts                 # 新媒体
└── styles/
    └── app.css                       # 工具 UI 样式（不影响导出）
```

---

## 核心模块详解

### 1. 内容解析

#### Markdown 管线 (`core/parser/markdown.ts`)

使用 unified 生态构建处理管线：

```
Markdown 文本
  → remark-parse        (字符串 → mdast)
  → remark-gfm          (支持表格/删除线/任务列表)
  → remark-rehype       (mdast → hast)
  → rehype-raw          (保留 Markdown 中穿插的原始 HTML)
  → rehypeInlineTheme   (自定义插件：注入 inline style + 装饰节点)
  → rehype-stringify    (hast → HTML 字符串)
```

关键函数：
- `markdownToWechatHtml(markdown, theme)` — Markdown 转 公众号 HTML
- `htmlToWechatHtml(html, theme)` — 已归一化的 HTML 转 公众号 HTML（粘贴路径）

两个入口最终都会调用 `highlightPreBlocks()` 对代码块做 Shiki 高亮，并用 `wrapSection()` 包裹根 `<section>` 节点。

#### 飞书粘贴归一化 (`core/parser/larkHtml.ts`)

飞书复制到剪贴板时生成 `text/html`，包含大量 `data-lark-*` 属性、`<div class="ace-line">`、内联 span 样式等。归一化流程：

1. **DOMParser** 解析为 DOM
2. 移除 `<style>` / `<script>` / `<meta>` / `<link>`
3. 遍历所有元素，清理 `data-*` / `class` / `id` / `aria-*` / `on*` 属性
4. 清空非 `IMG` / `A` 元素的 `style` 属性（让主题重新接管）
5. `<div>` → `<p>` 或 `<section>`（含块级子节点时保留为 section）
6. `<font>` 解包保留文字
7. `<pre>` 内补全 `<code>` 包裹
8. 空段落保留 `<br/>` 间距
9. **DOMPurify** 白名单过滤，只保留公众号安全标签

白名单标签：`section, p, span, strong, b, em, i, u, del, s, h1-h6, blockquote, ul, ol, li, a, img, br, hr, pre, code, table, thead, tbody, tr, th, td`

白名单属性：`href, src, alt, title, colspan, rowspan, style, target`

辅助函数 `hasBase64Image(html)` 用于复制前检测 base64 图片并提示。

### 2. 样式引擎与装饰节点 (`core/renderer/inlineStyle.ts`)

自定义 rehype 插件 `rehypeInlineTheme(theme)`，分四轮处理 hast：

| 轮次 | 操作 | 说明 |
|------|------|------|
| 第一轮 | 样式注入 | 遍历所有元素，根据标签名匹配 `theme.styles` 中的样式字符串，合并到 `style` 属性 |
| 第二轮 | 代码块修正 | `<pre>` 内的 `<code>` 覆盖为 `code_block` 样式（区分行内代码） |
| 第三轮 | 装饰节点注入 | 根据 `theme.decorations` 在 H1/H2/H3/blockquote/hr 内部注入前后缀 HTML 片段 |
| 第四轮 | 文章首尾装饰 | 在 AST 根节点前后插入 `articleHeader` / `articleFooter` |

装饰节点使用**真实 DOM**（`<span>` / `<section>` 等）而非 `::before/::after`，因为公众号编辑器会剔除伪元素。装饰 HTML 片段通过 `hast-util-from-html` 解析为 hast 子节点后注入。

### 3. 代码高亮 (`core/code/highlight.ts`)

使用 **Shiki**（VS Code 同款高亮引擎），核心优势：输出天然带 inline style 的 `<span>` 标签，无需额外 CSS class，完美适配公众号。

- 支持语言：javascript, typescript, tsx, jsx, json, html, css, bash, shell, python, go, java, rust, sql, yaml, markdown, xml
- 支持主题：`github-light`, `github-dark`, `min-light`
- 单例模式：`getHighlighter()` 返回缓存的 Promise，避免重复初始化
- `warmupHighlighter()` 在 App 启动时预热，避免首次渲染卡顿
- 不支持的语言自动 fallback 为纯文本转义

### 4. 剪贴板导出 (`core/exporter/clipboard.ts`)

**复制到公众号**：使用 Clipboard API 写入双 MIME：

```typescript
new ClipboardItem({
  'text/html': new Blob([html], { type: 'text/html' }),
  'text/plain': new Blob([plain], { type: 'text/plain' }),
});
```

降级方案：当 Clipboard API 不可用时，创建隐藏的 `contentEditable` 容器，用 `execCommand('copy')` 拷贝 HTML。

**下载 HTML**：生成完整 HTML 文档（含 `<!doctype>`），通过 `Blob` + `<a download>` 触发下载。

### 5. 状态管理 (`store/index.ts`)

使用 Zustand 管理全局状态：

| 状态 | 类型 | 说明 |
|------|------|------|
| `inputMode` | `'markdown' \| 'paste'` | 输入模式 |
| `markdown` | `string` | Markdown 文本 |
| `pastedHtml` | `string` | 粘贴的原始 HTML |
| `themeId` | `string` | 当前模板 ID |
| `accentColor` | `string` | 主题色（预留） |
| `renderedHtml` | `string` | 渲染后的公众号 HTML |
| `previewDevice` | `'mobile' \| 'pc'` | 预览设备 |

`getTheme()` 根据 `themeId` 从模板注册表中获取完整 Theme 对象。

---

## 模板系统

### 模板列表

| 模板 | ID | 主色调 | 代码主题 | 适合场景 | 装饰亮点 |
|------|----|--------|----------|----------|----------|
| 极简 | `minimal` | 黑白灰 `#222` / `#3f3f3f` | min-light | 博客、读书笔记 | H2 左侧竖条；HR 三点 |
| 技术向 | `tech` | 柔和青 `#5b8db8` | github-light | 技术教程、开发博客 | H1 左侧竖条；H2 `#` 前缀；HR `</>` 装饰 |
| 赛博科技 | `cyber` | 深黑底 `#0f1419` + 霓虹青 `#7dd3fc` + 紫 `#a78bfa` | github-dark | 科技评测、AI 文章 | 顶部 `> SYSTEM.READY` 命令行；H1 `[ FEATURED ]` 标签；菱形装饰线；文末 `> END_OF_ARTICLE` |
| 运营图文 | `marketing` | 珊瑚粉 `#e8866a` + 暖米 `#fdf6f2` | github-light | 品牌、活动图文 | H1 上下细线；H2 粉色圆点；引用大引号；HR 三点 |
| 优雅商务 | `business` | 深青 `#1a4d4a` + 香槟金 `#c9a96e` | github-light | 品牌公告、年终盘点 | H1 `ARTICLE` 小标签 + `✦` 装饰线；H2 金色圆点；HR `线—✦—线`；引用 `— 引 言 —` |
| 卡片杂志 | `magazine` | 黑 + 芥末黄 `#f2c94c` | github-light | 专栏、深度长文 | H1 `— FEATURE —` 杂志标签；H2 `SECTION` 色块；HR `线—❋—线`；文末落款 |
| 清新文艺 | `literary` | 米色 + 莫兰迪绿 `#4a6b5a` | min-light | 随笔、读书笔记 | 顶部 `· 随 笔 ·`；H1 `❁` 花朵；H2 `❋` 前缀；HR `❁ ❁ ❁`；引用 `「` 前缀 |
| 新媒体 | `trendy` | 莓紫 `#8a5a8b` + 米白 `#fbf8f6` | github-light | 观点、专栏、深度文 | H1 `EDITOR'S PICK` 胶囊徽章；H2 圆点+细线；引用 `QUOTE` 标签；HR 三点 |

### 模板数据结构

```typescript
interface Theme {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称
  description: string;           // 描述（hover 提示）
  codeTheme: 'github-light' | 'github-dark' | 'min-light';  // Shiki 代码主题
  styles: ThemeStyles;           // 各标签的 inline style 字符串
  decorations?: ThemeDecorations; // 装饰性节点（可选）
}

interface ThemeStyles {
  section?: string;       // 根容器
  h1?: string;            // 一级标题
  h2?: string;            // 二级标题
  h3?: string;            // 三级标题
  h4?: string;            // 四级及以下标题
  p?: string;             // 段落
  blockquote?: string;    // 引用
  ul?: string;            // 无序列表
  ol?: string;            // 有序列表
  li?: string;            // 列表项
  code_inline?: string;   // 行内代码
  pre?: string;           // 代码块容器
  code_block?: string;    // 代码块内部 code
  table?: string;         // 表格
  th?: string;            // 表头
  td?: string;            // 表格单元格
  img?: string;           // 图片
  hr?: string;            // 分隔线
  a?: string;             // 链接
  strong?: string;        // 加粗
  em?: string;            // 斜体
  del?: string;           // 删除线
  // ... 以及 thead/tbody/tr
}

interface ThemeDecorations {
  h1Prefix?: string;           // H1 前缀装饰 HTML
  h1Suffix?: string;           // H1 后缀装饰 HTML
  h2Prefix?: string;           // H2 前缀装饰 HTML
  h2Suffix?: string;           // H2 后缀装饰 HTML
  h3Prefix?: string;           // H3 前缀装饰 HTML
  hrReplacement?: string;      // HR 完整替换 HTML
  articleHeader?: string;      // 文章顶部装饰 HTML
  articleFooter?: string;      // 文章底部装饰 HTML
  blockquotePrefix?: string;   // 引用前缀装饰 HTML
}
```

### 如何新增模板

1. 在 `src/core/themes/` 下创建新文件，如 `mytheme.ts`
2. 导出一个 `Theme` 对象：

```typescript
import type { Theme } from './types';

export const myTheme: Theme = {
  id: 'mytheme',
  name: '我的模板',
  description: '模板描述',
  codeTheme: 'github-light',
  styles: {
    section: 'font-size: 15px; line-height: 1.8; color: #333; ...',
    h1: 'font-size: 20px; font-weight: 700; ...',
    // ... 按需填写
  },
  decorations: {
    h1Prefix: '<section style="...">装饰内容</section>',
    // ... 可选
  },
};
```

3. 在 `src/core/themes/index.ts` 中注册：

```typescript
import { myTheme } from './mytheme';

export const themes: Record<string, Theme> = {
  // ... 已有模板
  mytheme: myTheme,
};

export const themeList: Theme[] = [
  // ... 已有模板
  myTheme,
];
```

4. 刷新页面，模板自动出现在顶部选择栏。

---

## 公众号兼容性说明

微信公众号编辑器对 HTML/CSS 有严格限制，本工具的所有输出均遵循以下原则：

| 约束 | 处理方式 |
|------|----------|
| 不支持 `<style>` / `<link>` / class | 所有样式通过 `style="..."` 内联 |
| 不支持 `::before` / `::after` | 装饰内容使用真实 DOM 节点注入 |
| 不支持 `<script>` / `<iframe>` | 不输出此类标签 |
| 不支持 `position: fixed/absolute` | 不使用定位属性 |
| 不支持 CSS 变量 / `@media` | 不使用 |
| 不支持自定义字体 `@font-face` | 只用系统字体栈 |
| 图片需为公众号素材 URL | 外链图片粘贴时公众号会自动拉取；base64 需手动上传 |
| 深色模式 | 文字色避免纯黑 `#000` / 纯白 `#fff`，使用 `#3f3f3f` / `#fafafa` 等 |
| 正文字号 | ≥ 15px，保证移动端可读 |
| 布局 | 不用 Flex/Grid 复杂属性，用 `margin/padding/text-align` |
| 根容器 | 使用 `<section data-role="article">` 包裹，符合公众号生态约定 |

---

## 交互流程

```
打开工具
  ↓
左侧选择输入模式：
  [Markdown] → textarea 实时编辑
  [粘贴飞书/富文本] → Ctrl/⌘+V 粘贴
  ↓
右侧实时预览（自动渲染）
  ↓
顶部选择模板（8 套一键切换）
  ↓
预览区切换设备：
  📱 手机 (375px + 刘海外框)
  💻 PC (677px 公众号编辑器宽度)
  ↓
操作：
  [复制到公众号] → 双 MIME 写入剪贴板 → 粘贴到公众号编辑器
  [下载 HTML]   → 导出完整 HTML 文件
```

关键交互节点：
- 粘贴时自动识别富文本 / 纯文本，Toast 提示
- 复制前自动检测 base64 图片，提示上传
- 复制成功/失败均有 Toast 反馈
- 模板切换实时重渲染

---

## 图片处理方案

| 来源 | 识别方式 | 当前处理 | 后续规划 |
|------|----------|----------|----------|
| 外链 https | `src` 以 https 开头 | 直接保留，公众号粘贴时自动拉取 | — |
| base64 | `src` 以 `data:image` 开头 | 检测并提示"建议上传到公众号素材" | 自建代理上传到公众号素材 API |
| 本地文件 | 用户拖拽/上传 | 暂不支持 | FileReader → Blob → 上传代理 |

---

## 后续迭代规划

| 阶段 | 功能 | 实现思路 |
|------|------|----------|
| V1.1 | 微调面板（主题色、字号、行距、段落间距） | 扩展 Zustand 状态 + Theme 运行时覆盖 |
| V1.2 | 一键生成目录 | 扫描 hast 中 h2/h3 → 渲染 TOC section |
| V1.3 | AI 自动摘要 | 调用 LLM API 生成摘要，插入顶部卡片 |
| V1.4 | 组件化卡片库 | 金句卡、作者卡、二维码卡、关注引导卡 |
| V1.5 | 飞书 API 直连 | OAuth 登录 → 拉取指定文档内容 |
| V1.6 | 公众号草稿 API | 扫码登录 → `draft/add` 直接创建草稿 |
| V1.7 | 模板市场 | Theme JSON 导入导出，第三方模板包 |
| V1.8 | 历史版本 | IndexedDB 存储最近 20 篇 |
| V1.9 | 超宽表格转图片 | html2canvas 截表 → PNG → 上传 |
| V1.10 | Electron 桌面端 | 复用前端代码，加壳 |

架构扩展锚点：
- **Theme 插件化**：Theme 为独立 TS 对象，可通过 URL 动态加载第三方模板
- **Parser 插件化**：unified 管线支持 `.use(plugin)`，接入知乎/Notion 只需写归一化器
- **后端可选**：所有功能默认纯前端可用；图片上传、API 对接走可选 Serverless
