import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;

// Trust first proxy hop (Cloud Run / reverse proxy) for accurate IP resolution in rate limiters
app.set('trust proxy', 1);

// 1. Security Headers via Helmet (HSTS, MIME-sniffing prevention, XSS filter, Content Security Policy)
app.use(
  helmet({
    noSniff: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
    frameguard: false, // Frameguard disabled to allow live preview in AI Studio iframe
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Vite dev client and dynamic module bootstrapping
          "'unsafe-eval'", // Vite dev worker runtime compilation
          'blob:',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Tailwind utilities & dynamic runtime theme CSS variables
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://images.unsplash.com',
          'https://*.googleusercontent.com',
        ],
        connectSrc: [
          "'self'",
          'blob:',
          'https://*.run.app',
          'http://localhost:*',
          'http://127.0.0.1:*',
          'ws:',
          'wss:',
        ],
        workerSrc: ["'self'", 'blob:'],
        mediaSrc: ["'self'", 'blob:', 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: [
          "'self'",
          'https://ai.studio',
          'https://*.google.com',
          'https://*.run.app',
          'http://localhost:*',
        ],
      },
    },
  })
);

// 2. Strict CORS Configuration (Origin Hijacking Mitigation)
const allowedOrigins = [
  process.env.APP_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin or requests with no origin (e.g. SPA navigation, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isExplicitAllowed = allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith(allowed)
      );
      const isTrustedDomain =
        origin.includes('.run.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isExplicitAllowed || isTrustedDomain) {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked by TypeSprint Security Policy'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// Body size limit to prevent memory exhaustion
app.use(express.json({ limit: '100kb' }));

// Helper to reliably extract and normalize client IP for rate limiting
const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
};

// 3. Multi-Tier Rate Limiters (Endpoint Abuse & Billing Protection)
const globalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300,
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Global API rate limit reached. Please wait before issuing additional requests.' },
});

// AI Endpoint Minute-Tier Limiter (burst prevention)
const aiPerMinuteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute per IP
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI generation burst limit reached. Please wait 60 seconds before requesting additional AI coaching or drills.',
    retryAfterSeconds: 60,
  },
});

// AI Endpoint Hourly-Tier Limiter (sustained drain prevention)
const aiPerHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // Max 60 AI requests per hour per IP
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Hourly AI quota reached for this client IP. Please wait before generating additional AI content.',
    retryAfterSeconds: 3600,
  },
});

const leaderboardPostLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Leaderboard submission rate limit exceeded. Please wait 5 minutes before posting another score.' },
});

app.use('/api/', globalApiLimiter);

// Prototype pollution guard
function containsPrototypePollution(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, any>;
  return (
    Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
    Object.prototype.hasOwnProperty.call(obj, 'constructor') ||
    Object.prototype.hasOwnProperty.call(obj, 'prototype')
  );
}

// Robust input sanitization for XSS and injection mitigation
function sanitizeInput(str: unknown, maxLen = 100): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>'"&`]/g, '') // strip script/markup characters
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .slice(0, maxLen);
}

const USERNAME_VALID_PATTERN = /^[a-zA-Z0-9_\-\s]{2,20}$/;

function validateAndSanitizeUsername(rawName: unknown): { valid: boolean; username: string; error?: string } {
  if (typeof rawName !== 'string') {
    return { valid: false, username: '', error: 'Username must be a string' };
  }

  const trimmed = rawName.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return { valid: false, username: '', error: 'Username must be between 2 and 20 characters' };
  }

  if (!USERNAME_VALID_PATTERN.test(trimmed)) {
    return {
      valid: false,
      username: '',
      error: 'Username may only contain letters, numbers, spaces, underscores, or hyphens',
    };
  }

  // Prevent prototype pollution keywords or system reserved names
  const lower = trimmed.toLowerCase();
  if (['__proto__', 'constructor', 'prototype', 'admin', 'root', 'system'].includes(lower)) {
    return { valid: false, username: '', error: 'Reserved handle cannot be used' };
  }

  const sanitized = sanitizeInput(trimmed, 20);
  return { valid: true, username: sanitized };
}

