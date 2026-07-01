import { I18nManager } from 'react-native';
import type { UiLanguage } from '@/types/progress';

export const isArabicMode = (language: UiLanguage): boolean => language === 'ar';

export const shouldUseRtl = (language: UiLanguage): boolean =>
  language === 'ar' || (language === 'bilingual' && I18nManager.isRTL);

export const arabicTextStyle = {
  writingDirection: 'rtl' as const,
  textAlign: 'right' as const,
};
