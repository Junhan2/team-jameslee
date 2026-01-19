---
title: Streaming Responses
impact: HIGH
impactDescription: Show content progressively, reduce TTFB
tags: [async, streaming, performance, ssr]
appliesTo: [next.js, react]
relatedAgent: async-waterfall-hunter
---

# Streaming Responses

## Problem

Traditional SSR waits for all data before sending any HTML. With streaming, you can send HTML progressively as data becomes available, dramatically improving Time to First Byte (TTFB).

## Detection Signals

- Server components that `await` slow data before rendering anything
- Pages with no loading states
- Large pages that block rendering on slow queries

## ❌ Bad Pattern

```tsx
// app/dashboard/page.tsx - Blocks on all data
async function Dashboard() {
  // ALL data must load before ANY HTML is sent
  const user = await getUser();          // 100ms
  const analytics = await getAnalytics(); // 500ms (slow!)
  const notifications = await getNotifications(); // 200ms
  // TTFB: 800ms - user sees nothing for 800ms

  return (
    <div>
      <Header user={user} />
      <AnalyticsPanel data={analytics} />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

**Why this is problematic**:
- User sees blank page for 800ms
- Fast content (Header) blocked by slow content (Analytics)
- Poor Core Web Vitals (high TTFB, LCP)

## ✅ Good Pattern

```tsx
// app/dashboard/page.tsx - Streaming with Suspense
import { Suspense } from 'react';

async function Dashboard() {
  const user = await getUser();  // Only wait for critical data

  return (
    <div>
      <Header user={user} />

      {/* Stream analytics when ready */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsPanel />
      </Suspense>

      {/* Stream notifications when ready */}
      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}

// Separate async components
async function AnalyticsPanel() {
  const analytics = await getAnalytics();  // 500ms
  return <AnalyticsDisplay data={analytics} />;
}

async function NotificationList() {
  const notifications = await getNotifications();  // 200ms
  return <NotificationDisplay notifications={notifications} />;
}
```

**Why this is better**:
- TTFB: ~100ms (only waits for user data)
- Header visible immediately
- Analytics streams in after 500ms
- Notifications stream in after 200ms
- Progressive content appearance

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| TTFB | 800ms | 100ms | -700ms (87%) |
| LCP | 1.2s | 500ms | -700ms |
| Perceived Speed | Slow | Fast | Significant |

## Streaming Timeline

```
Before (Blocking):
[------------ 800ms ------------|====]  First paint at 800ms

After (Streaming):
[100ms|====][---200ms---|====][------500ms------|====]
      ^Header    ^Notifications        ^Analytics
```

## Implementation Tips

### 1. loading.tsx for Route-level Streaming
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

### 2. Nested Suspense for Granular Streaming
```tsx
<Suspense fallback={<PageSkeleton />}>
  <Page>
    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar />
    </Suspense>
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  </Page>
</Suspense>
```

### 3. Error Boundaries with Streaming
```tsx
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

## Exceptions

Do NOT apply this rule when:

1. **All data is fast**: If total data fetch < 100ms, streaming adds complexity without benefit
2. **Data dependencies**: Content depends on all data being present
3. **SEO requirements**: Some crawlers don't execute JavaScript streaming
4. **Simple pages**: Overhead not worth it for small pages

## Related Rules

- [server-streaming-ssr](./server-streaming-ssr.md) - Server-side streaming patterns
- [render-suspense](./render-suspense.md) - Suspense boundary patterns

## References

- [Next.js Docs: Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Docs: Suspense for Data Fetching](https://react.dev/reference/react/Suspense)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Page awaits 500ms+ data before any render |
| **90-94** | Multiple slow awaits without Suspense |
| **85-89** | Single slow await blocking fast content |
| **80-84** | Missing loading.tsx for slow page |
| **<80** | **DO NOT REPORT** - data is fast enough |
