/**
 * SavedScreen — Coming Soon placeholder for saved charts
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⊡</Text>
      <Text style={styles.title}>Saved · 已保存</Text>
      <Text style={styles.body}>
        Coming soon — store and revisit your favourite birth charts any time.
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
