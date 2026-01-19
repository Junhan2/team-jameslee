---
title: SWR/React Query Patterns
impact: MEDIUM-HIGH
impactDescription: Efficient client-side data management
tags: [client, swr, react-query, caching, data-fetching]
appliesTo: [react, next.js]
relatedAgent: client-data-reviewer
---

# SWR/React Query Patterns

## Problem

Manual data fetching with `useEffect` + `useState` lacks caching, deduplication, and proper loading/error states, leading to poor UX and unnecessary network requests.

## Detection Signals

- `useEffect` with `fetch()` for data loading
- Manual loading/error state management
- No request deduplication (same data fetched multiple times)
- Missing stale-while-revalidate behavior

## ❌ Bad Pattern

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  return <Profile user={user} />;
}

// Problem: If another component needs the same user, it fetches again!
function UserAvatar({ userId }) {
  const [user, setUser] = useState(null);
  // ... same fetch logic, DUPLICATE REQUEST!
}
```

**Why this is problematic**:
- No caching between components
- No background revalidation
- Verbose boilerplate code
- No retry logic
- No optimistic updates

## ✅ Good Pattern

```tsx
// Using React Query
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 2,
  });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  return <Profile user={user} />;
}

// Using SWR
import useSWR from 'swr';

function UserProfile({ userId }) {
  const { data: user, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  return <Profile user={user} />;
}
```

**Why this is better**:
- Automatic caching and deduplication
- Built-in loading/error states
- Background revalidation
- Automatic retry on failure
- Optimistic update support

## Configuration Guidelines

### React Query Configuration
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes fresh
      gcTime: 30 * 60 * 1000,       // 30 minutes in cache
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### SWR Configuration
```tsx
<SWRConfig
  value={{
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    errorRetryCount: 2,
  }}
>
  <App />
</SWRConfig>
```

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Duplicate Requests | Many | 0 | -100% |
| Network Calls | 10/page | 3/page | -70% |
| UX (tab switch) | Loading spinner | Instant | Significant |

## Common Patterns

### 1. Dependent Queries
```tsx
const { data: user } = useQuery(['user', id], () => getUser(id));
const { data: posts } = useQuery(
  ['posts', user?.id],
  () => getPosts(user.id),
  { enabled: !!user }  // Only fetch when user is available
);
```

### 2. Parallel Queries
```tsx
const results = useQueries({
  queries: [
    { queryKey: ['user', 1], queryFn: () => getUser(1) },
    { queryKey: ['user', 2], queryFn: () => getUser(2) },
    { queryKey: ['user', 3], queryFn: () => getUser(3) },
  ]
});
```

### 3. Infinite Queries
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 4. Suspense Integration
```tsx
const { data } = useSuspenseQuery({
  queryKey: ['user', id],
  queryFn: () => getUser(id),
});
// No need to check loading state - Suspense handles it
```

## Exceptions

Do NOT apply this rule when:

1. **Simple one-time fetch**: Data never changes, component unmounts quickly
2. **Server Components**: Use server-side data fetching instead
3. **Static data**: Use `getStaticProps` or build-time fetching
4. **WebSocket/real-time**: Use dedicated real-time libraries

## Related Rules

- [client-optimistic-updates](./client-optimistic-updates.md) - Optimistic UI
- [client-prefetching](./client-prefetching.md) - Prefetching patterns

## References

- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [SWR Docs](https://swr.vercel.app/)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | useEffect + useState for data fetching, data reused elsewhere |
| **90-94** | Complex useEffect fetch with manual loading/error handling |
| **85-89** | Multiple components fetching same data |
| **80-84** | Data fetching without caching strategy |
| **<80** | **DO NOT REPORT** - simple one-time fetch is acceptable |
