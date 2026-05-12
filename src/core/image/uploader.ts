export type ImageStatus = 'external' | 'base64' | 'lark-private' | 'unknown';

export interface ImageInfo {
  src: string;
  status: ImageStatus;
  element?: HTMLImageElement;
}

/**
 * 扫描 HTML 中的所有图片，返回状态信息
 */
export function scanImages(html: string): ImageInfo[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images: ImageInfo[] = [];

  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    images.push({
      src,
      status: classifyImage(src),
    });
  });

  return images;
}

function classifyImage(src: string): ImageStatus {
  if (src.startsWith('data:image/')) return 'base64';
  if (/internal:\/\/|lark-doc|bytedance\.com\/api\/oss/.test(src)) return 'lark-private';
  if (src.startsWith('http://') || src.startsWith('https://')) return 'external';
  return 'unknown';
}

/**
 * 生成图片状态摘要（用于 UI 提示）
 */
export function getImageSummary(images: ImageInfo[]): {
  total: number;
  external: number;
  base64: number;
  larkPrivate: number;
  warnings: string[];
} {
  const external = images.filter((i) => i.status === 'external').length;
  const base64 = images.filter((i) => i.status === 'base64').length;
  const larkPrivate = images.filter((i) => i.status === 'lark-private').length;

  const warnings: string[] = [];
  if (base64 > 0) warnings.push(`${base64} 张 base64 图片，建议上传到公众号素材后替换链接`);
  if (larkPrivate > 0) warnings.push(`${larkPrivate} 张飞书私有链接，仅登录可见，需替换`);

  return { total: images.length, external, base64, larkPrivate, warnings };
}

/**
 * 将 base64 图片转为 Blob（用于后续上传）
 */
export function base64ToBlob(base64: string): Blob | null {
  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * 上传图片到自建代理（需后端配置）
 * 当前为预留接口，未配置后端时返回 null
 */
export async function uploadImageViaProxy(
  _blob: Blob,
  _proxyUrl = '/api/upload',
): Promise<string | null> {
  // 预留：实际需配置后端代理
  // const formData = new FormData();
  // formData.append('image', blob);
  // const res = await fetch(proxyUrl, { method: 'POST', body: formData });
  // const data = await res.json();
  // return data.url; // mmbiz.qpic.cn URL
  return null;
}
