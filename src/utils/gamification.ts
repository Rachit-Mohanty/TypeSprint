import { DifficultyLevel } from '../types';

export interface LevelInfo {
  level: number;
  title: string;
  nextLevelTitle?: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Novice Typist' },
  { level: 2, xp: 200, title: 'Key Apprentice' },
  { level: 3, xp: 500, title: 'Tactile Scout' },
  { level: 4, xp: 1000, title: 'Rhythm Striker' },
  { level: 5, xp: 1800, title: 'Velocity Scribe' },
  { level: 6, xp: 3000, title: 'Cadence Specialist' },
  { level: 7, xp: 4800, title: 'Speed Artisan' },
  { level: 8, xp: 7200, title: 'Hyper Typist' },
  { level: 9, xp: 10500, title: 'Keystroke Demon' },
  { level: 10, xp: 15000, title: 'Grandmaster Scribe' },
  { level: 12, xp: 22000, title: 'Tactile Prodigy' },
  { level: 15, xp: 35000, title: 'Cyber Prodigy' },
  { level: 20, xp: 60000, title: 'Apex Keyboardist' },
  { level: 25, xp: 100000, title: 'Godlike Velocity' },
];

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  name: string;
  multiplier: number;
  description: string;
  badgeClass: string;
}> = {
  easy: {
    name: 'Easy',
    multiplier: 0.8,
    description: 'Relaxed vocabulary, generous scoring multiplier (0.8x)',
    badgeClass: 'border-emerald-600 bg-emerald-50 text-emerald-800',
  },
  normal: {
    name: 'Normal',
    multiplier: 1.0,
    description: 'Standard benchmark corpus, standard score multiplier (1.0x)',
    badgeClass: 'border-[#141414] bg-[#F0EFEC] text-[#141414]',
  },
  hard: {
    name: 'Hard',
    multiplier: 1.5,
    description: 'Complex vocabulary, punctuation & numbers, high score bonus (1.5x)',
    badgeClass: 'border-amber-600 bg-amber-50 text-amber-900',
  },
  master: {
    name: 'Master',
    multiplier: 2.5,
    description: 'Mastery Sudden Death (instant fail on typo), max score bonus (2.5x)',
    badgeClass: 'border-red-600 bg-red-50 text-red-900',
  },
};

/**
 * Calculates current player level and XP progression details based on total accumulated XP.
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  let currentLevel = 1;
  let title = LEVEL_THRESHOLDS[0].title;
  let nextLevelTitle = LEVEL_THRESHOLDS[1]?.title || 'Apex Scribe';
  let xpForCurrentLevel = 0;
  let xpForNextLevel = LEVEL_THRESHOLDS[1].xp;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      title = LEVEL_THRESHOLDS[i].title;
      nextLevelTitle = LEVEL_THRESHOLDS[i + 1] ? LEVEL_THRESHOLDS[i + 1].title : 'Apex Scribe';
      xpForCurrentLevel = LEVEL_THRESHOLDS[i].xp;
      xpForNextLevel = LEVEL_THRESHOLDS[i + 1] ? LEVEL_THRESHOLDS[i + 1].xp : xpForCurrentLevel + 10000;
      break;
    }
  }

  const range = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const earnedInRange = Math.max(0, totalXp - xpForCurrentLevel);
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));

  return {
    level: currentLevel,
    title,
    nextLevelTitle,
    currentXp: totalXp,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
  };
}

export const getLevelFromXp = getLevelInfo;

/**
 * Computes the streak combo multiplier.
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 100) return 4.0;
  if (streak >= 50) return 3.0;
  if (streak >= 25) return 2.0;
  if (streak >= 10) return 1.5;
  return 1.0;
}

/**
 * Returns streak label & color styling.
 */
export function getStreakTier(streak: number): {
  label: string;
  color: string;
  isHigh: boolean;
} {
  if (streak >= 100) return { label: 'GODLIKE', color: 'text-purple-600', isHigh: true };
  if (streak >= 50) return { label: 'UNSTOPPABLE', color: 'text-red-600', isHigh: true };
  if (streak >= 25) return { label: 'BLAZING', color: 'text-amber-600', isHigh: true };
  if (streak >= 10) return { label: 'HOT STREAK', color: 'text-amber-500', isHigh: false };
  return { label: 'BUILDING', color: 'text-[#141414]', isHigh: false };
}

/**
 * Returns speed velocity tier.
 */
export function getSpeedTier(wpm: number): {
  label: string;
  tag: string;
  color: string;
} {
  if (wpm >= 120) return { label: 'HYPER-VELOCITY', tag: '120+ WPM', color: 'text-purple-600' };
  if (wpm >= 90) return { label: 'PRO PACE', tag: '90-119 WPM', color: 'text-emerald-600' };
  if (wpm >= 60) return { label: 'SWIFT CADENCE', tag: '60-89 WPM', color: 'text-blue-600' };
  if (wpm >= 35) return { label: 'STEADY RHYTHM', tag: '35-59 WPM', color: 'text-[#141414]' };
  return { label: 'WARMING UP', tag: '<35 WPM', color: 'text-[#141414] opacity-60' };
}

/**
 * Calculate dynamic live score increment for a typed character or completed word.
 */
export function calculateKeystrokeScore(
  isCharCorrect: boolean,
  currentStreak: number,
  liveWpm: number,
  difficulty: DifficultyLevel
): number {
  if (!isCharCorrect) return 0;
  
  const basePoints = 10;
  const streakMult = getStreakMultiplier(currentStreak);
  const speedBonus = liveWpm > 40 ? 1 + Math.min(1.5, (liveWpm - 40) / 100) : 1.0;
  const diffMult = DIFFICULTY_CONFIG[difficulty].multiplier;

  return Math.round(basePoints * streakMult * speedBonus * diffMult);
}

/**
 * Calculate bonus points on error-free word completion.
 */
export function calculateWordCompletionScore(
  wordLength: number,
  currentStreak: number,
  difficulty: DifficultyLevel
): number {
  const baseBonus = wordLength * 15;
  const streakMult = getStreakMultiplier(currentStreak);
  const diffMult = DIFFICULTY_CONFIG[difficulty].multiplier;
  return Math.round(baseBonus * streakMult * diffMult);
}
