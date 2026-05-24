/**
 * HomeScreen
 * Birth data entry form for the Destiny Pillars BaZi reading.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  Alert,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { calculateBazi } from '../services/api';

const { width } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Time of birth options (12 Chinese double-hour slots)
// ---------------------------------------------------------------------------
const TIME_SLOTS = [
  { slot: 0,  label: '11pm – 1am',  chinese: '子時', animal: 'Rat'     },
  { slot: 1,  label: '1am – 3am',   chinese: '丑時', animal: 'Ox'      },
  { slot: 2,  label: '3am – 5am',   chinese: '寅時', animal: 'Tiger'   },
  { slot: 3,  label: '5am – 7am',   chinese: '卯時', animal: 'Rabbit'  },
  { slot: 4,  label: '7am – 9am',   chinese: '辰時', animal: 'Dragon'  },
  { slot: 5,  label: '9am – 11am',  chinese: '巳時', animal: 'Snake'   },
  { slot: 6,  label: '11am – 1pm',  chinese: '午時', animal: 'Horse'   },
  { slot: 7,  label: '1pm – 3pm',   chinese: '未時', animal: 'Goat'    },
  { slot: 8,  label: '3pm – 5pm',   chinese: '申時', animal: 'Monkey'  },
  { slot: 9,  label: '5pm – 7pm',   chinese: '酉時', animal: 'Rooster' },
  { slot: 10, label: '7pm – 9pm',   chinese: '戌時', animal: 'Dog'     },
  { slot: 11, label: '9pm – 11pm',  chinese: '亥時', animal: 'Pig'     },
];

// Month names for display
const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

// Generate year range (1920 to current year)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => CURRENT_YEAR - i);

// Days 1-31
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function StyledInput({ value, onChangeText, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.creamDim}
      style={[styles.input, focused && styles.inputFocused]}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoCapitalize="words"
      returnKeyType="done"
    />
  );
}

/**
 * Generic scroll-picker modal.
 * items: array of { label: string, value: any }
 */
