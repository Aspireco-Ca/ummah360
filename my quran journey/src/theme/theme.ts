export const colors = {
  background: '#F6F0E6',
  backgroundTop: '#E7F3EF',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF7E7',
  surfaceCool: '#EAF6F2',
  inkPanel: '#173F3A',
  primary: '#147164',
  primaryDark: '#123D37',
  secondary: '#D79B2B',
  accent: '#A64C67',
  coral: '#D97956',
  mint: '#BFE6D3',
  sky: '#D8EEF4',
  lavender: '#E8E0F6',
  text: '#1E2B28',
  muted: '#63716C',
  border: '#DED3C0',
  borderStrong: '#CBBCA4',
  danger: '#A83F46',
  success: '#2F7450',
  placeholder: '#857864',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#123D37',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
};

export const typography = {
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900' as const,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700' as const,
  },
};
