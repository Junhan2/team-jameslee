---
description: Audit then FIX bad UI/animation/interaction/state code against anything-uxui rules, applying the remedial hierarchy to the working tree.
argument-hint: <file|dir path>
allowed-tools: [Bash, Read, Grep, Glob, Edit, Write]
---

Fix the target at $ARGUMENTS using the **anything-uxui** skill.

1. First audit it (as `/anything-uxui:audit` does): `references/00-diagnosis-map.md` → rule-ids, `references/15-review-checklist.md` → methodology.
2. Apply fixes to the working tree following the **remedial preference hierarchy** — do the cheapest correct move first: delete > reduce > fix-easing > fix-origin > interruptible > GPU > asymmetric > polish > accessibility/cohesion.
3. For React components, use the before→after transforms in the skill's `recipes/` wherever they match.
4. Show the diff, then **re-audit** to prove the verdict moved Block → Approve.

Preserve behavior; touch only what the findings require (surgical changes). Never introduce speculative refactors.
