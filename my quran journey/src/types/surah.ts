export type VerificationStatus = 'placeholder' | 'needs_review' | 'verified';

export interface ContentVerification {
  status: VerificationStatus;
  sourceName: string;
  sourceUrl?: string;
  sourceReference?: string;
  verifiedBy: string;
  verifiedDate: string;
}

export interface VerifiedSource {
  sourceName: string;
  sourceUrl?: string;
  sourceReference?: string;
}

export interface AyahContent {
  ayahNumber: number;
  arabicText: string;
  translation: string;
  transliteration: string;
  audioKey?: string;
  audioUrl?: string;
  verifiedSource: VerifiedSource;
  reviewStatus: VerificationStatus;
}

export interface SurahContent {
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahs: AyahContent[];
  verification: ContentVerification;
}
