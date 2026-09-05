import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  Zap,
  BarChart3,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  Play,
  Crosshair,
  Award,
  CheckCircle2,
  Code2,
  Cpu,
  Activity,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Timer,
  History,
  Trophy,
} from 'lucide-react';
import { ThemeConfig } from '../utils/themes';
import { UserPreferences, KeyboardLayout, SoundType, OverallStats } from '../types';
import { SOUND_PROFILES, playKeySound } from '../utils/sound';
import { KEYBOARD_LAYOUTS } from '../utils/layouts';

interface LandingViewProps {
  theme: ThemeConfig;
  preferences: UserPreferences;
  stats: OverallStats;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onStartTest: (mode?: 'time' | 'words', option?: number) => void;
  onNavigateTab: (tab: 'test' | 'code' | 'drills' | 'achievements' | 'analytics' | 'guide') => void;
  onLaunchDrill: (words: string[], drillTitle: string) => void;
  onOpenRecentSessions?: () => void;
  recentSessionsCount?: number;
}

const HERO_DEMO_TEXT = 'flow through keys with effortless rhythm';

export const LandingView: React.FC<LandingViewProps> = ({
  theme,
  preferences,
  stats,
  onUpdatePreferences,
  onStartTest,
  onNavigateTab,
  onLaunchDrill,
  onOpenRecentSessions,
  recentSessionsCount = 0,
}) => {
  // Hero interactive micro-typing state
  const [heroInput, setHeroInput] = useState<string>('');
  const [heroActiveSound, setHeroActiveSound] = useState<SoundType>(
    preferences.sound === 'off' ? 'thock' : preferences.sound
  );
  const [heroSelectedLayout, setHeroSelectedLayout] = useState<KeyboardLayout>(
    preferences.keyboardLayout || 'qwerty'
  );
  const [demoLastLatency, setDemoLastLatency] = useState<number | null>(null);
  const [demoCharCount, setDemoCharCount] = useState<number>(0);
  const lastKeyTimestampRef = useRef<number>(Date.now());
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Focus hero input on mount for immediate tactile exploration
  useEffect(() => {
    const timer = setTimeout(() => {
      heroInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const now = Date.now();
    const latency = now - lastKeyTimestampRef.current;
    lastKeyTimestampRef.current = now;

    if (val.length > heroInput.length) {
      const addedChar = val[val.length - 1];
      const isSpace = addedChar === ' ';
      const isError =
        val.length <= HERO_DEMO_TEXT.length &&
        HERO_DEMO_TEXT.slice(0, val.length) !== val;

      if (heroActiveSound !== 'off') {
        playKeySound(heroActiveSound, preferences.soundVolume || 0.6, isSpace, isError);
      }
      setDemoLastLatency(Math.min(999, Math.max(15, latency)));
      setDemoCharCount((c) => c + 1);
    }

    setHeroInput(val);
  };

  const handleSwitchSoundPreview = (soundId: SoundType) => {
    setHeroActiveSound(soundId);
    onUpdatePreferences({ sound: soundId });
    if (soundId !== 'off') {
      playKeySound(soundId, preferences.soundVolume || 0.6, false, false);
    }
  };

  const activeLayoutConfig = KEYBOARD_LAYOUTS[heroSelectedLayout] || KEYBOARD_LAYOUTS.qwerty;

  return (
    <div id="landing-view-root" className="w-full flex flex-col gap-8 sm:gap-12 py-2 sm:py-4 animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION: Clean, Typographic & Interactive             */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-hero" className="flex flex-col items-center text-center max-w-4xl mx-auto px-2 sm:px-4">
        {/* Release Pill Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.cardBg} border ${theme.borderSubtle} text-xs font-mono mb-4 shadow-xs`}>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.accentBg} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.accentBg}`} />
          </span>
          <span className={theme.textPrimary}>v2.4 Telemetry Engine</span>
          <span className={theme.textMuted}>•</span>
          <span className={theme.textSecondary}>Instant Latency Diagnostics</span>
        </div>

        {/* Hero Title */}
        <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${theme.textPrimary} leading-[1.1] max-w-3xl`}>
          Precision Muscle Memory.
          <span className="block mt-1 sm:mt-2 opacity-90 font-light italic">
            Engineered for Flow.
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`mt-3 sm:mt-4 text-sm sm:text-base ${theme.textSecondary} max-w-2xl leading-relaxed font-normal`}>
          A minimalist typing trainer with real-time mechanical switch acoustics,
          multi-layout ergonomics for QWERTY, Colemak, and Dvorak, and per-key error isolation.
        </p>

        {/* Call to Actions */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto font-mono">
          <button
            id="hero-start-typing-btn"
            onClick={() => onStartTest('time', 30)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs sm:text-sm font-medium shadow-sm hover:opacity-90 active:scale-[0.98] transition-all`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Typing Test</span>
          </button>

          <button
            id="hero-quick-sprint-btn"
            onClick={() => onStartTest('time', 15)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-zinc-500 ${theme.textPrimary} text-xs sm:text-sm font-medium transition-all`}
          >
            <Timer className="w-4 h-4 text-amber-500" />
            <span>15s Sprint</span>
          </button>

          <button
            id="hero-drills-btn"
            onClick={() => onNavigateTab('drills')}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${theme.cardBgSubtle} ${theme.textSecondary} hover:${theme.textPrimary} text-xs sm:text-sm font-medium transition-all`}
          >
            <Zap className="w-4 h-4" />
            <span>Speed Drills</span>
          </button>

          {onOpenRecentSessions && (
            <button
              id="hero-recent-sessions-btn"
              onClick={onOpenRecentSessions}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-amber-400 ${theme.textPrimary} text-xs sm:text-sm font-medium transition-all shadow-xs`}
              title="Open Recent Sessions Drawer"
            >
              <History className="w-4 h-4 text-amber-500" />
              <span>Recent Sessions</span>
              {(recentSessionsCount ?? 0) > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${theme.accentBg} ${theme.accentText}`}>
                  {recentSessionsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Interactive Hero Stage: Live Tactile Keystroke Sandbox        */}
        {/* ------------------------------------------------------------- */}
        <div className={`w-full mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm text-left flex flex-col gap-3.5 font-mono`}>
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${theme.accentBg}`} />
              <span className={`font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                Interactive Micro-Sandbox
              </span>
            </div>

            {/* Quick sound selector pill inside sandbox */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              {(['thock', 'creamy', 'marbly', 'click'] as SoundType[]).map((snd) => (
                <button
                  key={snd}
                  onClick={() => handleSwitchSoundPreview(snd)}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium capitalize transition-all ${
                    heroActiveSound === snd
                      ? `${theme.accentBg} ${theme.accentText}`
                      : `${theme.textMuted} hover:${theme.textPrimary}`
                  }`}
                >
                  {snd}
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Typing Prompt Display */}
          <div
            onClick={() => heroInputRef.current?.focus()}
            className={`relative p-3.5 sm:p-4 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} cursor-text transition-all focus-within:border-zinc-400`}
          >
            <div className="text-xs sm:text-sm sm:tracking-wide select-none leading-relaxed">
              {HERO_DEMO_TEXT.split('').map((char, idx) => {
                let charClass = theme.textMuted;
                const typedChar = heroInput[idx];

                if (typedChar !== undefined) {
                  charClass = typedChar === char ? theme.textPrimary : 'text-rose-500 bg-rose-500/10 font-bold';
                }

                const isCurrent = idx === heroInput.length;

                return (
                  <span key={idx} className={`relative ${charClass} font-mono`}>
                    {char}
                    {isCurrent && (
                      <span className={`absolute -bottom-0.5 left-0 w-full h-[2px] ${theme.accentBg} animate-pulse`} />
                    )}
                  </span>
                );
              })}
            </div>

            <input
              ref={heroInputRef}
              id="hero-sandbox-input"
              type="text"
              value={heroInput}
              onChange={handleHeroInputChange}
              placeholder="Start typing to test acoustics..."
              className="absolute inset-0 opacity-0 cursor-text w-full h-full"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Live Keystroke Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-zinc-500/10 text-zinc-400">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Last Key Latency</span>
                <span className={`font-bold ${theme.textPrimary}`}>
                  {demoLastLatency ? `${demoLastLatency}ms` : '—'}
                </span>
              </div>
              <div className="border-l border-zinc-500/20 pl-3 sm:pl-4">
                <span className="text-[10px] text-zinc-500 uppercase block">Taps Recorded</span>
                <span className={`font-bold ${theme.textPrimary}`}>{demoCharCount}</span>
              </div>
              <div className="border-l border-zinc-500/20 pl-3 sm:pl-4 hidden sm:block">
                <span className="text-[10px] text-zinc-500 uppercase block">Active Sound</span>
                <span className={`font-bold ${theme.textPrimary} capitalize`}>{heroActiveSound}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHeroInput('')}
                className={`text-[11px] ${theme.textMuted} hover:${theme.textPrimary} transition-colors underline`}
              >
                Reset
              </button>
              <button
                onClick={() => onStartTest('time', 30)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${theme.cardBg} border ${theme.borderSubtle} hover:${theme.accentBg} hover:${theme.accentText} text-xs font-medium transition-all`}
              >
                <span>Full Test</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. STATS AT A GLANCE: Clean, Authentic Metrics                */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-features" className="max-w-5xl mx-auto w-full px-2 sm:px-4 font-mono scroll-mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} flex flex-col justify-between shadow-xs`}>
            <div className={`text-xs ${theme.textMuted} font-medium flex items-center justify-between`}>
              <span>Fastest Test</span>
              <Award className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-light ${theme.textPrimary}`}>
                {stats.bestWpmOverall > 0 ? stats.bestWpmOverall : 0}
              </span>
              <span className={`text-xs ${theme.textMuted} ml-1`}>WPM</span>
            </div>
            <div className={`text-[11px] ${theme.textSecondary} mt-1 font-sans`}>
              {stats.bestWpmOverall > 0 ? 'Personal best' : 'Ready for your first run'}
            </div>
          </div>

          <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} flex flex-col justify-between shadow-xs`}>
            <div className={`text-xs ${theme.textMuted} font-medium flex items-center justify-between`}>
              <span>Average Precision</span>
              <Crosshair className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-light ${theme.textPrimary}`}>
                {stats.averageAccuracy > 0 ? `${stats.averageAccuracy}%` : '100%'}
              </span>
            </div>
            <div className={`text-[11px] ${theme.textSecondary} mt-1 font-sans`}>
              Aiming for 98%+ clean rhythm
            </div>
          </div>

          <div
            id="home-practice-history-card"
            onClick={onOpenRecentSessions}
            className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} flex flex-col justify-between shadow-xs ${
              onOpenRecentSessions ? 'cursor-pointer hover:border-amber-500/50 transition-all group' : ''
            }`}
            title={onOpenRecentSessions ? 'Click to open recent sessions & comparison' : undefined}
          >
            <div className={`text-xs ${theme.textMuted} font-medium flex items-center justify-between`}>
              <span>Practice History</span>
              <History className={`w-3.5 h-3.5 text-amber-500`} />
            </div>
            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-light ${theme.textPrimary}`}>
                {stats.totalTests}
              </span>
              <span className={`text-xs ${theme.textMuted} ml-1`}>sessions</span>
            </div>
            <div className={`text-[11px] ${theme.textSecondary} mt-1 font-sans flex items-center justify-between`}>
              <span>{onOpenRecentSessions ? 'View past sessions' : 'Saved locally in browser'}</span>
              {onOpenRecentSessions && (
                <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </div>

          <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} flex flex-col justify-between shadow-xs`}>
            <div className={`text-xs ${theme.textMuted} font-medium flex items-center justify-between`}>
              <span>Active Streak</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-light ${theme.textPrimary}`}>
                {stats.streakDays}
              </span>
              <span className={`text-xs ${theme.textMuted} ml-1`}>days</span>
            </div>
            <div className={`text-[11px] ${theme.textSecondary} mt-1 font-sans`}>
              Consistent daily practice
            </div>
          </div>
        </div>

        {/* Home Page Gamification & Badges Highlight */}
        <div
          id="home-achievements-banner"
          onClick={() => onNavigateTab('achievements')}
          className={`mt-4 p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-amber-500/40 shadow-xs cursor-pointer transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-amber-400 ${theme.cardBgSubtle} border ${theme.borderSubtle} group-hover:scale-105 transition-transform`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${theme.textPrimary}`}>
                  Milestones & Achievement Badges
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  New
                </span>
              </div>
              <p className={`text-xs ${theme.textSecondary} font-sans mt-0.5`}>
                Track your progress towards 100 WPM, 10-Day Streaks, and 10,000 Keystrokes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] text-zinc-400">100 WPM</span>
              <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] text-zinc-400">10-Day Streak</span>
              <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] text-zinc-400">10k Keystrokes</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${theme.textPrimary} group-hover:text-amber-500 transition-colors`}>
              <span className="hidden md:inline">View Badges</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACOUSTIC MECHANICAL SYNTHESIS: Interactive Switch Board    */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-acoustics" className="max-w-5xl mx-auto w-full px-2 sm:px-4 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Volume2 className={`w-4 h-4 ${theme.accent}`} />
              <span className={`text-xs font-mono font-medium uppercase tracking-wider ${theme.textMuted}`}>
                Web Audio Keystroke Engine
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-bold tracking-tight ${theme.textPrimary}`}>
              Physical Switch Acoustics
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-1 max-w-xl`}>
              Synthesized real-time audio harmonics simulate mechanical keyboard switch profiles with zero asset download latency.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-400 hidden sm:block">
            Click any profile to test live audio &rarr;
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 font-mono">
          {SOUND_PROFILES.filter((s) => s.id !== 'off').map((profile) => {
            const isSelected = preferences.sound === profile.id;

            return (
              <div
                key={profile.id}
                className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${
                  isSelected ? 'border-amber-400/80 shadow-sm' : theme.borderSubtle
                } flex flex-col justify-between gap-3 sm:gap-4 transition-all hover:border-zinc-400`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{profile.icon}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${theme.cardBgSubtle} ${theme.textMuted}`}>
                      {profile.switchType}
                    </span>
                  </div>
                  <h3 className={`text-sm sm:text-base font-bold tracking-tight ${theme.textPrimary} mt-2 sm:mt-3`}>
                    {profile.name}
                  </h3>
                  <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
                    {profile.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-500/10">
                  <button
                    onClick={() => {
                      onUpdatePreferences({ sound: profile.id });
                      playKeySound(profile.id, preferences.soundVolume || 0.6, false, false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? `${theme.accentBg} ${theme.accentText}`
                        : `${theme.cardBgSubtle} hover:${theme.textPrimary} ${theme.textSecondary}`
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'Active Switch' : 'Select'}</span>
                  </button>

                  <button
                    title="Play Spacebar Thump"
                    onClick={() => playKeySound(profile.id, preferences.soundVolume || 0.6, true, false)}
                    className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs ${theme.cardBgSubtle} hover:${theme.textPrimary} ${theme.textSecondary} border ${theme.borderSubtle}`}
                  >
                    Space
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MULTI-LAYOUT ERGONOMICS: QWERTY, COLEMAK, DVORAK           */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-keymaps" className="max-w-5xl mx-auto w-full px-2 sm:px-4 scroll-mt-6">
        <div className={`p-4 sm:p-7 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm flex flex-col gap-4 sm:gap-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className={`w-4 h-4 ${theme.accent}`} />
                <span className={`text-xs font-mono font-medium uppercase tracking-wider ${theme.textMuted}`}>
                  Ergonomic Keymaps
                </span>
              </div>
              <h2 className={`text-lg sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                Multi-Layout Architecture
              </h2>
              <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-0.5 max-w-xl`}>
                Master home-row efficiency across standard and alternative layouts with instant finger position guides.
              </p>
            </div>

            {/* Layout Toggle Buttons */}
            <div className="flex items-center p-1 rounded-xl border border-zinc-500/20 bg-black/5 dark:bg-white/5 font-mono text-xs self-start md:self-auto">
              {(['qwerty', 'colemak', 'dvorak'] as KeyboardLayout[]).map((layoutKey) => (
                <button
                  key={layoutKey}
                  onClick={() => {
                    setHeroSelectedLayout(layoutKey);
                    onUpdatePreferences({ keyboardLayout: layoutKey });
                  }}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg uppercase font-bold transition-all ${
                    heroSelectedLayout === layoutKey
                      ? `${theme.accentBg} ${theme.accentText} shadow-xs`
                      : `${theme.textSecondary} hover:${theme.textPrimary}`
                  }`}
                >
                  {layoutKey}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Keyboard Visualizer Preview (Horizontally scrollable on mobile without bursting parent) */}
          <div className={`p-3 sm:p-5 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex flex-col gap-1.5 sm:gap-2 font-mono select-none overflow-x-auto no-scrollbar`}>
            {activeLayoutConfig.rows.slice(0, 4).map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 min-w-[340px] sm:min-w-[480px]">
                {row.map((k, kIdx) => {
                  const isHomeKey =
                    k.toLowerCase() === activeLayoutConfig.homeKeys[0].toLowerCase() ||
                    k.toLowerCase() === activeLayoutConfig.homeKeys[1].toLowerCase();

                  return (
                    <div
                      key={kIdx}
                      className={`h-8 sm:h-9 md:h-10 min-w-[24px] sm:min-w-[30px] md:min-w-[34px] px-1 sm:px-2 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium border transition-all ${
                        isHomeKey
                          ? `${theme.accentBg} ${theme.accentText} border-transparent font-bold scale-105 shadow-xs`
                          : `${theme.cardBg} ${theme.borderSubtle} ${theme.textPrimary}`
                      }`}
                    >
                      <span>{k}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Layout Comparison Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs font-mono">
            <div className={`p-3.5 sm:p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
              <span className={`text-[10px] uppercase block ${theme.textMuted}`}>Home Row Efficiency</span>
              <div className={`text-base sm:text-lg font-bold ${theme.textPrimary} mt-0.5`}>
                {heroSelectedLayout === 'colemak' ? '74% on Home Row' : heroSelectedLayout === 'dvorak' ? '70% on Home Row' : '32% on Home Row'}
              </div>
              <p className={`text-[11px] ${theme.textSecondary} mt-1 font-sans`}>
                {heroSelectedLayout === 'colemak'
                  ? 'Keeps fingers centered, reducing overall hand travel by 2.2x.'
                  : heroSelectedLayout === 'dvorak'
                  ? 'Maximizes hand alternation on common vowels & consonants.'
                  : 'Traditional mechanical typewriter layout with high row jumping.'}
              </p>
            </div>

            <div className={`p-3.5 sm:p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
              <span className={`text-[10px] uppercase block ${theme.textMuted}`}>Primary Home Anchors</span>
              <div className={`text-base sm:text-lg font-bold ${theme.textPrimary} mt-0.5`}>
                {activeLayoutConfig.homeKeys[0].toUpperCase()} &amp; {activeLayoutConfig.homeKeys[1].toUpperCase()}
              </div>
              <p className={`text-[11px] ${theme.textSecondary} mt-1 font-sans`}>
                Physical tactile bump locations for resting index fingers.
              </p>
            </div>

            <div className={`p-3.5 sm:p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
              <span className={`text-[10px] uppercase block ${theme.textMuted}`}>Layout Description</span>
              <div className={`text-sm font-bold ${theme.textPrimary} mt-0.5`}>
                {activeLayoutConfig.name}
              </div>
              <p className={`text-[11px] ${theme.textSecondary} mt-1 font-sans truncate`}>
                {activeLayoutConfig.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. PLATEAU-BUSTING DRILLS & METHODOLOGY                       */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-drills" className="max-w-5xl mx-auto w-full px-2 sm:px-4 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className={`w-4 h-4 ${theme.accent}`} />
              <span className={`text-xs font-mono font-medium uppercase tracking-wider ${theme.textMuted}`}>
                Training Methodology
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-bold tracking-tight ${theme.textPrimary}`}>
              Shatter Speed Plateaus
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-1 max-w-xl`}>
              Break past the 60-80 WPM barrier by training frequent syllables and eliminating finger hesitation.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('drills')}
            className={`flex items-center gap-1.5 text-xs font-mono font-medium ${theme.textPrimary} hover:underline self-start md:self-auto`}
          >
            <span>View all drill suites</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-3 sm:gap-4`}>
            <div>
              <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center font-mono font-bold text-xs`}>
                  01
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>Trigrams &amp; Syllable Morphemes</h3>
              </div>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                Stop typing letter-by-letter. Train your motor cortex to fire common syllables like <em>the, ion, ing, ent, pro</em> in a single synchronized stroke ripple.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('drills')}
              className={`w-full py-2 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} hover:${theme.accentBg} hover:${theme.accentText} text-xs font-mono font-medium transition-all text-center`}
            >
              Practice Trigram Syllables
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-3 sm:gap-4`}>
            <div>
              <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center font-mono font-bold text-xs`}>
                  02
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>Core Top 200/1000 Corpus</h3>
              </div>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                The 200 most frequent English words account for over 50% of everyday writing. Cementing these creates a high baseline velocity.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('drills')}
              className={`w-full py-2 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} hover:${theme.accentBg} hover:${theme.accentText} text-xs font-mono font-medium transition-all text-center`}
            >
              Practice Top 200 Vocabulary
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-3 sm:gap-4`}>
            <div>
              <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center font-mono font-bold text-xs`}>
                  03
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>Targeted Weak-Key Isolation</h3>
              </div>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                TypeSprint tracks per-key error rates and latency. If keys like <em>B, P,</em> or <em>Z</em> cause hesitation, dedicated drills hone those exact reaches.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className={`w-full py-2 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} hover:${theme.accentBg} hover:${theme.accentText} text-xs font-mono font-medium transition-all text-center`}
            >
              View Weak-Key Heatmap
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-3 sm:gap-4`}>
            <div>
              <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center font-mono font-bold text-xs`}>
                  04
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>Developer Code &amp; Syntax</h3>
              </div>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                Practice brackets <code>{"{}[];=>()"}</code>, operators, and indentation patterns to write software without breaking your thought train.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('code')}
              className={`w-full py-2 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} hover:${theme.accentBg} hover:${theme.accentText} text-xs font-mono font-medium transition-all text-center`}
            >
              Open Code Typing Studio
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. READY TO PRACTICE BENCHMARK LAUNCHER                       */}
      {/* ------------------------------------------------------------- */}
      <section id="landing-cta" className="max-w-5xl mx-auto w-full px-2 sm:px-4 mb-2 sm:mb-4 scroll-mt-6">
        <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left`}>
          <div className="max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
              <span className={`text-xs font-mono font-medium uppercase tracking-wider ${theme.textMuted}`}>
                Instant Benchmark
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-bold tracking-tight ${theme.textPrimary}`}>
              Ready to test your typing velocity?
            </h2>
            <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-1.5 font-normal leading-relaxed`}>
              No accounts, zero tracking cookies, pure offline-first speed training with instant millisecond analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 font-mono w-full md:w-auto">
            <button
              id="cta-start-30s-benchmark"
              onClick={() => onStartTest('time', 30)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 30s Benchmark</span>
            </button>
            <button
              id="cta-start-60s-benchmark"
              onClick={() => onStartTest('time', 60)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} ${theme.textPrimary} text-xs sm:text-sm font-medium hover:border-zinc-400 transition-all`}
            >
              <span>60s Test</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
