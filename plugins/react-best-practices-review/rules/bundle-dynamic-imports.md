---
title: Dynamic Imports for Large Components
impact: HIGH
impactDescription: Load heavy components only when needed
tags: [bundle, performance, dynamic-import, lazy]
appliesTo: [next.js, react, vite]
relatedAgent: bundle-analyzer
---

# Dynamic Imports for Large Components

## Problem

Large components that aren't immediately visible (modals, dropdowns, charts) are statically imported, adding to the initial bundle even when users may never interact with them.

## Detection Signals

- Static imports for modal/dialog components
- Heavy visualization libraries imported at top level
- Admin/settings panels imported in main bundle
- Components over 50KB imported statically

## ❌ Bad Pattern

```tsx
// Top-level imports for conditionally rendered components
import AdminPanel from './AdminPanel';      // 200KB
import ChartLibrary from './ChartLibrary';  // 150KB
import PDFViewer from './PDFViewer';        // 300KB
import RichTextEditor from './RichTextEditor';  // 250KB

function Dashboard() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>
      <MainContent />

      {/* These may never be shown! */}
      {showAdmin && <AdminPanel />}
      {showPDF && <PDFViewer />}

      <button onClick={() => setShowAdmin(true)}>Admin</button>
    </div>
  );
}
// Initial bundle includes all 900KB of conditionally-rendered code!
```

**Why this is problematic**:
- Heavy components loaded even if never used
- Increases initial bundle significantly
- Slows down Time to Interactive

## ✅ Good Pattern

```tsx
import { lazy, Suspense, useState } from 'react';

// Dynamic imports - only loaded when needed
const AdminPanel = lazy(() => import('./AdminPanel'));
const ChartLibrary = lazy(() => import('./ChartLibrary'));
const PDFViewer = lazy(() => import('./PDFViewer'));
const RichTextEditor = lazy(() => import('./RichTextEditor'));

function Dashboard() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPDF, setShowPDF] = useState(false);

  return (
    <div>
      <MainContent />

      {showAdmin && (
        <Suspense fallback={<AdminSkeleton />}>
          <AdminPanel />
        </Suspense>
      )}

      {showPDF && (
        <Suspense fallback={<PDFSkeleton />}>
          <PDFViewer />
        </Suspense>
      )}

      <button onClick={() => setShowAdmin(true)}>Admin</button>
    </div>
  );
}
// Initial bundle: only core code. Components load on-demand.
```

```tsx
// Next.js with next/dynamic
import dynamic from 'next/dynamic';

const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <AdminSkeleton />,
  ssr: false  // Skip SSR for client-only component
});

const ChartLibrary = dynamic(
  () => import('./ChartLibrary'),
  { ssr: false }  // Charts often don't need SSR
);
```

**Why this is better**:
- Initial bundle stays small
- Components load only when triggered
- Better user experience for initial load

## Performance Impact

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Initial Bundle | 1MB | 100KB | -900KB (90%) |
| Initial Load (3G) | 8s | 1s | -7s |
| Admin Panel (on click) | 0ms | 200ms | Acceptable trade-off |

## When to Use Dynamic Imports

| Component Type | Recommendation |
|----------------|----------------|
| Modals/Dialogs | ✅ Always dynamic |
| Charts/Graphs | ✅ Always dynamic |
| Rich Text Editors | ✅ Always dynamic |
| PDF Viewers | ✅ Always dynamic |
| Admin Panels | ✅ Always dynamic |
| Below-fold Content | 🔶 Consider dynamic |
| Core UI Components | ❌ Keep static |

## Implementation Patterns

### 1. Basic React.lazy
```tsx
const Modal = lazy(() => import('./Modal'));
```

### 2. With Loading State
```tsx
<Suspense fallback={<ModalSkeleton />}>
  {isOpen && <Modal />}
</Suspense>
```

### 3. Preload on Hover (Better UX)
```tsx
const Modal = lazy(() => import('./Modal'));

// Preload function
const preloadModal = () => import('./Modal');

function Button() {
  return (
    <button
      onMouseEnter={preloadModal}
      onClick={() => setIsOpen(true)}
    >
      Open Modal
    </button>
  );
}
```

### 4. Named Exports
```tsx
const MyComponent = lazy(() =>
  import('./module').then(m => ({ default: m.MyComponent }))
);
```

### 5. Error Boundary
```tsx
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <HeavyComponent />
  </Suspense>
</ErrorBoundary>
```

## Exceptions

Do NOT apply this rule when:

1. **Frequently used components**: If shown on initial render
2. **Small components**: < 10KB, overhead not worth it
3. **Critical path**: Must be available immediately
4. **SSR requirements**: Some components need server rendering

## Related Rules

- [bundle-code-splitting](./bundle-code-splitting.md) - Route-level splitting
- [bundle-tree-shaking](./bundle-tree-shaking.md) - Remove unused code

## References

- [React Docs: lazy](https://react.dev/reference/react/lazy)
- [Next.js Docs: Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Vite: Dynamic Import](https://vitejs.dev/guide/features.html#dynamic-import)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Static import of 200KB+ modal/chart component |
| **90-94** | Static import of 100KB+ conditionally-rendered component |
| **85-89** | Multiple 50KB+ components that could be lazy |
| **80-84** | Conditionally-rendered component without lazy loading |
| **<80** | **DO NOT REPORT** - component is small or always shown |
