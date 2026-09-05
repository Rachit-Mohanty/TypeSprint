// Extensive word databases, quotes, programming drills, and text generators for typing practice

export const TOP_200_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not',
  'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will',
  'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time',
  'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these',
  'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over',
  'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back',
  'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each',
  'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand',
  'old', 'life', 'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call',
  'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another', 'begin',
  'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'child', 'few', 'small',
  'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow',
  'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible', 'head', 'consider', 'word',
  'program', 'problem', 'however', 'lead', 'system', 'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact',
  'group', 'play', 'stand', 'increase', 'early', 'course', 'change', 'help', 'line'
];

export const TOP_1000_WORDS = [
  ...TOP_200_WORDS,
  'ability', 'able', 'abroad', 'accept', 'access', 'across', 'action', 'active', 'actual', 'address', 'admin',
  'advance', 'advice', 'affect', 'afford', 'agree', 'ahead', 'airline', 'airport', 'alarm', 'alcohol', 'alive',
  'almost', 'alone', 'along', 'already', 'always', 'amount', 'ancient', 'animal', 'annual', 'answer', 'anyone',
  'appear', 'apply', 'approach', 'approve', 'argue', 'arise', 'around', 'arrange', 'arrest', 'arrive', 'article',
  'artist', 'aspect', 'assume', 'attack', 'attempt', 'attend', 'attitude', 'attract', 'author', 'average', 'avoid',
  'award', 'aware', 'balance', 'barrier', 'basic', 'battery', 'battle', 'beauty', 'become', 'before', 'behavior',
  'behind', 'belief', 'belong', 'benefit', 'beside', 'beyond', 'billion', 'biology', 'bitter', 'blanket', 'breathe',
  'bridge', 'brief', 'bright', 'broad', 'budget', 'bullet', 'burden', 'business', 'cabinet', 'camera', 'campus',
  'capable', 'capital', 'capture', 'carbon', 'career', 'careful', 'carrier', 'castle', 'category', 'cause', 'ceiling',
  'celebrate', 'center', 'century', 'certain', 'chain', 'chamber', 'channel', 'chapter', 'charity', 'chemical',
  'choice', 'chronic', 'circuit', 'citizen', 'classic', 'climate', 'clinic', 'cluster', 'comfort', 'command',
  'comment', 'compact', 'company', 'compare', 'compete', 'complex', 'compose', 'concept', 'concern', 'concert',
  'conduct', 'confirm', 'connect', 'consent', 'contain', 'content', 'contest', 'context', 'control', 'convert',
  'convince', 'correct', 'corridor', 'cotton', 'counsel', 'counter', 'country', 'courage', 'coverage', 'creation',
  'credit', 'cricket', 'critic', 'crucial', 'crystal', 'culture', 'current', 'custom', 'damage', 'danger', 'daylight',
  'decade', 'decision', 'declare', 'decline', 'default', 'defense', 'deficit', 'degree', 'deliver', 'demand', 'density',
  'deposit', 'derive', 'describe', 'desert', 'design', 'desire', 'destroy', 'detail', 'detect', 'develop', 'device',
  'diamond', 'digital', 'dimension', 'direct', 'disable', 'disaster', 'discover', 'disease', 'display', 'dispute',
  'distant', 'distinct', 'distribute', 'district', 'diverse', 'dividend', 'division', 'document', 'domain', 'domestic',
  'dominant', 'donation', 'drastic', 'dynamic', 'earnest', 'economy', 'edition', 'educate', 'effective', 'efficient',
  'element', 'elevator', 'eligible', 'embrace', 'emerge', 'emission', 'emotion', 'emphasis', 'empirical', 'employee',
  'empower', 'enclose', 'encounter', 'endpoint', 'endure', 'energy', 'enforce', 'engage', 'engine', 'enhance', 'enormous',
  'ensure', 'enterprise', 'entitle', 'entity', 'envelope', 'equality', 'equation', 'equip', 'era', 'escalate', 'essence',
  'establish', 'estimate', 'eternal', 'ethical', 'evaluate', 'evident', 'evolve', 'exact', 'examine', 'example', 'exceed',
  'exchange', 'exclude', 'execute', 'exercise', 'exhaust', 'exhibit', 'expand', 'expect', 'expense', 'expert', 'explain',
  'explicit', 'explore', 'expose', 'express', 'extend', 'extent', 'external', 'extreme', 'fabric', 'facility', 'factor',
  'failure', 'fairly', 'faithful', 'family', 'famous', 'fantasy', 'fashion', 'feature', 'federal', 'feedback', 'fiction',
  'finance', 'flavor', 'flexible', 'flight', 'flourish', 'focus', 'forecast', 'foreign', 'forever', 'formula', 'fortune',
  'forward', 'founder', 'fraction', 'fragment', 'freedom', 'frequent', 'friction', 'frontier', 'fulfill', 'function',
  'fundamental', 'furnish', 'further', 'gallery', 'gateway', 'gather', 'general', 'generate', 'generic', 'generous',
  'genius', 'genuine', 'geography', 'gesture', 'glance', 'glimpse', 'glory', 'governance', 'graceful', 'gradual', 'grammar',
  'grand', 'granite', 'graphics', 'grateful', 'gravity', 'guidance', 'habitat', 'harmony', 'harvest', 'headline',
  'health', 'heritage', 'highway', 'historic', 'horizon', 'hospital', 'hostile', 'humble', 'hundred', 'hybrid', 'identify'
];

