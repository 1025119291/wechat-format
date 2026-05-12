import type { Theme } from './types';

/**
 * 赛博科技：深黑底 + 青蓝/紫色霓虹装饰
 * - 适合科技评测、AI、产品发布、工具类文章
 * - 整体底为深灰 #0f1419，避免纯黑过于刺眼
 * - 装饰使用代码风「> 箭头」「[ SECTION ]」方括号等
 */
export const cyberTheme: Theme = {
  id: 'cyber',
  name: '赛博科技',
  description: '深黑底+霓虹青紫，适合科技评测、AI 文章',
  codeTheme: 'github-dark',
  styles: {
    section:
      'font-size: 15px; line-height: 1.85; color: #d0d6dd; background: #0f1419; padding: 20px 16px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; letter-spacing: 0.2px;',
    h1: 'font-size: 22px; font-weight: 800; color: #7dd3fc; text-align: center; margin: 24px 0 18px; letter-spacing: 3px; line-height: 1.5;',
    h2: 'font-size: 17px; font-weight: 700; color: #7dd3fc; margin: 28px 0 14px; padding: 6px 0 6px 12px; border-left: 3px solid #a78bfa; line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 700; color: #a78bfa; margin: 22px 0 12px;',
    h4: 'font-size: 14px; font-weight: 700; color: #c8d3e1; margin: 16px 0 10px;',
    p: 'margin: 0 0 14px; line-height: 1.85; color: #d0d6dd;',
    blockquote:
      'margin: 18px 0; padding: 12px 16px; background: rgba(125, 211, 252, 0.06); border-left: 3px solid #7dd3fc; color: #a6e4f5; border-radius: 0 6px 6px 0; font-size: 14px;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #d0d6dd;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #d0d6dd;',
    li: 'margin-bottom: 8px; line-height: 1.85;',
    code_inline:
      'background: rgba(167, 139, 250, 0.15); padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #c4b5fd; font-size: 90%; border: 1px solid rgba(167,139,250,0.2);',
    pre: 'margin: 16px 0; padding: 16px; background: #1a1f2e; color: #e6edf3; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #2a3142;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;',
    th: 'background: #1a1f2e; color: #7dd3fc; padding: 10px 12px; border: 1px solid #2a3142; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #2a3142; background: #131926; color: #d0d6dd;',
    img: 'max-width: 100%; display: block; margin: 18px auto; border-radius: 6px;',
    hr: 'border: none; text-align: center; margin: 28px 0;',
    a: 'color: #7dd3fc; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #a78bfa;',
    em: 'font-style: italic; color: #7dd3fc;',
    del: 'color: #666; text-decoration: line-through;',
  },
  decorations: {
    // 文章顶部系统状态栏风格
    articleHeader:
      '<section style="display:block;margin-bottom:18px;padding:8px 12px;background:#1a1f2e;border:1px solid #2a3142;border-radius:4px;font-family:Menlo,Consolas,monospace;font-size:11px;color:#7dd3fc;letter-spacing:1px;">&gt; SYSTEM.READY &nbsp;&nbsp;//&nbsp;&nbsp; <span style="color:#a78bfa;">ARTICLE.LOADED</span></section>',
    h1Prefix:
      '<section style="text-align:center;margin-bottom:10px;color:#a78bfa;font-family:Menlo,Consolas,monospace;font-size:11px;letter-spacing:3px;">[ FEATURED ]</section>',
    h1Suffix:
      '<section style="text-align:center;margin-top:12px;"><span style="display:inline-block;width:8px;height:8px;border:1px solid #7dd3fc;transform:rotate(45deg);margin:0 6px;"></span><span style="display:inline-block;width:40px;height:1px;background:linear-gradient(90deg,transparent,#7dd3fc,transparent);vertical-align:middle;"></span><span style="display:inline-block;width:8px;height:8px;border:1px solid #a78bfa;transform:rotate(45deg);margin:0 6px;"></span></section>',
    h2Prefix:
      '<span style="display:inline-block;color:#a78bfa;font-family:Menlo,Consolas,monospace;margin-right:8px;font-weight:400;">&gt;</span>',
    h3Prefix:
      '<span style="display:inline-block;color:#7dd3fc;font-family:Menlo,Consolas,monospace;margin-right:6px;font-weight:400;">#</span>',
    hrReplacement:
      '<section style="text-align:center;margin:30px 0;color:#7dd3fc;font-family:Menlo,Consolas,monospace;font-size:11px;letter-spacing:2px;">— — — —  //  — — — —</section>',
    blockquotePrefix:
      '<span style="display:inline-block;color:#a78bfa;font-family:Menlo,Consolas,monospace;font-size:11px;letter-spacing:2px;margin-right:8px;">INFO:</span>',
    articleFooter:
      '<section style="margin-top:28px;padding:10px 12px;background:#1a1f2e;border:1px solid #2a3142;border-radius:4px;font-family:Menlo,Consolas,monospace;font-size:11px;color:#7dd3fc;letter-spacing:1px;text-align:center;">&gt; END_OF_ARTICLE &nbsp;&nbsp;//&nbsp;&nbsp; <span style="color:#a78bfa;">THANKS_FOR_READING</span></section>',
  },
};
