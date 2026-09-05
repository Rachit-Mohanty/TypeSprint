import { FingerInfo, KeyStat, OverallStats, TestResult, UserPreferences, WpmDataPoint } from '../types';
import { getLevelInfo } from './gamification';
import { safeValidatePreferences } from './schemas';
import {
  getInitialResults,
  loadResultsFromIndexedDB,
  saveResultToIndexedDB,
  clearAllResultsFromStorage,
  getPersonalBestForSnippet,
} from './indexedDbStorage';

export {
  getInitialResults,
  loadResultsFromIndexedDB,
  saveResultToIndexedDB,
  clearAllResultsFromStorage,
  getPersonalBestForSnippet,
};

const STORAGE_KEY_PREFS = 'typesprint_user_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'professional',
  keyboardLayout: 'qwerty',
  sound: 'thock',
  soundVolume: 0.6,
  caretStyle: 'smooth',
  showKeyboard: true,
  showLiveWpm: true,
  showLiveAccuracy: true,
  showLiveTimer: true,
  showKeyFingerGuide: true,
  suddenDeath: false,
  confidenceMode: false,
  includeNumbers: false,
  includePunctuation: false,
  dailyGoalTests: 5,
  difficulty: 'normal',
  floatingTicker: true,
  pacingGhost: true,
  ghostPaceWpm: 0,
};

export const FINGER_MAPPING: Record<string, FingerInfo> = {
  // Left Pinky
  '`': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '~': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '1': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '!': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'a': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'A': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },

  // Left Ring
  '2': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  '@': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'w': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'W': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  's': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'S': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'x': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'X': { name: 'Left Ring', hand: 'left', color: '#f97316' },

  // Left Middle
  '3': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '#': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'e': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'E': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'd': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'D': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'c': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'C': { name: 'Left Middle', hand: 'left', color: '#eab308' },

  // Left Index
  '4': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '$': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '5': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '%': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'r': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'R': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  't': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'T': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'f': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'F': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'g': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'G': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'v': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'V': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'b': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'B': { name: 'Left Index', hand: 'left', color: '#22c55e' },

  // Thumbs
  ' ': { name: 'Thumb', hand: 'left', color: '#a855f7' },

  // Right Index
  '6': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  '^': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  '7': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  '&': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'y': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'Y': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'u': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'U': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'h': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'H': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'j': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'J': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'n': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'N': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'm': { name: 'Right Index', hand: 'right', color: '#06b6d4' },
  'M': { name: 'Right Index', hand: 'right', color: '#06b6d4' },

  // Right Middle
  '8': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  '*': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  'i': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  'I': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  'k': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  'K': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  ',': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },
  '<': { name: 'Right Middle', hand: 'right', color: '#3b82f6' },

  // Right Ring
  '9': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  '(': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  'o': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  'O': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  'l': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  'L': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  '.': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },
  '>': { name: 'Right Ring', hand: 'right', color: '#8b5cf6' },

  // Right Pinky
  '0': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  ')': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '-': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '_': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '=': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '+': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  'p': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  'P': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '[': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '{': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  ']': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '}': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '\\': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '|': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  ';': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  ':': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  "'": { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '"': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '/': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
  '?': { name: 'Right Pinky', hand: 'right', color: '#ec4899' },
};

export function calculateWpm(correctChars: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  const words = correctChars / 5;
  const minutes = timeSeconds / 60;
  return Math.max(0, Math.round(words / minutes));
}

export function calculateRawWpm(totalTypedChars: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  const words = totalTypedChars / 5;
  const minutes = timeSeconds / 60;
  return Math.max(0, Math.round(words / minutes));
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((correctChars / totalChars) * 1000) / 10));
}

export function calculateConsistency(timeline: WpmDataPoint[]): number {
  if (timeline.length < 3) return 100;
  const wpms = timeline.map(t => t.wpm);
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  if (mean === 0) return 100;
  
  const variance = wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;
  
  // High consistency means low coefficient of variation
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 * (1 - coefficientOfVariation))));
  return consistencyScore;
}

export function loadSavedResults(): TestResult[] {
  return getInitialResults();
}

export function saveTestResult(result: TestResult): TestResult[] {
  const existing = getInitialResults();
  const updated = [result, ...existing.filter((r) => r.id !== result.id)];
  // Non-blocking IndexedDB persistence
  saveResultToIndexedDB(result).catch((err) => {
    console.warn('Error saving to IndexedDB:', err);
  });
  return updated;
}

