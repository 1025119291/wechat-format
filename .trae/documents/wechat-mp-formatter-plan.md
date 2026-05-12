# 微信公众号文档排版工具 —— 设计与实现方案

> 版本：v1.0  
> 目标读者：产品、前端工程师、UI/UX  
> 目标形态：纯前端可离线运行的 Web 工具（Vite + React + TypeScript），可渐进式扩展为 Electron 桌面端。

---

## 一、项目概览与现状分析

### 1.1 当前状态
- 工作目录 `/Users/bytedance/Documents/weixin` 为空（Greenfield 项目）。
- 本方案按从 0 到 1 构建，不依赖既有代码。

### 1.2 核心价值主张
解决"公众号排版重复、样式不兼容、粘贴后格式错乱、图片/代码/表格难看"四大痛点，让创作者 10 秒内得到可直接粘贴到公众号编辑器的精美图文。

### 1.3 关键约束（必须遵守）
- 公众号编辑器只接受**内联样式（inline style）**，`<style>` / `<link>` / `class`-based CSS 一律会被剔除。
- 不支持：`<script>`、`<iframe>`、`position: fixed/absolute`、`transform` 的部分写法、CSS 变量、`@media`、自定义字体 `@font-face`。
- 支持：大部分基础 HTML 标签 + 内联样式 + `<section>`、`<p>`、`<span>`、`<strong>`、`<em>`、`<blockquote>`、`<ol>/<ul>/<li>`、`<img>`、`<table>/<tr>/<td>`、`<hr>`、`<br>`、`<a>`（自动转公众号白名单域名外链警告）。
- 图片必须是**公众号素材库的 URL**（mmbiz.qpic.cn）才能长期显示；外链图片粘贴时会由公众号自动拉取，但上传前需用户"点击上传"触发。
- 复制到剪贴板需使用 `text/html` + `text/plain` 双 MIME，保证粘贴兼容性。

---

## 二、核心功能模块规划

### 2.1 模块总览

| 模块 | 职责 | 依赖/被依赖 |
|---|---|---|
| 1. 输入采集 Input Collector | 接收 Markdown 文本、粘贴事件（HTML/RTF/纯文本） | → 内容解析 |
| 2. 内容解析 Parser | 将输入统一转换为 AST（基于 mdast/hast） | ← 输入采集； → 样式引擎 |
| 3. 样式引擎 Theme Engine | 基于模板将 AST 节点映射为带 inline-style 的 HTML | ← 解析； → 预览/导出 |
| 4. 模板系统 Template System | 管理多套模板（极简/技术/运营）、主题色自定义 | ↔ 样式引擎 |
| 5. 图片处理 Image Processor | 识别 base64/外链/本地文件，提供上传代理与占位 | ↔ 样式引擎 |
| 6. 代码高亮 Code Highlighter | Shiki/highlight.js 转行内样式 | ↔ 样式引擎 |
| 7. 表格美化 Table Beautifier | 处理超宽表格、合并单元格的降级 | ↔ 样式引擎 |
| 8. 预览 Preview | iframe 沙箱中模拟公众号手机/PC 视图 | ← 样式引擎 |
| 9. 导出 Exporter | 复制到剪贴板（HTML+Plain）、下载 HTML、一键调公众号草稿 API（可选） | ← 样式引擎 |
| 10. 微调面板 Tuning Panel | 调整主题色、字号、行距、段落间距、是否显示封面等 | ↔ 模板系统 |

### 2.2 模块关系图（逻辑数据流）

```
[Input Collector] → [Parser: Unified AST]
                            ↓
               [Image Processor / Code Highlighter / Table Beautifier]
                            ↓
         [Theme Engine ← Template System ← Tuning Panel]
                            ↓
                   [Rendered HTML with Inline Styles]
                       ↓              ↓
                   [Preview]      [Exporter]
```

---

## 三、技术方案与架构

