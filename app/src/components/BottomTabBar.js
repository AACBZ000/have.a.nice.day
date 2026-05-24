/**
 * BottomTabBar
 * Custom fixed bottom navigation bar for the four main tabs.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../theme';

// Accent color requested in spec
const ACCENT = '#7C6AF7';
const TAB_BG  = '#111113';

const TABS = [
  { key: 'Reading', icon: '☯', label: 'Reading' },
  { key: 'Match',   icon: '♡', label: 'Match'   },
  { key: 'Today',   icon: '☀', label: 'Today'   },
  { key: 'Saved',   icon: '⊡', label: 'Saved'   },
];

export default function BottomTabBar({ activeTab, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: TAB_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderMuted,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  icon: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 3,
  },
  iconActive: {
    color: ACCENT,
  },
  label: {
    fontSize: SIZES.xs,
    color: '#6B7280',
    ...FONTS.body,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: ACCENT,
    ...FONTS.subheading,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 3,
  },
});
