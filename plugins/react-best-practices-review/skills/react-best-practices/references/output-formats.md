# Output Formats Guide

## Overview

The React Best Practices Review plugin supports multiple output formats to suit different workflows.

## Console Output

**Default format for all commands**

### Summary Section

```
╔═══════════════════════════════════════════════════════════════╗
║        React Best Practices Review Report                     ║
║        Generated: 2026-01-19 14:30:00                         ║
╚═══════════════════════════════════════════════════════════════╝

📊 Summary
──────────────────────────────────────────────────────────────────
 🔴 CRITICAL:  2 issues (async waterfalls)
 🟠 HIGH:      1 issue  (bundle size)
 🟡 MEDIUM:    3 issues (rerendering)
──────────────────────────────────────────────────────────────────
```

### Issue Format

```
🔴 CRITICAL Issues (Must Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1. Request Waterfall in UserDashboard
📍 File: src/components/UserDashboard.tsx:45
🎯 Confidence: 95/100
⚡ Impact: ~400ms delay

Current Code:
┌──────────────────────────────────────┐
│ const user = await fetchUser(id);    │
│ const orders = await fetchOrders(id);│
└──────────────────────────────────────┘

Suggested Fix:
┌──────────────────────────────────────┐
│ const [user, orders] = await         │
│   Promise.all([                      │
│     fetchUser(id),                   │
│     fetchOrders(id)                  │
│   ]);                                │
└──────────────────────────────────────┘

📈 Estimated: 200ms faster initial load
```

### Action Plan Section

```
📋 Action Plan
──────────────────────────────────────────────────────────────────
 Priority │ Task                              │ Time  │ Impact
──────────────────────────────────────────────────────────────────
 1. ⚡    │ Fix UserDashboard waterfall       │ 5min  │ -400ms
 2. ⚡    │ Fix ProductList waterfall         │ 5min  │ -300ms
 3. 📦    │ Add dynamic import for AdminPanel │ 10min │ -50KB
 4. 🔄    │ Memoize ProductList mapping       │ 5min  │ -20ms
──────────────────────────────────────────────────────────────────
```

---

## Markdown Report File

**Generated with `--output=file` or `--output=both`**

Filename: `react-review-report-YYYY-MM-DD.md`

Features:
- Full markdown formatting
- Tables for data
- Code blocks with syntax highlighting
- Links to references
- Suitable for documentation/wiki

See [report-markdown.md](../templates/report-markdown.md) for template.

---

## GitHub PR Comment

**Generated with `/react-review-pr`**

Features:
- Collapsible `<details>` for long content
- GitHub task list checkboxes
- Links to file lines in PR
- Badge-style summary
- Markdown rendering

See [pr-comment.md](../templates/pr-comment.md) for template.

### Collapsed Issue Example

```markdown
<details>
<summary>🔴 Request Waterfall in UserDashboard.tsx:45 (Confidence: 95%)</summary>

**Current Code**:
```tsx
const user = await fetchUser(id);
const orders = await fetchOrders(id);
```

**Suggested Fix**:
```tsx
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id)
]);
```

**Impact**: ~400ms faster initial load

</details>
```

---

## Quick Review Format

**Compact format for `/react-review-quick`**

```
⚡ Quick React Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Files Reviewed: 12
⏱️  Time: 8 seconds
🎯 Threshold: ≥90 confidence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL Issues: 2

1. **Async Waterfall** in `UserDashboard.tsx:45`
   Confidence: 95%
   Fix: Use Promise.all()
   Impact: ~400ms faster

2. **Large Bundle** in `utils/index.ts:1`
   Confidence: 92%
   Fix: Use lodash-es
   Impact: ~70KB smaller

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ For full review: /react-review
```

---

## Rules List Format

**Generated with `/react-rules`**

### Concise (Default)

```
📚 React Best Practices Rules
═══════════════════════════════════════════════════════════════

🔴 CRITICAL Impact
────────────────────────────────────────────────────────────────
• async-parallel-requests    - Parallel data fetching
• async-data-preloading      - Data preloading patterns
• bundle-code-splitting      - Route-based code splitting
...
```

### Verbose (`--verbose`)

```
📚 async-parallel-requests
═══════════════════════════════════════════════════════════════

Impact: CRITICAL
Agent: async-waterfall-hunter

Problem:
Sequential await statements create request waterfalls...

Detection Signals:
- Multiple await statements in sequence
- No data dependencies between calls
...

❌ Bad Pattern:
const user = await getUser(id);
const posts = await getPosts(id);

✅ Good Pattern:
const [user, posts] = await Promise.all([...]);

References:
- https://vercel.com/blog/...
```

---

## Customizing Output

### Output Flag

```bash
/react-review --output=console  # Default, terminal output
/react-review --output=file     # Write to markdown file
/react-review --output=both     # Both console and file
```

### Threshold Flag

```bash
/react-review --threshold=90    # Only high-confidence issues
/react-review --threshold=75    # Include more suggestions
```

---

## Format Selection Guide

| Use Case | Recommended Format |
|----------|-------------------|
| Quick check | Console (default) |
| Documentation | File (`--output=file`) |
| PR review | `/react-review-pr` |
| CI/CD | File + parse markdown |
| Team review | Both (`--output=both`) |
