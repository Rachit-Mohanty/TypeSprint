import React, { useState } from 'react';
import { X, FileText, Play } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ThemeConfig } from '../utils/themes';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string) => void;
  theme: ThemeConfig;
}

const SAMPLE_PRESETS = [
  {
    title: 'Pangrams & Speed',
    text: 'A quick movement of the enemy will jeopardize six gunboats. Pack my box with five dozen liquor jugs. The five boxing wizards jump quickly.',
  },
  {
    title: 'Software & Technology',
    text: 'Artificial intelligence and neural networks are transforming how software engineers architect modern resilient systems. Continuous iteration and deep algorithmic reasoning form the bedrock of computation.',
  },
  {
    title: 'Cosmos & Astronomy',
    text: 'The observable universe contains billions of galaxies, each hosting hundreds of billions of stars, exoplanets, gravitational waves, and mysterious dark energy expanding the cosmos.',
  },
];

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  theme,
}) => {
  const [text, setText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize user-provided custom text against XSS using DOMPurify
    const cleanedText = DOMPurify.sanitize(text.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    if (cleanedText.length > 0) {
      onApplyText(cleanedText);
      onClose();
    }
  };

  return (
    <div
      id="custom-text-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} shadow-xl flex flex-col gap-4 font-sans animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${theme.accentBg} ${theme.accentText} flex items-center justify-center`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${theme.textPrimary}`}>Custom Text</h3>
              <p className={`text-xs ${theme.textMuted}`}>Paste text or choose a benchmark preset</p>
            </div>
          </div>
          <button
            id="close-custom-modal-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.cardBgSubtle} transition-all`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(p.text)}
              className={`px-3 py-1.5 rounded-lg border ${theme.borderSubtle} ${theme.cardBgSubtle} ${theme.textPrimary} text-xs font-medium hover:${theme.accentBg} hover:${theme.accentText} transition-all`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            id="custom-text-input"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste custom text here..."
            className={`w-full p-3.5 rounded-xl ${theme.cardBgSubtle} border ${theme.borderSubtle} ${theme.textPrimary} text-xs font-mono focus:outline-none focus:border-zinc-400 resize-none transition-colors`}
            autoFocus
          />

          <div className={`flex items-center justify-between text-xs ${theme.textPrimary} font-mono`}>
            <span className={`text-[11px] ${theme.textMuted}`}>
              {text.trim() ? text.trim().split(/\s+/).length : 0} words
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-medium ${theme.textSecondary} hover:${theme.textPrimary}`}
              >
                Cancel
              </button>
              <button
                id="apply-custom-text-btn"
                type="submit"
                disabled={!text.trim()}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl ${theme.accentBg} ${theme.accentText} font-medium text-xs shadow-xs disabled:opacity-40 hover:opacity-90 transition-all`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start with Custom Text</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
