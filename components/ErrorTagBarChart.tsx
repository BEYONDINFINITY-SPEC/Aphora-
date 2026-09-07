import { Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ERROR_TAGS, ERROR_TAG_LABELS } from '../constants/errorTags';
import type { LogErrorTag } from '../lib/database.types';
import { colors, radii } from '../constants/theme';

interface ErrorTagBarChartProps {
  counts: Record<LogErrorTag, number>;
}

// Shared by ProgressScreen and CaregiverScreen so both render identically
// and stay in sync - a second hand-copied chartConfig would inevitably drift.
// Note: react-native-chart-kit's chartConfig only accepts rgba() functions,
// not the theme's hex strings directly - values below are the theme's
// plum/text/background colors converted to their rgb components.
export default function ErrorTagBarChart({ counts }: ErrorTagBarChartProps) {
  return (
    <BarChart
      data={{
        labels: ERROR_TAGS.map((tag) => ERROR_TAG_LABELS[tag]),
        datasets: [{ data: ERROR_TAGS.map((tag) => counts[tag]) }],
      }}
      width={Dimensions.get('window').width - 48}
      height={240}
      yAxisLabel=""
      yAxisSuffix=""
      fromZero
      showValuesOnTopOfBars
      verticalLabelRotation={30}
      chartConfig={{
        backgroundGradientFrom: colors.surface, // #FFFFFF
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(139, 122, 184, ${opacity})`, // colors.plum #8B7AB8
        labelColor: (opacity = 1) => `rgba(61, 52, 80, ${opacity})`, // colors.text #3D3450
        barPercentage: 0.6,
      }}
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: radii.md,
    marginLeft: -16,
  },
});
