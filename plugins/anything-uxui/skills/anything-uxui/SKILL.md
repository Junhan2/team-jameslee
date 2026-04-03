---
name: anything-uxui
description: |
  Comprehensive UIUX design principles and standards for web interfaces.
  Use this skill when building, reviewing, or improving any web UI — components,
  pages, layouts, animations, interactions, visual design, typography, color systems,
  forms, dialogs, keyboard navigation, audio feedback, or accessibility.
  Covers 21 categories with 240+ actionable rules.

  Also trigger when: setting up design tokens, implementing dark mode, creating
  design system foundations, building responsive layouts, or auditing accessibility.

  Trigger when: creating UI components, reviewing frontend code, implementing
  animations, designing interactions, optimizing perceived performance, improving
  accessibility, or making any design engineering decision.

  Do NOT use for: backend logic, database design, API architecture, or
  non-visual concerns.
license: MIT
metadata:
  author: junhan
  organization: select.codes
  version: "2.0.0"
---

# anything-uxui — Web Interface Design Standards

Unified design engineering principles for building polished, performant, accessible web interfaces.
By junhan of select.codes.

---

## Philosophy

Three beliefs that govern every rule in this system:

1. **Taste is trained, not innate** — Study why great interfaces feel great. Reverse-engineer animations, inspect interactions, stay curious.
2. **Invisible details compound** — Most details go unnoticed individually. Together, they create interfaces users love without knowing why.
3. **Beauty is leverage** — In a world where every product is "good enough," polish is a genuine differentiator.

---

## Category Map

### Motion & Interaction (01–07)

| # | Category | Impact | Rules | Reference |
|---|----------|--------|-------|-----------|
| 01 | [Design Philosophy](references/01-philosophy.md) | CRITICAL | 12 | Taste, invisible details, component principles |
| 02 | [Animation Timing & Easing](references/02-animation-timing.md) | CRITICAL | 14 | Duration tiers, easing selection, stagger, perceived speed |
| 03 | [Spring Physics](references/03-spring-physics.md) | HIGH | 8 | Spring params, mouse tracking, interruptibility |
| 04 | [Component Patterns](references/04-component-patterns.md) | HIGH | 13 | Buttons, popover, tooltip, drawer, observer, stagger |
| 05 | [CSS Techniques](references/05-css-techniques.md) | HIGH | 31 | Transform, clip-path, pseudo, scroll-driven, View Transitions |
| 06 | [Gesture Interaction](references/06-gesture-interaction.md) | HIGH | 8 | Momentum, damping, pointer capture, directional friction |
| 07 | [Exit Animations](references/07-exit-animations.md) | HIGH | 14 | AnimatePresence, exit symmetry, modes, propagation |

### Visual & Design Systems (08–10, 18–19)

| # | Category | Impact | Rules | Reference |
|---|----------|--------|-------|-----------|
| 08 | [Visual Design](references/08-visual-design.md) | HIGH | 10 | Shadows, radius, spacing, button anatomy |
| 09 | [Typography](references/09-typography.md) | MEDIUM | 16 | Numeric format, OpenType, rendering, layout |
| 10 | [Audio Feedback](references/10-audio-feedback.md) | MEDIUM | 30 | Sound design, Web Audio API, appropriateness |
| 18 | [Color & Theming](references/18-color-theming.md) | CRITICAL | 10 | OKLCH, semantic colors, dark mode, surface hierarchy |
| 19 | [Design Tokens](references/19-design-tokens.md) | HIGH | 6 | CSS variable architecture, shadow palette, token schema |

### Layout & Structure (16–17, 21)

| # | Category | Impact | Rules | Reference |
|---|----------|--------|-------|-----------|
| 16 | [Layout Systems](references/16-layout-systems.md) | CRITICAL | 13 | Grid, Flexbox, container queries, layout primitives |
| 17 | [Dialog & Overlay Patterns](references/17-dialog-overlay-patterns.md) | CRITICAL | 12 | Native dialog, popover API, anchor positioning, drawer |
| 21 | [Form Patterns](references/21-form-patterns.md) | HIGH | 6 | Custom inputs, validation states, aria-disabled |

### UX, Performance & Accessibility (11–15, 20)

| # | Category | Impact | Rules | Reference |
|---|----------|--------|-------|-----------|
| 11 | [Laws of UX](references/11-laws-of-ux.md) | HIGH | 23 | Fitts, Hick, Miller, Doherty, Gestalt, cognitive load |
| 12 | [Performance](references/12-performance.md) | HIGH | 8 | GPU acceleration, CSS vs JS, WAAPI, blur limits |
| 13 | [Prefetching](references/13-prefetching.md) | MEDIUM | 6 | Trajectory prediction, hitSlop, touch fallback |
| 14 | [Accessibility](references/14-accessibility.md) | HIGH | 8 | Reduced motion, rem units, focus-visible, target sizes |
| 15 | [Review Checklist](references/15-review-checklist.md) | HIGH | — | Quality checklist, debug methods, review format |
| 20 | [Keyboard & State Matrix](references/20-keyboard-state-matrix.md) | CRITICAL | 10 | Roving tabindex, focus-visible, 7-state matrix, ARIA |

