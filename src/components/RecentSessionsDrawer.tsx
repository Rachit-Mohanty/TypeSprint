import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  Crosshair,
  Zap,
  Gauge,
  RotateCcw,
  CheckCircle2,
  Code2,
  Quote,
  Type,
  ChevronRight,
  BarChart2,
  ArrowRight,
  Filter,
  Trash2
} from 'lucide-react';
import { TestResult, TestMode } from '../types';
import { ThemeConfig } from '../utils/themes';

interface RecentSessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResult[];
  latestResult: TestResult | null;
  theme: ThemeConfig;
  onSelectResultForInspection: (result: TestResult) => void;
  onRetestSession: (mode: TestMode, option?: number, snippetText?: string) => void;
  onClearHistory?: () => void;
}

export const RecentSessionsDrawer: React.FC<RecentSessionsDrawerProps> = ({
  isOpen,
  onClose,
  results,
  latestResult,
  theme,
  onSelectResultForInspection,
  onRetestSession,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'compare'>('list');
  const [filterMode, setFilterMode] = useState<string>('all');
  
  // Comparison selections (ID of session A and B)
  const [baselineId, setBaselineId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');

  // Default baseline to latest result or first in list
  useEffect(() => {
    if (results.length > 0) {
      if (!baselineId || !results.some(r => r.id === baselineId)) {
        setBaselineId(latestResult?.id || results[0].id);
      }
      if (!targetId || !results.some(r => r.id === targetId)) {
        // Pick the second result if available, otherwise the first
        setTargetId(results[1] ? results[1].id : results[0].id);
      }
    }
  }, [results, latestResult, baselineId, targetId]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const filteredResults = useMemo(() => {
    if (filterMode === 'all') return results;
    return results.filter(r => r.mode === filterMode);
  }, [results, filterMode]);

  // Average WPM for relative badge
  const averageWpm = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / results.length);
  }, [results]);

  // Baseline and target session objects
  const baselineSession = useMemo(() => {
    return results.find(r => r.id === baselineId) || latestResult || results[0];
  }, [results, baselineId, latestResult]);

  const targetSession = useMemo(() => {
    return results.find(r => r.id === targetId) || results[1] || results[0];
  }, [results, targetId]);

  // Helper format relative time
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getModeIcon = (mode: TestMode) => {
    switch (mode) {
      case 'time': return <Clock className="w-3.5 h-3.5" />;
      case 'words': return <Type className="w-3.5 h-3.5" />;
      case 'quote': return <Quote className="w-3.5 h-3.5" />;
      case 'code': return <Code2 className="w-3.5 h-3.5" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const startQuickCompare = (sessionId: string) => {
    setBaselineId(latestResult?.id || results[0]?.id || sessionId);
    setTargetId(sessionId);
    setActiveTab('compare');
  };

  return (
    <>
      {/* Sliding Drawer Backdrop */}
      <div
        id="recent-sessions-backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Sliding Drawer Container */}
      <aside
        id="recent-sessions-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Recent Sessions Sidebar"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] md:w-[480px] ${theme.cardBg} border-l ${theme.borderSubtle} shadow-2xl flex flex-col transition-transform duration-300 ease-out transform select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 border-b ${theme.borderSubtle} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center font-mono shadow-xs`}>
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-base tracking-tight ${theme.textPrimary}`}>
                  Recent Sessions
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${theme.cardBgSubtle} border ${theme.borderSubtle} ${theme.textSecondary}`}>
                  {results.length} total
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted} font-mono mt-0.5`}>
                Click any session for quick comparison
              </p>
            </div>
          </div>

          <button
            id="close-recent-sessions-drawer"
            onClick={onClose}
            className={`p-2 rounded-xl ${theme.cardBgSubtle} hover:${theme.textPrimary} ${theme.textSecondary} border ${theme.borderSubtle} transition-all`}
            title="Close sidebar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className={`px-4 pt-3 pb-2 border-b ${theme.borderSubtle} flex items-center justify-between gap-2 shrink-0 bg-black/5 dark:bg-white/5`}>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              id="drawer-tab-list"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'list'
                  ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>All Sessions</span>
            </button>

            <button
              id="drawer-tab-compare"
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'compare'
                  ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Quick Compare</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className={`bg-transparent ${theme.textSecondary} hover:${theme.textPrimary} text-[11px] font-mono cursor-pointer outline-none border ${theme.borderSubtle} rounded-md px-1.5 py-1`}
              >
                <option value="all" className={theme.cardBg}>Filter: All</option>
                <option value="time" className={theme.cardBg}>Time</option>
                <option value="words" className={theme.cardBg}>Words</option>
                <option value="code" className={theme.cardBg}>Code</option>
                <option value="quote" className={theme.cardBg}>Quote</option>
                <option value="drill" className={theme.cardBg}>Drills</option>
              </select>
            </div>
          )}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {/* TAB 1: SESSIONS LIST */}
          {activeTab === 'list' && (
            <>
              {results.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className={`w-12 h-12 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} flex items-center justify-center ${theme.textMuted} mb-3`}>
                    <History className="w-6 h-6 opacity-60" />
                  </div>
                  <h3 className={`text-sm font-bold ${theme.textPrimary}`}>No Recent Sessions</h3>
                  <p className={`text-xs ${theme.textSecondary} mt-1 max-w-xs font-mono`}>
                    Complete a test to start building your speed history and comparative benchmarks.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredResults.map((res, index) => {
                    const isLatest = latestResult?.id === res.id || index === 0;
                    const wpmDiff = res.wpm - averageWpm;

                    return (
                      <div
                        key={res.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLatest
                            ? `border-amber-400/50 ${theme.cardBgSubtle} shadow-xs`
                            : `${theme.borderSubtle} ${theme.cardBgSubtle} hover:border-zinc-500/50`
                        }`}
                      >
                        {/* Top Metadata Row */}
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${theme.accentBg} ${theme.accentText}`}>
                              {getModeIcon(res.mode)}
                              <span>{res.modeDetail || res.mode}</span>
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                Latest
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] ${theme.textMuted}`}>
                            {formatTimeAgo(res.timestamp)}
                          </span>
                        </div>

                        {/* Core Speed & Accuracy Indicators */}
                        <div className="flex items-end justify-between gap-2">
                          <div className="flex items-baseline gap-3 font-mono">
                            <div>
                              <span className={`text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                                {res.wpm}
                              </span>
                              <span className={`text-[10px] ${theme.textMuted} ml-1`}>WPM</span>
                            </div>

                            <div className="text-xs">
                              <span className={`font-semibold ${theme.textPrimary}`}>
                                {res.accuracy}%
                              </span>
                              <span className={`text-[10px] ${theme.textMuted} ml-1`}>Acc</span>
                            </div>

                            <div className="text-xs">
                              <span className={`font-semibold ${theme.textSecondary}`}>
                                {res.consistency}%
                              </span>
                              <span className={`text-[10px] ${theme.textMuted} ml-1`}>Const</span>
                            </div>
                          </div>

                          {/* Relative delta tag */}
                          {wpmDiff !== 0 && (
                            <span
                              className={`text-[11px] font-mono font-medium flex items-center gap-0.5 ${
                                wpmDiff > 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {wpmDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>{wpmDiff > 0 ? `+${wpmDiff}` : wpmDiff} vs avg</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className={`mt-3 pt-2.5 border-t ${theme.borderSubtle} flex items-center justify-between text-xs font-mono`}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startQuickCompare(res.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${theme.borderSubtle} ${theme.cardBg} hover:${theme.textPrimary} ${theme.textSecondary} flex items-center gap-1 transition-all`}
                              title="Compare this session with another"
                            >
                              <BarChart2 className="w-3 h-3" />
                              <span>Compare</span>
                            </button>

                            <button
                              onClick={() => {
                                onSelectResultForInspection(res);
                                onClose();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${theme.accentBg} ${theme.accentText} flex items-center gap-1 transition-all`}
                              title="Open full analytics breakdown"
                            >
                              <span>Full Breakdown</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              onRetestSession(res.mode, res.duration, res.textSnippet);
                              onClose();
                            }}
                            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textPrimary} transition-all`}
                            title="Retest this setup"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: QUICK COMPARISON VIEW */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              {results.length < 2 ? (
                <div className="py-12 text-center">
                  <BarChart2 className={`w-8 h-8 mx-auto opacity-50 ${theme.textMuted} mb-2`} />
                  <p className={`text-xs ${theme.textSecondary} font-mono`}>
                    Complete at least two tests to compare speed, accuracy, and key errors side by side.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selectors for Session A & B */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>
                        Baseline Session (A)
                      </label>
                      <select
                        value={baselineSession?.id}
                        onChange={(e) => setBaselineId(e.target.value)}
                        className={`w-full p-2 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} text-xs font-mono outline-none`}
                      >
                        {results.map((r) => (
                          <option key={r.id} value={r.id} className={theme.cardBg}>
                            {r.wpm} WPM • {r.modeDetail} ({formatTimeAgo(r.timestamp)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] uppercase font-bold mb-1 ${theme.textMuted}`}>
                        Target Session (B)
                      </label>
                      <select
                        value={targetSession?.id}
                        onChange={(e) => setTargetId(e.target.value)}
                        className={`w-full p-2 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} text-xs font-mono outline-none`}
                      >
                        {results.map((r) => (
                          <option key={r.id} value={r.id} className={theme.cardBg}>
                            {r.wpm} WPM • {r.modeDetail} ({formatTimeAgo(r.timestamp)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Comparative Metrics Grid */}
                  {baselineSession && targetSession && (
                    <div className="space-y-3 font-mono">
                      {/* WPM Comparison Card */}
                      <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`uppercase font-bold tracking-wider ${theme.textMuted} flex items-center gap-1.5`}>
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Typing Speed (WPM)</span>
                          </span>
                          {/* Delta */}
                          {(() => {
                            const diff = targetSession.wpm - baselineSession.wpm;
                            return (
                              <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                diff > 0 ? 'text-emerald-400 bg-emerald-500/10' : diff < 0 ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-400'
                              }`}>
                                {diff > 0 ? `+${diff} WPM` : `${diff} WPM`}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className={`p-2.5 rounded-lg border ${theme.borderSubtle} bg-black/10 dark:bg-white/5`}>
                            <span className="text-[10px] uppercase block opacity-70">Session A</span>
                            <span className={`text-2xl font-bold ${theme.textPrimary}`}>
                              {baselineSession.wpm}
                            </span>
                            <span className="text-[10px] block opacity-60">Raw: {baselineSession.rawWpm}</span>
                          </div>

                          <div className={`p-2.5 rounded-lg border ${theme.borderSubtle} bg-black/10 dark:bg-white/5`}>
                            <span className="text-[10px] uppercase block opacity-70">Session B</span>
                            <span className={`text-2xl font-bold ${theme.textPrimary}`}>
                              {targetSession.wpm}
                            </span>
                            <span className="text-[10px] block opacity-60">Raw: {targetSession.rawWpm}</span>
                          </div>
                        </div>
                      </div>

                      {/* Accuracy & Consistency Comparison */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Accuracy */}
                        <div className={`p-3.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
                          <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1 flex items-center justify-between">
                            <span>Accuracy</span>
                            {(() => {
                              const diff = Number((targetSession.accuracy - baselineSession.accuracy).toFixed(1));
                              return (
                                <span className={diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {diff >= 0 ? `+${diff}%` : `${diff}%`}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex items-baseline justify-between text-xs mt-2">
                            <span>A: <strong>{baselineSession.accuracy}%</strong></span>
                            <span>&rarr;</span>
                            <span>B: <strong>{targetSession.accuracy}%</strong></span>
                          </div>
                        </div>

                        {/* Consistency */}
                        <div className={`p-3.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle}`}>
                          <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1 flex items-center justify-between">
                            <span>Consistency</span>
                            {(() => {
                              const diff = targetSession.consistency - baselineSession.consistency;
                              return (
                                <span className={diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {diff >= 0 ? `+${diff}%` : `${diff}%`}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex items-baseline justify-between text-xs mt-2">
                            <span>A: <strong>{baselineSession.consistency}%</strong></span>
                            <span>&rarr;</span>
                            <span>B: <strong>{targetSession.consistency}%</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Characters & Errors */}
                      <div className={`p-3.5 rounded-xl border ${theme.borderSubtle} ${theme.cardBgSubtle} text-xs`}>
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-2">
                          Stroke Execution Details
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="block opacity-60">Session A:</span>
                            <span className="font-semibold text-emerald-400">{baselineSession.correctChars} correct</span> / <span className="font-semibold text-rose-400">{baselineSession.incorrectChars} errors</span>
                          </div>
                          <div>
                            <span className="block opacity-60">Session B:</span>
                            <span className="font-semibold text-emerald-400">{targetSession.correctChars} correct</span> / <span className="font-semibold text-rose-400">{targetSession.incorrectChars} errors</span>
                          </div>
                        </div>
                      </div>

                      {/* Direct Inspect Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            onSelectResultForInspection(targetSession);
                            onClose();
                          }}
                          className={`flex-1 py-2.5 rounded-xl ${theme.accentBg} ${theme.accentText} text-xs font-bold transition-all text-center`}
                        >
                          View Session B Full Graph &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {results.length > 0 && onClearHistory && (
          <div className={`p-3 border-t ${theme.borderSubtle} flex items-center justify-between text-xs font-mono ${theme.textMuted} shrink-0 bg-black/5 dark:bg-white/5`}>
            <span>Storage: Offline Local</span>
            <button
              onClick={() => {
                if (window.confirm('Clear all typing history?')) {
                  onClearHistory();
                }
              }}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
