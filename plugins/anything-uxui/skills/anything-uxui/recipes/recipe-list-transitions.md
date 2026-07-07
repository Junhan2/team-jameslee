---
title: Recipe — List Transitions (before → after)
tags: recipe, react, list, animatepresence
---
# Recipe — List Transitions

Encodes: `exit-key-stable`, `exit-no-fragment-children`, `exit-prop-required`, `exit-mode-pop-layout`, `component-stagger-sibling-index`.

## ❌ Before
```tsx
// index keys + Fragment children → exit animations silently die; no stagger
<AnimatePresence>
  <>{items.map((it, i) => <motion.div key={i}>{it.name}</motion.div>)}</>
</AnimatePresence>
```

## ✅ After
```tsx
<AnimatePresence mode="popLayout">
  {items.map(it => (                                    // stable keys, direct children (no Fragment)
    <motion.div key={it.id}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
      {it.name}
    </motion.div>
  ))}
</AnimatePresence>
```

CSS-only alternative (no library): `@starting-style` entry + `transition-behavior: allow-discrete` exit; stagger with `animation-delay: calc(sibling-index() * 50ms)` (keep a `--index` fallback for Firefox).
