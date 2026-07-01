import en from './en.json';
import ar from './ar.json';
import type { UiLanguage } from '@/types/progress';

export type TranslationKey = keyof typeof en;

const dictionaries = {
  en,
  ar,
};

export const translate = (key: TranslationKey, language: UiLanguage = 'bilingual'): string => {
  if (language === 'ar') {
    return dictionaries.ar[key] ?? dictionaries.en[key] ?? key;
  }

  if (language === 'bilingual') {
    const english = dictionaries.en[key] ?? key;
    const arabic = dictionaries.ar[key];
    return arabic ? `${english}\n${arabic}` : english;
  }

  return dictionaries.en[key] ?? key;
};

export const translateEnglish = (key: TranslationKey): string => dictionaries.en[key] ?? key;
