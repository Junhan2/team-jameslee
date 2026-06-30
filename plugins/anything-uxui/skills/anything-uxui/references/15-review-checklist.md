---
title: Review Methodology & Checklist
impact: HIGH
tags: review, methodology, checklist, debugging, code-review, animation-quality
---

# Review Methodology & Checklist

How to review UI animation/motion code against a high craft bar — the reviewer posture, the
standards, the order to fix things, the verdict — followed by the verification checklist.
By junhan of select.codes.

---

## review-posture — Default to flagging; approval is earned

You are a senior motion-design reviewer with a brutal eye for craft. Bias toward motion that
*feels right*, not motion that merely runs. A transition that "works" but feels sluggish, lands
from the wrong origin, fires too often, or drops frames is a regression, not a pass. **Approval
is earned, not assumed** — when nothing is flagged, say why it passed.

---

## review-ten-standards — The ten non-negotiable standards

Every animation in the diff is measured against these. A violation is a finding.

1. **Justified motion.** Every animation answers "why does this animate?" — spatial consistency, state indication, feedback, explanation, or preventing a jarring change. "It looks cool" on a frequently-seen element is a block.
2. **Frequency-appropriate.** Keyboard-initiated and 100+/day actions get *no* animation. Tens/day gets reduced. Occasional gets standard. Rare/first-time can have delight. (→ `02-animation-timing`)
3. **Responsive easing.** Entering/exiting elements use `ease-out` or a strong custom curve. `ease-in` on UI is a block — it delays the moment the user watches most. (→ `02-animation-timing`)
4. **Sub-300ms UI.** UI animations stay under 300ms; anything slower on a UI element needs justification. (→ `timing-300ms-cap`)
5. **Origin & physical correctness.** Popovers/dropdowns/tooltips scale from their trigger (`transform-origin`), not center. Never animate from `scale(0)` — start from `scale(0.95)` + opacity. Modals are exempt — they stay centered. (→ `04-component-patterns`, `05-css-techniques`)
6. **Interruptibility.** Rapidly-triggered or gesture-driven motion (toasts, toggles, drags) uses transitions/springs that retarget from current state, not keyframes that restart from zero. (→ `03-spring-physics`, `07-exit-animations`)
7. **GPU-only properties.** Animate `transform` and `opacity` only. Animating `width`/`height`/`margin`/`padding`/`top`/`left` (or Framer Motion `x`/`y`/`scale` shorthands under load) is a performance finding. (→ `12-performance`)
8. **Accessibility.** `prefers-reduced-motion` honored (gentler, not zero — keep opacity/color, drop movement). Hover motion gated behind `@media (hover: hover) and (pointer: fine)`. (→ `14-accessibility`)
9. **Asymmetric enter/exit.** Deliberate actions (a press, a hold, a destructive confirm) animate slower; system responses snap. Symmetric timing on a press-and-release or hold interaction is a finding. (→ `timing-asymmetric-press`, `07-exit-animations`)
10. **Cohesion.** Motion matches the component's personality and the rest of the product — playful can be bouncier, a dashboard stays crisp. When unsure whether motion feels right, the strongest move is often to delete it. (→ `01-philosophy` cohesion)

---

## review-escalation — Aggressive escalation triggers

Flag these on sight, hard:

- `transition: all` (unbounded property animation)
- `scale(0)` or pure-fade entrances with no initial transform
- `ease-in` on any UI interaction; weak built-in easing on a deliberate animation
- Animation on a keyboard shortcut, command-palette toggle, or 100+/day action
- UI duration > 300ms with no stated reason
- `transform-origin: center` on a trigger-anchored popover/dropdown/tooltip
- Keyframes on toasts, toggles, or anything added/triggered rapidly
- Animating layout properties (`width`/`height`/`margin`/`padding`/`top`/`left`)
- Framer Motion `x`/`y`/`scale` props on motion that runs while the page is busy
- Updating a CSS variable on a parent to drive a child transform (style-recalc storm)
- Missing `prefers-reduced-motion` handling on movement
- Ungated `:hover` motion
- Symmetric enter/exit timing on a press-and-release or hold interaction
- Everything-at-once entrance where a 30–80ms stagger belongs

---

## review-remedial-hierarchy — Prefer earlier moves over later ones

When proposing fixes, the cheapest correct move wins. **Try to delete before you try to polish.**

1. **Delete** the animation (high-frequency / no purpose / keyboard-triggered)
2. **Reduce** it — shorter duration, smaller transform, fewer animated properties
3. **Fix the easing** — `ease-in` → `ease-out`/custom curve; use a strong cubic-bezier
4. **Fix the origin/physicality** — correct `transform-origin`; `scale(0)` → `scale(0.95)` + opacity
5. **Make it interruptible** — keyframes → transitions, or a spring for gesture-driven motion
6. **Move it to the GPU** — layout props → `transform`/`opacity`; shorthand → full transform string; WAAPI for programmatic CSS
7. **Asymmetric timing** — slow the deliberate phase, snap the response
8. **Polish** — blur to mask crossfades, stagger for groups, `@starting-style` for entry, spring for "alive" elements
9. **Accessibility & cohesion** — add reduced-motion + hover gating; tune to match the component's personality

---

## review-output-format — Required output

Two parts, in this order.

### Part 1 — Findings table (required)

A single markdown table. One row per issue. Never a "Before:" / "After:" bullet list.

| Before | After | Why |
|--------|-------|-----|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | Specify exact property; `all` animates unintended props off-GPU |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing |
| `ease-in` on dropdown | `ease-out` + custom curve | `ease-in` delays the moment the user watches most; feels sluggish |
| `transform-origin: center` on popover | `var(--radix-popover-content-transform-origin)` | Popovers scale from their trigger, not center (modals exempt) |

### Part 2 — Verdict (required)

Group remaining commentary by impact tier, highest first; omit empty tiers:

1. **Feel-breaking regressions** — sluggish easing, comes-from-nowhere, fires on high-frequency/keyboard actions
2. **Missed simplifications** — animations that should be removed or drastically reduced
3. **Performance** — non-GPU properties, dropped-frame risk, recalc storms
4. **Interruptibility & timing** — keyframes where transitions/springs belong; symmetric where asymmetric belongs
5. **Origin, physicality & cohesion** — wrong origin, mismatched personality, jarring crossfades
6. **Accessibility** — reduced-motion and pointer/hover gating

Close with an explicit decision, and cite `file:line` for every finding:

- **Block** — any feel-breaking regression, animation on a keyboard/high-frequency action, `scale(0)`/`ease-in` on UI, or a non-GPU animation with an easy GPU fix
- **Approve** — no feel-breaking regressions, nothing that should obviously be deleted, durations/easing within bounds, interruptibility handled where needed, reduced-motion respected

When a value is needed (a curve, a duration, a spring config), pull the exact one from the
relevant reference (`02`, `03`, `08`) rather than approximating.

---

## Quality Checklist

A fast verification pass. Use after the methodology above, or standalone for a quick gut-check.

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

### Fresh Eyes

Review animations the next day. Imperfections missed during development become obvious with fresh eyes. (→ `01-philosophy` fresh-eyes-review)

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
