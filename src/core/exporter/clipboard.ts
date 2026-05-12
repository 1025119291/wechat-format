import { cleanForExport, generateExportReport, type ExportReport } from '../renderer/juiceWrap';
import { scanImages, getImageSummary } from '../image/uploader';
import { analyzeTables } from '../table/beautify';

export interface CopyResult {
  success: boolean;
  report: ExportReport;
  imageSummary: ReturnType<typeof getImageSummary>;
  tableWarnings: string[];
}

/**
 * 将 HTML + 纯文本双 MIME 写入剪贴板，兼容公众号编辑器粘贴。
 * 自动执行清理管线 + 自检报告。
 */
export async function copyHtmlToClipboard(rawHtml: string): Promise<CopyResult> {
  const html = cleanForExport(rawHtml);
  const report = generateExportReport(html);
  const imageSummary = getImageSummary(scanImages(html));
  const tableAnalysis = analyzeTables(html);

  const plain = htmlToPlainText(html);
  let success = false;

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      success = true;
    }
  } catch (e) {
    console.warn('[clipboard] navigator.clipboard.write failed, fallback', e);
  }

  if (!success) {
    success = legacyCopy(html);
  }

  return {
    success,
    report,
    imageSummary,
    tableWarnings: tableAnalysis.warnings,
  };
}

function legacyCopy(html: string): boolean {
  try {
    const container = document.createElement('div');
    container.contentEditable = 'true';
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const ok = document.execCommand('copy');

    sel?.removeAllRanges();
    document.body.removeChild(container);
    return ok;
  } catch (e) {
    console.error('[clipboard] legacy copy failed', e);
    return false;
  }
}

function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * 下载为 HTML 文件
 */
export function downloadHtml(html: string, filename = 'wechat-article.html') {
  const cleaned = cleanForExport(html);
  const full = `<!doctype html><html><head><meta charset="utf-8"><title>${filename}</title></head><body>${cleaned}</body></html>`;
  const blob = new Blob([full], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
