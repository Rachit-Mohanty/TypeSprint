import { FingerInfo, KeyboardLayout } from '../types';

export interface LayoutConfig {
  id: KeyboardLayout;
  name: string;
  description: string;
  homeKeys: [string, string]; // [leftHandHomeKey, rightHandHomeKey]
  rows: string[][];
  fingerMapping: Record<string, FingerInfo>;
  codeToChar: Record<string, string>; // Unshifted map from e.code
  shiftCodeToChar: Record<string, string>; // Shifted map from e.code
}

// -------------------------------------------------------------
// 1. QWERTY LAYOUT
// -------------------------------------------------------------
const QWERTY_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl'],
];

const QWERTY_FINGER_MAPPING: Record<string, FingerInfo> = {
  // Left Pinky
  '`': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '~': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '1': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '!': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'a': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'A': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },

  // Left Ring
  '2': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  '@': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'w': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'W': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  's': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'S': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'x': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'X': { name: 'Left Ring', hand: 'left', color: '#f97316' },

  // Left Middle
  '3': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '#': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'e': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'E': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'd': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'D': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'c': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'C': { name: 'Left Middle', hand: 'left', color: '#eab308' },

  // Left Index
  '4': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '$': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '5': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '%': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'r': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'R': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  't': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'T': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'f': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'F': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'g': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'G': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'v': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'V': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'b': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'B': { name: 'Left Index', hand: 'left', color: '#22c55e' },

  // Right Index
  '6': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '^': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '7': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '&': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'y': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'Y': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'u': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'U': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'h': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'H': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'j': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'J': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'n': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'N': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'm': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'M': { name: 'Right Index', hand: 'right', color: '#22c55e' },

  // Right Middle
  '8': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  '*': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'i': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'I': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'k': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'K': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  ',': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  '<': { name: 'Right Middle', hand: 'right', color: '#eab308' },

  // Right Ring
  '9': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '(': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'o': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'O': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'l': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'L': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '.': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '>': { name: 'Right Ring', hand: 'right', color: '#f97316' },

  // Right Pinky
  '0': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ')': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '-': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '_': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '=': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '+': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'p': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'P': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '[': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '{': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ']': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '}': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '\\': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '|': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ';': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ':': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  "'": { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '"': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '/': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '?': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },

  // Space
  ' ': { name: 'Thumb', hand: 'left', color: '#a855f7' },
};

const QWERTY_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=',
  KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't', KeyY: 'y', KeyU: 'u', KeyI: 'i', KeyO: 'o', KeyP: 'p', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyH: 'h', KeyJ: 'j', KeyK: 'k', KeyL: 'l', Semicolon: ';', Quote: "'",
  KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b', KeyN: 'n', KeyM: 'm', Comma: ',', Period: '.', Slash: '/',
  Space: ' ',
};

const QWERTY_SHIFT_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '~', Digit1: '!', Digit2: '@', Digit3: '#', Digit4: '$', Digit5: '%',
  Digit6: '^', Digit7: '&', Digit8: '*', Digit9: '(', Digit0: ')', Minus: '_', Equal: '+',
  KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I', KeyO: 'O', KeyP: 'P', BracketLeft: '{', BracketRight: '}', Backslash: '|',
  KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyJ: 'J', KeyK: 'K', KeyL: 'L', Semicolon: ':', Quote: '"',
  KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'N', KeyM: 'M', Comma: '<', Period: '>', Slash: '?',
  Space: ' ',
};

