---
title: Suspense Boundaries
impact: MEDIUM-LOW
impactDescription: Better loading states and error isolation
tags: [render, suspense, loading, error-handling]
appliesTo: [react, next.js]
relatedAgent: react-pattern-analyzer
---

# Suspense Boundaries

## Problem

Without Suspense boundaries, a single loading component blocks the entire page. With Suspense, you can show partial content while other parts load.

## Detection Signals

- Single loading state for entire page
- Manual `isLoading` checks throughout components
- No `loading.tsx` files in Next.js App Router
- Error in one component crashes entire page

## ❌ Bad Pattern

```tsx
function Dashboard() {
  const { data: user, isLoading: userLoading } = useQuery(['user'], getUser);
  const { data: posts, isLoading: postsLoading } = useQuery(['posts'], getPosts);
  const { data: stats, isLoading: statsLoading } = useQuery(['stats'], getStats);

  // ❌ Single loading state blocks everything
  if (userLoading || postsLoading || statsLoading) {
    return <FullPageLoading />;  // Nothing shows until ALL data loads
  }

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

**Why this is problematic**:
- User sees nothing until slowest request completes
- Can't interact with any part of the page
- One slow API blocks entire experience

## ✅ Good Pattern

```tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

function Dashboard() {
  return (
    <div>
      {/* Each section loads independently */}
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile />
      </Suspense>

      <Suspense fallback={<PostsListSkeleton />}>
        <PostsList />
      </Suspense>

      <Suspense fallback={<StatsPanelSkeleton />}>
        <StatsPanel />
      </Suspense>
    </div>
  );
}

// Components use useSuspenseQuery - suspense handles loading
function UserProfile() {
  const { data: user } = useSuspenseQuery(['user'], getUser);
  return <Profile user={user} />;
}

function PostsList() {
  const { data: posts } = useSuspenseQuery(['posts'], getPosts);
  return <Posts posts={posts} />;
}
```

```tsx
// Next.js App Router - file-based Suspense
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </div>
  );
}
```

**Why this is better**:
- Content appears progressively
- Fast sections show immediately
- Users can start interacting sooner

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time to first content | 2s | 200ms | -90% |
| User can interact | After 2s | After 200ms | -90% |
| Perceived performance | Slow | Fast | Significant |

## Suspense Boundary Strategies

### 1. Route-level (Next.js loading.tsx)
```
app/
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx    ← Route-level loading
```

### 2. Section-level (Component boundaries)
```tsx
<main>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</main>
```

### 3. List-item level
```tsx
<ul>
  {items.map(item => (
    <Suspense key={item.id} fallback={<ItemSkeleton />}>
      <ListItem item={item} />
    </Suspense>
  ))}
</ul>
```

### 4. With Error Boundaries
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

## Skeleton Design Tips

```tsx
// Match the layout of actual content
function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-lg p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

// Avoid layout shifts
function ProfileSkeleton() {
  return (
    <div className="w-[200px] h-[100px]">  {/* Fixed dimensions */}
      <div className="animate-pulse">...</div>
    </div>
  );
}
```

## Common Patterns

### Nested Suspense
```tsx
<Suspense fallback={<PageSkeleton />}>
  <Page>
    <Suspense fallback={<ChartSkeleton />}>
      <Chart />
    </Suspense>
  </Page>
</Suspense>
// Outer catches Page, inner catches Chart
```

### Suspense with Transitions
```tsx
const [isPending, startTransition] = useTransition();

function handleTabChange(tab) {
  startTransition(() => {
    setActiveTab(tab);  // Doesn't trigger Suspense fallback
  });
}
```

### SuspenseList (Experimental)
```tsx
<SuspenseList revealOrder="forwards">
  <Suspense fallback={<Skeleton />}>
    <Item1 />
  </Suspense>
  <Suspense fallback={<Skeleton />}>
    <Item2 />
  </Suspense>
</SuspenseList>
// Items reveal in order, not as they load
```

## Exceptions

Do NOT apply this rule when:

1. **Content must load together**: Data dependencies require all-or-nothing
2. **SEO concerns**: Some crawlers don't execute Suspense
3. **Simple pages**: Single small fetch doesn't need boundaries
4. **Print layouts**: Users printing need full content

## Related Rules

- [server-streaming-ssr](./server-streaming-ssr.md) - Server-side streaming
- [render-concurrent-features](./render-concurrent-features.md) - Concurrent React

## References

- [React Docs: Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Docs: Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Single loading state blocking 3+ independent sections |
| **90-94** | Missing loading.tsx for slow Next.js route |
| **85-89** | Manual isLoading checks that could use Suspense |
| **80-84** | Page that would benefit from progressive loading |
| **<80** | **DO NOT REPORT** - simple page or already optimized |
