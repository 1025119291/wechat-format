import type { Theme } from './types';
import { minimalTheme } from './minimal';
import { techTheme } from './tech';
import { marketingTheme } from './marketing';
import { businessTheme } from './business';
import { magazineTheme } from './magazine';
import { literaryTheme } from './literary';
import { trendyTheme } from './trendy';
import { cyberTheme } from './cyber';

export const themes: Record<string, Theme> = {
  minimal: minimalTheme,
  tech: techTheme,
  marketing: marketingTheme,
  business: businessTheme,
  magazine: magazineTheme,
  literary: literaryTheme,
  trendy: trendyTheme,
  cyber: cyberTheme,
};

export const themeList: Theme[] = [
  minimalTheme,
  techTheme,
  cyberTheme,
  marketingTheme,
  businessTheme,
  magazineTheme,
  literaryTheme,
  trendyTheme,
];

export type { Theme, ThemeStyles, ThemeDecorations } from './types';
export { mergeStyle } from './types';
