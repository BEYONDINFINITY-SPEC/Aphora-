import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NAMING_ITEMS, type NamingItem } from '../constants/namingItems';
import { logNamingAttempt } from '../lib/namingAttempts';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';

const FEEDBACK_DELAY_MS = 900;

interface NamingPracticeScreenProps {
  sessionId: string;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickRandomItem(excludeWord?: string): NamingItem {
  const pool = excludeWord
    ? NAMING_ITEMS.filter((item) => item.word !== excludeWord)
    : NAMING_ITEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildOptions(item: NamingItem): string[] {
  return shuffle([item.word, ...item.wrongOptions]);
}

export default function NamingPracticeScreen({ sessionId }: NamingPracticeScreenProps) {
  const [currentItem, setCurrentItem] = useState<NamingItem>(() => pickRandomItem());
  const [options, setOptions] = useState<string[]>(() => buildOptions(currentItem));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isCorrectAnswer = selectedAnswer === currentItem.word;

  const handleSelect = (option: string) => {
    if (selectedAnswer) return; // already answered this item - ignore further taps

    const isCorrect = option === currentItem.word;
    setSelectedAnswer(option);
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    logNamingAttempt({
      sessionId,
      itemShown: currentItem.word,
      selectedAnswer: option,
      wasCorrect: isCorrect,
    }).catch((err) => {
      console.error('[NamingPracticeScreen] failed to log naming attempt:', err);
    });

    // Delay showing Next so the user has a moment to see the feedback
    // before they can advance - not an auto-advance.
    setTimeout(() => setShowNextButton(true), FEEDBACK_DELAY_MS);
  };

  const handleNext = () => {
    const nextItem = pickRandomItem(currentItem.word);
    setCurrentItem(nextItem);
    setOptions(buildOptions(nextItem));
    setSelectedAnswer(null);
    setShowNextButton(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Naming Practice</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.score}>
            {score.correct}/{score.total} correct
          </Text>
        </View>
      </View>

      <View style={styles.imageCard}>
        <Image source={{ uri: currentItem.imageUrl }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.optionsColumn}>
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isTheCorrectAnswer = option === currentItem.word;
          const showAsCorrect = selectedAnswer !== null && isTheCorrectAnswer;
          const showAsIncorrect = isSelected && !isCorrectAnswer;

          return (
            <Pressable
              key={option}
              onPress={() => handleSelect(option)}
              disabled={selectedAnswer !== null}
              style={[
                styles.optionButton,
                showAsCorrect && styles.optionCorrect,
                showAsIncorrect && styles.optionIncorrect,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  (showAsCorrect || showAsIncorrect) && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedAnswer && (
        <Text
          style={[
            styles.feedback,
            isCorrectAnswer ? styles.feedbackCorrect : styles.feedbackIncorrect,
          ]}
        >
          {isCorrectAnswer ? 'Correct!' : `Not quite — the answer was "${currentItem.word}"`}
        </Text>
      )}

      {showNextButton && (
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
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
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.headingBold,
    color: colors.text,
  },
  scoreBadge: {
    backgroundColor: colors.lavender,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  score: {
    fontSize: 14,
    fontFamily: fonts.headingSemiBold,
    color: colors.white,
  },
  imageCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...cardShadow,
  },
  image: {
    width: 140,
    height: 140,
  },
  optionsColumn: {
    alignSelf: 'stretch',
    gap: spacing.sm + 4,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lavender,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...cardShadow,
  },
  optionCorrect: {
    backgroundColor: colors.sage,
    borderColor: colors.sageText,
  },
  optionIncorrect: {
    backgroundColor: colors.dustyRose,
    borderColor: colors.dustyRoseText,
  },
  optionText: {
    fontSize: 17,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: colors.text,
  },
  feedback: {
    marginTop: spacing.lg,
    fontSize: 16,
    fontFamily: fonts.headingSemiBold,
    textAlign: 'center',
  },
  feedbackCorrect: {
    color: colors.sageText,
  },
  feedbackIncorrect: {
    color: colors.dustyRoseText,
  },
  nextButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.plum,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    ...cardShadow,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.headingSemiBold,
  },
});
