import type { SurahContent } from '@/types/surah';

const placeholderVerification = {
  status: 'placeholder' as const,
  sourceName: '',
  sourceReference:
    'TODO: Insert verified Mushaf/Quran source metadata and certified recitation review before adding ayah text.',
  verifiedBy: '',
  verifiedDate: '',
};

export const placeholderSurahs: SurahContent[] = [
  {
    surahNumber: 1,
    surahNameArabic: 'الفاتحة',
    surahNameEnglish: 'Al-Fatihah',
    ayahs: [],
    verification: placeholderVerification,
  },
  {
    surahNumber: 112,
    surahNameArabic: 'الإخلاص',
    surahNameEnglish: 'Al-Ikhlas',
    ayahs: [],
    verification: placeholderVerification,
  },
  {
    surahNumber: 113,
    surahNameArabic: 'الفلق',
    surahNameEnglish: 'Al-Falaq',
    ayahs: [],
    verification: placeholderVerification,
  },
  {
    surahNumber: 114,
    surahNameArabic: 'الناس',
    surahNameEnglish: 'An-Nas',
    ayahs: [],
    verification: placeholderVerification,
  },
];

export const getSurahByNumber = (surahNumber: number): SurahContent | undefined =>
  placeholderSurahs.find((surah) => surah.surahNumber === surahNumber);
