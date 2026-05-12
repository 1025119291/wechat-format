import type { Theme } from './types';

/**
 * 新媒体（现代精致版）
 * - 主色：莓紫 #8a5a8b + 米白底 #fbf8f6
 * - 风格：大量留白、徽章式标题、细装饰线
 * - 灵感：现代新媒体公众号、Medium、轻出版物
 */
export const trendyTheme: Theme = {
  id: 'trendy',
  name: '新媒体',
  description: '莓紫精致风，适合观点、专栏、深度文',
  codeTheme: 'github-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.9; color: #3a3a3a; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; letter-spacing: 0.2px;',
    h1: 'font-size: 20px; font-weight: 700; color: #2a2a2a; text-align: center; margin: 24px 0 6px; letter-spacing: 2px; line-height: 1.6;',
    h2: 'font-size: 16px; font-weight: 700; color: #2a2a2a; margin: 30px 0 16px; line-height: 1.6;',
    h3: 'font-size: 15px; font-weight: 700; color: #8a5a8b; margin: 22px 0 10px;',
    h4: 'font-size: 14px; font-weight: 700; color: #555; margin: 16px 0 10px;',
    p: 'margin: 0 0 16px; line-height: 1.9; color: #3a3a3a;',
    blockquote:
      'margin: 20px 10px; padding: 6px 0 6px 20px; border-left: 2px solid #8a5a8b; color: #5a4858; font-size: 15px; font-style: italic;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #3a3a3a;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #3a3a3a;',
    li: 'margin-bottom: 8px; line-height: 1.9;',
    code_inline:
      'background: #f5eef5; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #8a5a8b; font-size: 90%;',
    pre: 'margin: 18px 0; padding: 16px; background: #faf7fa; color: #3a3a3a; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #eee2ee;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;',
    th: 'background: #faf7fa; color: #5a4858; padding: 10px 12px; border-bottom: 2px solid #8a5a8b; font-weight: 600; text-align: left;',
    td: 'padding: 10px 12px; border-bottom: 1px solid #eee2ee; background: #fff; color: #3a3a3a;',
    img: 'max-width: 100%; display: block; margin: 20px auto; border-radius: 4px;',
    hr: 'border: none; text-align: center; margin: 30px 0;',
    a: 'color: #8a5a8b; text-decoration: underline; text-underline-offset: 3px; word-break: break-all;',
    strong: 'font-weight: 700; color: #2a2a2a;',
    em: 'font-style: italic; color: #5a4858;',
    del: 'color: #aaa; text-decoration: line-through;',
  },
  decorations: {
    // H1：上方 EDITOR 小标签 + 下方细线，居中优雅
    h1Prefix:
      '<section style="text-align:center;margin-bottom:10px;"><span style="display:inline-block;padding:3px 14px;font-size:10px;color:#8a5a8b;letter-spacing:4px;background:#f5eef5;border-radius:20px;">EDITOR\'S PICK</span></section>',
    h1Suffix:
      '<section style="display:block;width:30px;height:2px;background:#8a5a8b;margin:14px auto 0;"></section>',
    // H2：左侧细竖线 + 小编号圆点
    h2Prefix:
      '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#8a5a8b;margin-right:10px;vertical-align:middle;"></span><span style="display:inline-block;width:20px;height:1px;background:#8a5a8b;margin-right:10px;vertical-align:middle;"></span>',
    // HR：简洁的三点
    hrReplacement:
      '<section style="text-align:center;margin:32px 0;color:#c8a8c9;letter-spacing:10px;font-size:14px;">·  ·  ·</section>',
    // 引用前缀：小竖条 LABEL
    blockquotePrefix:
      '<span style="display:block;color:#8a5a8b;font-size:11px;letter-spacing:2px;margin-bottom:4px;font-style:normal;">QUOTE</span>',
  },
};
