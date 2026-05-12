import type { Theme } from './types';

/**
 * 卡片杂志：大量装饰线、双栏标题、前缀符号
 * - 模仿秀米 / 96 编辑器的「杂志排版」风格
 * - 每个 h2 带编号小标签，像杂志章节
 */
export const magazineTheme: Theme = {
  id: 'magazine',
  name: '卡片杂志',
  description: '杂志排版风，适合专栏、深度长文',
  codeTheme: 'github-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.85; color: #333; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;',
    h1: 'font-size: 22px; font-weight: 800; color: #222; text-align: center; margin: 20px 0 16px; letter-spacing: 1px; line-height: 1.4;',
    h2: 'font-size: 17px; font-weight: 700; color: #222; margin: 28px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #222; line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 700; color: #333; margin: 20px 0 10px; padding-left: 10px; border-left: 3px solid #f2c94c;',
    h4: 'font-size: 14px; font-weight: 700; color: #555; margin: 16px 0 10px;',
    p: 'margin: 0 0 14px; line-height: 1.85; color: #333;',
    blockquote:
      'margin: 18px 0; padding: 16px 20px; background: #fffbe6; border-left: 4px solid #f2c94c; color: #6b5a1f; font-size: 14px; border-radius: 0 6px 6px 0;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #333;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #333;',
    li: 'margin-bottom: 8px; line-height: 1.85;',
    code_inline:
      'background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #c7254e; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 14px 16px; background: #2b2b2b; color: #f8f8f2; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
    th: 'background: #222; color: #fff; padding: 10px 12px; border: 1px solid #222; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #e0e0e0; background: #fff; color: #333;',
    img: 'max-width: 100%; display: block; margin: 18px auto; border-radius: 6px;',
    hr: 'border: none; text-align: center; margin: 28px 0;',
    a: 'color: #d4a017; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #222; background: linear-gradient(transparent 65%, #fff3b0 65%); padding: 0 2px;',
    em: 'font-style: italic; color: #5a4a2a;',
    del: 'color: #999; text-decoration: line-through;',
  },
  decorations: {
    h1Prefix:
      '<section style="text-align:center;margin-bottom:10px;"><span style="display:inline-block;width:30px;height:3px;background:#f2c94c;margin:0 6px;vertical-align:middle;"></span><span style="display:inline-block;color:#f2c94c;font-size:12px;letter-spacing:3px;vertical-align:middle;">FEATURE</span><span style="display:inline-block;width:30px;height:3px;background:#f2c94c;margin:0 6px;vertical-align:middle;"></span></section>',
    h1Suffix:
      '<section style="display:block;width:40px;height:2px;background:#222;margin:14px auto 0;"></section>',
    h2Prefix:
      '<span style="display:inline-block;background:#f2c94c;color:#222;font-size:12px;font-weight:700;padding:2px 8px;margin-right:10px;border-radius:2px;vertical-align:middle;letter-spacing:1px;">SECTION</span>',
    hrReplacement:
      '<section style="text-align:center;margin:32px 0;"><span style="display:inline-block;width:40px;height:1px;background:#ccc;vertical-align:middle;"></span><span style="display:inline-block;margin:0 10px;color:#f2c94c;font-size:18px;vertical-align:middle;">❋</span><span style="display:inline-block;width:40px;height:1px;background:#ccc;vertical-align:middle;"></span></section>',
    blockquotePrefix:
      '<span style="display:inline-block;color:#f2c94c;font-size:24px;font-family:Georgia,serif;line-height:0;margin-right:6px;vertical-align:middle;">❝</span>',
    articleFooter:
      '<section style="margin-top:32px;padding:16px;background:#fffbe6;border:1px dashed #f2c94c;border-radius:6px;text-align:center;color:#6b5a1f;font-size:13px;">—— 全文完，感谢阅读 ——</section>',
  },
};
