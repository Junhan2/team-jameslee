---
title: React Concurrent Features
impact: MEDIUM-LOW
impactDescription: Smoother interactions with concurrent rendering
tags: [render, concurrent, transitions, performance]
appliesTo: [react, next.js]
relatedAgent: react-pattern-analyzer
---

# React Concurrent Features

## Problem

Expensive state updates block the main thread, causing dropped frames and unresponsive UI. Concurrent features let React interrupt rendering to keep the UI responsive.

## Detection Signals

- Expensive updates blocking user input
- Tab changes causing visible lag
- Filter/search updates freezing the UI
- Heavy list re-renders blocking interactions

## ❌ Bad Pattern

```tsx
function SearchableList({ items }) {
  const [filter, setFilter] = useState('');
  const [isPending, setIsPending] = useState(false);

  // ❌ Expensive filter blocks input
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleChange = (e) => {
    setIsPending(true);
    setFilter(e.target.value);  // Blocks while filtering!
    setIsPending(false);
  };

  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {isPending && <span>Searching...</span>}
      <List items={filteredItems} />  {/* Expensive render */}
    </div>
  );
}
// Typing in input feels laggy with 10,000 items
```

**Why this is problematic**:
- Every keystroke triggers expensive filter + render
- Input feels unresponsive
- User may type faster than UI can update

## ✅ Good Pattern

```tsx
import { useTransition, useDeferredValue } from 'react';

function SearchableList({ items }) {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Input updates immediately
  const handleChange = (e) => {
    const value = e.target.value;
    setFilter(value);  // Immediate for input

    // List update is deferred
    startTransition(() => {
      // React can interrupt this if user types again
    });
  };

  // Deferred value for expensive computation
  const deferredFilter = useDeferredValue(filter);
  const filteredItems = useMemo(
    () => items.filter(item =>
      item.name.toLowerCase().includes(deferredFilter.toLowerCase())
    ),
    [items, deferredFilter]
  );

  return (
    <div>
      <input
        value={filter}
        onChange={handleChange}
        style={{ opacity: isPending ? 0.7 : 1 }}
      />
      {isPending && <span>Searching...</span>}
      <List items={filteredItems} />
    </div>
  );
}
// Input stays responsive, list updates when React has time
```

**Why this is better**:
- Input updates immediately (high priority)
- List update is deferred (low priority)
- React can interrupt list render if user types again
- UI stays responsive

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Input Latency | 200ms | <50ms | -75% |
| Dropped Frames | Many | Few | Smoother |
| INP Score | Poor | Good | Better Core Web Vitals |

## Concurrent Features Overview

| Feature | Use Case |
|---------|----------|
| `useTransition` | Mark state updates as non-urgent |
| `useDeferredValue` | Defer expensive derived values |
| `Suspense` | Declarative loading states |
| `startTransition` | Wrap non-urgent updates |

## Common Patterns

### 1. useTransition for Tab Changes
```tsx
function Tabs() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabClick = (newTab) => {
    startTransition(() => {
      setTab(newTab);  // Tab content render is interruptible
    });
  };

  return (
    <div>
      <TabBar
        activeTab={tab}
        onTabClick={handleTabClick}
        isPending={isPending}
      />
      <TabContent tab={tab} />
    </div>
  );
}
```

### 2. useDeferredValue for Search
```tsx
function Search({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => items.filter(item => item.includes(deferredQuery)),
    [items, deferredQuery]
  );

  const isStale = query !== deferredQuery;

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <Results items={results} />
      </div>
    </div>
  );
}
```

### 3. Transition for Navigation
```tsx
import { useRouter } from 'next/navigation';

function Navigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = (path) => {
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <nav>
      <button onClick={() => navigate('/dashboard')}>
        Dashboard {isPending && <Spinner />}
      </button>
    </nav>
  );
}
```

### 4. Optimistic Updates with Transitions
```tsx
function LikeButton({ postId }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(false);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    setOptimisticLiked(true);  // Immediate

    startTransition(async () => {
      await likePost(postId);  // Interruptible
    });
  };

  return (
    <button onClick={handleLike} disabled={isPending}>
      {optimisticLiked ? '❤️' : '🤍'}
    </button>
  );
}
```

## When to Use Concurrent Features

| Scenario | Feature | Reason |
|----------|---------|--------|
| Expensive state updates | `useTransition` | Keep UI responsive |
| Search/filter inputs | `useDeferredValue` | Input stays fast |
| Tab switching | `useTransition` | Previous tab stays visible |
| Navigation | `startTransition` | Show pending state |
| Expensive computation | `useDeferredValue` | Defer calculation |

## Important Notes

- **React 18+ required** for concurrent features
- **Not for all updates** - only expensive/non-urgent ones
- **Still need useMemo** - concurrent features don't replace memoization
- **Test thoroughly** - behavior is different from React 17

## Exceptions

Do NOT apply this rule when:

1. **Simple updates**: Fast state changes don't need transitions
2. **Critical updates**: User must see result immediately
3. **React 17 or earlier**: Concurrent features not available
4. **Small lists**: Overhead not worth it for < 100 items

## Related Rules

- [render-suspense](./render-suspense.md) - Suspense boundaries
- [rerender-memo-usage](./rerender-memo-usage.md) - Memoization

## References

- [React Docs: useTransition](https://react.dev/reference/react/useTransition)
- [React Docs: useDeferredValue](https://react.dev/reference/react/useDeferredValue)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Expensive filter blocking input responsiveness |
| **90-94** | Tab switch causing visible lag |
| **85-89** | Heavy re-render blocking user interaction |
| **80-84** | Update that would benefit from transitions |
| **<80** | **DO NOT REPORT** - update is fast enough |