### 3.1 技术栈推荐

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | Vite 5 + TypeScript | 快、生态好、支持 SSR 扩展 |
| 框架 | React 18 | 生态成熟，排版类库最多；Zustand 做轻状态 |
| UI 组件库 | Ant Design 5 或 shadcn/ui | 快速搭出操作面板 |
| Markdown 解析 | `unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-raw` | 业界标准、AST 可扩展、支持表格/任务列表 |
| 富文本粘贴解析 | 原生 `paste` 事件 + `DOMPurify` + 自写飞书 HTML 归一化器 | 飞书粘贴 HTML 非标，需定制 |
| 代码高亮 | `shiki`（VS Code 同款，输出已带 inline style，天然适配公众号） | 相比 highlight.js 不依赖 class |
| 样式内联化 | `juice` | 把 `<style>` 编译进 inline style，兜底方案 |
| 剪贴板 | `navigator.clipboard.write(ClipboardItem)` | 写入 `text/html` |
| 图片上传（可选） | 自建 Node/Serverless 代理 → 公众号素材 API | 解决外链失效 |
| 预览沙箱 | `<iframe sandbox>` + 约束宽度 375px / 750px | 模拟手机/PC |
| 状态管理 | Zustand + Immer | 轻量 |
| 测试 | Vitest + Playwright | 粘贴/复制需端到端测 |

### 3.2 Markdown 解析流程

```
Markdown 文本
  → remark-parse (mdast)
  → remark-gfm (表格/删除线/任务列表)
  → remark-rehype + rehype-raw (→ hast)
  → 自定义 rehype 插件：注入 inline style
  → rehype-stringify → HTML 字符串
```

关键点：
- 使用 `rehype-raw` 支持 Markdown 中穿插的原生 HTML。
- 自定义 `rehype-wechat-inline` 插件：遍历 hast，根据当前模板 + 节点类型（h1/h2/p/blockquote/code/table/img/hr/a/strong/em）合并 `style` 属性。
- 外层统一包一个 `<section data-role="article">` 方便后续整体克隆。

### 3.3 飞书粘贴内容解析

飞书复制到剪贴板时会生成三类数据：
1. `text/html`：带大量 `data-lark-*` 属性、`<div class="ace-line">`、内联 span 样式、base64 图片或 `internal://` 链接。
2. `text/plain`：纯文本降级。
3. 自定义 `application/x-lark-*`：忽略。

**归一化策略**（飞书 → 标准 HTML → 进入 hast 通道）：
1. 监听 `onPaste`，`e.clipboardData.getData('text/html')`。
2. 用 `DOMParser` 解析成 DOM。
3. 剥离 `data-lark-*`、`class`、非白名单标签（`<div>` → `<p>`，`<span style>` 中的字号/颜色选择性保留或丢弃，取决于"保留原样式 vs 重排版"模式）。
4. 替换：
   - `<div class="ace-line">` → `<p>`
   - 空 `<p>` 保留一个 `<br>` 作为段落间距
   - `<span style="font-weight: bold">` → `<strong>`
   - 列表容器补全（飞书常丢 `<ul>` 包裹）
   - 代码块：飞书通常是 `<pre><code class="language-xxx">` 或 `<div data-block-type="code">`，需统一成前者以便 shiki 处理
   - 图片 `src`：若是 base64 → 放入"待上传队列"；若是飞书私有 CDN → 标红提示"链接仅登录可见"
   - 表格：保留 `<table><tr><td>`，移除 `style` 中的 `width: 100%` 等，由模板重新接管
5. 产出干净 HTML → `rehype-parse` → 进入与 Markdown 相同的 hast 管线。

### 3.4 公众号适配：输出 HTML 原则

- **零 `class`**：所有样式必须通过 `style="..."` 内联。
- **用 `<section>` 代替 `<div>`**：公众号官方生态约定，嵌套包裹更稳。
- **避免 Flex/Grid 的罕见属性**：公众号编辑器保留 `display: flex` 但 iOS 某些版本降级差；布局尽量用 `margin / padding / text-align`。
- **字体**：只用 `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`。
- **行距**：正文 `line-height: 1.75`，移动端阅读舒适。
- **颜色**：避免 `#fff` 纯白/`#000` 纯黑（深色模式下刺眼），用 `#3f3f3f` / `#fafafa`。
- **图片**：统一 `max-width: 100%; display: block; margin: 16px auto; border-radius: 4px;`。
- **最终统一过一层 `juice` + `DOMPurify`（白名单）**。

