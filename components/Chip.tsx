import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function Chip({ label, selected, onPress }: ChipProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(0.95)} onPressOut={() => animateTo(1)}>
      <Animated.View
        style={[styles.chip, selected && styles.chipSelected, { transform: [{ scale }] }]}
      >
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderColor: colors.lavender,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  chipSelected: {
    backgroundColor: colors.lavender,
    borderColor: colors.lavender,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.headingSemiBold,
    color: colors.text,
  },
  labelSelected: {
    color: colors.white,
  },
});
