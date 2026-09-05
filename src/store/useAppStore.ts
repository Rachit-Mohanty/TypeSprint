import { create } from 'zustand';
import {
  TestMode,
  TimeOption,
  WordCountOption,
  DifficultyLevel,
  UserPreferences,
  TestResult,
  OverallStats,
  CustomThemeColors,
} from '../types';
import {
  loadSavedPreferences,
  savePreferences,
  computeOverallStats,
  getInitialResults,
} from '../utils/analytics';
import { DEFAULT_CUSTOM_THEME, THEMES, applyThemeCssVariables } from '../utils/themes';

export type TabType =
  | 'home'
  | 'test'
  | 'code'
  | 'drills'
  | 'achievements'
  | 'analytics'
  | 'guide'
  | 'leaderboard';

export interface TestConfigState {
  mode: TestMode;
  timeOption: TimeOption;
  wordCountOption: WordCountOption;
  difficulty: DifficultyLevel;
  customText: string;
  drillWords: string[];
  drillTitle: string;
}

export interface LiveStatsState {
  liveWpm: number;
  liveRawWpm: number;
  liveAccuracy: number;
  currentStreak: number;
  liveScore: number;
  isTypingActive: boolean;
  targetKey: string;
}

export interface ModalVisibilityState {
  isCustomModalOpen: boolean;
  isRecentSessionsOpen: boolean;
  isThemeCustomizerOpen: boolean;
}

export interface GhostRacingState {
  isEnabled: boolean;
  ghostPaceWpm: number;
  racingMode: 'pb' | 'target';
  personalBestReplay: TestResult | null;
}

export interface AppStoreState {
  // Test Configuration
  testConfig: TestConfigState;
  setTestConfig: (updates: Partial<TestConfigState>) => void;
  resetTestConfig: () => void;

  // Live Typing Stats
  liveStats: LiveStatsState;
  setLiveStats: (updates: Partial<LiveStatsState>) => void;
  resetLiveStats: () => void;

  // Modal Visibility
  modals: ModalVisibilityState;
  setModalVisibility: (updates: Partial<ModalVisibilityState>) => void;

  // Active Navigation Tab
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Ghost Racing
  ghostRacing: GhostRacingState;
  setGhostRacing: (updates: Partial<GhostRacingState>) => void;

  // Preferences & Themes
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  customThemeColors: CustomThemeColors;
  setCustomThemeColors: (colors: Partial<CustomThemeColors>) => void;

  // Results & Stats
  results: TestResult[];
  stats: OverallStats;
  setResults: (results: TestResult[]) => void;
  addResult: (result: TestResult) => void;
  clearResults: () => void;
}

const initialPreferences: UserPreferences = loadSavedPreferences();
const initialResults: TestResult[] = getInitialResults();
const initialStats: OverallStats = computeOverallStats(initialResults);

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Test Configuration
  testConfig: {
    mode: 'time',
    timeOption: 30,
    wordCountOption: 25,
    difficulty: initialPreferences.difficulty || 'normal',
    customText: '',
    drillWords: [],
    drillTitle: '',
  },
  setTestConfig: (updates) =>
    set((state) => ({
      testConfig: { ...state.testConfig, ...updates },
    })),
  resetTestConfig: () =>
    set((state) => ({
      testConfig: {
        mode: 'time',
        timeOption: 30,
        wordCountOption: 25,
        difficulty: state.preferences.difficulty || 'normal',
        customText: '',
        drillWords: [],
        drillTitle: '',
      },
    })),

  // Live Typing Stats
  liveStats: {
    liveWpm: 0,
    liveRawWpm: 0,
    liveAccuracy: 100,
    currentStreak: 0,
    liveScore: 0,
    isTypingActive: false,
    targetKey: '',
  },
  setLiveStats: (updates) =>
    set((state) => ({
      liveStats: { ...state.liveStats, ...updates },
    })),
  resetLiveStats: () =>
    set({
      liveStats: {
        liveWpm: 0,
        liveRawWpm: 0,
        liveAccuracy: 100,
        currentStreak: 0,
        liveScore: 0,
        isTypingActive: false,
        targetKey: '',
      },
    }),

  // Modal Visibility
  modals: {
    isCustomModalOpen: false,
    isRecentSessionsOpen: false,
    isThemeCustomizerOpen: false,
  },
  setModalVisibility: (updates) =>
    set((state) => ({
      modals: { ...state.modals, ...updates },
    })),

  // Navigation Tab
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Ghost Racing
  ghostRacing: {
    isEnabled: initialPreferences.pacingGhost ?? true,
    ghostPaceWpm: initialPreferences.ghostPaceWpm || 0,
    racingMode: initialPreferences.ghostRacingMode || 'pb',
    personalBestReplay: null,
  },
  setGhostRacing: (updates) =>
    set((state) => ({
      ghostRacing: { ...state.ghostRacing, ...updates },
    })),

  // Preferences & Themes
  preferences: initialPreferences,
  updatePreferences: (updates) => {
    const current = get().preferences;
    const updated = { ...current, ...updates };
    savePreferences(updated);

    const theme = THEMES[updated.theme] || THEMES.obsidian;
    applyThemeCssVariables(theme, get().customThemeColors);

    set({ preferences: updated });
  },

  customThemeColors: DEFAULT_CUSTOM_THEME,
  setCustomThemeColors: (colors) => {
    const updated = { ...get().customThemeColors, ...colors };
    const theme = THEMES[get().preferences.theme] || THEMES.obsidian;
    applyThemeCssVariables(theme, updated);
    set({ customThemeColors: updated });
  },

  // Results & Stats
  results: initialResults,
  stats: initialStats,
  setResults: (results) => {
    const stats = computeOverallStats(results);
    set({ results, stats });
  },
  addResult: (result) => {
    const current = get().results;
    const updated = [result, ...current.slice(0, 499)];
    const stats = computeOverallStats(updated);
    set({ results: updated, stats });
  },
  clearResults: () => {
    set({
      results: [],
      stats: computeOverallStats([]),
    });
  },
}));