---

## 四、排版模板设计方案

三套内置模板，每套导出一个 `Theme` 对象，结构：

```ts
interface Theme {
  id: string;
  name: string;
  base: { color: string; bg: string; fontFamily: string; fontSize: string; lineHeight: string };
  block: {
    h1: CSSProperties; h2: CSSProperties; h3: CSSProperties;
    p: CSSProperties; blockquote: CSSProperties;
    ul: CSSProperties; ol: CSSProperties; li: CSSProperties;
    code_inline: CSSProperties; code_block: CSSProperties;
    table: CSSProperties; th: CSSProperties; td: CSSProperties;
    img: CSSProperties; hr: CSSProperties; a: CSSProperties;
    strong: CSSProperties; em: CSSProperties;
  };
}
```

### 4.1 模板 A：极简风（`minimal`）
- **适合**：个人博客搬运、读书笔记。
- **主色**：`#222` 文字 + `#e8e8e8` 分割线，无强调色。
- H1：22px / 粗体 / 居中 / 上下 24px 边距 / 无底色。
- H2：18px / 粗体 / 左侧 3px 实线 `#222` 竖条 / padding-left: 10px。
- H3：16px / 粗体 / 色 `#555`。
- 正文 p：15px / `line-height: 1.8` / `color: #3f3f3f` / 段间距 16px。
- 引用 blockquote：左边 3px `#d0d0d0` + `background: #fafafa` + `padding: 12px 16px` + 斜体关闭。
- 列表：标准圆点，li 间距 6px。
- 行内代码：`background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas; color: #c7254e;`。
- 代码块：深灰底 `#2b2b2b` + 白字，通过 shiki `min-light` 主题。
- 表格：1px 实线 `#e0e0e0`、表头 `background: #fafafa`、居中。
- 图片：圆角 4px，底部 12px 细灰色说明文字占位。
- 分割线 `<hr>`：居中三点 `· · ·`（用 `<section>` 模拟，公众号兼容）。

### 4.2 模板 B：技术向（`tech`）
- **适合**：技术教程、开发者博客。
- **主色**：`#1e6fff`（蓝）+ `#0d1117` 代码底。
- H1：20px / 粗体 / 蓝色左边条 4px + 下划线 2px。
- H2：17px / `#1e6fff` / 前缀 `#` 装饰（`::before` 不支持，改用 `<span>` 内联渲染 `# `）。
- 正文 15px / `#333` / 1.75。
- 引用：蓝底浅 `#eef4ff` + 左边 4px `#1e6fff` + 图标 💡（emoji 安全）。
- 代码块：shiki `github-dark` + 顶部窗口装饰条（三点红黄绿用三个 `<span>` 做圆），行号关闭（公众号复制后行号会乱）。
- 行内代码：`background: #f3f3f3; color: #d73a49;` 字重加粗。
- 表格：斑马纹 `#fff` / `#f8fafc`，表头蓝底白字。
- 超链接：蓝色 + 下划线 + 后缀 `↗`。

### 4.3 模板 C：运营图文向（`marketing`）
- **适合**：产品推广、活动文案。
- **主色**：品牌可配置（默认 `#ff6b35` 橙）+ `#fff5ef` 浅底。
- H1：24px / 粗体 / 居中 / 背景渐变条（用 `<section style="background: linear-gradient(...)">` 包裹；公众号支持线性渐变）。
- H2：18px / 品牌色 / 配左侧大色块（`<span style="display:inline-block;width:6px;height:18px;background:#ff6b35;vertical-align:middle;margin-right:8px;">`）。
- 正文 16px（偏大）/ 1.8 / `#333`。
- 引用：品牌色浅底卡片 + 圆角 8px + 内缩 20px，类似「金句卡」。
- 列表：自定义标号（用 emoji 🔸 / ✅ 代替 `list-style`，因为公众号某些版本 list-style 显示异常）。
- 代码块：降级为灰底简单等宽（运营场景不强调代码）。
- 图片：大圆角 12px + 轻阴影（`box-shadow` 公众号部分支持，做降级：不支持时不影响阅读）。
- 分割线：中间带 emoji 的装饰线 `— ✨ —`（纯 inline HTML）。
- 文末统一"关注卡片" 组件（可选开关）。

