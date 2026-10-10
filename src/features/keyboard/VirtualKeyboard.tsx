import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  activeChar?: string;
  isCorrect?: boolean | null;
  className?: string;
}

interface KeyConfig {
  key: string;
  display?: string;
  width?: string;
  finger?: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  [
    { key: '`', display: '~' },
    { key: '1', display: '1' },
    { key: '2', display: '2' },
    { key: '3', display: '3' },
    { key: '4', display: '4' },
    { key: '5', display: '5' },
    { key: '6', display: '6' },
    { key: '7', display: '7' },
    { key: '8', display: '8' },
    { key: '9', display: '9' },
    { key: '0', display: '0' },
    { key: '-', display: '-' },
    { key: '=', display: '=' },
    { key: 'Backspace', display: 'Bksp', width: 'w-14 sm:w-16' },
  ],
  [
    { key: 'Tab', display: 'Tab', width: 'w-12 sm:w-14' },
    { key: 'q', finger: 'left-pinky' },
    { key: 'w', finger: 'left-ring' },
    { key: 'e', finger: 'left-middle' },
    { key: 'r', finger: 'left-index' },
    { key: 't', finger: 'left-index' },
    { key: 'y', finger: 'right-index' },
    { key: 'u', finger: 'right-index' },
    { key: 'i', finger: 'right-middle' },
    { key: 'o', finger: 'right-ring' },
    { key: 'p', finger: 'right-pinky' },
    { key: '[', display: '[' },
    { key: ']', display: ']' },
    { key: '\\', display: '\\' },
  ],
  [
    { key: 'CapsLock', display: 'Caps', width: 'w-14 sm:w-16' },
    { key: 'a', finger: 'left-pinky' },
    { key: 's', finger: 'left-ring' },
    { key: 'd', finger: 'left-middle' },
    { key: 'f', finger: 'left-index' },
    { key: 'g', finger: 'left-index' },
    { key: 'h', finger: 'right-index' },
    { key: 'j', finger: 'right-index' },
    { key: 'k', finger: 'right-middle' },
    { key: 'l', finger: 'right-ring' },
    { key: ';', display: ';' },
    { key: "'", display: "'" },
    { key: 'Enter', display: 'Enter', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'ShiftLeft', display: 'Shift', width: 'w-16 sm:w-20' },
    { key: 'z', finger: 'left-pinky' },
    { key: 'x', finger: 'left-ring' },
    { key: 'c', finger: 'left-middle' },
    { key: 'v', finger: 'left-index' },
    { key: 'b', finger: 'left-index' },
    { key: 'n', finger: 'right-index' },
    { key: 'm', finger: 'right-index' },
    { key: ',', display: ',' },
    { key: '.', display: '.' },
    { key: '/', display: '/' },
    { key: 'ShiftRight', display: 'Shift', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'ControlLeft', display: 'Ctrl', width: 'w-12 sm:w-14' },
    { key: 'AltLeft', display: 'Alt', width: 'w-12 sm:w-14' },
    { key: ' ', display: 'Space', width: 'flex-1 max-w-sm', finger: 'thumb' },
    { key: 'AltRight', display: 'Alt', width: 'w-12 sm:w-14' },
    { key: 'ControlRight', display: 'Ctrl', width: 'w-12 sm:w-14' },
  ],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar = '',
  isCorrect = null,
  className = '',
}) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key.toLowerCase());
    };
    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const normalizedTarget = activeChar.toLowerCase();

  return (
    <div className={cn("bg-bg-secondary border border-border rounded-xl p-3 sm:p-5 select-none shadow-md max-w-4xl mx-auto", className)}>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((k) => {
              const isTarget = normalizedTarget === k.key || (k.key === ' ' && activeChar === ' ');
              const isPressed = pressedKey === k.key.toLowerCase() || (k.key === ' ' && pressedKey === ' ');

              return (
                <div
                  key={k.key}
                  className={cn(
                    "h-9 sm:h-11 flex items-center justify-center rounded-md font-mono text-xs sm:text-sm font-medium border transition-all duration-150",
                    k.width || "w-7 sm:w-9",
                    isTarget
                      ? "bg-accent/20 border-accent text-accent shadow-sm scale-105 font-bold"
                      : "bg-bg-card border-border/80 text-text-secondary hover:border-border-hover",
                    isPressed && "bg-accent/40 border-accent scale-95",
                    isTarget && isCorrect === false && "bg-error/20 border-error text-error",
                    isTarget && isCorrect === true && "bg-success/20 border-success text-success"
                  )}
                >
                  {k.display || k.key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
