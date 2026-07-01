import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/theme';
import { getVerificationLabel } from '@/services/contentVerificationService';
import type { ContentVerification } from '@/types/surah';

export const VerificationBadge = ({ verification }: { verification: ContentVerification }) => {
  const label = getVerificationLabel(verification);
  const tone =
    verification.status === 'verified'
      ? styles.verified
      : verification.status === 'needs_review'
        ? styles.needsReview
        : styles.placeholder;

  return (
    <View style={[styles.badge, tone]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  verified: {
    backgroundColor: colors.success,
  },
  needsReview: {
    backgroundColor: colors.secondary,
  },
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