### 4.4 模板可落地性检查表
每套模板自动通过一个 `lintTheme(theme)` 检查：
- 所有样式是否可 inline。
- 是否使用了公众号黑名单属性（`position`、`transform`、`@`）。
- 深色模式测试：在 iframe 中用 `prefers-color-scheme: dark` 模拟，避免纯白底图 + 白字失效。
- 字体堆栈是否跨平台可用。

---

## 五、交互流程设计

### 5.1 主流程（单页）

```
① 打开工具
   ↓
② 左侧输入区：Tab 切换 [Markdown 编辑器 | 粘贴区]
   - Markdown：Monaco / CodeMirror 6，实时预览
   - 粘贴区：大空白框，提示"Ctrl+V 粘贴飞书/Word/网页内容"
   ↓
③ 右侧实时预览：iframe 中以手机 375px 宽度渲染
   ↓
④ 顶部模板选择器：缩略图卡片 [极简] [技术] [运营] + 自定义主题色圆点
   ↓
⑤ 右侧上方微调面板（可折叠）：
   - 主色 Color Picker
   - 字号 [小 / 标准 / 大]
   - 段落间距 滑块
   - 首行缩进 开关
   - 封面标题卡片 开关
   ↓
⑥ 顶部操作栏按钮：
   [📋 复制到公众号]  [💾 下载 HTML]  [⚙ 上传图片]  [🔄 重置]
   ↓
⑦ 点击「复制」→ 自动触发：
   - 跑一次图片检测：若存在 base64/外链 → 弹提示"建议先上传到公众号素材"
   - 生成 HTML + 纯文本双写入剪贴板
   - Toast："已复制，请到公众号编辑器 Ctrl+V 粘贴"
```

### 5.2 关键交互节点

| 节点 | 交互细节 |
|---|---|
| 粘贴清洗 | 粘贴瞬间右下角浮层："检测到飞书内容，已自动清理 X 个冗余样式"，可点"查看差异" |
| 图片检测 | 每张图右上角浮层：🟢外链可用 / 🟡base64待上传 / 🔴飞书私有链接 |
| 代码块预览 | 切换模板时代码块实时重染色，支持切换高亮主题（GitHub Light/Dark、One Dark） |
| 表格过宽 | 列数 > 5 或渲染宽度 > 容器 → 提示"建议拆分或转图片"，并提供「一键转图片」按钮（html2canvas） |
| 复制成功 | 复制按钮变绿 + Toast 3s，失败时降级到手动"选择并复制" |
| 公众号预览 | 右侧可切换 [📱手机 375px] / [💻PC 677px]（公众号 PC 端编辑器宽度） |

---

## 六、实现细节与注意事项

### 6.1 图片处理
三种来源、三条路径：

| 来源 | 识别 | 处理 |
|---|---|---|
| 外链 https | `src` 以 https 开头 | 直接保留，提示"公众号粘贴时会自动抓取" |
| base64 | `src` 以 `data:image` | 进入待上传队列，点击"上传"后转 Blob → POST 到自建代理 → 返回 `mmbiz.qpic.cn` URL → 回填 |
| 本地文件 | 用户拖拽或点击上传 | FileReader 读成 Blob → 同上 |