function PickerModal({ visible, title, items, selected, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable list */}
          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 380 }}
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => { onSelect(item.value); onClose(); }}
                >
                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function SelectButton({ label, value, placeholder, onPress }) {
  return (
    <TouchableOpacity style={styles.selectButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={value !== null && value !== undefined ? styles.selectValue : styles.selectPlaceholder}>
        {value !== null && value !== undefined ? label : placeholder}
      </Text>
      <Text style={styles.selectChevron}>▾</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null); // 'Male' | 'Female'

  // Date
  const [birthYear, setBirthYear] = useState(null);
  const [birthMonth, setBirthMonth] = useState(null);
  const [birthDay, setBirthDay] = useState(null);

  // Time slot (0-11)
  const [birthHourSlot, setBirthHourSlot] = useState(null);

  // Modal state
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Format the date display string
  const dateDisplay = (() => {
    if (!birthMonth && !birthDay && !birthYear) return null;
    const parts = [];
    if (birthMonth) parts.push(MONTHS[birthMonth - 1]);
    if (birthDay) parts.push(birthDay);
    if (birthYear) parts.push(birthYear);
    return parts.join(' ');
  })();

  // Time display
  const selectedTime = birthHourSlot !== null ? TIME_SLOTS[birthHourSlot] : null;

  function animateButton() {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!birthYear || !birthMonth || !birthDay) {
      Alert.alert('Date Required', 'Please select your complete date of birth.');
      return;
    }
    if (!gender) {
      Alert.alert('Gender Required', 'Please select your gender.');
      return;
    }

    animateButton();
    setLoading(true);

    try {
      const result = await calculateBazi({
        name: name.trim(),
        birthYear,
        birthMonth,
        birthDay,
        birthHourSlot: birthHourSlot ?? 0,
        gender,
      });

      navigation.navigate('Result', { chartData: result });
    } catch (err) {
      Alert.alert(
        'Connection Error',
        'Could not reach the server. Make sure the backend is running and try again.\n\n' + err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSymbol}>☯</Text>
          <Text style={styles.headerTitle}>Destiny Pillars</Text>
          <Text style={styles.headerSubtitle}>
            Discover your path through ancient Chinese wisdom
          </Text>
          <View style={styles.headerSep}>
            <View style={styles.sepLine} />
            <Text style={styles.sepDot}>⬦</Text>
            <View style={styles.sepLine} />
          </View>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Birth Information</Text>
          <Text style={styles.cardSubtitle}>
            The Four Pillars are derived from your exact date and time of birth
          </Text>

          {/* Full name */}
          <SectionLabel>Full Name</SectionLabel>
          <StyledInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          {/* Date of birth */}
          <SectionLabel>Date of Birth</SectionLabel>
          <View style={styles.dateRow}>
            <View style={{ flex: 1.6 }}>
              <SelectButton
                label={birthMonth ? MONTHS[birthMonth - 1] : ''}
                value={birthMonth}
                placeholder="Month"
                onPress={() => setShowMonthPicker(true)}
              />
            </View>
            <View style={{ flex: 0.8 }}>
              <SelectButton
                label={String(birthDay)}
                value={birthDay}
                placeholder="Day"
                onPress={() => setShowDayPicker(true)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectButton
                label={String(birthYear)}
                value={birthYear}
                placeholder="Year"
                onPress={() => setShowYearPicker(true)}
              />
            </View>
          </View>
          {dateDisplay && (
            <Text style={styles.datePreview}>{dateDisplay}</Text>
          )}

          {/* Time of birth */}
          <SectionLabel>Time of Birth</SectionLabel>
          <SelectButton
            label={
              selectedTime
                ? `${selectedTime.chinese} — ${selectedTime.animal} (${selectedTime.label})`
                : ''
            }
            value={birthHourSlot}
            placeholder="Select time range (optional)"
            onPress={() => setShowTimePicker(true)}
          />
          <Text style={styles.fieldHint}>
            Select the 2-hour window closest to your birth time
          </Text>

          {/* Gender */}
          <SectionLabel>Gender</SectionLabel>
          <View style={styles.genderRow}>
            {['Male', 'Female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                  {g === 'Male' ? '♂  Male' : '♀  Female'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.ctaText}>Calculating...</Text>
            ) : (
              <>
                <Text style={styles.ctaText}>Reveal My Destiny</Text>
                <Text style={styles.ctaSubtext}>命運啟示</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Based on the Four Pillars of Destiny (BaZi 八字){'\n'}
          An ancient Chinese system used for over 1,000 years
        </Text>

        {/* Decorative trigrams */}
        <Text style={styles.footerTrigrams}>☰  ☱  ☲  ☳  ☴  ☵  ☶  ☷</Text>
      </ScrollView>

      {/* Pickers */}
      <PickerModal
        visible={showMonthPicker}
        title="Select Month"
        items={MONTHS.map((m, i) => ({ label: m, value: i + 1 }))}
        selected={birthMonth}
        onSelect={setBirthMonth}
        onClose={() => setShowMonthPicker(false)}
      />
      <PickerModal
        visible={showDayPicker}
        title="Select Day"
        items={DAYS.map((d) => ({ label: String(d), value: d }))}
        selected={birthDay}
        onSelect={setBirthDay}
        onClose={() => setShowDayPicker(false)}
      />
      <PickerModal
        visible={showYearPicker}
        title="Select Year"
        items={YEARS.map((y) => ({ label: String(y), value: y }))}
        selected={birthYear}
        onSelect={setBirthYear}
        onClose={() => setShowYearPicker(false)}
      />
      <PickerModal
        visible={showTimePicker}
        title="Time of Birth"
        items={TIME_SLOTS.map((t) => ({
          label: `${t.chinese} ${t.animal}  ·  ${t.label}`,
          value: t.slot,
        }))}
        selected={birthHourSlot}
        onSelect={setBirthHourSlot}
        onClose={() => setShowTimePicker(false)}
      />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxxl,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerSymbol: {
    fontSize: 44,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  headerTitle: {
    fontSize: SIZES.xxl + 4,
    color: COLORS.gold,
    ...FONTS.heading,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: SIZES.base,
    color: COLORS.creamMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  headerSep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sepLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gold + '50',
  },
  sepDot: {
    fontSize: SIZES.md,
    color: COLORS.gold,
  },

  // Card
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    color: COLORS.gold,
    ...FONTS.heading,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.creamDim,
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },

  // Labels
  sectionLabel: {
    fontSize: SIZES.sm,
    color: COLORS.creamMuted,
    ...FONTS.subheading,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Text input
  input: {
    backgroundColor: COLORS.backgroundInput,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    fontSize: SIZES.base,
    color: COLORS.cream,
    ...FONTS.body,
  },
  inputFocused: {
    borderColor: COLORS.gold + '80',
  },

  // Select button
  selectButton: {
    backgroundColor: COLORS.backgroundInput,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: SIZES.sm,
    color: COLORS.cream,
    ...FONTS.body,
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: SIZES.sm,
    color: COLORS.creamDim,
    flex: 1,
  },
  selectChevron: {
    fontSize: SIZES.md,
    color: COLORS.gold,
    marginLeft: SPACING.xs,
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  datePreview: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },
  fieldHint: {
    fontSize: SIZES.xs,
    color: COLORS.creamDim,
    marginTop: SPACING.xs,
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    backgroundColor: COLORS.backgroundInput,
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold + '20',
  },
  genderBtnText: {
    fontSize: SIZES.base,
    color: COLORS.creamDim,
    ...FONTS.subheading,
  },
  genderBtnTextActive: {
    color: COLORS.gold,
  },

  // CTA Button
  ctaButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.gold,
  },
  ctaButtonDisabled: {
    backgroundColor: COLORS.goldMuted,
  },
  ctaText: {
    fontSize: SIZES.lg,
    color: COLORS.background,
    ...FONTS.heading,
    letterSpacing: 1,
  },
  ctaSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.background + 'AA',
    letterSpacing: 4,
    marginTop: 2,
  },

  // Footer
  footerNote: {
    fontSize: SIZES.xs,
    color: COLORS.creamDim,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  footerTrigrams: {
    fontSize: SIZES.sm,
    color: COLORS.goldMuted,
    textAlign: 'center',
    letterSpacing: 4,
    opacity: 0.5,
  },

  // Picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.gold + '40',
    paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderMuted,
  },
  modalTitle: {
    fontSize: SIZES.base,
    color: COLORS.gold,
    ...FONTS.heading,
  },
  modalClose: {
    fontSize: SIZES.md,
    color: COLORS.creamDim,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderMuted,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.gold + '15',
  },
  pickerItemText: {
    fontSize: SIZES.base,
    color: COLORS.cream,
    ...FONTS.body,
  },
  pickerItemTextSelected: {
    color: COLORS.gold,
    ...FONTS.subheading,
  },
  pickerCheck: {
    fontSize: SIZES.base,
    color: COLORS.gold,
  },
});
