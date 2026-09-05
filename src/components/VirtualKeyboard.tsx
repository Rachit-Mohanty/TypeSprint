import React from 'react';
import { KeyStat, KeyboardLayout } from '../types';
import { KEYBOARD_LAYOUTS } from '../utils/layouts';
import { ThemeConfig } from '../utils/themes';

interface VirtualKeyboardProps {
  targetKey: string;
  theme: ThemeConfig;
  showFingerGuide: boolean;
  layout?: KeyboardLayout;
  keyStats?: Record<string, KeyStat>;
  showHeatmap?: boolean;
  onSelectLayout?: (layout: KeyboardLayout) => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  theme,
  showFingerGuide,
  layout = 'qwerty',
  keyStats,
  showHeatmap = false,
  onSelectLayout,
}) => {
  const activeLayout = KEYBOARD_LAYOUTS[layout] || KEYBOARD_LAYOUTS.qwerty;
  const normalizedTarget = targetKey ? targetKey.toLowerCase() : '';
  const isTargetSpace = targetKey === ' ';

  const getFingerForChar = (char: string) => {
    return activeLayout.fingerMapping[char] || activeLayout.fingerMapping[char.toLowerCase()];
  };

  const currentFinger = isTargetSpace
    ? { name: 'Thumb', hand: 'left', color: '#a855f7' }
    : getFingerForChar(normalizedTarget);

  const getKeyAccuracyColor = (char: string) => {
    if (!showHeatmap || !keyStats) return null;
    const stat = keyStats[char.toLowerCase()];
    if (!stat || stat.total < 3) return null;
    const acc = ((stat.total - stat.errors) / stat.total) * 100;
    if (acc >= 95) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (acc >= 85) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div
      id="virtual-keyboard-card"
      className={`w-full max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xs select-none transition-all`}
    >
      {/* Target Key & Finger Guide Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          {showFingerGuide && currentFinger && (
            <div className="flex items-center gap-2">
              <span className={`${theme.textMuted} text-[11px]`}>Target:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${theme.accentBg} ${theme.accentText} text-xs shadow-xs`}>
                {isTargetSpace ? 'SPACE' : targetKey || 'READY'}
              </span>
            </div>
          )}

          {showFingerGuide && currentFinger && (
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`${theme.textMuted} text-[11px]`}>Finger:</span>
              <div className={`flex items-center gap-1.5 ${theme.textPrimary}`}>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: currentFinger.color }}
                />
                <span className="capitalize text-xs">{currentFinger.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Layout indicator & switcher */}
        <div className="flex items-center gap-1">
          <span className={`text-[11px] ${theme.textMuted} mr-1`}>Layout:</span>
          {(['qwerty', 'dvorak', 'colemak'] as KeyboardLayout[]).map((lId) => {
            const isSelected = layout === lId;
            return (
              <button
                key={lId}
                id={`virtual-kb-layout-${lId}`}
                onClick={() => onSelectLayout?.(lId)}
                title={KEYBOARD_LAYOUTS[lId].description}
                className={`px-2.5 py-0.5 text-[11px] font-medium rounded-lg transition-all ${
                  isSelected
                    ? `${theme.accentBg} ${theme.accentText} shadow-xs font-bold`
                    : `${theme.cardBgSubtle} ${theme.borderSubtle} ${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                {KEYBOARD_LAYOUTS[lId].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex flex-col gap-1 sm:gap-1.5 items-center justify-center font-mono min-w-[480px] sm:min-w-0">
          {activeLayout.rows.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center w-full">
              {row.map((key, kIdx) => {
                const isSpace = key === 'Space';
                const isTarget =
                  (isSpace && isTargetSpace) ||
                  (!isSpace && key.toLowerCase() === normalizedTarget);

                const finger = getFingerForChar(key);
                const heatClass = getKeyAccuracyColor(key);
                const isHomeKey = activeLayout.homeKeys.includes(key.toLowerCase());

                // Width classes
                let widthClass = 'w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10';
                if (key === 'Backspace' || key === 'Enter') widthClass = 'w-12 sm:w-14 md:w-18 h-7 sm:h-8 md:h-10';
                else if (key === 'Tab' || key === 'Caps') widthClass = 'w-10 sm:w-12 md:w-14 h-7 sm:h-8 md:h-10';
                else if (key === 'Shift') widthClass = 'w-13 sm:w-16 md:w-20 h-7 sm:h-8 md:h-10';
                else if (isSpace) widthClass = 'w-36 sm:w-48 md:w-60 h-7 sm:h-8 md:h-10';
                else if (key === 'Ctrl' || key === 'Alt') widthClass = 'w-9 sm:w-10 md:w-12 h-7 sm:h-8 md:h-10';

                let keyStyleClass = `${theme.cardBgSubtle} ${theme.textPrimary} border ${theme.borderSubtle}`;
                if (isTarget) {
                  keyStyleClass = `${theme.accentBg} ${theme.accentText} font-bold shadow-xs scale-105 z-10`;
                } else if (heatClass) {
                  keyStyleClass = heatClass;
                }

                return (
                  <div
                    key={kIdx}
                    className={`${widthClass} rounded-lg relative flex flex-col items-center justify-center text-[10px] sm:text-xs font-medium transition-all duration-150 ${keyStyleClass}`}
                  >
                    <span className="uppercase">{key}</span>
                    {isHomeKey && !isTarget && (
                      <span className={`w-2 h-[2px] sm:w-2.5 sm:h-[2px] ${theme.textPrimary} opacity-50 absolute bottom-1 rounded-full`} />
                    )}
                    {showFingerGuide && finger && !isTarget && !isSpace && key.length === 1 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full absolute top-1 right-1 opacity-75"
                        style={{ backgroundColor: finger.color }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Finger Legend Footer */}
      {showFingerGuide && (
        <div className={`flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t ${theme.borderSubtle} text-[11px] font-mono ${theme.textSecondary}`}>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 opacity-75">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Pinky</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              <span>Ring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" />
              <span>Middle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span>Index</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span>Thumb (Space)</span>
            </div>
          </div>

          <div className="text-[10px] opacity-60 flex items-center gap-1">
            <span>Home Anchors:</span>
            <span className={`px-1 rounded ${theme.cardBgSubtle} font-mono ${theme.textPrimary}`}>
              {activeLayout.homeKeys[0].toUpperCase()} / {activeLayout.homeKeys[1].toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
