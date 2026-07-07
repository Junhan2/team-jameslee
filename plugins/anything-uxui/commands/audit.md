---
description: Audit UI/animation/interaction/state code (esp. React) against anything-uxui rules and return a Block/Approve verdict. Read-only.
argument-hint: <file|dir|diff path — omit for current git diff>
allowed-tools: [Bash, Read, Grep, Glob]
---

Audit the target at $ARGUMENTS (if empty, audit the current `git diff`) using the **anything-uxui** skill.

1. Start from the skill's `references/00-diagnosis-map.md` — match each symptom you see in the code to its rule-ids.
2. Apply the review methodology in `references/15-review-checklist.md`: reviewer posture (default to flagging — approval is earned), the ten non-negotiable standards, and the escalation triggers.
3. Load only the reference files the matched symptoms point to (progressive disclosure — do not load all 26).
4. Output **Part 1** — a single findings table `| Before | After | Why |`, one row per issue, each citing `file:line` and the rule-id. **Part 2** — a verdict grouped by impact tier, closing with an explicit **Block** or **Approve**.

Read-only: do NOT modify any files. To apply the fixes, tell the user to run `/anything-uxui:fix`.
