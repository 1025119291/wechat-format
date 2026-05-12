// 主题类型定义：所有值将以 inline style 形式输出到公众号 HTML
export interface ThemeStyles {
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  p?: string;
  blockquote?: string;
  ul?: string;
  ol?: string;
  li?: string;
  code_inline?: string;
  pre?: string;
  code_block?: string;
  table?: string;
  thead?: string;
  tbody?: string;
  tr?: string;
  th?: string;
  td?: string;
  img?: string;
  hr?: string;
  a?: string;
  strong?: string;
  em?: string;
  del?: string;
  section?: string;
}

/**
 * 装饰性节点：用真实 DOM 包装而非 ::before/::after，保证公众号兼容。
 * 每个字段的 HTML 片段会在对应标签的内部前/后注入；应保持极简且全内联样式。
 */
export interface ThemeDecorations {
  /** H1 内容前的装饰（如左侧色块、前缀符号） */
  h1Prefix?: string;
  /** H1 内容后的装饰（如右侧色块、装饰线） */
  h1Suffix?: string;
  /** H1 外层额外包裹（完整 wrapper HTML，用 {inner} 占位内部原有内容） */
  h1Wrap?: string;
  /** H2 前缀装饰（如方块、小圆点） */
  h2Prefix?: string;
  /** H2 后缀装饰 */
  h2Suffix?: string;
  /** H3 前缀装饰 */
  h3Prefix?: string;
  /** HR 分隔线的完整替换内容（替换原生 <hr>） */
  hrReplacement?: string;
  /** 整篇文章顶部插入的装饰块（HTML） */
  articleHeader?: string;
  /** 整篇文章底部插入的装饰块（HTML） */
  articleFooter?: string;
  /** 引用块前缀装饰（如引号符号） */
  blockquotePrefix?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  codeTheme: 'github-light' | 'github-dark' | 'min-light';
  styles: ThemeStyles;
  decorations?: ThemeDecorations;
}

/**
 * 将样式变量合并到已有的 style 属性中
 */
export function mergeStyle(existing: string | undefined, add: string | undefined): string {
  if (!add) return existing || '';
  if (!existing) return add;
  const trimmed = existing.trim().replace(/;$/, '');
  return `${trimmed}; ${add}`;
}
