---
title: List Virtualization
impact: MEDIUM
impactDescription: Render only visible items in large lists
tags: [render, virtualization, performance, lists]
appliesTo: [react, next.js]
relatedAgent: react-pattern-analyzer
---

# List Virtualization

## Problem

Rendering thousands of list items creates thousands of DOM nodes, causing slow initial render, high memory usage, and janky scrolling.

## Detection Signals

- Lists with 100+ items rendered at once
- Slow initial render of list pages
- High memory usage on list views
- Janky scrolling on large lists
- `.map()` over large arrays in render

## ❌ Bad Pattern

```tsx
function ProductList({ products }) {
  // ❌ Renders ALL 10,000 items immediately
  return (
    <ul>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  );
}
// 10,000 DOM nodes created!
// Initial render: 2-5 seconds
// Memory: 500MB+
```

**Why this is problematic**:
- Browser must create 10,000 DOM nodes
- JavaScript must process 10,000 items
- Memory usage explodes
- Initial render takes seconds

## ✅ Good Pattern

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function ProductList({ products }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,  // Estimated row height
    overscan: 5,  // Render 5 extra items above/below
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProductCard product={products[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
// Only ~15 DOM nodes (visible + overscan)!
// Initial render: <100ms
// Memory: ~50MB
```

```tsx
// Using react-window (simpler API)
import { FixedSizeList } from 'react-window';

function ProductList({ products }) {
  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={products.length}
      itemSize={100}  // Fixed row height
    >
      {({ index, style }) => (
        <div style={style}>
          <ProductCard product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Why this is better**:
- Only renders visible items (~10-20 instead of 10,000)
- Constant memory usage regardless of list size
- Fast initial render
- Smooth scrolling

## Performance Impact

| Metric | Before (10K items) | After | Improvement |
|--------|-------------------|-------|-------------|
| DOM Nodes | 10,000 | ~15 | -99.85% |
| Initial Render | 3s | 100ms | -97% |
| Memory | 500MB | 50MB | -90% |
| Scroll FPS | 10-30 | 60 | 100-500% |

## When to Virtualize

| List Size | Virtualize? |
|-----------|-------------|
| < 50 items | ❌ No - overhead not worth it |
| 50-100 items | 🔶 Maybe - test performance |
| 100-500 items | ✅ Yes - noticeable improvement |
| 500+ items | ✅ Definitely - required for good UX |

## Virtualization Libraries

| Library | Best For | Notes |
|---------|----------|-------|
| @tanstack/react-virtual | Most cases | Headless, flexible |
| react-window | Simple lists | Easy API, smaller bundle |
| react-virtuoso | Complex lists | Auto-sizing, grouping |
| react-virtualized | Legacy projects | Feature-rich but older |

## Common Patterns

### 1. Fixed Size List
```tsx
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}  // All items same height
>
  {Row}
</FixedSizeList>
```

### 2. Variable Size List
```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: (index) => items[index].height,
  measureElement: (el) => el.getBoundingClientRect().height,
});
```

### 3. Grid Virtualization
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: Math.ceil(items.length / COLUMNS),
  // ...
});

const columnVirtualizer = useVirtualizer({
  count: COLUMNS,
  horizontal: true,
  // ...
});
```

### 4. Infinite Scroll
```tsx
function InfiniteList({ fetchNextPage, hasNextPage }) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <VirtualList>
      {items.map(...)}
      <div ref={ref} />  {/* Trigger for loading more */}
    </VirtualList>
  );
}
```

## Gotchas

### Dynamic Heights
- Use `measureElement` for accurate measurements
- Provide good `estimateSize` to reduce jumping

### Maintaining Scroll Position
- Store scroll position before updates
- Restore after data changes

### Keyboard Navigation
- Handle arrow keys manually
- Ensure focused items are in viewport

## Exceptions

Do NOT virtualize when:

1. **Small lists**: < 50 items, overhead not worth it
2. **SEO requirements**: Crawlers may not see virtualized content
3. **Print requirements**: Users need to print full list
4. **Complex interactions**: Drag-drop may be harder

## Related Rules

- [render-suspense](./render-suspense.md) - Suspense boundaries
- [rerender-memo-usage](./rerender-memo-usage.md) - Memoization

## References

- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [react-window](https://react-window.vercel.app/)
- [react-virtuoso](https://virtuoso.dev/)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | List with 1000+ items rendered without virtualization |
| **90-94** | List with 500+ items causing visible performance issues |
| **85-89** | List with 100+ items without virtualization |
| **80-84** | Large list that would benefit from virtualization |
| **<80** | **DO NOT REPORT** - list is small enough |
