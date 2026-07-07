---
title: Animation Performance
impact: HIGH
tags: performance, gpu, transform, css-variables, waapi, hardware-acceleration
---

# Animation Performance

Rules for keeping animations smooth at 60fps.
By junhan of select.codes.

---

## GPU-Accelerated Properties

### perf-transform-opacity-only — Only animate transform and opacity

These properties skip layout and paint, running entirely on the GPU. Animating `padding`, `margin`, `height`, or `width` triggers all three rendering stages.

```css
/* ❌ Triggers layout + paint + composite */
.element { transition: height 200ms ease; }

/* ✅ GPU-only composite */
.element { transition: transform 200ms var(--ease-out); }
```

### perf-css-variable-inheritance — CSS variables trigger child recalculation

Changing a CSS variable on a parent recalculates styles for ALL children. In a drawer with many items, updating `--swipe-amount` on the container causes expensive recalculation. Update `transform` directly on the element instead.

```js
// ❌ Recalculation storm on all children
element.style.setProperty('--swipe-amount', `${distance}px`);

// ✅ Affects only this element
element.style.transform = `translateY(${distance}px)`;
```

### perf-shadow-pseudo — Animate shadows via pseudo-element opacity

Directly transitioning `box-shadow` triggers expensive repaints. Instead, create a pseudo-element with the target shadow and animate its `opacity`.

```css
/* ❌ Repaint on every frame */
.card {
  box-shadow: var(--shadow-1);
  transition: box-shadow 0.2s ease;
}
.card:hover { box-shadow: var(--shadow-3); }

/* ✅ Opacity only — composite layer */
.card { position: relative; box-shadow: var(--shadow-1); }
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--shadow-3);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: -1;
}
.card:hover::after { opacity: 1; }
```

---

## Motion (Framer Motion) Hardware Acceleration

> The library formerly called **Framer Motion** is now **Motion** — `import { motion } from "motion/react"` (v12, no breaking React changes). Rule-id `perf-motion-hw` supersedes `perf-framer-motion-hw` (alias).

### perf-motion-hw — Prefer full transform string for hardware acceleration

Motion's shorthand transforms (`x`, `y`, `scale`) animate CSS variables that are **not** compositor-accelerated (verified against motion.dev/docs/performance, 2026) — they run on the main thread and can drop frames under load. For guaranteed hardware acceleration, animate the full `transform` string.

```tsx
// ⚠️ Convenient, but not compositor-accelerated (can drop frames under load)
<motion.div animate={{ x: 100 }} />

// ✅ Compositor-accelerated (smooth even when the main thread is busy)
<motion.div animate={{ transform: "translateX(100px)" }} />
```

