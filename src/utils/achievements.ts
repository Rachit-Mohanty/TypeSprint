import { Achievement, OverallStats, TestResult, UserPreferences } from '../types';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // SPEED BADGES
  {
    id: 'speed_50',
    title: 'Pace Setter',
    description: 'Reach a typing speed of 50+ WPM in any benchmark test.',
    category: 'speed',
    rarity: 'common',
    icon: '⚡',
    maxProgress: 50,
    rewardXp: 150,
  },
  {
    id: 'speed_80',
    title: 'Speed Demon',
    description: 'Break the sound barrier with 80+ WPM in a benchmark test.',
    category: 'speed',
    rarity: 'rare',
    icon: '🔥',
    maxProgress: 80,
    rewardXp: 350,
  },
  {
    id: 'speed_100',
    title: '100 WPM Club',
    description: 'Join the triple-digit elite by hitting 100+ WPM typing speed.',
    category: 'speed',
    rarity: 'epic',
    icon: '🚀',
    maxProgress: 100,
    rewardXp: 750,
  },
  {
    id: 'speed_120',
    title: 'Supersonic Scribe',
    description: 'Surpass 120+ WPM with lightning-fast tactile reflex.',
    category: 'speed',
    rarity: 'legendary',
    icon: '⚡👑',
    maxProgress: 120,
    rewardXp: 1500,
  },

  // ACCURACY BADGES
  {
    id: 'accuracy_flawless',
    title: 'Precision Master',
    description: 'Finish a full benchmark test with pristine 100% accuracy.',
    category: 'accuracy',
    rarity: 'epic',
    icon: '🎯',
    maxProgress: 100,
    rewardXp: 500,
  },
  {
    id: 'accuracy_sharpshooter',
    title: 'Sharpshooter',
    description: 'Maintain 98%+ accuracy across 5 distinct benchmark tests.',
    category: 'accuracy',
    rarity: 'rare',
    icon: '🏹',
    maxProgress: 5,
    rewardXp: 350,
  },
  {
    id: 'consistent_typer',
    title: 'Consistent Typer',
    description: 'Demonstrate perfect rhythmic pacing with 85%+ typing consistency score.',
    category: 'accuracy',
    rarity: 'rare',
    icon: '⏱️',
    maxProgress: 85,
    rewardXp: 400,
  },
  {
    id: 'confidence_pilot',
    title: 'No Regrets',
    description: 'Complete a test in Confidence Mode (no backspacing permitted).',
    category: 'accuracy',
    rarity: 'rare',
    icon: '🛡️',
    maxProgress: 1,
    rewardXp: 300,
  },

  // STREAK & COMBO BADGES
  {
    id: 'combo_25',
    title: 'Combo Spark',
    description: 'Chain together a flawless 25x keystroke combo streak.',
    category: 'streak',
    rarity: 'common',
    icon: '✨',
    maxProgress: 25,
    rewardXp: 200,
  },
  {
    id: 'combo_50',
    title: 'Streak Titan',
    description: 'Build a continuous 50x flawless keystroke combo streak.',
    category: 'streak',
    rarity: 'rare',
    icon: '⚔️',
    maxProgress: 50,
    rewardXp: 450,
  },
  {
    id: 'combo_100',
    title: 'Centurion Combo',
    description: 'Unstoppable flow: achieve a 100+ keystroke flawless streak.',
    category: 'streak',
    rarity: 'epic',
    icon: '💥',
    maxProgress: 100,
    rewardXp: 1000,
  },
  {
    id: 'daily_3',
    title: 'Daily Devotee',
    description: 'Maintain a continuous 3-day daily practice streak.',
    category: 'streak',
    rarity: 'common',
    icon: '📅',
    maxProgress: 3,
    rewardXp: 250,
  },
  {
    id: 'daily_7',
    title: 'Iron Habit',
    description: 'Log typing benchmarks for 7 consecutive days.',
    category: 'streak',
    rarity: 'epic',
    icon: '🏆',
    maxProgress: 7,
    rewardXp: 800,
  },
  {
    id: 'daily_10',
    title: '10-Day Streak',
    description: 'Maintain a continuous 10-day daily practice streak without interruption.',
    category: 'streak',
    rarity: 'legendary',
    icon: '🔥',
    maxProgress: 10,
    rewardXp: 1200,
  },

  // VOLUME & ENDURANCE BADGES
  {
    id: 'keystrokes_1000',
    title: '1,000 Keystrokes',
    description: 'Reach your first 1,000 cumulative keystrokes logged in tests.',
    category: 'volume',
    rarity: 'common',
    icon: '👆',
    maxProgress: 1000,
    rewardXp: 200,
  },
  {
    id: 'keystrokes_10000',
    title: '10,000 Keystrokes',
    description: 'Record 10,000 cumulative keystrokes across your typing benchmarks.',
    category: 'volume',
    rarity: 'epic',
    icon: '⌨️',
    maxProgress: 10000,
    rewardXp: 850,
  },
  {
    id: 'volume_5',
    title: 'First Flight',
    description: 'Complete your first 5 benchmark sessions.',
    category: 'volume',
    rarity: 'common',
    icon: '🌱',
    maxProgress: 5,
    rewardXp: 150,
  },
  {
    id: 'volume_25',
    title: 'Dedicated Veteran',
    description: 'Log 25 completed benchmark tests.',
    category: 'volume',
    rarity: 'rare',
    icon: '🏅',
    maxProgress: 25,
    rewardXp: 500,
  },
  {
    id: 'volume_100',
    title: 'Century Club',
    description: 'Log 100 completed typing tests into your performance history.',
    category: 'volume',
    rarity: 'legendary',
    icon: '💎',
    maxProgress: 100,
    rewardXp: 2000,
  },
  {
    id: 'marathon_120',
    title: 'Marathon Scribe',
    description: 'Conquer a full 120-second endurance benchmark without stopping.',
    category: 'volume',
    rarity: 'rare',
    icon: '🏃',
    maxProgress: 1,
    rewardXp: 400,
  },

  // MASTERY & ENTHUSIAST BADGES
  {
    id: 'master_survivor',
    title: 'Mastery Survivor',
    description: 'Survive and complete a test on Master Difficulty without a single typo.',
    category: 'mastery',
    rarity: 'legendary',
    icon: '☠️👑',
    maxProgress: 1,
    rewardXp: 1200,
  },
  {
    id: 'drill_champion',
    title: 'Drill Specialist',
    description: 'Launch and complete any targeted Speed Drill.',
    category: 'mastery',
    rarity: 'common',
    icon: '🎯',
    maxProgress: 1,
    rewardXp: 200,
  },
  {
    id: 'code_syntax_master',
    title: 'Code Scribe',
    description: 'Complete any syntax challenge in the Code Typing Studio.',
    category: 'mastery',
    rarity: 'rare',
    icon: '💻',
    maxProgress: 1,
    rewardXp: 400,
  },
  {
    id: 'custom_author',
    title: 'Custom Wordsmith',
    description: 'Import custom text and test yourself against your own passages.',
    category: 'enthusiast',
    rarity: 'common',
    icon: '📝',
    maxProgress: 1,
    rewardXp: 150,
  },
  {
    id: 'grandmaster_rank',
    title: 'Grandmaster Typist',
    description: 'Earn enough XP to achieve Player Level 10 or above.',
    category: 'mastery',
    rarity: 'epic',
    icon: '🌟',
    maxProgress: 10,
    rewardXp: 1000,
  },
];

