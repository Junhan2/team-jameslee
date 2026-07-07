# React Transform Recipes

Before→after component transforms, each encoding **multiple rules** so a fix applies craft in one edit. The diagnosis map (`../references/00-diagnosis-map.md`) points here.

- [recipe-button](recipe-button.md) — press feedback + easing + target + focus + reduced-motion
- [recipe-async-state](recipe-async-state.md) — pending-on-trigger + optimistic limits + SWR + live-region
- **modal** — native `<dialog>`/popover + `closedby` + `@starting-style`/allow-discrete exit + focus return + inert
- **list-transitions** — AnimatePresence keys (no Fragment) or CSS allow-discrete; stagger via `sibling-index()`
- **form** — `useActionState` + `:user-invalid` + on-blur + allow-paste + autocomplete + inputmode
- **theme** — OKLCH tokens + `light-dark()` + Tailwind `@theme inline` bridge + contrast 4.5:1

The two written-out recipes are templates; the remaining four follow the same before→after format, encoding the rule-ids named above.