export function loadSavedPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return safeValidatePreferences(parsed, DEFAULT_PREFERENCES);
  } catch (e) {
    console.warn('Failed to parse user preferences from storage, using defaults:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

export function computeOverallStats(results: TestResult[]): OverallStats {
  if (results.length === 0) {
    const defaultLevel = getLevelInfo(0);
    return {
      totalTests: 0,
      totalTimeSeconds: 0,
      totalWordsTyped: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      bestWpm15s: 0,
      bestWpm30s: 0,
      bestWpm60s: 0,
      bestWpmOverall: 0,
      streakDays: 0,
      lastTestDate: '',
      allKeyStats: {},
      totalScore: 0,
      highScore: 0,
      totalXp: 0,
      playerLevel: defaultLevel.level,
      levelTitle: defaultLevel.title,
      maxStreakOverall: 0,
      highestStreak: 0,
    };
  }

  let totalTime = 0;
  let totalWords = 0;
  let sumWpm = 0;
  let sumAcc = 0;
  let best15 = 0;
  let best30 = 0;
  let best60 = 0;
  let bestOverall = 0;
  let totalScore = 0;
  let highScore = 0;
  let totalXp = 0;
  let maxStreakOverall = 0;
  const combinedKeyStats: Record<string, KeyStat> = {};

  const datesSet = new Set<string>();

  for (const r of results) {
    totalTime += r.duration || 0;
    totalWords += Math.round((r.correctChars || 0) / 5);
    sumWpm += r.wpm;
    sumAcc += r.accuracy;

    // Gamification aggregates
    const rScore = r.score || Math.round((r.correctChars || 0) * 10 * (r.wpm > 40 ? 1 + (r.wpm - 40) / 100 : 1));
    const rXp = r.xpEarned || Math.round(rScore / 5);
    totalScore += rScore;
    if (rScore > highScore) highScore = rScore;
    totalXp += rXp;
    if (r.maxStreak && r.maxStreak > maxStreakOverall) {
      maxStreakOverall = r.maxStreak;
    }

    if (r.wpm > bestOverall) bestOverall = r.wpm;

    if (r.modeDetail.includes('15') && r.wpm > best15) best15 = r.wpm;
    if (r.modeDetail.includes('30') && r.wpm > best30) best30 = r.wpm;
    if (r.modeDetail.includes('60') && r.wpm > best60) best60 = r.wpm;

    const dateStr = new Date(r.timestamp).toISOString().split('T')[0];
    datesSet.add(dateStr);

    if (r.keyStats) {
      for (const [key, stat] of Object.entries(r.keyStats)) {
        const lowerKey = key.toLowerCase();
        if (!combinedKeyStats[lowerKey]) {
          combinedKeyStats[lowerKey] = { total: 0, errors: 0, totalLatencyMs: 0 };
        }
        combinedKeyStats[lowerKey].total += stat.total;
        combinedKeyStats[lowerKey].errors += stat.errors;
        combinedKeyStats[lowerKey].totalLatencyMs += stat.totalLatencyMs || 0;
      }
    }
  }

  const levelInfo = getLevelInfo(totalXp);

  // Calculate streak
  const sortedDates = Array.from(datesSet).sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    let checkDate = new Date();
    if (!sortedDates.includes(today)) {
      checkDate = new Date(Date.now() - 86400000);
    }
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    totalTests: results.length,
    totalTimeSeconds: totalTime,
    totalWordsTyped: totalWords,
    averageWpm: Math.round(sumWpm / results.length),
    averageAccuracy: Math.round((sumAcc / results.length) * 10) / 10,
    bestWpm15s: best15,
    bestWpm30s: best30,
    bestWpm60s: best60,
    bestWpmOverall: bestOverall,
    streakDays: streak,
    lastTestDate: sortedDates[0] || '',
    allKeyStats: combinedKeyStats,
    totalScore,
    highScore,
    totalXp,
    playerLevel: levelInfo.level,
    levelTitle: levelInfo.title,
    maxStreakOverall,
    highestStreak: maxStreakOverall,
  };
}

export function extractWeakKeys(keyStats: Record<string, KeyStat>, limit: number = 5): { key: string; accuracy: number; total: number }[] {
  const list: { key: string; accuracy: number; total: number }[] = [];
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  for (const char of alphabet) {
    const stat = keyStats[char];
    if (stat && stat.total >= 3) {
      const accuracy = Math.round(((stat.total - stat.errors) / stat.total) * 100);
      if (accuracy < 96) {
        list.push({ key: char, accuracy, total: stat.total });
      }
    }
  }

  return list.sort((a, b) => a.accuracy - b.accuracy).slice(0, limit);
}
