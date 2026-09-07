import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import {
  reconstructSentence,
  ReconstructionError,
  type ReconstructionErrorKind,
  type ReconstructionOption,
} from '../lib/claude';
import { SCENARIOS, DEFAULT_SCENARIO, type Scenario } from '../constants/scenarios';
import {
  RELATIONSHIPS,
  DEFAULT_RELATIONSHIP,
  type Relationship,
} from '../constants/relationships';
import { logReconstruction } from '../lib/logs';
import { getPersonalizationContext } from '../lib/personalization';
import { ERROR_TAG_LABELS, ERROR_TAG_COLORS } from '../constants/errorTags';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import LoadingSpinner from '../components/LoadingSpinner';

const RECONSTRUCTION_ERROR_MESSAGES: Record<ReconstructionErrorKind, string> = {
  quota: 'Out of AI requests for today — try again later',
  network: "Can't connect right now — check your internet",
  other: 'Something went wrong — try again',
};

const CONFIDENCE_RANK: Record<ReconstructionOption['confidence'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};


const FADE_IN_DURATION_MS = 400;

interface SentenceReconstructionScreenProps {
  sessionId: string;
}

export default function SentenceReconstructionScreen({
  sessionId,
}: SentenceReconstructionScreenProps) {
  const [input, setInput] = useState('');
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [relationship, setRelationship] = useState<Relationship>(DEFAULT_RELATIONSHIP);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ReconstructionOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submittedInput, setSubmittedInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOptions([]);
    setSelectedIndex(null);
    setSubmittedInput(trimmed);

    try {
      // A failure here shouldn't block reconstruction entirely - fall back
      // to no personalization rather than failing the whole request over a
      // Supabase hiccup.
      let aphasiaType: string | null = null;
      let recentErrorTags: ReconstructionOption['error_tag'][] = [];
      try {
        const context = await getPersonalizationContext(sessionId);
        aphasiaType = context.aphasiaType;
        recentErrorTags = context.recentErrorTags;
      } catch (err) {
        console.error(
          '[SentenceReconstructionScreen] failed to load personalization context:',
          err
        );
      }

      const result = await reconstructSentence(
        trimmed,
        scenario,
        relationship,
        aphasiaType,
        recentErrorTags
      );
      // Defensive: sort by confidence even though the prompt already asks
      // for most-likely-first, in case the model doesn't order them.
      const sorted = [...result.reconstructions].sort(
        (a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence]
      );
      setOptions(sorted);
      resultsOpacity.setValue(0);
      Animated.timing(resultsOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      // Full technical detail goes to the console for debugging; only a
      // short, plain message is ever shown on screen.
      console.error('[SentenceReconstructionScreen] reconstruction failed:', err);
      const kind = err instanceof ReconstructionError ? err.kind : 'other';
      setError(RECONSTRUCTION_ERROR_MESSAGES[kind]);
    } finally {
      setLoading(false);
    }
  };

  // Tapping a card (or its speaker icon) selects it as "the" reconstruction:
  // plays it aloud and logs it. Tapping the same already-selected option
  // again just replays the audio without logging a duplicate row; tapping a
  // different option selects and logs that one too, so exploring
  // alternatives before settling is still possible.
  const handleSelectOption = async (option: ReconstructionOption, index: number) => {
    const isReplay = selectedIndex === index;
    setSelectedIndex(index);

    // Imported lazily rather than statically at the top of the file so a
    // missing/misbehaving native speech module can only fail this one
    // action, not crash the whole screen on load.
    try {
      const Speech = await import('expo-speech');
      Speech.speak(option.sentence);
    } catch (err) {
      console.error('[SentenceReconstructionScreen] speech playback failed:', err);
      setError('Text-to-speech is unavailable on this device right now.');
    }

    if (!isReplay) {
      logReconstruction({
        originalInput: submittedInput,
        reconstructedSentence: option.sentence,
        errorTag: option.error_tag,
        scenario,
        relationship,
        sessionId,
      }).catch((err) => {
        console.error('[SentenceReconstructionScreen] failed to log reconstruction:', err);
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Aphora</Text>
        <Text style={styles.subtitle}>Type a sentence you're trying to say</Text>
      </View>

      <Text style={styles.sectionLabel}>Context</Text>
      <View style={styles.chipRow}>
        {SCENARIOS.map((s) => (
          <Chip key={s} label={s} selected={scenario === s} onPress={() => setScenario(s)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Speaking to</Text>
      <View style={styles.chipRow}>
        {RELATIONSHIPS.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={relationship === r}
            onPress={() => setRelationship(r)}
          />
        ))}
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Type what you'd like to say..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!loading}
        />
      </View>

      <View style={styles.buttonSpacing}>
        <PrimaryButton
          label="Reconstruct"
          onPress={handleSubmit}
          disabled={!input.trim()}
          loading={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <LoadingSpinner label="Reconstructing…" />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {options.length > 0 && (
        <Animated.View style={[styles.optionsContainer, { opacity: resultsOpacity }]}>
          <Text style={styles.sectionLabel}>
            {options.length > 1 ? 'Choose the closest match' : 'Reconstruction'}
          </Text>
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const tagColor = ERROR_TAG_COLORS[option.error_tag];
            return (
              <Pressable
                key={index}
                onPress={() => handleSelectOption(option, index)}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              >
                <Text style={[styles.tag, { backgroundColor: tagColor.bg, color: tagColor.text }]}>
                  {ERROR_TAG_LABELS[option.error_tag]}
                </Text>
                <Text style={styles.reconstructed}>{option.sentence}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.confidence}>
                    {isSelected ? 'Playing — tap to replay' : `Confidence: ${option.confidence}`}
                  </Text>
                  <Pressable
                    onPress={() => handleSelectOption(option, index)}
                    style={styles.playIconButton}
                    hitSlop={8}
                  >
                    <Volume2 color={colors.white} size={18} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.headingSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lavender,
    borderRadius: radii.md,
    ...cardShadow,
  },
  input: {
    minHeight: 96,
    padding: spacing.md,
    fontSize: 17,
    fontFamily: fonts.body,
    color: colors.text,
    textAlignVertical: 'top',
  },
  buttonSpacing: {
    marginTop: spacing.md,
  },
  loadingRow: {
    marginTop: spacing.lg,
  },
  error: {
    color: colors.dustyRoseText,
    fontFamily: fonts.body,
    marginTop: spacing.lg,
    fontSize: 15,
  },
  optionsContainer: {
    marginTop: spacing.xl,
  },
  optionCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...cardShadow,
  },
  optionCardSelected: {
    borderColor: colors.plum,
    borderWidth: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: fonts.headingSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginBottom: spacing.sm + 2,
  },
  reconstructed: {
    fontSize: 20,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    lineHeight: 28,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  confidence: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    flexShrink: 1,
  },
  playIconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
