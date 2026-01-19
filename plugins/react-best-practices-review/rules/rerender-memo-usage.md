---
title: Proper Memoization
impact: MEDIUM
impactDescription: Prevent unnecessary re-renders
tags: [rerender, memo, useMemo, useCallback, performance]
appliesTo: [react, next.js]
relatedAgent: rerender-detector
---

# Proper Memoization

## Problem

Creating new object/function references on every render causes child components to re-render unnecessarily, even when their actual data hasn't changed.

## ⚠️ React 19 + React Compiler Note

If your project uses **React Compiler** (React 19+), it **automatically memoizes** components and values. Check for:

```json
// package.json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "..."
  }
}
```

**If React Compiler is enabled**, skip manual `useMemo`/`useCallback` unless you have measured performance problems. The compiler handles this automatically.

## Detection Signals

- Inline object/array literals in props
- Inline arrow functions in props
- Expensive computations on every render
- Child components re-rendering when props haven't changed

## ❌ Bad Pattern

```tsx
function Parent({ items }) {
  return (
    <Child
      // ❌ New object every render
      style={{ color: 'red', fontSize: 16 }}

      // ❌ New array every render
      config={['option1', 'option2']}

      // ❌ New function every render
      onClick={() => handleClick()}

      // ❌ New computed value every render
      filtered={items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name))}
    />
  );
}

// Child re-renders on EVERY parent render, even if data is same!
const Child = memo(({ style, config, onClick, filtered }) => {
  return <div>...</div>;
});
```

**Why this is problematic**:
- `memo()` on Child is useless - props are always "new"
- Wasted renders = wasted CPU
- Can cause visible jank on slower devices

## ✅ Good Pattern (Without React Compiler)

```tsx
// Move static values outside component
const buttonStyle = { color: 'red', fontSize: 16 };
const configOptions = ['option1', 'option2'];

function Parent({ items }) {
  // Memoize dynamic values
  const filtered = useMemo(
    () => items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <Child
      style={buttonStyle}
      config={configOptions}
      onClick={handleClick}
      filtered={filtered}
    />
  );
}

// Now memo() actually works!
const Child = memo(({ style, config, onClick, filtered }) => {
  return <div>...</div>;
});
```

**Why this is better**:
- Stable references prevent unnecessary re-renders
- `memo()` can now skip renders effectively
- Expensive computations run only when dependencies change

## Performance Impact

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Re-renders per parent update | 10 | 1 | -90% |
| Expensive computation | Every render | When needed | Significant |
| Frame drops | Frequent | Rare | Smoother UX |

## When to Memoize

| Scenario | Memoize? |
|----------|----------|
| Expensive computation (O(n²), sorting large arrays) | ✅ Yes |
| Props to memoized child components | ✅ Yes |
| Callbacks passed to children | 🔶 Usually |
| Simple values (strings, numbers, booleans) | ❌ No |
| With React Compiler | ❌ Automatic |

## Memoization Patterns

### 1. useMemo for Computed Values
```tsx
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### 2. useCallback for Functions
```tsx
const handleSubmit = useCallback((data) => {
  submitForm(data);
}, [submitForm]);
```

### 3. Static Values Outside Component
```tsx
const STYLES = { padding: 16, margin: 8 };
const OPTIONS = ['A', 'B', 'C'];

function Component() {
  return <Child style={STYLES} options={OPTIONS} />;
}
```

### 4. memo() for Child Components
```tsx
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  // Only re-renders when data actually changes
  return <ComplexVisualization data={data} />;
});
```

### 5. Custom Comparison with memo
```tsx
const Child = memo(
  function Child({ user }) {
    return <Profile user={user} />;
  },
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

## Common Mistakes

### ❌ Memoizing Simple Values
```tsx
// Unnecessary - primitives are already cheap to compare
const id = useMemo(() => props.id, [props.id]);
```

### ❌ Empty Dependency Arrays
```tsx
// Stale closure - handleClick always uses initial count
const handleClick = useCallback(() => {
  console.log(count);  // Always logs initial value!
}, []);  // Missing count dependency!
```

### ❌ Over-memoization
```tsx
// Every value memoized is overhead
const name = useMemo(() => user.name, [user.name]);
const age = useMemo(() => user.age, [user.age]);
// Just use user.name and user.age directly!
```

## Exceptions

Do NOT apply this rule when:

1. **React Compiler enabled**: It handles memoization automatically
2. **Simple components**: No performance issue measured
3. **Primitive props**: Strings, numbers, booleans don't need memoization
4. **Unmemoized children**: Memoizing props is pointless if child isn't memoized

## Related Rules

- [rerender-state-colocation](./rerender-state-colocation.md) - State colocation
- [rerender-context-splitting](./rerender-context-splitting.md) - Context splitting

## References

- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: useCallback](https://react.dev/reference/react/useCallback)
- [React Docs: memo](https://react.dev/reference/react/memo)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Inline objects/functions to expensive memoized child |
| **90-94** | Expensive computation without useMemo |
| **85-89** | Inline props causing obvious re-renders |
| **80-84** | Memoization opportunity for performance |
| **<80** | **DO NOT REPORT** - likely handled by React Compiler or not impactful |
