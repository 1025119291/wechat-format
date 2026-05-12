import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import type { Theme } from '../themes/types';
import { rehypeInlineTheme } from '../renderer/inlineStyle';
import { highlightCode } from '../code/highlight';

/**
 * 从 HTML 字符串中提取所有 <pre><code class="language-xxx">...</code></pre>，
 * 用 shiki 高亮后替换回去。
 * 此步骤在 inline 样式注入之前执行，保证 shiki 输出的行内样式不被覆盖。
 */
async function highlightPreBlocks(html: string, theme: Theme): Promise<string> {
  const preRegex = /<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...html.matchAll(preRegex)];
  if (matches.length === 0) return html;

  const replacements: Array<{ full: string; replace: string }> = [];
  for (const m of matches) {
    const lang = m[1];
    const rawCode = decodeHtmlEntities(m[2]);
    const highlighted = await highlightCode(rawCode, lang, theme.codeTheme);
    replacements.push({ full: m[0], replace: highlighted });
  }

  let out = html;
  for (const r of replacements) {
    out = out.replace(r.full, () => r.replace);
  }
  return out;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Markdown → 带 inline 样式的 HTML
 */
export async function markdownToWechatHtml(markdown: string, theme: Theme): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeInlineTheme(theme))
    .use(rehypeStringify, { allowDangerousHtml: true });

  const file = await processor.process(markdown);
  const rawHtml = String(file);

  // 再处理 shiki 高亮
  const highlighted = await highlightPreBlocks(rawHtml, theme);

  return wrapSection(highlighted, theme);
}

/**
 * 已经是 HTML（来自粘贴归一化）→ 带 inline 样式
 */
export async function htmlToWechatHtml(html: string, theme: Theme): Promise<string> {
  const { unified } = await import('unified');
  const rehypeParse = (await import('rehype-parse')).default;
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeInlineTheme(theme))
    .use(rehypeStringify);
  const file = await processor.process(html);
  const highlighted = await highlightPreBlocks(String(file), theme);
  return wrapSection(highlighted, theme);
}

function wrapSection(innerHtml: string, theme: Theme): string {
  const rootStyle = theme.styles.section || '';
  return `<section data-role="article" style="${rootStyle}">${innerHtml}</section>`;
}
