---
title: Animation Timing & Easing Standards
impact: CRITICAL
tags: animation, timing, easing, duration, cubic-bezier
---

# Animation Timing & Easing Standards

Unified timing and easing standards for UI animations.
By junhan of select.codes.

---

## Decision Framework

Before writing animation code, answer these questions in order.

### Step 1: Should this animate at all?

| Frequency | Decision |
|-----------|----------|
| 100+/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Dozens/day (hover effects, list browsing) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare or first-time (onboarding, celebrations) | Delight allowed |

**Keyboard-triggered actions must never animate.** They repeat hundreds of times daily. Animation feels slow and disconnected.

### Expanded "No Animation" Criteria

Beyond frequency, consider these additional no-animate signals:

- **Launcher/utility tools** — Apps opened and closed hundreds of times daily (command palettes, search bars, launchers) should have ZERO open/close animation. Speed is the feature.
- **Marketing vs. App UI** — Landing page hero animations can be elaborate (user sees once). App UI animations must be restrained (user sees repeatedly). Never apply marketing-level animation to daily-use interfaces.
- **Mental model doesn't require it** — Tab switching, breadcrumb navigation, pagination — the user's mental model doesn't expect spatial movement. Instant switching feels faster and more correct than animated transitions.

### Step 2: What is the purpose?

Every animation must answer "why does this animate?"

Valid purposes:
- **Spatial consistency**: toast enters/exits same direction → swipe-to-dismiss feels intuitive
- **State indication**: morphing button shows state change
- **Explanation**: marketing animation demonstrates how a feature works
- **Feedback**: button shrinks on press → interface acknowledges user input
- **Preventing jarring change**: element appearing/disappearing without transition feels broken

If the purpose is just "looks cool" and the user sees it often — don't animate.

---

## Duration Tiers

### timing-duration-tiers — Unified duration scale

| Tier | Range | Use Cases |
|------|-------|-----------|
| **Micro** | 60–120ms | Color change, opacity fade, focus ring |
| **Short** | 120–200ms | Button press, hover feedback, tooltip, toggle |
| **Medium** | 200–300ms | Modal entrance, dropdown open, slide-in panel |
| **Max** | 300ms | Hard cap for all user-triggered animations |
| **Decorative** | 300–500ms | Drawer, page transition, onboarding (non-blocking only) |

```css
:root {
  --duration-micro: 80ms;
  --duration-short: 150ms;
  --duration-medium: 250ms;
  --duration-max: 300ms;
}
```

### timing-300ms-cap — All user-triggered animations ≤ 300ms

```css
/* ❌ Exceeds cap */
.dropdown { transition: transform 400ms; }

/* ✅ Within cap */
.dropdown { transition: transform 200ms; }
```

### timing-exit-faster — Exit animations shorter than entrance

Entrance is deliberate (user needs to see what appeared). Exit is system response (get out of the way fast).

```css
/* ❌ Same duration both ways */
.modal-enter { animation-duration: 300ms; }
.modal-exit { animation-duration: 300ms; }

/* ✅ Asymmetric timing */
.modal-enter { animation-duration: 250ms; }
.modal-exit { animation-duration: 150ms; }
```

---

## Easing Standards

### easing-decision-tree — Easing selection by context

```
Element entering or appearing?
  → ease-out (fast start, responsive)

Element exiting or disappearing?
  → ease-out (fast departure, snappy)

Moving/transforming on screen?
  → ease-in-out (natural acceleration/deceleration)

Hover / color change?
  → ease

Continuous movement (marquee, progress)?
  → linear

Default →
  → ease-out
```

### easing-no-ease-in — Never use ease-in for UI animations

ease-in starts slow, making the initial movement lag. A 300ms ease-in dropdown feels slower than the same 300ms with ease-out because ease-in delays the moment users are watching most closely.

```css
/* ❌ Sluggish start */
.panel { transition: transform 200ms ease-in; }

/* ✅ Responsive start */
.panel { transition: transform 200ms ease-out; }
```

This applies to both entrance AND exit. For exits, use ease-out with a shorter duration (150ms) to convey quick departure — this achieves the "acceleration away" effect better than ease-in because the user perceives immediate response.

### easing-custom-curves — Use custom cubic-bezier, not CSS defaults

Built-in CSS easing keywords are too mild. They lack the punch that makes animation feel intentional.

```css
:root {
  /* Strong ease-out for UI interactions */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  /* Strong ease-in-out for on-screen movement */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  /* iOS-style drawer curve */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

### easing-linear-progress-only — linear easing only for time/progress

linear feels robotic for motion. Reserve it for:
- Progress bars
- Time indicators
- Continuous marquee/scrolling
- Loading spinners (rotation)

```css
/* ❌ Linear on motion */
.card { transition: transform 200ms linear; }

/* ✅ Linear on progress */
.progress-bar { transition: width 100ms linear; }
```

---

## Stagger Animations

### timing-stagger-adaptive — Adaptive stagger by item count

Stagger delay must scale down as item count grows. Total stagger time capped at 400ms.

| Item Count | Max Per-Item Delay | Max Total |
|------------|-------------------|-----------|
| 1–5 items | 60ms | 300ms |
| 6–10 items | 40ms | 400ms |
| 11+ items | 30ms | 400ms (cap) |

```css
/* 4 items × 60ms = 240ms total ✅ */
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 60ms; }
.item:nth-child(3) { animation-delay: 120ms; }
.item:nth-child(4) { animation-delay: 180ms; }
```

**Critical**: stagger is decorative — never block user interaction during stagger playback.

---

## Perceived Performance

### timing-perceived-speed — Optimize perceived speed when actual speed cannot improve

Strategies in priority order:
1. **Optimistic UI** — show expected result immediately, reconcile after
2. **Skeleton loading** — show layout shape before content loads
3. **Fast spinner** — faster spinning feels like faster loading (same actual time)
4. **Easing tricks** — 200ms ease-out feels faster than 200ms ease-in because users see immediate movement

```tsx
// ❌ Empty screen during load
if (isLoading) return null;

// ✅ Skeleton preserves perceived speed
if (isLoading) return <Skeleton />;
```

### timing-asymmetric-press — Press slow, release fast

For intentional actions (hold-to-delete, long-press), press phase is slow (user decides) and release phase is instant (system responds).

```css
.overlay {
  transition: clip-path 200ms var(--ease-out);
}

.button:active .overlay {
  transition: clip-path 2s linear;
}
```
