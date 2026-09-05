import React, { useState } from 'react';
import {
  Keyboard,
  BarChart3,
  Zap,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Eye,
  EyeOff,
  ChevronDown,
  Play,
  ArrowLeft,
  Menu,
  X,
  Code2,
  History,
  Trophy,
  Globe,
  Palette,
} from 'lucide-react';
import { ThemeId, SoundType, UserPreferences, KeyboardLayout } from '../types';
import { THEMES } from '../utils/themes';
import { KEYBOARD_LAYOUTS } from '../utils/layouts';
import { playKeySound } from '../utils/sound';

interface NavbarProps {
  activeTab: 'home' | 'test' | 'code' | 'drills' | 'leaderboard' | 'achievements' | 'analytics' | 'guide';
  setActiveTab: (tab: 'home' | 'test' | 'code' | 'drills' | 'leaderboard' | 'achievements' | 'analytics' | 'guide') => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  streakDays: number;
  isTypingActive: boolean;
  onOpenRecentSessions: () => void;
  recentSessionsCount?: number;
  onOpenThemeCustomizer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  preferences,
  onUpdatePreferences,
  streakDays,
  isTypingActive,
  onOpenRecentSessions,
  recentSessionsCount = 0,
  onOpenThemeCustomizer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentTheme = THEMES[preferences.theme] || THEMES.obsidian;

