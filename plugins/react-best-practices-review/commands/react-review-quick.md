---
description: "Quick React review focusing on CRITICAL and HIGH impact issues only"
argument-hint: "[path]"
allowed-tools: ["Read", "Grep", "Glob", "Task", "Bash"]
model: sonnet
---

# Quick React Best Practices Review

Fast review focusing only on CRITICAL and HIGH impact issues. Uses higher confidence threshold (≥90) to minimize noise.

**Arguments**: $ARGUMENTS

## Quick Review Workflow

### 1. Parse Arguments

- `path`: Directory or file to review (default: changed files or `src/`)

### 2. Identify Files

```bash
# Get recently changed files
git diff --name-only HEAD~3 -- '*.tsx' '*.ts' '*.jsx' '*.js' | head -20
```

If no changes, use provided path or default to `src/`.

### 3. Launch Priority Agents Only

Launch only the **top 2 priority agents** in parallel:

| Agent | Priority | Focus |
|-------|----------|-------|
| `async-waterfall-hunter` | CRITICAL | Async waterfalls |
| `bundle-analyzer` | CRITICAL-HIGH | Bundle size |

**Agent Configuration**:
- Confidence threshold: **≥90** (higher than standard)
- Impact filter: **CRITICAL and HIGH only**
- Model: Use default (inherit)

### 4. Quick Results Format

Output a concise summary:

```
⚡ Quick React Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Files Reviewed: {count}
⏱️  Time: {duration}
🎯 Threshold: ≥90 confidence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL Issues: {count}

1. **Async Waterfall** in `{file}:{line}`
   Confidence: {score}%
   Fix: Use Promise.all() for parallel fetching
   Impact: ~{ms}ms faster

2. **Large Bundle Import** in `{file}:{line}`
   Confidence: {score}%
   Fix: Use dynamic import
   Impact: ~{kb}KB smaller

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟠 HIGH Issues: {count}
{brief issue list}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Quick Fixes:
1. {one-liner fix suggestion}
2. {one-liner fix suggestion}

✅ For full review: /react-review
```

### 5. If No Issues Found

```
⚡ Quick React Review - Clean!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Files Reviewed: {count}
🎯 Threshold: ≥90 confidence

✅ No critical or high-impact issues detected!

Your code passes the quick performance check.

💡 For comprehensive review: /react-review
```

## Usage Examples

```bash
# Quick review of recent changes
/react-review-quick

# Quick review of specific directory
/react-review-quick src/components/

# Quick review of specific file
/react-review-quick src/pages/Dashboard.tsx
```

## When to Use

- ✅ Before committing changes
- ✅ Quick sanity check
- ✅ During PR creation
- ✅ When time is limited

## Comparison with Full Review

| Aspect | Quick | Full |
|--------|-------|------|
| Agents | 2 | 6 |
| Threshold | ≥90 | ≥80 |
| Impact levels | CRITICAL, HIGH | ALL |
| Time | ~10s | ~30s |
| Depth | Surface | Comprehensive |
