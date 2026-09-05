import { z } from 'zod';
import {
  UserPreferences,
  TestResult,
  CustomThemeColors,
  ThemeId,
  KeyboardLayout,
  SoundType,
  CaretStyle,
  DifficultyLevel,
} from '../types';

// Valid theme identifiers matching ThemeId in types.ts
export const ThemeIdSchema = z.enum([
  'professional',
  'obsidian',
  'cyberpunk',
  'serene',
  'chalkboard',
  'matcha',
  'sunset',
  'monokai',
  'dracula',
  'high_contrast',
  'custom',
]);

export const KeyboardLayoutSchema = z.enum(['qwerty', 'dvorak', 'colemak']);

export const SoundProfileSchema = z.enum([
  'off',
  'thock',
  'click',
  'creamy',
  'typewriter',
  'marbly',
  'silent',
]);

export const CaretStyleSchema = z.enum(['line', 'block', 'underline', 'smooth']);
export const DifficultyLevelSchema = z.enum(['easy', 'normal', 'hard', 'master']);

/**
 * Custom theme color definitions
 */
export const CustomThemeColorsSchema = z.object({
  bg: z.string().default('#0d1117'),
  bgSecondary: z.string().default('#161b22'),
  cardBg: z.string().default('#1c2128'),
  textPrimary: z.string().default('#f0f6fc'),
  textSecondary: z.string().default('#8b949e'),
  accent: z.string().default('#58a6ff'),
  accentBg: z.string().default('rgba(88, 166, 255, 0.1)'),
  caret: z.string().default('#58a6ff'),
  correct: z.string().default('#3fb950'),
  incorrect: z.string().default('#f85149'),
  border: z.string().default('#30363d'),
});

/**
 * Strict User Preferences Schema with bounds and safe defaults
 */
export const UserPreferencesSchema = z.object({
  theme: ThemeIdSchema.default('professional'),
  keyboardLayout: KeyboardLayoutSchema.default('qwerty'),
  sound: SoundProfileSchema.default('thock'),
  soundVolume: z.number().min(0).max(1).default(0.6),
  caretStyle: CaretStyleSchema.default('line'),
  showKeyboard: z.boolean().default(true),
  showLiveWpm: z.boolean().default(true),
  showLiveAccuracy: z.boolean().default(true),
  showLiveTimer: z.boolean().default(true),
  showKeyFingerGuide: z.boolean().default(true),
  suddenDeath: z.boolean().default(false),
  confidenceMode: z.boolean().default(false),
  includeNumbers: z.boolean().default(false),
  includePunctuation: z.boolean().default(false),
  dailyGoalTests: z.number().min(1).max(50).default(5),
  difficulty: DifficultyLevelSchema.default('normal'),
  floatingTicker: z.boolean().default(true),
  pacingGhost: z.boolean().default(true),
  ghostPaceWpm: z.number().min(0).max(300).optional(),
  ghostRacingMode: z.enum(['pb', 'target']).optional(),
  customThemeColors: CustomThemeColorsSchema.optional(),
});

export const KeyStatSchema = z.object({
  total: z.number().int().min(0),
  errors: z.number().int().min(0),
  totalLatencyMs: z.number().min(0),
});

export const KeystrokeTimestampSchema = z.object({
  charIndex: z.number().int().min(0),
  timestampMs: z.number().min(0),
  key: z.string().max(20).optional(),
  isCorrect: z.boolean().optional(),
});

export const WpmDataPointSchema = z.object({
  second: z.number().min(0),
  wpm: z.number().min(0).max(350),
  rawWpm: z.number().min(0).max(400),
  errors: z.number().min(0),
});

