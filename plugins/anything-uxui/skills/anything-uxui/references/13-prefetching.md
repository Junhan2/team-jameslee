---
title: Predictive Prefetching
impact: MEDIUM
tags: prefetching, performance, perceived-speed, trajectory
---

# Predictive Prefetching

> By junhan of select.codes

Analyze cursor trajectory to load content before click, reducing perceived latency by 100-200ms.

---

## `prefetch-trajectory-over-hover` — Trajectory prediction over hover

Hover prefetching starts only after the cursor reaches the element — too late. Trajectory prediction fires while the cursor is still **in motion**, reclaiming 100-200ms.

```tsx
// ❌ Wait for hover — too late
<Link
  href="/about"
  onMouseEnter={() => router.prefetch("/about")}
>
  About
</Link>

// ✅ Trajectory-based — 100-200ms gain
const { elementRef } = useForesight({
  callback: () => router.prefetch("/about"),
  hitSlop: 20,
  name: "about-link",
});
<Link ref={elementRef} href="/about">About</Link>
```

**When to apply**: Data-heavy page transitions where navigation delay is noticeable.

---

## `prefetch-not-everything` — Intent-based, not viewport-based

Do not prefetch everything visible in the viewport. Prefetch based on user intent to avoid wasting bandwidth.

```tsx
// ❌ Prefetch all visible links — bandwidth waste
<Link href="/page" prefetch={true}>Page</Link>

// ✅ Intent-based prefetching — only where the user is heading
<Link href="/page" prefetch={false}>Page</Link>
```

**When to apply**: Pages with many links (dashboards, lists, navigation).

---

## `prefetch-hit-slop` — Expand prediction area with hitSlop (20px)

Extend an invisible prediction area around the element with hitSlop to start loading sooner. 20px is a good default.

```tsx
// ❌ Tight prediction area — minimal gain
const { elementRef } = useForesight({
  callback: () => prefetch(),
  hitSlop: 0,
});

// ✅ Expanded prediction area — faster detection
const { elementRef } = useForesight({
  callback: () => prefetch(),
  hitSlop: 20,
});
```

**When to apply**: When using trajectory-based prefetching.

---

## `prefetch-touch-fallback` — Graceful fallback for touch devices

Touch devices have no cursor. Trajectory prediction is impossible, so the system must automatically fall back to viewport or touch-start strategies.

```tsx
// ❌ Assumes cursor exists — breaks on touch
<Link href={href} onMouseMove={() => prefetch(href)}>
  {children}
</Link>

// ✅ Device-aware strategy — auto fallback
const { elementRef } = useForesight({
  callback: () => router.prefetch(href),
  hitSlop: 20,
});
```

**When to apply**: All prefetching that needs mobile/tablet support.

---

## `prefetch-keyboard-tab` — Prefetch on keyboard navigation

Monitor focus changes to start prefetching when the user is a few tabs away from a registered element. Keyboard users get the same perceived speed as mouse users.

```tsx
const { elementRef } = useForesight({
  callback: () => router.prefetch("/settings"),
  name: "settings-link",
});
```

**When to apply**: Navigation where keyboard accessibility is important.

---

## `prefetch-use-selectively` — Use selectively

Predictive prefetching is not suitable for every project. Use it only where navigation delay is noticeable.

**Good fit:**
- Data-heavy dashboards
- Multi-page apps with slow API responses
- E-commerce product pages

**Poor fit:**
- Static sites with instant navigation
- SPAs where all data is already preloaded

**When to apply**: When deciding whether to adopt prefetching.
