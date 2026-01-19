# React Best Practices Rules Index

> Comprehensive rules based on Vercel React Best Practices

Rules are organized by impact level. Higher impact rules should be prioritized first.

---

## Section 1: Async Waterfall Removal (CRITICAL)

> **Request waterfalls are the biggest performance killer**
>
> A 600ms waterfall negates all other optimizations. Fix these first.

| Rule | Impact | Description |
|------|--------|-------------|
| [async-parallel-requests](./async-parallel-requests.md) | CRITICAL | Parallel data fetching with Promise.all |
| [async-data-preloading](./async-data-preloading.md) | CRITICAL | Preload data before it's needed |
| [async-streaming](./async-streaming.md) | HIGH | Stream responses for faster TTFB |

**Agent**: `async-waterfall-hunter`

---

## Section 2: Bundle Size Optimization (CRITICAL-HIGH)

> **JavaScript overhead affects all users**
>
> Every 100KB of JS ≈ 1 second on 3G networks.

| Rule | Impact | Description |
|------|--------|-------------|
| [bundle-code-splitting](./bundle-code-splitting.md) | CRITICAL | Route-based code splitting |
| [bundle-tree-shaking](./bundle-tree-shaking.md) | HIGH | Tree shaking optimization |
| [bundle-dynamic-imports](./bundle-dynamic-imports.md) | HIGH | Dynamic imports for large components |

**Agent**: `bundle-analyzer`

---

## Section 3: Server Performance (HIGH)

> **Server-side optimizations for initial load**
>
> Proper caching and streaming dramatically improve TTFB.

| Rule | Impact | Description |
|------|--------|-------------|
| [server-caching](./server-caching.md) | HIGH | Caching strategies for Server Components |
| [server-streaming-ssr](./server-streaming-ssr.md) | HIGH | Streaming SSR with Suspense |
| [server-rsc-patterns](./server-rsc-patterns.md) | HIGH | React Server Component best practices |

**Agent**: `server-performance-reviewer`

---

## Section 4: Client Data Fetching (MEDIUM-HIGH)

> **Efficient client-side data management**
>
> SWR, React Query, and optimistic updates for great UX.

| Rule | Impact | Description |
|------|--------|-------------|
| [client-swr-pattern](./client-swr-pattern.md) | MEDIUM-HIGH | SWR/React Query patterns |
| [client-optimistic-updates](./client-optimistic-updates.md) | MEDIUM-HIGH | Optimistic UI updates |
| [client-prefetching](./client-prefetching.md) | MEDIUM | Data prefetching strategies |

**Agent**: `client-data-reviewer`

---

## Section 5: Rerendering Prevention (MEDIUM)

> **Unnecessary rerenders impact UX**
>
> Jank and slow interactions frustrate users.

| Rule | Impact | Description |
|------|--------|-------------|
| [rerender-memo-usage](./rerender-memo-usage.md) | MEDIUM | Proper memoization |
| [rerender-state-colocation](./rerender-state-colocation.md) | MEDIUM | State colocation |
| [rerender-context-splitting](./rerender-context-splitting.md) | MEDIUM | Context splitting |

**Agent**: `rerender-detector`

**Note**: If using React 19 with React Compiler, memoization rules may not apply.

---

## Section 6: Render Performance (MEDIUM-LOW)

> **Fine-grained render optimizations**
>
> For large lists and complex UIs.

| Rule | Impact | Description |
|------|--------|-------------|
| [render-virtualization](./render-virtualization.md) | MEDIUM | List virtualization |
| [render-suspense](./render-suspense.md) | MEDIUM-LOW | Suspense boundaries |
| [render-concurrent-features](./render-concurrent-features.md) | MEDIUM-LOW | React concurrent features |

**Agent**: `react-pattern-analyzer`

---

## Quick Reference

### Impact Levels

| Level | Color | Description |
|-------|-------|-------------|
| CRITICAL | 🔴 | Must fix - significant performance impact |
| HIGH | 🟠 | Should fix - noticeable impact |
| MEDIUM | 🟡 | Consider fixing - moderate impact |
| LOW | 🔵 | Nice to have - minor improvement |

### Confidence Thresholds by Command

| Command | Threshold | Impact Filter |
|---------|-----------|---------------|
| `/react-review` | ≥80 | ALL |
| `/react-review-quick` | ≥90 | CRITICAL, HIGH |
| `/react-review-pr` | ≥85 | ALL |

---

## Adding New Rules

See [_template.md](./_template.md) for the rule file format.

## References

- [Vercel Blog: React Best Practices](https://vercel.com/blog/introducing-react-best-practices)
- [Next.js Docs: Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Docs: Performance](https://react.dev/learn/thinking-in-react)
