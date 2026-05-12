import type { Theme } from './types';

/**
 * 运营图文（柔化版）
 * - 用珊瑚粉 / 暖灰代替原来高饱和橙
 * - 保留品牌感但文字不刺眼
 */
export const marketingTheme: Theme = {
  id: 'marketing',
  name: '运营图文',
  description: '珊瑚粉暖色系，适合品牌、活动图文',
  codeTheme: 'github-light',
  styles: {
    section:
      'font-size: 15px; line-height: 1.8; color: #3d3d3d; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;',
    h1: 'font-size: 20px; font-weight: 700; color: #3d3d3d; text-align: center; margin: 28px 0 20px; letter-spacing: 1px; line-height: 1.5;',
    h2: 'font-size: 17px; font-weight: 700; color: #3d3d3d; margin: 24px 0 14px; padding-left: 12px; border-left: 4px solid #e8866a; line-height: 1.5;',
    h3: 'font-size: 15px; font-weight: 700; color: #e8866a; margin: 20px 0 12px;',
    h4: 'font-size: 15px; font-weight: 700; color: #555; margin: 16px 0 10px;',
    p: 'margin: 0 0 14px; line-height: 1.8; color: #3d3d3d; letter-spacing: 0.3px;',
    blockquote:
      'margin: 16px 0; padding: 14px 16px 14px 40px; background: #fdf6f2; border-radius: 6px; color: #6b4a3f; font-size: 14px; position: relative;',
    ul: 'margin: 12px 0; padding-left: 24px; color: #3d3d3d;',
    ol: 'margin: 12px 0; padding-left: 24px; color: #3d3d3d;',
    li: 'margin-bottom: 8px; line-height: 1.8;',
    code_inline:
      'background: #fdf6f2; padding: 2px 6px; border-radius: 3px; font-family: Menlo, Consolas, monospace; color: #c06a50; font-size: 90%;',
    pre: 'margin: 16px 0; padding: 14px 16px; background: #fafafa; color: #333; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.6; border: 1px solid #ececec;',
    code_block: 'font-family: Menlo, Consolas, monospace; background: transparent; color: inherit;',
    table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
    th: 'background: #fdf6f2; color: #6b4a3f; padding: 10px 12px; border: 1px solid #f0dccf; font-weight: 600;',
    td: 'padding: 8px 12px; border: 1px solid #f0dccf; background: #fff; color: #3d3d3d;',
    img: 'max-width: 100%; display: block; margin: 18px auto; border-radius: 10px;',
    hr: 'border: none; text-align: center; margin: 24px 0;',
    a: 'color: #c06a50; text-decoration: underline; word-break: break-all;',
    strong: 'font-weight: 700; color: #3d3d3d; background: linear-gradient(transparent 60%, #fce4d9 60%);',
    em: 'font-style: italic; color: #6b4a3f;',
    del: 'color: #999; text-decoration: line-through;',
  },
  decorations: {
    // H1：上下细线 + 中间的标题
    h1Wrap: '', // 用 prefix/suffix 即可
    h1Prefix:
      '<section style="display:block;width:40px;height:2px;background:#e8866a;margin:0 auto 12px;"></section>',
    h1Suffix:
      '<section style="display:block;width:60px;height:1px;background:#e0c7bb;margin:12px auto 0;"></section>',
    // H2：左侧竖条已在 style 里，前缀加一个小色点
    h2Prefix:
      '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#e8866a;margin-right:8px;vertical-align:middle;"></span>',
    // HR：中间三个点
    hrReplacement:
      '<section style="text-align:center;margin:28px 0;color:#e8866a;letter-spacing:6px;font-size:14px;">• • •</section>',
    // 引用前一个大引号
    blockquotePrefix:
      '<span style="position:absolute;left:12px;top:8px;color:#f0c8b8;font-size:28px;font-family:Georgia,serif;line-height:1;">“</span>',
  },
};
