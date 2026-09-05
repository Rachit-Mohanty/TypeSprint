import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { UserPreferences, TestResult, OverallStats, ThemeId } from '../types';
import { THEMES, ThemeConfig } from '../utils/themes';
import {
  loadSavedPreferences,
  savePreferences,
  computeOverallStats,
  saveTestResult,
  clearAllResultsFromStorage,
  loadResultsFromIndexedDB,
  getInitialResults,
} from '../utils/analytics';

export type TabType = 'home' | 'test' | 'code' | 'drills' | 'achievements' | 'analytics' | 'guide' | 'leaderboard';

export interface AppContextType {
  preferences: UserPreferences;
  theme: ThemeConfig;
  themeId: ThemeId;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  results: TestResult[];
  stats: OverallStats;
  addResult: (result: TestResult) => void;
  clearResults: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isRecentSessionsOpen: boolean;
  setIsRecentSessionsOpen: (open: boolean) => void;
  isCustomModalOpen: boolean;
  setIsCustomModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(loadSavedPreferences);
  const [results, setResults] = useState<TestResult[]>(getInitialResults);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isRecentSessionsOpen, setIsRecentSessionsOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // Background hydration from IndexedDB
  useEffect(() => {
    let isMounted = true;
    loadResultsFromIndexedDB()
      .then((idbResults) => {
        if (isMounted && idbResults && idbResults.length > 0) {
          setResults(idbResults);
        }
      })
      .catch((e) => console.warn('IndexedDB initial sync error:', e));

    return () => {
      isMounted = false;
    };
  }, []);

  const theme: ThemeConfig = useMemo(() => {
    return THEMES[preferences.theme] || THEMES.obsidian;
  }, [preferences.theme]);

  const stats: OverallStats = useMemo(() => {
    return computeOverallStats(results);
  }, [results]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  }, []);

  const addResult = useCallback((result: TestResult) => {
    const updated = saveTestResult(result);
    setResults(updated);
  }, []);

  const clearResults = useCallback(() => {
    clearAllResultsFromStorage().catch(console.error);
    setResults([]);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      preferences,
      theme,
      themeId: preferences.theme,
      updatePreferences,
      results,
      stats,
      addResult,
      clearResults,
      activeTab,
      setActiveTab,
      isRecentSessionsOpen,
      setIsRecentSessionsOpen,
      isCustomModalOpen,
      setIsCustomModalOpen,
    }),
    [
      preferences,
      theme,
      updatePreferences,
      results,
      stats,
      addResult,
      clearResults,
      activeTab,
      isRecentSessionsOpen,
      isCustomModalOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function useTheme(): ThemeConfig {
  const context = useContext(AppContext);
  return context ? context.theme : THEMES.obsidian;
}

export function usePreferences(): {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
} {
  const context = useContext(AppContext);
  if (!context) {
    return {
      preferences: loadSavedPreferences(),
      updatePreferences: () => {},
    };
  }
  return {
    preferences: context.preferences,
    updatePreferences: context.updatePreferences,
  };
}
