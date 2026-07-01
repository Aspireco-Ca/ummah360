import type { AyahContent, ContentVerification, SurahContent } from '@/types/surah';

export const isVerified = (verification: ContentVerification): boolean =>
  verification.status === 'verified' &&
  verification.sourceName.trim().length > 0 &&
  verification.verifiedBy.trim().length > 0 &&
  verification.verifiedDate.trim().length > 0;

export const isAyahVerified = (ayah: AyahContent): boolean =>
  ayah.reviewStatus === 'verified' &&
  ayah.arabicText.trim().length > 0 &&
  ayah.verifiedSource.sourceName.trim().length > 0;

export const canDisplayAyahAsFinal = (ayah: AyahContent): boolean => isAyahVerified(ayah);

export const canPublishQuranContent = (surah: SurahContent): boolean =>
  isVerified(surah.verification) && surah.ayahs.length > 0 && surah.ayahs.every(isAyahVerified);

export const getVerificationLabel = (verification: ContentVerification): string => {
  if (verification.status === 'verified') {
    return 'Verified';
  }

  if (verification.status === 'needs_review') {
    return 'Needs review';
  }

  return 'Placeholder';
};

export const getQuranSafetyMessage = (surah: SurahContent): string => {
  if (canPublishQuranContent(surah)) {
    return 'Verified Quran content is available for this surah.';
  }

  return 'Quran text is not loaded here yet. Add verified Mushaf data and certified recitation before production use.';
};
