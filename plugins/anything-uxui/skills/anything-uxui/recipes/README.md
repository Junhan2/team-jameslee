# React Transform Recipes

Before→after component transforms, each encoding **multiple rules** so a fix applies craft in one edit. The diagnosis map (`../references/00-diagnosis-map.md`) points here.

- [recipe-button](recipe-button.md) — press feedback + easing + target + focus + reduced-motion
- [recipe-async-state](recipe-async-state.md) — pending-on-trigger + optimistic limits + SWR + live-region
- [recipe-modal](recipe-modal.md) — native `<dialog>`/popover + `@starting-style`/allow-discrete exit + focus return + inert
- [recipe-list-transitions](recipe-list-transitions.md) — AnimatePresence keys (no Fragment) or CSS allow-discrete; stagger via `sibling-index()`
- [recipe-form](recipe-form.md) — `useActionState` + `:user-invalid` + on-blur + allow-paste + autocomplete + inputmode
- [recipe-theme](recipe-theme.md) — OKLCH tokens + `light-dark()` + Tailwind `@theme inline` bridge + contrast 4.5:1

All six recipes are written out as before→after templates, each encoding the rule-ids named above. Used by `/anything-uxui:fix` and the `00-diagnosis-map`.
