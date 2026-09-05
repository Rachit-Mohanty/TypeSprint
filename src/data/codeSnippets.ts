export interface CodeSnippet {
  id: string;
  title: string;
  language: 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'html_css' | 'sql' | 'syntax_blitz';
  languageName: string;
  difficulty: 'easy' | 'normal' | 'hard';
  description: string;
  code: string;
  keyPractices: string[]; // e.g. ["Arrow Functions", "Curly Braces", "Destructuring"]
}

export const CODE_SNIPPETS_LIBRARY: CodeSnippet[] = [
  // TypeScript & JavaScript
  {
    id: 'ts-use-debounce',
    title: 'useDebounce Hook',
    language: 'typescript',
    languageName: 'TypeScript',
    difficulty: 'normal',
    description: 'Custom React hook for debouncing values with timeout cleanup',
    code: 'export function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState<T>(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debounced;\n}',
    keyPractices: ['Generics <T>', 'Arrow Functions =>', 'Object Arrays []']
  },
  {
    id: 'ts-async-fetch',
    title: 'Async API Request with Guard',
    language: 'typescript',
    languageName: 'TypeScript',
    difficulty: 'easy',
    description: 'Standard async/await pattern with try/catch and response checking',
    code: 'async function fetchUserData(userId: string): Promise<User> {\n  const response = await fetch(`/api/users/${userId}`);\n  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);\n  return response.json();\n}',
    keyPractices: ['Template Strings ${}', 'Promise Types', 'Template Backticks']
  },
  {
    id: 'ts-generic-result',
    title: 'Generic Result Type & Matcher',
    language: 'typescript',
    languageName: 'TypeScript',
    difficulty: 'normal',
    description: 'Functional error handling with discriminated unions',
    code: 'type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };\nconst unwrap = <T>(res: Result<T>): T => {\n  if (!res.ok) throw res.error;\n  return res.data;\n};',
    keyPractices: ['Union Pipes |', 'Generics <T, E>', 'Object Literals {}']
  },
  {
    id: 'js-array-pipeline',
    title: 'Functional Array Pipeline',
    language: 'javascript',
    languageName: 'JavaScript',
    difficulty: 'easy',
    description: 'Chaining filter, map, and reduce for aggregated stats',
    code: 'const activeScores = users\n  .filter(u => u.isActive && u.score > 0)\n  .map(u => ({ id: u.id, normalized: u.score * 1.25 }))\n  .reduce((acc, curr) => acc + curr.normalized, 0);',
    keyPractices: ['Arrow Functions =>', 'Logical AND &&', 'Method Chaining .']
  },
  {
    id: 'js-event-emitter',
    title: 'Micro Event Emitter',
    language: 'javascript',
    languageName: 'JavaScript',
    difficulty: 'normal',
    description: 'Event listener registration and emitter logic',
    code: 'class EventEmitter {\n  listeners = new Map();\n  on(event, fn) {\n    if (!this.listeners.has(event)) this.listeners.set(event, new Set());\n    this.listeners.get(event).add(fn);\n  }\n  emit(event, ...args) {\n    this.listeners.get(event)?.forEach(fn => fn(...args));\n  }\n}',
    keyPractices: ['Spread Operator ...', 'Optional Chaining ?.', 'Class Syntax']
  },

  // Python
  {
    id: 'py-list-comprehension',
    title: 'List Comprehension & Filtering',
    language: 'python',
    languageName: 'Python',
    difficulty: 'easy',
    description: 'Concise list comprehension with conditional filter',
    code: 'even_squares = [x**2 for x in range(50) if x % 2 == 0]\nlookup = {f"item_{i}": i * 10 for i in range(10)}',
    keyPractices: ['Colons :', 'Power Operator **', 'F-Strings f""']
  },
  {
    id: 'py-decorator',
    title: 'Timing Function Decorator',
    language: 'python',
    languageName: 'Python',
    difficulty: 'normal',
    description: 'Python decorator pattern with functools wraps',
    code: 'import time\nfrom functools import wraps\n\ndef timer(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__}: {time.perf_counter() - start:.4f}s")\n        return result\n    return wrapper',
    keyPractices: ['Dunder __name__', 'Args *args, **kwargs', 'Decorators @']
  },
  {
    id: 'py-dataclass',
    title: 'Dataclass Model with Validation',
    language: 'python',
    languageName: 'Python',
    difficulty: 'normal',
    description: 'Modern Python dataclass with type hints',
    code: '@dataclass(frozen=True)\nclass BenchmarkSession:\n    user_id: str\n    wpm: float\n    accuracy: float\n    tags: list[str] = field(default_factory=list)\n\n    def is_proficient(self) -> bool:\n        return self.wpm >= 80.0 and self.accuracy >= 98.0',
    keyPractices: ['Type Annotations ->', 'Decorators @', 'Self Attributes']
  },

  // Rust
  {
    id: 'rs-match-pattern',
    title: 'Pattern Matching & Option',
    language: 'rust',
    languageName: 'Rust',
    difficulty: 'normal',
    description: 'Exhaustive pattern matching with Option and Result',
    code: 'fn compute_ratio(numerator: f64, denominator: f64) -> Option<f64> {\n    match denominator {\n        0.0 => None,\n        d if d < 0.0 => Some(-numerator / -d),\n        d => Some(numerator / d),\n    }\n}',
    keyPractices: ['Arrows -> and =>', 'Double Colons ::', 'Match Clauses']
  },
  {
    id: 'rs-vector-transform',
    title: 'Iterator Map & Collect',
    language: 'rust',
    languageName: 'Rust',
    difficulty: 'normal',
    description: 'Rust functional iterator chain with turbofish',
    code: 'let processed: Vec<String> = raw_inputs\n    .iter()\n    .filter(|item| !item.is_empty())\n    .map(|item| format!("Item: {}", item.trim().to_uppercase()))\n    .collect();',
    keyPractices: ['Turbofish ::<T>', 'Pipes in Closures |x|', 'Exclamation Macro format!']
  },

  // Go
  {
    id: 'go-channel-select',
    title: 'Goroutine Channel Select',
    language: 'go',
    languageName: 'Go',
    difficulty: 'normal',
    description: 'Concurrent message receiving with timeout channel',
    code: 'func worker(ctx context.Context, jobs <-chan Job) error {\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn ctx.Err()\n\t\tcase job, ok := <-jobs:\n\t\t\tif !ok {\n\t\t\t\treturn nil\n\t\t\t}\n\t\t\tprocess(job)\n\t\t}\n\t}\n}',
    keyPractices: ['Walrus Operator :=', 'Channel Arrows <-', 'Tab Indentations']
  },
  {
    id: 'go-http-handler',
    title: 'HTTP JSON Endpoint Handler',
    language: 'go',
    languageName: 'Go',
    difficulty: 'easy',
    description: 'Standard library HTTP handler with JSON encoding',
    code: 'func HealthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tw.WriteHeader(http.StatusOK)\n\tjson.NewEncoder(w).Encode(map[string]any{\n\t\t"status": "online",\n\t\t"timestamp": time.Now().Unix(),\n\t})\n}',
    keyPractices: ['Pointers *http.Request', 'String Literals ""', 'Map Types map[string]any']
  },

  // HTML / CSS / Tailwind
  {
    id: 'html-bento-card',
    title: 'Tailwind Responsive Card Grid',
    language: 'html_css',
    languageName: 'HTML / Tailwind',
    difficulty: 'easy',
    description: 'Modern Tailwind utility combinations with responsive classes',
    code: '<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm">\n  <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">\n    <span className="w-2 h-2 rounded-full bg-emerald-500" />\n    System Live\n  </h3>\n</div>',
    keyPractices: ['Self-Closing Tags />', 'Double Quotes ""', 'Tailwind Prefixes md:']
  },

  // SQL
  {
    id: 'sql-analytics-query',
    title: 'Aggregation with CTE & Window Function',
    language: 'sql',
    languageName: 'SQL',
    difficulty: 'normal',
    description: 'Common table expression with ranking and rolling average',
    code: 'WITH RankedSessions AS (\n  SELECT user_id, wpm, accuracy,\n         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY wpm DESC) as rank\n  FROM typing_results\n  WHERE created_at >= NOW() - INTERVAL 30 DAY\n)\nSELECT user_id, wpm, accuracy FROM RankedSessions WHERE rank = 1;',
    keyPractices: ['Uppercase Keywords', 'Parentheses ()', 'Comparison >=']
  },

  // Syntax Blitz (Pure Developer Delimiters & Symbols)
  {
    id: 'syntax-brackets-delimiters',
    title: 'Brackets & Delimiters Blitz',
    language: 'syntax_blitz',
    languageName: 'Syntax Blitz',
    difficulty: 'hard',
    description: 'Concentrated bracket pairs and operators to eliminate hesitation on developer keys',
    code: '() => { return [x, y, { id: a[0], active: true }]; }; (x !== null && y ?? false); a <= b && c >= d;',
    keyPractices: ['Bracket Pairs {} [] ()', 'Strict Inequality !==', 'Nullish Coalescing ??']
  },
  {
    id: 'syntax-casing-sprint',
    title: 'Variable Casing & Identifiers Sprint',
    language: 'syntax_blitz',
    languageName: 'Syntax Blitz',
    difficulty: 'normal',
    description: 'Rapid alternation between camelCase, snake_case, and PascalCase',
    code: 'const userProfileId = fetch_account_data(AccountType.ENTERPRISE_TIER, { maxRetries: 3, is_verified: true });',
    keyPractices: ['CamelCase', 'Snake_case', 'CONSTANT_CASE']
  }
];

export const DEVELOPER_SYNTAX_TIPS = [
  {
    title: 'Master the Right Pinky for Brackets',
    tip: 'Keep your right hand anchored on the J-K-L-; home row. Curl your pinky slightly up and right to hit [ and { without moving your entire wrist.'
  },
  {
    title: 'The Arrow Operator Rhythm',
    tip: 'For => and ->, practice striking = or - with your right ring or pinky, immediately followed by > (Shift + .). Flow it as a single compound syllable.'
  },
  {
    title: 'CamelCase Shift Coordination',
    tip: 'Always use the opposite hand shift: when capitalizing a right-hand letter (P, O, I, K), hold Left Shift with your left pinky. When capitalizing left-hand letters, use Right Shift.'
  },
  {
    title: 'Parentheses vs Curly Braces',
    tip: 'Build distinct muscle memory: Shift + 9 and 0 for parentheses, Shift + [ and ] for curly braces. In modern editors, type the opening bracket and let autocomplete manage the closing one!'
  }
];