  const handleNextSound = () => {
    const sounds: SoundType[] = ['thock', 'click', 'creamy', 'marbly', 'typewriter', 'silent', 'off'];
    const currentIndex = sounds.indexOf(preferences.sound);
    const nextSound = sounds[(currentIndex + 1) % sounds.length];
    onUpdatePreferences({ sound: nextSound });
    if (nextSound !== 'off') {
      playKeySound(nextSound, preferences.soundVolume || 0.6, false, false);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdatePreferences({ theme: e.target.value as ThemeId });
  };

  const scrollToLandingSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ----------------------------------------------------------------------
  // SCENARIO 1: LANDING PAGE HEADER (When on Home/Landing view)
  // Clean, marketing/product focused, no internal test/home options
  // ----------------------------------------------------------------------
  if (activeTab === 'home') {
    return (
      <header
        id="landing-navbar"
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 select-none transition-all duration-300"
      >
        {/* Brand Logo */}
        <button
          id="landing-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0 cursor-pointer"
          title="TypeSprint - Precision Typing"
        >
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${currentTheme.accentBg} ${currentTheme.accentText} flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0`}
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <span className={`font-bold text-base sm:text-lg tracking-tight ${currentTheme.textPrimary} font-sans leading-tight`}>
              TypeSprint
            </span>
            <span className={`text-[10px] sm:text-[11px] font-mono font-medium tracking-wider uppercase ${currentTheme.textMuted} leading-tight`}>
              precision typing
            </span>
          </div>
        </button>

        {/* Center: Landing Page Section Navigation Links (Desktop/Tablet) */}
        <nav
          id="landing-navigation"
          aria-label="Landing Page Navigation"
          className="hidden md:flex items-center gap-1 font-mono text-xs"
        >
          <button
            onClick={() => scrollToLandingSection('landing-features')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Features
          </button>
          <button
            onClick={() => scrollToLandingSection('landing-acoustics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Acoustics
          </button>
          <button
            onClick={() => scrollToLandingSection('landing-keymaps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Keymaps
          </button>
          <button
            onClick={() => scrollToLandingSection('landing-drills')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Drills
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:${currentTheme.cardBgSubtle}`}
          >
            Guide
          </button>
        </nav>

        {/* Right Actions: Theme + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Selector */}
          <div className="relative">
            <select
              id="landing-theme-select"
              value={preferences.theme}
              onChange={handleThemeChange}
              className={`appearance-none text-xs font-mono font-medium pl-2.5 pr-6 py-1.5 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} ${currentTheme.textPrimary} focus:outline-none cursor-pointer hover:border-zinc-400 transition-colors`}
              title="Color Theme"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className={t.isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                  {t.name}
                </option>
              ))}
            </select>
            <Sparkles className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${currentTheme.textMuted}`} />
          </div>

          {/* High-visibility Primary CTA Button */}
          <button
            id="landing-start-typing-btn"
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap shrink-0 ${currentTheme.accentBg} ${currentTheme.accentText} shadow-xs hover:opacity-90 active:scale-95 transition-all`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Typing</span>
          </button>
        </div>
      </header>
    );
  }

  // ----------------------------------------------------------------------
  // SCENARIO 2: APP HEADER (When in Typing, Drills, Analytics, Guide)
  // Dedicated practice tools with streamlined tabs & quick controls
  // ----------------------------------------------------------------------
  return (
    <header
      id="app-navbar"
      className={`w-full max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 select-none ${
        isTypingActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Brand Logo with Return to Overview */}
      <button
        id="nav-logo-btn"
        onClick={() => setActiveTab('home')}
        title="TypeSprint - Return to Overview"
        className="flex items-center gap-2.5 group focus:outline-none shrink-0 cursor-pointer"
      >
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${currentTheme.accentBg} ${currentTheme.accentText} flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0`}
        >
          <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col text-left justify-center">
          <span className={`font-bold text-sm sm:text-base tracking-tight ${currentTheme.textPrimary} font-sans leading-tight`}>
            TypeSprint
          </span>
          <span className={`text-[9px] sm:text-[10px] font-mono font-medium tracking-wider uppercase ${currentTheme.textMuted} leading-tight`}>
            precision typing
          </span>
        </div>
      </button>

      {/* Center Segmented App Navigation Tabs (Typing, Drills, Analytics, Guide) */}
      <nav
        id="main-navigation"
        className={`flex items-center p-0.5 sm:p-1 rounded-xl border ${currentTheme.borderSubtle} ${currentTheme.cardBgSubtle} overflow-x-auto no-scrollbar`}
      >
        <button
          id="tab-btn-test"
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'test'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Typing</span>
        </button>

        <button
          id="tab-btn-code"
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'code'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>

        <button
          id="tab-btn-drills"
          onClick={() => setActiveTab('drills')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'drills'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Drills</span>
        </button>

        <button
          id="tab-btn-achievements"
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'achievements'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Badges</span>
        </button>

        <button
          id="tab-btn-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'leaderboard'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ranks</span>
          <span className="sm:hidden">Ranks</span>
        </button>

        <button
          id="tab-btn-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'analytics'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Analytics</span>
          <span className="sm:hidden">Stats</span>
        </button>

        <button
          id="tab-btn-guide"
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
            activeTab === 'guide'
              ? `${currentTheme.cardBg} ${currentTheme.textPrimary} shadow-xs font-bold`
              : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>
      </nav>

      {/* Right Quick Practice Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Recent Sessions Drawer Button */}
        <button
          id="nav-recent-sessions-btn"
          onClick={onOpenRecentSessions}
          title="Recent Sessions & Compare"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} text-xs font-mono ${currentTheme.textPrimary} hover:border-zinc-400 transition-all`}
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Recent</span>
          {recentSessionsCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${currentTheme.accentBg} ${currentTheme.accentText}`}>
              {recentSessionsCount}
            </span>
          )}
        </button>

        {/* Streak Counter */}
        {streakDays > 0 && (
          <div
            id="streak-badge"
            title={`${streakDays} Day Practice Streak!`}
            className={`hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} text-xs font-mono font-medium ${currentTheme.textPrimary}`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streakDays}d</span>
          </div>
        )}

        {/* Keyboard Layout Quick Toggle */}
        <div className="relative">
          <select
            id="layout-select"
            value={preferences.keyboardLayout || 'qwerty'}
            onChange={(e) => onUpdatePreferences({ keyboardLayout: e.target.value as KeyboardLayout })}
            className={`appearance-none text-xs font-mono font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 pr-5 sm:pr-6 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} ${currentTheme.textPrimary} focus:outline-none cursor-pointer hover:border-zinc-400 transition-colors`}
            title="Keyboard Layout"
          >
            {(['qwerty', 'dvorak', 'colemak'] as KeyboardLayout[]).map((lId) => (
              <option
                key={lId}
                value={lId}
                className={currentTheme.isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}
              >
                {KEYBOARD_LAYOUTS[lId].name}
              </option>
            ))}
          </select>
          <ChevronDown className={`w-3 h-3 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none ${currentTheme.textMuted}`} />
        </div>

        {/* Sound Toggle */}
        <button
          id="toggle-sound-btn"
          onClick={handleNextSound}
          title={`Switch Sound Profile (Current: ${preferences.sound})`}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} text-xs font-mono ${currentTheme.textPrimary} hover:border-zinc-400 transition-all`}
        >
          {preferences.sound === 'off' ? (
            <VolumeX className="w-3.5 h-3.5 opacity-40" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="capitalize text-[11px] hidden md:inline">{preferences.sound}</span>
        </button>

        {/* Theme Selector */}
        <div className="relative hidden sm:flex items-center gap-1">
          <div className="relative">
            <select
              id="theme-select"
              value={preferences.theme}
              onChange={handleThemeChange}
              className={`appearance-none text-xs font-mono font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 pr-5 sm:pr-6 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} ${currentTheme.textPrimary} focus:outline-none cursor-pointer hover:border-zinc-400 transition-colors`}
              title="Color Theme"
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className={t.isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                  {t.name}
                </option>
              ))}
            </select>
            <Sparkles className={`w-3 h-3 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none ${currentTheme.textMuted}`} />
          </div>

          {onOpenThemeCustomizer && (
            <button
              id="open-theme-customizer-btn"
              onClick={onOpenThemeCustomizer}
              title="Customize Theme CSS Variables"
              className={`p-1.5 rounded-lg border ${currentTheme.borderSubtle} ${currentTheme.cardBg} ${currentTheme.textPrimary} hover:border-zinc-400 transition-all`}
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>

        {/* Virtual Keyboard Toggle (only relevant in typing practice) */}
        {activeTab === 'test' && (
          <button
            id="toggle-keyboard-btn"
            onClick={() => onUpdatePreferences({ showKeyboard: !preferences.showKeyboard })}
            title={preferences.showKeyboard ? 'Hide Virtual Keyboard' : 'Show Virtual Keyboard'}
            className={`p-1.5 rounded-lg border transition-all ${
              preferences.showKeyboard
                ? `${currentTheme.accentBg} ${currentTheme.accentText}`
                : `border ${currentTheme.borderSubtle} ${currentTheme.cardBg} ${currentTheme.textPrimary} opacity-60 hover:opacity-100`
            }`}
          >
            {preferences.showKeyboard ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </header>
  );
};

