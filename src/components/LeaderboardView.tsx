import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Globe, RefreshCw, Send, Check, Search, Zap, Crosshair } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ThemeConfig } from '../utils/themes';
import { OverallStats, LeaderboardEntry } from '../types';
import { fetchLeaderboard, submitLeaderboardScore } from '../utils/aiService';

interface LeaderboardViewProps {
  theme: ThemeConfig;
  stats: OverallStats;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ theme, stats }) => {
  const [activeMode, setActiveMode] = useState<string>('30s');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = async (mode: string) => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard(mode);
      setEntries(data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeMode);
  }, [activeMode]);

  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{2,20}$/;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setSubmitError('Please enter a username.');
      return;
    }

    if (trimmed.length < 2 || trimmed.length > 20) {
      setSubmitError('Username must be between 2 and 20 characters.');
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setSubmitError('Username can only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    const sanitizedUsername = DOMPurify.sanitize(trimmed, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    if (!sanitizedUsername) {
      setSubmitError('Invalid username provided.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetWpm =
        activeMode === '15s'
          ? stats.bestWpm15s || stats.bestWpmOverall
          : activeMode === '60s'
          ? stats.bestWpm60s || stats.bestWpmOverall
          : stats.bestWpm30s || stats.bestWpmOverall;

      const durationSecs = activeMode === '15s' ? 15 : activeMode === '60s' ? 60 : 30;
      const accuracyRate = stats.averageAccuracy || 98;
      const expectedChars = Math.round((targetWpm * 5 * durationSecs) / 60);

      await submitLeaderboardScore(
        sanitizedUsername,
        targetWpm || 60,
        accuracyRate,
        activeMode,
        {
          duration: durationSecs,
          rawWpm: targetWpm || 60,
          charactersTyped: expectedChars,
          errorCount: Math.round(expectedChars * (1 - accuracyRate / 100)),
          timestamp: Date.now(),
        }
      );
      setSubmitSuccess(true);
      await loadData(activeMode);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit score');
      setTimeout(() => setSubmitError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="global-leaderboards-view" className="w-full max-w-5xl mx-auto py-2 sm:py-6 flex flex-col gap-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-3 border border-amber-400/30 bg-amber-400/10 text-amber-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Sprint Rankings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Hall of Velocity
            </h1>
            <p className={`text-sm ${theme.textSecondary}`}>
              Compare tactile velocity against global typists. Verified net speeds, sub-second latency, and precision ratings.
            </p>
          </div>

          {/* Quick Submit Widget */}
          <div className={`p-4 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex flex-col gap-2.5 min-w-[280px]`}>
            <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Submit Your PB ({activeMode})</span>
            </span>
            <span className={`text-[11px] ${theme.textMuted}`}>
              PB: {activeMode === '15s' ? stats.bestWpm15s : activeMode === '60s' ? stats.bestWpm60s : stats.bestWpm30s || stats.bestWpmOverall} WPM
            </span>
            <form onSubmit={handleSubmitScore} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Handle (2-20 chars)..."
                  value={usernameInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
                    setUsernameInput(clean);
                    if (submitError) setSubmitError(null);
                  }}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]{2,20}"
                  className={`w-full px-3 py-1.5 pr-10 rounded-xl text-xs font-mono ${theme.cardBg} border ${theme.borderSubtle} focus:outline-hidden focus:ring-1 focus:ring-amber-400`}
                />
                <span className="absolute right-2 text-[10px] text-zinc-500 font-mono pointer-events-none select-none">
                  {usernameInput.length}/20
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || usernameInput.trim().length < 2}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitSuccess ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                <span>{submitSuccess ? 'Ranked!' : 'Post'}</span>
              </button>
            </form>
            {submitError && (
              <span className="text-[11px] text-rose-400 font-sans">{submitError}</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Mode Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className={`inline-flex p-1 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
          {['15s', '30s', '60s', 'code'].map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                activeMode === m
                  ? `${theme.accentBg} ${theme.accentText} shadow-xs`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              {m === 'code' ? 'Code Studio' : `${m} Sprint`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
            <Search className={`w-3.5 h-3.5 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Search typist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-mono focus:outline-hidden w-32 sm:w-44"
            />
          </div>

          <button
            onClick={() => loadData(activeMode)}
            title="Refresh Leaderboard"
            className={`p-2 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} hover:${theme.cardBgSubtle} transition-colors`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Podium Top 3 Cards */}
      {filteredEntries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Rank 2 - Silver */}
          <div className={`p-5 rounded-2xl ${theme.cardBg} border border-zinc-400/30 flex flex-col justify-between order-2 md:order-1 relative shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-400/10 text-zinc-300 border border-zinc-400/20">
                #2 Silver
              </span>
              <Medal className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="my-3">
              <div className="text-sm font-bold text-zinc-200 truncate">{filteredEntries[1]?.username}</div>
              <div className="text-3xl font-light text-zinc-100 mt-1">{filteredEntries[1]?.wpm} <span className="text-xs text-zinc-400">WPM</span></div>
            </div>
            <div className="text-xs text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-800">
              <span>{filteredEntries[1]?.accuracy}% acc</span>
              <span>{filteredEntries[1]?.date}</span>
            </div>
          </div>

          {/* Rank 1 - Gold */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border-2 border-amber-500/50 flex flex-col justify-between order-1 md:order-2 relative shadow-lg shadow-amber-500/5`}>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> #1 Champion
              </span>
              <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="my-3">
              <div className="text-base font-bold text-amber-300 truncate">{filteredEntries[0]?.username}</div>
              <div className="text-4xl font-light text-amber-400 mt-1">{filteredEntries[0]?.wpm} <span className="text-sm text-zinc-400">WPM</span></div>
            </div>
            <div className="text-xs text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-amber-400 font-semibold">{filteredEntries[0]?.accuracy}% accuracy</span>
              <span>{filteredEntries[0]?.date}</span>
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className={`p-5 rounded-2xl ${theme.cardBg} border border-amber-700/30 flex flex-col justify-between order-3 relative shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-700/10 text-amber-600 border border-amber-700/20">
                #3 Bronze
              </span>
              <Medal className="w-5 h-5 text-amber-600" />
            </div>
            <div className="my-3">
              <div className="text-sm font-bold text-zinc-200 truncate">{filteredEntries[2]?.username}</div>
              <div className="text-3xl font-light text-zinc-100 mt-1">{filteredEntries[2]?.wpm} <span className="text-xs text-zinc-400">WPM</span></div>
            </div>
            <div className="text-xs text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-800">
              <span>{filteredEntries[2]?.accuracy}% acc</span>
              <span>{filteredEntries[2]?.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Full Table */}
      <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs font-mono overflow-x-auto`}>
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className={`border-b ${theme.borderSubtle} ${theme.textMuted} text-[10px] uppercase`}>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Typist</th>
              <th className="py-2.5 px-3">Net WPM</th>
              <th className="py-2.5 px-3">Accuracy</th>
              <th className="py-2.5 px-3">Sprint Mode</th>
              <th className="py-2.5 px-3 text-right">Recorded</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.borderSubtle} ${theme.textPrimary}`}>
            {filteredEntries.map((e) => {
              const isTop3 = e.rank && e.rank <= 3;
              return (
                <tr
                  key={e.id}
                  className={`hover:${theme.cardBgSubtle} transition-colors ${
                    e.isCurrentUser ? 'bg-amber-500/10 font-bold' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                        e.rank === 1
                          ? 'bg-amber-500 text-black'
                          : e.rank === 2
                          ? 'bg-zinc-300 text-black'
                          : e.rank === 3
                          ? 'bg-amber-700 text-white'
                          : `${theme.cardBgSubtle} ${theme.textMuted}`
                      }`}
                    >
                      {e.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <span className="font-semibold">{e.username}</span>
                    {e.isCurrentUser && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-black font-bold">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-sm text-zinc-100">
                    {e.wpm} <span className="text-[10px] font-normal text-zinc-500">WPM</span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-medium">{e.accuracy}%</td>
                  <td className="py-3 px-3 text-zinc-400 uppercase text-[11px]">{e.mode}</td>
                  <td className="py-3 px-3 text-right text-zinc-500">{e.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
