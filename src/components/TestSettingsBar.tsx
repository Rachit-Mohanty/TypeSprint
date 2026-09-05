import React, { useState } from 'react';
import { Clock, Type, Quote, Code2, Wrench, Hash, Sparkles, Sliders, ChevronDown, Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { TestMode, TimeOption, WordCountOption, UserPreferences, DifficultyLevel } from '../types';
import { ThemeConfig } from '../utils/themes';
import { DIFFICULTY_CONFIG } from '../utils/gamification';

interface TestSettingsBarProps {
  mode: TestMode;
  setMode: (mode: TestMode) => void;
  timeOption: TimeOption;
  setTimeOption: (time: TimeOption) => void;
  wordCountOption: WordCountOption;
  setWordCountOption: (count: WordCountOption) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  theme: ThemeConfig;
  disabled: boolean;
  onOpenCustomModal: () => void;
}

export const TestSettingsBar: React.FC<TestSettingsBarProps> = ({
  mode,
  setMode,
  timeOption,
  setTimeOption,
  wordCountOption,
  setWordCountOption,
  preferences,
  onUpdatePreferences,
  theme,
  disabled,
  onOpenCustomModal,
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <div
      id="test-settings-bar"
      className={`relative z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl ${theme.cardBgSubtle} border ${theme.borderSubtle} text-xs font-mono select-none shadow-xs transition-opacity duration-300 max-w-full overflow-x-auto no-scrollbar ${
        disabled ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Primary Mode Selector */}
      <div className="flex items-center gap-1">
        <button
          id="mode-btn-time"
          onClick={() => setMode('time')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-medium ${
            mode === 'time'
              ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>time</span>
        </button>

        <button
          id="mode-btn-words"
          onClick={() => setMode('words')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-medium ${
            mode === 'words'
              ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>words</span>
        </button>

        <button
          id="mode-btn-quote"
          onClick={() => setMode('quote')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-medium ${
            mode === 'quote'
              ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>quote</span>
        </button>

        <button
          id="mode-btn-code"
          onClick={() => setMode('code')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-medium ${
            mode === 'code'
              ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>code</span>
        </button>

        <button
          id="mode-btn-custom"
          onClick={() => {
            setMode('custom');
            onOpenCustomModal();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-medium ${
            mode === 'custom'
              ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">custom</span>
        </button>
      </div>

      {/* Vertical Divider */}
      <div className={`w-[1px] h-4 ${theme.borderSubtle} mx-1`} />

      {/* Sub-Options (Time or Word Count) */}
      {mode === 'time' && (
        <div className="flex items-center gap-1">
          {([15, 30, 60, 120] as TimeOption[]).map((t) => (
            <button
              key={t}
              id={`time-opt-${t}`}
              onClick={() => setTimeOption(t)}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium ${
                timeOption === t
                  ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
                  : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {mode === 'words' && (
        <div className="flex items-center gap-1">
          {([10, 25, 50, 100] as WordCountOption[]).map((c) => (
            <button
              key={c}
              id={`word-opt-${c}`}
              onClick={() => setWordCountOption(c)}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium ${
                wordCountOption === c
                  ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
                  : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Vertical Divider */}
      <div className={`w-[1px] h-4 ${theme.borderSubtle} mx-1`} />

      {/* Quick Modifiers */}
      <div className="flex items-center gap-1">
        <button
          id="toggle-punc-btn"
          onClick={() => onUpdatePreferences({ includePunctuation: !preferences.includePunctuation })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            preferences.includePunctuation
              ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
          title="Include punctuation marks (!?,.-:)"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">punctuation</span>
          <span className="sm:hidden">punc</span>
        </button>

        <button
          id="toggle-numbers-btn"
          onClick={() => onUpdatePreferences({ includeNumbers: !preferences.includeNumbers })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            preferences.includeNumbers
              ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
          title="Include numbers (0-9)"
        >
          <Hash className="w-3 h-3" />
          <span>numbers</span>
        </button>
      </div>

      {/* Vertical Divider */}
      <div className={`w-[1px] h-4 ${theme.borderSubtle} mx-1`} />

      {/* More Options Popover Trigger */}
      <div className="relative">
        <button
          id="toggle-options-popover-btn"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            isOptionsOpen || preferences.confidenceMode || preferences.suddenDeath
              ? `${theme.accentBg} ${theme.accentText} font-bold shadow-xs`
              : `${theme.textSecondary} hover:${theme.textPrimary} opacity-70 hover:opacity-100`
          }`}
          title="More practice options & difficulty"
        >
          <Sliders className="w-3 h-3" />
          <span className="hidden md:inline">options</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Options Dropdown Menu */}
        {isOptionsOpen && (
          <div
            id="test-options-menu"
            className={`absolute right-0 top-full mt-2 w-64 p-3 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} shadow-lg z-50 flex flex-col gap-3 font-mono`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.textPrimary}`}>
                Practice Settings
              </span>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className={`text-[10px] ${theme.textMuted} hover:${theme.textPrimary}`}
              >
                Close
              </button>
            </div>

            {/* Confidence Mode (No Backspacing) */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${theme.textPrimary} group-hover:${theme.accent}`}>
                  Confidence Mode
                </span>
                <span className={`text-[10px] ${theme.textMuted}`}>
                  Disables backspace correction
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.confidenceMode || false}
                onChange={(e) => onUpdatePreferences({ confidenceMode: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </label>

            {/* Sudden Death Mode */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${theme.textPrimary} group-hover:${theme.accent}`}>
                  Sudden Death
                </span>
                <span className={`text-[10px] ${theme.textMuted}`}>
                  Fail immediately on typo
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.suddenDeath || false}
                onChange={(e) => onUpdatePreferences({ suddenDeath: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </label>

            {/* Difficulty Tier */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <span className={`text-[10px] font-bold uppercase ${theme.textMuted}`}>
                Difficulty Tier
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['easy', 'normal', 'hard', 'master'] as DifficultyLevel[]).map((d) => {
                  const isSelected = (preferences.difficulty || 'normal') === d;
                  const cfg = DIFFICULTY_CONFIG[d];
                  return (
                    <button
                      key={d}
                      onClick={() => onUpdatePreferences({ difficulty: d })}
                      className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium border transition-all ${
                        isSelected
                          ? `${theme.accentBg} ${theme.accentText} border-transparent shadow-xs`
                          : `border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`
                      }`}
                    >
                      <div className="font-bold uppercase leading-none">{cfg.name}</div>
                      <div className="text-[9px] opacity-75 mt-0.5">{cfg.multiplier}x multiplier</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
