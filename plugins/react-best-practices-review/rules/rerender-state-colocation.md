---
title: State Colocation
impact: MEDIUM
impactDescription: Keep state close to where it's used
tags: [rerender, state, colocation, performance]
appliesTo: [react, next.js]
relatedAgent: rerender-detector
---

# State Colocation

## Problem

State lifted too high in the component tree causes unnecessary re-renders in components that don't use that state. Moving state closer to where it's used reduces re-render scope.

## Detection Signals

- State in parent used only by one child
- Many components re-rendering on state change
- Input fields causing entire page to re-render
- State that could be local but is lifted

## ❌ Bad Pattern

```tsx
function App() {
  // ❌ Search state is too high - only SearchBox and Results need it
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <Header />          {/* Re-renders on every keystroke! */}
      <Sidebar />         {/* Re-renders on every keystroke! */}
      <Navigation />      {/* Re-renders on every keystroke! */}

      <SearchBox value={searchQuery} onChange={setSearchQuery} />
      <SearchResults query={searchQuery} />

      <Footer />          {/* Re-renders on every keystroke! */}
    </div>
  );
}
```

**Why this is problematic**:
- Every keystroke re-renders Header, Sidebar, Navigation, Footer
- These components don't use searchQuery at all
- Wasted CPU cycles on unnecessary re-renders

## ✅ Good Pattern

```tsx
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Navigation />

      {/* State is colocated with components that use it */}
      <SearchSection />

      <Footer />
    </div>
  );
}

// ✅ Search state lives here - only SearchSection re-renders
function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <SearchBox value={searchQuery} onChange={setSearchQuery} />
      <SearchResults query={searchQuery} />
    </>
  );
}
```

**Why this is better**:
- Only SearchSection re-renders on keystroke
- Header, Sidebar, Navigation, Footer are unaffected
- Better performance with same functionality

## State Colocation Principle

> **Keep state as close as possible to where it's used**

```
App                    ← Global state (auth, theme)
├── Header            ← No extra state
├── MainContent       ← Shared content state
│   ├── Sidebar       ← Sidebar-specific state
│   └── Content       ← Content-specific state
│       └── Form      ← Form state lives HERE
└── Footer            ← No extra state
```

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Components re-rendered per keystroke | 6 | 2 | -67% |
| Re-render time | 50ms | 15ms | -70% |
| Input responsiveness | Laggy | Smooth | Noticeable |

## When to Lift vs Colocate

### Keep State Local When:
- Only one component (or small subtree) uses it
- It's UI state (hover, focus, toggle)
- It changes frequently (input values)

### Lift State When:
- Multiple distant components need it
- It needs to sync across components
- It's truly global (auth, theme)

## Common Patterns

### 1. Extract Component with Local State
```tsx
// Before
function Parent() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <OtherStuff />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Button onClick={() => setIsOpen(true)}>Open</Button>
    </div>
  );
}

// After - Modal manages its own open state
function Parent() {
  return (
    <div>
      <OtherStuff />
      <ModalWithTrigger />
    </div>
  );
}

function ModalWithTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

### 2. Composition Pattern
```tsx
// Before - Parent manages child state
function Dashboard() {
  const [filter, setFilter] = useState('all');
  return (
    <div>
      <Stats />
      <FilterBar filter={filter} onChange={setFilter} />
      <DataTable filter={filter} />
    </div>
  );
}

// After - DataSection manages its own state
function Dashboard() {
  return (
    <div>
      <Stats />
      <DataSection />  {/* Contains FilterBar + DataTable */}
    </div>
  );
}
```

### 3. Uncontrolled Components
```tsx
// Instead of lifting form state to parent
function Form({ onSubmit }) {
  // Form manages its own state internally
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />  {/* Uncontrolled */}
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Identifying Colocation Opportunities

Ask these questions:
1. Which components re-render when this state changes?
2. Which of those actually use this state?
3. Can I move state closer to where it's used?

```tsx
// Tool: React DevTools Profiler
// Shows which components re-render and why
```

## Exceptions

Do NOT colocate when:

1. **Multiple components need it**: State must be shared
2. **URL state**: Should be in URL params/query
3. **Persistence needed**: Should be in global store
4. **Cross-tree communication**: Need context or state management

## Related Rules

- [rerender-context-splitting](./rerender-context-splitting.md) - Context splitting
- [rerender-memo-usage](./rerender-memo-usage.md) - Memoization patterns

## References

- [Kent C. Dodds: State Colocation](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [React Docs: Thinking in React](https://react.dev/learn/thinking-in-react)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Input state in root causing 5+ components to re-render |
| **90-94** | State used by single child lifted 2+ levels |
| **85-89** | Local UI state (toggle, hover) lifted unnecessarily |
| **80-84** | State that could be colocated for performance |
| **<80** | **DO NOT REPORT** - state needs to be shared |
