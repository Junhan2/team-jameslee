---
title: Parallel Data Fetching
impact: CRITICAL
impactDescription: 600ms waterfall → 200ms parallel
tags: [async, performance, data-fetching, waterfall]
appliesTo: [next.js, react]
relatedAgent: async-waterfall-hunter
---

# Parallel Data Fetching

## Problem

Sequential await statements create request waterfalls, blocking the event loop and dramatically slowing page loads. Independent requests that could run simultaneously are executed one after another.

## Detection Signals

- Multiple `await` statements in sequence without data dependencies
- `useEffect` with nested `.then()` chains
- Server components with sequential `await` calls for independent data

## ❌ Bad Pattern

```tsx
async function Dashboard({ userId }) {
  // Each request waits for the previous to complete
  const user = await getUser(userId);      // 200ms
  const posts = await getPosts(userId);    // 200ms (doesn't need user!)
  const stats = await getStats(userId);    // 200ms (doesn't need user or posts!)
  // Total: 600ms

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

**Why this is problematic**:
- Total wait time is sum of all requests
- Each request blocks the next from starting
- Server sits idle while waiting for each response

## ✅ Good Pattern

```tsx
async function Dashboard({ userId }) {
  // All requests start simultaneously
  const [user, posts, stats] = await Promise.all([
    getUser(userId),
    getPosts(userId),
    getStats(userId)
  ]);
  // Total: 200ms (slowest request)

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

**Why this is better**:
- Total wait time is only the slowest request
- All requests start at the same time
- Optimal use of network bandwidth

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Data Fetch Time | 600ms | 200ms | -400ms (67%) |
| Time to Interactive | 1.2s | 0.8s | -400ms |
| Server Response Time | 600ms | 200ms | -400ms |

## Exceptions

Do NOT apply this rule when:

1. **True data dependencies**: Request B genuinely needs data from Request A
   ```tsx
   const user = await getUser(id);
   const permissions = await getPermissions(user.roleId);  // Needs user.roleId
   ```

2. **Rate-limited APIs**: API requires sequential calls
   ```tsx
   // API allows only 1 request per second
   await apiCall1();
   await delay(1000);
   await apiCall2();
   ```

3. **Intentional sequential processing**: Explicitly documented reason
   ```tsx
   // Order creation must complete before payment processing
   const order = await createOrder(items);
   const payment = await processPayment(order.id);
   ```

## Related Rules

- [async-data-preloading](./async-data-preloading.md) - Preload data before navigation
- [async-streaming](./async-streaming.md) - Stream responses for faster TTFB

## References

- [Vercel Blog: React Best Practices](https://vercel.com/blog/introducing-react-best-practices)
- [MDN: Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | 3+ sequential awaits with no data dependencies |
| **90-94** | 2 sequential awaits with no data dependencies |
| **85-89** | Nested .then() chains in useEffect |
| **80-84** | Sequential awaits, dependencies unclear |
| **<80** | **DO NOT REPORT** - may have valid dependencies |
