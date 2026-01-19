---
title: Data Prefetching Strategies
impact: MEDIUM
impactDescription: Zero perceived loading time for navigation
tags: [client, prefetch, performance, navigation]
appliesTo: [react, next.js]
relatedAgent: client-data-reviewer
---

# Data Prefetching Strategies

## Problem

Fetching data only when a component mounts creates perceived loading time. Prefetching data before it's needed makes navigation feel instant.

## Detection Signals

- Navigation links without prefetching
- Predictable user flows without data preloading
- Loading spinners on every page navigation
- Data fetch on component mount for predictable content

## ❌ Bad Pattern

```tsx
// ProductList.tsx - No prefetching
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <Link key={product.id} to={`/products/${product.id}`}>
          {product.name}
        </Link>
      ))}
    </ul>
  );
}

// ProductPage.tsx - Fetches only on mount
function ProductPage({ params }) {
  const { data, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => fetchProduct(params.id),
  });

  if (isLoading) return <Loading />;  // User sees this every time!
  return <ProductDetail product={data} />;
}
```

**Why this is problematic**:
- Click → loading spinner → content
- Every navigation shows loading state
- Wasted idle time while user hovers

## ✅ Good Pattern

```tsx
import { useQueryClient } from '@tanstack/react-query';

// ProductList.tsx - Prefetch on hover
function ProductList({ products }) {
  const queryClient = useQueryClient();

  const prefetchProduct = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => fetchProduct(id),
      staleTime: 60 * 1000,  // Consider fresh for 1 minute
    });
  };

  return (
    <ul>
      {products.map(product => (
        <Link
          key={product.id}
          to={`/products/${product.id}`}
          onMouseEnter={() => prefetchProduct(product.id)}
          onFocus={() => prefetchProduct(product.id)}
        >
          {product.name}
        </Link>
      ))}
    </ul>
  );
}

// ProductPage.tsx - Data is already cached!
function ProductPage({ params }) {
  const { data } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => fetchProduct(params.id),
    staleTime: 60 * 1000,
  });

  // No loading state needed - data was prefetched!
  return <ProductDetail product={data} />;
}
```

```tsx
// Next.js - Using router.prefetch
import { useRouter } from 'next/navigation';

function ProductList({ products }) {
  const router = useRouter();

  return (
    <ul>
      {products.map(product => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          onMouseEnter={() => router.prefetch(`/products/${product.id}`)}
        >
          {product.name}
        </Link>
      ))}
    </ul>
  );
}
```

**Why this is better**:
- Data loads while user hovers (~200ms typical hover time)
- Click → instant content
- No loading spinner for prefetched pages

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Navigation Time | 300ms | ~0ms | -300ms |
| Loading Spinners | Every navigation | Rare | Better UX |
| User Perception | "Slow" | "Instant" | Significant |

## Prefetching Strategies

### 1. Hover Prefetch (Most Common)
```tsx
<Link
  to="/page"
  onMouseEnter={() => prefetch('/page')}
  onFocus={() => prefetch('/page')}  // Accessibility!
>
  Navigate
</Link>
```

### 2. Viewport Prefetch (Intersection Observer)
```tsx
function PrefetchOnVisible({ queryKey, queryFn, children }) {
  const ref = useRef();
  const queryClient = useQueryClient();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          queryClient.prefetchQuery({ queryKey, queryFn });
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }  // Prefetch 100px before visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

### 3. Predictive Prefetch (Based on User Behavior)
```tsx
// Prefetch next step in a wizard
function Step1({ goToStep2 }) {
  useEffect(() => {
    // User is likely to go to step 2
    prefetchQuery(['step2-data']);
  }, []);

  return <Step1Content onNext={goToStep2} />;
}
```

### 4. Route Prefetch on Mount
```tsx
useEffect(() => {
  // Prefetch common navigation targets
  router.prefetch('/dashboard');
  router.prefetch('/settings');
  router.prefetch('/profile');
}, []);
```

### 5. Background Prefetch After Idle
```tsx
useEffect(() => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchCommonRoutes();
    });
  }
}, []);
```

## Configuration Tips

### React Query Prefetch Options
```tsx
queryClient.prefetchQuery({
  queryKey: ['product', id],
  queryFn: () => fetchProduct(id),
  staleTime: 60 * 1000,    // Don't refetch if prefetched within 1 min
  gcTime: 5 * 60 * 1000,   // Keep in cache for 5 minutes
});
```

### SWR Preload
```tsx
import { preload } from 'swr';

<Link
  href="/product/1"
  onMouseEnter={() => preload('/api/product/1', fetcher)}
>
  Product
</Link>
```

## Exceptions

Do NOT apply this rule when:

1. **Expensive data**: Prefetching would waste bandwidth
2. **Rapidly changing data**: Would be stale immediately
3. **Low-traffic pages**: Not worth the complexity
4. **Mobile data**: Consider data costs
5. **Unpredictable navigation**: Can't guess what user wants

## Related Rules

- [async-data-preloading](./async-data-preloading.md) - Server-side preloading
- [client-swr-pattern](./client-swr-pattern.md) - Data fetching patterns

## References

- [React Query: Prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
- [Next.js: Prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#prefetching)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | High-traffic list→detail pattern without prefetching |
| **90-94** | Predictable wizard steps without preloading |
| **85-89** | Common navigation pattern without prefetch |
| **80-84** | Pages where prefetching would help UX |
| **<80** | **DO NOT REPORT** - low traffic or unpredictable |
