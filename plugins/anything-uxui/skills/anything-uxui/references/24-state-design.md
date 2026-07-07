---
title: State Design — Loading, Empty, Error, Pending
impact: HIGH
tags: state, loading, skeleton, empty, error, optimistic, pending, react
---

# State Design — Loading / Empty / Error / Pending

Every async surface has four states beyond "success." Getting them wrong is the most common React UI failure this skill exists to fix.
By junhan of select.codes.

---

## state-indicator-threshold — Match the indicator to the wait

| Wait | Indicator |
|------|-----------|
| **< 1s** | **Nothing.** An indicator that flashes under ~1s makes the UI feel *less* stable (NN/g). Delay any indicator 150–300ms; show it only if still loading. |
| **1–10s** | Skeleton (full page / container) or spinner (single module) |
| **> 10s** | Progress bar + explicit time estimate |

Skeletons are for **content** loads only. Processes (upload / convert / pay) get a progress bar or wizard — never a skeleton.

## state-skeleton-mirrors-layout — A skeleton must match the final layout

A skeleton whose shape and count don't match the real content ADDS perceived latency and CLS. Viget's study (n=136): a poorly-matched skeleton tested WORSE than a spinner or blank screen. Use the same dimensions and item count; shimmer left→right (~1–1.5s cycle), not a fast pulse. Done wrong, **skeleton < spinner** — don't cargo-cult it.

## state-swr-no-skeleton — Never skeleton when you already have data

Skeleton/spinner is for the FIRST load. On refetch or query-key change *with cached data*, show the stale data instantly and revalidate in the background (optionally a subtle inline "updating…"). TanStack Query's `placeholderData: keepPreviousData` exists precisely to kill the skeleton re-flash on pagination and filtering.

## state-pending-on-trigger — Pending state on the control, not the content

Don't blank a whole region to show loading. Put the pending state on the trigger. In React 19, `useTransition`/`isPending` keeps already-revealed content visible while the next view prepares — stale-while-revalidate for tab/filter switches instead of a spinner flash.

```tsx
const [isPending, startTransition] = useTransition();
// onClick={() => startTransition(() => setTab(next))}
<Tab aria-busy={isPending} />   // pending cue on the tab; content stays put
```

## state-optimistic-limits — Optimistic UI only where it's safe

`useOptimistic` (React 19) gives instant feedback with automatic rollback — but ONLY for reversible, low-stakes, high-success mutations (like, rename, reorder, toggle). NEVER for destructive deletes without undo, financial balances, or inventory counts (the phantom-balance problem) — those must show real pending state. Required mechanics: a visible pending cue (reduced opacity / "sending…") so a rollback doesn't read as a glitch; on failure, automatic rollback **plus** an explicit error surface (toast) so the user knows it failed AND that the UI reverted. Dispatch the optimistic update before the first `await`.

## state-empty-is-teachable — Empty ≠ error; empty is onboarding

An empty state is a "teachable moment" (NN/g), not a blank container. It must: explain *why* it's empty, offer ONE primary action, speak plainly, and never look like a broken page. **Empty** (nothing yet → invite an action) reads and looks different from **error** (something failed → explain + offer recovery). Design them separately.

## state-error-recovery — Errors explain and offer a way out

An error state names what failed in human language and gives a concrete next step (retry, go back, contact) — never a raw stack trace or a dead end. Preserve the user's input on failure (never make them re-type). Pair with `state-loading-aria-busy` (`20`) so assistive tech hears the state change.
