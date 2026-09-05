export type TestMode = 'time' | 'words' | 'quote' | 'drill' | 'custom' | 'code';
export type TimeOption = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;
export type DrillType = 'top200' | 'top1000' | 'trigrams' | 'weak_keys' | 'code' | 'numbers_punctuation' | 'burst';
export type KeyboardLayout = 'qwerty' | 'dvorak' | 'colemak';
export type ThemeId =
  | 'professional'
  | 'obsidian'
  | 'cyberpunk'
  | 'serene'
  | 'chalkboard'
  | 'matcha'
  | 'sunset'
  | 'monokai'
  | 'dracula'
  | 'high_contrast'
  | 'custom';
export type SoundType = 'off' | 'thock' | 'click' | 'creamy' | 'typewriter' | 'marbly' | 'silent';
export type CaretStyle = 'line' | 'block' | 'underline' | 'smooth';
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'master';

export interface CustomThemeColors {
  bg: string;
  bgSecondary: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  caret: string;
  correct: string;
  incorrect: string;
  border: string;
}

export interface KeyStat {
  total: number;
  errors: number;
  totalLatencyMs: number;
}

export interface WpmDataPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface KeystrokeTimestamp {
  charIndex: number;
  timestampMs: number;
  key?: string;
  isCorrect?: boolean;
}

export interface TestResult {
  id: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: TestMode;
  modeDetail: string; // e.g. "30s", "50 words", "Weak Keys Drill"
  duration: number; // in seconds
  charactersTyped: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  keyStats: Record<string, KeyStat>;
  wpmTimeline: WpmDataPoint[];
  keystrokeTimestamps?: KeystrokeTimestamp[];
  snippetId?: string;
  textSnippet?: string;
  // Gamification properties
  score?: number;
  maxStreak?: number;
  difficulty?: DifficultyLevel;
  levelEarned?: number;
  xpEarned?: number;
}

export interface UserPreferences {
  theme: ThemeId;
  keyboardLayout: KeyboardLayout;
  sound: SoundType;
  soundVolume: number;
  caretStyle: CaretStyle;
  showKeyboard: boolean;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showLiveTimer: boolean;
  showKeyFingerGuide: boolean;
  suddenDeath: boolean; // instant fail on error
  confidenceMode: boolean; // cannot backspace
  includeNumbers: boolean;
  includePunctuation: boolean;
  dailyGoalTests: number;
  difficulty: DifficultyLevel;
  floatingTicker: boolean;
  pacingGhost: boolean; // visual ghost caret at PB / target pace
  ghostPaceWpm?: number; // custom ghost WPM pace or 0 for dynamic PB
  ghostRacingMode?: 'pb' | 'target'; // race against recorded PB keystrokes or constant target
  customThemeColors?: CustomThemeColors;
}

export interface AICodeSnippetResponse {
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface AIWeakKeyDrillResponse {
  drillTitle: string;
  words: string[];
  explanation: string;
}

export interface AICoachingFeedback {
  verdict: string;
  diagnosis: string;
  mechanicalTips: string[];
  recommendedAction: string;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  username: string;
  wpm: number;
  accuracy: number;
  mode: string;
  date: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface OverallStats {
  totalTests: number;
  totalTimeSeconds: number;
  totalWordsTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm15s: number;
  bestWpm30s: number;
  bestWpm60s: number;
  bestWpmOverall: number;
  streakDays: number;
  lastTestDate: string; // YYYY-MM-DD
  allKeyStats: Record<string, KeyStat>;
  // Gamification aggregated
  totalScore: number;
  highScore: number;
  totalXp: number;
  playerLevel: number;
  levelTitle: string;
  maxStreakOverall: number;
  highestStreak: number;
}

export interface FingerInfo {
  name: string;
  hand: 'left' | 'right';
  color: string;
}

export type AchievementCategory = 'speed' | 'accuracy' | 'streak' | 'volume' | 'mastery' | 'enthusiast';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rewardXp: number;
}
