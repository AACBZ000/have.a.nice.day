/**
 * SplashScreen
 * Animated intro screen with rotating bagua, app name, and tagline.
 * Auto-navigates to HomeScreen after 2.5 seconds.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Animation refs
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(0.6)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const decorFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start logo rotation (slow, majestic)
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Sequence: logo appears → title fades in → subtitle → tagline
    Animated.sequence([
      // Logo pulse in
      Animated.spring(logoPulse, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),

      // Title appears
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Subtitle
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),

      // Decor + tagline
      Animated.parallel([
        Animated.timing(decorFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Background decorative circles */}
      <View style={[styles.bgCircle, styles.bgCircle1]} />
      <View style={[styles.bgCircle, styles.bgCircle2]} />

      {/* Rotating outer ring with trigrams */}
      <Animated.View
        style={[styles.outerRing, { transform: [{ rotate }, { scale: logoPulse }] }]}
      >
        <Text style={styles.trigramCircle}>
          {'☰  ☱  ☲  ☳  ☴  ☵  ☶  ☷'}
        </Text>
      </Animated.View>

      {/* Central taijitu symbol */}
      <Animated.Text
        style={[styles.mainSymbol, { transform: [{ scale: logoPulse }] }]}
      >
        ☯
      </Animated.Text>

      {/* App name */}
      <Animated.View
        style={{
          opacity: titleFade,
          transform: [{ translateY: titleSlide }],
          alignItems: 'center',
        }}
      >
        <Text style={styles.appName}>DESTINY</Text>
        <Text style={styles.appNameSecond}>PILLARS</Text>
      </Animated.View>

      {/* Decorative separator */}
      <Animated.View style={[styles.separator, { opacity: decorFade }]}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorDecor}>⬦</Text>
        <View style={styles.separatorLine} />
      </Animated.View>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
        Ancient Chinese Wisdom
      </Animated.Text>

      {/* Chinese tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
        四柱命理
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background decorative circles
  bgCircle: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 1,
    borderColor: COLORS.gold + '15',
  },
  bgCircle1: {
    width: width * 0.9,
    height: width * 0.9,
    top: '15%',
  },
  bgCircle2: {
    width: width * 1.3,
    height: width * 1.3,
    top: '5%',
    borderColor: COLORS.gold + '08',
  },

  // Rotating ring
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trigramCircle: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    letterSpacing: 4,
    position: 'absolute',
    top: -10,
  },

  // Central symbol
  mainSymbol: {
    fontSize: 90,
    color: COLORS.gold,
    marginBottom: SPACING.xxl,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },

  // App name
  appName: {
    fontSize: SIZES.xxxl + 4,
    color: COLORS.gold,
    ...FONTS.heading,
    letterSpacing: 12,
    textShadowColor: COLORS.gold + '80',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  appNameSecond: {
    fontSize: SIZES.xxxl + 4,
    color: COLORS.cream,
    ...FONTS.heading,
    letterSpacing: 8,
    marginTop: -4,
  },

  // Separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  separatorLine: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.gold + '60',
  },
  separatorDecor: {
    fontSize: SIZES.md,
    color: COLORS.gold,
  },

  // Subtitle
  subtitle: {
    fontSize: SIZES.lg,
    color: COLORS.creamMuted,
    ...FONTS.subheading,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },

  // Chinese tagline
  tagline: {
    fontSize: SIZES.xl,
    color: COLORS.goldMuted,
    letterSpacing: 8,
  },
});
