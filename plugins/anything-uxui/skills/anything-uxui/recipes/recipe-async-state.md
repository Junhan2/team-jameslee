---
title: Recipe — Async State (before → after)
tags: recipe, react, state, async
---
# Recipe — Async State (loading / pending / optimistic)

Encodes: `state-pending-on-trigger`, `state-swr-no-skeleton`, `state-optimistic-limits`, `state-loading-aria-busy`.

## ❌ Before
```tsx
// blanks the whole list on every refetch; optimistic delete with no rollback cue or error surface
{isLoading ? <Spinner/> : list.map(i => <Row key={i.id} {...i}/>)}
onDelete={(id) => { setList(l => l.filter(x => x.id !== id)); api.delete(id) }}
```

## ✅ After
```tsx
const [isPending, startTransition] = useTransition();
const [optimistic, addOptimistic] = useOptimistic(list);

// pending on the control; cached data stays visible (SWR — no skeleton re-flash)
<button aria-busy={isPending} onClick={() => startTransition(() => refetch())}>Refresh</button>
{optimistic.map(item => <Row key={item.id} dimmed={item.pending} />)}

// optimistic delete WITH a visible pending cue + rollback + explicit error (never silent)
async function onDelete(id: string) {
  addOptimistic(prev => prev.map(x => x.id === id ? { ...x, pending: true } : x));
  try { await api.delete(id) }
  catch { toast.error('Delete failed — item restored') }   // useOptimistic auto-reverts
}

// pre-registered live region (NOT mounted together with content)
<div role="status" aria-live="polite" className="sr-only">{isPending ? 'Updating…' : ''}</div>
```

Note: `useOptimistic` here is safe because delete is recoverable *and* surfaces failure. For irreversible/financial actions, drop optimism and show real pending state (`state-optimistic-limits`).
