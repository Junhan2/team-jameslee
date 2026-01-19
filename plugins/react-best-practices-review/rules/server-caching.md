---
title: Server-side Caching Strategies
impact: HIGH
impactDescription: Reduce server load and response time
tags: [server, caching, performance, next.js]
appliesTo: [next.js]
relatedAgent: server-performance-reviewer
---

# Server-side Caching Strategies

## Problem

Without proper caching, every request hits the database or external APIs, causing slow responses and unnecessary server load.

## Detection Signals

- No `cache` or `revalidate` options in fetch calls
- Repeated identical database queries
- Missing `unstable_cache` for non-fetch data
- No request memoization with React `cache()`

## ❌ Bad Pattern

```tsx
// No caching - every request hits the database
async function ProductPage({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });

  return <ProductDetail product={product} />;
}

// No caching on fetch
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`);  // No cache config
  return res.json();
}

// Duplicate fetches in layout and page
async function Layout({ children }) {
  const user = await getUser();  // Fetch #1
  return <Nav user={user}>{children}</Nav>;
}

async function Page() {
  const user = await getUser();  // Fetch #2 - duplicate!
  return <Profile user={user} />;
}
```

**Why this is problematic**:
- Every request queries the database
- No benefit from caching layer
- Duplicate requests waste resources

## ✅ Good Pattern

```tsx
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// React cache() for request deduplication
export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// unstable_cache for database queries with revalidation
export const getProduct = unstable_cache(
  async (id: string) => {
    return db.product.findUnique({ where: { id } });
  },
  ['product'],  // cache key
  {
    revalidate: 3600,  // 1 hour
    tags: ['product']   // for on-demand revalidation
  }
);

// fetch with cache configuration
async function getStaticContent() {
  const res = await fetch('https://api.example.com/content', {
    next: { revalidate: 86400 }  // 24 hours
  });
  return res.json();
}

// fetch for dynamic data
async function getUserCart(userId: string) {
  const res = await fetch(`/api/cart/${userId}`, {
    cache: 'no-store'  // Always fresh
  });
  return res.json();
}
```

**Why this is better**:
- Requests are deduplicated within a render
- Data is cached with appropriate TTL
- Clear strategy for static vs dynamic data

## Caching Strategy Guide

| Data Type | Strategy | Configuration |
|-----------|----------|---------------|
| Static content | Long cache | `revalidate: 86400` (24h) |
| Product listings | Medium cache | `revalidate: 3600` (1h) |
| User-specific | No cache | `cache: 'no-store'` |
| Config/settings | Long cache + tags | `tags: ['config']` |
| Real-time data | No cache | `cache: 'no-store'` |

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| TTFB | 500ms | 50ms | -450ms (90%) |
| Database Load | 100 QPS | 10 QPS | -90% |
| Server Costs | High | Low | Significant savings |

## Implementation Patterns

### 1. React cache() - Request Deduplication
```tsx
import { cache } from 'react';

export const getUser = cache(async () => {
  // Called once per request, even if used in multiple components
  return await db.user.findFirst();
});
```

### 2. Next.js fetch() Caching
```tsx
// Cached by default (static)
const data = await fetch(url);

// Revalidate every hour
const data = await fetch(url, { next: { revalidate: 3600 } });

// Never cache (dynamic)
const data = await fetch(url, { cache: 'no-store' });
```

### 3. unstable_cache for Non-fetch Data
```tsx
import { unstable_cache } from 'next/cache';

export const getCachedData = unstable_cache(
  async () => await heavyComputation(),
  ['cache-key'],
  { revalidate: 60 }
);
```

### 4. On-demand Revalidation
```tsx
// In Server Action or Route Handler
import { revalidateTag, revalidatePath } from 'next/cache';

async function updateProduct(id: string) {
  await db.product.update({ ... });
  revalidateTag('product');  // Invalidate all product caches
  revalidatePath('/products');  // Invalidate specific path
}
```

## Exceptions

Do NOT apply this rule when:

1. **User-specific data**: Cart, preferences, session
2. **Real-time data**: Stock prices, live feeds
3. **Sensitive data**: Authentication tokens
4. **Frequently changing**: Data that changes every minute

## Related Rules

- [server-streaming-ssr](./server-streaming-ssr.md) - Streaming patterns
- [server-rsc-patterns](./server-rsc-patterns.md) - RSC best practices

## References

- [Next.js Docs: Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React Docs: cache](https://react.dev/reference/react/cache)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Duplicate data fetching without React cache() |
| **90-94** | No caching for stable/static data |
| **85-89** | Missing revalidate config for semi-static data |
| **80-84** | Suboptimal cache TTL configuration |
| **<80** | **DO NOT REPORT** - may be intentionally dynamic |