export const TestResultSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_\-:.]{1,64}$/),
  timestamp: z.number().positive(),
  wpm: z.number().min(0).max(350),
  rawWpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  mode: z.enum(['time', 'words', 'quote', 'drill', 'custom', 'code']),
  modeDetail: z.string().max(100).default('30s'),
  duration: z.number().min(1).max(3600),
  charactersTyped: z.number().int().min(0),
  correctChars: z.number().int().min(0),
  incorrectChars: z.number().int().min(0),
  extraChars: z.number().int().min(0),
  missedChars: z.number().int().min(0),
  keyStats: z.record(z.string(), KeyStatSchema).default({}),
  wpmTimeline: z.array(WpmDataPointSchema).default([]),
  keystrokeTimestamps: z.array(KeystrokeTimestampSchema).optional(),
  snippetId: z.string().max(100).optional(),
  textSnippet: z.string().max(5000).optional(),
  score: z.number().min(0).optional(),
  maxStreak: z.number().min(0).optional(),
  difficulty: DifficultyLevelSchema.optional(),
  levelEarned: z.number().min(0).optional(),
  xpEarned: z.number().min(0).optional(),
});

export const TestResultsArraySchema = z.array(TestResultSchema);

/**
 * Validates and safely parses UserPreferences from unknown payload,
 * preventing prototype pollution and runtime exceptions.
 */
export function safeValidatePreferences(raw: unknown, defaultPrefs: UserPreferences): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultPrefs };
  }

  // Prevent Prototype Pollution
  if (
    Object.prototype.hasOwnProperty.call(raw, '__proto__') ||
    Object.prototype.hasOwnProperty.call(raw, 'constructor') ||
    Object.prototype.hasOwnProperty.call(raw, 'prototype')
  ) {
    console.warn('Prototype pollution attempt blocked in preferences parser');
    return { ...defaultPrefs };
  }

  const result = UserPreferencesSchema.safeParse(raw);
  if (result.success) {
    return result.data as unknown as UserPreferences;
  }

  console.warn('Malformed preferences detected in storage, recovering safely:', result.error.format());
  // Attempt partial recovery by merging valid fields with default preferences
  try {
    const safeObj: Record<string, any> = { ...defaultPrefs };
    const rawObj = raw as Record<string, any>;
    for (const key of Object.keys(defaultPrefs)) {
      if (key in rawObj && typeof rawObj[key] === typeof (defaultPrefs as Record<string, any>)[key]) {
        safeObj[key] = rawObj[key];
      }
    }
    const secondPass = UserPreferencesSchema.safeParse(safeObj);
    return secondPass.success ? (secondPass.data as unknown as UserPreferences) : { ...defaultPrefs };
  } catch {
    return { ...defaultPrefs };
  }
}

/**
 * Validates and safely parses an array of TestResult objects from unknown payload.
 */
export function safeValidateTestResults(raw: unknown): TestResult[] {
  if (!Array.isArray(raw)) return [];

  const validated: TestResult[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    // Check for prototype pollution tokens
    if (
      Object.prototype.hasOwnProperty.call(item, '__proto__') ||
      Object.prototype.hasOwnProperty.call(item, 'constructor') ||
      Object.prototype.hasOwnProperty.call(item, 'prototype')
    ) {
      continue;
    }

    const res = TestResultSchema.safeParse(item);
    if (res.success) {
      validated.push(res.data as unknown as TestResult);
    }
  }

  return validated;
}

/**
 * Validates and safely parses a single TestResult object.
 */
export function safeValidateTestResult(raw: unknown): TestResult | null {
  if (!raw || typeof raw !== 'object') return null;

  if (
    Object.prototype.hasOwnProperty.call(raw, '__proto__') ||
    Object.prototype.hasOwnProperty.call(raw, 'constructor') ||
    Object.prototype.hasOwnProperty.call(raw, 'prototype')
  ) {
    return null;
  }

  const res = TestResultSchema.safeParse(raw);
  return res.success ? (res.data as unknown as TestResult) : null;
}

/**
 * Validates and safely parses CustomThemeColors.
 */
export function safeValidateCustomThemeColors(raw: unknown): CustomThemeColors | null {
  if (!raw || typeof raw !== 'object') return null;

  const res = CustomThemeColorsSchema.safeParse(raw);
  return res.success ? (res.data as unknown as CustomThemeColors) : null;
}