**自建代理（可选后端）**：
- Cloudflare Worker 或 Vercel Function 暴露 `/api/upload`
- 后端用公众号 `access_token` 调 [`/cgi-bin/material/add_material`](https://developers.weixin.qq.com/doc)（或 `uploadimg`）
- 返回素材 URL
- 未配置后端时前端给出提示："图片将以外链形式出现，公众号首次粘贴会自动转存，但建议手动上传"

### 6.2 代码片段
- 用 **Shiki** 而非 highlight.js：Shiki 直接产出 inline style 的 token span，完美适配公众号。
- 默认主题：`github-light`（极简）、`github-dark`（技术）、灰底等宽（运营降级）。
- 不加行号（公众号复制后易错位）。
- 外层 `<section>` 加 `overflow-x: auto` + `white-space: pre`，并在文末加一行灰色小字"左右滑动查看完整代码"。
- 长代码（> 30 行）提供「折叠 / 截图」切换：截图使用 `html2canvas` 生成 PNG，上传后插入为图片。

### 6.3 表格
- 简单表格（≤ 5 列）：正常 HTML 表格 + 斑马纹。
- 超宽表格（列 > 5 或文本超长）：
  - 方案 A：外层 `<section style="overflow-x:auto">`，但公众号移动端滑动体验一般。
  - 方案 B（推荐）：**转图片**。`html2canvas` 截取整表 → PNG → 上传 → 插入 `<img>`。
- 合并单元格（colspan/rowspan）：保留属性，公众号支持。若飞书源数据缺失 → 提示用户手动修。
- 表格文末附「表格说明」小字选填字段。

### 6.4 确保公众号粘贴不走样
- **双剪贴板 MIME 写入**：
  ```ts
  const blob = new Blob([html], { type: 'text/html' });
  const plainBlob = new Blob([plain], { type: 'text/plain' });
  await navigator.clipboard.write([
    new ClipboardItem({ 'text/html': blob, 'text/plain': plainBlob }),
  ]);
  ```
- 复制前用 `juice` 二次内联（兜底移除遗漏的 `<style>`）。
- `DOMPurify` 用白名单清理未知标签。
- 对 `<img>` 统一追加 `data-width="100%"`（公众号编辑器识别的属性）。
- 复制后弹"自检报告"：列出用了多少个 `<section>`、是否含 base64、是否含 class（应为 0）。

### 6.5 多终端阅读
- 预览默认手机 375px，提供 PC 677px 切换。
- 正文字号 ≥ 15px（移动端易读性门槛）。
- 图片 `max-width: 100%`，避免溢出。
- 避免使用固定 px 宽度布局；全部 `width: 100%` 或 auto。
- 引用/代码块左右 padding ≥ 12px，避免紧贴屏幕边。

---

## 七、可扩展性与后续迭代

### 7.1 建议功能路线图

| 阶段 | 功能 | 实现思路（基于当前架构） |
|---|---|---|
| V1.1 | 一键生成目录 | 扫描 hast 中 h2/h3 节点 → 渲染带锚点的 TOC `<section>`；公众号不支持锚点跳转，改为"纯展示目录" |
| V1.2 | AI 自动摘要/标题优化 | 调用 LLM API（OpenAI/豆包）对正文做 summary，插入正文顶部卡片 |
| V1.3 | 组件化卡片库 | 在 `Template System` 下新增 `Widget`（金句卡、作者卡、二维码卡、关注引导卡）；用户拖入编辑器 |
| V1.4 | 飞书 API 直连 | OAuth 登录飞书 → 直接拉取指定文档 ID 的内容（`docx/v1/document`），绕过复制粘贴 |
| V1.5 | 公众号草稿 API | 用户扫码登录公众号 → 通过 `draft/add` 直接创建草稿，零复制 |
| V1.6 | 模板市场 | 用户自定义模板上传分享；Theme JSON 可导入导出 |
| V1.7 | 历史版本 | IndexedDB 存最近 20 篇，含输入 + 模板 + 微调参数 |

### 7.2 架构扩展锚点
- **Theme 插件化**：`Theme` 定义成独立 TS 对象 → 第三方可发 npm 包 `wx-theme-xxx`，工具通过 URL 动态加载。
- **Parser 插件化**：unified 管线天然支持 `.use(plugin)`，接入公众号转载、知乎、Notion 只需写对应归一化器。
- **Renderer 插件化**：每个节点类型的渲染函数独立注册，可替换为 React Portal 预览 + 纯字符串导出双路径。
- **后端可选**：所有功能默认纯前端可用；图片上传、飞书直连、公众号草稿走"可选后端"，Serverless 函数按需启用，便于私有部署。

---

## 八、关键决策与假设

1. **框架选 React** 而非 Vue：Monaco/Shiki/DOMPurify/juice 生态更顺，富文本类方案多。
2. **解析用 unified 全家桶** 而非 marked：AST 可编程，扩展性强；性能对单篇文章足够。
3. **代码高亮选 Shiki** 而非 highlight.js：天生输出 inline style，完美契合公众号约束。
4. **不上 SSR**：纯前端工具，CDN 部署即可；未来如做分享链接再加。
5. **图片上传默认本地不持久化**：V1 仅提供"外链 + 待上传提示"；是否接入公众号素材 API 由用户自行配置后端凭证。
6. **表格超宽默认转图片**：比横向滚动体验好，公众号场景下用户接受度高。
7. **不做 WYSIWYG 可视化编辑**：V1 聚焦"Markdown / 粘贴 → 排版 → 复制"闭环；可视化编辑放 V2。

---

## 九、项目目录结构（落地时）

```
weixin/
├── .trae/documents/wechat-mp-formatter-plan.md   ← 本文件
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Editor/             ← Monaco Markdown 编辑器
│   │   ├── PasteZone/          ← 飞书/HTML 粘贴入口
│   │   ├── Preview/            ← iframe 预览
│   │   ├── TemplatePicker/     ← 模板选择
│   │   ├── TuningPanel/        ← 微调面板
│   │   └── Toolbar/            ← 顶部操作
│   ├── core/
│   │   ├── parser/
│   │   │   ├── markdown.ts     ← unified 管线
│   │   │   ├── larkHtml.ts     ← 飞书粘贴归一化
│   │   │   └── sanitize.ts     ← DOMPurify 配置
│   │   ├── themes/
│   │   │   ├── minimal.ts
│   │   │   ├── tech.ts
│   │   │   └── marketing.ts
│   │   ├── renderer/
│   │   │   ├── inlineStyle.ts  ← rehype 插件
│   │   │   └── juiceWrap.ts
│   │   ├── code/highlight.ts   ← Shiki 封装
│   │   ├── image/uploader.ts
│   │   ├── table/beautify.ts
│   │   └── exporter/clipboard.ts
│   ├── store/                  ← Zustand
│   └── styles/                 ← 工具本身的 UI 样式（不影响导出）
└── server/ (可选)
    └── upload.ts               ← Vercel/CF Worker 图片代理
```

---

## 十、验证步骤（执行后如何自检）

1. **功能冒烟**：粘贴一份含标题、列表、图片、代码、表格的飞书文档 → 切换 3 套模板 → 复制 → 粘贴到公众号后台草稿 → 对比预览。
2. **样式合规**：用浏览器 DevTools 检查导出 HTML 是否 100% inline-style，0 个 `class` 属性。
3. **兼容性**：
   - iOS 微信内置浏览器打开预览。
   - Android 微信打开预览。
   - 公众号 PC 后台 + 移动端推送。
4. **深色模式**：手机开启深色模式，检查是否有白底 / 低对比文字。
5. **代码高亮回归**：对比 Shiki 渲染前后，复制后颜色是否保留。
6. **剪贴板**：Chrome / Safari / Firefox 均测试 `navigator.clipboard.write`，降级路径可达。
7. **图片**：base64、外链、本地上传三种路径分别走通。
8. **性能**：1 万字文章 + 20 张图 + 5 段代码，首屏渲染 < 1s，复制响应 < 500ms。

---

（方案结束，等待用户确认后进入实现阶段。）
