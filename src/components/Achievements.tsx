import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Target,
  Lock,
  CheckCircle2,
  Star,
  Sparkles,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Crown,
  Keyboard,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';
import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  OverallStats,
  TestResult,
  UserPreferences,
} from '../types';
import { ThemeConfig } from '../utils/themes';
import { computeUserAchievements } from '../utils/achievements';
import { getLevelInfo } from '../utils/gamification';

interface AchievementsProps {
  results: TestResult[];
  stats: OverallStats;
  preferences: UserPreferences;
  theme: ThemeConfig;
  onStartPractice?: (mode?: 'time' | 'words' | 'code' | 'drill') => void;
}

const RARITY_CONFIG: Record<
  AchievementRarity,
  { label: string; badgeClass: string; borderClass: string; bgGlow: string }
> = {
  common: {
    label: 'Common',
    badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    borderClass: 'border-zinc-500/20',
    bgGlow: 'bg-zinc-500/5',
  },
  rare: {
    label: 'Rare',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/30',
    bgGlow: 'bg-blue-500/5',
  },
  epic: {
    label: 'Epic',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/30',
    bgGlow: 'bg-purple-500/5',
  },
  legendary: {
    label: 'Legendary',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/40',
    bgGlow: 'bg-amber-500/5',
  },
};

const CATEGORIES: { id: 'all' | AchievementCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Badges', icon: Layers },
  { id: 'speed', label: 'Speed & WPM', icon: Zap },
  { id: 'streak', label: 'Streaks & Combos', icon: Flame },
  { id: 'volume', label: 'Volume & Keystrokes', icon: Keyboard },
  { id: 'accuracy', label: 'Accuracy & Rhythm', icon: Target },
  { id: 'mastery', label: 'Mastery & Challenges', icon: Crown },
  { id: 'enthusiast', label: 'Enthusiast', icon: Sparkles },
];