// -------------------------------------------------------------
// 2. DVORAK LAYOUT
// -------------------------------------------------------------
const DVORAK_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', 'Backspace'],
  ['Tab', "'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
  ['Caps', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-', 'Enter'],
  ['Shift', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl'],
];

const DVORAK_FINGER_MAPPING: Record<string, FingerInfo> = {
  // Left Pinky
  '`': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '~': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '1': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '!': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  "'": { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '"': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'a': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'A': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  ';': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  ':': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },

  // Left Ring
  '2': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  '@': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  ',': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  '<': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'o': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'O': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'q': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'Q': { name: 'Left Ring', hand: 'left', color: '#f97316' },

  // Left Middle
  '3': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '#': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '.': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '>': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'e': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'E': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'j': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'J': { name: 'Left Middle', hand: 'left', color: '#eab308' },

  // Left Index
  '4': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '$': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '5': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '%': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'p': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'P': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'y': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'Y': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'u': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'U': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'i': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'I': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'k': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'K': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'x': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'X': { name: 'Left Index', hand: 'left', color: '#22c55e' },

  // Right Index
  '6': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '^': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '7': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '&': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'f': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'F': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'g': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'G': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'd': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'D': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'h': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'H': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'b': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'B': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'm': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'M': { name: 'Right Index', hand: 'right', color: '#22c55e' },

  // Right Middle
  '8': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  '*': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'c': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'C': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  't': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'T': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'w': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'W': { name: 'Right Middle', hand: 'right', color: '#eab308' },

  // Right Ring
  '9': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '(': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'r': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'R': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'n': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'N': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'v': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'V': { name: 'Right Ring', hand: 'right', color: '#f97316' },

  // Right Pinky
  '0': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ')': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '[': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '{': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ']': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '}': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'l': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'L': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '/': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '?': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '=': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '+': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '\\': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '|': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  's': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'S': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '-': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '_': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'z': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'Z': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },

  // Space
  ' ': { name: 'Thumb', hand: 'left', color: '#a855f7' },
};

const DVORAK_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '[', Equal: ']',
  KeyQ: "'", KeyW: ',', KeyE: '.', KeyR: 'p', KeyT: 'y', KeyY: 'f', KeyU: 'g', KeyI: 'c', KeyO: 'r', KeyP: 'l', BracketLeft: '/', BracketRight: '=', Backslash: '\\',
  KeyA: 'a', KeyS: 'o', KeyD: 'e', KeyF: 'u', KeyG: 'i', KeyH: 'd', KeyJ: 'h', KeyK: 't', KeyL: 'n', Semicolon: 's', Quote: '-',
  KeyZ: ';', KeyX: 'q', KeyC: 'j', KeyV: 'k', KeyB: 'x', KeyN: 'b', KeyM: 'm', Comma: 'w', Period: 'v', Slash: 'z',
  Space: ' ',
};

const DVORAK_SHIFT_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '~', Digit1: '!', Digit2: '@', Digit3: '#', Digit4: '$', Digit5: '%',
  Digit6: '^', Digit7: '&', Digit8: '*', Digit9: '(', Digit0: ')', Minus: '{', Equal: '}',
  KeyQ: '"', KeyW: '<', KeyE: '>', KeyR: 'P', KeyT: 'Y', KeyY: 'F', KeyU: 'G', KeyI: 'C', KeyO: 'R', KeyP: 'L', BracketLeft: '?', BracketRight: '+', Backslash: '|',
  KeyA: 'A', KeyS: 'O', KeyD: 'E', KeyF: 'U', KeyG: 'I', KeyH: 'D', KeyJ: 'H', KeyK: 'T', KeyL: 'N', Semicolon: 'S', Quote: '_',
  KeyZ: ':', KeyX: 'Q', KeyC: 'J', KeyV: 'K', KeyB: 'X', KeyN: 'B', KeyM: 'M', Comma: 'W', Period: 'V', Slash: 'Z',
  Space: ' ',
};

// -------------------------------------------------------------
// 3. COLEMAK LAYOUT
// -------------------------------------------------------------
const COLEMAK_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';', '[', ']', '\\'],
  ['Caps', 'a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl'],
];

const COLEMAK_FINGER_MAPPING: Record<string, FingerInfo> = {
  // Left Pinky
  '`': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '~': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '1': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  '!': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Q': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'a': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'A': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },
  'Z': { name: 'Left Pinky', hand: 'left', color: '#ef4444' },

  // Left Ring
  '2': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  '@': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'w': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'W': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'r': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'R': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'x': { name: 'Left Ring', hand: 'left', color: '#f97316' },
  'X': { name: 'Left Ring', hand: 'left', color: '#f97316' },

  // Left Middle
  '3': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  '#': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'f': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'F': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  's': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'S': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'c': { name: 'Left Middle', hand: 'left', color: '#eab308' },
  'C': { name: 'Left Middle', hand: 'left', color: '#eab308' },

  // Left Index
  '4': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '$': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '5': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  '%': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'p': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'P': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'g': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'G': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  't': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'T': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'd': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'D': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'v': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'V': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'b': { name: 'Left Index', hand: 'left', color: '#22c55e' },
  'B': { name: 'Left Index', hand: 'left', color: '#22c55e' },

  // Right Index
  '6': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '^': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '7': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  '&': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'j': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'J': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'l': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'L': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'h': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'H': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'n': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'N': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'k': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'K': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'm': { name: 'Right Index', hand: 'right', color: '#22c55e' },
  'M': { name: 'Right Index', hand: 'right', color: '#22c55e' },

  // Right Middle
  '8': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  '*': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'u': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'U': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'e': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  'E': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  ',': { name: 'Right Middle', hand: 'right', color: '#eab308' },
  '<': { name: 'Right Middle', hand: 'right', color: '#eab308' },

  // Right Ring
  '9': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '(': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'y': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'Y': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'i': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  'I': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '.': { name: 'Right Ring', hand: 'right', color: '#f97316' },
  '>': { name: 'Right Ring', hand: 'right', color: '#f97316' },

  // Right Pinky
  '0': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ')': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '-': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '_': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '=': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '+': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ';': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ':': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '[': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '{': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  ']': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '}': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '\\': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '|': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'o': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  'O': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  "'": { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '"': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '/': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },
  '?': { name: 'Right Pinky', hand: 'right', color: '#ef4444' },

  // Space
  ' ': { name: 'Thumb', hand: 'left', color: '#a855f7' },
};