const ACHIEVEMENTS_STORAGE_KEY = 'typesprint_unlocked_achievements_v1';

export function loadUnlockedAchievements(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedAchievements(unlockedMap: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockedMap));
  } catch {}
}

/**
 * Calculates current status and progress for all badges based on user stats and test history.
 */
export function computeUserAchievements(
  results: TestResult[],
  stats: OverallStats,
  preferences?: UserPreferences
): {
  achievements: Achievement[];
  totalUnlocked: number;
  totalAchievements: number;
  unlockedXp: number;
} {
  const storedUnlocked = loadUnlockedAchievements();
  const todayStr = new Date().toISOString().split('T')[0];
  const updatedUnlockedMap = { ...storedUnlocked };

  const bestWpm = stats.bestWpmOverall || 0;
  const highestStreak = stats.maxStreakOverall || 0;
  const highAccuracyTests = results.filter((r) => r.accuracy >= 98).length;
  const hasFlawlessTest = results.some((r) => r.accuracy === 100 && (r.duration >= 15 || r.charactersTyped >= 50));
  const hasConfidenceTest = results.some((r) => r.modeDetail?.toLowerCase().includes('no-bs') || (preferences?.confidenceMode && results.length > 0));
  const has120sTest = results.some((r) => r.mode === 'time' && (r.duration >= 115 || r.modeDetail?.includes('120')));
  const hasMasterSurvived = results.some((r) => r.difficulty === 'master' && r.accuracy >= 95);
  const hasDrillCompleted = results.some((r) => r.mode === 'drill');
  const hasCustomCompleted = results.some((r) => r.mode === 'custom');
  const hasCodeCompleted = results.some((r) => r.mode === 'code');
  const bestConsistency = results.length > 0 ? Math.max(...results.map((r) => r.consistency || 0)) : 0;
  const currentLevel = stats.playerLevel || 1;
  const totalKeystrokes = Math.max(
    (stats.totalWordsTyped || 0) * 5,
    Object.values(stats.allKeyStats || {}).reduce((sum, k) => sum + (k.total || 0), 0),
    results.reduce((sum, r) => sum + (r.charactersTyped || 0), 0)
  );

  const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    let progress = 0;
    let isUnlocked = false;

    switch (def.id) {
      case 'speed_50':
        progress = Math.min(50, bestWpm);
        isUnlocked = bestWpm >= 50;
        break;
      case 'speed_80':
        progress = Math.min(80, bestWpm);
        isUnlocked = bestWpm >= 80;
        break;
      case 'speed_100':
        progress = Math.min(100, bestWpm);
        isUnlocked = bestWpm >= 100;
        break;
      case 'speed_120':
        progress = Math.min(120, bestWpm);
        isUnlocked = bestWpm >= 120;
        break;

      case 'accuracy_flawless':
        progress = hasFlawlessTest ? 100 : (results.length > 0 ? Math.max(...results.map((r) => r.accuracy)) : 0);
        isUnlocked = hasFlawlessTest;
        break;
      case 'accuracy_sharpshooter':
        progress = Math.min(5, highAccuracyTests);
        isUnlocked = highAccuracyTests >= 5;
        break;
      case 'consistent_typer':
        progress = Math.min(85, Math.round(bestConsistency));
        isUnlocked = bestConsistency >= 85;
        break;
      case 'confidence_pilot':
        progress = hasConfidenceTest ? 1 : 0;
        isUnlocked = hasConfidenceTest;
        break;

      case 'combo_25':
        progress = Math.min(25, highestStreak);
        isUnlocked = highestStreak >= 25;
        break;
      case 'combo_50':
        progress = Math.min(50, highestStreak);
        isUnlocked = highestStreak >= 50;
        break;
      case 'combo_100':
        progress = Math.min(100, highestStreak);
        isUnlocked = highestStreak >= 100;
        break;
      case 'daily_3':
        progress = Math.min(3, stats.streakDays);
        isUnlocked = stats.streakDays >= 3;
        break;
      case 'daily_7':
        progress = Math.min(7, stats.streakDays);
        isUnlocked = stats.streakDays >= 7;
        break;
      case 'daily_10':
        progress = Math.min(10, stats.streakDays);
        isUnlocked = stats.streakDays >= 10;
        break;

      case 'keystrokes_1000':
        progress = Math.min(1000, totalKeystrokes);
        isUnlocked = totalKeystrokes >= 1000;
        break;
      case 'keystrokes_10000':
        progress = Math.min(10000, totalKeystrokes);
        isUnlocked = totalKeystrokes >= 10000;
        break;

      case 'volume_5':
        progress = Math.min(5, stats.totalTests);
        isUnlocked = stats.totalTests >= 5;
        break;
      case 'volume_25':
        progress = Math.min(25, stats.totalTests);
        isUnlocked = stats.totalTests >= 25;
        break;
      case 'volume_100':
        progress = Math.min(100, stats.totalTests);
        isUnlocked = stats.totalTests >= 100;
        break;
      case 'marathon_120':
        progress = has120sTest ? 1 : 0;
        isUnlocked = has120sTest;
        break;

      case 'master_survivor':
        progress = hasMasterSurvived ? 1 : 0;
        isUnlocked = hasMasterSurvived;
        break;
      case 'drill_champion':
        progress = hasDrillCompleted ? 1 : 0;
        isUnlocked = hasDrillCompleted;
        break;
      case 'code_syntax_master':
        progress = hasCodeCompleted ? 1 : 0;
        isUnlocked = hasCodeCompleted;
        break;
      case 'custom_author':
        progress = hasCustomCompleted ? 1 : 0;
        isUnlocked = hasCustomCompleted;
        break;
      case 'grandmaster_rank':
        progress = Math.min(10, currentLevel);
        isUnlocked = currentLevel >= 10;
        break;
    }

    if (isUnlocked && !updatedUnlockedMap[def.id]) {
      updatedUnlockedMap[def.id] = todayStr;
    }

    const unlockedAt = updatedUnlockedMap[def.id];

    return {
      ...def,
      progress,
      unlocked: isUnlocked || !!unlockedAt,
      unlockedAt,
    };
  });

  saveUnlockedAchievements(updatedUnlockedMap);

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const unlockedXp = achievements
    .filter((a) => a.unlocked)
    .reduce((acc, curr) => acc + curr.rewardXp, 0);

  return {
    achievements,
    totalUnlocked,
    totalAchievements: achievements.length,
    unlockedXp,
  };
}
