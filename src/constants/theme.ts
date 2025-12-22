// Beauty Track - Theme Constants
// Hybrid Lavender & Honey Gold Palette
// Premium, warm, emotionally safe design

export const COLORS = {
  // Primary palette
  primary: "#7B6EF6", // Primary Lavender (brand, navigation, active states)
  honeyGold: "#F2B705", // Honey Gold (CTA buttons, highlights, emotional moments)
  softAmber: "#FFD27D", // Soft Amber (secondary accent)
  lightPeach: "#FFEEE1", // Light Peach (warm surface, sections)
  softLavender: "#EDE9FF", // Soft Lavender (background tint)

  // Text colors
  darkText: "#3A2E5C", // Dark Plum (primary text)
  warmCocoa: "#3F3A52", // Warm Cocoa (secondary text)
  lightText: "#9A93B8", // Muted Gray (secondary text, for backward compatibility)
  mutedText: "#9A93B8", // Muted Gray (icons, inactive)

  // Onboarding specific colors
  onboardingHeading: "#1A0F2E", // Dark purple / near-black for strong contrast
  onboardingBody: "#5A4D6B", // Dark gray / muted deep purple for body text

  // Background colors
  background: "#FBFAFF", // Warm White (main background)
  backgroundGradientStart: "#D4C8FF", // Brighter, less saturated purple
  backgroundGradientEnd: "#FBFAFF", // Warm White (fades to less saturated)
  timelineBackground: "#EDE9FF",
  cardBackground: "#FFFFFF", // White or lightly tinted lavender/peach
  modalBackground: "rgba(58, 46, 92, 0.5)", // Dark Plum with opacity

  // UI colors
  border: "#EDE9FF", // Soft Lavender for borders
  divider: "#EDE9FF", // Soft Lavender for dividers
  inputBackground: "#FBFAFF", // Warm White

  // Status colors (warm, approachable)
  success: "#7CB992", // Soft green for success
  warning: "#FFD27D", // Soft Amber for warnings
  error: "#F6A5A5", // Soft warm red (not harsh)
  info: "#7B6EF6", // Primary Lavender

  // Category colors (using hybrid palette)
  face: "#7B6EF6", // Primary Lavender
  skin: "#FFD27D", // Soft Amber
  body: "#B8A8F0", // Medium Lavender (more visible)
  hair: "#F2B705", // Honey Gold
  makeup: "#FFC896", // Warm Peach (more visible)
  brows: "#9A93B8", // Muted Gray
  lashes: "#7B6EF6", // Primary Lavender
  nails: "#FFD27D", // Soft Amber
  tan: "#F2B705", // Honey Gold

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
  // Primary CTA: linear-gradient(135deg, #7B6EF6 → #F2B705)
  primary: [COLORS.primary, COLORS.honeyGold] as const, // Lavender to Honey Gold
  // Secondary CTA: linear-gradient(135deg, #FFD27D → #FFEEE1)
  secondary: [COLORS.softAmber, COLORS.lightPeach] as const, // Soft Amber to Light Peach
  // Header backgrounds: radial-gradient from Soft Lavender to Warm White
  header: [COLORS.softLavender, COLORS.background] as const,
  // Cards: very subtle vertical gradient (white → very light lavender or peach tint)
  card: ["#FFFFFF", "rgba(237, 233, 255, 0.3)"] as const,
  cardPeach: ["#FFFFFF", "rgba(255, 238, 225, 0.2)"] as const, // White to light peach
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
