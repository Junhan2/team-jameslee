---
title: Route-based Code Splitting
impact: CRITICAL
impactDescription: Load only the code needed for current route
tags: [bundle, performance, code-splitting, lazy]
appliesTo: [next.js, react, vite]
relatedAgent: bundle-analyzer
---

# Route-based Code Splitting

## Problem

Loading all JavaScript upfront means users download code for pages they may never visit. Route-based code splitting ensures users only download code for the current page.

## Detection Signals

- Large initial bundle (> 200KB gzipped)
- Static imports for route components
- No `React.lazy()` or `next/dynamic` usage

## ❌ Bad Pattern

```tsx
// App.tsx - All routes loaded upfront
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';     // 100KB
import AdminPanel from './pages/AdminPanel';   // 200KB (most users never visit!)
import Settings from './pages/Settings';       // 50KB
import Reports from './pages/Reports';         // 150KB (complex charts)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}
// Initial bundle: 500KB+ (all pages loaded!)
```

**Why this is problematic**:
- Users download code for pages they'll never visit
- Slow initial load especially on mobile
- Admin/Reports code loaded for regular users

## ✅ Good Pattern

```tsx
// App.tsx - Lazy loaded routes
import { lazy, Suspense } from 'react';
import Home from './pages/Home';  // Only Home is always needed

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={
        <Suspense fallback={<PageSkeleton />}>
          <Dashboard />
        </Suspense>
      } />
      <Route path="/admin" element={
        <Suspense fallback={<PageSkeleton />}>
          <AdminPanel />
        </Suspense>
      } />
      <Route path="/settings" element={
        <Suspense fallback={<PageSkeleton />}>
          <Settings />
        </Suspense>
      } />
      <Route path="/reports" element={
        <Suspense fallback={<PageSkeleton />}>
          <Reports />
        </Suspense>
      } />
    </Routes>
  );
}
// Initial bundle: ~50KB (only Home + core)
```

```tsx
// Next.js - Automatic code splitting
// Each file in app/ is automatically code-split

// For heavy client components, use next/dynamic
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false  // Skip SSR for client-only components
});
```

**Why this is better**:
- Initial bundle only includes needed code
- Other pages loaded on-demand
- Faster initial load for all users

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial JS | 500KB | 50KB | -450KB (90%) |
| Initial Load | 3s (3G) | 0.5s (3G) | -2.5s |
| TTI | 4s | 1s | -3s |

## Implementation Patterns

### 1. React.lazy (Standard React)
```tsx
const Component = lazy(() => import('./Component'));
```

### 2. next/dynamic (Next.js)
```tsx
const Component = dynamic(() => import('./Component'), {
  loading: () => <Skeleton />,
  ssr: false  // Optional: skip SSR
});
```

### 3. Named Exports
```tsx
// If component uses named export
const Component = lazy(() =>
  import('./Component').then(module => ({ default: module.MyComponent }))
);
```

### 4. Preload on Hover
```tsx
const Dashboard = lazy(() => import('./Dashboard'));

function NavLink() {
  const preload = () => import('./Dashboard');

  return (
    <Link
      to="/dashboard"
      onMouseEnter={preload}
      onFocus={preload}
    >
      Dashboard
    </Link>
  );
}
```

## Exceptions

Do NOT apply this rule when:

1. **Very small components**: < 5KB, overhead not worth it
2. **Frequently visited pages**: If 90% of users visit, keep in initial bundle
3. **Critical path components**: Must be available immediately
4. **SEO-critical pages**: May need SSR without lazy loading

## Related Rules

- [bundle-dynamic-imports](./bundle-dynamic-imports.md) - Component-level splitting
- [bundle-tree-shaking](./bundle-tree-shaking.md) - Remove unused code

## References

- [React Docs: Code Splitting](https://react.dev/reference/react/lazy)
- [Next.js Docs: Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Static imports for large (100KB+) route components |
| **90-94** | No lazy loading for admin/settings routes |
| **85-89** | Large initial bundle with multiple routes |
| **80-84** | Some routes could benefit from splitting |
| **<80** | **DO NOT REPORT** - routes are small enough |