**Total: 248 rules across 21 categories**

---

## Quick Reference: Core Numbers

| Standard | Value | Rule |
|----------|-------|------|
| Max animation duration | **300ms** | timing-300ms-cap |
| :active scale | **0.97** | component-active-scale |
| Min entry scale | **0.95** | component-no-scale-zero |
| Default spring | `duration: 0.4, bounce: 0.15` | spring-apple-style-default |
| Custom ease-out | `cubic-bezier(0.23, 1, 0.32, 1)` | easing-custom-curves |
| Custom ease-in-out | `cubic-bezier(0.77, 0, 0.175, 1)` | easing-custom-curves |
| Stagger cap | ≤60ms/item (1-5), ≤40ms (6+) | timing-stagger-adaptive |
| Total stagger limit | **400ms** | timing-stagger-adaptive |
| Interactive target size | **32px** minimum | a11y-target-size-32 |
| Keyboard animation | **0ms** (none) | Decision Framework, Step 1 |
| Exit/entrance ratio | **~60%** (exit is faster) | exit-timing-asymmetric |
| Max blur | **20px** | perf-blur-limit |
| Doherty threshold | **400ms** response time | ux-doherty-under-400ms |

---

## Quick Reference: Easing by Context

| Context | Easing | Custom Curve |
|---------|--------|-------------|
| Entrance | ease-out | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Exit | ease-out (fast) | `cubic-bezier(0.23, 1, 0.32, 1)` |
| On-screen movement | ease-in-out | `cubic-bezier(0.77, 0, 0.175, 1)` |
| Hover / color | ease | default CSS `ease` |
| Progress / time | linear | `linear` |
| Gesture / drag | spring | `duration: 0.4, bounce: 0.15` |
| Keyboard action | none | `duration: 0` |

---

## Quick Reference: Duration Tiers

| Tier | Range | Examples |
|------|-------|---------|
| Micro | 60–120ms | Color change, opacity, focus ring |
| Short | 120–200ms | Button press, hover, tooltip, toggle |
| Medium | 200–300ms | Modal, dropdown, slide panel |
| Decorative | 300–500ms | Drawer, page transition (non-blocking) |

---

## How to Use This Skill

### When building a new component:
1. Start with [01-Philosophy](references/01-philosophy.md) — "Does this need animation?"
2. Apply [02-Timing](references/02-animation-timing.md) decision framework
3. Check [04-Component Patterns](references/04-component-patterns.md) for the specific component type
4. Verify with [15-Review Checklist](references/15-review-checklist.md)

### When reviewing existing code:
1. Run through [15-Review Checklist](references/15-review-checklist.md) systematically
2. Use the Before/After/Why table format for findings
3. Reference specific rule IDs in feedback (e.g., "violates `timing-300ms-cap`")

### When implementing animations:
1. Choose easing from [02-Timing](references/02-animation-timing.md) decision tree
2. If gesture-based → [03-Spring](references/03-spring-physics.md)
3. If element exits DOM → [07-Exit Animations](references/07-exit-animations.md)
4. Performance check → [12-Performance](references/12-performance.md)

### When designing layouts:
1. [16-Layout Systems](references/16-layout-systems.md) for grid, flexbox, responsive patterns
2. [08-Visual Design](references/08-visual-design.md) for shadows, spacing, radius
3. [09-Typography](references/09-typography.md) for text rendering
4. [11-Laws of UX](references/11-laws-of-ux.md) for interaction design

### When building dialogs, drawers, or overlays:
1. [17-Dialog & Overlay](references/17-dialog-overlay-patterns.md) for native dialog, popover, anchor positioning
2. [07-Exit Animations](references/07-exit-animations.md) for exit transitions
3. [20-Keyboard & State](references/20-keyboard-state-matrix.md) for focus management

### When setting up a design system:
1. [19-Design Tokens](references/19-design-tokens.md) for CSS variable architecture
2. [18-Color & Theming](references/18-color-theming.md) for color system, dark mode
3. [08-Visual Design](references/08-visual-design.md) for shadow/spacing/radius scales

### When building forms:
1. [21-Form Patterns](references/21-form-patterns.md) for inputs, validation, custom controls
2. [20-Keyboard & State](references/20-keyboard-state-matrix.md) for state matrix, aria-disabled
3. [14-Accessibility](references/14-accessibility.md) for target sizes, rem units

---

## Conflict Resolution Policy

When rules appear to conflict, resolve by these priorities:
1. **Accessibility** always wins over aesthetics
2. **Performance** wins over visual richness
3. **Responsiveness** (speed perception) wins over correctness (Disney principles)
4. **User frequency** determines animation budget (high frequency = less animation)
5. **Consistency** within a product trumps per-component optimization
