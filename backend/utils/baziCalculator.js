/**
 * BaZi (Four Pillars of Destiny) Calculator
 * Implements the core calculations for the Chinese astrological system.
 */

// Heavenly Stems (天干) - 10 stems cycling through 5 elements, Yang then Yin
const HEAVENLY_STEMS = [
  { chinese: '甲', english: 'Jiǎ', element: 'Wood', polarity: 'Yang' },
  { chinese: '乙', english: 'Yǐ', element: 'Wood', polarity: 'Yin' },
  { chinese: '丙', english: 'Bǐng', element: 'Fire', polarity: 'Yang' },
  { chinese: '丁', english: 'Dīng', element: 'Fire', polarity: 'Yin' },
  { chinese: '戊', english: 'Wù', element: 'Earth', polarity: 'Yang' },
  { chinese: '己', english: 'Jǐ', element: 'Earth', polarity: 'Yin' },
  { chinese: '庚', english: 'Gēng', element: 'Metal', polarity: 'Yang' },
  { chinese: '辛', english: 'Xīn', element: 'Metal', polarity: 'Yin' },
  { chinese: '壬', english: 'Rén', element: 'Water', polarity: 'Yang' },
  { chinese: '癸', english: 'Guǐ', element: 'Water', polarity: 'Yin' },
];

// Earthly Branches (地支) - 12 branches corresponding to the 12 zodiac animals
const EARTHLY_BRANCHES = [
  { chinese: '子', english: 'Rat',     element: 'Water', polarity: 'Yang' },
  { chinese: '丑', english: 'Ox',      element: 'Earth', polarity: 'Yin' },
  { chinese: '寅', english: 'Tiger',   element: 'Wood',  polarity: 'Yang' },
  { chinese: '卯', english: 'Rabbit',  element: 'Wood',  polarity: 'Yin' },
  { chinese: '辰', english: 'Dragon',  element: 'Earth', polarity: 'Yang' },
  { chinese: '巳', english: 'Snake',   element: 'Fire',  polarity: 'Yin' },
  { chinese: '午', english: 'Horse',   element: 'Fire',  polarity: 'Yang' },
  { chinese: '未', english: 'Goat',    element: 'Earth', polarity: 'Yin' },
  { chinese: '申', english: 'Monkey',  element: 'Metal', polarity: 'Yang' },
  { chinese: '酉', english: 'Rooster', element: 'Metal', polarity: 'Yin' },
  { chinese: '戌', english: 'Dog',     element: 'Earth', polarity: 'Yang' },
  { chinese: '亥', english: 'Pig',     element: 'Water', polarity: 'Yin' },
];

/**
 * The 12 "Earth Branches" for time of day (Chinese hours / Shí chén 时辰)
 * Each branch governs a 2-hour window. Index 0 = Rat (子) = 23:00-01:00.
 */
const HOUR_BRANCH_INDEX = [
  0,  // 23:00-01:00 → 子 Rat     (index 0 in EARTHLY_BRANCHES)
  1,  // 01:00-03:00 → 丑 Ox
  2,  // 03:00-05:00 → 寅 Tiger
  3,  // 05:00-07:00 → 卯 Rabbit
  4,  // 07:00-09:00 → 辰 Dragon
  5,  // 09:00-11:00 → 巳 Snake
  6,  // 11:00-13:00 → 午 Horse
  7,  // 13:00-15:00 → 未 Goat
  8,  // 15:00-17:00 → 申 Monkey
  9,  // 17:00-19:00 → 酉 Rooster
  10, // 19:00-21:00 → 戌 Dog
  11, // 21:00-23:00 → 亥 Pig
];

/**
 * Month branch offset: Chinese lunar month 1 (寅) starts in February.
 * Solar-term approximation mapping Gregorian month → branch index.
 * Month 1 (Jan) ≈ 丑 (Ox, index 1), Month 2 (Feb) ≈ 寅 (Tiger, index 2), etc.
 */
const MONTH_BRANCH_BY_SOLAR_MONTH = [
  1,  // January  → 丑 Ox     (index 1)
  2,  // February → 寅 Tiger  (index 2)
  3,  // March    → 卯 Rabbit (index 3)
  4,  // April    → 辰 Dragon (index 4)
  5,  // May      → 巳 Snake  (index 5)
  6,  // June     → 午 Horse  (index 6)
  7,  // July     → 未 Goat   (index 7)
  8,  // August   → 申 Monkey (index 8)
  9,  // September→ 酉 Rooster(index 9)
  10, // October  → 戌 Dog    (index 10)
  11, // November → 亥 Pig    (index 11)
  0,  // December → 子 Rat    (index 0)
];

/**
 * Month stem offset table.
 * Given the year stem index (0-9), returns the stem index for month 寅 (Tiger, Feb).
 * Pattern: Year stems Yang Wood (0) → month stem starts at 丙 (2)
 */
