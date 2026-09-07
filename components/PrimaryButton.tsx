import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, spacing, cardShadow } from '../constants/theme';
import LoadingSpinner from './LoadingSpinner';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isInteractive = !disabled && !loading;

  const animateTo = (value: number) => {
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      onPressIn={() => isInteractive && animateTo(0.97)}
      onPressOut={() => isInteractive && animateTo(1)}
    >
      <Animated.View
        style={[styles.button, !isInteractive && styles.buttonDisabled, { transform: [{ scale }] }]}
      >
        {loading ? <LoadingSpinner color={colors.white} /> : <Text style={styles.label}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.plum,
    borderRadius: radii.md,
    minHeight: 52,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  buttonDisabled: {
    backgroundColor: colors.lavender,
    opacity: 0.6,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.headingSemiBold,
  },
});
