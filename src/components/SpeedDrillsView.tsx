import React from 'react';
import { Zap, Target, Code, Hash, Trophy, Sparkles, Play, CheckCircle } from 'lucide-react';
import { OverallStats } from '../types';
import { ThemeConfig } from '../utils/themes';
import { extractWeakKeys } from '../utils/analytics';
import {
  generateRandomWords,
  generateTrigramPractice,
  generateWeakKeyDrill,
  generateNumbersAndPunctuation,
  TOP_200_WORDS,
  TOP_1000_WORDS,
  CODE_SNIPPETS,
  BURST_DRILL_SETS,
} from '../data/wordLists';

interface SpeedDrillsViewProps {
  stats: OverallStats;
  theme: ThemeConfig;
  onLaunchDrill: (words: string[], drillTitle: string) => void;
}

export const SpeedDrillsView: React.FC<SpeedDrillsViewProps> = ({
  stats,
  theme,
  onLaunchDrill,
}) => {
  const weakKeys = extractWeakKeys(stats.allKeyStats, 6);

  const handleLaunchBurst = () => {
    const randomSet = BURST_DRILL_SETS[Math.floor(Math.random() * BURST_DRILL_SETS.length)];
    onLaunchDrill(randomSet, 'Burst Sprint');
  };

  const handleLaunchTrigrams = () => {
    const words = generateTrigramPractice(25);
    onLaunchDrill(words, 'Trigrams Drill');
  };

  const handleLaunchTop200 = () => {
    const words = generateRandomWords(30, TOP_200_WORDS);
    onLaunchDrill(words, 'Top 200 Core Words');
  };

  const handleLaunchTop1000 = () => {
    const words = generateRandomWords(35, TOP_1000_WORDS);
    onLaunchDrill(words, 'Top 1000 Vocabulary');
  };

  const handleLaunchCode = () => {
    const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    onLaunchDrill(snippet.split(' '), 'Code Syntax');
  };

  const handleLaunchNumbers = () => {
    const words = generateNumbersAndPunctuation(25);
    onLaunchDrill(words, 'Numbers & Punctuation');
  };

  const handleLaunchWeakKeys = (keys?: string[]) => {
    const targetKeys = keys || weakKeys.map((k) => k.key);
    const words = generateWeakKeyDrill(targetKeys, 25);
    const label = targetKeys.length > 0 ? `Weak Keys (${targetKeys.join(', ')})` : 'Targeted Drill';
    onLaunchDrill(words, label);
  };

  const milestones = [
    { name: 'Novice', targetWpm: 40, achieved: stats.bestWpmOverall >= 40 },
    { name: 'Fluent', targetWpm: 60, achieved: stats.bestWpmOverall >= 60 },
    { name: 'Racer', targetWpm: 80, achieved: stats.bestWpmOverall >= 80 },
    { name: 'Speed Demon', targetWpm: 100, achieved: stats.bestWpmOverall >= 100 },
    { name: 'Master', targetWpm: 120, achieved: stats.bestWpmOverall >= 120 },
  ];

  return (
    <div id="speed-drills-container" className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
            <span className={`text-xs font-mono font-medium ${theme.textMuted} uppercase tracking-wider`}>
              Speed Acceleration
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
            Targeted Drills & Muscle Memory
          </h2>
          <p className={`text-sm ${theme.textSecondary} mt-1 max-w-2xl`}>
            Break through typing plateaus by training common syllables, tricky symbol reaches, and weak finger patterns.
          </p>
        </div>

        <button
          id="quick-burst-sprint-btn"
          onClick={handleLaunchBurst}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-mono font-medium shadow-xs hover:opacity-90 transition-all active:scale-95 shrink-0`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick Burst Sprint</span>
        </button>
      </div>

      {/* Weak Keys Diagnostic */}
      {weakKeys.length > 0 && (
        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} flex items-center gap-2`}>
                <Target className="w-4 h-4 text-rose-500" />
                <span>Weak Keys Identified</span>
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-0.5 font-sans`}>
                These characters triggered errors during your recent sessions
              </p>
            </div>

            <button
              id="practice-all-weak-keys-btn"
              onClick={() => handleLaunchWeakKeys()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-xs text-rose-500 font-medium hover:bg-rose-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Drill All ({weakKeys.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {weakKeys.map((wk) => (
              <div
                key={wk.key}
                className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-bold ${theme.textPrimary}`}>{wk.key.toUpperCase()}</span>
                  <span className="text-xs font-bold text-rose-500">{wk.accuracy}%</span>
                </div>
                <div className={`text-[10px] ${theme.textMuted} mt-1`}>
                  {wk.total} taps
                </div>
                <button
                  onClick={() => handleLaunchWeakKeys([wk.key])}
                  className={`mt-2 w-full py-1 text-xs font-medium rounded-lg ${theme.cardBg} border ${theme.borderSubtle} ${theme.textPrimary} hover:${theme.accentBg} hover:${theme.accentText} transition-all flex items-center justify-center gap-1`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Drill</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill Library */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {/* 1. Trigram & N-Gram */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>N-Grams</span>
              <Zap className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Trigrams & Syllables
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              Practice frequent syllables like <em>the, ing, ion, ent</em> so your fingers execute them seamlessly.
            </p>
          </div>
          <button
            id="launch-trigram-drill-btn"
            onClick={handleLaunchTrigrams}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Syllables</span>
          </button>
        </div>

        {/* 2. Top 200 Core */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>Core 80%</span>
              <Target className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Top 200 Common Words
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              The 200 most frequent words represent over half of everyday typing. Build solid muscle memory here.
            </p>
          </div>
          <button
            id="launch-top200-drill-btn"
            onClick={handleLaunchTop200}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Top 200</span>
          </button>
        </div>

        {/* 3. Top 1000 Words */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>Advanced</span>
              <Sparkles className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Top 1000 Vocabulary
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              Expands vocabulary to 7-10 letter words requiring multi-finger coordination across both hands.
            </p>
          </div>
          <button
            id="launch-top1000-drill-btn"
            onClick={handleLaunchTop1000}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Top 1000</span>
          </button>
        </div>

        {/* 4. Code Syntax */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>Syntax</span>
              <Code className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Code & Developer Syntax
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              Practice brackets <code>{"{}[];=>()"}</code> and programming symbols without losing rhythm.
            </p>
          </div>
          <button
            id="launch-code-drill-btn"
            onClick={handleLaunchCode}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Code</span>
          </button>
        </div>

        {/* 5. Numbers & Punctuation */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>Top Row</span>
              <Hash className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Numbers & Punctuation
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              Reach numerical and shift keys smoothly without breaking typing posture.
            </p>
          </div>
          <button
            id="launch-numbers-drill-btn"
            onClick={handleLaunchNumbers}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Numbers</span>
          </button>
        </div>

        {/* 6. Burst Sprints */}
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-md ${theme.cardBgSubtle} ${theme.textMuted} text-[10px] uppercase font-bold`}>Sprint</span>
              <Zap className={`w-3.5 h-3.5 ${theme.accent}`} />
            </div>
            <h3 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mt-3 font-sans`}>
              Hyper Speed Bursts
            </h3>
            <p className={`text-xs ${theme.textSecondary} mt-1 font-sans leading-relaxed`}>
              Short 5-word rapid sprints to get comfortable pacing at 100+ WPM.
            </p>
          </div>
          <button
            id="launch-burst-drill-btn"
            onClick={handleLaunchBurst}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.accentBg} hover:${theme.accentText} border ${theme.borderSubtle} text-xs font-medium transition-all`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Practice Sprints</span>
          </button>
        </div>
      </div>

      {/* Speed Milestones */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono`}>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
            Speed Milestones
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {milestones.map((m) => (
            <div
              key={m.name}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                m.achieved
                  ? `${theme.accentBg} ${theme.accentText} border-transparent shadow-xs`
                  : `${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textSecondary}`
              }`}
            >
              <Trophy className={`w-4 h-4 mb-1 ${m.achieved ? 'text-amber-300 fill-amber-300' : 'opacity-30'}`} />
              <span className="text-xs font-bold">{m.name}</span>
              <span className="text-[11px] opacity-80 mt-0.5">{m.targetWpm} WPM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