const MONTH_STEM_BASE = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
// Index 0 (甲 Jiǎ) → 丙 (2), index 2 (丙 Bǐng) → 戊 (4), etc.

/**
 * Calculate the Year Pillar
 */
function getYearPillar(year) {
  // Stem: (year - 4) mod 10  (year 4 AD is the first 甲 year)
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  // Branch: (year - 4) mod 12
  const branchIndex = ((year - 4) % 12 + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

/**
 * Calculate the Month Pillar
 * Uses solar-term approximation (not precise lunar calendar).
 * @param {number} month - 1-based Gregorian month (1=January)
 * @param {number} yearStemIndex - stem index of the year pillar
 */
function getMonthPillar(month, yearStemIndex) {
  const monthIndex = month - 1; // 0-based

  // Branch follows a fixed solar pattern
  const branchIndex = MONTH_BRANCH_BY_SOLAR_MONTH[monthIndex];

  // Stem: derive from year stem using the 5-year cycle
  // For Tiger month (February), base stem = MONTH_STEM_BASE[yearStemIndex]
  // Each subsequent month adds 1 to stem index (mod 10)
  // Tiger month is index 2 in branches; we need offset from Tiger for this month
  const tigerBranchIndex = 2; // 寅 = Tiger
  // How many branch steps from Tiger to this month's branch?
  let stepsFromTiger = (branchIndex - tigerBranchIndex + 12) % 12;
  // Special case: December (子, index 0) is 10 steps after Tiger in the annual cycle
  if (monthIndex === 11) stepsFromTiger = 10;

  const stemIndex = (MONTH_STEM_BASE[yearStemIndex] + stepsFromTiger) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

/**
 * Calculate the Day Pillar using Julian Day Number (JDN) method.
 * The Julian Day Number gives a unique integer for each calendar day.
 * Day stem and branch cycle every 60 days from a known epoch.
 */
function getDayPillar(year, month, day) {
  // Compute Julian Day Number (JDN) using the proleptic Gregorian calendar formula
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Reference: JDN 2435000 (Jan 1, 1955) has Day Stem 甲 (0) and Branch 子 (0)
  // Adjust so that modular arithmetic lines up correctly
  const REFERENCE_JDN = 2435000;
  const REFERENCE_STEM = 0;  // 甲
  const REFERENCE_BRANCH = 0; // 子

  const daysSinceRef = jdn - REFERENCE_JDN;
  const stemIndex = ((daysSinceRef + REFERENCE_STEM) % 10 + 10) % 10;
  const branchIndex = ((daysSinceRef + REFERENCE_BRANCH) % 12 + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

/**
 * Calculate the Hour Pillar
 * @param {number} hourSlotIndex - 0-11, where 0 = 子时 (Rat, 23:00-01:00)
 * @param {number} dayStemIndex - stem index of the day pillar
 */
function getHourPillar(hourSlotIndex, dayStemIndex) {
  // Hour branch is directly the slot index
  const branchIndex = HOUR_BRANCH_INDEX[hourSlotIndex];

  // Hour stem formula: based on day stem
  // For day stems 甲/己 (0,5): Rat hour stem starts at 甲 (0)
  // For day stems 乙/庚 (1,6): Rat hour stem starts at 丙 (2)
  // For day stems 丙/辛 (2,7): Rat hour stem starts at 戊 (4)
  // For day stems 丁/壬 (3,8): Rat hour stem starts at 庚 (6)
  // For day stems 戊/癸 (4,9): Rat hour stem starts at 壬 (8)
  const HOUR_STEM_BASE = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const stemIndex = (HOUR_STEM_BASE[dayStemIndex] + hourSlotIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

/**
 * Main calculation function.
 * @param {Object} params
 * @param {number} params.birthYear   - e.g. 1990
 * @param {number} params.birthMonth  - 1-based, e.g. 1=January
 * @param {number} params.birthDay    - 1-based, e.g. 15
 * @param {number} params.birthHourSlot - 0-11, Chinese hour slot index
 * @returns {Object} Four pillars with stem/branch details
 */
function calculateBazi({ birthYear, birthMonth, birthDay, birthHourSlot }) {
  const yearPillar = getYearPillar(birthYear);
  const monthPillar = getMonthPillar(birthMonth, yearPillar.stemIndex);
  const dayPillar = getDayPillar(birthYear, birthMonth, birthDay);
  const hourPillar = getHourPillar(birthHourSlot, dayPillar.stemIndex);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}

/**
 * Summarize element counts across the four pillars (stems + branches = 8 characters).
 */
function getElementSummary(pillars) {
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

  for (const pillar of Object.values(pillars)) {
    counts[pillar.stem.element]++;
    counts[pillar.branch.element]++;
  }

  // Find dominant and weak elements
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return {
    counts,
    dominant: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
  };
}

module.exports = {
  calculateBazi,
  getElementSummary,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
};
