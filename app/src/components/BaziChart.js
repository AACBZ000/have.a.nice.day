/**
 * BaziChart
 * Renders the Four Pillars chart with color-coded elements.
 *
 * Props:
 *   pillars  - { year, month, day, hour } — each with { stem, branch }
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, ELEMENT_COLORS, FONTS, SIZES, SPACING, RADIUS } from '../theme';

// Column labels
const PILLAR_LABELS = ['YEAR', 'MONTH', 'DAY', 'HOUR'];
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'];

// Chinese pillar names
const PILLAR_CHINESE = ['年柱', '月柱', '日柱', '時柱'];

function ElementBadge({ element }) {
  const color = ELEMENT_COLORS[element] || COLORS.cream;
  return (
    <View style={[styles.elementBadge, { borderColor: color + '60', backgroundColor: color + '18' }]}>
      <Text style={[styles.elementBadgeText, { color }]}>{element}</Text>
    </View>
  );
}

function PillarColumn({ label, chineseLabel, stem, branch, isDay }) {
  const stemColor = ELEMENT_COLORS[stem.element] || COLORS.cream;
  const branchColor = ELEMENT_COLORS[branch.element] || COLORS.cream;

  return (
    <View style={[styles.column, isDay && styles.dayColumn]}>
      {/* Column header */}
      <View style={[styles.columnHeader, isDay && styles.dayColumnHeader]}>
        <Text style={[styles.columnLabel, isDay && styles.dayColumnLabel]}>{label}</Text>
        <Text style={styles.columnChineseLabel}>{chineseLabel}</Text>
      </View>

      {/* Heavenly Stem section */}
      <View style={[styles.stemSection, { borderColor: stemColor + '50' }]}>
        <Text style={[styles.chineseChar, { color: stemColor }]}>{stem.chinese}</Text>
        <Text style={[styles.englishName, { color: stemColor }]}>{stem.english}</Text>
        <ElementBadge element={stem.element} />
        <Text style={styles.polarity}>{stem.polarity}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Earthly Branch section */}
      <View style={[styles.branchSection, { borderColor: branchColor + '50' }]}>
        <Text style={[styles.chineseChar, { color: branchColor }]}>{branch.chinese}</Text>
        <Text style={[styles.englishName, { color: branchColor }]}>{branch.english}</Text>
        <ElementBadge element={branch.element} />
        <Text style={styles.polarity}>{branch.polarity}</Text>
      </View>
    </View>
  );
}

export default function BaziChart({ pillars }) {
  if (!pillars) return null;

  return (
    <View style={styles.container}>
      {/* Chart title */}
      <View style={styles.titleRow}>
        <Text style={styles.titleDecor}>— ☯ —</Text>
        <Text style={styles.title}>Four Pillars Chart</Text>
        <Text style={styles.titleChinese}>四柱命盤</Text>
      </View>

      {/* Row labels */}
      <View style={styles.rowLabels}>
        <View style={styles.rowLabelStem}>
          <Text style={styles.rowLabelText}>天干</Text>
          <Text style={styles.rowLabelTextEn}>Heavenly Stem</Text>
        </View>
        <View style={styles.rowLabelBranch}>
          <Text style={styles.rowLabelText}>地支</Text>
          <Text style={styles.rowLabelTextEn}>Earthly Branch</Text>
        </View>
      </View>

      {/* Pillars grid */}
      <View style={styles.grid}>
        {PILLAR_KEYS.map((key, index) => (
          <PillarColumn
            key={key}
            label={PILLAR_LABELS[index]}
            chineseLabel={PILLAR_CHINESE[index]}
            stem={pillars[key].stem}
            branch={pillars[key].branch}
            isDay={key === 'day'}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(ELEMENT_COLORS).map(([element, color]) => (
          <View key={element} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={[styles.legendText, { color }]}>{element}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '60',
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleDecor: {
    fontSize: SIZES.md,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: SIZES.lg,
    color: COLORS.gold,
    ...FONTS.heading,
    letterSpacing: 1,
  },
  titleChinese: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    marginTop: 2,
    letterSpacing: 3,
  },
  rowLabels: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  rowLabelStem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold + '30',
  },
  rowLabelBranch: {
    flex: 1,
    alignItems: 'center',
  },
  rowLabelText: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    ...FONTS.chinese,
  },
  rowLabelTextEn: {
    fontSize: 9,
    color: COLORS.creamDim,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    flex: 1,
    backgroundColor: COLORS.backgroundAccent,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    overflow: 'hidden',
  },
  dayColumn: {
    borderColor: COLORS.gold + '80',
    backgroundColor: '#0F2840',
  },
  columnHeader: {
    backgroundColor: COLORS.borderMuted,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  dayColumnHeader: {
    backgroundColor: COLORS.gold + '30',
  },
  columnLabel: {
    fontSize: 9,
    color: COLORS.creamMuted,
    ...FONTS.heading,
    letterSpacing: 1,
  },
  dayColumnLabel: {
    color: COLORS.gold,
  },
  columnChineseLabel: {
    fontSize: 9,
    color: COLORS.creamDim,
    letterSpacing: 2,
  },
  stemSection: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
  },
  branchSection: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderTopWidth: 0,
  },
  chineseChar: {
    fontSize: SIZES.xxl,
    marginBottom: 2,
    textShadowColor: 'rgba(255,255,255,0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  englishName: {
    fontSize: 9,
    ...FONTS.body,
    marginBottom: 3,
    textAlign: 'center',
  },
  polarity: {
    fontSize: 8,
    color: COLORS.creamDim,
    marginTop: 2,
  },
  elementBadge: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  elementBadgeText: {
    fontSize: 8,
    ...FONTS.subheading,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gold + '25',
    marginHorizontal: SPACING.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderMuted,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: SIZES.xs,
    ...FONTS.body,
  },
});
