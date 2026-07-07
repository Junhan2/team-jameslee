# Self-Eval — does the skill actually fix bad UI?

Deliberately-broken components + expected findings (rule-ids the audit MUST catch + verdict). **Pass** = ≥90% of expected rules caught, correct Block/Approve, zero fixes that break the component.

| Case (broken) | Expected rule-ids | Verdict |
|---|---|---|
| broken-button | `component-active-scale`, `easing-no-ease-in`, `a11y-target-size-24`, `perf-transform-opacity-only` (transition:all), `perf-motion-hw` | Block |
| broken-loading-state | `state-loading-aria-busy`, `state-indicator-threshold`, `state-skeleton-mirrors-layout` | Block |
| slop-landing | `distinct-no-default-font`, `distinct-no-slop-palette`, `distinct-break-scaffold`, `distinct-emoji-not-icons` | Block |
| drag-only-list | `gesture-non-drag-alternative` | Block |
| optimistic-delete-no-undo | `state-optimistic-limits` | Block |
| clean-button (control) | — | Approve |

**Run**: feed each case to `/anything-uxui:audit`, diff the found rule-ids against expected. The control case (must Approve) guards against false positives — a skill that Blocks everything is as useless as one that Approves everything.
