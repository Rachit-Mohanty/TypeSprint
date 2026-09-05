import React from 'react';
import { BookOpen, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { ThemeConfig } from '../utils/themes';

interface TouchTypingGuideViewProps {
  theme: ThemeConfig;
  onLaunchPractice: () => void;
}

export const TouchTypingGuideView: React.FC<TouchTypingGuideViewProps> = ({
  theme,
  onLaunchPractice,
}) => {
  return (
    <div id="touch-typing-guide-container" className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4 animate-fade-in font-sans">
      {/* Hero Header */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-2`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
          <span className={`text-xs font-mono font-medium ${theme.textMuted} uppercase tracking-wider`}>
            Technique Guide
          </span>
        </div>
        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
          Touch Typing Principles & Habit Building
        </h2>
        <p className={`text-sm ${theme.textSecondary} leading-relaxed max-w-3xl mt-1`}>
          High speed is not about frantic fingers — it is about eliminating hesitations, preserving rhythm, and reading ahead in chunks.
        </p>
      </div>

      {/* The 4 Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-lg ${theme.accentBg} ${theme.accentText} font-mono font-bold flex items-center justify-center text-xs shadow-xs`}>
              01
            </span>
            <h3 className={`text-sm font-bold ${theme.textPrimary}`}>Home Row Anchoring</h3>
          </div>
          <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
            Rest your index fingers on the tactile bumps on <strong className={theme.textPrimary}>F</strong> and <strong className={theme.textPrimary}>J</strong>. Keep your palms slightly elevated and pivot fingers gently from this home anchor.
          </p>
        </div>

        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-lg ${theme.accentBg} ${theme.accentText} font-mono font-bold flex items-center justify-center text-xs shadow-xs`}>
              02
            </span>
            <h3 className={`text-sm font-bold ${theme.textPrimary}`}>Accuracy is Speed</h3>
          </div>
          <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
            A single error costs over <strong className="text-rose-500">1.5 seconds</strong> in backspacing and reorientation. Prioritize 98%+ accuracy; effortless speed emerges naturally.
          </p>
        </div>

        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-lg ${theme.accentBg} ${theme.accentText} font-mono font-bold flex items-center justify-center text-xs shadow-xs`}>
              03
            </span>
            <h3 className={`text-sm font-bold ${theme.textPrimary}`}>Look-Ahead Buffer</h3>
          </div>
          <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
            Keep your gaze 1-2 words ahead of the cursor. Your cognitive buffer prepares the next words while your fingers execute current muscle movements.
          </p>
        </div>

        <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-lg ${theme.accentBg} ${theme.accentText} font-mono font-bold flex items-center justify-center text-xs shadow-xs`}>
              04
            </span>
            <h3 className={`text-sm font-bold ${theme.textPrimary}`}>Syllable Chunks</h3>
          </div>
          <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
            Rather than individual letters, train your fingers to execute full syllables ("ing", "tion", "the") in one unified rhythm ripple.
          </p>
        </div>
      </div>

      {/* Routine Card */}
      <div className={`p-5 sm:p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col gap-4 font-mono text-xs`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${theme.accent}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary}`}>
            Recommended 10-Minute Routine
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
            <div className={`${theme.textPrimary} font-bold uppercase text-xs mb-1`}>1. Warmup (2 Mins)</div>
            <div className={`${theme.textSecondary} text-[11px]`}>
              Top 200 Core words at moderate cadence with zero typos.
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
            <div className={`${theme.textPrimary} font-bold uppercase text-xs mb-1`}>2. Weak Keys (3 Mins)</div>
            <div className={`${theme.textSecondary} text-[11px]`}>
              Target slowest characters and error-prone symbol reaches.
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
            <div className={`${theme.textPrimary} font-bold uppercase text-xs mb-1`}>3. Sprints (5 Mins)</div>
            <div className={`${theme.textSecondary} text-[11px]`}>
              30s or 60s timed tests to record progressive velocity gains.
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            id="start-practice-routine-btn"
            onClick={onLaunchPractice}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-mono font-medium shadow-xs hover:opacity-90 transition-all active:scale-95`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Start Practice Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
