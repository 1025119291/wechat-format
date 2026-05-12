import type { Theme } from './types';

/**
 * 技术向（柔化版）
 * - 主色由深蓝 #1e6fff 改为柔和天青 #5b8db8
 * - 代码块用深灰 #1f2937 代替纯黑 #0d1117
 * - 引用、表头改用浅青底，文字色不再是纯蓝
 */
export const techTheme: Theme = {
  id: 'tech',
  name: '技术向',
  description: '柔和青蓝，适合技术教程、开发博客',
  codeTheme: 'github-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.8; color: #374151; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;',
    h1: 'font-size: 20px; font-weight: 700; color: #2d4a6b; border-left: 4px solid #5b8db8; padding: 4px 0 4px 12px; margin: 28px 0 18px; line-height: 1.5;',
    h2: 'font-size: 17px; font-weight: 700; color: #2d4a6b; margin: 24px 0 14px; padding-bottom: 6px; border-bottom: 1px dashed #c6d4e3; line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 700; color: #4a6b8a; margin: 20px 0 12px;',
    h4: 'font-size: 14px; font-weight: 700; color: #555; margin: 16px 0 10px;',
    p: 'margin: 0 0 14px; line-height: 1.8; color: #374151;',
    blockquote:
      'margin: 16px 0; padding: 12px 16px; border-left: 3px solid #5b8db8; background: #f1f6fb; color: #3d5878; border-radius: 0 4px 4px 0;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #374151;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #374151;',
    li: 'margin-bottom: 6px; line-height: 1.8;',
    code_inline:
      'background: #f1f6fb; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #b85c5c; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 16px; background: #1f2937; color: #e6edf3; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table:
      'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border-radius: 4px; overflow: hidden;',
    th: 'background: #e8f0f8; color: #2d4a6b; padding: 10px 12px; border: 1px solid #d4e0ed; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #e4ecf4; background: #fff; color: #374151;',
    img: 'max-width: 100%; display: block; margin: 16px auto; border-radius: 4px;',
    hr: 'border: none; border-top: 1px dashed #d0d9e3; margin: 24px 0;',
    a: 'color: #5b8db8; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #2d4a6b;',
    em: 'font-style: italic;',
    del: 'color: #999; text-decoration: line-through;',
  },
  decorations: {
    h2Prefix:
      '<span style="display:inline-block;color:#5b8db8;margin-right:8px;font-weight:400;vertical-align:baseline;">#</span>',
    hrReplacement:
      '<section style="text-align:center;margin:26px 0;"><span style="display:inline-block;width:70px;height:1px;background:#d0d9e3;vertical-align:middle;"></span><span style="display:inline-block;margin:0 10px;color:#5b8db8;font-size:12px;vertical-align:middle;">&lt;/&gt;</span><span style="display:inline-block;width:70px;height:1px;background:#d0d9e3;vertical-align:middle;"></span></section>',
  },
};
