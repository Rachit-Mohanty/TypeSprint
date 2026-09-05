import React, { useEffect } from 'react';
import { RotateCcw, AlertCircle, Ghost, ChevronRight, Zap } from 'lucide-react';
import { TestMode, TimeOption, WordCountOption, UserPreferences, TestResult } from '../types';
import { ThemeConfig } from '../utils/themes';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { FloatingWpmTicker } from './FloatingWpmTicker';

interface TypingAreaProps {
  mode: TestMode;
  timeOption: TimeOption;
  wordCountOption: WordCountOption;
  customText?: string;
  drillWords?: string[];
  drillTitle?: string;
  preferences: UserPreferences;
  theme: ThemeConfig;
  bestWpmOverall?: number;
  totalXp?: number;
  onFinishTest: (result: TestResult) => void;
  onTargetKeyChange?: (char: string) => void;
  onTypingStatusChange?: (isActive: boolean) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  mode,
  timeOption,
  wordCountOption,
  customText,
  drillWords,
  drillTitle,
  preferences,
  theme,
  bestWpmOverall = 0,
  totalXp = 0,
  onFinishTest,
  onTargetKeyChange,
  onTypingStatusChange,
}) => {
  const {
    words,
    quoteAuthor,
    inputWord,
    wordIndex,
    typedHistory,
    isStarted,
    isFinished,
    isFocused,
    setIsFocused,
    timeLeft,
    liveWpm,
    liveAccuracy,
    currentStreak,
    liveScore,
    latestScoreDelta,
    wpmDelta,
    activeDifficulty,
    ghostPosition,
    screenReaderAnnouncement,
    handleKeyDown,
    initTest,
    containerRef,
    wordsContainerRef,
    inputRef,
    activeWordRef,
  } = useTypingEngine({
    mode,
    timeOption,
    wordCountOption,
    customText,
    drillWords,
    drillTitle,
    preferences,
    bestWpmOverall,
    totalXp,
    onFinishTest,
    onTargetKeyChange,
    onTypingStatusChange,
  });

  // Auto-scroll to keep active word in view
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const activeEl = activeWordRef.current;
      const container = wordsContainerRef.current;
      const offsetTop = activeEl.offsetTop - container.offsetTop;
      if (offsetTop > 60) {
        container.scrollTo({ top: offsetTop - 40, behavior: 'smooth' });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [wordIndex]);

  // Windowing calculation: For large texts (over 45 words), window the rendered words around the caret
  // to avoid layout thrashing while preserving seamless continuous scrolling.
  const WINDOW_SIZE_BEFORE = 10;
  const WINDOW_SIZE_AFTER = 35;
  const shouldWindow = words.length > 50;
  const windowStart = shouldWindow ? Math.max(0, wordIndex - WINDOW_SIZE_BEFORE) : 0;
  const windowEnd = shouldWindow ? Math.min(words.length, wordIndex + WINDOW_SIZE_AFTER) : words.length;

  const visibleWords = shouldWindow ? words.slice(windowStart, windowEnd) : words;

  // Render individual character
  const renderCharacter = (
    expectedChar: string,
    charIndex: number,
    isCurrentWord: boolean,
    typedWord: string,
    actualWordIndex: number
  ) => {
    let charClass = theme.textMuted;
    let isCaretHere = false;

    if (isCurrentWord) {
      if (charIndex < typedWord.length) {
        const isMatch = typedWord[charIndex] === expectedChar;
        charClass = isMatch ? theme.correct : theme.incorrect;
      } else if (charIndex === typedWord.length) {
        charClass = `${theme.textPrimary} opacity-90`;
        isCaretHere = true;
      }
    }

    // Check if Pacing Ghost is at this exact character
    const isGhostHere =
      ghostPosition.isActive &&
      ghostPosition.wordIndex === actualWordIndex &&
      ghostPosition.charIndex === charIndex;

    return (
      <span key={charIndex} className="relative inline-block font-mono">
        {/* User Caret */}
        {isCaretHere && isFocused && (
          <span
            id="typing-caret"
            className={`absolute left-0 -top-0.5 bottom-0 ${
              preferences.caretStyle === 'block'
                ? `w-full bg-amber-400/30 -z-10 rounded-sm`
                : preferences.caretStyle === 'underline'
                ? `w-full h-0.5 bottom-0 top-auto ${theme.caret}`
                : `w-0.5 ${theme.caret} animate-pulse`
            }`}
          />
        )}

        {/* Pacing Ghost Caret */}
        {isGhostHere && (
          <span
            id="pacing-ghost-caret"
            title={`PB Ghost (${ghostPosition.targetWpm} WPM)`}
            className="absolute -left-0.5 -top-1 bottom-0 w-1 bg-cyan-400/70 dark:bg-cyan-300/80 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse pointer-events-none z-10"
          >
            <span className="absolute -top-3.5 -left-2 px-1 py-0.2 text-[8px] font-mono font-bold bg-cyan-500 text-black rounded-xs whitespace-nowrap shadow-xs scale-75 transform -translate-x-1/4">
              PB
            </span>
          </span>
        )}

        <span className={charClass}>{expectedChar}</span>
      </span>
    );
  };

  // Render extra characters typed
  const renderExtraCharacters = (typedWord: string, targetLength: number) => {
    if (typedWord.length <= targetLength) return null;
    const extra = typedWord.slice(targetLength);
    return (
      <span className="text-rose-500 bg-rose-500/20 underline opacity-90 font-mono">
        {extra}
      </span>
    );
  };

  return (
    <div
      id="typing-area-container"
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative cursor-text py-2 sm:py-6 select-none"
    >
      {/* Screen Reader Live Status Region */}
      <div
        id="typing-screen-reader-live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Screen Reader Instructions */}
      <div id="sr-typing-instructions" className="sr-only">
        Type each word separated by space. Press Tab or Escape to restart the test at any time.
      </div>

      {/* Floating WPM Ticker */}
      <FloatingWpmTicker
        isVisible={isStarted && !isFinished && preferences.floatingTicker !== false}
        liveWpm={liveWpm}
        liveAccuracy={liveAccuracy}
        currentStreak={currentStreak}
        liveScore={liveScore}
        totalXp={totalXp}
        difficulty={activeDifficulty}
        mode={mode}
        timeLeft={timeLeft}
        totalTime={timeOption}
        wordIndex={wordIndex}
        totalWords={words.length}
        latestScoreDelta={latestScoreDelta}
        wpmDelta={wpmDelta}
      />

      {/* Top Meta Bar: Countdown/Word Progress & Ghost Racing Status */}
      <div className="w-full flex items-center justify-between px-2 mb-2 font-mono">
        <div
          className={`text-2xl sm:text-3xl font-light ${theme.accent} transition-opacity ${
            isStarted ? 'opacity-90' : 'opacity-40'
          }`}
        >
          {mode === 'time' ? timeLeft : `${wordIndex} / ${words.length}`}
        </div>

        {/* Real-Time Ghost Racing Comparison Indicator */}
        {preferences.pacingGhost && (
          <div
            id="ghost-racing-indicator"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all ${
              ghostPosition.isActive
                ? ghostPosition.userAhead
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/10'
                : `bg-transparent ${theme.borderSubtle} ${theme.textMuted} opacity-60`
            }`}
          >
            <Ghost className={`w-3.5 h-3.5 ${ghostPosition.isActive ? 'animate-bounce' : ''}`} />
            <span className="text-[11px] font-medium">
              {ghostPosition.isReplay ? 'Ghost PB' : 'Ghost'}:
            </span>
            <span className="text-[11px] font-bold">{ghostPosition.targetWpm} WPM</span>
            {ghostPosition.isActive && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-xs ml-1 ${
                  ghostPosition.userAhead
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {ghostPosition.deltaChars > 0 ? `+${ghostPosition.deltaChars}` : ghostPosition.deltaChars} chars (
                {ghostPosition.userAhead ? 'Ahead' : 'Behind'})
              </span>
            )}
          </div>
        )}

        {quoteAuthor && (
          <span className={`text-xs font-sans italic ${theme.textMuted} truncate max-w-xs`}>
            — {quoteAuthor}
          </span>
        )}
      </div>

      {/* Ghost Racing Mini Progress Track */}
      {preferences.pacingGhost && isStarted && (
        <div
          id="ghost-racing-track"
          className="w-full mb-3 px-2 flex flex-col gap-1 text-[10px] font-mono text-zinc-400"
        >
          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden relative">
            {/* Ghost Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-cyan-400/80 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  words.length > 0
                    ? ((ghostPosition.wordIndex + ghostPosition.charIndex / 10) / words.length) * 100
                    : 0
                )}%`,
              }}
            />
            {/* User Progress */}
            <div
              className={`absolute top-0 bottom-0 left-0 ${theme.accentBg} opacity-90 transition-all duration-150 rounded-full`}
              style={{
                width: `${Math.min(100, words.length > 0 ? (wordIndex / words.length) * 100 : 0)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Accessible Capturing Input Field */}
      <input
        id="typing-hidden-input"
        ref={inputRef}
        type="text"
        role="textbox"
        aria-label="Typing test input field. Type the words displayed below."
        aria-describedby="sr-typing-instructions"
        aria-autocomplete="none"
        aria-multiline="false"
        value={inputWord}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 absolute -z-50 pointer-events-none"
      />

      {/* Screen reader live updates and static instructions */}
      <div id="sr-typing-instructions" className="sr-only">
        Type each displayed word followed by a space. Press Tab or Enter to restart the test at any time.
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {screenReaderAnnouncement || (words[wordIndex] ? `Current word: ${words[wordIndex]}` : '')}
      </div>

      {/* Focus Alert Overlay */}
      {!isFocused && !isFinished && (
        <div
          id="focus-alert-overlay"
          onClick={() => inputRef.current?.focus()}
          className="absolute inset-0 z-20 backdrop-blur-[2px] bg-black/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer animate-fade-in"
        >
          <div
            className={`flex items-center gap-2 text-xs font-mono font-medium px-4 py-2 rounded-xl ${theme.cardBg} ${theme.textPrimary} border ${theme.borderSubtle} shadow-md`}
          >
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Click to focus typing engine</span>
          </div>
        </div>
      )}

      {/* Optimized Words Display Box with Windowing & Layout Stabilization */}
      <div
        id="words-display-box"
        ref={wordsContainerRef}
        aria-hidden="true"
        className={`w-full min-h-[160px] max-h-60 overflow-y-auto p-6 sm:p-8 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs text-2xl sm:text-3xl leading-relaxed tracking-tight font-mono relative transition-all no-scrollbar select-none`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {/* If windowing is active, display leading ellipsis indicator */}
          {windowStart > 0 && (
            <span className={`inline-flex items-center text-xs ${theme.textMuted} opacity-40 px-1 font-mono`}>
              ... ({windowStart} previous words)
            </span>
          )}

          {visibleWords.map((targetWord, relIdx) => {
            const actualIdx = windowStart + relIdx;
            const isCurrentWord = actualIdx === wordIndex;
            const isPastWord = actualIdx < wordIndex;
            const pastTyped = typedHistory[actualIdx] || '';

            return (
              <span
                key={actualIdx}
                ref={isCurrentWord ? activeWordRef : null}
                className={`relative inline-flex items-center px-0.5 rounded-sm transition-colors ${
                  isCurrentWord ? `${theme.cardBgSubtle}` : ''
                }`}
              >
                {/* Render word characters */}
                {targetWord.split('').map((char, cIdx) => {
                  if (isPastWord) {
                    const isCharCorrect = pastTyped[cIdx] === char;
                    return (
                      <span
                        key={cIdx}
                        className={
                          isCharCorrect
                            ? theme.correct
                            : `${theme.incorrect} underline decoration-red-500 decoration-2 bg-red-500/10`
                        }
                      >
                        {char}
                      </span>
                    );
                  }

                  if (isCurrentWord) {
                    return renderCharacter(char, cIdx, true, inputWord, actualIdx);
                  }

                  // Future word - also check if Ghost caret is on a future word
                  const isGhostHere =
                    ghostPosition.isActive &&
                    ghostPosition.wordIndex === actualIdx &&
                    ghostPosition.charIndex === cIdx;

                  return (
                    <span key={cIdx} className="relative inline-block">
                      {isGhostHere && (
                        <span
                          id="pacing-ghost-future"
                          title={`PB Ghost (${ghostPosition.targetWpm} WPM)`}
                          className="absolute -left-0.5 -top-1 bottom-0 w-1 bg-cyan-400/70 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse z-10"
                        >
                          <span className="absolute -top-3.5 -left-2 px-1 py-0.2 text-[8px] font-mono font-bold bg-cyan-500 text-black rounded-xs whitespace-nowrap scale-75 transform -translate-x-1/4">
                            PB
                          </span>
                        </span>
                      )}
                      <span className={theme.textMuted}>{char}</span>
                    </span>
                  );
                })}

                {/* Extra characters typed */}
                {isCurrentWord && renderExtraCharacters(inputWord, targetWord.length)}
                {isPastWord && renderExtraCharacters(pastTyped, targetWord.length)}
              </span>
            );
          })}

          {/* Trailing ellipsis if windowing */}
          {windowEnd < words.length && (
            <span className={`inline-flex items-center text-xs ${theme.textMuted} opacity-40 px-1 font-mono`}>
              ... ({words.length - windowEnd} more)
            </span>
          )}
        </div>
      </div>

      {/* Restart and Quick Info Control */}
      <div className="w-full flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span className="hidden sm:inline">Pacing Ghost:</span>
          <span className="text-[11px] font-medium text-cyan-400/80">
            {preferences.pacingGhost ? `Active (${ghostPosition.targetWpm} WPM)` : 'Off'}
          </span>
        </div>

        <button
          id="quick-restart-btn"
          onClick={(e) => {
            e.stopPropagation();
            initTest();
          }}
          title="Restart Test (Tab or Escape)"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardBgSubtle} border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            restart{' '}
            <kbd className={`px-1.5 py-0.5 rounded text-[10px] ${theme.cardBgSubtle} border ${theme.borderSubtle}`}>
              tab
            </kbd>
          </span>
        </button>
      </div>
    </div>
  );
};
