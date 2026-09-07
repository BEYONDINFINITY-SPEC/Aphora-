import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSessionProgress, type SessionProgress } from '../lib/progress';
import { getNamingProgress, type NamingProgress } from '../lib/namingAttempts';
import { ERROR_TAG_LABELS } from '../constants/errorTags';
import ErrorTagBarChart from '../components/ErrorTagBarChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';

const MIN_ATTEMPTS_FOR_CHART = 3;

interface ProgressScreenProps {
  sessionId: string;
}

export default function ProgressScreen({ sessionId }: ProgressScreenProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [namingProgress, setNamingProgress] = useState<NamingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getSessionProgress(sessionId), getNamingProgress(sessionId)])
      .then(([reconstructionResult, namingResult]) => {
        if (!cancelled) {
          setProgress(reconstructionResult);
          setNamingProgress(namingResult);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Progress</Text>

      {loading && (
        <View style={styles.loadingRow}>
          <LoadingSpinner label="Loading…" />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && progress && progress.totalAttempts < MIN_ATTEMPTS_FOR_CHART && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyStateText}>Keep practicing to see your progress trends.</Text>
        </View>
      )}

      {!loading && !error && progress && progress.totalAttempts >= MIN_ATTEMPTS_FOR_CHART && (
        <View style={styles.card}>
          <ErrorTagBarChart counts={progress.counts} />

          <Text style={styles.summaryLine}>
            {progress.totalAttempts} attempt{progress.totalAttempts === 1 ? '' : 's'} logged this
            session
          </Text>
          {progress.mostCommonTag && (
            <Text style={styles.summaryLine}>
              Most common error type: {ERROR_TAG_LABELS[progress.mostCommonTag]}
            </Text>
          )}
        </View>
      )}

      {!loading && !error && (
        <>
          <Text style={styles.sectionHeader}>Naming Practice</Text>

          {namingProgress && namingProgress.totalCount === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyStateText}>
                Try some naming practice to see results here.
              </Text>
            </View>
          )}

          {namingProgress && namingProgress.totalCount > 0 && (
            <View style={styles.card}>
              <Text style={styles.summaryLine}>
                {namingProgress.correctCount}/{namingProgress.totalCount} correct this session
              </Text>
              {namingProgress.mostMissed.length > 0 && (
                <Text style={styles.summaryLine}>
                  Missed most: {namingProgress.mostMissed.join(', ')}
                </Text>
              )}
            </View>
          )}
        </>
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
  title: {
    fontSize: 28,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  loadingRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  error: {
    color: colors.dustyRoseText,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    ...cardShadow,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...cardShadow,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryLine: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
    marginTop: spacing.md,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: fonts.headingSemiBold,
    color: colors.text,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