Treat this as **progressive enhancement, not an absolute**: the shorthand path is fine for most cases and is *required* when composing with `layout`/drag (which need Motion's transform composition). Reach for the full-transform form only on animations that must stay smooth while the page is busy loading/scripting/painting. (See also `perf-motion-values-no-rerender`.)

### perf-motion-values-no-rerender — Never drive per-frame values through React state

The #1 Motion-in-React performance mistake: updating `useState` on every `pointermove`/`scroll` and feeding it to `animate`/`style` — this re-renders the whole component every frame.

```tsx
// ❌ setState per frame → full React re-render each frame
const [x, setX] = useState(0);
// onPointerMove={(e) => setX(e.clientX)} ... <motion.div style={{ x }} />

// ✅ MotionValue updates OUTSIDE React's render cycle — zero re-renders
const x = useMotionValue(0);
const springX = useSpring(x, { stiffness: 300, damping: 30 });
// onPointerMove={(e) => x.set(e.clientX)} ... <motion.div style={{ x: springX }} />
```

`useMotionValue`/`useTransform`/`useSpring` animate values off the React render cycle. **React Compiler does NOT fix this** — memoization cannot remove a setState-per-frame render loop.

**When to apply**: Any value driven by pointer, scroll, or rapid events (drag position, parallax, cursor-follow, live progress).

### perf-motion-bundle — Load only the Motion features you use

The full `motion` component is ~34kb. Use `LazyMotion` + the `m` component to ship ~4.6kb initial, loading feature packs on demand.

```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
// domAnimation +15kb · domMax (drag/layout) +25kb · `strict` throws on a stray `motion`
<LazyMotion features={domAnimation} strict>
  <m.div animate={{ opacity: 1 }} />   {/* use `m`, not `motion` */}
</LazyMotion>
```

For non-React micro-interactions, vanilla `animate()` from `motion/mini` (WAAPI-only) is ~2.6kb. A full `motion` import in a leaf that only fades is a finding.

### perf-motion-compiler-note — React Compiler 1.0 and animation code

React Compiler (stable since Oct 2025) auto-memoizes. Implications:
- Don't hand-write `useMemo`/`useCallback` for variants/transition objects in a compiled project — it's noise (flag it in review).
- Memoization does NOT eliminate per-frame `setState` re-renders — MotionValues stay mandatory (`perf-motion-values-no-rerender`).
- The compiler silently bails on Rules-of-React violations — mutating refs during render (a classic imperative-animation hack) de-opts the whole component. Keep imperative animation in effects, event handlers, or motion values.

---

## CSS vs JS Animation

### perf-css-vs-js — CSS for predetermined, JS for dynamic

CSS animations run off the main thread. When the browser is busy loading a new page, Motion's JS-driven animations (using `requestAnimationFrame`) drop frames. CSS animations stay smooth.

| Use CSS when | Use JS when |
|-------------|-------------|
| Animation is predetermined | Animation is dynamic/data-driven |
| No interruption needed | User can interrupt mid-animation |
| Simple transitions | Complex orchestration |
| Page load animations | Gesture-following animations |

### perf-waapi — Web Animations API: JS control + CSS performance

WAAPI provides JavaScript control with hardware acceleration. No library needed.

```js
element.animate(
  [
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0 0)' }
  ],
  {
    duration: 1000,
    fill: 'forwards',
    easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
  }
);
```

Advantages: hardware-accelerated, interruptible, zero bundle size.

---

## Blur Performance

### perf-blur-limit — Keep blur under 20px

Heavy blur is expensive, especially on Safari. When using blur for masking transitions, keep values at 20px or below.

```css
/* ❌ Expensive blur */
.transitioning { filter: blur(30px); }

/* ✅ Reasonable blur */
.transitioning { filter: blur(2px); }
```

---

## Container Animation Performance

### perf-resize-observer — Use ResizeObserver, not getBoundingClientRect

`getBoundingClientRect` causes layout thrashing when called repeatedly. ResizeObserver detects size changes without forced layout.

```tsx
// ❌ Layout thrashing
useEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setBounds({ width: rect.width, height: rect.height });
});

// ✅ No layout thrashing
useEffect(() => {
  const observer = new ResizeObserver(([entry]) => {
    setBounds({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });
  observer.observe(element);
  return () => observer.disconnect();
}, [element]);
```

### perf-overflow-hidden — Clip container during animated resize

Apply `overflow: hidden` on the animated container to prevent content flash during size transitions.

```tsx
<motion.div
  animate={{ height: bounds.height }}
  style={{ overflow: "hidden" }}
>
  <div ref={ref}>{children}</div>
</motion.div>
```

---

## Interaction Responsiveness (INP)

### perf-inp-under-200ms — Keep interactions under the INP budget

**INP (Interaction to Next Paint)** replaced FID as a Core Web Vital in March 2024 — it measures the *worst* interaction latency across the whole page (input delay + processing + presentation) at p75. Good = **< 200ms**; ~43% of sites fail it (2026). Animation is part of INP: the presentation delay after a click includes your transition's first paint.

- **Break long tasks** (> 50ms): chunk heavy handlers; `await scheduler.yield()` to return the main thread between steps.
- **Defer non-urgent work**: `startTransition` / `useDeferredValue` (React) so the interaction paints before the expensive re-render.
- **Prefer CSS/compositor animation** over main-thread JS for interaction feedback — it doesn't compete with the handler for the main thread.
- **Isolate third-party JS** (analytics, chat, ads) — the #1 cause of poor INP.

```js
async function onClick() {
  updateUIImmediately();     // paint the response first
  await scheduler.yield();   // yield to the browser
  await doExpensiveWork();   // then the heavy part
}
```

**When to apply**: Every click/tap/keypress handler that does non-trivial work.
