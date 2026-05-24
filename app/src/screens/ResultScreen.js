/**
 * ResultScreen
 * Displays the calculated Four Pillars chart and streams the AI interpretation.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS, ELEMENT_COLORS } from '../theme';
import BaziChart from '../components/BaziChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { streamInterpretation } from '../services/api';

const { width } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Markdown-lite renderer
// Parses the headings (## title) and body paragraphs from the AI response.
// ---------------------------------------------------------------------------
function parseMarkdownSections(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1].replace(/\*\*/g, ''), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    }
  }
  if (current) sections.push(current);

  return sections.map((s) => ({
    ...s,
    body: s.body
      .trim()
      .replace(/\*\*(.*?)\*\*/g, '$1') // strip bold markers
      .replace(/\*(.*?)\*/g, '$1'),      // strip italic markers
  }));
}

// Section icons
const SECTION_ICONS = {
  'Overall Destiny': '⬡',
  'Overall Destiny & Life Theme': '⬡',
  'Personality': '☿',
  'Personality & Character': '☿',
  'Career': '◈',
  'Career & Wealth': '◈',
  'Love': '♡',
  'Love & Relationships': '♡',
  'Health': '✦',
  'Health & Vitality': '✦',
  'Lucky Elements': '☆',
  'Lucky Elements & Colors': '☆',
};

function getIcon(heading) {
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (heading.includes(key)) return icon;
  }
  return '◆';
}

