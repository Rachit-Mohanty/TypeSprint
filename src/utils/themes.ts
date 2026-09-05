import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  cardBg: string;
  cardBgSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  accentBg: string;
  accentText: string;
  correct: string;
  incorrect: string;
  caret: string;
  border: string;
  borderSubtle: string;
  shadowClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Dark',
    isDark: true,
    bg: 'bg-[#111318]',
    bgSecondary: 'bg-[#181B22]',
    bgTertiary: 'bg-[#212631]',
    cardBg: 'bg-[#181B22]',
    cardBgSubtle: 'bg-[#212631]',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    textMuted: 'text-zinc-600',
    accent: 'text-amber-400',
    accentHover: 'hover:bg-amber-400/10',
    accentLight: 'bg-amber-400/20 text-amber-300',
    accentBg: 'bg-amber-400',
    accentText: 'text-zinc-950 font-bold',
    correct: 'text-zinc-100',
    incorrect: 'text-rose-400 underline decoration-rose-500 decoration-2 bg-rose-500/15',
    caret: 'border-amber-400 bg-amber-400',
    border: 'border-zinc-800',
    borderSubtle: 'border-zinc-800/60',
    shadowClass: 'shadow-sm',
  },
  professional: {
    id: 'professional',
    name: 'Paper Light',
    isDark: false,
    bg: 'bg-[#F8F9FA]',
    bgSecondary: 'bg-[#FFFFFF]',
    bgTertiary: 'bg-[#F1F3F5]',
    cardBg: 'bg-[#FFFFFF]',
    cardBgSubtle: 'bg-[#F1F3F5]',
    textPrimary: 'text-[#18181B]',
    textSecondary: 'text-[#71717A]',
    textMuted: 'text-[#A1A1AA]',
    accent: 'text-[#18181B]',
    accentHover: 'hover:bg-zinc-100',
    accentLight: 'bg-zinc-100 text-zinc-900',
    accentBg: 'bg-[#18181B]',
    accentText: 'text-white font-bold',
    correct: 'text-[#18181B]',
    incorrect: 'text-red-600 underline decoration-red-500 decoration-2 bg-red-50',
    caret: 'border-[#18181B] bg-[#18181B]',
    border: 'border-zinc-200',
    borderSubtle: 'border-zinc-200/70',
    shadowClass: 'shadow-sm',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Midnight Cyan',
    isDark: true,
    bg: 'bg-[#0B0E17]',
    bgSecondary: 'bg-[#121726]',
    bgTertiary: 'bg-[#1B2238]',
    cardBg: 'bg-[#121726]',
    cardBgSubtle: 'bg-[#1B2238]',
    textPrimary: 'text-cyan-50',
    textSecondary: 'text-cyan-300/70',
    textMuted: 'text-cyan-900',
    accent: 'text-cyan-400',
    accentHover: 'hover:bg-cyan-400/10',
    accentLight: 'bg-cyan-400/20 text-cyan-300',
    accentBg: 'bg-cyan-400',
    accentText: 'text-zinc-950 font-bold',
    correct: 'text-cyan-100',
    incorrect: 'text-pink-400 underline decoration-pink-500 decoration-2 bg-pink-500/20',
    caret: 'border-cyan-400 bg-cyan-400',
    border: 'border-cyan-950',
    borderSubtle: 'border-cyan-950/60',
    shadowClass: 'shadow-sm',
  },
  serene: {
    id: 'serene',
    name: 'Serene Slate',
    isDark: false,
    bg: 'bg-[#F2F5F5]',
    bgSecondary: 'bg-[#FFFFFF]',
    bgTertiary: 'bg-[#E5EBEB]',
    cardBg: 'bg-[#FFFFFF]',
    cardBgSubtle: 'bg-[#E5EBEB]',
    textPrimary: 'text-[#134E4A]',
    textSecondary: 'text-[#5E7A78]',
    textMuted: 'text-[#9BB1B0]',
    accent: 'text-[#0D9488]',
    accentHover: 'hover:bg-teal-50',
    accentLight: 'bg-teal-50 text-teal-900',
    accentBg: 'bg-[#0D9488]',
    accentText: 'text-white font-bold',
    correct: 'text-[#134E4A]',
    incorrect: 'text-rose-700 underline decoration-rose-500 decoration-2 bg-rose-50',
    caret: 'border-[#0D9488] bg-[#0D9488]',
    border: 'border-teal-900/15',
    borderSubtle: 'border-teal-900/10',
    shadowClass: 'shadow-sm',
  },
  chalkboard: {
    id: 'chalkboard',
    name: 'Forest Emerald',
    isDark: true,
    bg: 'bg-[#0A1310]',
    bgSecondary: 'bg-[#11201B]',
    bgTertiary: 'bg-[#1A2E28]',
    cardBg: 'bg-[#11201B]',
    cardBgSubtle: 'bg-[#1A2E28]',
    textPrimary: 'text-emerald-50',
    textSecondary: 'text-emerald-300/70',
    textMuted: 'text-emerald-800',
    accent: 'text-emerald-400',
    accentHover: 'hover:bg-emerald-400/10',
    accentLight: 'bg-emerald-400/20 text-emerald-300',
    accentBg: 'bg-emerald-400',
    accentText: 'text-zinc-950 font-bold',
    correct: 'text-emerald-100',
    incorrect: 'text-rose-400 underline decoration-rose-500 decoration-2 bg-rose-500/20',
    caret: 'border-emerald-400 bg-emerald-400',
    border: 'border-emerald-950',
    borderSubtle: 'border-emerald-950/60',
    shadowClass: 'shadow-sm',
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Cream',
    isDark: false,
    bg: 'bg-[#F5F7F0]',
    bgSecondary: 'bg-[#FFFFFF]',
    bgTertiary: 'bg-[#EAEFE0]',
    cardBg: 'bg-[#FFFFFF]',
    cardBgSubtle: 'bg-[#EAEFE0]',
    textPrimary: 'text-[#2D3E1E]',
    textSecondary: 'text-[#657C50]',
    textMuted: 'text-[#A0B38E]',
    accent: 'text-[#4D7C0F]',
    accentHover: 'hover:bg-lime-50',
    accentLight: 'bg-lime-50 text-lime-900',
    accentBg: 'bg-[#4D7C0F]',
    accentText: 'text-white font-bold',
    correct: 'text-[#2D3E1E]',
    incorrect: 'text-red-700 underline decoration-red-500 decoration-2 bg-red-50',
    caret: 'border-[#4D7C0F] bg-[#4D7C0F]',
    border: 'border-lime-900/15',
    borderSubtle: 'border-lime-900/10',
    shadowClass: 'shadow-sm',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Plum',
    isDark: true,
    bg: 'bg-[#150F18]',
    bgSecondary: 'bg-[#1F1725]',
    bgTertiary: 'bg-[#2D2136]',
    cardBg: 'bg-[#1F1725]',
    cardBgSubtle: 'bg-[#2D2136]',
    textPrimary: 'text-orange-50',
    textSecondary: 'text-rose-300/70',
    textMuted: 'text-rose-900',
    accent: 'text-orange-400',
    accentHover: 'hover:bg-orange-400/10',
    accentLight: 'bg-orange-400/20 text-orange-300',
    accentBg: 'bg-orange-400',
    accentText: 'text-zinc-950 font-bold',
    correct: 'text-orange-100',
    incorrect: 'text-rose-400 underline decoration-rose-500 decoration-2 bg-rose-500/20',
    caret: 'border-orange-400 bg-orange-400',
    border: 'border-orange-950',
    borderSubtle: 'border-orange-950/60',
    shadowClass: 'shadow-sm',
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Pro',
    isDark: true,
    bg: 'bg-[#272822]',
    bgSecondary: 'bg-[#1E1F1C]',
    bgTertiary: 'bg-[#3E3D32]',
    cardBg: 'bg-[#1E1F1C]',
    cardBgSubtle: 'bg-[#3E3D32]',
    textPrimary: 'text-[#F8F8F2]',
    textSecondary: 'text-[#A6E22E]',
    textMuted: 'text-[#75715E]',
    accent: 'text-[#FD971F]',
    accentHover: 'hover:bg-[#FD971F]/15',
    accentLight: 'bg-[#FD971F]/20 text-[#FD971F]',
    accentBg: 'bg-[#FD971F]',
    accentText: 'text-[#272822] font-bold',
    correct: 'text-[#A6E22E]',
    incorrect: 'text-[#F92672] underline decoration-[#F92672] decoration-2 bg-[#F92672]/20',
    caret: 'border-[#FD971F] bg-[#FD971F]',
    border: 'border-[#49483E]',
    borderSubtle: 'border-[#3E3D32]',
    shadowClass: 'shadow-sm',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Gothic',
    isDark: true,
    bg: 'bg-[#282A36]',
    bgSecondary: 'bg-[#1E1F29]',
    bgTertiary: 'bg-[#44475A]',
    cardBg: 'bg-[#1E1F29]',
    cardBgSubtle: 'bg-[#44475A]',
    textPrimary: 'text-[#F8F8F2]',
    textSecondary: 'text-[#8BE9FD]',
    textMuted: 'text-[#6272A4]',
    accent: 'text-[#BD93F9]',
    accentHover: 'hover:bg-[#BD93F9]/15',
    accentLight: 'bg-[#BD93F9]/20 text-[#BD93F9]',
    accentBg: 'bg-[#BD93F9]',
    accentText: 'text-[#282A36] font-bold',
    correct: 'text-[#50FA7B]',
    incorrect: 'text-[#FF5555] underline decoration-[#FF5555] decoration-2 bg-[#FF5555]/20',
    caret: 'border-[#FF79C6] bg-[#FF79C6]',
    border: 'border-[#6272A4]/40',
    borderSubtle: 'border-[#6272A4]/25',
    shadowClass: 'shadow-sm',
  },
  high_contrast: {
    id: 'high_contrast',
    name: 'High Contrast Onyx',
    isDark: true,
    bg: 'bg-[#000000]',
    bgSecondary: 'bg-[#0D0D0D]',
    bgTertiary: 'bg-[#1A1A1A]',
    cardBg: 'bg-[#0D0D0D]',
    cardBgSubtle: 'bg-[#1A1A1A]',
    textPrimary: 'text-[#FFFFFF]',
    textSecondary: 'text-[#FFFF00]',
    textMuted: 'text-[#808080]',
    accent: 'text-[#00FF00]',
    accentHover: 'hover:bg-[#00FF00]/20',
    accentLight: 'bg-[#00FF00]/20 text-[#00FF00]',
    accentBg: 'bg-[#00FF00]',
    accentText: 'text-[#000000] font-black',
    correct: 'text-[#00FF00]',
    incorrect: 'text-[#FF0000] underline decoration-[#FF0000] decoration-4 bg-[#FF0000]/30 font-bold',
    caret: 'border-[#FFFF00] bg-[#FFFF00]',
    border: 'border-[#FFFFFF]',
    borderSubtle: 'border-[#FFFFFF]/60',
    shadowClass: 'shadow-none',
  },
  custom: {
    id: 'custom',
    name: 'Custom Palette',
    isDark: true,
    bg: 'bg-[var(--theme-bg)]',
    bgSecondary: 'bg-[var(--theme-bg-secondary)]',
    bgTertiary: 'bg-[var(--theme-bg-tertiary)]',
    cardBg: 'bg-[var(--theme-card-bg)]',
    cardBgSubtle: 'bg-[var(--theme-card-subtle)]',
    textPrimary: 'text-[var(--theme-text-primary)]',
    textSecondary: 'text-[var(--theme-text-secondary)]',
    textMuted: 'text-[var(--theme-text-muted)]',
    accent: 'text-[var(--theme-accent)]',
    accentHover: 'hover:opacity-80',
    accentLight: 'opacity-90',
    accentBg: 'bg-[var(--theme-accent-bg)]',
    accentText: 'text-black font-bold',
    correct: 'text-[var(--theme-correct)]',
    incorrect: 'text-[var(--theme-incorrect)] underline decoration-2 bg-rose-500/15',
    caret: 'border-[var(--theme-caret)] bg-[var(--theme-caret)]',
    border: 'border-[var(--theme-border)]',
    borderSubtle: 'border-[var(--theme-border-subtle)]',
    shadowClass: 'shadow-sm',
  },
};

