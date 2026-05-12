import type { Theme } from './types';

/**
 * 优雅商务：深青 + 香槟金装饰
 * - 适合公司公告、品牌文章、年终盘点
 * - 标题大量使用双线、顶部小标签装饰
 */
export const businessTheme: Theme = {
  id: 'business',
  name: '优雅商务',
  description: '深青+香槟金，适合品牌公告、年终盘点',
  codeTheme: 'github-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.85; color: #2c3e50; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Songti SC", serif;',
    h1: 'font-size: 20px; font-weight: 700; color: #1a4d4a; text-align: center; margin: 24px 0 8px; letter-spacing: 2px; line-height: 1.5;',
    h2: 'font-size: 17px; font-weight: 700; color: #1a4d4a; margin: 28px 0 14px; padding: 8px 0 8px 14px; border-left: 3px double #c9a96e; background: linear-gradient(90deg, #f5efe4 0%, rgba(245,239,228,0) 100%); line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 700; color: #1a4d4a; margin: 20px 0 10px;',
    h4: 'font-size: 14px; font-weight: 700; color: #4a6b68; margin: 16px 0 10px;',
    p: 'margin: 0 0 14px; line-height: 1.85; color: #2c3e50; text-indent: 2em;',
    blockquote:
      'margin: 18px 0; padding: 14px 18px; background: #faf6ee; border-top: 1px solid #c9a96e; border-bottom: 1px solid #c9a96e; color: #5a4a32; font-size: 14px; text-align: center; font-style: italic;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #2c3e50;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #2c3e50;',
    li: 'margin-bottom: 8px; line-height: 1.85;',
    code_inline:
      'background: #f5efe4; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #1a4d4a; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 14px 16px; background: #2c3e50; color: #e8eef2; border-radius: 4px; overflow-x: auto; font-size: 13px; line-height: 1.6;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
    th: 'background: #1a4d4a; color: #f5efe4; padding: 10px 12px; border: 1px solid #1a4d4a; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #e0d8c5; background: #fff; color: #2c3e50;',
    img: 'max-width: 100%; display: block; margin: 18px auto; border-radius: 2px; border: 1px solid #e0d8c5;',
    hr: 'border: none; text-align: center; margin: 24px 0;',
    a: 'color: #1a4d4a; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #1a4d4a;',
    em: 'font-style: italic; color: #5a4a32;',
    del: 'color: #999; text-decoration: line-through;',
  },
  decorations: {
    h1Prefix:
      '<section style="text-align:center;margin-bottom:6px;"><span style="display:inline-block;padding:2px 12px;font-size:11px;color:#c9a96e;letter-spacing:4px;border:1px solid #c9a96e;">ARTICLE</span></section>',
    h1Suffix:
      '<section style="display:block;width:80px;height:0;border-bottom:1px solid #c9a96e;margin:10px auto 0;position:relative;"><span style="display:inline-block;position:relative;top:-6px;background:#fff;padding:0 6px;color:#c9a96e;font-size:10px;">✦</span></section>',
    h2Prefix:
      '<span style="display:inline-block;width:4px;height:4px;background:#c9a96e;border-radius:50%;margin-right:10px;vertical-align:middle;"></span>',
    hrReplacement:
      '<section style="text-align:center;margin:30px 0;"><span style="display:inline-block;width:60px;height:1px;background:#c9a96e;vertical-align:middle;"></span><span style="display:inline-block;margin:0 12px;color:#c9a96e;font-size:14px;">✦</span><span style="display:inline-block;width:60px;height:1px;background:#c9a96e;vertical-align:middle;"></span></section>',
    blockquotePrefix:
      '<section style="text-align:center;margin-bottom:6px;color:#c9a96e;font-size:12px;letter-spacing:3px;">— 引 言 —</section>',
  },
};
