---
title: Diagnosis Map — Symptom → Rule → Fix
impact: ENTRY
tags: diagnosis, audit, entry, lookup, triage
---

# Diagnosis Map — Symptom → Rule → Fix

**The entry point for fixing bad UI.** Scan the symptom column, jump to the rule-ids, apply the fix. This turns ~290 scattered rules into "symptom → cure" — the difference between a library and a doctor. Load a referenced category only when a symptom matches (progressive disclosure).
By junhan of select.codes.

## Three workflows
- **Audit** (`/anything-uxui:audit <path|diff>`): scan target → findings table (Before/After/Why + `file:line` + rule-id) grouped by `15`'s impact tiers → **Block/Approve verdict**. Read-only.
- **Fix** (`/anything-uxui:fix <path>`): audit, then apply the remedial hierarchy (`delete > reduce > fix-easing > fix-origin > interruptible > GPU > asymmetric > polish > a11y`). Show the diff; re-audit to prove Block→Approve.
- **Design new** (`/anything-uxui:design <brief>`): load `23-distinctive-design` + tokens (`18/19`) + component patterns (`04/17`) FIRST, then build to spec so the output isn't slop by construction.

---

## Bad ANIMATION
| Symptom (what you see) | Rule-ids | Fix |
|---|---|---|
| `transition: all` / animates layout props | `perf-transform-opacity-only`, `review-escalation` | exact props; transform/opacity only |
| enters from `scale(0)` / opacity-only pop | `component-no-scale-zero` | `scale(0.95)` + opacity |
| `ease-in` on UI; CSS default easing | `easing-no-ease-in`, `easing-custom-curves` | ease-out + custom cubic-bezier |
| >300ms UI anim; symmetric enter/exit | `timing-300ms-cap`, `timing-exit-faster` | ≤300ms; exit ~60% |
| per-frame value via `useState`→`animate={{x}}` | `perf-motion-values-no-rerender` | useMotionValue / useTransform |
| `from 'framer-motion'` import | `perf-motion-hw` | `from 'motion/react'` |
| "can't animate height:auto" hack (max-height magic) | `philosophy-opacity-height`, `css-at-property-animate` | interpolate-size / grid `0fr→1fr` |
| AnimatePresence exit not firing | `exit-no-fragment-children`, `exit-requires-wrapper` | keyed motion child, no Fragment |

## Bad INTERACTION
| Symptom | Rule-ids | Fix |
|---|---|---|
| no press feedback on a pressable | `component-active-scale` | `:active { scale(.97) }` |
| popover/tooltip positioned by a JS lib | `anchor-positioning-native` | CSS anchor + `position-try` |
| drag/swipe with no non-drag path | `gesture-non-drag-alternative` | pair a button (WCAG 2.5.7) |
| target < 24px | `a11y-target-size-24` | 24 floor / 44–48 touch |
| hover-only reveal on touch | `a11y-touch-hover-gate` | `@media (hover:hover)` |
| JS backdrop-click dismiss | `dialog-invoker-commands`, `popover-api-native` | `closedby` / `command` |
| laggy click / typing | `perf-inp-under-200ms` | yield; defer; break long tasks |
| SPA route change silent to screen readers | `state-spa-route-focus`, `state-skip-link` | focus h1/main + title |

## Bad STATE (loading / empty / error / pending)
| Symptom | Rule-ids | Fix |
|---|---|---|
| spinner flash < 1s | `state-indicator-threshold` | <1s show nothing; 150–300ms delay |
| skeleton doesn't match layout | `state-skeleton-mirrors-layout` | same dims/count, or use a spinner |
| skeleton on a cached refetch | `state-swr-no-skeleton` | keepPreviousData |
| blanks whole region on tab switch | `state-pending-on-trigger` | useTransition on the control |
| optimistic delete, no rollback cue | `state-optimistic-limits` | pending cue + rollback+toast; never destructive |
| live region mounted with its content | `state-loading-aria-busy` | pre-register empty, toggle text |
| streaming tokens inside aria-live | `stream-no-live-region`, `stream-lifecycle-status` | role=log history; lifecycle status |
| blank empty state | `state-empty-is-teachable` | why + one action + human copy |

## Bad VISUAL / "looks AI-made"
| Symptom | Rule-ids | Fix |
|---|---|---|
| default font (Inter) centered hero | `distinct-no-default-font` | 1 display + 1 workhorse |
| purple gradient accent / gradient hero text | `distinct-no-slop-palette` | one brand hue, real chroma |
| emoji as icons | `distinct-emoji-not-icons` | real icon set |
| badge + centered hero + 3 identical cards | `distinct-break-scaffold` | asymmetric layout |
| glassmorphism on text chrome | `distinct-no-glass-chrome` | glass only for transient overlays |
| flat gray + 8px radius everywhere | `distinct-saturate-neutrals`, `distinct-radius-is-brand` | hue-biased grays; radius is a decision |
| low text/UI contrast | `color-contrast-minimum` | 4.5:1 text / 3:1 UI |

---

## Verdict (from `15-review-checklist`)
Close every audit with **Block** (any feel-breaking regression, a11y failure, animation on a keyboard/high-frequency action, or a non-GPU animation with an easy fix) or **Approve** (none of the above; durations, easing, contrast, and targets within bounds). Cite `file:line` for every finding. For a new build, run this map in reverse: satisfy each row's rule *before* shipping.
