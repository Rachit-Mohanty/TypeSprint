/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useEffect, Suspense, lazy } from 'react';
import {
  TestMode,
  TimeOption,
  WordCountOption,
  UserPreferences,
  TestResult,
  OverallStats,
} from './types';
import { THEMES, applyThemeCssVariables } from './utils/themes';
import {
  loadSavedResults,
  saveTestResult,
  loadSavedPreferences,
  savePreferences,
  computeOverallStats,
} from './utils/analytics';
import { Navbar } from './components/Navbar';
import { TestSettingsBar } from './components/TestSettingsBar';
import { TypingArea } from './components/TypingArea';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ResultModal } from './components/ResultModal';
import { LandingView } from './components/LandingView';
import { generateWeakKeyDrill } from './data/wordLists';
import { useAppStore } from './store/useAppStore';

// Lazy Loaded Non-Critical Route Components for optimized bundle size and fast initial paint
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const CodeTypingView = lazy(() => import('./components/CodeTypingView').then((m) => ({ default: m.CodeTypingView })));
const SpeedDrillsView = lazy(() => import('./components/SpeedDrillsView').then((m) => ({ default: m.SpeedDrillsView })));
const Achievements = lazy(() => import('./components/Achievements').then((m) => ({ default: m.Achievements })));
const LeaderboardView = lazy(() => import('./components/LeaderboardView').then((m) => ({ default: m.LeaderboardView })));
const TouchTypingGuideView = lazy(() => import('./components/TouchTypingGuideView').then((m) => ({ default: m.TouchTypingGuideView })));
const CustomTextModal = lazy(() => import('./components/CustomTextModal').then((m) => ({ default: m.CustomTextModal })));
const RecentSessionsDrawer = lazy(() => import('./components/RecentSessionsDrawer').then((m) => ({ default: m.RecentSessionsDrawer })));
const ThemeCustomizerModal = lazy(() => import('./components/ThemeCustomizerModal').then((m) => ({ default: m.ThemeCustomizerModal })));

