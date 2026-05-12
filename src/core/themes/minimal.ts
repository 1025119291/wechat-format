import type { Theme } from './types';

export const minimalTheme: Theme = {
  id: 'minimal',
  name: '极简',
  description: '黑白灰主色，适合博客、读书笔记',
  codeTheme: 'min-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.8; color: #3f3f3f; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;',
    h1: 'font-size: 22px; font-weight: 700; color: #222; text-align: center; margin: 28px 0 20px; line-height: 1.4;',
    h2: 'font-size: 18px; font-weight: 700; color: #222; border-left: 3px solid #222; padding-left: 10px; margin: 24px 0 14px; line-height: 1.4;',
    h3: 'font-size: 16px; font-weight: 700; color: #555; margin: 20px 0 12px; line-height: 1.4;',
    h4: 'font-size: 15px; font-weight: 700; color: #555; margin: 16px 0 10px;',
    p: 'margin: 0 0 16px; line-height: 1.8; color: #3f3f3f;',
    blockquote:
      'margin: 16px 0; padding: 12px 16px; border-left: 3px solid #d0d0d0; background: #fafafa; color: #555;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #3f3f3f;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #3f3f3f;',
    li: 'margin-bottom: 6px; line-height: 1.8;',
    code_inline:
      'background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #c7254e; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 14px 16px; background: #2b2b2b; color: #f8f8f2; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.6;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table:
      'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e0e0e0;',
    th: 'background: #fafafa; padding: 8px 12px; border: 1px solid #e0e0e0; text-align: center; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #e0e0e0; text-align: center;',
    img: 'max-width: 100%; display: block; margin: 16px auto; border-radius: 4px;',
    hr: 'border: none; text-align: center; margin: 24px 0; color: #bbb; font-size: 14px;',
    a: 'color: #1e6fff; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #222;',
    em: 'font-style: italic;',
    del: 'color: #999; text-decoration: line-through;',
  },
};
