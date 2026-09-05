import React, { useState, useMemo } from 'react';
import {
  Code2,
  Terminal,
  Play,
  Brackets,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  Flame,
  Check,
  Copy,
  Zap,
  Cpu,
  FileCode,
  FileText,
  Bot,
  Wand2,
} from 'lucide-react';
import { ThemeConfig } from '../utils/themes';
import { CODE_SNIPPETS_LIBRARY, CodeSnippet, DEVELOPER_SYNTAX_TIPS } from '../data/codeSnippets';
import { OverallStats, AICodeSnippetResponse } from '../types';
import { generateAICodeSnippet } from '../utils/aiService';

interface CodeTypingViewProps {
  theme: ThemeConfig;
  stats: OverallStats;
  onLaunchCodeTest: (codeText: string, title: string) => void;
}

export const CodeTypingView: React.FC<CodeTypingViewProps> = ({
  theme,
  stats,
  onLaunchCodeTest,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [customCodeInput, setCustomCodeInput] = useState<string>('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Gemini AI Code Generator State
  const [aiLang, setAiLang] = useState<string>('TypeScript');
  const [aiTopic, setAiTopic] = useState<string>('Async retry with exponential backoff');
  const [aiDifficulty, setAiDifficulty] = useState<string>('medium');
  const [isGeneratingAiCode, setIsGeneratingAiCode] = useState<boolean>(false);
  const [generatedAiSnippet, setGeneratedAiSnippet] = useState<AICodeSnippetResponse | null>(null);

  // Filter snippets
  const filteredSnippets = useMemo(() => {
    return CODE_SNIPPETS_LIBRARY.filter((snippet) => {
      const matchLang = selectedLanguage === 'all' || snippet.language === selectedLanguage;
      const matchDiff = selectedDifficulty === 'all' || snippet.difficulty === selectedDifficulty;
      return matchLang && matchDiff;
    });
  }, [selectedLanguage, selectedDifficulty]);

  const handleCopySnippet = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedSnippetId(snippet.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleLaunchCustomCode = () => {
    if (!customCodeInput.trim()) return;
    onLaunchCodeTest(customCodeInput.trim(), 'Custom Code Snippet');
  };

  const handleGenerateAiCode = async () => {
    setIsGeneratingAiCode(true);
    try {
      const result = await generateAICodeSnippet(aiLang, aiTopic, aiDifficulty);
      setGeneratedAiSnippet(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiCode(false);
    }
  };

  const languageTabs = [
    { id: 'all', name: 'All Languages' },
    { id: 'syntax_blitz', name: '⚡ Delimiters Blitz' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'rust', name: 'Rust' },
    { id: 'go', name: 'Go' },
    { id: 'html_css', name: 'HTML & Tailwind' },
    { id: 'sql', name: 'SQL' },
  ];

  return (
    <div id="code-typing-studio" className="w-full max-w-5xl mx-auto py-2 sm:py-6 flex flex-col gap-6 animate-fade-in font-sans">
      {/* Header Section */}
      <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-3 border border-amber-400/30 bg-amber-400/10 text-amber-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Speed Engine</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textPrimary}`}>
              Code Typing Studio
            </h1>
            <p className={`text-sm ${theme.textSecondary} mt-2 leading-relaxed`}>
              Standard typing tests test plain prose. Real code requires rapid coordination of curly braces, brackets, arrow operators, camelCase identifiers, and indentation. Practice with curated idiomatic snippets or generate custom AI snippets with Gemini.
            </p>
          </div>

          {/* Quick Benchmark Stats */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 font-mono">
            <div className={`p-3.5 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} text-left sm:text-right w-full sm:w-auto`}>
              <span className={`text-[10px] uppercase tracking-wider block ${theme.textMuted}`}>Overall Avg Speed</span>
              <span className={`text-2xl font-bold ${theme.textPrimary}`}>{stats.averageWpm} <span className="text-xs font-normal">WPM</span></span>
            </div>
            <div className={`p-3.5 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} text-left sm:text-right w-full sm:w-auto`}>
              <span className={`text-[10px] uppercase tracking-wider block ${theme.textMuted}`}>Accuracy Baseline</span>
              <span className={`text-2xl font-bold ${theme.textPrimary}`}>{stats.averageAccuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Code Snippet Generator */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${theme.textPrimary} flex items-center gap-2`}>
                <span>Gemini AI Code Architect</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  On-Demand Generation
                </span>
              </h2>
              <p className={`text-xs ${theme.textSecondary} mt-0.5 font-sans`}>
                Generate realistic production algorithms, system primitives, and framework patterns on any topic
              </p>
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono text-xs">
          <div>
            <label className={`block text-[11px] font-medium ${theme.textMuted} mb-1.5`}>Language</label>
            <select
              value={aiLang}
              onChange={(e) => setAiLang(e.target.value)}
              className={`w-full p-2.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-purple-400`}
            >
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Rust">Rust</option>
              <option value="Go">Go</option>
              <option value="JavaScript">JavaScript</option>
              <option value="SQL">SQL</option>
              <option value="C++">C++</option>
            </select>
          </div>

          <div>
            <label className={`block text-[11px] font-medium ${theme.textMuted} mb-1.5`}>Topic / Concept</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g., Binary Search Tree, JWT auth..."
              className={`w-full p-2.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-purple-400`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-medium ${theme.textMuted} mb-1.5`}>Complexity</label>
            <div className="flex gap-2">
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className={`flex-1 p-2.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-purple-400`}
              >
                <option value="beginner">Beginner</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>

              <button
                id="generate-ai-code-btn"
                onClick={handleGenerateAiCode}
                disabled={isGeneratingAiCode || !aiTopic.trim()}
                className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGeneratingAiCode ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAiCode ? 'Generating...' : 'Craft'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Snippet Preview */}
        {generatedAiSnippet && (
          <div className={`p-4 rounded-2xl ${theme.cardBgSubtle} border border-purple-500/30 animate-fade-in`}>
            <div className="flex items-center justify-between mb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300">{generatedAiSnippet.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                  {generatedAiSnippet.language}
                </span>
              </div>
              <button
                onClick={() => onLaunchCodeTest(generatedAiSnippet.code, generatedAiSnippet.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Typing Practice</span>
              </button>
            </div>
            <p className={`text-xs ${theme.textSecondary} mb-3 font-sans`}>
              {generatedAiSnippet.description}
            </p>
            <pre className="p-3 rounded-xl bg-black/40 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
              {generatedAiSnippet.code}
            </pre>
          </div>
        )}
      </div>

      {/* Delimiter & Symbol Blitz Quick Launch */}
      <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${theme.accentBg} ${theme.accentText} flex items-center justify-center shrink-0`}>
              <Brackets className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${theme.textPrimary}`}>
                Brackets &amp; Delimiters Blitz
              </h2>
              <p className={`text-xs ${theme.textMuted} font-mono mt-0.5`}>
                Pure finger sprint training: <code className="text-amber-400">{'() => { [x, y] !== null && z ?? true; }'}</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const blitz = CODE_SNIPPETS_LIBRARY.find((s) => s.id === 'delimiters_blitz');
              if (blitz) onLaunchCodeTest(blitz.code, blitz.title);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shrink-0 ${theme.accentBg} ${theme.accentText} hover:scale-102 transition-all shadow-xs`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Syntax Blitz</span>
          </button>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
        {languageTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedLanguage(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedLanguage === tab.id
                ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
                : `${theme.cardBg} border ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSnippets.map((snippet) => (
          <div
            key={snippet.id}
            className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-all`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {snippet.language}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.cardBgSubtle} ${theme.textMuted} border ${theme.borderSubtle}`}>
                    {snippet.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopySnippet(snippet)}
                    className={`p-1.5 rounded-lg ${theme.cardBgSubtle} ${theme.textMuted} hover:${theme.textPrimary} transition-colors`}
                    title="Copy code"
                  >
                    {copiedSnippetId === snippet.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className={`text-sm font-bold ${theme.textPrimary} mb-1 font-mono`}>
                {snippet.title}
              </h3>
              <p className={`text-xs ${theme.textSecondary} mb-3 line-clamp-2`}>
                {snippet.description}
              </p>

              {/* Code preview block */}
              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-hidden line-clamp-4 leading-relaxed relative">
                <pre>{snippet.code}</pre>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 font-mono text-xs">
              <span className={theme.textMuted}>
                {snippet.code.split(/\s+/).length} tokens
              </span>

              <button
                onClick={() => onLaunchCodeTest(snippet.code, snippet.title)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${theme.accentBg} ${theme.accentText} hover:scale-102 shadow-xs`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Practice</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Code Workbench */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs`}>
        <div className="flex items-center gap-2 mb-2 font-mono">
          <FileCode className="w-4 h-4 text-amber-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textPrimary}`}>
            Custom Code Workbench
          </h3>
        </div>
        <p className={`text-xs ${theme.textSecondary} mb-4`}>
          Paste code from your current project, repository, or bugfix to practice typing real functions you write every day.
        </p>

        <textarea
          value={customCodeInput}
          onChange={(e) => setCustomCodeInput(e.target.value)}
          placeholder={`// Paste your TypeScript, Python, or SQL code here...\nfunction calculateVelocity(distance: number, time: number) {\n  return distance / time;\n}`}
          rows={5}
          className={`w-full p-3.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} font-mono text-xs outline-hidden focus:border-amber-400/50 transition-all resize-y`}
        />

        <div className="flex items-center justify-between mt-3 font-mono text-xs">
          <span className={theme.textMuted}>
            {customCodeInput.trim() ? `${customCodeInput.trim().split(/\s+/).length} tokens` : '0 tokens'}
          </span>

          <button
            onClick={handleLaunchCustomCode}
            disabled={!customCodeInput.trim()}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              customCodeInput.trim()
                ? `${theme.accentBg} ${theme.accentText} hover:scale-102 shadow-xs`
                : 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice My Code</span>
          </button>
        </div>
      </div>

      {/* Developer Typing Ergonomics & Speed Tips */}
      <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs`}>
        <div className="flex items-center gap-2 mb-4 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textPrimary}`}>
            Developer Ergonomics &amp; Speed Principles
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEVELOPER_SYNTAX_TIPS.map((tip, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle}`}
            >
              <h4 className={`text-xs font-bold font-mono ${theme.textPrimary} mb-1 flex items-center gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {tip.title}
              </h4>
              <p className={`text-xs ${theme.textSecondary} leading-relaxed font-sans`}>
                {tip.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