// Minimalist lazy loading fallback placeholder
const ComponentLoader: React.FC<{ label?: string }> = ({ label = 'Loading module...' }) => (
  <div className="w-full h-72 flex flex-col items-center justify-center gap-3 text-xs font-mono opacity-70 animate-pulse">
    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    <span>{label}</span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'test' | 'code' | 'drills' | 'leaderboard' | 'achievements' | 'analytics' | 'guide'>('home');
  const [preferences, setPreferences] = useState<UserPreferences>(loadSavedPreferences);
  const [results, setResults] = useState<TestResult[]>(loadSavedResults);

  // Zustand Store Integration
  const customThemeColors = useAppStore((s) => s.customThemeColors);
  const setCustomThemeColors = useAppStore((s) => s.setCustomThemeColors);

  // Test setup
  const [mode, setMode] = useState<TestMode>('time');
  const [timeOption, setTimeOption] = useState<TimeOption>(30);
  const [wordCountOption, setWordCountOption] = useState<WordCountOption>(25);
  const [customText, setCustomText] = useState<string>('');
  const [drillWords, setDrillWords] = useState<string[]>([]);
  const [drillTitle, setDrillTitle] = useState<string>('');

  // Live session states
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [targetKey, setTargetKey] = useState<string>('');
  const [isTypingActive, setIsTypingActive] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isRecentSessionsOpen, setIsRecentSessionsOpen] = useState<boolean>(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState<boolean>(false);

  // Derived theme config
  const theme = THEMES[preferences.theme] || THEMES.obsidian;

  // Apply dynamic CSS variables on mount or when theme/colors change
  useEffect(() => {
    applyThemeCssVariables(theme, customThemeColors);
  }, [theme, customThemeColors]);

  // Compute aggregated stats
  const stats: OverallStats = useMemo(() => computeOverallStats(results), [results]);

  // Update preferences helper
  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  };

  // Test completion handler
  const handleFinishTest = useCallback((result: TestResult) => {
    const updated = saveTestResult(result);
    setResults(updated);
    setLatestResult(result);
    setIsTypingActive(false);
  }, []);

  // Restart / Next Test handler
  const handleRestartTest = useCallback(() => {
    setLatestResult(null);
  }, []);

  // Launch test from landing page
  const handleStartTestFromLanding = (newMode: 'time' | 'words' = 'time', option?: number) => {
    setMode(newMode);
    if (newMode === 'time' && option) {
      setTimeOption(option as TimeOption);
    } else if (newMode === 'words' && option) {
      setWordCountOption(option as WordCountOption);
    }
    setDrillWords([]);
    setDrillTitle('');
    setLatestResult(null);
    setActiveTab('test');
  };

  // Launch custom speed drill
  const handleLaunchDrill = (words: string[], title: string) => {
    setDrillWords(words);
    setDrillTitle(title);
    setMode('drill');
    setLatestResult(null);
    setActiveTab('test');
  };

  // Practice specific weak keys from Analytics or Results
  const handlePracticeWeakKeys = (keys: string[]) => {
    const drill = generateWeakKeyDrill(keys, 25);
    handleLaunchDrill(drill, `Weak Keys: ${keys.join(', ').toUpperCase()}`);
  };

  // Launch code snippet practice
  const handleLaunchCodeSnippet = (code: string, snippetTitle: string) => {
    setCustomText(code);
    setDrillWords([]);
    setDrillTitle(`Code: ${snippetTitle}`);
    setMode('code');
    setLatestResult(null);
    setActiveTab('test');
  };

  // Retest past session from drawer
  const handleRetestSession = (testMode: TestMode, option?: number, snippetText?: string) => {
    setMode(testMode);
    if (testMode === 'time' && option) setTimeOption(option as TimeOption);
    if (testMode === 'words' && option) setWordCountOption(option as WordCountOption);
    if (snippetText) {
      setCustomText(snippetText);
    } else {
      setCustomText('');
    }
    setDrillWords([]);
    setDrillTitle('');
    setLatestResult(null);
    setActiveTab('test');
    setIsRecentSessionsOpen(false);
  };

  // Clear all saved history
  const handleClearHistory = () => {
    localStorage.removeItem('typesprint_test_results_v1');
    setResults([]);
    setLatestResult(null);
  };

  // Handle custom text submission
  const handleApplyCustomText = (text: string) => {
    setCustomText(text);
    setMode('custom');
    setLatestResult(null);
    setActiveTab('test');
  };

  return (
    <div
      id="app-root-wrapper"
      className={`min-h-screen min-h-[100dvh] ${theme.bg} ${theme.textPrimary} flex flex-col transition-colors duration-300 antialiased overflow-x-hidden`}
    >
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setLatestResult(null);
        }}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        streakDays={stats.streakDays}
        isTypingActive={isTypingActive && activeTab === 'test' && !latestResult}
        onOpenRecentSessions={() => setIsRecentSessionsOpen(true)}
        recentSessionsCount={results.length}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
      />

      {/* Main Content Body */}
      <main id="main-content-view" className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-col">
        {/* Landing Page (Overview) */}
        {activeTab === 'home' && (
          <LandingView
            theme={theme}
            preferences={preferences}
            stats={stats}
            onUpdatePreferences={handleUpdatePreferences}
            onStartTest={handleStartTestFromLanding}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setLatestResult(null);
            }}
            onLaunchDrill={handleLaunchDrill}
            onOpenRecentSessions={() => setIsRecentSessionsOpen(true)}
            recentSessionsCount={results.length}
          />
        )}

        {activeTab === 'test' && (
          <div className="flex flex-col gap-4 sm:gap-6 items-center justify-center w-full my-auto py-2 sm:py-4">
            {/* Mode & Time Settings Bar */}
            {!latestResult && (
              <TestSettingsBar
                mode={mode}
                setMode={(m) => {
                  setMode(m);
                  setLatestResult(null);
                }}
                timeOption={timeOption}
                setTimeOption={(t) => {
                  setTimeOption(t);
                  setLatestResult(null);
                }}
                wordCountOption={wordCountOption}
                setWordCountOption={(c) => {
                  setWordCountOption(c);
                  setLatestResult(null);
                }}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                theme={theme}
                disabled={isTypingActive}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}

            {/* Drill banner indicator */}
            {!latestResult && mode === 'drill' && drillTitle && (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} ${theme.textPrimary} text-xs font-mono animate-fade-in shadow-xs`}>
                <span>Drill: <strong>{drillTitle}</strong></span>
                <button
                  onClick={() => setMode('time')}
                  className={`text-xs ${theme.accent} hover:underline ml-2 font-medium`}
                >
                  Exit Drill
                </button>
              </div>
            )}

            {/* Either Result Summary Screen or Active Typing Area */}
            {latestResult ? (
              <ResultModal
                result={latestResult}
                bestWpmOverall={stats.bestWpmOverall}
                theme={theme}
                onRestart={handleRestartTest}
                onPracticeMissedKeys={handlePracticeWeakKeys}
                onLaunchCustomDrill={handleLaunchDrill}
              />
            ) : (
              <>
                <TypingArea
                  key={`${mode}-${timeOption}-${wordCountOption}-${drillTitle}-${customText.length}`}
                  mode={mode}
                  timeOption={timeOption}
                  wordCountOption={wordCountOption}
                  customText={customText}
                  drillWords={drillWords}
                  drillTitle={drillTitle}
                  preferences={preferences}
                  theme={theme}
                  onFinishTest={handleFinishTest}
                  onTargetKeyChange={setTargetKey}
                  onTypingStatusChange={setIsTypingActive}
                />

                {/* Optional Virtual Keyboard */}
                {preferences.showKeyboard && (
                  <VirtualKeyboard
                    targetKey={targetKey}
                    theme={theme}
                    showFingerGuide={preferences.showKeyFingerGuide}
                    layout={preferences.keyboardLayout || 'qwerty'}
                    onSelectLayout={(newLayout) => handleUpdatePreferences({ keyboardLayout: newLayout })}
                    keyStats={stats.allKeyStats}
                    showHeatmap={false}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Code Typing Studio Tab */}
        {activeTab === 'code' && (
          <Suspense fallback={<ComponentLoader label="Loading Code Typing Studio..." />}>
            <CodeTypingView
              theme={theme}
              stats={stats}
              onLaunchCodeTest={handleLaunchCodeSnippet}
            />
          </Suspense>
        )}

        {/* Speed Drills Tab */}
        {activeTab === 'drills' && (
          <Suspense fallback={<ComponentLoader label="Loading Speed Drills..." />}>
            <SpeedDrillsView
              stats={stats}
              theme={theme}
              onLaunchDrill={handleLaunchDrill}
            />
          </Suspense>
        )}

        {/* Achievements & Gamification Badges Tab */}
        {activeTab === 'achievements' && (
          <Suspense fallback={<ComponentLoader label="Loading Badges & XP..." />}>
            <Achievements
              results={results}
              stats={stats}
              preferences={preferences}
              theme={theme}
              onStartPractice={(mode) => {
                if (mode === 'code') {
                  setActiveTab('code');
                } else if (mode === 'drill') {
                  setActiveTab('drills');
                } else {
                  setActiveTab('test');
                  setMode('time');
                  setTimeOption(30);
                }
                setLatestResult(null);
              }}
            />
          </Suspense>
        )}

        {/* Global Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Suspense fallback={<ComponentLoader label="Loading Global Leaderboard..." />}>
            <LeaderboardView
              theme={theme}
              stats={stats}
            />
          </Suspense>
        )}

        {/* Analytics & Progress Tab */}
        {activeTab === 'analytics' && (
          <Suspense fallback={<ComponentLoader label="Loading Biomechanical Analytics..." />}>
            <AnalyticsView
              results={results}
              stats={stats}
              theme={theme}
              onClearHistory={handleClearHistory}
              onSelectDrillFromWeakKey={(key) => handlePracticeWeakKeys([key])}
            />
          </Suspense>
        )}

        {/* Touch Typing Guide Tab */}
        {activeTab === 'guide' && (
          <Suspense fallback={<ComponentLoader label="Loading Touch Typing Guide..." />}>
            <TouchTypingGuideView
              theme={theme}
              onLaunchPractice={() => {
                setActiveTab('test');
                setLatestResult(null);
              }}
            />
          </Suspense>
        )}
      </main>

      {/* Recent Sessions Sliding Drawer */}
      <Suspense fallback={null}>
        <RecentSessionsDrawer
          isOpen={isRecentSessionsOpen}
          onClose={() => setIsRecentSessionsOpen(false)}
          results={results}
          latestResult={latestResult}
          theme={theme}
          onSelectResultForInspection={(res) => {
            setLatestResult(res);
            setActiveTab('test');
            setIsRecentSessionsOpen(false);
          }}
          onRetestSession={handleRetestSession}
          onClearHistory={handleClearHistory}
        />
      </Suspense>

      {/* Custom Text Modal */}
      <Suspense fallback={null}>
        <CustomTextModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onApplyText={handleApplyCustomText}
          theme={theme}
        />
      </Suspense>

      {/* Custom Theme Color Customizer Modal */}
      <Suspense fallback={null}>
        <ThemeCustomizerModal
          isOpen={isThemeCustomizerOpen}
          onClose={() => setIsThemeCustomizerOpen(false)}
          customColors={customThemeColors}
          onUpdateCustomColors={setCustomThemeColors}
          onSelectTheme={(themeId) => handleUpdatePreferences({ theme: themeId })}
        />
      </Suspense>

      {/* Footer */}
      <footer
        id="app-footer"
        className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 text-xs font-mono flex flex-wrap items-center justify-between gap-2 border-t ${theme.borderSubtle} ${theme.textMuted} transition-opacity duration-300 select-none ${
          isTypingActive ? 'opacity-0 pointer-events-none' : 'opacity-80'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight">TypeSprint</span>
          <span>•</span>
          <span className="hidden sm:inline">Tactile Speed &amp; Accuracy</span>
        </div>
        {activeTab === 'home' ? (
          <div className="flex items-center gap-3 text-[11px]">
            <a href="#landing-features" className="hover:underline">Features</a>
            <a href="#landing-acoustics" className="hover:underline">Acoustics</a>
            <a href="#landing-keymaps" className="hover:underline">Layouts</a>
            <a href="#landing-drills" className="hover:underline">Drills</a>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span><kbd className={`px-1.5 py-0.5 rounded border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>tab</kbd> to restart</span>
          </div>
        )}
      </footer>
    </div>
  );
}
