import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

interface LoadingSpinnerProps {
  label?: string;
  color?: string;
}

// Tints the platform spinner with the theme's plum color rather than
// building a fully custom animation - "themed" here means it reads as part
// of this app's palette, not the generic gray/blue system default.
export default function LoadingSpinner({ label, color = colors.plum }: LoadingSpinnerProps) {
  if (!label) {
    return <ActivityIndicator color={color} />;
  }

  return (
    <View style={styles.row}>
      <ActivityIndicator color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.headingSemiBold,
  },
});
