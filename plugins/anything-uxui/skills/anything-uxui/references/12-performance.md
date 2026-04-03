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

## Framer Motion Hardware Acceleration

### perf-framer-motion-hw — Use full transform string for hardware acceleration

Framer Motion's shorthand properties (`x`, `y`, `scale`) are NOT hardware-accelerated. They use `requestAnimationFrame` on the main thread. For hardware acceleration, use the full `transform` string.

```tsx
// ❌ Not hardware-accelerated (convenient but drops frames under load)
<motion.div animate={{ x: 100 }} />

// ✅ Hardware-accelerated (smooth even when main thread is busy)
<motion.div animate={{ transform: "translateX(100px)" }} />
```

This matters when the browser is simultaneously loading content, executing scripts, or painting.

---

## CSS vs JS Animation

### perf-css-vs-js — CSS for predetermined, JS for dynamic

CSS animations run off the main thread. When the browser is busy loading a new page, Framer Motion animations (using `requestAnimationFrame`) drop frames. CSS animations stay smooth.

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
