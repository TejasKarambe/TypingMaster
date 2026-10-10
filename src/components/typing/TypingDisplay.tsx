import { memo, useRef, useEffect } from 'react';
import type { CharInfo } from '@/types';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/store/hooks';

interface TypingDisplayProps {
  chars: CharInfo[];
  currentIndex: number;
  isFocused: boolean;
  onFocus?: () => void;
}

const CharacterSpan = memo(function CharacterSpan({
  char,
  state,
  isCursor,
  caretStyle,
}: {
  char: string;
  state: string;
  isCursor: boolean;
  caretStyle: string;
}) {
  return (
    <span
      className={cn(
        'typing-char relative',
        state === 'correct' && 'typing-char-correct',
        state === 'incorrect' && 'typing-char-incorrect',
        state === 'corrected' && 'text-warning',
        (state === 'untyped' || state === 'cursor') && 'typing-char-untyped',
        isCursor && caretStyle === 'line' && 'border-l-2 border-cursor',
        isCursor && caretStyle === 'block' && 'bg-cursor/30 text-text-primary',
        isCursor && caretStyle === 'underline' && 'border-b-2 border-cursor',
        isCursor && caretStyle === 'outline' && 'ring-1 ring-cursor rounded-sm',
      )}
      data-state={state}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
});

export const TypingDisplay = memo(function TypingDisplay({
  chars,
  currentIndex,
  isFocused,
  onFocus,
}: TypingDisplayProps) {
  const settings = useAppSelector((s) => s.settings.settings);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to keep cursor visible
  useEffect(() => {
    if (containerRef.current) {
      const cursorEl = containerRef.current.querySelector('[data-cursor="true"]');
      if (cursorEl) {
        cursorEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  const fontSize = settings.appearance.fontSize;
  const fontFamily = settings.appearance.fontFamily === 'mono'
    ? 'var(--font-mono)'
    : settings.appearance.fontFamily === 'serif'
    ? 'Georgia, serif'
    : 'var(--font-sans)';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-xl p-6 lg:p-8 min-h-[180px] max-h-[300px] overflow-hidden select-none transition-all duration-300',
        isFocused ? 'bg-bg-secondary border border-border' : 'bg-bg-secondary/50 border border-border/50'
      )}
      onClick={onFocus}
      style={{
        fontSize: `${fontSize}px`,
        fontFamily,
        lineHeight: `${settings.appearance.lineHeight}em`,
        letterSpacing: `${settings.appearance.letterSpacing}px`,
      }}
    >
      {!isFocused && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary/80 backdrop-blur-sm z-10 rounded-xl">
          <p className="text-text-secondary text-lg font-medium">Click here or press any key to focus</p>
        </div>
      )}
      <div className="leading-relaxed break-all">
        {chars.map((charInfo, idx) => (
          <span
            key={idx}
            ref={idx === currentIndex ? cursorRef : undefined}
            data-cursor={idx === currentIndex ? 'true' : undefined}
          >
            <CharacterSpan
              char={charInfo.char}
              state={charInfo.state}
              isCursor={idx === currentIndex}
              caretStyle={settings.typing.caretStyle}
            />
          </span>
        ))}
      </div>
    </div>
  );
});
