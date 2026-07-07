---
title: AI & Streaming Interface
impact: HIGH
tags: ai, streaming, llm, aria-live, chat, react
---

# AI & Streaming Interface

Streaming LLM responses are table-stakes for 2026 product UIs — and a fresh source of broken accessibility and interaction. This covers the *craft* (token rendering, a11y, scroll, controls), not conversation design.
By junhan of select.codes.

---

## stream-no-live-region — Never wrap the token stream in a live region

`aria-live` on the streaming message body re-announces on every chunk → screen-reader spam. The in-progress message stays OUTSIDE any live region while streaming; the chat history is `role="log"` (implicit polite, additions-only).

```tsx
<div role="status" aria-live="polite" className="sr-only">{phase}</div>  {/* pre-mounted, empty */}
<div role="log">{completedMessages}</div>                                {/* history */}
<StreamingMessage tokens={tokens} />   {/* NOT inside any live region */}
```

## stream-lifecycle-status — Announce lifecycle, not tokens

A separate, persistent `role="status"` (pre-registered empty — see `20 state-loading-aria-busy`) announces "Generating response…" on start and "Response ready" on completion. Polite, never assertive. At most, buffer sentence-level announcements — never per-token.

## stream-partial-markdown — Render partial markdown safely

LLM streams emit incomplete markdown, half-open code fences, and truncated words. Render text immediately, but **defer code-block rendering until the closing fence arrives** (show a plain-text placeholder meanwhile) to avoid layout thrash and broken syntax highlighting mid-stream.

## stream-no-focus-steal — Keep focus in the composer

When a response arrives, do NOT move focus. Focus stays in the input composer so the user can keep typing. (A common failure is focus jumping to the top of the page after send.)

## stream-stop-and-scroll — Stop control + auto-scroll opt-out

- Show a **Stop / Regenerate** control during generation; **Escape stops** generation (2026 convention).
- **Auto-scroll opt-out**: pin to bottom only while the user is already at the bottom. The moment they scroll up during a stream, STOP auto-scrolling — scroll hijack during reading is the #1 streaming-UI complaint.

## ai-reasoning-trace — Reasoning traces: collapsed, honest, non-anthropomorphic

Reasoning traces are post-hoc rationalizations, often unfaithful to the actual computation (NN/g 2025-12) — displaying them uncritically "risks promoting trust in a flawed tool." So:
- **Collapsed by default**, expandable on demand.
- **Never first-person anthropomorphic** language ("I'm zeroing in on…" ❌ → "Based on the following sources" ✅).
- Prefer showing **sources + model limitations** over raw chain-of-thought.
- Responses direct, scannable, expandable — users want answers, not conversation.

## ai-provisional-content — Mark AI output as provisional; keep the user in control

AI-generated content should be visibly labeled and treated as provisional: give the user an explicit accept/edit/regenerate step rather than committing AI output silently (governor pattern). Never disguise AI as human. Offer a "talk to a human" path where stakes are real.
