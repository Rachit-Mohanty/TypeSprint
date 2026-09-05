import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Crosshair,
  Download,
  Trash2,
  Calendar,
  Layers,
  Flame,
  Clock,
  Activity,
  Sparkles,
  ChevronRight,
  Info,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TestResult, OverallStats, KeyStat } from '../types';
import { ThemeConfig } from '../utils/themes';
import { FINGER_MAPPING } from '../utils/analytics';
import { getLevelFromXp } from '../utils/gamification';

interface AnalyticsViewProps {
  results: TestResult[];
  stats: OverallStats;
  theme: ThemeConfig;
  onClearHistory: () => void;
  onSelectDrillFromWeakKey: (key: string) => void;
}

type HeatmapMetric = 'errors' | 'accuracy' | 'latency' | 'volume';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  results,
  stats,
  theme,
  onClearHistory,
  onSelectDrillFromWeakKey,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('errors');
  const [showShiftRow, setShowShiftRow] = useState<boolean>(false);
  const [selectedKeyForDetail, setSelectedKeyForDetail] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (filterMode !== 'all' && r.mode !== filterMode) return false;
      if (searchQuery.trim() && !r.modeDetail.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [results, filterMode, searchQuery]);

  const timelineChartData = useMemo(() => {
    const recent30 = [...filteredResults].reverse().slice(-30);
    return recent30.map((r, idx) => {
      // calculate 5-session rolling average
      const startIdx = Math.max(0, idx - 4);
      const windowItems = recent30.slice(startIdx, idx + 1);
      const movingAvgWpm = Math.round(
        windowItems.reduce((acc, curr) => acc + curr.wpm, 0) / windowItems.length
      );

      return {
        index: idx + 1,
        date: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wpm: r.wpm,
        rawWpm: r.rawWpm,
        accuracy: r.accuracy,
        movingAvgWpm,
        mode: r.modeDetail,
      };
    });
  }, [filteredResults]);

  const handBalance = useMemo(() => {
    let leftCount = 0;
    let rightCount = 0;

    for (const [key, stat] of Object.entries(stats.allKeyStats) as [string, KeyStat][]) {
      const finger = FINGER_MAPPING[key] || FINGER_MAPPING[key.toLowerCase()];
      if (finger) {
        if (finger.hand === 'left') leftCount += stat.total;
        else rightCount += stat.total;
      }
    }

    const total = leftCount + rightCount;
    if (total === 0) return { left: 50, right: 50, leftCount: 0, rightCount: 0 };
    return {
      left: Math.round((leftCount / total) * 100),
      right: Math.round((rightCount / total) * 100),
      leftCount,
      rightCount,
    };
  }, [stats.allKeyStats]);

  // Top missed characters ranking across all sessions
  const topMissedCharacters = useMemo(() => {
    return Object.entries(stats.allKeyStats)
      .filter(([_, stat]) => (stat as KeyStat).errors > 0)
      .map(([char, stat]) => {
        const s = stat as KeyStat;
        const missRate = s.total > 0 ? Math.round((s.errors / s.total) * 100) : 0;
        return {
          char,
          display: char === ' ' ? 'Space' : char,
          errors: s.errors,
          total: s.total,
          missRate,
        };
      })
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 8);
  }, [stats.allKeyStats]);

  // Complete physical keyboard layout rows for standard and shifted symbols
  const KEYBOARD_ROWS_STANDARD = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  const KEYBOARD_ROWS_SHIFTED = [
    ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'],
  ];

  const activeKeyboardRows = showShiftRow ? KEYBOARD_ROWS_SHIFTED : KEYBOARD_ROWS_STANDARD;

  // Helper to compute heat colors and metrics for any key
  const getKeyMetricData = (keyChar: string) => {
    const lookupKey = keyChar.length === 1 ? keyChar.toLowerCase() : keyChar;
    const stat = stats.allKeyStats[lookupKey] ||
      stats.allKeyStats[keyChar] || { total: 0, errors: 0, totalLatencyMs: 0 };
    const accuracy = stat.total > 0 ? Math.round(((stat.total - stat.errors) / stat.total) * 100) : 100;
    const avgLatency = stat.total > 0 ? Math.round(stat.totalLatencyMs / stat.total) : 0;
    const finger = FINGER_MAPPING[keyChar] || FINGER_MAPPING[lookupKey];

    let colorClass = `${theme.cardBgSubtle} ${theme.textSecondary} border-zinc-700/30 opacity-70`;
    let label = '-';

    if (heatmapMetric === 'errors') {
      label = stat.errors > 0 ? `${stat.errors} err` : stat.total > 0 ? '0 err' : '-';
      if (stat.errors >= 4 || (stat.total > 0 && stat.errors / stat.total >= 0.15)) {
        colorClass = 'bg-rose-500/30 text-rose-300 border-rose-500/60 font-black shadow-xs shadow-rose-500/20';
      } else if (stat.errors > 0) {
        colorClass = 'bg-amber-500/25 text-amber-300 border-amber-500/50 font-bold';
      } else if (stat.total > 0) {
        colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      }
    } else if (heatmapMetric === 'latency') {
      label = avgLatency > 0 ? `${avgLatency}ms` : '-';
      if (stat.total >= 3) {
        if (avgLatency < 120) {
          colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        } else if (avgLatency <= 180) {
          colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        } else {
          colorClass = 'bg-rose-500/25 text-rose-400 border-rose-500/40 font-bold';
        }
      }
    } else if (heatmapMetric === 'accuracy') {
      label = stat.total > 0 ? `${accuracy}%` : '-';
      if (stat.total >= 3) {
        if (accuracy >= 96) {
          colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        } else if (accuracy >= 88) {
          colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        } else {
          colorClass = 'bg-rose-500/25 text-rose-400 border-rose-500/40 font-bold';
        }
      }
    } else {
      label = `${stat.total}`;
      if (stat.total > 80) {
        colorClass = 'bg-purple-500/30 text-purple-300 border-purple-500/40 font-bold';
      } else if (stat.total > 30) {
        colorClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      } else if (stat.total > 0) {
        colorClass = 'bg-blue-500/15 text-blue-300 border-blue-500/20';
      }
    }

    return {
      key: keyChar,
      lower: lookupKey,
      total: stat.total,
      errors: stat.errors,
      accuracy,
      avgLatency,
      finger,
      colorClass,
      label,
    };
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `typesprint_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const playerLevel = getLevelFromXp(stats.totalXp || 0);

  return (
    <div id="analytics-view-container" className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 animate-fade-in font-sans">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Personal Best</span>
            <Award className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <span className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {stats.bestWpmOverall}
            </span>
            <span className={`text-xs ${theme.textMuted} ml-1`}>wpm</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Average Speed</span>
            <Zap className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <span className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {stats.averageWpm}
            </span>
            <span className={`text-xs ${theme.textMuted} ml-1`}>wpm</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Accuracy Avg</span>
            <Crosshair className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <span className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {stats.averageAccuracy}%
            </span>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>Overall precision</div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Tests &amp; Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className={`text-3xl sm:text-4xl font-light tracking-tight ${theme.textPrimary}`}>
              {stats.totalTests} <span className={`text-xs ${theme.textMuted}`}>runs</span>
            </div>
            <div className="text-xs text-amber-500 font-medium mt-1">
              {stats.streakDays} day streak
            </div>
          </div>
        </div>
      </div>

      {/* Level & XP Progression */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs font-mono flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl ${theme.accentBg} ${theme.accentText} font-bold text-xs tracking-wider uppercase shadow-xs`}>
              LVL {playerLevel.level}
            </div>
            <div>
              <div className={`text-xs font-bold ${theme.textPrimary}`}>
                {playerLevel.title}
              </div>
              <div className={`text-[11px] ${theme.textMuted}`}>
                {(stats.totalXp ?? 0).toLocaleString()} Total XP
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className={`text-[10px] ${theme.textMuted} block`}>High Score</span>
              <span className={`font-bold ${theme.textPrimary}`}>{(stats.highScore ?? stats.totalScore ?? 0).toLocaleString()}</span>
            </div>
            <div>
              <span className={`text-[10px] ${theme.textMuted} block`}>Best Combo</span>
              <span className="font-bold text-amber-500">{stats.highestStreak ?? stats.maxStreakOverall ?? 0}x</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className={`flex justify-between text-[11px] font-medium ${theme.textMuted}`}>
            <span>Progress to {playerLevel.nextLevelTitle || 'Grandmaster'}</span>
            <span>{Math.round(playerLevel.progressPercent)}%</span>
          </div>
          <div className={`w-full h-2 rounded-full ${theme.cardBgSubtle} overflow-hidden`}>
            <div
              className={`h-full ${theme.accentBg} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(100, playerLevel.progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Over Time Chart */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
              <TrendingUp className="w-4 h-4" />
              <span>Speed &amp; Accuracy Progress</span>
            </h2>
            <p className={`text-xs ${theme.textMuted} mt-0.5 font-sans`}>
              WPM progression over recent typing sessions
            </p>
          </div>

          <select
            id="analytics-filter-mode-select"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${theme.borderSubtle} ${theme.cardBg} ${theme.textPrimary} focus:outline-hidden`}
          >
            <option value="all">All Modes</option>
            <option value="time">Time</option>
            <option value="words">Words</option>
            <option value="quote">Quote</option>
            <option value="drill">Drill</option>
            <option value="code">Code</option>
          </select>
        </div>

        {timelineChartData.length > 0 ? (
          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke={theme.isDark ? '#27272a' : '#f4f4f5'} />
                <XAxis dataKey="index" stroke={theme.isDark ? '#52525b' : '#a1a1aa'} fontSize={10} unit=" #" />
                <YAxis yAxisId="left" stroke={theme.isDark ? '#52525b' : '#a1a1aa'} fontSize={10} />
                <YAxis yAxisId="right" orientation="right" stroke={theme.isDark ? '#52525b' : '#a1a1aa'} domain={[70, 100]} fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.isDark ? '#18191e' : '#ffffff',
                    borderColor: theme.isDark ? '#27272a' : '#e4e4e7',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: theme.isDark ? '#f4f4f5' : '#18181b',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="wpm" stroke={theme.isDark ? '#f59e0b' : '#18181b'} strokeWidth={2} name="Net WPM" dot={{ r: 2 }} activeDot={{ r: 5 }} />
                <Line yAxisId="left" type="monotone" dataKey="movingAvgWpm" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 2" name="5-Run Rolling Avg" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="rawWpm" stroke="#71717a" strokeWidth={1} strokeDasharray="3 3" name="Raw WPM" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={1.5} name="Accuracy (%)" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={`h-40 flex flex-col items-center justify-center text-xs ${theme.textMuted}`}>
            <span>Complete some typing runs to view your progression curve!</span>
          </div>
        )}
      </div>

      {/* Advanced Interactive Keyboard Latency Heatmap */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Biomechanical Keyboard Heatmap</span>
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5 font-sans`}>
              Inspect per-key tactile latency, error rates, and volume across the physical layout
            </p>
          </div>

          {/* Metric Selector Tabs & Layout Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowShiftRow((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                showShiftRow
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : `${theme.cardBgSubtle} ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              {showShiftRow ? 'Shifted: Symbols (!@#)' : 'Normal: Keys & Punctuation'}
            </button>

            <div className={`flex items-center p-1 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle}`}>
              <button
                onClick={() => setHeatmapMetric('errors')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  heatmapMetric === 'errors'
                    ? 'bg-rose-500 text-white shadow-xs font-bold'
                    : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Error Heatmap
              </button>
              <button
                onClick={() => setHeatmapMetric('latency')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  heatmapMetric === 'latency'
                    ? `${theme.accentBg} ${theme.accentText} shadow-xs`
                    : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Latency (ms)
              </button>
              <button
                onClick={() => setHeatmapMetric('accuracy')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  heatmapMetric === 'accuracy'
                    ? `${theme.accentBg} ${theme.accentText} shadow-xs`
                    : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Accuracy (%)
              </button>
              <button
                onClick={() => setHeatmapMetric('volume')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  heatmapMetric === 'volume'
                    ? `${theme.accentBg} ${theme.accentText} shadow-xs`
                    : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Volume (Hits)
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-4">
            {heatmapMetric === 'errors' ? (
              <>
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/40 border border-rose-500/70" />
                  &ge;4 Errs or &ge;15% Miss Rate (Targeted Weakness)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/30 border border-amber-500/50" />
                  1-3 Errs (Occasional)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/25 border border-emerald-500/40" />
                  0 Errs (Mastered)
                </span>
              </>
            ) : heatmapMetric === 'latency' ? (
              <>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/40" />
                  &lt;120ms (Fluid)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-500/40" />
                  120-180ms (Moderate)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/20 border border-rose-500/40" />
                  &gt;180ms (Lag)
                </span>
              </>
            ) : heatmapMetric === 'accuracy' ? (
              <>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/40" />
                  96%+ Accuracy
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-500/40" />
                  88-95% Accuracy
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/20 border border-rose-500/40" />
                  &lt;88% (Bottleneck)
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-purple-500/20 border border-purple-500/40" />
                  Heavy Volume
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/20 border border-indigo-500/40" />
                  Moderate
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-500/20 border border-blue-500/40" />
                  Light
                </span>
              </>
            )}
          </div>
          <span className={`text-[10px] ${theme.textMuted} hidden sm:inline`}>
            Click key to launch targeted practice
          </span>
        </div>

        {/* Top Missed Characters & Error Hotspots */}
        {topMissedCharacters.length > 0 && (
          <div className={`p-4 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex flex-col gap-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Frequently Missed Characters (Targeted Practice)</span>
              </span>
              <span className={`text-[11px] ${theme.textMuted}`}>Click key to generate instant drill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {topMissedCharacters.map((item) => (
                <button
                  key={item.char}
                  onClick={() => {
                    setSelectedKeyForDetail(item.char);
                    onSelectDrillFromWeakKey(item.char);
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-500/60 transition-all group cursor-pointer"
                >
                  <span className="text-sm font-bold font-mono text-rose-300 group-hover:scale-110 transition-transform">
                    {item.display}
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 mt-0.5">
                    {item.errors} err ({item.missRate}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Physical Keyboard Rows Heatmap */}
        <div className="flex flex-col gap-1.5 items-center justify-center p-3 sm:p-4 rounded-xl bg-black/20 dark:bg-zinc-950/40 border border-zinc-800/40 overflow-x-auto select-none">
          {activeKeyboardRows.map((row, rIdx) => (
            <div
              key={rIdx}
              className={`flex items-center gap-1 sm:gap-1.5 ${
                rIdx === 1 ? 'ml-2 sm:ml-4' : rIdx === 2 ? 'ml-4 sm:ml-8' : rIdx === 3 ? 'ml-6 sm:ml-12' : ''
              }`}
            >
              {row.map((char) => {
                const data = getKeyMetricData(char);
                const isSelected = selectedKeyForDetail === data.lower || selectedKeyForDetail === char;

                return (
                  <button
                    key={char}
                    onClick={() => {
                      setSelectedKeyForDetail(data.lower);
                      onSelectDrillFromWeakKey(data.lower);
                    }}
                    title={`${data.key}: ${data.errors} errors, ${data.accuracy}% accuracy (${data.avgLatency}ms latency, ${data.total} hits). Finger: ${data.finger?.name || 'Unknown'}`}
                    className={`w-8 sm:w-11 h-10 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs ${
                      data.colorClass
                    } ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-bold font-mono">{data.key}</span>
                    <span className="text-[8px] sm:text-[9px] mt-0.5 opacity-90 font-mono">
                      {data.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected Key Diagnostic Card */}
        {selectedKeyForDetail && (
          <div className={`p-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex flex-wrap items-center justify-between gap-3 text-xs`}>
            {(() => {
              const data = getKeyMetricData(selectedKeyForDetail);
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                      {data.key}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-200">
                        {data.key} Performance: {data.avgLatency}ms Latency • {data.accuracy}% Accuracy
                      </div>
                      <div className={`text-[11px] ${theme.textMuted}`}>
                        Finger: {data.finger?.name || 'Home Row'} • {data.total} Total Keystrokes • {data.errors} Miskeys
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDrillFromWeakKey(data.lower)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-semibold hover:bg-cyan-400 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice Key {data.key}</span>
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Hand Balance & Best Times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Hand Load Symmetry */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
              <Layers className="w-4 h-4" />
              <span>Hand Load Balance</span>
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5 font-sans`}>
              Workload distribution between left and right hand keystrokes
            </p>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Left Hand: {handBalance.left}% ({handBalance.leftCount} hits)</span>
                <span>Right Hand: {handBalance.right}% ({handBalance.rightCount} hits)</span>
              </div>
              <div className={`w-full h-3 rounded-full ${theme.cardBgSubtle} overflow-hidden flex`}>
                <div className={`h-full ${theme.accentBg}`} style={{ width: `${handBalance.left}%` }} />
                <div className="h-full bg-zinc-500 opacity-60" style={{ width: `${handBalance.right}%` }} />
              </div>
              <p className={`text-[11px] ${theme.textMuted} mt-2 font-sans`}>
                Ideal symmetry is ~50% per hand for balanced muscle endurance and maximum burst stability.
              </p>
            </div>
          </div>
        </div>

        {/* Bests by Duration */}
        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
              <Clock className="w-4 h-4" />
              <span>Sprint Records</span>
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-0.5 font-sans`}>
              Personal bests across time trials
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle}`}>
              <div className={`text-[10px] ${theme.textMuted} uppercase`}>15s</div>
              <div className={`text-lg font-bold ${theme.textPrimary} mt-0.5`}>{stats.bestWpm15s}</div>
              <div className="text-[9px] text-zinc-500">wpm</div>
            </div>
            <div className={`p-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle}`}>
              <div className={`text-[10px] ${theme.textMuted} uppercase`}>30s</div>
              <div className={`text-lg font-bold ${theme.textPrimary} mt-0.5`}>{stats.bestWpm30s}</div>
              <div className="text-[9px] text-zinc-500">wpm</div>
            </div>
            <div className={`p-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle}`}>
              <div className={`text-[10px] ${theme.textMuted} uppercase`}>60s</div>
              <div className={`text-lg font-bold ${theme.textPrimary} mt-0.5`}>{stats.bestWpm60s}</div>
              <div className="text-[9px] text-zinc-500">wpm</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
              <Calendar className="w-4 h-4" />
              <span>Session Log ({filteredResults.length})</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-history-json-btn"
              onClick={handleExportJSON}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.borderSubtle} ${theme.cardBgSubtle} text-xs font-medium ${theme.textPrimary} hover:border-zinc-400 transition-all`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {results.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your typing history?')) {
                    onClearHistory();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-xs font-medium text-rose-500 hover:bg-rose-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {filteredResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${theme.borderSubtle} ${theme.textMuted} text-[10px] uppercase`}>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3">WPM</th>
                  <th className="py-2 px-3">Raw</th>
                  <th className="py-2 px-3">Accuracy</th>
                  <th className="py-2 px-3">Consistency</th>
                  <th className="py-2 px-3">Duration</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.borderSubtle} ${theme.textPrimary}`}>
                {filteredResults.slice(0, 15).map((r) => (
                  <tr key={r.id} className={`hover:${theme.cardBgSubtle} transition-colors`}>
                    <td className={`py-2.5 px-3 ${theme.textMuted}`}>
                      {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      {r.modeDetail}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {r.wpm}
                    </td>
                    <td className={`py-2.5 px-3 ${theme.textMuted}`}>{r.rawWpm}</td>
                    <td className="py-2.5 px-3 text-emerald-500 font-medium">{r.accuracy}%</td>
                    <td className="py-2.5 px-3">{r.consistency}%</td>
                    <td className={`py-2.5 px-3 ${theme.textMuted}`}>{r.duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`py-8 text-center text-xs ${theme.textMuted}`}>
            No test history found. Complete a typing run to see your results!
          </div>
        )}
      </div>
    </div>
  );
};
