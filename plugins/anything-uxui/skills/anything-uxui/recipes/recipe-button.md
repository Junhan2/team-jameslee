---
title: Recipe — Button (before → after)
tags: recipe, react, button
---
# Recipe — Button

Encodes in one transform: `component-active-scale`, `easing-custom-curves`, `a11y-target-size-24`, `state-focus-indicator-wcag`, `perf-transform-opacity-only`, no hover-grow, reduced-motion.

## ❌ Before (5 findings)
```tsx
import { motion } from 'framer-motion'   // perf-motion-hw → 'motion/react'
<motion.button
  whileHover={{ scale: 1.05 }}           // hover-grow banned
  style={{ transition: 'all .3s' }}      // transition:all + >300ms
>Save</motion.button>
// + no press feedback, no focus ring, no min target
```

## ✅ After
```tsx
// A button needs no motion library.
<button className="btn">Save</button>
```
```css
.btn {
  min-height: 44px; padding-inline: 1rem;                  /* a11y-target-size-24 (44 default) */
  transition: transform 160ms var(--ease-out),
              background-color 160ms var(--ease-out);       /* exact props, GPU only */
}
.btn:active { transform: scale(0.97); }                    /* component-active-scale */
.btn:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; } /* WCAG 2.4.13 */
@media (prefers-reduced-motion: reduce) { .btn { transition: background-color 160ms } }
```