export const Achievements: React.FC<AchievementsProps> = ({
  results,
  stats,
  preferences,
  theme,
  onStartPractice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalBadge, setActiveModalBadge] = useState<Achievement | null>(null);

  // Compute live achievements from session history and aggregated stats
  const { achievements, totalUnlocked, totalAchievements, unlockedXp } = useMemo(() => {
    return computeUserAchievements(results, stats, preferences);
  }, [results, stats, preferences]);

  // Compute level progression
  const levelInfo = useMemo(() => {
    return getLevelInfo(stats.totalXp || 0);
  }, [stats.totalXp]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return achievements.filter((badge) => {
      // Category filter
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
      // Status filter
      if (statusFilter === 'unlocked' && !badge.unlocked) return false;
      if (statusFilter === 'locked' && badge.unlocked) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          badge.title.toLowerCase().includes(q) ||
          badge.description.toLowerCase().includes(q) ||
          badge.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [achievements, selectedCategory, statusFilter, searchQuery]);

  // Highlight key requested milestones: 100 WPM, 10-Day Streak, 10,000 Keystrokes
  const milestone100Wpm = achievements.find((a) => a.id === 'speed_100');
  const milestone10DayStreak = achievements.find((a) => a.id === 'daily_10');
  const milestone10kKeystrokes = achievements.find((a) => a.id === 'keystrokes_10000');

  const completionPercent = Math.round((totalUnlocked / Math.max(1, totalAchievements)) * 100);

  return (
    <div id="achievements-view-root" className="w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-12 animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP GAMIFICATION BANNER: Level, XP & Overall Badges        */}
      {/* ------------------------------------------------------------- */}
      <section
        id="achievements-header"
        className={`p-5 sm:p-7 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs relative overflow-hidden`}
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Player Level & Gamification summary */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} shadow-sm shrink-0`}>
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              <div className={`absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${theme.accentBg} ${theme.accentText} shadow-xs`}>
                LVL {levelInfo.level}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                  Typing Achievements
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${theme.cardBgSubtle} border ${theme.borderSubtle} ${theme.textSecondary}`}>
                  {levelInfo.title}
                </span>
              </div>
              <p className={`text-xs sm:text-sm ${theme.textSecondary} mt-1 max-w-md font-normal leading-relaxed`}>
                Unlock trophies and badge milestones through speed, accuracy, consecutive practice streaks, and volume endurance.
              </p>
            </div>
          </div>

          {/* Right: Quick Stats Counter */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono w-full lg:w-auto">
            <div className={`flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} min-w-[120px]`}>
              <span className={`text-[10px] uppercase block ${theme.textMuted}`}>Unlocked</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>{totalUnlocked}</span>
                <span className={`text-xs ${theme.textMuted}`}>/ {totalAchievements}</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${theme.accentBg} transition-all duration-500`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div className={`flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} min-w-[120px]`}>
              <span className={`text-[10px] uppercase block ${theme.textMuted}`}>Bonus XP Earned</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-amber-500">+{unlockedXp.toLocaleString()}</span>
                <span className={`text-xs ${theme.textMuted}`}>XP</span>
              </div>
              <span className={`text-[10px] ${theme.textSecondary} mt-1 block`}>
                Next Lvl: {(levelInfo.xpForNextLevel - stats.totalXp).toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. FEATURED MILESTONES SHOWCASE: 100 WPM, 10-Day, 10k Keys    */}
      {/* ------------------------------------------------------------- */}
      <section id="achievements-featured-milestones" className="flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <h2 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${theme.textPrimary}`}>
              Hallmark Milestones
            </h2>
          </div>
          <span className={`text-[11px] ${theme.textMuted}`}>Key Performance Targets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Milestone 1: 100 WPM Club */}
          {milestone100Wpm && (
            <div
              id="milestone-card-100wpm"
              onClick={() => setActiveModalBadge(milestone100Wpm)}
              className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${
                milestone100Wpm.unlocked ? 'border-amber-500/40' : theme.borderSubtle
              } shadow-xs hover:border-zinc-400 transition-all cursor-pointer relative flex flex-col justify-between group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    milestone100Wpm.unlocked ? 'bg-amber-500/15 border border-amber-500/30' : `${theme.cardBgSubtle} border ${theme.borderSubtle}`
                  }`}>
                    {milestone100Wpm.unlocked ? '🚀' : <Lock className="w-5 h-5 opacity-40" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${theme.textPrimary}`}>
                        {milestone100Wpm.title}
                      </span>
                      {milestone100Wpm.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-amber-500 font-semibold uppercase block">
                      Triple-Digit Club
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${RARITY_CONFIG[milestone100Wpm.rarity].badgeClass} border`}>
                  {milestone100Wpm.rewardXp} XP
                </span>
              </div>

              <p className={`text-xs ${theme.textSecondary} mt-3 font-sans line-clamp-2`}>
                {milestone100Wpm.description}
              </p>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={theme.textMuted}>Current Best</span>
                  <span className={`font-bold ${milestone100Wpm.unlocked ? 'text-emerald-500' : theme.textPrimary}`}>
                    {milestone100Wpm.progress} / {milestone100Wpm.maxProgress} WPM
                  </span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${milestone100Wpm.unlocked ? 'bg-emerald-500' : theme.accentBg}`}
                    style={{ width: `${Math.min(100, Math.round((milestone100Wpm.progress / milestone100Wpm.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Milestone 2: 10-Day Streak */}
          {milestone10DayStreak && (
            <div
              id="milestone-card-10day-streak"
              onClick={() => setActiveModalBadge(milestone10DayStreak)}
              className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${
                milestone10DayStreak.unlocked ? 'border-amber-500/40' : theme.borderSubtle
              } shadow-xs hover:border-zinc-400 transition-all cursor-pointer relative flex flex-col justify-between group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    milestone10DayStreak.unlocked ? 'bg-amber-500/15 border border-amber-500/30' : `${theme.cardBgSubtle} border ${theme.borderSubtle}`
                  }`}>
                    {milestone10DayStreak.unlocked ? '🔥' : <Lock className="w-5 h-5 opacity-40" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${theme.textPrimary}`}>
                        {milestone10DayStreak.title}
                      </span>
                      {milestone10DayStreak.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-amber-500 font-semibold uppercase block">
                      Daily Discipline
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${RARITY_CONFIG[milestone10DayStreak.rarity].badgeClass} border`}>
                  {milestone10DayStreak.rewardXp} XP
                </span>
              </div>

              <p className={`text-xs ${theme.textSecondary} mt-3 font-sans line-clamp-2`}>
                {milestone10DayStreak.description}
              </p>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={theme.textMuted}>Current Streak</span>
                  <span className={`font-bold ${milestone10DayStreak.unlocked ? 'text-emerald-500' : theme.textPrimary}`}>
                    {milestone10DayStreak.progress} / {milestone10DayStreak.maxProgress} Days
                  </span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${milestone10DayStreak.unlocked ? 'bg-emerald-500' : theme.accentBg}`}
                    style={{ width: `${Math.min(100, Math.round((milestone10DayStreak.progress / milestone10DayStreak.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Milestone 3: 10,000 Keystrokes */}
          {milestone10kKeystrokes && (
            <div
              id="milestone-card-10k-keystrokes"
              onClick={() => setActiveModalBadge(milestone10kKeystrokes)}
              className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${
                milestone10kKeystrokes.unlocked ? 'border-amber-500/40' : theme.borderSubtle
              } shadow-xs hover:border-zinc-400 transition-all cursor-pointer relative flex flex-col justify-between group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    milestone10kKeystrokes.unlocked ? 'bg-amber-500/15 border border-amber-500/30' : `${theme.cardBgSubtle} border ${theme.borderSubtle}`
                  }`}>
                    {milestone10kKeystrokes.unlocked ? '⌨️' : <Lock className="w-5 h-5 opacity-40" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${theme.textPrimary}`}>
                        {milestone10kKeystrokes.title}
                      </span>
                      {milestone10kKeystrokes.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-amber-500 font-semibold uppercase block">
                      Endurance Benchmark
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${RARITY_CONFIG[milestone10kKeystrokes.rarity].badgeClass} border`}>
                  {milestone10kKeystrokes.rewardXp} XP
                </span>
              </div>

              <p className={`text-xs ${theme.textSecondary} mt-3 font-sans line-clamp-2`}>
                {milestone10kKeystrokes.description}
              </p>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={theme.textMuted}>Logged Keystrokes</span>
                  <span className={`font-bold ${milestone10kKeystrokes.unlocked ? 'text-emerald-500' : theme.textPrimary}`}>
                    {milestone10kKeystrokes.progress.toLocaleString()} / {milestone10kKeystrokes.maxProgress.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${milestone10kKeystrokes.unlocked ? 'bg-emerald-500' : theme.accentBg}`}
                    style={{ width: `${Math.min(100, Math.round((milestone10kKeystrokes.progress / milestone10kKeystrokes.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTROLS: Category Pills, Status Tabs & Search             */}
      {/* ------------------------------------------------------------- */}
      <section id="achievements-filters" className="flex flex-col gap-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all'
                ? achievements.length
                : achievements.filter((a) => a.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  id={`achieve-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
                      : `${theme.cardBg} border ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] opacity-70 px-1 py-0.2 rounded-full ${isActive ? 'bg-black/20' : 'bg-black/5 dark:bg-white/10'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Status Filter & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Segmented Control */}
            <div className={`flex items-center p-1 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} text-xs`}>
              {(['all', 'unlocked', 'locked'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                    statusFilter === st
                      ? `${theme.cardBg} ${theme.textPrimary} shadow-xs font-bold`
                      : `${theme.textMuted} hover:${theme.textPrimary}`
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'unlocked' ? 'Unlocked' : 'Locked'}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search badges..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} text-xs ${theme.textPrimary} placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-400`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN BADGE GRID                                            */}
      {/* ------------------------------------------------------------- */}
      <section id="achievements-badge-grid" className="w-full">
        {filteredBadges.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} font-mono flex flex-col items-center gap-3`}>
            <Compass className="w-8 h-8 text-zinc-400" />
            <span className={`text-sm font-medium ${theme.textPrimary}`}>No badges match your criteria</span>
            <p className={`text-xs ${theme.textSecondary} max-w-sm font-sans`}>
              Try clearing your search query or switching to another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className={`mt-2 px-4 py-1.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-medium`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 font-mono">
            {filteredBadges.map((badge) => {
              const rarityInfo = RARITY_CONFIG[badge.rarity];
              const progressPct = Math.min(100, Math.round((badge.progress / Math.max(1, badge.maxProgress)) * 100));

              return (
                <div
                  key={badge.id}
                  id={`achievement-badge-${badge.id}`}
                  onClick={() => setActiveModalBadge(badge)}
                  className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${
                    badge.unlocked ? rarityInfo.borderClass : theme.borderSubtle
                  } shadow-xs hover:border-zinc-400 transition-all cursor-pointer flex flex-col justify-between relative group overflow-hidden`}
                >
                  {/* Subtle rarity backdrop glow for unlocked items */}
                  {badge.unlocked && (
                    <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${rarityInfo.bgGlow} blur-xl pointer-events-none`} />
                  )}

                  <div>
                    {/* Badge Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-105 shrink-0 ${
                            badge.unlocked
                              ? `${rarityInfo.bgGlow} border ${rarityInfo.borderClass}`
                              : `${theme.cardBgSubtle} border ${theme.borderSubtle} opacity-60`
                          }`}
                        >
                          {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 opacity-40" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className={`font-bold text-sm leading-tight ${theme.textPrimary}`}>
                              {badge.title}
                            </h3>
                            {badge.unlocked && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold uppercase mt-0.5 block ${theme.textMuted}`}>
                            {badge.category}
                          </span>
                        </div>
                      </div>

                      {/* XP & Rarity Pill */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rarityInfo.badgeClass}`}>
                          +{badge.rewardXp} XP
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase">
                          {rarityInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Badge Description */}
                    <p className={`text-xs ${theme.textSecondary} mt-3 font-sans leading-relaxed line-clamp-2`}>
                      {badge.description}
                    </p>
                  </div>

                  {/* Badge Progress Bottom Bar */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={theme.textMuted}>
                        {badge.unlocked ? (
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <span>Completed</span>
                            {badge.unlockedAt && <span className="opacity-70">({badge.unlockedAt})</span>}
                          </span>
                        ) : (
                          <span>Progress</span>
                        )}
                      </span>
                      <span className={`font-semibold ${badge.unlocked ? 'text-emerald-500' : theme.textPrimary}`}>
                        {badge.progress.toLocaleString()} / {badge.maxProgress.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          badge.unlocked ? 'bg-emerald-500' : theme.accentBg
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL: Badge Detail & Tips                                 */}
      {/* ------------------------------------------------------------- */}
      {activeModalBadge && (
        <div
          id="badge-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModalBadge(null)}
        >
          <div
            className={`w-full max-w-md p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xl relative font-mono flex flex-col gap-5`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
                  activeModalBadge.unlocked
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : `${theme.cardBgSubtle} border ${theme.borderSubtle}`
                }`}>
                  {activeModalBadge.unlocked ? activeModalBadge.icon : <Lock className="w-7 h-7 opacity-40" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-bold ${theme.textPrimary}`}>
                      {activeModalBadge.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${RARITY_CONFIG[activeModalBadge.rarity].badgeClass}`}>
                      {RARITY_CONFIG[activeModalBadge.rarity].label}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">
                      +{activeModalBadge.rewardXp} XP
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalBadge(null)}
                className={`p-1.5 rounded-lg ${theme.cardBgSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`}
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} font-sans`}>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Requirement</span>
              <p className={`text-sm ${theme.textPrimary} leading-relaxed`}>
                {activeModalBadge.description}
              </p>
            </div>

            {/* Progress Metrics */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className={theme.textMuted}>Milestone Progress</span>
                <span className={`font-bold ${activeModalBadge.unlocked ? 'text-emerald-500' : theme.textPrimary}`}>
                  {activeModalBadge.progress.toLocaleString()} / {activeModalBadge.maxProgress.toLocaleString()} (
                  {Math.min(100, Math.round((activeModalBadge.progress / Math.max(1, activeModalBadge.maxProgress)) * 100))}%)
                </span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${activeModalBadge.unlocked ? 'bg-emerald-500' : theme.accentBg}`}
                  style={{
                    width: `${Math.min(100, Math.round((activeModalBadge.progress / Math.max(1, activeModalBadge.maxProgress)) * 100))}%`,
                  }}
                />
              </div>
              {activeModalBadge.unlocked && activeModalBadge.unlockedAt && (
                <span className="text-[11px] text-emerald-500 mt-1">
                  🎉 Unlocked on {activeModalBadge.unlockedAt}
                </span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveModalBadge(null)}
                className={`flex-1 py-2.5 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-all`}
              >
                Close
              </button>
              {onStartPractice && (
                <button
                  onClick={() => {
                    setActiveModalBadge(null);
                    onStartPractice('time');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-medium transition-all shadow-xs`}
                >
                  <span>Practice Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
