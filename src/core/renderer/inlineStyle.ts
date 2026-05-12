import { visit } from 'unist-util-visit';
import type { Root, Element, ElementContent } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import type { Theme } from '../themes/types';
import { mergeStyle } from '../themes/types';

/**
 * 解析装饰 HTML 片段为 hast 子节点
 */
function parseFragment(html: string): ElementContent[] {
  if (!html) return [];
  const root = fromHtml(html, { fragment: true }) as Root;
  return root.children as ElementContent[];
}

/**
 * rehype 插件：根据 Theme 为 hast 节点注入 inline style + 装饰性节点。
 */
export function rehypeInlineTheme(theme: Theme) {
  const s = theme.styles;
  const d = theme.decorations || {};

  return () => (tree: Root) => {
    // 第一轮：样式注入
    visit(tree, 'element', (node: Element) => {
      const props = (node.properties ||= {});
      const existing = typeof props.style === 'string' ? (props.style as string) : '';

      const apply = (style?: string) => {
        if (!style) return;
        props.style = mergeStyle(existing, style);
      };

      switch (node.tagName) {
        case 'h1': apply(s.h1); break;
        case 'h2': apply(s.h2); break;
        case 'h3': apply(s.h3); break;
        case 'h4':
        case 'h5':
        case 'h6':
          apply(s.h4); break;
        case 'p': apply(s.p); break;
        case 'blockquote': apply(s.blockquote); break;
        case 'ul': apply(s.ul); break;
        case 'ol': apply(s.ol); break;
        case 'li': apply(s.li); break;
        case 'code': apply(s.code_inline); break;
        case 'pre': apply(s.pre); break;
        case 'table': apply(s.table); break;
        case 'thead': apply(s.thead); break;
        case 'tbody': apply(s.tbody); break;
        case 'tr': apply(s.tr); break;
        case 'th': apply(s.th); break;
        case 'td': apply(s.td); break;
        case 'img': apply(s.img); break;
        case 'hr': apply(s.hr); break;
        case 'a': apply(s.a); break;
        case 'strong':
        case 'b':
          apply(s.strong); break;
        case 'em':
        case 'i':
          apply(s.em); break;
        case 'del':
        case 's':
          apply(s.del); break;
        default: break;
      }
    });

    // 第二轮：修正 <pre><code> 内部 code 的样式（覆盖行内代码样式）
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return;
      for (const child of node.children) {
        if (child.type === 'element' && child.tagName === 'code') {
          const cp = (child.properties ||= {});
          cp.style = s.code_block || '';
        }
      }
    });

    // 第三轮：装饰性节点注入
    visit(tree, 'element', (node: Element) => {
      switch (node.tagName) {
        case 'h1': {
          if (d.h1Prefix) node.children.unshift(...parseFragment(d.h1Prefix));
          if (d.h1Suffix) node.children.push(...parseFragment(d.h1Suffix));
          break;
        }
        case 'h2': {
          if (d.h2Prefix) node.children.unshift(...parseFragment(d.h2Prefix));
          if (d.h2Suffix) node.children.push(...parseFragment(d.h2Suffix));
          break;
        }
        case 'h3': {
          if (d.h3Prefix) node.children.unshift(...parseFragment(d.h3Prefix));
          break;
        }
        case 'blockquote': {
          if (d.blockquotePrefix) node.children.unshift(...parseFragment(d.blockquotePrefix));
          break;
        }
        case 'hr': {
          if (d.hrReplacement) {
            const replacement = parseFragment(d.hrReplacement);
            if (replacement.length > 0 && replacement[0].type === 'element') {
              const first = replacement[0] as Element;
              node.tagName = first.tagName;
              node.properties = first.properties;
              node.children = first.children;
            }
          }
          break;
        }
        default: break;
      }
    });

    // 第四轮：文章头部 / 尾部装饰（作用于 root 下的顶层节点）
    if (d.articleHeader) {
      tree.children = [...parseFragment(d.articleHeader), ...tree.children];
    }
    if (d.articleFooter) {
      tree.children = [...tree.children, ...parseFragment(d.articleFooter)];
    }
  };
}
