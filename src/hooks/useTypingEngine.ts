import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TestMode,
  TimeOption,
  WordCountOption,
  UserPreferences,
  TestResult,
  WpmDataPoint,
  KeyStat,
  DifficultyLevel,
  KeystrokeTimestamp,
} from '../types';
import { playKeySound, playCompletionChime } from '../utils/sound';
import {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  getPersonalBestForSnippet,
} from '../utils/analytics';
import { computeLiveMetricsAsync } from '../utils/analyticsWorkerClient';
import { mapPhysicalKeyToLayout } from '../utils/layouts';
import {
  TOP_200_WORDS,
  TOP_1000_WORDS,
  FAMOUS_QUOTES,
  generateRandomWords,
  generateNumbersAndPunctuation,
} from '../data/wordLists';
import { CODE_SNIPPETS_LIBRARY } from '../data/codeSnippets';
import {
  calculateKeystrokeScore,
  calculateWordCompletionScore,
  getLevelInfo,
} from '../utils/gamification';

export interface GhostPosition {
  isActive: boolean;
  wordIndex: number;
  charIndex: number;
  targetWpm: number;
  userAhead: boolean;
  deltaChars: number;
  isReplay: boolean;
  pbWpm?: number;
}

export interface UseTypingEngineProps {
  mode: TestMode;
  timeOption: TimeOption;
  wordCountOption: WordCountOption;
  customText?: string;
  drillWords?: string[];
  drillTitle?: string;
  preferences: UserPreferences;
  bestWpmOverall?: number;
  totalXp?: number;
  onFinishTest: (result: TestResult) => void;
  onTargetKeyChange?: (char: string) => void;
  onTypingStatusChange?: (isActive: boolean) => void;
}

