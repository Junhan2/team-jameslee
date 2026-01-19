# Confidence Scoring Guide

## Overview

Every reported issue includes a confidence score from 0-100, indicating how certain we are that this is a real issue worth fixing.

## Why Confidence Scoring?

Unlike static linters, AI-based code review can understand context. However, this means we may have varying levels of certainty. The confidence score helps:

1. **Filter noise**: High threshold eliminates false positives
2. **Prioritize fixes**: Higher confidence = more likely real issue
3. **Avoid over-engineering**: Low confidence may indicate edge cases

## Score Ranges

### 95-100: Definite Issue

**Certainty**: Very high
**Action**: Fix immediately

**Characteristics**:
- Clear anti-pattern with no ambiguity
- Multiple indicators present
- No reasonable exception applies

**Example**:
```typescript
// 98/100 - Clear sequential await with no dependencies
const user = await getUser(id);
const posts = await getPosts(id);     // No dependency on user
const comments = await getComments(id); // No dependency on user or posts
```

---

### 90-94: Strong Indicator

**Certainty**: High
**Action**: Fix unless documented exception

**Characteristics**:
- Clear pattern match
- High impact if real
- May have edge case exceptions

**Example**:
```typescript
// 92/100 - Likely waterfall, but check if getPosts needs user
const user = await getUser(id);
const posts = await getPosts(id);  // userId, not user.id - probably parallel-able
```

---

### 85-89: Moderate Indicator

**Certainty**: Moderate
**Action**: Investigate, likely worth fixing

**Characteristics**:
- Pattern suggests issue
- Some context uncertainty
- Worth human review

**Example**:
```typescript
// 87/100 - Nested then chains, may be intentional
useEffect(() => {
  fetchData().then(data => {
    processData(data).then(setResult);
  });
}, []);
```

---

### 80-84: Possible Issue

**Certainty**: Lower
**Action**: Consider fixing if performance-sensitive

**Characteristics**:
- May be an issue
- Context suggests improvement possible
- Some uncertainty about intent

**Example**:
```typescript
// 82/100 - State might need to be lifted, depends on requirements
function Parent() {
  const [filter, setFilter] = useState('');
  // Only used in one child - could be colocated?
  return <FilteredList filter={filter} />;
}
```

---

### Below 80: Not Reported

**Certainty**: Too low
**Action**: Not included in report

**Characteristics**:
- High false positive risk
- May be stylistic preference
- Context suggests intentional

**Reason for exclusion**:
- Reduces noise in reports
- Avoids unnecessary changes
- Respects intentional patterns

---

## Confidence Modifiers

Factors that increase confidence:
- Multiple sequential awaits (not just 2)
- No visible dependencies between calls
- Performance-critical code path
- Similar pattern repeated multiple times

Factors that decrease confidence:
- Comments indicating intentional pattern
- Error handling between calls
- Rate-limited API context
- Complex business logic dependencies

---

## Agent-Specific Thresholds

Different agents may have different confidence calibrations:

| Agent | Typical Range | Notes |
|-------|---------------|-------|
| async-waterfall-hunter | 80-100 | High confidence when dependencies clear |
| bundle-analyzer | 85-100 | File size data is objective |
| server-performance-reviewer | 75-95 | Context-dependent |
| client-data-reviewer | 80-95 | Pattern matching |
| rerender-detector | 70-90 | Depends on React version |
| react-pattern-analyzer | 75-90 | More subjective |

---

## Adjusting Thresholds

### Higher Threshold (≥90)

Use for:
- Large codebases with many files
- Quick sanity checks
- When you only want critical issues

```bash
/react-review --threshold=90
```

### Lower Threshold (≥75)

Use for:
- Performance-critical applications
- Thorough audits
- When you want all suggestions

```bash
/react-review --threshold=75
```

---

## Quality Metrics

We target:
- **False Positive Rate**: < 20%
- **True Positive Rate**: > 90% for CRITICAL
- **Accuracy**: Score matches actual impact 85% of time

---

## Providing Feedback

If an issue is incorrectly scored:
1. Note the file and line
2. Explain why the score was wrong
3. Help improve future accuracy

This feedback loop helps calibrate confidence scoring over time.
