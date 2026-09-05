import React from 'react';
import { X, Palette, RotateCcw, Check } from 'lucide-react';
import { CustomThemeColors } from '../types';
import { DEFAULT_CUSTOM_THEME } from '../utils/themes';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customColors: CustomThemeColors;
  onUpdateCustomColors: (colors: Partial<CustomThemeColors>) => void;
  onSelectTheme: (themeId: any) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  customColors,
  onUpdateCustomColors,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateCustomColors(DEFAULT_CUSTOM_THEME);
  };

  const handleApplyAndSelect = () => {
    onSelectTheme('custom');
    onClose();
  };

  const colorFields: { key: keyof CustomThemeColors; label: string; desc: string }[] = [
    { key: 'bg', label: 'Canvas Background', desc: 'Main full-page background tone' },
    { key: 'cardBg', label: 'Card / Panel Surface', desc: 'Container backgrounds & dropdowns' },
    { key: 'accent', label: 'Primary Accent', desc: 'Highlights, Caret & Badges' },
    { key: 'textPrimary', label: 'Text (Primary)', desc: 'Main headings & typed text' },
    { key: 'textSecondary', label: 'Text (Muted)', desc: 'Untyped words & subtitles' },
    { key: 'correct', label: 'Correct Character', desc: 'Accurately typed letter feedback' },
    { key: 'incorrect', label: 'Incorrect Character', desc: 'Miskeyed letter feedback' },
    { key: 'border', label: 'Border Color', desc: 'Dividers & container borders' },
  ];

  return (
    <div
      id="theme-customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/60 p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Custom CSS Theming Engine
              </h2>
              <p className="text-xs text-zinc-400">
                Personalize your typing environment with real-time CSS variables
              </p>
            </div>
          </div>
          <button
            id="close-theme-customizer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Color Preview Strip */}
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col gap-2 font-mono text-xs">
          <span className="text-[11px] font-medium text-zinc-400">Live Typography & State Preview</span>
          <div
            className="p-3 rounded-lg flex items-center gap-2 text-sm"
            style={{ backgroundColor: customColors.cardBg || '#191d26' }}
          >
            <span style={{ color: customColors.correct || '#38bdf8' }}>quick</span>
            <span
              className="px-0.5 rounded-xs"
              style={{
                color: customColors.incorrect || '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
              }}
            >
              browm
            </span>
            <span
              className="border-b-2"
              style={{
                borderColor: customColors.accent || '#38bdf8',
                color: customColors.textPrimary || '#f1f5f9',
              }}
            >
              fox
            </span>
            <span style={{ color: customColors.textSecondary || '#94a3b8' }}>jumps over</span>
          </div>
        </div>

        {/* Color Pickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {colorFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-zinc-200">{field.label}</span>
                <span className="text-[10px] text-zinc-400">{field.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColors[field.key] || '#ffffff'}
                  onChange={(e) => onUpdateCustomColors({ [field.key]: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              id="apply-custom-theme-btn"
              onClick={handleApplyAndSelect}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono transition-colors shadow-sm shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
