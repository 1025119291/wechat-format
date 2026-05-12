import type { Theme } from './types';

/**
 * 清新文艺：米色底 + 莫兰迪绿 + 手写感装饰
 * - 适合生活随笔、读书笔记、情感类文章
 * - 柔和低饱和
 */
export const literaryTheme: Theme = {
  id: 'literary',
  name: '清新文艺',
  description: '米色+莫兰迪绿，适合随笔、读书笔记',
  codeTheme: 'min-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.9; color: #4a4a42; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Songti SC", "Microsoft YaHei", serif; background: transparent;',
    h1: 'font-size: 20px; font-weight: 600; color: #4a6b5a; text-align: center; margin: 24px 0 10px; letter-spacing: 3px; line-height: 1.5;',
    h2: 'font-size: 17px; font-weight: 600; color: #4a6b5a; margin: 26px 0 14px; line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 600; color: #6b8775; margin: 20px 0 10px;',
    h4: 'font-size: 14px; font-weight: 600; color: #6b8775; margin: 16px 0 10px;',
    p: 'margin: 0 0 16px; line-height: 1.9; color: #4a4a42; text-indent: 2em;',
    blockquote:
      'margin: 18px 20px; padding: 14px 18px; background: #f5f1e8; border-radius: 4px; color: #6b6556; font-size: 14px; font-style: italic;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #4a4a42;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #4a4a42;',
    li: 'margin-bottom: 8px; line-height: 1.9;',
    code_inline:
      'background: #f5f1e8; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #6b8775; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 14px 16px; background: #f5f1e8; color: #4a4a42; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #e8e0cf;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
    th: 'background: #e8e0cf; color: #4a4a42; padding: 10px 12px; border: 1px solid #d8ccb0; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #e8e0cf; background: #fdfbf4; color: #4a4a42;',
    img: 'max-width: 100%; display: block; margin: 18px auto; border-radius: 4px;',
    hr: 'border: none; text-align: center; margin: 26px 0;',
    a: 'color: #6b8775; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #4a6b5a;',
    em: 'font-style: italic; color: #8a7a5c;',
    del: 'color: #999; text-decoration: line-through;',
  },
  decorations: {
    articleHeader:
      '<section style="text-align:center;margin:8px 0 20px;color:#8a7a5c;font-size:12px;letter-spacing:4px;">· 随 笔 ·</section>',
    h1Prefix:
      '<section style="text-align:center;margin-bottom:8px;color:#8a7a5c;font-size:14px;font-family:Georgia,serif;">❁</section>',
    h1Suffix:
      '<section style="display:block;width:40px;height:1px;background:#b5c9bd;margin:12px auto 0;"></section>',
    h2Prefix:
      '<span style="display:inline-block;color:#b5c9bd;font-size:14px;margin-right:8px;vertical-align:middle;">❋</span>',
    h3Prefix:
      '<span style="display:inline-block;color:#b5c9bd;margin-right:6px;">·</span>',
    hrReplacement:
      '<section style="text-align:center;margin:30px 0;color:#b5c9bd;font-size:12px;letter-spacing:8px;">❁ ❁ ❁</section>',
    blockquotePrefix:
      '<span style="display:inline-block;color:#b5c9bd;font-size:20px;font-family:Georgia,serif;line-height:0;margin-right:6px;vertical-align:middle;">「</span>',
  },
};