export const DEFAULT_CUSTOM_THEME = {
  bg: '#12141a',
  bgSecondary: '#191d26',
  cardBg: '#191d26',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#38bdf8',
  accentBg: '#38bdf8',
  caret: '#38bdf8',
  correct: '#38bdf8',
  incorrect: '#ef4444',
  border: '#334155',
};

/**
 * Apply dynamic CSS variables to the document root for custom theming
 */
export function applyThemeCssVariables(theme: ThemeConfig, customColors?: any) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme.id === 'custom' && customColors) {
    root.style.setProperty('--theme-bg', customColors.bg || '#12141a');
    root.style.setProperty('--theme-bg-secondary', customColors.bgSecondary || '#191d26');
    root.style.setProperty('--theme-bg-tertiary', customColors.cardBg || '#1e2430');
    root.style.setProperty('--theme-card-bg', customColors.cardBg || '#191d26');
    root.style.setProperty('--theme-card-subtle', customColors.bgSecondary || '#1e2430');
    root.style.setProperty('--theme-text-primary', customColors.textPrimary || '#f1f5f9');
    root.style.setProperty('--theme-text-secondary', customColors.textSecondary || '#94a3b8');
    root.style.setProperty('--theme-text-muted', '#64748b');
    root.style.setProperty('--theme-accent', customColors.accent || '#38bdf8');
    root.style.setProperty('--theme-accent-bg', customColors.accentBg || customColors.accent || '#38bdf8');
    root.style.setProperty('--theme-correct', customColors.correct || '#38bdf8');
    root.style.setProperty('--theme-incorrect', customColors.incorrect || '#ef4444');
    root.style.setProperty('--theme-caret', customColors.caret || customColors.accent || '#38bdf8');
    root.style.setProperty('--theme-border', customColors.border || '#334155');
    root.style.setProperty('--theme-border-subtle', 'rgba(51, 65, 85, 0.6)');
  } else if (theme.id === 'monokai') {
    root.style.setProperty('--theme-bg', '#272822');
    root.style.setProperty('--theme-card-bg', '#1E1F1C');
    root.style.setProperty('--theme-accent', '#FD971F');
  } else if (theme.id === 'dracula') {
    root.style.setProperty('--theme-bg', '#282A36');
    root.style.setProperty('--theme-card-bg', '#1E1F29');
    root.style.setProperty('--theme-accent', '#BD93F9');
  } else if (theme.id === 'high_contrast') {
    root.style.setProperty('--theme-bg', '#000000');
    root.style.setProperty('--theme-card-bg', '#0D0D0D');
    root.style.setProperty('--theme-accent', '#00FF00');
  }
}


