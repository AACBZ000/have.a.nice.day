/**
 * LoadingSpinner
 * Animated rotating bagua / taijitu symbol shown while the AI is thinking.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

export default function LoadingSpinner({ message = 'Consulting the ancient wisdom...' }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Gentle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Text fade pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />

      {/* Rotating symbol */}
      <Animated.Text
        style={[
          styles.symbol,
          { transform: [{ rotate }, { scale: pulseAnim }] },
        ]}
      >
        ☯
      </Animated.Text>

      {/* Decorative ring of trigrams */}
      <View style={styles.trigramRow}>
        {['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((trigram, i) => (
          <Text key={i} style={styles.trigram}>
            {trigram}
          </Text>
        ))}
      </View>

      {/* Status text */}
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {message}
      </Animated.Text>

      <Text style={styles.subMessage}>This may take a moment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
    opacity: 0.25,
  },
  symbol: {
    fontSize: 72,
    color: COLORS.gold,
    marginBottom: SPACING.lg,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  trigramRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  trigram: {
    fontSize: SIZES.md,
    color: COLORS.goldMuted,
    opacity: 0.6,
  },
  message: {
    fontSize: SIZES.base,
    color: COLORS.cream,
    textAlign: 'center',
    ...FONTS.subheading,
    marginBottom: SPACING.sm,
  },
  subMessage: {
    fontSize: SIZES.sm,
    color: COLORS.creamDim,
    textAlign: 'center',
    ...FONTS.body,
  },
});
