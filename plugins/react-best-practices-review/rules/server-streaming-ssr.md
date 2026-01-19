---
title: Streaming SSR with Suspense
impact: HIGH
impactDescription: Progressive rendering for faster perceived load
tags: [server, streaming, ssr, suspense, performance]
appliesTo: [next.js, react]
relatedAgent: server-performance-reviewer
---

# Streaming SSR with Suspense

## Problem

Traditional SSR blocks until all data is fetched before sending any HTML. Streaming SSR sends HTML progressively as data becomes available.

## Detection Signals

- Server components awaiting slow data without Suspense
- Missing `loading.tsx` files for slow routes
- All-or-nothing page rendering
- High TTFB on data-heavy pages

## ❌ Bad Pattern

```tsx
// app/dashboard/page.tsx - Blocks on all data
async function DashboardPage() {
  // User sees blank page until ALL complete
  const user = await getUser();            // 100ms
  const analytics = await getAnalytics();  // 800ms (slow!)
  const reports = await getReports();      // 500ms

  // TTFB: 1400ms - nothing renders until all data ready

  return (
    <div>
      <UserHeader user={user} />
      <AnalyticsDashboard data={analytics} />
      <ReportsList reports={reports} />
    </div>
  );
}
```

**Why this is problematic**:
- 1.4 second blank screen
- Fast data blocked by slow data
- Poor user experience

## ✅ Good Pattern

```tsx
// app/dashboard/page.tsx - Streaming with Suspense
import { Suspense } from 'react';

async function DashboardPage() {
  // Only critical data awaited
  const user = await getUser();  // 100ms - TTFB

  return (
    <div>
      <UserHeader user={user} />

      {/* Streams when ready */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsList />
      </Suspense>
    </div>
  );
}

// Separate async components fetch their own data
async function AnalyticsDashboard() {
  const analytics = await getAnalytics();  // Streams after 800ms
  return <AnalyticsDisplay data={analytics} />;
}

async function ReportsList() {
  const reports = await getReports();  // Streams after 500ms
  return <ReportsDisplay reports={reports} />;
}
```

```tsx
// app/dashboard/loading.tsx - Route-level loading UI
export default function Loading() {
  return <DashboardSkeleton />;
}
```

**Why this is better**:
- TTFB: 100ms (user header visible)
- Reports stream in at 500ms
- Analytics streams in at 800ms
- Progressive content appearance

## Streaming Timeline

```
Before (Blocking):
[────────────── 1400ms ──────────────|████] First content

After (Streaming):
[100ms|█UserHeader]
      [────500ms────|█Reports]
      [────────800ms────────|█Analytics]
```

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| TTFB | 1400ms | 100ms | -1300ms (93%) |
| LCP | 1800ms | 500ms | -1300ms |
| CLS | Risk of shift | 0 (skeletons) | Stable |

## Implementation Patterns

### 1. Route-level Loading
```
app/
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx    ← Automatic streaming boundary
```

### 2. Component-level Streaming
```tsx
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### 3. Nested Suspense for Granular Streaming
```tsx
<Suspense fallback={<PageSkeleton />}>
  <Layout>
    <Suspense fallback={<NavSkeleton />}>
      <Nav />
    </Suspense>
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  </Layout>
</Suspense>
```

### 4. Streaming with Error Handling
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<DataError />}>
  <Suspense fallback={<DataSkeleton />}>
    <AsyncData />
  </Suspense>
</ErrorBoundary>
```

### 5. Parallel Streaming
```tsx
async function Page() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Both stream independently */}
      <Suspense fallback={<ChartSkeleton />}>
        <Chart1 />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart2 />
      </Suspense>
    </div>
  );
}
```

## Skeleton Design Tips

- Match the layout of the actual content
- Use subtle animation (pulse/shimmer)
- Avoid layout shifts when content loads
- Keep skeletons lightweight

```tsx
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

## Exceptions

Do NOT apply this rule when:

1. **All data is fast**: Total fetch < 100ms
2. **Data dependencies**: Content requires all data together
3. **SEO critical**: Some crawlers don't handle streaming well
4. **Simple pages**: Complexity not worth it

## Related Rules

- [async-streaming](./async-streaming.md) - Streaming patterns
- [server-rsc-patterns](./server-rsc-patterns.md) - RSC best practices

## References

- [Next.js Docs: Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Docs: Suspense](https://react.dev/reference/react/Suspense)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Page awaits 1s+ of data before any render |
| **90-94** | Multiple slow awaits blocking fast content |
| **85-89** | Missing loading.tsx for slow route |
| **80-84** | Page could benefit from streaming |
| **<80** | **DO NOT REPORT** - page is fast enough |
