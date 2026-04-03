---
title: Design Engineering Philosophy
impact: CRITICAL
tags: philosophy, principles, design-engineering
---

# Design Engineering Philosophy

by junhan of select.codes

---

## philosophy-taste-trained: Taste is trained

Good taste is not personal preference. It is **trained intuition** -- the ability to see beyond the obvious and recognize what elevates quality.

### How to train
- Surround yourself with excellent work
- Think deeply about why something feels good
- Practice relentlessly

**Three-step methodology for developing taste:**
1. **Surround yourself with great work** — Use the best-designed tools daily. Study interfaces you admire. Curate a reference library.
2. **Analyze WHY it's good** — Don't stop at "it feels nice." Break down the specific decisions: why this easing curve, why this shadow depth, why this spacing.
3. **Endure the taste gap** — Your taste will exceed your skill for a long time. The gap between what you recognize as good and what you can produce is painful but essential. Keep producing work through it.

### Application
Don't just make UI "work." Study why the best interfaces feel the way they do. Reverse-engineer animations, inspect interactions, stay curious.

---

## philosophy-invisible-compound: Invisible details compound

Most details go consciously unnoticed by users. **That's the point.** When a feature works exactly as the user assumed it would, they move on without thinking. That is the goal.

The sum of invisible correctness creates interfaces that users **love without knowing why.** Like a thousand barely-audible voices all singing in tune.

### Application
Every design decision is grounded in this principle. Don't evaluate individual details by ROI -- the aggregate makes the difference.

---

## philosophy-beauty-leverage: Beauty is leverage

People choose tools based on the total experience, not features alone. Good defaults and good animations are **real differentiators.** Beauty is underutilized in software.

### Application
Use beauty as leverage for differentiation. Between two feature-equivalent products, the more beautiful one wins.

---

## philosophy-dx-first: Developer experience is paramount

No hooks, no context, no complex setup. Less adoption friction means more people use it.

```tsx
// ❌ Complex setup
const { toast } = useToast();
<ToastProvider>
  <ToastContainer position="top-right" />
</ToastProvider>

// ✅ Minimal friction
<Toaster />  // Insert once
toast('Hello');  // Call from anywhere
```

### Application
Design components to be immediately usable with minimal setup. Minimize Provider, context, and hook dependencies.

---

## philosophy-good-defaults: Good defaults matter more than options

Ship beautifully in the default state. Most users never customize. Default easing, timing, and visual design must be excellent.

```tsx
// ❌ Forces the user to configure everything
<Toast
  duration={5000}
  easing="ease-out"
  position="top-right"
  animation="slide"
/>

// ✅ Beautiful by default
<Toaster />
```

### Application
Perfect the defaults before adding options. Options are for the 10% power users.

---

## philosophy-naming-identity: Naming creates identity

A name is the first impression of a component. When appropriate, prioritize **memorability** over discoverability.

### Application
- Prefer identity-driven names over technical labels (`react-toast-component`)
- The name should reflect the character of the component

---

## philosophy-invisible-edge-cases: Handle edge cases invisibly

Edge case handling that users never consciously notice is what defines quality:

- Pause timers when the tab is hidden
- Fill gaps between stacked elements with pseudo-elements to maintain hover state
- Capture pointer events during drag

```tsx
// ❌ Timer continues when tab is switched
useEffect(() => {
  const timer = setTimeout(dismiss, duration);
  return () => clearTimeout(timer);
}, []);

// ✅ Timer pauses when tab is hidden
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) pauseTimer();
    else resumeTimer();
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);
```

### Application
The more invisible an edge case is to the user, the more thoroughly it should be handled. The user not noticing is exactly right.

---

## philosophy-transition-over-keyframe: Use transitions, not keyframes, for dynamic UI

CSS transitions can be interrupted and reset mid-animation. Keyframes restart from 0. For interactions that can be rapidly triggered, transitions produce smoother results.

```css
/* ✅ Interruptible - suited for dynamic UI */
.toast {
  transition: transform 400ms ease;
}

/* ❌ Not interruptible - avoid for dynamic UI */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### When to apply
- Rapidly re-triggered interactions (toast additions, state toggles) → transition
- One-shot decorative animations that play once → keyframe is acceptable

---

## philosophy-docs-interactive: Build great documentation sites

Let people touch, play with, and understand the product before they commit. Interactive examples with ready-to-use code snippets lower the adoption barrier.

### Application
Documentation is experienced, not read. Include interactive examples for every major feature.

---

## philosophy-cohesion: Cohesion -- motion that matches component character

One reason animations feel satisfying is that the entire experience is **cohesive.** Easing and duration must match the mood of the component. Everything should harmonize.

### Motion guide by character

| Component character | Motion style |
|---|---|
| Playful component | More bouncy |
| Professional dashboard | Crisp and fast |
| Elegant component | Slightly slower, use `ease` (not `ease-out`) |

```css
/* ❌ Character mismatch: bouncy motion on a professional dashboard */
.dashboard-modal {
  animation: bounceIn 600ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

/* ✅ Crisp motion suited for dashboards */
.dashboard-modal {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* ✅ Slow motion suited for elegant components */
.elegant-toast {
  transition: opacity 400ms ease, transform 400ms ease;
}
```

### Application
Match motion to mood. Animation style must align with design, naming, and overall experience.

---

## philosophy-opacity-height: Tuning opacity + height combinations

When items enter or exit a list, opacity changes must align well with the height animation.

### Application
There is no formula -- **adjust until it feels right.** Trial and error is the only method.

---

## philosophy-fresh-eyes-review: Review work the next day

Review animations with fresh eyes. Imperfections missed during development become apparent the next day.

### Application
- Play back in slow motion or frame-by-frame to catch timing issues invisible at normal speed
- Never declare "done" immediately after development
