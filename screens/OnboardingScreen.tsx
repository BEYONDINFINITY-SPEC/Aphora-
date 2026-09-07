import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { APHASIA_TYPES, type AphasiaType } from '../constants/aphasiaTypes';
import { LANGUAGES, DEFAULT_LANGUAGE, type Language } from '../constants/languages';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';
import { createSession } from '../lib/sessions';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import AphoraLogo from '../components/AphoraLogo';

// This exact header (logo + wordmark + tagline) is deliberately specific to
// onboarding - a one-time brand moment, not repeated on every screen. The
// title/tagline colors below are the exact values requested for this header
// specifically, not the shared theme.colors.text/lavender tokens, since they
// differ slightly (#3D2C4A vs theme's #3D3450) and are only used here.
const HEADER_TITLE_COLOR = '#3D2C4A';
const HEADER_TAGLINE_COLOR = '#B8A9D9';

interface OnboardingScreenProps {
  onComplete: (sessionId: string) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [aphasiaType, setAphasiaType] = useState<AphasiaType | null>(null);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!aphasiaType) return;

    setLoading(true);
    setError(null);

    try {
      const sessionId = await createSession({ aphasiaType, language });
      onComplete(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoBlock}>
        <AphoraLogo size={100} />
        <Text style={styles.wordmark}>Aphora</Text>
        <Text style={styles.tagline}>Words, reconnected</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIntro}>A couple of quick questions before you start</Text>

        <Text style={styles.label}>Aphasia type</Text>
        <View style={styles.row}>
          {APHASIA_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              selected={aphasiaType === type}
              onPress={() => setAphasiaType(type)}
            />
          ))}
        </View>

        <Text style={styles.label}>Language</Text>
        <View style={styles.row}>
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              selected={language === lang}
              onPress={() => setLanguage(lang)}
            />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label="Continue"
            onPress={handleSubmit}
            disabled={!aphasiaType}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    alignItems: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  wordmark: {
    fontSize: 32,
    fontFamily: fonts.headingBold,
    color: HEADER_TITLE_COLOR,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: 17,
    fontFamily: fonts.taglineItalic,
    color: HEADER_TAGLINE_COLOR,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...cardShadow,
  },
  cardIntro: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.headingSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  buttonSpacing: {
    marginTop: spacing.xs,
  },
  error: {
    color: colors.dustyRoseText,
    fontFamily: fonts.body,
    marginBottom: spacing.md,
    fontSize: 15,
  },
});
