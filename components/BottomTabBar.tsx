import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Wand, BookOpen, ChartColumn, Users, type LucideIcon } from 'lucide-react-native';
import { colors, fonts, spacing } from '../constants/theme';

export type MainScreen = 'reconstruction' | 'naming' | 'progress' | 'caregiver';

interface Tab {
  key: MainScreen;
  label: string;
  Icon: LucideIcon;
}

const TABS: Tab[] = [
  { key: 'reconstruction', label: 'Reconstruct', Icon: Wand },
  { key: 'naming', label: 'Naming', Icon: BookOpen },
  { key: 'progress', label: 'Progress', Icon: ChartColumn },
  { key: 'caregiver', label: 'Caregiver', Icon: Users },
];

interface BottomTabBarProps {
  active: MainScreen;
  onChange: (screen: MainScreen) => void;
}

export default function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <Pressable key={key} style={styles.tab} onPress={() => onChange(key)}>
            <Icon
              color={isActive ? colors.plum : colors.textMuted}
              size={24}
              strokeWidth={isActive ? 2.25 : 1.75}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg, // extra bottom padding approximating home-indicator clearance
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.headingSemiBold,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.plum,
  },
});