export const TRIGRAMS = [
  'the', 'and', 'ing', 'ion', 'ent', 'tio', 'for', 'ati', 'ter', 'her', 'tha', 'ere', 'eth', 'int',
  'all', 'nde', 'has', 'sta', 'out', 'tou', 'wit', 'ith', 'ver', 'ers', 'his', 'res', 'ill', 'are',
  'rea', 'pro', 'con', 'com', 'ear', 'ein', 'ess', 'eve', 'fro', 'hat', 'hem', 'hen', 'hin', 'ive',
  'ist', 'lan', 'man', 'men', 'nde', 'nte', 'ome', 'one', 'ont', 'our', 'per', 'red', 'san', 'sen',
  'ted', 'tin', 'ton', 'und', 'ven', 'was', 'wer', 'who', 'win', 'wor'
];

export const FAMOUS_QUOTES = [
  {
    quote: "Simplicity is the prerequisite for reliability.",
    author: "Edsger W. Dijkstra"
  },
  {
    quote: "The only way to go fast is to go well.",
    author: "Robert C. Martin"
  },
  {
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  },
  {
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  },
  {
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "Precision beats speed, but fluid speed paired with precision creates mastery.",
    author: "Typing Mastery"
  }
];

export const CODE_SNIPPETS = [
  "const calculateSpeed = (chars, seconds) => Math.round((chars / 5) / (seconds / 60));",
  "function debounce(func, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; }",
  "const [accuracy, setAccuracy] = useState<number>(100); useEffect(() => { updateStats(); }, [keystrokes]);",
  "export async function fetchUserProgress(id: string): Promise<UserStats> { const res = await fetch(`/api/stats/${id}`); return res.json(); }",
  "type Metric = { wpm: number; accuracy: number; timestamp: number; keyErrors: string[]; };",
  "for (let i = 0; i < array.length; i++) { if (array[i] === target) return i; } return -1;",
  "const sortedResults = results.sort((a, b) => b.wpm - a.wpm).slice(0, 10);"
];

export const BURST_DRILL_SETS = [
  ["quick", "brown", "fox", "jumps", "over"],
  ["fluid", "rhythm", "steady", "fingers", "speed"],
  ["focus", "sharp", "reflex", "motion", "mastery"],
  ["swift", "breeze", "silent", "shadow", "spark"],
  ["keyboard", "warrior", "precision", "accuracy", "flow"],
  ["digital", "circuit", "quantum", "velocity", "vector"],
  ["muscle", "memory", "lightning", "cadence", "racer"]
];

export function generateRandomWords(count: number, source: string[] = TOP_200_WORDS): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * source.length);
    result.push(source[randomIndex]);
  }
  return result;
}

export function generateTrigramPractice(trigramCount: number = 20): string[] {
  const words: string[] = [];
  for (let i = 0; i < trigramCount; i++) {
    const tri = TRIGRAMS[Math.floor(Math.random() * TRIGRAMS.length)];
    // Build rhythmic pseudo-words containing trigrams
    const prefix = ['re', 'in', 'un', 'pre', 'dis', 'con', ''][Math.floor(Math.random() * 7)];
    const suffix = ['ed', 'ing', 'ly', 'er', 'tion', 'es', ''][Math.floor(Math.random() * 7)];
    words.push(`${prefix}${tri}${suffix}`.replace(/^$/, tri));
  }
  return words;
}

export function generateWeakKeyDrill(weakKeys: string[], wordCount: number = 25): string[] {
  if (weakKeys.length === 0) {
    return generateRandomWords(wordCount, TOP_200_WORDS);
  }

  const matchingWords = TOP_1000_WORDS.filter(word =>
    weakKeys.some(key => word.toLowerCase().includes(key.toLowerCase()))
  );

  if (matchingWords.length < 5) {
    // Generate synthetic targeting patterns like 'afa', 'aza', 'fjf'
    const synthetic: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const key = weakKeys[i % weakKeys.length];
      synthetic.push(`${key}${key} ${key}a${key} ${key}e${key} t${key}o`);
    }
    return synthetic.join(' ').split(' ');
  }

  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(matchingWords[Math.floor(Math.random() * matchingWords.length)]);
  }
  return result;
}

export function generateNumbersAndPunctuation(wordCount: number = 25): string[] {
  const baseWords = generateRandomWords(wordCount, TOP_200_WORDS);
  const punctuation = ['.', ',', '!', '?', ';', ':', '-', '(', ')', '"', "'"];
  
  return baseWords.map((word, idx) => {
    if (idx % 3 === 0) {
      const punc = punctuation[Math.floor(Math.random() * punctuation.length)];
      return word + punc;
    }
    if (idx % 5 === 0) {
      const num = Math.floor(Math.random() * 900 + 100);
      return `${word} ${num}`;
    }
    return word;
  });
}
