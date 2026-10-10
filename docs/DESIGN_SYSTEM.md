# Design System: Typing Master

## Philosophy
Typing Master employs a minimalist, distraction-free visual design. The UI stays out of the way to ensure focus remains on the typing area. The default approach is dark-first, utilizing deep contrasting colors to reduce eye strain, highlighted by vibrant warm accents.

## Color Palette (Default "Midnight" Theme)
- **Background**: `#121212` (Deep Charcoal)
- **Surface**: `#1E1E1E` (Slightly lighter for cards/modals)
- **Primary Text**: `#E0E0E0` (Off-white)
- **Subtext/Faded**: `#757575` (Muted gray)
- **Primary Accent**: `#FF9800` (Warm Amber/Orange)
- **Secondary Accent**: `#FFB74D`
- **Correct State**: `#4CAF50` (Green)
- **Error State**: `#F44336` (Red)

## Typography Scale
- **Font Family**: Inter (UI), Fira Code or JetBrains Mono (Typing Area)
- **Display**: 3rem / 48px
- **H1**: 2.5rem / 40px
- **H2**: 2rem / 32px
- **H3**: 1.5rem / 24px
- **Body Large**: 1.25rem / 20px (Typing text default)
- **Body**: 1rem / 16px (Standard UI)
- **Caption**: 0.875rem / 14px

## Spacing System (8px Grid)
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

## Component Styles
- **Buttons**: Flat by default with subtle hover opacity changes. Accent buttons use the primary color as background with dark text. No hard drop shadows.
- **Inputs/Modals**: Rounded corners (`border-radius: 8px`). Subtle borders (`1px solid var(--subtext)`).
- **Cards**: Elevated using slight background lightness changes rather than shadows in dark mode.

## Animation Guidelines
- Keep animations snappy and functional (duration `150ms` - `300ms`).
- **Caret**: Smooth blinking (`opacity 0 -> 1`) or smooth movement (`transform: translateX()`).
- **Page Transitions**: Simple fade-in using Framer Motion.
- **Feedback**: Subtle pop or shake on severe errors, otherwise static.

## Theme Token Structure
Themes apply CSS variables to the root.
```css
:root {
  --bg-color: #121212;
  --text-primary: #E0E0E0;
  --text-sub: #757575;
  --accent: #FF9800;
  --error: #F44336;
  --correct: #4CAF50;
}
```

## Built-in Themes (10+)
1. **Midnight**: (Default) Deep charcoal, orange accent.
2. **Graphite**: Grayscale, crisp white accent.
3. **Paper**: Light mode, off-white background, ink-black text, blue accent.
4. **Forest**: Deep dark greens, mint accent.
5. **Ocean**: Navy blues, cyan/teal accent.
6. **Sunset**: Dark purples, warm pink/orange gradient accents.
7. **Neon**: True black, vibrant magenta and lime green.
8. **Lavender**: Soft dark violet, pastel purple accent.
9. **Monochrome**: Pure black and white.
10. **High Contrast**: Pure black, bright yellow (Accessibility focused).
