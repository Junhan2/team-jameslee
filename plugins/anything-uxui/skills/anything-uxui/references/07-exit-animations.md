---
title: Exit Animation Patterns
impact: HIGH
tags: exit, animatepresence, framer-motion, unmount, transition
---

# Exit Animation Patterns

Standards for animating elements as they leave the DOM.
By junhan of select.codes.

---

## Core Principles

### exit-property-symmetric — Exit mirrors entrance properties

Exit animation must use the same transform properties as entrance, reversed. This maintains visual coherence.

```tsx
// ❌ Asymmetric properties (entrance uses y, exit uses scale)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ scale: 0 }}
/>

// ✅ Symmetric properties
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
/>
```

### exit-timing-asymmetric — Exit faster than entrance

Entrance is deliberate (user sees what appeared). Exit is system response (get out fast). Exit duration should be ~60% of entrance duration.

```tsx
// ❌ Same duration both directions
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
/>

// ✅ Asymmetric: entrance 250ms, exit 150ms
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1, transition: { duration: 0.25 } }}
  exit={{ opacity: 0, transition: { duration: 0.15 } }}
/>
```

### exit-easing-ease-out — Use ease-out for exit (not ease-in)

Exit animations use ease-out for immediate visual response, not ease-in. Combined with shorter duration, this creates a snappy departure.

```css
/* ❌ ease-in on exit — initial lag */
.modal-exit { animation-timing-function: ease-in; }

/* ✅ ease-out on exit — instant response */
.modal-exit { animation-timing-function: ease-out; }
```

---

## AnimatePresence Patterns

### exit-requires-wrapper — AnimatePresence wrapper required

Conditional motion elements must be wrapped in AnimatePresence for exit animations to fire.

```tsx
// ❌ No wrapper — exit never fires
{isVisible && (
  <motion.div exit={{ opacity: 0 }} />
)}

// ✅ Wrapper present
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

### exit-prop-required — exit prop is mandatory

Every motion element inside AnimatePresence must define an exit prop.

```tsx
// ❌ Missing exit prop
<AnimatePresence>
  {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
</AnimatePresence>

// ✅ exit defined
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### exit-key-stable — Use stable unique keys, never index

Dynamic lists inside AnimatePresence need stable keys (not array index) for correct exit tracking.

```tsx
// ❌ Index as key
{items.map((item, i) => <motion.div key={i} exit={{ opacity: 0 }} />)}

// ✅ Stable unique key
{items.map((item) => <motion.div key={item.id} exit={{ opacity: 0 }} />)}
```

### exit-disable-interactions — Disable interactions during exit

Exiting elements should not respond to clicks or hover.

```tsx
function Card() {
  const isPresent = useIsPresent();
  return (
    <button onClick={handleClick} disabled={!isPresent}>
      Click
    </button>
  );
}
```

---

## AnimatePresence Modes

### exit-mode-wait-halves-duration — mode="wait" doubles perceived duration

mode="wait" plays exit fully before entrance starts — effectively doubling total animation time. Halve individual durations to compensate.

```tsx
// ❌ Feels sluggish with wait mode
<AnimatePresence mode="wait">
  <motion.div transition={{ duration: 0.3 }} />
</AnimatePresence>

// ✅ Compensate by halving
<AnimatePresence mode="wait">
  <motion.div transition={{ duration: 0.15 }} />
</AnimatePresence>
```

### exit-mode-pop-layout — Use popLayout for list reordering

mode="sync" causes layout conflicts when multiple items animate simultaneously. Use popLayout instead.

```tsx
// ❌ sync mode — layout competition
<AnimatePresence mode="sync">
  {items.map(item => <motion.div exit={{ opacity: 0 }}>{item}</motion.div>)}
</AnimatePresence>

// ✅ popLayout — prevents layout shift
<AnimatePresence mode="popLayout">
  {items.map(item => <motion.div exit={{ opacity: 0 }}>{item}</motion.div>)}
</AnimatePresence>
```

---

## Advanced Patterns

### exit-presence-hook — useIsPresent in child component only

useIsPresent must be called inside the child of AnimatePresence, not in the parent.

```tsx
// ❌ Hook in parent
function Parent() {
  const isPresent = useIsPresent();
  return <AnimatePresence>{show && <Child />}</AnimatePresence>;
}

// ✅ Hook in child
function Child() {
  const isPresent = useIsPresent();
  return <motion.div data-exiting={!isPresent} />;
}
```

### exit-safe-to-remove — Call safeToRemove after async cleanup

When using usePresence, always call safeToRemove after async operations complete.

```tsx
function AsyncComponent() {
  const [isPresent, safeToRemove] = usePresence();
  useEffect(() => {
    if (!isPresent) {
      cleanup().then(safeToRemove);
    }
  }, [isPresent, safeToRemove]);
}
```

### exit-nested-propagate — Nested AnimatePresence needs propagate

Without propagate, children of exiting parents disappear instantly.

```tsx
// ❌ Children vanish immediately
<AnimatePresence>
  {isOpen && (
    <motion.div exit={{ opacity: 0 }}>
      <AnimatePresence>
        {items.map(item => <motion.div key={item.id} exit={{ scale: 0 }} />)}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>

// ✅ Both propagate
<AnimatePresence propagate>
  {isOpen && (
    <motion.div exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {items.map(item => <motion.div key={item.id} exit={{ scale: 0 }} />)}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>
```

### exit-parent-child-timing — Coordinate parent and child exit timing

Parent exit duration must be ≥ longest child exit duration. Otherwise children get clipped.

```tsx
// ❌ Parent too fast
<motion.div exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
  <motion.div exit={{ scale: 0 }} transition={{ duration: 0.5 }} />
</motion.div>

// ✅ Coordinated
<motion.div exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
  <motion.div exit={{ scale: 0 }} transition={{ duration: 0.15 }} />
</motion.div>
```

### exit-no-context-menu-entrance — Context menus: no entrance animation

Context menus must appear instantly (no entrance animation) but can have exit animation.

```tsx
// ❌ Entrance + exit
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
/>

// ✅ Exit only
<motion.div exit={{ opacity: 0, scale: 0.95 }} />
```
