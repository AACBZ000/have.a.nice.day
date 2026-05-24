/**
 * TodayScreen — Coming Soon placeholder for daily fortune
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>☀</Text>
      <Text style={styles.title}>Today · 今日运势</Text>
      <Text style={styles.body}>
        Coming soon — your personalised daily fortune based on the current heavenly stems and earthly branches.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  icon: {
    fontSize: 52,
    color: COLORS.gold,
    marginBottom: SPACING.lg,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  title: {
    fontSize: SIZES.xl,
    color: COLORS.gold,
    ...FONTS.heading,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  body: {
    fontSize: SIZES.base,
    color: COLORS.creamMuted,
    textAlign: 'center',
    lineHeight: 24,
    ...FONTS.body,
  },
});
