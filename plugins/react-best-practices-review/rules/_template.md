---
title: [Rule Title]
impact: [CRITICAL | HIGH | MEDIUM | LOW]
impactDescription: [Brief impact description, e.g., "600ms waterfall → 200ms parallel"]
tags: [async, performance, data-fetching, etc.]
appliesTo: [next.js, react, vite, etc.]
relatedAgent: [agent-name]
---

# [Rule Title]

## Problem

[Describe the problem this rule addresses. Why is it important?]

## Detection Signals

- [Signal 1: What patterns indicate this issue?]
- [Signal 2: ...]
- [Signal 3: ...]

## ❌ Bad Pattern

```tsx
// Describe why this is bad
[problematic code example]
```

**Why this is problematic**:
- [Reason 1]
- [Reason 2]

## ✅ Good Pattern

```tsx
// Describe the improvement
[improved code example]
```

**Why this is better**:
- [Benefit 1]
- [Benefit 2]

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| [Metric 1] | [value] | [value] | [delta] |
| [Metric 2] | [value] | [value] | [delta] |

## Exceptions

Do NOT apply this rule when:

1. **[Exception name]**: [Description of when this rule doesn't apply]
2. **[Exception name]**: [Description]

## Related Rules

- [Related rule 1](./related-rule-1.md) - [Brief description]
- [Related rule 2](./related-rule-2.md) - [Brief description]

## References

- [Reference 1](https://example.com/link)
- [Reference 2](https://example.com/link)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | [Clear indicator] |
| **90-94** | [Strong indicator] |
| **85-89** | [Moderate indicator] |
| **80-84** | [Weak but reportable indicator] |
| **<80** | **DO NOT REPORT** |