// ---------------------------------------------------------------------------
// Rendered section card
// ---------------------------------------------------------------------------
function SectionCard({ heading, body, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sectionCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{getIcon(heading)}</Text>
        <Text style={styles.sectionHeading}>{heading}</Text>
      </View>
      <Text style={styles.sectionBody}>{body}</Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Element summary badges
// ---------------------------------------------------------------------------
function ElementSummary({ elementSummary }) {
  if (!elementSummary) return null;
  const { counts, dominant, weakest } = elementSummary;
  return (
    <View style={styles.elementSummaryCard}>
      <Text style={styles.elementSummaryTitle}>Element Balance</Text>
      <View style={styles.elementBars}>
        {Object.entries(counts).map(([element, count]) => (
          <View key={element} style={styles.elementBarItem}>
            <Text style={[styles.elementBarLabel, { color: ELEMENT_COLORS[element] }]}>
              {element}
            </Text>
            <View style={styles.elementBarBg}>
              <View
                style={[
                  styles.elementBarFill,
                  {
                    backgroundColor: ELEMENT_COLORS[element],
                    width: `${(count / 8) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.elementBarCount, { color: ELEMENT_COLORS[element] }]}>
              {count}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.elementTags}>
        <View style={[styles.elementTag, { borderColor: ELEMENT_COLORS[dominant] + '60', backgroundColor: ELEMENT_COLORS[dominant] + '15' }]}>
          <Text style={[styles.elementTagText, { color: ELEMENT_COLORS[dominant] }]}>
            Dominant: {dominant}
          </Text>
        </View>
        <View style={[styles.elementTag, { borderColor: ELEMENT_COLORS[weakest] + '60', backgroundColor: ELEMENT_COLORS[weakest] + '15' }]}>
          <Text style={[styles.elementTagText, { color: ELEMENT_COLORS[weakest] }]}>
            Weakest: {weakest}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main ResultScreen
// ---------------------------------------------------------------------------
export default function ResultScreen({ navigation, route }) {
  const { chartData } = route.params;
  const { name, gender, pillars, elementSummary, birthDate } = chartData;

  const [streamText, setStreamText] = useState('');
  const [sections, setSections] = useState([]);
  const [streaming, setStreaming] = useState(true);
  const [streamError, setStreamError] = useState(null);

  const abortRef = useRef(null);
  const streamTextRef = useRef('');
  const scrollRef = useRef(null);

  // Header animation
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Start streaming interpretation
  useEffect(() => {
    abortRef.current = streamInterpretation(
      { name, gender, pillars },
      (chunk) => {
        streamTextRef.current += chunk;
        setStreamText(streamTextRef.current);
        // Parse sections progressively
        const parsed = parseMarkdownSections(streamTextRef.current);
        setSections(parsed);
      },
      () => {
        setStreaming(false);
        const parsed = parseMarkdownSections(streamTextRef.current);
        setSections(parsed);
      },
      (err) => {
        setStreaming(false);
        setStreamError(err.message);
      },
    );

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Format birth date nicely
  function formatBirthDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const months = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    return `${months[m - 1]} ${d}, ${y}`;
  }

  async function handleShare() {
    try {
      const shareText = [
        `✨ My Destiny Pillars Reading ✨`,
        ``,
        `Name: ${name}`,
        `Birth Date: ${formatBirthDate(birthDate)}`,
        ``,
        `Four Pillars (BaZi 八字):`,
        `Year:  ${pillars.year.stem.chinese} ${pillars.year.branch.chinese} (${pillars.year.stem.element} ${pillars.year.branch.english})`,
        `Month: ${pillars.month.stem.chinese} ${pillars.month.branch.chinese} (${pillars.month.stem.element} ${pillars.month.branch.english})`,
        `Day:   ${pillars.day.stem.chinese} ${pillars.day.branch.chinese} (${pillars.day.stem.element} ${pillars.day.branch.english})`,
        `Hour:  ${pillars.hour.stem.chinese} ${pillars.hour.branch.chinese} (${pillars.hour.stem.element} ${pillars.hour.branch.english})`,
        ``,
        streamText ? streamText.substring(0, 500) + '...' : '',
        ``,
        `Revealed by Destiny Pillars — Ancient Chinese Wisdom`,
      ].join('\n');

      await Share.share({ message: shareText, title: 'My Destiny Pillars Reading' });
    } catch {
      // User dismissed share sheet
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Fixed top navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Your Reading</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Person header */}
        <Animated.View
          style={[
            styles.personHeader,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <Text style={styles.personSymbol}>☯</Text>
          <Text style={styles.personName}>{name}</Text>
          <Text style={styles.personMeta}>
            {formatBirthDate(birthDate)}  ·  {gender}
          </Text>
          <View style={styles.personSep}>
            <View style={styles.personSepLine} />
            <Text style={styles.personSepDot}>⬦</Text>
            <View style={styles.personSepLine} />
          </View>
          <Text style={styles.personTagline}>Your Four Pillars of Destiny</Text>
          <Text style={styles.personTaglineChinese}>八字命盤</Text>
        </Animated.View>

        {/* BaZi Chart */}
        <BaziChart pillars={pillars} />

        {/* Element Summary */}
        <ElementSummary elementSummary={elementSummary} />

        {/* AI Interpretation */}
        <View style={styles.interpretationSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleDecor}>— ☯ —</Text>
            <Text style={styles.interpretationTitle}>Your Destiny Reading</Text>
            <Text style={styles.interpretationTitleChinese}>命運解讀</Text>
          </View>

          {streaming && sections.length === 0 && (
            <LoadingSpinner message="Reading the ancient stars..." />
          )}

          {streamError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorTitle}>Could not load interpretation</Text>
              <Text style={styles.errorText}>
                Make sure the backend server is running and your DeepSeek API key is set.
              </Text>
              <Text style={styles.errorDetail}>{streamError}</Text>
            </View>
          )}

          {sections.map((section, index) => (
            <SectionCard
              key={section.heading + index}
              heading={section.heading}
              body={section.body}
              index={index}
            />
          ))}

          {streaming && sections.length > 0 && (
            <View style={styles.streamingIndicator}>
              <Text style={styles.streamingDot}>●</Text>
              <Text style={styles.streamingText}>Receiving wisdom...</Text>
            </View>
          )}
        </View>

        {/* Bottom actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.shareActionBtn} onPress={handleShare}>
            <Text style={styles.shareActionIcon}>↑</Text>
            <Text style={styles.shareActionText}>Share Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.againBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.againBtnText}>Calculate Again</Text>
            <Text style={styles.againBtnChinese}>重新計算</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          ☰  ☱  ☲  ☳  ☴  ☵  ☶  ☷{'\n'}
          <Text style={styles.footerNote}>
            Destiny Pillars · Four Pillars of Destiny
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderMuted,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    minWidth: 64,
  },
  backBtnText: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.subheading,
  },
  navTitle: {
    fontSize: SIZES.base,
    color: COLORS.cream,
    ...FONTS.heading,
    letterSpacing: 1,
  },
  shareBtn: {
    minWidth: 64,
    alignItems: 'flex-end',
  },
  shareBtnText: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.subheading,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.xl,
  },

  // Person header
  personHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  personSymbol: {
    fontSize: 40,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  personName: {
    fontSize: SIZES.xxl,
    color: COLORS.cream,
    ...FONTS.heading,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  personMeta: {
    fontSize: SIZES.sm,
    color: COLORS.creamMuted,
    marginBottom: SPACING.md,
  },
  personSep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  personSepLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gold + '40',
  },
  personSepDot: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
  },
  personTagline: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    letterSpacing: 2,
  },
  personTaglineChinese: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    letterSpacing: 4,
    opacity: 0.7,
    marginTop: 2,
  },

  // Element summary
  elementSummaryCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    padding: SPACING.base,
    marginVertical: SPACING.md,
  },
  elementSummaryTitle: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.subheading,
    marginBottom: SPACING.md,
  },
  elementBars: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  elementBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  elementBarLabel: {
    fontSize: SIZES.sm,
    ...FONTS.subheading,
    width: 44,
  },
  elementBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.borderMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  elementBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  elementBarCount: {
    fontSize: SIZES.sm,
    ...FONTS.subheading,
    width: 18,
    textAlign: 'right',
  },
  elementTags: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  elementTag: {
    borderRadius: RADIUS.round,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  elementTagText: {
    fontSize: SIZES.sm,
    ...FONTS.subheading,
  },

  // Interpretation section
  interpretationSection: {
    marginTop: SPACING.sm,
  },
  sectionTitleRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitleDecor: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  interpretationTitle: {
    fontSize: SIZES.xl,
    color: COLORS.gold,
    ...FONTS.heading,
    letterSpacing: 1,
    marginBottom: 2,
  },
  interpretationTitleChinese: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    letterSpacing: 4,
    opacity: 0.7,
  },

  // Section cards
  sectionCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '25',
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderMuted,
  },
  sectionIcon: {
    fontSize: SIZES.lg,
    color: COLORS.gold,
  },
  sectionHeading: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.heading,
    flex: 1,
  },
  sectionBody: {
    fontSize: SIZES.sm + 1,
    color: COLORS.creamMuted,
    lineHeight: 22,
    ...FONTS.body,
  },

  // Streaming indicator
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  streamingDot: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
  },
  streamingText: {
    fontSize: SIZES.sm,
    color: COLORS.creamDim,
    ...FONTS.body,
  },

  // Error card
  errorCard: {
    backgroundColor: '#1A0F0F',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorIcon: {
    fontSize: SIZES.xxl,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: SIZES.base,
    color: COLORS.error,
    ...FONTS.heading,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.creamDim,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  errorDetail: {
    fontSize: SIZES.xs,
    color: COLORS.creamDim,
    opacity: 0.6,
    textAlign: 'center',
  },

  // Bottom actions
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gold + '60',
    backgroundColor: COLORS.backgroundCard,
  },
  shareActionIcon: {
    fontSize: SIZES.lg,
    color: COLORS.gold,
  },
  shareActionText: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.subheading,
  },
  againBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.gold,
    ...SHADOWS.gold,
  },
  againBtnText: {
    fontSize: SIZES.base,
    color: COLORS.background,
    ...FONTS.heading,
  },
  againBtnChinese: {
    fontSize: SIZES.xs,
    color: COLORS.background + 'AA',
    letterSpacing: 3,
    marginTop: 2,
  },

  // Footer
  footer: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    textAlign: 'center',
    letterSpacing: 4,
    opacity: 0.5,
    lineHeight: 22,
  },
  footerNote: {
    fontSize: SIZES.xs,
    color: COLORS.creamDim,
    letterSpacing: 1,
    opacity: 0.6,
  },
});