const COLEMAK_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=',
  KeyQ: 'q', KeyW: 'w', KeyE: 'f', KeyR: 'p', KeyT: 'g', KeyY: 'j', KeyU: 'l', KeyI: 'u', KeyO: 'y', KeyP: ';', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  KeyA: 'a', KeyS: 'r', KeyD: 's', KeyF: 't', KeyG: 'd', KeyH: 'h', KeyJ: 'n', KeyK: 'e', KeyL: 'i', Semicolon: 'o', Quote: "'",
  KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b', KeyN: 'k', KeyM: 'm', Comma: ',', Period: '.', Slash: '/',
  Space: ' ',
};

const COLEMAK_SHIFT_CODE_TO_CHAR: Record<string, string> = {
  Backquote: '~', Digit1: '!', Digit2: '@', Digit3: '#', Digit4: '$', Digit5: '%',
  Digit6: '^', Digit7: '&', Digit8: '*', Digit9: '(', Digit0: ')', Minus: '_', Equal: '+',
  KeyQ: 'Q', KeyW: 'W', KeyE: 'F', KeyR: 'P', KeyT: 'G', KeyY: 'J', KeyU: 'L', KeyI: 'U', KeyO: 'Y', KeyP: ':', BracketLeft: '{', BracketRight: '}', Backslash: '|',
  KeyA: 'A', KeyS: 'R', KeyD: 'S', KeyF: 'T', KeyG: 'D', KeyH: 'H', KeyJ: 'N', KeyK: 'E', KeyL: 'I', Semicolon: 'O', Quote: '"',
  KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'K', KeyM: 'M', Comma: '<', Period: '>', Slash: '?',
  Space: ' ',
};

export const KEYBOARD_LAYOUTS: Record<KeyboardLayout, LayoutConfig> = {
  qwerty: {
    id: 'qwerty',
    name: 'QWERTY',
    description: 'Standard Latin-script layout designed in 1873, universally ubiquitous.',
    homeKeys: ['f', 'j'],
    rows: QWERTY_ROWS,
    fingerMapping: QWERTY_FINGER_MAPPING,
    codeToChar: QWERTY_CODE_TO_CHAR,
    shiftCodeToChar: QWERTY_SHIFT_CODE_TO_CHAR,
  },
  dvorak: {
    id: 'dvorak',
    name: 'Dvorak',
    description: 'Ergonomic layout placing all vowels on the left home row and common consonants on the right.',
    homeKeys: ['u', 'h'],
    rows: DVORAK_ROWS,
    fingerMapping: DVORAK_FINGER_MAPPING,
    codeToChar: DVORAK_CODE_TO_CHAR,
    shiftCodeToChar: DVORAK_SHIFT_CODE_TO_CHAR,
  },
  colemak: {
    id: 'colemak',
    name: 'Colemak',
    description: 'Modern ergonomic layout maintaining QWERTY shortcut keys while optimizing home-row cadence.',
    homeKeys: ['t', 'n'],
    rows: COLEMAK_ROWS,
    fingerMapping: COLEMAK_FINGER_MAPPING,
    codeToChar: COLEMAK_CODE_TO_CHAR,
    shiftCodeToChar: COLEMAK_SHIFT_CODE_TO_CHAR,
  },
};

/**
 * Maps a physical keyboard event (e.code + Shift state) to the intended layout character.
 * Falls back to e.key if e.code is unmapped or for standard single characters.
 */
export function mapPhysicalKeyToLayout(
  e: { key: string; code: string; shiftKey: boolean; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean },
  layoutId: KeyboardLayout = 'qwerty'
): string | null {
  // Ignore control/alt/meta commands
  if (e.ctrlKey || e.altKey || e.metaKey) return null;

  const layout = KEYBOARD_LAYOUTS[layoutId] || KEYBOARD_LAYOUTS.qwerty;

  // Space
  if (e.key === ' ' || e.code === 'Space') return ' ';

  // If layout is QWERTY and key is standard character, prefer e.key
  if (layoutId === 'qwerty') {
    if (e.key.length === 1) return e.key;
    return layout.codeToChar[e.code] || null;
  }

  // Layout is Dvorak or Colemak (software emulation for physical QWERTY keys):
  if (e.shiftKey) {
    if (layout.shiftCodeToChar[e.code]) {
      return layout.shiftCodeToChar[e.code];
    }
  } else {
    if (layout.codeToChar[e.code]) {
      return layout.codeToChar[e.code];
    }
  }

  // Fallback if code isn't standard physical key (e.g. on-screen touch/virtual inputs)
  if (e.key.length === 1) {
    return e.key;
  }

  return null;
}