export function useTypingEngine({
  mode,
  timeOption,
  wordCountOption,
  customText,
  drillWords,
  drillTitle,
  preferences,
  bestWpmOverall = 0,
  totalXp = 0,
  onFinishTest,
  onTargetKeyChange,
  onTypingStatusChange,
}: UseTypingEngineProps) {
  const [words, setWords] = useState<string[]>([]);
  const [quoteAuthor, setQuoteAuthor] = useState<string>('');
  const [inputWord, setInputWord] = useState<string>('');
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);

  // Timing & Live Stats
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(timeOption);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);

  // Gamification state
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [liveScore, setLiveScore] = useState<number>(0);
  const [latestScoreDelta, setLatestScoreDelta] = useState<number>(0);
  const [wpmDelta, setWpmDelta] = useState<number>(0);
  const [personalBestReplay, setPersonalBestReplay] = useState<TestResult | null>(null);
  const maxStreakRef = useRef<number>(0);
  const liveScoreRef = useRef<number>(0);
  const prevWpmRef = useRef<number>(0);

  const timeLeftRef = useRef<number>(timeOption);
  const elapsedSecondsRef = useRef<number>(0);
  const testStartTimeRef = useRef<number>(0);
  const keystrokeTimestampsRef = useRef<KeystrokeTimestamp[]>([]);

  // Key stats & Latency tracking
  const keyStatsRef = useRef<Record<string, KeyStat>>({});
  const lastKeyTimeRef = useRef<number>(0);
  const timelineRef = useRef<WpmDataPoint[]>([]);
  const totalCorrectCharsRef = useRef<number>(0);
  const totalTypedCharsRef = useRef<number>(0);
  const totalErrorsRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  const activeDifficulty: DifficultyLevel = preferences.difficulty || 'normal';

  // Target ghost pace
  const ghostTargetWpm = useMemo(() => {
    if (preferences.ghostPaceWpm && preferences.ghostPaceWpm > 0) {
      return preferences.ghostPaceWpm;
    }
    return bestWpmOverall > 0 ? bestWpmOverall : 60;
  }, [preferences.ghostPaceWpm, bestWpmOverall]);

  // Pacing Ghost position calculation - with full Keystroke Timestamp Ghost Racing
  const ghostPosition = useMemo<GhostPosition>(() => {
    if (!preferences.pacingGhost || !isStarted || isFinished || words.length === 0) {
      return {
        isActive: false,
        wordIndex: -1,
        charIndex: -1,
        targetWpm: ghostTargetWpm,
        userAhead: true,
        deltaChars: 0,
        isReplay: false,
      };
    }

    let totalGhostChars = 0;
    let isReplay = false;
    let targetWpm = ghostTargetWpm;

    // If ghost racing mode is set to PB and we have recorded timestamps from a previous personal best
    if (
      preferences.ghostRacingMode !== 'target' &&
      personalBestReplay?.keystrokeTimestamps &&
      personalBestReplay.keystrokeTimestamps.length > 0
    ) {
      isReplay = true;
      targetWpm = personalBestReplay.wpm || ghostTargetWpm;
      const elapsedMs = elapsedSeconds * 1000;
      for (const ts of personalBestReplay.keystrokeTimestamps) {
        if (ts.timestampMs <= elapsedMs) {
          totalGhostChars = ts.charIndex;
        } else {
          break;
        }
      }
    } else {
      // Steady pace calculation: Characters per second = (WPM * 5) / 60 = WPM / 12
      totalGhostChars = Math.floor(elapsedSeconds * (ghostTargetWpm / 12));
    }

    let accumulated = 0;
    let targetWIdx = 0;
    let targetCIdx = 0;

    for (let i = 0; i < words.length; i++) {
      const wordLenWithSpace = words[i].length + 1;
      if (accumulated + wordLenWithSpace > totalGhostChars) {
        targetWIdx = i;
        targetCIdx = Math.min(words[i].length, totalGhostChars - accumulated);
        break;
      }
      accumulated += wordLenWithSpace;
      if (i === words.length - 1) {
        targetWIdx = i;
        targetCIdx = words[i].length;
      }
    }

    // Determine if user is ahead of the ghost
    const userChars = totalCorrectCharsRef.current;
    const deltaChars = userChars - totalGhostChars;
    const userAhead = deltaChars >= 0;

    return {
      isActive: true,
      wordIndex: targetWIdx,
      charIndex: targetCIdx,
      targetWpm,
      userAhead,
      deltaChars,
      isReplay,
      pbWpm: personalBestReplay?.wpm,
    };
  }, [
    preferences.pacingGhost,
    preferences.ghostRacingMode,
    isStarted,
    isFinished,
    words,
    elapsedSeconds,
    ghostTargetWpm,
    personalBestReplay,
  ]);

  // Accessible screen reader announcement
  const screenReaderAnnouncement = useMemo(() => {
    if (!isStarted) {
      return `Typing test ready. Mode: ${mode}. Target text begins with: ${words.slice(0, 5).join(' ')}. Start typing to begin.`;
    }
    if (isFinished) {
      return `Test completed. Your final speed was ${liveWpm} words per minute with ${liveAccuracy} percent accuracy.`;
    }
    return `Current word: ${words[wordIndex] || ''}. Live speed: ${liveWpm} WPM, accuracy: ${liveAccuracy}%.`;
  }, [isStarted, isFinished, mode, words, wordIndex, liveWpm, liveAccuracy]);

  // Initialize or Reset Text
  const initTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    let generated: string[] = [];
    let author = '';

    const diff = preferences.difficulty || 'normal';
    const sourceWordList = diff === 'hard' || diff === 'master' ? TOP_1000_WORDS : TOP_200_WORDS;
    const shouldAddPunctuation = preferences.includePunctuation || diff === 'hard' || diff === 'master';
    const shouldAddNumbers = preferences.includeNumbers || diff === 'hard' || diff === 'master';

    if (mode === 'custom' && customText && customText.trim().length > 0) {
      generated = customText.trim().split(/\s+/);
    } else if (mode === 'drill' && drillWords && drillWords.length > 0) {
      generated = [...drillWords];
    } else if (mode === 'code') {
      if (customText && customText.trim().length > 0) {
        generated = customText.trim().split(/\s+/);
      } else if (drillWords && drillWords.length > 0) {
        generated = [...drillWords];
      } else {
        const snippet = CODE_SNIPPETS_LIBRARY[Math.floor(Math.random() * CODE_SNIPPETS_LIBRARY.length)];
        generated = snippet.code.trim().split(/\s+/);
        author = `${snippet.languageName} • ${snippet.title}`;
      }
    } else if (mode === 'quote') {
      const q = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
      generated = q.quote.split(' ');
      author = q.author;
    } else if (mode === 'words') {
      let base = generateRandomWords(wordCountOption, sourceWordList);
      if (shouldAddNumbers || shouldAddPunctuation) {
        base = generateNumbersAndPunctuation(wordCountOption);
      }
      generated = base;
    } else {
      // Time mode
      let base = generateRandomWords(140, sourceWordList);
      if (shouldAddNumbers || shouldAddPunctuation) {
        base = generateNumbersAndPunctuation(140);
      }
      generated = base;
    }

    setWords(generated);
    setQuoteAuthor(author);
    setInputWord('');
    setWordIndex(0);
    setTypedHistory([]);
    setIsStarted(false);
    setIsFinished(false);
    timeLeftRef.current = timeOption;
    elapsedSecondsRef.current = 0;
    setTimeLeft(timeOption);
    setElapsedSeconds(0);
    setLiveWpm(0);
    setLiveAccuracy(100);

    // Reset Gamification
    setCurrentStreak(0);
    setLiveScore(0);
    setLatestScoreDelta(0);
    setWpmDelta(0);
    maxStreakRef.current = 0;
    liveScoreRef.current = 0;
    prevWpmRef.current = 0;

    keyStatsRef.current = {};
    lastKeyTimeRef.current = 0;
    timelineRef.current = [];
    totalCorrectCharsRef.current = 0;
    totalTypedCharsRef.current = 0;
    totalErrorsRef.current = 0;
    keystrokeTimestampsRef.current = [];
    testStartTimeRef.current = 0;

    // Fetch personal best replay for Ghost Racing
    const snippetKey = drillTitle || author || (generated[0] ? generated.slice(0, 10).join(' ') : mode);
    getPersonalBestForSnippet(snippetKey, mode)
      .then((pb) => {
        setPersonalBestReplay(pb);
      })
      .catch(() => {});

    queueMicrotask(() => {
      onTypingStatusChange?.(false);
      if (generated[0] && generated[0][0]) {
        onTargetKeyChange?.(generated[0][0]);
      }
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [
    mode,
    timeOption,
    wordCountOption,
    customText,
    drillWords,
    preferences.includeNumbers,
    preferences.includePunctuation,
    preferences.difficulty,
    onTypingStatusChange,
    onTargetKeyChange,
  ]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  // Complete the test
  const finishTest = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    setIsStarted(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration =
      mode === 'time'
        ? Math.max(1, timeOption - timeLeftRef.current)
        : Math.max(1, elapsedSecondsRef.current);
    const finalWpm = calculateWpm(totalCorrectCharsRef.current, duration);
    const finalRawWpm = calculateRawWpm(totalTypedCharsRef.current, duration);
    const finalAccuracy = calculateAccuracy(
      totalCorrectCharsRef.current,
      totalTypedCharsRef.current
    );
    const finalConsistency = calculateConsistency(timelineRef.current);

    let detailStr = '';
    if (mode === 'time') detailStr = `${timeOption}s`;
    else if (mode === 'words') detailStr = `${wordCountOption} words`;
    else if (mode === 'quote') detailStr = 'Quote';
    else if (mode === 'code') detailStr = drillTitle || quoteAuthor || 'Code Snippet';
    else if (mode === 'drill') detailStr = drillTitle || 'Drill';
    else detailStr = 'Custom';

    const finalScore = liveScoreRef.current;
    const xpEarned = Math.round(finalScore / 5);
    const levelInfo = getLevelInfo(totalXp + xpEarned);

    const result: TestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      consistency: finalConsistency,
      mode,
      modeDetail: detailStr,
      duration,
      charactersTyped: totalTypedCharsRef.current,
      correctChars: totalCorrectCharsRef.current,
      incorrectChars: totalErrorsRef.current,
      extraChars: Math.max(
        0,
        totalTypedCharsRef.current - totalCorrectCharsRef.current - totalErrorsRef.current
      ),
      missedChars: 0,
      keyStats: keyStatsRef.current,
      wpmTimeline:
        timelineRef.current.length > 0
          ? timelineRef.current
          : [{ second: 1, wpm: finalWpm, rawWpm: finalRawWpm, errors: totalErrorsRef.current }],
      keystrokeTimestamps: keystrokeTimestampsRef.current,
      snippetId: drillTitle || quoteAuthor || words.slice(0, 10).join(' '),
      textSnippet: words.slice(0, 8).join(' '),
      score: finalScore,
      maxStreak: maxStreakRef.current,
      difficulty: activeDifficulty,
      levelEarned: levelInfo.level,
      xpEarned,
    };

    queueMicrotask(() => {
      onTypingStatusChange?.(false);
      onFinishTest(result);
    });

    // Audio feedback on test completion
    if (preferences.sound !== 'off') {
      playCompletionChime(preferences.soundVolume);
    }
  }, [
    isFinished,
    mode,
    timeOption,
    wordCountOption,
    drillTitle,
    quoteAuthor,
    words,
    totalXp,
    activeDifficulty,
    preferences.sound,
    preferences.soundVolume,
    onTypingStatusChange,
    onFinishTest,
  ]);

  // Timer Tick Engine
  useEffect(() => {
    if (!isStarted || isFinished) return;

    timerIntervalRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;
      const nextSec = elapsedSecondsRef.current;
      setElapsedSeconds(nextSec);

      // Offload continuous WPM & accuracy math to the background Web Worker
      computeLiveMetricsAsync(
        totalCorrectCharsRef.current,
        totalTypedCharsRef.current,
        totalErrorsRef.current,
        nextSec,
        timelineRef.current
      ).then((metrics) => {
        setLiveWpm(metrics.wpm);
        setLiveAccuracy(metrics.accuracy);
        setWpmDelta(metrics.wpm - prevWpmRef.current);
        prevWpmRef.current = metrics.wpm;
        timelineRef.current.push(metrics.timelinePoint);
      });

      // Time mode countdown
      if (mode === 'time') {
        timeLeftRef.current -= 1;
        const remaining = Math.max(0, timeLeftRef.current);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          finishTest();
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isStarted, isFinished, mode, finishTest]);

  // Keep target key updated for Virtual Keyboard guide
  useEffect(() => {
    if (!words[wordIndex]) return;
    const currentTargetWord = words[wordIndex];
    if (inputWord.length < currentTargetWord.length) {
      const char = currentTargetWord[inputWord.length];
      if (onTargetKeyChange) onTargetKeyChange(char);
    } else {
      // Space is next
      if (onTargetKeyChange) onTargetKeyChange(' ');
    }
  }, [wordIndex, inputWord, words, onTargetKeyChange]);

  // Handle Keystroke
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Quick Reset Shortcuts: Escape or Tab
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      initTest();
      return;
    }

    if (isFinished) return;

    const currentWord = words[wordIndex] || '';

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (preferences.confidenceMode) {
        return;
      }

      playKeySound(preferences.sound, preferences.soundVolume * 0.9, false, false);

      if (inputWord.length === 0 && wordIndex > 0) {
        const prevWord = typedHistory[wordIndex - 1];
        setWordIndex(wordIndex - 1);
        setInputWord(prevWord || '');
        setTypedHistory((prev) => prev.slice(0, -1));
        return;
      }
      setInputWord((prev) => prev.slice(0, -1));
      return;
    }

    // Handle Space (Word Submission)
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!isStarted) {
        setIsStarted(true);
        if (onTypingStatusChange) onTypingStatusChange(true);
        const startTime = Date.now();
        testStartTimeRef.current = startTime;
        lastKeyTimeRef.current = startTime;
      }

      if (inputWord.length === 0) return;

      playKeySound(preferences.sound, preferences.soundVolume, true, false);

      let wordCorrectChars = 0;
      for (let i = 0; i < currentWord.length; i++) {
        if (inputWord[i] === currentWord[i]) {
          wordCorrectChars++;
        }
      }

      const isWordFullyCorrect = inputWord === currentWord;

      totalCorrectCharsRef.current += wordCorrectChars + (isWordFullyCorrect ? 1 : 0);
      totalTypedCharsRef.current += inputWord.length + 1;

      // Record keystroke timestamp for Ghost Racing replay
      keystrokeTimestampsRef.current.push({
        charIndex: totalCorrectCharsRef.current,
        timestampMs: Date.now() - (testStartTimeRef.current || Date.now()),
        key: ' ',
        isCorrect: isWordFullyCorrect,
      });

      if (isWordFullyCorrect) {
        const bonus = calculateWordCompletionScore(
          currentWord.length,
          currentStreak,
          activeDifficulty
        );
        liveScoreRef.current += bonus;
        setLiveScore(liveScoreRef.current);
        setLatestScoreDelta(bonus);
      }

      const nextHistory = [...typedHistory, inputWord];
      setTypedHistory(nextHistory);
      setInputWord('');

      if (wordIndex + 1 >= words.length) {
        finishTest();
      } else {
        setWordIndex(wordIndex + 1);
      }
      return;
    }

    // Map physical key to active layout
    const activeLayout = preferences.keyboardLayout || 'qwerty';
    const mappedChar = mapPhysicalKeyToLayout(e, activeLayout);

    if (!mappedChar) {
      return;
    }

    e.preventDefault();

    if (!isStarted) {
      setIsStarted(true);
      if (onTypingStatusChange) onTypingStatusChange(true);
      const startTime = Date.now();
      testStartTimeRef.current = startTime;
      lastKeyTimeRef.current = startTime;
    }

    const typedChar = mappedChar;
    const expectedChar = currentWord[inputWord.length];
    const isCharCorrect = typedChar === expectedChar;

    const now = Date.now();
    const latency = lastKeyTimeRef.current ? Math.min(1000, now - lastKeyTimeRef.current) : 100;
    lastKeyTimeRef.current = now;

    // Record keystroke timestamp for Ghost Racing replay
    keystrokeTimestampsRef.current.push({
      charIndex: totalCorrectCharsRef.current + (isCharCorrect ? 1 : 0),
      timestampMs: now - (testStartTimeRef.current || now),
      key: typedChar,
      isCorrect: isCharCorrect,
    });

    const keyLower = typedChar.toLowerCase();
    if (!keyStatsRef.current[keyLower]) {
      keyStatsRef.current[keyLower] = { total: 0, errors: 0, totalLatencyMs: 0 };
    }
    keyStatsRef.current[keyLower].total += 1;
    keyStatsRef.current[keyLower].totalLatencyMs += latency;

    if (!isCharCorrect) {
      keyStatsRef.current[keyLower].errors += 1;
      totalErrorsRef.current += 1;
      setCurrentStreak(0);
      playKeySound(preferences.sound, preferences.soundVolume, false, true);

      if (preferences.suddenDeath || activeDifficulty === 'master') {
        finishTest();
        return;
      }
    } else {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreakRef.current) {
        maxStreakRef.current = nextStreak;
      }

      const pts = calculateKeystrokeScore(true, nextStreak, liveWpm, activeDifficulty);
      liveScoreRef.current += pts;
      setLiveScore(liveScoreRef.current);

      playKeySound(preferences.sound, preferences.soundVolume, false, false);
    }

    setInputWord((prev) => prev + typedChar);
  };

  return {
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
    elapsedSeconds,
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
    finishTest,
    containerRef,
    wordsContainerRef,
    inputRef,
    activeWordRef,
  };
}