// Lazy-initialized Gemini Client (Server-side only, API key hidden from browser)
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-Memory Global Leaderboard Store (seeded with top typist benchmarks)
interface LeaderboardRecord {
  id: string;
  rank?: number;
  username: string;
  wpm: number;
  accuracy: number;
  mode: string;
  date: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

const DEFAULT_LEADERBOARDS: Record<string, LeaderboardRecord[]> = {
  '15s': [
    { id: 'lb_1', username: 'MythicSpeed', wpm: 182, accuracy: 99.4, mode: '15s', date: 'Today', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces' },
    { id: 'lb_2', username: 'ThockKing', wpm: 168, accuracy: 98.8, mode: '15s', date: 'Yesterday', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&h=64&fit=crop&crop=faces' },
    { id: 'lb_3', username: 'HomerowGhost', wpm: 154, accuracy: 100, mode: '15s', date: '2d ago', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=faces' },
    { id: 'lb_4', username: 'CozyKeycaps', wpm: 146, accuracy: 97.5, mode: '15s', date: '3d ago' },
    { id: 'lb_5', username: 'VortexLinear', wpm: 139, accuracy: 99.1, mode: '15s', date: '4d ago' },
    { id: 'lb_6', username: 'AlpsTactile', wpm: 131, accuracy: 98.2, mode: '15s', date: '5d ago' },
    { id: 'lb_7', username: 'CherryBlue77', wpm: 124, accuracy: 96.9, mode: '15s', date: '6d ago' },
  ],
  '30s': [
    { id: 'lb_30_1', username: 'SonicSwitch', wpm: 171, accuracy: 99.2, mode: '30s', date: 'Today', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces' },
    { id: 'lb_30_2', username: 'MythicSpeed', wpm: 164, accuracy: 98.9, mode: '30s', date: 'Yesterday' },
    { id: 'lb_30_3', username: 'ZeroLatency', wpm: 152, accuracy: 99.6, mode: '30s', date: '2d ago' },
    { id: 'lb_30_4', username: 'TypingSamurai', wpm: 141, accuracy: 98.1, mode: '30s', date: '3d ago' },
    { id: 'lb_30_5', username: 'LunarClick', wpm: 133, accuracy: 97.4, mode: '30s', date: '4d ago' },
    { id: 'lb_30_6', username: 'QuantumKeys', wpm: 125, accuracy: 98.7, mode: '30s', date: '5d ago' },
  ],
  '60s': [
    { id: 'lb_60_1', username: 'MarathonTypist', wpm: 156, accuracy: 99.5, mode: '60s', date: 'Today' },
    { id: 'lb_60_2', username: 'HomerowGhost', wpm: 148, accuracy: 99.8, mode: '60s', date: 'Yesterday' },
    { id: 'lb_60_3', username: 'PrecisionFlow', wpm: 138, accuracy: 99.1, mode: '60s', date: '2d ago' },
    { id: 'lb_60_4', username: 'Starlight60', wpm: 129, accuracy: 97.8, mode: '60s', date: '3d ago' },
    { id: 'lb_60_5', username: 'TactileMonk', wpm: 121, accuracy: 98.4, mode: '60s', date: '4d ago' },
  ],
  'code': [
    { id: 'lb_c_1', username: 'RustaceanSpeed', wpm: 118, accuracy: 99.2, mode: 'code', date: 'Today' },
    { id: 'lb_c_2', username: 'TypeScriptWizard', wpm: 109, accuracy: 98.5, mode: 'code', date: 'Yesterday' },
    { id: 'lb_c_3', username: 'RegexMaster', wpm: 97, accuracy: 97.8, mode: 'code', date: '2d ago' },
    { id: 'lb_c_4', username: 'AsyncNinja', wpm: 92, accuracy: 99.0, mode: 'code', date: '3d ago' },
    { id: 'lb_c_5', username: 'NullPointer', wpm: 84, accuracy: 96.7, mode: 'code', date: '4d ago' },
  ],
};

const userSubmissions: Record<string, LeaderboardRecord[]> = {
  '15s': [],
  '30s': [],
  '60s': [],
  'code': [],
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// GET Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const modeKey = (req.query.mode as string) || '30s';
  const validKey = DEFAULT_LEADERBOARDS[modeKey] ? modeKey : '30s';

  const combined = [
    ...(userSubmissions[validKey] || []),
    ...(DEFAULT_LEADERBOARDS[validKey] || []),
  ].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);

  // Assign ranks
  const ranked = combined.slice(0, 50).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  res.json({
    mode: validKey,
    entries: ranked,
    totalRecords: ranked.length,
  });
});

// POST Leaderboard Score with Enterprise Data Tampering & Anti-Cheat Mathematical Verification
app.post('/api/leaderboard', leaderboardPostLimiter, (req, res) => {
  // Prevent Prototype Pollution
  if (containsPrototypePollution(req.body)) {
    return res.status(400).json({ error: 'Security Violation: Malformed object prototype detected.' });
  }

  const {
    username,
    wpm,
    accuracy,
    mode,
    duration,
    rawWpm,
    charactersTyped,
    errorCount,
    timestamp,
  } = req.body;

  if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
    return res.status(400).json({ error: 'Missing required numeric parameters (wpm, accuracy)' });
  }

  // Strict username validation & sanitization
  const usernameCheck = validateAndSanitizeUsername(username);
  if (!usernameCheck.valid) {
    return res.status(400).json({ error: usernameCheck.error || 'Invalid username provided' });
  }
  const cleanUsername = usernameCheck.username;

  // 1. Physical Human Boundaries Check
  // World record sustained typing speed is ~216 WPM. Human physical velocity > 240 WPM on full text is physically unachievable.
  if (wpm <= 0 || wpm > 240) {
    return res.status(400).json({
      error: 'Anti-Cheat Violation: Reported velocity (WPM > 240 or <= 0) exceeds human physical bounds.',
    });
  }

  if (accuracy < 60 || accuracy > 100) {
    return res.status(400).json({
      error: 'Anti-Cheat Violation: Accuracy must be between 60% and 100% for competitive ranking.',
    });
  }

  // 2. Mathematical Consistency Validation
  // Raw WPM cannot be less than Net WPM (with minor 0.5 margin for floating point rounding)
  if (typeof rawWpm === 'number' && rawWpm < wpm - 0.5) {
    return res.status(400).json({
      error: 'Data Integrity Failure: Raw WPM cannot be less than Net WPM.',
    });
  }

  if (typeof rawWpm === 'number' && rawWpm > 260) {
    return res.status(400).json({
      error: 'Anti-Cheat Violation: Raw keystroke frequency exceeds physiological human maximum.',
    });
  }

  // Verify duration boundary
  if (typeof duration === 'number') {
    if (duration < 5 || duration > 600) {
      return res.status(400).json({
        error: 'Data Integrity Failure: Test duration must be between 5s and 600s.',
      });
    }
  }

  // Verify mathematical parity if keystroke telemetry is provided
  if (typeof duration === 'number' && duration > 0 && typeof charactersTyped === 'number' && charactersTyped > 0) {
    // Physical human limit: minimum inter-key interval is ~35ms. Anything faster than 30ms/char sustained is an automated bot/macro.
    const averageInterKeyIntervalMs = (duration * 1000) / charactersTyped;
    if (averageInterKeyIntervalMs < 30) {
      return res.status(400).json({
        error: 'Anti-Cheat Violation: Keystroke cadence indicates automated script or macro injection.',
      });
    }

    const calculatedRawWpm = (charactersTyped / 5) / (duration / 60);
    const targetWpmForCheck = typeof rawWpm === 'number' ? rawWpm : wpm;
    const variance = Math.abs(calculatedRawWpm - targetWpmForCheck) / Math.max(calculatedRawWpm, 1);

    // If mathematical discrepancy between keystrokes and reported speed exceeds 18%, reject
    if (variance > 0.18) {
      return res.status(400).json({
        error: 'Data Integrity Failure: Mathematical inconsistency between characters typed, test duration, and reported velocity.',
      });
    }

    if (typeof errorCount === 'number' && errorCount >= 0) {
      const calculatedNetWpm = Math.max(0, ((charactersTyped - errorCount) / 5) / (duration / 60));
      const netVariance = Math.abs(calculatedNetWpm - wpm) / Math.max(calculatedNetWpm, 1);
      if (netVariance > 0.18) {
        return res.status(400).json({
          error: 'Data Integrity Failure: Net speed calculation does not match keystrokes minus penalty errors.',
        });
      }
    }
  }

  // 3. Timestamp Sanity Check (prevent replay or clock tampering)
  if (typeof timestamp === 'number') {
    const now = Date.now();
    if (timestamp > now + 60000) {
      return res.status(400).json({ error: 'Data Integrity Failure: Future timestamp detected.' });
    }
    if (timestamp < now - 3600000 * 24) {
      return res.status(400).json({ error: 'Data Integrity Failure: Expired session submission.' });
    }
  }

  let modeKey = '30s';
  if (typeof mode === 'string') {
    const cleanMode = sanitizeInput(mode, 15);
    if (cleanMode.includes('15')) modeKey = '15s';
    else if (cleanMode.includes('60')) modeKey = '60s';
    else if (cleanMode.toLowerCase().includes('code')) modeKey = 'code';
    else modeKey = '30s';
  }

  const newEntry: LeaderboardRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy * 10) / 10,
    mode: modeKey,
    date: 'Just now',
    isCurrentUser: true,
  };

  if (!userSubmissions[modeKey]) {
    userSubmissions[modeKey] = [];
  }
  userSubmissions[modeKey].push(newEntry);

  const combined = [
    ...userSubmissions[modeKey],
    ...(DEFAULT_LEADERBOARDS[modeKey] || []),
  ].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);

