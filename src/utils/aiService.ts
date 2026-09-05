import { AICodeSnippetResponse, AIWeakKeyDrillResponse, AICoachingFeedback, LeaderboardEntry } from '../types';

/**
 * Request Gemini to generate a context-rich programming snippet for typing practice.
 */
export async function generateAICodeSnippet(
  language: string,
  topic?: string,
  difficulty: string = 'medium'
): Promise<AICodeSnippetResponse> {
  try {
    const res = await fetch('/api/gemini/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, topic, difficulty }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using offline code fallback:', err);
    return {
      title: 'Async Task Pool',
      language,
      code: 'async function processTasks<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> { const results: T[] = []; const executing = new Set<Promise<void>>(); for (const task of tasks) { const p = task().then(res => { results.push(res); executing.delete(p); }); executing.add(p); if (executing.size >= limit) { await Promise.race(executing); } } await Promise.all(executing); return results; }',
      description: 'Concurrent task execution pool with concurrency boundaries and Promise racers.',
    };
  }
}

/**
 * Request Gemini to generate targeted weak-key drill words.
 */
export async function generateAIWeakKeyDrill(
  weakKeys: string[],
  currentWpm: number = 60,
  difficulty: string = 'normal'
): Promise<AIWeakKeyDrillResponse> {
  try {
    const res = await fetch('/api/gemini/weak-key-drill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weakKeys, currentWpm, difficulty }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using offline drill fallback:', err);
    return {
      drillTitle: `Precision Drill: ${weakKeys.join(', ').toUpperCase()}`,
      words: [
        'people', 'public', 'problem', 'practice', 'balance', 'branch', 'cabinet', 'concept',
        'capture', 'project', 'complex', 'publish', 'object', 'subject', 'program', 'product',
        'perfect', 'produce', 'packet', 'compact', 'plastic', 'aspect', 'expect', 'impact', 'respect'
      ],
      explanation: 'Precision repetition drill designed to reinforce finger positioning and tactile transitions.',
    };
  }
}

/**
 * Request Gemini to analyze a completed test and provide coaching feedback.
 */
export async function getAICoachingFeedback(
  wpm: number,
  rawWpm: number,
  accuracy: number,
  consistency: number,
  duration: number,
  weakKeys: Array<{ key: string; accuracy: number }>
): Promise<AICoachingFeedback> {
  try {
    const res = await fetch('/api/gemini/coaching-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wpm, rawWpm, accuracy, consistency, duration, weakKeys }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using offline coaching fallback:', err);
    return {
      verdict: 'Rhythmic Typist with Keystroke Micro-Stalls',
      diagnosis: 'Your velocity bursts are strong, but hesitation around non-home-row transitions causes noticeable deceleration drops.',
      mechanicalTips: [
        'Maintain a light hovering wrist to reduce friction during top-row and bottom-row reaches.',
        'Anticipate 2 to 3 words ahead in peripheral vision to eliminate visual micro-pauses.',
        'Keep finger curvature relaxed to avoid stiffening during burst sequences.',
      ],
      recommendedAction: 'Practice 30s accuracy-capped drills to lock in finger memory before pushing top speed.',
    };
  }
}

/**
 * Fetch leaderboard entries for a specific mode.
 */
export async function fetchLeaderboard(mode: string = '30s'): Promise<{ mode: string; entries: LeaderboardEntry[] }> {
  try {
    const res = await fetch(`/api/leaderboard?mode=${encodeURIComponent(mode)}`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using fallback leaderboard:', err);
    return {
      mode,
      entries: [
        { id: 'lb_1', rank: 1, username: 'MythicSpeed', wpm: 172, accuracy: 99.4, mode, date: 'Today' },
        { id: 'lb_2', rank: 2, username: 'ThockKing', wpm: 164, accuracy: 98.8, mode, date: 'Yesterday' },
        { id: 'lb_3', rank: 3, username: 'HomerowGhost', wpm: 154, accuracy: 100, mode, date: '2d ago' },
        { id: 'lb_4', rank: 4, username: 'CozyKeycaps', wpm: 146, accuracy: 97.5, mode, date: '3d ago' },
        { id: 'lb_5', rank: 5, username: 'VortexLinear', wpm: 139, accuracy: 99.1, mode, date: '4d ago' },
      ],
    };
  }
}

export interface ScoreVerificationPayload {
  duration?: number;
  rawWpm?: number;
  charactersTyped?: number;
  errorCount?: number;
  timestamp?: number;
}

/**
 * Submit user result to the global leaderboard with telemetry verification.
 */
export async function submitLeaderboardScore(
  username: string,
  wpm: number,
  accuracy: number,
  mode: string,
  verification?: ScoreVerificationPayload
): Promise<{ success: boolean; rank: number; entry: LeaderboardEntry }> {
  const res = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      wpm,
      accuracy,
      mode,
      ...verification,
    }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to submit score (${res.status})`);
  }
  return await res.json();
}
