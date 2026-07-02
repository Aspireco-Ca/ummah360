import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@/theme/theme';

interface SectionPanelProps {
  title?: string;
  caption?: string;
  children: ReactNode;
  tone?: 'plain' | 'warm' | 'cool' | 'ink';
  trailing?: ReactNode;
}

export const SectionPanel = ({
  title,
  caption,
  children,
  tone = 'plain',
  trailing,
}: SectionPanelProps) => (
  <View style={[styles.panel, toneStyles[tone]]}>
    {title || caption || trailing ? (
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          {title ? <Text style={[styles.title, tone === 'ink' && styles.inkText]}>{title}</Text> : null}
          {caption ? (
            <Text style={[styles.caption, tone === 'ink' && styles.inkCaption]}>{caption}</Text>
          ) : null}
        </View>
        {trailing}
      </View>
    ) : null}
    {children}
  </View>
);

const toneStyles = {
  plain: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  warm: {
    backgroundColor: colors.surfaceSoft,
    borderColor: '#E9D5A6',
  },
  cool: {
    backgroundColor: colors.surfaceCool,
    borderColor: '#C5E2DA',
  },
  ink: {
    backgroundColor: colors.inkPanel,
    borderColor: colors.inkPanel,
  },
};

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.primaryDark,
  },
  caption: {
    ...typography.caption,
    color: colors.muted,
  },
  inkText: {
    color: colors.white,
  },
  inkCaption: {
    color: '#CDE2D9',
  },
});