  const rank = combined.findIndex((e) => e.id === newEntry.id) + 1;

  res.json({
    success: true,
    entry: { ...newEntry, rank },
    rank,
  });
});

// Gemini: Dynamic Code Generation (Protected with Multi-Tier Rate Limiting & Input Sanitization)
app.post('/api/gemini/generate-code', aiPerHourLimiter, aiPerMinuteLimiter, async (req, res) => {
  if (containsPrototypePollution(req.body)) {
    return res.status(400).json({ error: 'Security Violation: Malformed prototype detected.' });
  }

  try {
    const rawLang = req.body.language || 'typescript';
    const rawTopic = req.body.topic || 'algorithms';
    const rawDiff = req.body.difficulty || 'medium';

    const language = sanitizeInput(rawLang, 20) || 'typescript';
    const topic = sanitizeInput(rawTopic, 50) || 'algorithms';
    const difficulty = sanitizeInput(rawDiff, 15) || 'medium';

    const ai = getGemini();

    const prompt = `You are an expert programming instructor and typing drill architect.
Generate a realistic, practical code snippet for typing practice in language "${language}".
Topic / Concept: "${topic}". Difficulty: "${difficulty}".
Guidelines:
1. Provide realistic idiomatic code (between 40 and 80 words total).
2. Code must contain diverse syntax tokens: brackets (), {}, [], punctuation ;, :, operators =>, &&, ||, and descriptive variable names.
3. No comments or markdown formatting in the code itself, just pure runnable or syntactically valid code formatted on clean lines.
4. Respond ONLY with valid JSON in this structure:
{
  "title": "Short descriptive snippet title (e.g. Debounce Hook or Binary Search)",
  "language": "${language}",
  "code": "The exact code text without markdown quotes",
  "description": "One sentence explaining what this code teaches or tests"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini code generation error:', err);
    // Fallback gracefully so the typing session never fails
    res.json({
      title: 'Async Task Pool',
      language: 'typescript',
      code: 'async function processTasks<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> { const results: T[] = []; const executing = new Set<Promise<void>>(); for (const task of tasks) { const p = task().then(res => { results.push(res); executing.delete(p); }); executing.add(p); if (executing.size >= limit) { await Promise.race(executing); } } await Promise.all(executing); return results; }',
      description: 'Concurrent task execution pool with concurrency boundaries and Promise racers.',
    });
  }
});

// Gemini: Weak-Key Drill Generator (Protected with Multi-Tier Rate Limiting & Input Sanitization)
app.post('/api/gemini/weak-key-drill', aiPerHourLimiter, aiPerMinuteLimiter, async (req, res) => {
  if (containsPrototypePollution(req.body)) {
    return res.status(400).json({ error: 'Security Violation: Malformed prototype detected.' });
  }

  try {
    const { weakKeys = ['p', 'b', 'c'], currentWpm = 60, difficulty = 'normal' } = req.body;
    const cleanKeys = Array.isArray(weakKeys)
      ? weakKeys.map((k) => sanitizeInput(k, 3)).filter(Boolean).slice(0, 8)
      : ['p', 'b', 'c'];
    const keysList = cleanKeys.length > 0 ? cleanKeys.join(', ') : 'p, b, c';
    const safeWpm = typeof currentWpm === 'number' ? Math.min(240, Math.max(10, currentWpm)) : 60;
    const safeDifficulty = sanitizeInput(difficulty, 15) || 'normal';

    const ai = getGemini();

    const prompt = `You are a master touch-typing coach.
Generate a targeted typing drill specifically created to build muscle memory for these troublesome weak keys: [${keysList}].
User current speed: ${safeWpm} WPM. Difficulty: ${safeDifficulty}.
Guidelines:
1. Provide exactly 25 to 30 words separated by single spaces.
2. Every word MUST include at least one of the target weak keys [${keysList}], reinforcing key transitions, finger reaches, and rhythmic flow.
3. Keep the words real, grammatical English or useful vocabulary.
4. Respond ONLY with valid JSON in this structure:
{
  "drillTitle": "Short title highlighting the keys (e.g. Focus: P & B Bilateral Reaches)",
  "words": ["word1", "word2", ...],
  "explanation": "Brief coach note on why this drill strengthens those specific fingers"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini weak-key drill error:', err);
    const weak = (req.body.weakKeys && req.body.weakKeys.length > 0) ? req.body.weakKeys : ['p', 'b', 'c'];
    res.json({
      drillTitle: `Target Precision: ${weak.join(', ').toUpperCase()}`,
      words: ['people', 'public', 'problem', 'practice', 'balance', 'branch', 'cabinet', 'concept', 'capture', 'project', 'complex', 'publish', 'object', 'subject', 'program', 'product', 'perfect', 'produce', 'packet', 'compact', 'plastic', 'aspect', 'expect', 'impact', 'respect'],
      explanation: 'Precision repetition drill designed to reinforce finger positioning and tactile transitions.',
    });
  }
});

// Gemini: Coaching Feedback on Completed Test (Protected with Multi-Tier Rate Limiting)
app.post('/api/gemini/coaching-feedback', aiPerHourLimiter, aiPerMinuteLimiter, async (req, res) => {
  if (containsPrototypePollution(req.body)) {
    return res.status(400).json({ error: 'Security Violation: Malformed prototype detected.' });
  }

  try {
    const { wpm, rawWpm, accuracy, consistency, duration, weakKeys = [] } = req.body;
    const safeWpm = typeof wpm === 'number' ? Math.min(240, Math.max(0, wpm)) : 60;
    const safeRawWpm = typeof rawWpm === 'number' ? Math.min(260, Math.max(0, rawWpm)) : safeWpm;
    const safeAccuracy = typeof accuracy === 'number' ? Math.min(100, Math.max(0, accuracy)) : 95;
    const safeConsistency = typeof consistency === 'number' ? Math.min(100, Math.max(0, consistency)) : 80;
    const safeDuration = typeof duration === 'number' ? Math.min(600, Math.max(1, duration)) : 30;

    const ai = getGemini();

    const prompt = `You are an elite competitive typing coach and biomechanics consultant.
Analyze this typist's session metrics:
- Net Speed: ${safeWpm} WPM
- Raw Speed: ${safeRawWpm} WPM
- Accuracy: ${safeAccuracy}%
- Consistency: ${safeConsistency}%
- Duration: ${safeDuration}s
- Weak Keys identified: ${JSON.stringify(weakKeys).slice(0, 200)}

Provide a concise, highly insightful diagnostic breakdown with:
1. "verdict": A crisp 4-6 word archetype diagnosis (e.g., "High-Speed Burster with Deceleration Hesitations" or "Steady Flow Typist with Pinky Bottleneck").
2. "diagnosis": 2 sentences explaining what happened mechanically during the test.
3. "mechanicalTips": Array of exactly 3 actionable tactical tips (e.g., wrist posture, finger curvature, pacing rhythm, or home-row anchoring).
4. "recommendedAction": One immediate follow-up recommendation (e.g., "Run a 30s Trigram drill" or "Practice bilateral pinky extensions").

Respond ONLY in valid JSON matching this schema:
{
  "verdict": "string",
  "diagnosis": "string",
  "mechanicalTips": ["tip1", "tip2", "tip3"],
  "recommendedAction": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini coaching feedback error:', err);
    res.json({
      verdict: 'Rhythmic Typist with Keystroke Micro-Stalls',
      diagnosis: 'Your velocity bursts are strong, but hesitation around non-home-row transitions causes noticeable deceleration drops.',
      mechanicalTips: [
        'Maintain a light hovering wrist to reduce friction during top-row and bottom-row reaches.',
        'Anticipate 2 to 3 words ahead in peripheral vision to eliminate visual micro-pauses.',
        'Keep finger curvature relaxed to avoid stiffening during burst sequences.',
      ],
      recommendedAction: 'Practice 30s accuracy-capped drills to lock in finger memory before pushing top speed.',
    });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TypeSprint server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
