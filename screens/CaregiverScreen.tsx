import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSessionProgress, type SessionProgress } from '../lib/progress';
import { getRecentLogs, type RecentLog } from '../lib/logs';
import { ERROR_TAG_LABELS, ERROR_TAG_COLORS } from '../constants/errorTags';
import ErrorTagBarChart from '../components/ErrorTagBarChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';

const MIN_ATTEMPTS_FOR_CHART = 3;
const RECENT_LOGS_LIMIT = 10;

interface CaregiverScreenProps {
  sessionId: string;
}

// Read-only: no text input, no editing, nothing that mutates data - just a
// summary view a family member/caregiver can look at.
export default function CaregiverScreen({ sessionId }: CaregiverScreenProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getSessionProgress(sessionId), getRecentLogs(sessionId, RECENT_LOGS_LIMIT)])
      .then(([progressResult, logsResult]) => {
        if (!cancelled) {
          setProgress(progressResult);
          setRecentLogs(logsResult);
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
      <Text style={styles.title}>Caregiver View</Text>
      <Text style={styles.subtitle}>A read-only summary of this session's practice</Text>

      {loading && (
        <View style={styles.loadingRow}>
          <LoadingSpinner label="Loading…" />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && progress && progress.totalAttempts < MIN_ATTEMPTS_FOR_CHART && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyStateText}>Keep practicing to see progress trends.</Text>
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
        <View style={styles.recentSection}>
          <Text style={styles.sectionLabel}>Recent sentences practiced</Text>
          {recentLogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyStateText}>No attempts logged yet.</Text>
            </View>
          ) : (
            recentLogs.map((log) => {
              const tagColor = log.error_tag ? ERROR_TAG_COLORS[log.error_tag] : null;
              return (
                <View key={log.id} style={styles.recentItem}>
                  <Text style={styles.recentSentence}>
                    {log.reconstructed_sentence ?? '(no reconstruction recorded)'}
                  </Text>
                  {log.error_tag && tagColor && (
                    <Text
                      style={[
                        styles.recentTag,
                        { backgroundColor: tagColor.bg, color: tagColor.text },
                      ]}
                    >
                      {ERROR_TAG_LABELS[log.error_tag]}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
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
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  recentSection: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.headingSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  recentItem: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    ...cardShadow,
  },
  recentSentence: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    lineHeight: 22,
  },
  recentTag: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontFamily: fonts.headingSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
  },
});
