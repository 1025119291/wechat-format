import DOMPurify from 'dompurify';

export interface PasteAnalysis {
  isLark: boolean;
  cleanedCount: number;
  imageStats: Array<{ src: string; type: 'external' | 'base64' | 'lark-private' }>;
}

/**
 * 飞书/Word/网页粘贴 HTML 的归一化：
 * - 剥离 data-lark-* / class / id
 * - 将 <div> / 飞书 ace-line 转为 <p>
 * - <span style="font-weight:bold"> → <strong>
 * - 列表容器补全（飞书常丢 <ul> 包裹）
 * - 代码块规范化（<div data-block-type="code"> → <pre><code>）
 * - 飞书私有 CDN 链接检测
 * - 保留语义标签（strong/em/code/pre/ul/ol/li/table 等）
 * - 图片 src 保留；base64 标记待上传
 */
export function normalizePastedHtml(rawHtml: string): string {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
  const body = doc.body;

  body.querySelectorAll('style, script, meta, link').forEach((el) => el.remove());

  // <span style="font-weight:bold/700/800/900"> → <strong>
  body.querySelectorAll('span').forEach((span) => {
    const style = span.getAttribute('style') || '';
    if (/font-weight\s*:\s*(bold|[7-9]00)/.test(style)) {
      renameElement(span, 'strong');
      span.removeAttribute('style');
    }
    if (/font-style\s*:\s*italic/.test(style)) {
      renameElement(span, 'em');
      span.removeAttribute('style');
    }
  });

  // <div data-block-type="code"> → <pre><code>
  body.querySelectorAll('div[data-block-type="code"]').forEach((div) => {
    const lang = div.getAttribute('data-code-language') || '';
    const text = div.textContent || '';
    div.replaceWith(createPreCode(doc, text, lang));
  });

  // 飞书 ace-line → <p>
  body.querySelectorAll('.ace-line').forEach((el) => {
    renameElement(el, 'p');
    el.removeAttribute('class');
    el.removeAttribute('style');
  });

  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
  const toProcess: Element[] = [];
  let cur = walker.currentNode as Element | null;
  while (cur) {
    if (cur.nodeType === 1) toProcess.push(cur as Element);
    cur = walker.nextNode() as Element | null;
  }

  for (const el of toProcess) {
    [...el.attributes].forEach((attr) => {
      const n = attr.name;
      if (
        n.startsWith('data-') ||
        n === 'class' ||
        n === 'id' ||
        n === 'lang' ||
        n.startsWith('aria-') ||
        n.startsWith('on')
      ) {
        el.removeAttribute(n);
      }
    });
    if (el.tagName !== 'IMG' && el.tagName !== 'A') {
      el.removeAttribute('style');
    }
  }

  // <div> → <p> or <section>
  body.querySelectorAll('div').forEach((div) => {
    const hasBlockChild = !!div.querySelector('p, ul, ol, pre, blockquote, table, h1, h2, h3, h4, h5, h6');
    if (hasBlockChild) {
      renameElement(div, 'section');
    } else {
      renameElement(div, 'p');
    }
  });

  body.querySelectorAll('font').forEach((el) => unwrap(el));

  // 列表容器补全：飞书常丢 <ul>/<ol> 包裹
  fixBareListItems(body, doc);

  // <pre> 内补全 <code>
  body.querySelectorAll('pre').forEach((pre) => {
    if (!pre.querySelector('code')) {
      const text = pre.textContent || '';
      pre.innerHTML = '';
      pre.appendChild(createCode(doc, text));
    }
  });

  body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img')) {
      p.innerHTML = '<br/>';
    }
  });

  const dirty = body.innerHTML;
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'section', 'p', 'span', 'strong', 'b', 'em', 'i', 'u', 'del', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'ul', 'ol', 'li',
      'a', 'img', 'br', 'hr',
      'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'style', 'target'],
    ALLOW_DATA_ATTR: false,
  });

  return clean;
}

/**
 * 分析粘贴内容，返回结构化信息（用于 UI 提示）
 */
export function analyzePastedHtml(rawHtml: string): PasteAnalysis {
  const isLark = /data-lark|ace-line|data-block-type/.test(rawHtml);
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

  let cleanedCount = 0;
  const allEls = doc.body.querySelectorAll('*');
  allEls.forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith('data-') || attr.name === 'class' || attr.name.startsWith('on')) {
        cleanedCount++;
      }
    });
  });

  const imageStats: PasteAnalysis['imageStats'] = [];
  doc.body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:image/')) {
      imageStats.push({ src, type: 'base64' });
    } else if (/internal:\/\/|lark-doc|bytedance\.com\/api\/oss/.test(src)) {
      imageStats.push({ src, type: 'lark-private' });
    } else if (src.startsWith('http')) {
      imageStats.push({ src, type: 'external' });
    }
  });

  return { isLark, cleanedCount, imageStats };
}

function fixBareListItems(body: HTMLElement, doc: Document) {
  const bareLis: Element[] = [];
  body.querySelectorAll('li').forEach((li) => {
    const parent = li.parentElement;
    if (parent && parent.tagName !== 'UL' && parent.tagName !== 'OL') {
      bareLis.push(li);
    }
  });

  if (bareLis.length === 0) return;

  let currentList: Element | null = null;
  let listType: 'ul' | 'ol' = 'ul';

  for (const li of bareLis) {
    const prev = li.previousElementSibling;
    if (!prev || (prev.tagName !== 'LI' && prev.tagName !== 'UL' && prev.tagName !== 'OL')) {
      listType = /^1[\.\s]/.test(li.textContent || '') ? 'ol' : 'ul';
      currentList = doc.createElement(listType);
      li.parentNode?.insertBefore(currentList, li);
    }
    currentList?.appendChild(li);
  }
}

function createPreCode(doc: Document, text: string, lang: string): HTMLElement {
  const pre = doc.createElement('pre');
  const code = doc.createElement('code');
  if (lang) code.setAttribute('class', `language-${lang}`);
  code.textContent = text;
  pre.appendChild(code);
  return pre;
}

function createCode(doc: Document, text: string): HTMLElement {
  const code = doc.createElement('code');
  code.textContent = text;
  return code;
}

function renameElement(el: Element, newTag: string) {
  const doc = el.ownerDocument!;
  const replacement = doc.createElement(newTag);
  for (const attr of [...el.attributes]) {
    replacement.setAttribute(attr.name, attr.value);
  }
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.replaceWith(replacement);
}

function unwrap(el: Element) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

export function hasBase64Image(html: string): boolean {
  return /src=["']data:image\//.test(html);
}

export function hasLarkPrivateImage(html: string): boolean {
  return /internal:\/\/|lark-doc|bytedance\.com\/api\/oss/.test(html);
}
