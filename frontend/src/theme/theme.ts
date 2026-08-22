export const theme = {
  colors: {
    background: '#070a13', // Deep obsidian/navy background
    surface: '#111827', // Dark navy/slate card surface
    surfaceLight: '#1f2937', // Slightly lighter slate for input backgrounds / inner elements
    primary: '#2563eb', // Tech blue accent
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    text: '#f9fafb', // Off-white main text
    textSecondary: '#9ca3af', // Cool grey secondary text
    textMuted: '#6b7280', // Muted grey
    border: '#1f2937', // Dark border matching surface
    borderLight: '#374151', // Lighter border for highlights
    success: '#10b981', // Green for healthy / low risk
    warning: '#f59e0b', // Amber for warning / medium risk
    danger: '#ef4444', // Red for critical / high risk
    successBg: 'rgba(16, 185, 129, 0.1)',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    dangerBg: 'rgba(239, 68, 68, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 26,
      heading: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};
