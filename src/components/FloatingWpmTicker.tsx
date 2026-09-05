import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, Trophy, Target } from 'lucide-react';
import { DifficultyLevel, TestMode } from '../types';
import { getSpeedTier, getStreakMultiplier } from '../utils/gamification';

interface FloatingWpmTickerProps {
  isVisible: boolean;
  liveWpm: number;
  liveAccuracy: number;
  currentStreak: number;
  liveScore: number;
  totalXp: number;
  difficulty: DifficultyLevel;
  mode: TestMode;
  timeLeft: number;
  totalTime: number;
  wordIndex: number;
  totalWords: number;
  latestScoreDelta?: number;
  wpmDelta?: number;
}

export const FloatingWpmTicker: React.FC<FloatingWpmTickerProps> = ({
  isVisible,
  liveWpm,
  liveAccuracy,
  currentStreak,
  liveScore,
  difficulty,
  mode,
  timeLeft,
  totalTime,
  wordIndex,
  totalWords,
}) => {
  const speedTier = getSpeedTier(liveWpm);
  const streakMult = getStreakMultiplier(currentStreak);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="floating-wpm-ticker"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full flex items-center justify-between px-2 mb-2 font-mono select-none pointer-events-none"
        >
          {/* Accessible summary for screen readers */}
          <span className="sr-only">
            Speed: {liveWpm} WPM, Accuracy: {liveAccuracy}%, Streak: {currentStreak}, Progress: {mode === 'time' ? `${timeLeft} seconds left` : `Word ${wordIndex} of ${totalWords}`}.
          </span>

          {/* Live WPM & Tier */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light tracking-tight">
              {liveWpm}
            </span>
            <span className="text-xs font-medium uppercase opacity-50">
              wpm
            </span>
            {liveWpm > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                {speedTier.label}
              </span>
            )}
          </div>

          {/* Center: Streak & Accuracy */}
          <div className="flex items-center gap-3">
            {currentStreak >= 5 && (
              <div className="flex items-center gap-1 text-xs text-amber-400 font-medium animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{currentStreak}x streak</span>
                <span className="text-[10px] opacity-75">({streakMult.toFixed(1)}x)</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs opacity-70">
              <Target className="w-3 h-3" />
              <span>{liveAccuracy}%</span>
            </div>
          </div>

          {/* Right: Time / Word Progress */}
          <div className="flex items-center gap-1 text-sm font-medium opacity-80">
            <Clock className="w-3.5 h-3.5" />
            <span>{mode === 'time' ? `${timeLeft}s` : `${wordIndex}/${totalWords}`}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
