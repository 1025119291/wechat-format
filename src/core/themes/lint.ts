import type { Theme } from './types';

export interface LintResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const BLACKLISTED_PROPS = [
  'position:',
  'transform:',
  '@import',
  '@media',
  '@font-face',
  '@keyframes',
  '::before',
  '::after',
];

const BLACKLISTED_TAGS = [
  '<script',
  '<iframe',
  '<link',
];

/**
 * 检查模板是否满足公众号兼容性要求
 */
export function lintTheme(theme: Theme): LintResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allStyles = Object.entries(theme.styles) as Array<[string, string | undefined]>;

  for (const [key, style] of allStyles) {
    if (!style) continue;
    for (const prop of BLACKLISTED_PROPS) {
      if (style.includes(prop)) {
        errors.push(`styles.${key} 包含不支持的属性: ${prop}`);
      }
    }
    if (style.includes('class=') || /class\s*:/.test(style)) {
      warnings.push(`styles.${key} 可能包含 class 引用（公众号会剔除）`);
    }
  }

  if (theme.decorations) {
    const decoEntries = Object.entries(theme.decorations) as Array<[string, string | undefined]>;
    for (const [key, html] of decoEntries) {
      if (!html) continue;
      for (const tag of BLACKLISTED_TAGS) {
        if (html.toLowerCase().includes(tag)) {
          errors.push(`decorations.${key} 包含不支持的标签: ${tag}`);
        }
      }
      for (const prop of BLACKLISTED_PROPS) {
        if (html.includes(prop)) {
          errors.push(`decorations.${key} 包含不支持的属性: ${prop}`);
        }
      }
    }
  }

  if (!theme.styles.section) {
    warnings.push('缺少 section 样式（根容器）');
  }
  if (!theme.styles.p) {
    warnings.push('缺少 p 样式（段落）');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
