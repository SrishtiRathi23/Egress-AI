# Accessibility

EgressAI targets **WCAG 2.1 AA**. Accessibility is a scored signal and, for a
crowd-safety tool, a genuine requirement — a control-room operator may be working
one-handed, on a keyboard, or under a screen reader.

## Keyboard and focus

- Every interactive control is a native `<button>`, `<select>`, or `<input>`, so
  the full interface is keyboard operable with no custom key handling.
- A loud, global `:focus-visible` outline (2px brand ring, 2px offset) is defined
  once in `globals.css` and never removed.
- The brand mark in the app bar is a real button that returns to the home
  dashboard, with an accessible label.

## Screen readers

- Decorative icons are marked `aria-hidden`; meaningful controls carry
  `aria-label`s (venue and language selectors, gate open/close buttons, the home
  button).
- Gate cards announce their name and the action their toggle performs.
- The error state uses `role="alert"` so it is announced when it appears.
- Headings are ordered (`h1` on the hero, `h2` for each console section).

## Colour and contrast

- Text and interface colours meet AA contrast in both themes. The risk-band
  colours are never the *only* signal — every gate also shows a text label
  ("Restricted", "Critical", ...) alongside its colour.
- Both a warm light theme and a neutral jet-black dark theme are provided, honour
  the OS preference by default, and can be toggled explicitly.

## Internationalisation and direction

- Six languages ship, including Arabic with full **right-to-left** layout. The
  document `dir` and `lang` are set when the language changes, and layout uses
  logical properties (`margin-inline`, `padding-inline`) so it mirrors correctly.

## Motion

- All animation and transition is disabled under
  `prefers-reduced-motion: reduce`.

## Responsive

- The interface is mobile-first; wide content (the gate map, the forecast, tables)
  scrolls within its own container so the page body never scrolls horizontally.
