import { create } from 'zustand';
import { themes, type Theme } from '../core/themes';

export type InputMode = 'markdown' | 'paste';
export type PreviewDevice = 'mobile' | 'pc';
export type FontSize = 'small' | 'standard' | 'large';

interface AppState {
  inputMode: InputMode;
  markdown: string;
  pastedHtml: string;
  themeId: string;
  accentColor: string;
  renderedHtml: string;
  previewDevice: PreviewDevice;
  fontSize: FontSize;
  lineHeight: number;
  paragraphSpacing: number;
  firstLineIndent: boolean;

  setInputMode: (m: InputMode) => void;
  setMarkdown: (v: string) => void;
  setPastedHtml: (v: string) => void;
  setThemeId: (id: string) => void;
  setAccentColor: (c: string) => void;
  setRenderedHtml: (h: string) => void;
  setPreviewDevice: (d: PreviewDevice) => void;
  setFontSize: (s: FontSize) => void;
  setLineHeight: (v: number) => void;
  setParagraphSpacing: (v: number) => void;
  setFirstLineIndent: (v: boolean) => void;

  getTheme: () => Theme;
}

const DEFAULT_MD = `# 欢迎使用微信公众号排版工具

这是一个帮助你把 **Markdown** 或 **飞书文档** 粘贴内容一键排版为公众号图文的工具。

## 特性

- 多套精美模板：极简 / 技术 / 运营
- 代码高亮（Shiki，内联样式，公众号兼容）
- 一键复制到公众号编辑器
- 支持表格、引用、列表、图片

## 代码示例

\`\`\`typescript
function hello(name: string) {
  console.log(\`Hello, \${name}!\`);
}
hello('公众号');
\`\`\`

## 引用

> 这是一段引用，用来引用别人的观点或强调重点。

## 表格

| 模板   | 风格     | 适合场景         |
|--------|----------|------------------|
| 极简   | 黑白灰   | 博客 / 读书笔记  |
| 技术向 | 蓝色     | 技术教程         |
| 运营   | 橙色品牌 | 活动 / 推广      |

## 图片

![示例图片](https://picsum.photos/600/300)

---

粘贴 Markdown 或飞书内容，即刻排版！
`;

export const useAppStore = create<AppState>((set, get) => ({
  inputMode: 'markdown',
  markdown: DEFAULT_MD,
  pastedHtml: '',
  themeId: 'minimal',
  accentColor: '#1e6fff',
  renderedHtml: '',
  previewDevice: 'mobile',
  fontSize: 'standard',
  lineHeight: 1.8,
  paragraphSpacing: 14,
  firstLineIndent: false,

  setInputMode: (m) => set({ inputMode: m }),
  setMarkdown: (v) => set({ markdown: v }),
  setPastedHtml: (v) => set({ pastedHtml: v }),
  setThemeId: (id) => set({ themeId: id }),
  setAccentColor: (c) => set({ accentColor: c }),
  setRenderedHtml: (h) => set({ renderedHtml: h }),
  setPreviewDevice: (d) => set({ previewDevice: d }),
  setFontSize: (s) => set({ fontSize: s }),
  setLineHeight: (v) => set({ lineHeight: v }),
  setParagraphSpacing: (v) => set({ paragraphSpacing: v }),
  setFirstLineIndent: (v) => set({ firstLineIndent: v }),

  getTheme: () => themes[get().themeId] || themes.minimal,
}));
