---
title: Context Splitting
impact: MEDIUM
impactDescription: Prevent context consumers from unnecessary re-renders
tags: [rerender, context, performance, state-management]
appliesTo: [react, next.js]
relatedAgent: rerender-detector
---

# Context Splitting

## Problem

A single context containing both frequently-changing and rarely-changing values causes all consumers to re-render on any change, even if they only use the stable values.

## Detection Signals

- Single context with mixed update frequencies
- Components re-rendering on unrelated context changes
- Context containing both state and dispatch/setters
- Context with user data + UI state + notifications

## ❌ Bad Pattern

```tsx
// ❌ Single context with mixed update frequencies
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);           // Rarely changes
  const [theme, setTheme] = useState('light');      // Rarely changes
  const [notifications, setNotifications] = useState([]);  // Changes often!
  const [isOnline, setIsOnline] = useState(true);   // Changes occasionally

  // Every change to ANY value re-renders ALL consumers
  return (
    <AppContext.Provider value={{
      user, setUser,
      theme, setTheme,
      notifications, setNotifications,
      isOnline, setIsOnline,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ❌ This component only needs theme, but re-renders on notification changes!
function Header() {
  const { theme } = useContext(AppContext);
  return <header className={theme}>...</header>;
}
```

**Why this is problematic**:
- New notification → Header re-renders (doesn't use notifications!)
- All context consumers re-render on any value change
- Performance degrades as context grows

## ✅ Good Pattern

```tsx
// ✅ Split contexts by update frequency
const UserContext = createContext();      // Rarely changes
const ThemeContext = createContext();     // Rarely changes
const NotificationContext = createContext();  // Changes often
const OnlineStatusContext = createContext();  // Changes occasionally

function AppProvider({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <OnlineStatusProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </OnlineStatusProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// Now Header only re-renders when theme changes
function Header() {
  const { theme } = useContext(ThemeContext);
  return <header className={theme}>...</header>;
}

// NotificationBadge only re-renders when notifications change
function NotificationBadge() {
  const { notifications } = useContext(NotificationContext);
  return <Badge count={notifications.length} />;
}
```

**Why this is better**:
- Consumers only re-render when their specific data changes
- Frequently-changing values isolated from stable values
- Better performance at scale

## Context Splitting Strategies

### 1. Split by Update Frequency
```
Rarely changes:    UserContext, ThemeContext, ConfigContext
Occasionally:      OnlineStatusContext, PermissionsContext
Frequently:        NotificationContext, CartContext, FormContext
```

### 2. Split State from Dispatch
```tsx
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components that only dispatch don't re-render on state changes!
function AddButton() {
  const dispatch = useContext(DispatchContext);  // Stable reference
  return <button onClick={() => dispatch({ type: 'ADD' })}>Add</button>;
}
```

### 3. Selective Context Consumption
```tsx
// Create a selector hook
function useUser() {
  const { user } = useContext(AppContext);
  return user;
}

// Even better: use a library like use-context-selector
import { createContext, useContextSelector } from 'use-context-selector';

function UserName() {
  // Only re-renders when user.name changes!
  const name = useContextSelector(AppContext, (ctx) => ctx.user.name);
  return <span>{name}</span>;
}
```

### 4. Memoize Context Value
```tsx
function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  // Memoize the value object
  const value = useMemo(() => ({
    user,
    setUser,
  }), [user]);  // Only creates new object when user changes

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

## Performance Impact

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Components re-rendered on notification | All consumers | Only NotificationBadge | -90% |
| Header re-renders per minute | 60+ | 0-1 | Significant |
| Context update propagation | All providers | Single provider | Isolated |

## When to Split vs When to Combine

### Split When:
- Values have different update frequencies
- Many consumers use only part of context
- Performance profiling shows unnecessary re-renders

### Keep Combined When:
- All values change together
- Only a few consumers exist
- Simplicity is more valuable than micro-optimization

## Common Patterns

### Auth + UI State
```tsx
// ❌ Combined
const AppContext = createContext({ user, theme, notifications });

// ✅ Split
const AuthContext = createContext({ user });
const UIContext = createContext({ theme });
const NotificationContext = createContext({ notifications });
```

### Store Pattern (Zustand/Jotai)
```tsx
// These libraries have built-in selectors
const useStore = create((set) => ({
  user: null,
  notifications: [],
}));

// Only re-renders when user changes
const user = useStore((state) => state.user);
```

## Exceptions

Do NOT split when:

1. **Few consumers**: Overhead of multiple contexts not worth it
2. **Values always change together**: No benefit from splitting
3. **Simple app**: Premature optimization
4. **Using state library**: Zustand/Jotai/Redux handle this better

## Related Rules

- [rerender-state-colocation](./rerender-state-colocation.md) - State colocation
- [rerender-memo-usage](./rerender-memo-usage.md) - Memoization patterns

## References

- [React Docs: Context](https://react.dev/learn/passing-data-deeply-with-context)
- [use-context-selector](https://github.com/dai-shi/use-context-selector)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Single context with notifications + user data causing wide re-renders |
| **90-94** | Context with 5+ values of varying update frequency |
| **85-89** | Combined state + dispatch causing button re-renders |
| **80-84** | Context that could benefit from splitting |
| **<80** | **DO NOT REPORT** - simple app or already optimized |
