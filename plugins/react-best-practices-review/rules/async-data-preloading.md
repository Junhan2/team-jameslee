---
title: Data Preloading
impact: CRITICAL
impactDescription: Eliminate perceived loading time
tags: [async, performance, prefetch, preload]
appliesTo: [next.js, react]
relatedAgent: async-waterfall-hunter
---

# Data Preloading

## Problem

Waiting to fetch data until a component mounts creates unnecessary delays. When you can predict what data will be needed, preloading it makes navigation feel instant.

## Detection Signals

- Navigation links without prefetching
- Components that always fetch the same data on mount
- User flows with predictable next steps

## ❌ Bad Pattern

```tsx
// ProductList.tsx - No prefetching
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ProductPage.tsx - Fetches on mount
function ProductPage({ params }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct(params.id).then(setProduct);  // Loading delay!
  }, [params.id]);

  if (!product) return <Loading />;
  return <ProductDetail product={product} />;
}
```

**Why this is problematic**:
- User clicks → loading spinner → data loads
- Perceived as slow even with fast network
- Wasted opportunity to use idle time

## ✅ Good Pattern

```tsx
// ProductList.tsx - Prefetch on hover
function ProductList({ products }) {
  const queryClient = useQueryClient();

  const prefetchProduct = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => fetchProduct(id),
      staleTime: 60 * 1000  // Keep fresh for 1 minute
    });
  };

  return (
    <ul>
      {products.map(product => (
        <li
          key={product.id}
          onMouseEnter={() => prefetchProduct(product.id)}
          onFocus={() => prefetchProduct(product.id)}
        >
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// Next.js App Router - Use generateStaticParams + loading.tsx
// app/products/[id]/page.tsx

export async function generateStaticParams() {
  const products = await getPopularProducts();
  return products.map(p => ({ id: p.id }));
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  return <ProductDetail product={product} />;
}

// app/products/[id]/loading.tsx
export default function Loading() {
  return <ProductSkeleton />;
}
```

**Why this is better**:
- Data is ready when user navigates
- Zero perceived loading time for prefetched pages
- Uses idle time productively

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Navigation Time | 300ms | ~0ms | Instant |
| Perceived Latency | 300ms | 0ms | 100% |
| User Satisfaction | Noticeable wait | Instant feel | Significant |

## Preloading Strategies

### 1. Hover Prefetch (Client-side)
```tsx
onMouseEnter={() => prefetch(id)}
```

### 2. Viewport Prefetch (Intersection Observer)
```tsx
<Link prefetch="viewport" href="/page">Link</Link>
```

### 3. Static Generation (Build-time)
```tsx
export async function generateStaticParams() {
  return popularPages.map(p => ({ id: p.id }));
}
```

### 4. Preload on Mount
```tsx
useEffect(() => {
  // Preload likely next pages
  router.prefetch('/checkout');
  router.prefetch('/cart');
}, []);
```

## Exceptions

Do NOT apply this rule when:

1. **Unpredictable navigation**: User behavior is random
2. **Expensive data**: Preloading would waste bandwidth
3. **Frequently changing data**: Preloaded data would be stale
4. **Low-traffic pages**: Not worth the complexity

## Related Rules

- [async-parallel-requests](./async-parallel-requests.md) - Parallel fetching
- [client-prefetching](./client-prefetching.md) - Client-side prefetching patterns

## References

- [Next.js Docs: Prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#prefetching)
- [React Query: Prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | High-traffic navigation without any prefetching |
| **90-94** | List → detail pattern without prefetch |
| **85-89** | Predictable flow without preloading |
| **80-84** | Moderate traffic page without prefetch |
| **<80** | **DO NOT REPORT** - may not be worth complexity |
