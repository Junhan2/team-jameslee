---
title: Review Checklist & Debug Methods
impact: HIGH
tags: review, checklist, debugging, code-review, animation-quality
---

# Review Checklist & Debug Methods

Standardized review format and quality checklist for UI animation code.
By junhan of select.codes.

---

## Review Format

When reviewing UI code, use a Before/After/Why markdown table. Never use separate "Before:" / "After:" bullet lists.

```markdown
| Before | After | Why |
|--------|-------|-----|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | Specify exact property; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing |
```

---

## Quality Checklist

### Animation Timing
- [ ] All user-triggered animations ≤ 300ms
- [ ] Exit animations shorter than entrance (~60% duration)
- [ ] No animation on keyboard-triggered actions (0ms)
- [ ] Duration matches tier: micro 60-120, short 120-200, medium 200-300
- [ ] Context menus: no entrance animation, exit only

### Easing
- [ ] No `ease-in` used anywhere — all exits use `ease-out`
- [ ] Custom cubic-bezier used, not CSS keyword defaults
- [ ] `linear` only on progress bars / time indicators
- [ ] Entrance uses `ease-out` or custom variant

### Scale & Transform
- [ ] `:active` has `scale(0.97)` on all interactive elements
- [ ] No `scale(0)` entry — minimum `scale(0.95)` with opacity
- [ ] Popover `transform-origin` matches trigger position (not center)
- [ ] Modal `transform-origin: center` (exception to above)

### Spring
- [ ] Gesture/drag animations use spring (not duration-based easing)
- [ ] Spring bounce is subtle: 0.1–0.2 for UI, higher only for playful elements
- [ ] Drag release passes velocity to spring animation

### Stagger
- [ ] Per-item delay: ≤60ms (1-5 items), ≤40ms (6+), ≤30ms (11+)
- [ ] Total stagger ≤ 400ms
- [ ] Interaction not blocked during stagger playback

### Exit Animations
- [ ] Exit properties mirror entrance properties (symmetric)
- [ ] AnimatePresence wraps all conditional motion elements
- [ ] `exit` prop defined on every motion element inside AnimatePresence
- [ ] Stable unique keys (not array index) for dynamic lists
- [ ] Exiting elements disable interactions (`disabled={!isPresent}`)

### Performance
- [ ] Only `transform` and `opacity` animated (no height/width/margin/padding)
- [ ] Framer Motion uses full `transform` string for hardware acceleration
- [ ] CSS variables not updated on parents with many children
- [ ] `box-shadow` animated via pseudo-element opacity
- [ ] `filter: blur()` kept under 20px

### Accessibility
- [ ] `prefers-reduced-motion` respected: transforms removed, opacity/color kept
- [ ] Hover animations gated behind `@media (hover: hover) and (pointer: fine)`
- [ ] Interactive targets ≥ 32px
- [ ] Hit areas expanded via pseudo-element for small visual elements

### Visual Design
- [ ] Nested border-radius uses concentric formula (inner = outer - gap)
- [ ] Shadows use 3+ layers with consistent light direction
- [ ] No pure black shadows — use neutral or semi-transparent dark
- [ ] Shadow elevation matches element hierarchy
- [ ] Spacing uses consistent scale (no arbitrary pixel values)

### Typography
- [ ] Data tables use `font-variant-numeric: tabular-nums`
- [ ] Headings use `text-wrap: balance`
- [ ] Body text uses `text-wrap: pretty`
- [ ] `font-display: swap` or `optional` set
- [ ] No `font-synthesis` — use actual font weights

---

## Debugging Methods

### Slow-Motion Testing

Temporarily increase duration by 2–5x to reveal issues invisible at normal speed.

Check in slow motion:
- Do colors transition smoothly, or do two separate states overlap?
- Is the easing correct, or does start/end feel abrupt?
- Is `transform-origin` right, or does the element scale from wrong point?
- Are multiple animated properties (opacity, transform, color) synchronized?

### Frame-by-Frame Inspection

Use Chrome DevTools Animations panel to step through frame by frame. Reveals timing mismatches between coordinated properties invisible at normal speed.

### Real Device Testing

Touch interactions (drawer, swipe gestures) must be tested on physical devices. Connect phone via USB, visit local dev server by IP address, use Safari remote devtools. Xcode Simulator is an alternative but real hardware is better for gesture testing.

### Common Issues Table

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Animation feels sluggish | ease-in or duration too long | Switch to ease-out, reduce duration |
| Element "pops" into existence | scale(0) or no opacity transition | Start from scale(0.95) + opacity: 0 |
| Hover sticks on mobile | Missing hover media query | Add `@media (hover: hover)` gate |
| Animation janks on page load | JS animation on main thread | Switch to CSS animation or WAAPI |
| Stagger feels slow | Per-item delay too high | Reduce to ≤40ms, check total ≤400ms |
| Exit leaves ghost element | Missing AnimatePresence | Wrap conditional in AnimatePresence |
| Popover grows from center | Default transform-origin | Set to trigger position |
