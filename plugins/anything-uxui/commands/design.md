---
description: Build a new UI/component guided by anything-uxui rules so the output is polished and NOT generic/AI-made.
argument-hint: <what to build>
allowed-tools: [Bash, Read, Grep, Glob, Edit, Write]
---

Build $ARGUMENTS using the **anything-uxui** skill, so the result is distinctive and correct by construction.

1. Load `references/23-distinctive-design.md` FIRST — actively avoid every AI-slop tell (default fonts like Inter, purple-blue gradients, emoji-as-icons, the badge+centered-hero+3-identical-cards scaffold, glassmorphism, flat gray neutrals, uniform 8px radius).
2. Establish tokens from `references/18-color-theming.md` + `19-design-tokens.md` — OKLCH, one brand hue with real chroma, contrast ≥ 4.5:1, a type scale.
3. Build components per `04-component-patterns.md`, `17-dialog-overlay-patterns.md`, `21-form-patterns.md`; animate per `02`/`07` (≤300ms, ease-out, `:active` scale 0.97); handle every state (loading/empty/error/pending) per `24-state-design.md`.
4. Before finishing, self-audit against `references/00-diagnosis-map.md` and confirm an **Approve** verdict — especially "does this look AI-made?"
