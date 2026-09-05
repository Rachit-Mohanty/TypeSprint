import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Trophy,
  RotateCcw,
  Crosshair,
  Zap,
  Gauge,
  Clock,
  Target,
  AlertTriangle,
  Sparkles,
  Flame,
  Award,
  Shield,
  ArrowRight,
  Bot,
  Send,
  Check,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';
import { TestResult, AICoachingFeedback } from '../types';
import { ThemeConfig } from '../utils/themes';
import { extractWeakKeys } from '../utils/analytics';
import { getLevelFromXp, DIFFICULTY_CONFIG } from '../utils/gamification';
import { getAICoachingFeedback, submitLeaderboardScore, generateAIWeakKeyDrill } from '../utils/aiService';

interface ResultModalProps {
  result: TestResult;
  bestWpmOverall: number;
  theme: ThemeConfig;
  onRestart: () => void;
  onPracticeMissedKeys: (keys: string[]) => void;
  onLaunchCustomDrill?: (words: string[], title: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  bestWpmOverall,
  theme,
  onRestart,
  onPracticeMissedKeys,
  onLaunchCustomDrill,
}) => {
  const isNewPersonalBest = result.wpm > 0 && result.wpm >= bestWpmOverall;
  const weakKeys = extractWeakKeys(result.keyStats, 4);

  const diffConfig = DIFFICULTY_CONFIG[result.difficulty || 'normal'];
  const score = result.score || 0;
  const maxStreak = result.maxStreak || 0;
  const xpEarned = result.xpEarned || 0;

  // AI Coaching Feedback State
  const [aiCoach, setAiCoach] = useState<AICoachingFeedback | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);
  const [isGeneratingAiDrill, setIsGeneratingAiDrill] = useState<boolean>(false);

  // Leaderboard Submission State
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Trigger confetti on personal best or high streak
  useEffect(() => {
    if (isNewPersonalBest || maxStreak >= 25) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      } catch (e) {}
    }
  }, [isNewPersonalBest, maxStreak]);

  // Keyboard shortcut: Tab + Enter or Enter to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't restart if typing in username input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  // Request AI Coaching Analysis
  const handleRequestAiCoaching = async () => {
    setIsLoadingCoach(true);
    try {
      const feedback = await getAICoachingFeedback(
        result.wpm,
        result.rawWpm,
        result.accuracy,
        result.consistency,
        result.duration,
        weakKeys.map((w) => ({ key: w.key, accuracy: w.accuracy }))
      );
      setAiCoach(feedback);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  // Generate & Launch AI Drill from weak keys
  const handleLaunchAiDrill = async () => {
    if (!onLaunchCustomDrill) {
      onPracticeMissedKeys(weakKeys.map((w) => w.key));
      return;
    }
    setIsGeneratingAiDrill(true);
    try {
      const keysToPractice = weakKeys.length > 0 ? weakKeys.map((w) => w.key) : ['c', 'p', 'b'];
      const drill = await generateAIWeakKeyDrill(keysToPractice, result.wpm, result.difficulty);
      onLaunchCustomDrill(drill.words, drill.drillTitle);
    } catch (e) {
      onPracticeMissedKeys(weakKeys.map((w) => w.key));
    } finally {
      setIsGeneratingAiDrill(false);
    }
  };

  // Submit score to global leaderboard
  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{2,20}$/;

  const handleSubmitToLeaderboard = async (e: React.FormEvent) => {
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

    setIsSubmittingScore(true);
    try {
      const res = await submitLeaderboardScore(
        sanitizedUsername,
        result.wpm,
        result.accuracy,
        result.modeDetail || '30s',
        {
          duration: result.duration,
          rawWpm: result.rawWpm,
          charactersTyped: result.charactersTyped,
          errorCount: (result.incorrectChars || 0) + (result.extraChars || 0),
          timestamp: result.timestamp,
        }
      );
      if (res && res.rank) {
        setSubmittedRank(res.rank);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit score');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  return (
    <div
      id="test-result-view"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4 animate-fade-in font-sans"
    >
      {/* Personal Best Alert Banner */}
      {isNewPersonalBest && (
        <div className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold tracking-wider uppercase shadow-xs`}>
          <Trophy className="w-4 h-4" />
          <span>New Personal Best!</span>
        </div>
      )}

      {/* Hero Performance Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {/* WPM Hero */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Speed</span>
            <Zap className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <div className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {result.wpm}
            </div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>
              Raw: <span className="font-bold">{result.rawWpm}</span> wpm
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Accuracy</span>
            <Crosshair className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <div className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {result.accuracy}%
            </div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>
              Errors: <span className="font-bold text-rose-500">{result.incorrectChars}</span>
            </div>
          </div>
        </div>

        {/* Consistency */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Consistency</span>
            <Gauge className={`w-3.5 h-3.5 ${theme.accent}`} />
          </div>
          <div className="mt-3">
            <div className={`text-4xl sm:text-5xl font-light tracking-tight ${theme.textPrimary}`}>
              {result.consistency}%
            </div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>
              Rhythm Index
            </div>
          </div>
        </div>

        {/* Gamification Score & Streak */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between`}>
          <div className={`flex items-center justify-between text-xs font-medium ${theme.textMuted}`}>
            <span>Score &amp; XP</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className={`text-3xl sm:text-4xl font-light tracking-tight text-amber-400`}>
              {score.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>+{xpEarned} XP</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{maxStreak}x streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Progression Timeline Chart */}
      <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs`}>
        <div className="flex items-center justify-between mb-4 font-mono">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
              Pacing &amp; Velocity Curve
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
              <span className={theme.textSecondary}>Net WPM</span>
            </div>
            <div className={`flex items-center gap-1 ${theme.textMuted}`}>
              <span className="w-2 h-2 rounded-full bg-zinc-400 opacity-50" />
              <span>Raw</span>
            </div>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.wpmTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.isDark ? '#f59e0b' : '#18181b'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={theme.isDark ? '#f59e0b' : '#18181b'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="second" stroke={theme.isDark ? '#52525b' : '#a1a1aa'} fontSize={10} tickLine={false} unit="s" />
              <YAxis stroke={theme.isDark ? '#52525b' : '#a1a1aa'} fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.isDark ? '#18191e' : '#ffffff',
                  borderColor: theme.isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: theme.isDark ? '#f4f4f5' : '#18181b',
                }}
                labelFormatter={(label) => `${label}s`}
              />
              <Area type="monotone" dataKey="wpm" stroke={theme.isDark ? '#f59e0b' : '#18181b'} strokeWidth={2} fillOpacity={1} fill="url(#wpmGradient)" name="Net WPM" />
              <Area type="monotone" dataKey="rawWpm" stroke="#71717a" strokeWidth={1} strokeDasharray="2 2" fill="none" name="Raw WPM" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini AI Performance Coach Section */}
      <div
        id="ai-coaching-section"
        className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <span>Gemini AI Biomechanical Coach</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                  Smart Diagnostics
                </span>
              </div>
              <p className={`text-xs ${theme.textSecondary}`}>
                Deep diagnostic analysis of finger pacing, deceleration bottlenecks, and weak key habits
              </p>
            </div>
          </div>

          {!aiCoach && (
            <button
              id="get-ai-coach-btn"
              onClick={handleRequestAiCoaching}
              disabled={isLoadingCoach}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-medium ${
                isLoadingCoach
                  ? 'opacity-60 cursor-not-allowed bg-zinc-800'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs'
              } transition-all active:scale-95`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingCoach ? 'animate-spin' : ''}`} />
              <span>{isLoadingCoach ? 'Analyzing Biometrics...' : 'Analyze Run'}</span>
            </button>
          )}
        </div>

        {/* AI Coach Results Display */}
        {aiCoach && (
          <div className="flex flex-col gap-4 mt-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 animate-fade-in font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                Verdict: {aiCoach.verdict}
              </span>
              <button
                id="launch-ai-drill-btn"
                onClick={handleLaunchAiDrill}
                disabled={isGeneratingAiDrill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGeneratingAiDrill ? 'Drafting Custom Drill...' : 'Practice Recommended Drill'}</span>
              </button>
            </div>

            <p className={`text-xs ${theme.textPrimary} font-sans leading-relaxed`}>
              {aiCoach.diagnosis}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
              {aiCoach.mechanicalTips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex flex-col gap-1`}
                >
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                    Tactical Key #{idx + 1}
                  </span>
                  <span className={`${theme.textSecondary} text-xs leading-normal`}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Leaderboard Submission Card */}
      <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs font-mono flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Global Leaderboard
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>
              Post your {result.wpm} WPM result to compare with world typists
            </div>
          </div>
        </div>

        {submittedRank ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <Check className="w-4 h-4" />
            <span>Ranked #{submittedRank} Globally!</span>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <form onSubmit={handleSubmitToLeaderboard} className="flex items-center gap-2">
              <div className="relative flex items-center">
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
                  className={`px-3 py-1.5 pr-10 rounded-xl text-xs font-mono ${theme.cardBgSubtle} border ${theme.borderSubtle} focus:outline-hidden focus:ring-1 focus:ring-amber-400`}
                />
                <span className="absolute right-2 text-[10px] text-zinc-500 font-mono pointer-events-none select-none">
                  {usernameInput.length}/20
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmittingScore || usernameInput.trim().length < 2}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmittingScore ? 'Posting...' : 'Submit'}</span>
              </button>
            </form>
            {submitError && (
              <span className="text-[11px] text-rose-400 font-sans">{submitError}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions & Missed Keys */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono">
        {/* Missed Keys */}
        {weakKeys.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs ${theme.textSecondary} flex items-center gap-1 font-medium`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Missed keys:
            </span>
            <div className="flex items-center gap-1.5">
              {weakKeys.map((wk) => (
                <span
                  key={wk.key}
                  className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold"
                  title={`${wk.accuracy}% accuracy`}
                >
                  {wk.key}
                </span>
              ))}
            </div>
            <button
              id="drill-missed-keys-btn"
              onClick={() => onPracticeMissedKeys(weakKeys.map((w) => w.key))}
              className={`text-xs ${theme.accent} hover:underline ml-2 flex items-center gap-1 font-medium`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Practice Missed Keys</span>
            </button>
          </div>
        ) : (
          <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5 font-medium`}>
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Flawless accuracy run</span>
          </div>
        )}

        {/* Restart Action */}
        <div className="flex items-center gap-2">
          <button
            id="retry-test-btn"
            onClick={onRestart}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-mono font-medium shadow-xs hover:opacity-90 transition-all active:scale-95`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              Next test <kbd className="px-1 py-0.5 rounded bg-black/20 text-[10px]">tab</kbd>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
