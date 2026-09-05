// Web Worker for asynchronous WPM math, analytics aggregation, and background processing
export interface WorkerTickMessage {
  type: 'COMPUTE_LIVE_TICK';
  id: string;
  payload: {
    correctChars: number;
    typedChars: number;
    errors: number;
    elapsedSeconds: number;
    timeline: { second: number; wpm: number; rawWpm: number; errors: number }[];
  };
}

export interface WorkerAggregateMessage {
  type: 'AGGREGATE_ANALYTICS';
  id: string;
  payload: {
    results: any[];
  };
}

export type WorkerMessage = WorkerTickMessage | WorkerAggregateMessage;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = event.data;

  if (type === 'COMPUTE_LIVE_TICK') {
    const { correctChars, typedChars, errors, elapsedSeconds, timeline } = payload;
    if (elapsedSeconds <= 0) {
      self.postMessage({
        type: 'COMPUTE_LIVE_TICK_RESPONSE',
        id,
        result: {
          wpm: 0,
          rawWpm: 0,
          accuracy: 100,
          consistency: 100,
          timelinePoint: { second: 0, wpm: 0, rawWpm: 0, errors: 0 },
        },
      });
      return;
    }

    const minutes = elapsedSeconds / 60;
    const wpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const rawWpm = Math.max(0, Math.round((typedChars / 5) / minutes));
    const accuracy =
      typedChars > 0 ? Math.max(0, Math.min(100, Math.round(((typedChars - errors) / typedChars) * 100))) : 100;

    const timelinePoint = {
      second: elapsedSeconds,
      wpm,
      rawWpm,
      errors,
    };

    const updatedTimeline = [...timeline, timelinePoint];

    // Consistency math
    let consistency = 100;
    if (updatedTimeline.length > 2) {
      const wpms = updatedTimeline.map((p) => p.wpm).filter((w) => w > 0);
      if (wpms.length > 1) {
        const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        const squareDiffs = wpms.map((v) => Math.pow(v - avg, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? (stdDev / avg) * 100 : 0;
        consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
      }
    }

    self.postMessage({
      type: 'COMPUTE_LIVE_TICK_RESPONSE',
      id,
      result: {
        wpm,
        rawWpm,
        accuracy,
        consistency,
        timelinePoint,
      },
    });
  } else if (type === 'AGGREGATE_ANALYTICS') {
    const { results } = payload;
    if (!Array.isArray(results) || results.length === 0) {
      self.postMessage({
        type: 'AGGREGATE_ANALYTICS_RESPONSE',
        id,
        result: {
          last30Progression: [],
          weakKeysRanking: [],
        },
      });
      return;
    }

    // Process last 30 sessions with 5-session moving average
    const recent30 = [...results].reverse().slice(-30);
    const last30Progression = recent30.map((r, idx) => {
      // calculate moving average
      const startIdx = Math.max(0, idx - 4);
      const windowItems = recent30.slice(startIdx, idx + 1);
      const movingAvgWpm = Math.round(
        windowItems.reduce((acc, curr) => acc + curr.wpm, 0) / windowItems.length
      );

      return {
        session: idx + 1,
        date: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wpm: r.wpm,
        rawWpm: r.rawWpm,
        accuracy: r.accuracy,
        movingAvgWpm,
        mode: r.modeDetail || r.mode,
      };
    });

    // Aggregate error frequency per key across all sessions
    const keyMistakes: Record<string, { total: number; errors: number; key: string }> = {};
    for (const r of results) {
      if (r.keyStats) {
        for (const [k, stat] of Object.entries(r.keyStats) as [string, any][]) {
          if (!keyMistakes[k]) {
            keyMistakes[k] = { total: 0, errors: 0, key: k };
          }
          keyMistakes[k].total += stat.total || 0;
          keyMistakes[k].errors += stat.errors || 0;
        }
      }
    }

    const weakKeysRanking = Object.values(keyMistakes)
      .filter((k) => k.errors > 0)
      .map((k) => ({
        key: k.key,
        errors: k.errors,
        total: k.total,
        errorRate: k.total > 0 ? Math.round((k.errors / k.total) * 100) : 0,
      }))
      .sort((a, b) => b.errors - a.errors);

    self.postMessage({
      type: 'AGGREGATE_ANALYTICS_RESPONSE',
      id,
      result: {
        last30Progression,
        weakKeysRanking,
      },
    });
  }
};
