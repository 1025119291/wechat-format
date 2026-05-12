import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

const THEMES = ['github-light', 'github-dark', 'min-light'] as const;
const LANGS = [
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'json',
  'html',
  'css',
  'bash',
  'shell',
  'python',
  'go',
  'java',
  'rust',
  'sql',
  'yaml',
  'markdown',
  'xml',
];

function getHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;
  const p = createHighlighter({
    themes: [...THEMES],
    langs: LANGS,
  });
  highlighterPromise = p;
  return p;
}

/**
 * 将代码字符串高亮为 inline-style span 构成的 <pre><code>...</code></pre> HTML。
 * 返回的 HTML 天生带内联样式，适合直接塞进公众号。
 */
export async function highlightCode(
  code: string,
  lang: string | undefined,
  theme: 'github-light' | 'github-dark' | 'min-light' = 'github-light',
): Promise<string> {
  const highlighter = await getHighlighter();
  const language = lang && LANGS.includes(lang) ? lang : 'text';
  try {
    const html = highlighter.codeToHtml(code, {
      lang: language,
      theme,
    });
    const lineCount = code.split('\n').length;
    if (lineCount > 8) {
      return wrapWithScrollHint(html, theme === 'github-dark' || theme === 'min-light');
    }
    return html;
  } catch {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code>${escaped}</code></pre>`;
  }
}

function wrapWithScrollHint(innerHtml: string, isDark: boolean): string {
  const hintColor = isDark ? '#6b7b8d' : '#999';
  return `<section style="overflow-x:auto;-webkit-overflow-scrolling:touch;">${innerHtml}<p style="font-size:11px;color:${hintColor};text-align:center;margin:4px 0 0;">← 左右滑动查看完整代码 →</p></section>`;
}

/**
 * 预热：避免首次渲染卡顿
 */
export function warmupHighlighter() {
  getHighlighter().catch(() => {});
}
