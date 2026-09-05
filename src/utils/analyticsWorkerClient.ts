// Client manager for the Analytics Web Worker
import { TestResult, WpmDataPoint } from '../types';

let workerInstance: Worker | null = null;
const pendingRequests = new Map<string, (data: any) => void>();

export function getAnalyticsWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }

  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('../workers/analytics.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerInstance.onmessage = (event) => {
        const { id, result } = event.data;
        if (id && pendingRequests.has(id)) {
          const resolve = pendingRequests.get(id)!;
          pendingRequests.delete(id);
          resolve(result);
        }
      };

      workerInstance.onerror = (err) => {
        console.warn('Analytics worker error:', err);
      };
    } catch (e) {
      console.warn('Web Worker initialization failed, falling back to main-thread math:', e);
      return null;
    }
  }

  return workerInstance;
}

export interface LiveTickResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timelinePoint: WpmDataPoint;
}

/**
 * Offloads continuous live WPM and consistency math to the background Web Worker
 */
export function computeLiveMetricsAsync(
  correctChars: number,
  typedChars: number,
  errors: number,
  elapsedSeconds: number,
  timeline: WpmDataPoint[]
): Promise<LiveTickResult> {
  const worker = getAnalyticsWorker();

  // If worker not available, compute synchronously on main thread as safe fallback
  if (!worker) {
    const minutes = Math.max(1 / 60, elapsedSeconds / 60);
    const wpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const rawWpm = Math.max(0, Math.round((typedChars / 5) / minutes));
    const accuracy =
      typedChars > 0 ? Math.max(0, Math.min(100, Math.round(((typedChars - errors) / typedChars) * 100))) : 100;
    const point = { second: elapsedSeconds, wpm, rawWpm, errors };
    return Promise.resolve({
      wpm,
      rawWpm,
      accuracy,
      consistency: 100,
      timelinePoint: point,
    });
  }

  return new Promise((resolve) => {
    const id = `tick_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    pendingRequests.set(id, resolve);
    worker.postMessage({
      type: 'COMPUTE_LIVE_TICK',
      id,
      payload: {
        correctChars,
        typedChars,
        errors,
        elapsedSeconds,
        timeline,
      },
    });
  });
}

/**
 * Offloads 30-session analytics and error aggregation to the background Web Worker
 */
export function computeAggregatedAnalyticsAsync(
  results: TestResult[]
): Promise<{ last30Progression: any[]; weakKeysRanking: any[] }> {
  const worker = getAnalyticsWorker();

  if (!worker) {
    const recent30 = [...results].reverse().slice(-30);
    const last30Progression = recent30.map((r, idx) => ({
      session: idx + 1,
      date: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wpm: r.wpm,
      rawWpm: r.rawWpm,
      accuracy: r.accuracy,
      movingAvgWpm: r.wpm,
      mode: r.modeDetail || r.mode,
    }));
    return Promise.resolve({
      last30Progression,
      weakKeysRanking: [],
    });
  }

  return new Promise((resolve) => {
    const id = `agg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    pendingRequests.set(id, resolve);
    worker.postMessage({
      type: 'AGGREGATE_ANALYTICS',
      id,
      payload: { results },
    });
  });
}
