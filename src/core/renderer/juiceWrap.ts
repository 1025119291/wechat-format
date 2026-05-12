export interface ExportReport {
  sectionCount: number;
  hasBase64: boolean;
  hasLarkPrivate: boolean;
  classCount: number;
  imageCount: number;
  tableCount: number;
  codeBlockCount: number;
  warnings: string[];
}

/**
 * 生成导出自检报告
 */
export function generateExportReport(html: string): ExportReport {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  const sectionCount = body.querySelectorAll('section').length;
  const imageCount = body.querySelectorAll('img').length;
  const tableCount = body.querySelectorAll('table').length;
  const codeBlockCount = body.querySelectorAll('pre').length;

  let classCount = 0;
  body.querySelectorAll('[class]').forEach(() => classCount++);

  const hasBase64 = /src=["']data:image\//.test(html);
  const hasLarkPrivate = /internal:\/\/|lark-doc|bytedance\.com\/api\/oss/.test(html);

  const warnings: string[] = [];
  if (classCount > 0) warnings.push(`发现 ${classCount} 个 class 属性（公众号会剔除，应为 0）`);
  if (hasBase64) warnings.push('存在 base64 图片，粘贴后可能无法显示');
  if (hasLarkPrivate) warnings.push('存在飞书私有链接，仅登录可见');

  return { sectionCount, hasBase64, hasLarkPrivate, classCount, imageCount, tableCount, codeBlockCount, warnings };
}

/**
 * 为 <img> 追加 data-width="100%" 属性（公众号编辑器识别）
 */
export function addImgDataWidth(html: string): string {
  return html.replace(/<img\s/g, '<img data-width="100%" ');
}

/**
 * 移除所有 class 属性（兜底清理）
 */
export function stripClasses(html: string): string {
  return html.replace(/\s+class="[^"]*"/g, '');
}

/**
 * 移除 <style> 标签（兜底清理）
 */
export function stripStyleTags(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '');
}

/**
 * 导出前完整清理管线
 */
export function cleanForExport(html: string): string {
  let out = stripStyleTags(html);
  out = stripClasses(out);
  out = addImgDataWidth(out);
  return out;
}
