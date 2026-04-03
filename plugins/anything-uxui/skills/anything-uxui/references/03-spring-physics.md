---
title: Spring Animation Physics
impact: HIGH
tags: spring, physics, gesture, framer-motion, interruptible
---

# Spring Animation Physics

Spring animations simulate real physics — no fixed duration, settling based on physical parameters.
By junhan of select.codes.

---

## When to Use Spring

- Drag interactions with momentum
- Elements needing an "alive" feel (e.g., Dynamic Island)
- Gestures that can be interrupted mid-animation
- Decorative mouse-tracking interactions

## When NOT to Use Spring

- System-initiated state changes (use easing curves instead)
- Progress indicators (use linear)
- High-frequency interactions (use no animation)

---

## Spring Parameterization

### spring-apple-style-default — Apple style as primary notation

The Apple-style parameters are easier to reason about. Use as default.

```tsx
// ✅ Primary: Apple style (intuitive)
transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}

// ✅ Advanced: Physics style (fine-grained control)
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

**Default spring preset:**
```tsx
const SPRING_DEFAULT = { type: "spring", duration: 0.4, bounce: 0.15 };
```

### spring-bounce-subtle — Keep bounce subtle (0.1–0.2)

Most UI contexts should minimize bounce. Reserve higher bounce for playful interactions and drag-to-dismiss.

```tsx
// ❌ Too bouncy for UI
transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}

// ✅ Subtle bounce
transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
```

### spring-params-balanced — Balanced stiffness and damping

When using physics style, keep stiffness and damping in balance. Excessive oscillation is distracting.

```tsx
// ❌ Too elastic (stiffness too high relative to damping)
transition={{ type: "spring", stiffness: 1000, damping: 5 }}

// ✅ Balanced parameters
transition={{ type: "spring", stiffness: 500, damping: 30 }}
```

---

## Spring for Mouse Interactions

### spring-mouse-tracking — Use spring interpolation for mouse-linked visuals

Linking visual changes directly to mouse position feels artificial — no motion quality. Use `useSpring` to interpolate values with spring-like behavior.

```jsx
import { useSpring } from 'framer-motion';

// ❌ Without spring: artificial, instant
const rotation = mouseX * 0.1;

// ✅ With spring: natural momentum
const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

This works because the animation is **decorative** — it has no functional role. For functional elements (banking app graphs), skip animation entirely.

---

## Interruptibility

### spring-interruptible — Spring preserves velocity on interrupt

Spring animations maintain velocity when interrupted — CSS keyframes restart from zero.

This makes spring ideal for gestures where users can change direction mid-animation. Expanding an item and quickly pressing Escape produces a smooth reversal with spring, but a jarring restart with keyframes.

```tsx
// ❌ Keyframe: restarts from zero on interrupt
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

// ✅ Spring: smooth reversal from current position
<motion.div
  animate={{ x: isOpen ? 200 : 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>
```

### spring-velocity-preservation — Pass drag velocity to spring

When a drag gesture ends, pass the release velocity to the spring animation so momentum carries through naturally.

```tsx
// ❌ Velocity ignored
onDragEnd={(e, info) => {
  animate(target, { x: 0 }, { duration: 0.3 });
}}

// ✅ Velocity preserved
onDragEnd={(e, info) => {
  animate(target, { x: 0 }, {
    type: "spring",
    velocity: info.velocity.x,
  });
}}
```

---

## Spring Quick Reference

| Context | duration | bounce | Equivalent stiffness/damping |
|---------|----------|--------|------------------------------|
| Default UI | 0.4 | 0.15 | ~400 / 25 |
| Drag release | 0.3 | 0.1 | ~500 / 30 |
| Playful/bouncy | 0.5 | 0.25 | ~300 / 15 |
| Snappy/no overshoot | 0.25 | 0 | ~600 / 40 |
