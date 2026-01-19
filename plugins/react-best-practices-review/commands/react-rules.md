---
description: "List all React best practices rules"
argument-hint: "[category] [--verbose]"
allowed-tools: ["Read", "Glob"]
model: haiku
---

# List React Best Practices Rules

Display all available rules organized by category and impact level.

**Arguments**: $ARGUMENTS

## Workflow

### 1. Parse Arguments

- `category`: Filter by category (async, bundle, server, client, rerender, render)
- `--verbose`: Show detailed rule information

### 2. Read Rules Index

Read the rules index from `${CLAUDE_PLUGIN_ROOT}/rules/_index.md`

### 3. Display Rules

**Default Output** (concise):

```
📚 React Best Practices Rules
═══════════════════════════════════════════════════════════════

🔴 CRITICAL Impact (Fix First)
────────────────────────────────────────────────────────────────
Section 1: Async Waterfall Removal
  • async-parallel-requests    - Parallel data fetching
  • async-data-preloading      - Data preloading patterns
  • async-streaming            - Streaming responses

Section 2: Bundle Size Optimization
  • bundle-code-splitting      - Route-based code splitting
  • bundle-tree-shaking        - Tree shaking optimization
  • bundle-dynamic-imports     - Dynamic imports

🟠 HIGH Impact (Should Fix)
────────────────────────────────────────────────────────────────
Section 3: Server Performance
  • server-caching             - Caching strategies
  • server-streaming-ssr       - Streaming SSR
  • server-rsc-patterns        - RSC best practices

🟡 MEDIUM Impact (Consider)
────────────────────────────────────────────────────────────────
Section 4: Client Data Fetching
  • client-swr-pattern         - SWR/React Query patterns
  • client-optimistic-updates  - Optimistic updates
  • client-prefetching         - Prefetching strategies

Section 5: Rerendering Prevention
  • rerender-memo-usage        - Memoization patterns
  • rerender-state-colocation  - State colocation
  • rerender-context-splitting - Context splitting

🔵 LOW Impact (Nice to Have)
────────────────────────────────────────────────────────────────
Section 6: Render Performance
  • render-virtualization      - List virtualization
  • render-suspense            - Suspense boundaries
  • render-concurrent-features - Concurrent React

═══════════════════════════════════════════════════════════════
Total: 18 rules across 6 categories

💡 Use /react-rules {category} for category details
💡 Use /react-rules --verbose for full descriptions
```

**Category Filter** (e.g., `/react-rules async`):

```
📚 Async Waterfall Rules
═══════════════════════════════════════════════════════════════

🔴 async-parallel-requests
   Impact: CRITICAL
   Agent: async-waterfall-hunter

   Problem: Sequential await statements create request waterfalls

   ❌ Bad:
   const user = await getUser(id);
   const posts = await getPosts(id);

   ✅ Good:
   const [user, posts] = await Promise.all([
     getUser(id),
     getPosts(id)
   ]);

────────────────────────────────────────────────────────────────

🔴 async-data-preloading
   Impact: CRITICAL
   Agent: async-waterfall-hunter

   Problem: Waiting to fetch data until component mounts

   ✅ Solution: Prefetch on hover/viewport visibility

────────────────────────────────────────────────────────────────

🟡 async-streaming
   Impact: HIGH
   Agent: async-waterfall-hunter

   Problem: Blocking SSR until all data loads

   ✅ Solution: Use Suspense boundaries for streaming

═══════════════════════════════════════════════════════════════
```

**Verbose Output** (`/react-rules --verbose`):

For each rule, show:
- Full description
- Detection signals
- Code examples (bad/good)
- Exceptions
- Related rules
- References

### 4. Read Individual Rule (if requested)

If user asks about a specific rule:

```bash
/react-rules async-parallel-requests
```

Read and display `${CLAUDE_PLUGIN_ROOT}/rules/async-parallel-requests.md`

## Usage Examples

```bash
# List all rules
/react-rules

# List async waterfall rules
/react-rules async

# List bundle rules
/react-rules bundle

# Show all rules with details
/react-rules --verbose

# Show specific rule details
/react-rules async-parallel-requests
```

## Categories

| Category | Rules | Focus Area |
|----------|-------|------------|
| `async` | 3 | Request waterfalls, streaming |
| `bundle` | 3 | Code splitting, tree shaking |
| `server` | 3 | RSC, caching, SSR |
| `client` | 3 | SWR, optimistic updates |
| `rerender` | 3 | Memoization, state management |
| `render` | 3 | Virtualization, Suspense |

## Impact Levels

| Level | Color | Description | Priority |
|-------|-------|-------------|----------|
| CRITICAL | 🔴 | Significant performance impact | Fix immediately |
| HIGH | 🟠 | Noticeable impact | Fix soon |
| MEDIUM | 🟡 | Moderate improvement | Consider fixing |
| LOW | 🔵 | Minor optimization | Nice to have |
