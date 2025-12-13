// Beauty Track - Theme Constants
// Elegant Purple & Blush Palette

export const COLORS = {
  // Primary palette
  primary: "#7B6EF6", // Primary Purple
  secondary: "#F6C1D1", // Blush Pink
  accent: "#E7CBA9", // Champagne Gold (accent only)
  softLavender: "#EDE9FF", // Soft Lavender

  // Text colors
  darkText: "#3A2E5C", // Dark Plum
  lightText: "#9A93B8", // Muted Gray (for secondary text)
  mutedText: "#9A93B8", // Muted Gray (icons / inactive)

  // Background colors
  background: "#FBFAFF", // Warm White
  backgroundGradientStart: "#EDE9FF", // Soft Lavender
  backgroundGradientEnd: "#FBFAFF", // Warm White
  timelineBackground: "#EDE9FF",
  cardBackground: "#FFFFFF", // White or very lightly tinted lavender
  modalBackground: "rgba(58, 46, 92, 0.5)", // Dark Plum with opacity

  // Gradient colors
  gradientStart: "#7B6EF6", // Primary Purple
  gradientEnd: "#F6C1D1", // Blush Pink

  // UI colors
  border: "#EDE9FF", // Soft Lavender for borders
  divider: "#EDE9FF", // Soft Lavender for dividers
  inputBackground: "#FBFAFF", // Warm White

  // Status colors (keeping warm tones)
  success: "#7CB992",
  warning: "#E7CBA9", // Champagne Gold
  error: "#F6C1D1", // Soft error using Blush Pink
  info: "#7B6EF6", // Primary Purple

  // Category colors (updated to match new palette)
  face: "#7B6EF6", // Primary Purple
  skin: "#F6C1D1", // Blush Pink
  body: "#EDE9FF", // Soft Lavender
  hair: "#E7CBA9", // Champagne Gold
  makeup: "#F6C1D1", // Blush Pink
  brows: "#9A93B8", // Muted Gray
  lashes: "#7B6EF6", // Primary Purple
  nails: "#F6C1D1", // Blush Pink
  tan: "#E7CBA9", // Champagne Gold

  // Dark mode colors (for future use)
  dark: {
    background: "#2A1F3D",
    cardBackground: "#3A2E5C",
    text: "#FBFAFF",
    mutedText: "#9A93B8",
  },
};

export const FONTS = {
  regular: "System",
  medium: "System",
  semiBold: "System",
  bold: "System",
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius (larger for elegant feel)
  radiusSm: 12,
  radiusMd: 16,
  radiusLg: 20,
  radiusXl: 24,
  radiusFull: 9999,

  // Typography
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 22,
  fontXxl: 28,
  fontDisplay: 34,

  // Icons
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,

  // Screen dimensions
  tabBarHeight: 80,
  headerHeight: 100,
};

export const SHADOWS = {
  small: {
    shadowColor: "#3A2E5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#3A2E5C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: "#3A2E5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const GRADIENTS = {
  // CTA buttons: linear-gradient(135deg, #7B6EF6 → #F6C1D1)
  primary: [COLORS.primary, COLORS.secondary] as const, // Purple to Blush Pink
  // Header backgrounds: radial-gradient from Soft Lavender to Warm White
  header: [COLORS.softLavender, COLORS.background] as const,
  // Cards: very subtle vertical gradient (white → very light lavender)
  card: ["#FFFFFF", "rgba(237, 233, 255, 0.3)"] as const,
  // Background gradient
  background: [
    COLORS.backgroundGradientStart,
    COLORS.backgroundGradientEnd,
  ] as const,
  // Soft accent gradient
  soft: [COLORS.softLavender, COLORS.background] as const,
};

export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  GRADIENTS,
};
