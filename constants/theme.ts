// Shared design tokens - every screen should pull colors/spacing/fonts from
// here rather than hardcoding values, so the app reads as one designed
// product instead of screens styled independently over time.

export const colors = {
  background: '#FFF8F0', // soft cream
  surface: '#FFFFFF', // cards/inputs - lifted off the cream background via shadow
  border: '#EAE0F5', // faint lavender-tinted border

  text: '#3D3450', // dark charcoal-plum, not pure black
  textMuted: '#8A7FA0',

  lavender: '#B8A9D9', // primary accent
  plum: '#8B7AB8', // deeper plum - primary buttons, selected states
  plumDark: '#6D5C99', // pressed state / shadow tint

  sage: '#D7E8D2', // success background
  sageText: '#4F7A4F',

  dustyRose: '#F5D9DC', // error/incorrect background
  dustyRoseText: '#A85A63',

  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

// React Native shadows need both the iOS shadow* props and Android's
// elevation - shadowColor/Offset/Opacity/Radius are ignored on Android.
export const cardShadow = {
  shadowColor: '#6D5C99',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;

// Poppins for headers/UI-emphasis (wordmark, section labels, button/chip
// text), Inter for body/paragraph text (taglines, descriptions, results,
// hints). Playfair Display italic is reserved for the onboarding tagline
// only - a deliberately distinct accent font, not used anywhere else. All
// loaded via useFonts in App.tsx - fontFamily silently falls back to system
// default until loaded.
export const fonts = {
  headingBold: 'Poppins_700Bold',
  headingSemiBold: 'Poppins_600SemiBold',
  headingMedium: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  taglineItalic: 'PlayfairDisplay_500Medium_Italic',
} as const;
