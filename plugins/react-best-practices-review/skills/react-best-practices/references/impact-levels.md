# Impact Levels Guide

## Overview

Issues are categorized by their potential impact on application performance and user experience.

## Level Definitions

### 🔴 CRITICAL

**Priority**: Fix immediately
**Score Range**: 95-100

**Characteristics**:
- Significant, measurable performance degradation
- Affects all users on every page load
- Often results in seconds of delay

**Examples**:
- Async waterfall causing 500ms+ delay
- Full lodash import (70KB)
- Sequential API calls that could be parallel

**User Impact**:
- Noticeable loading delays
- Poor Core Web Vitals
- Potential user abandonment

---

### 🟠 HIGH

**Priority**: Fix soon (within sprint)
**Score Range**: 90-94

**Characteristics**:
- Noticeable performance impact
- Affects significant portion of users
- Hundreds of milliseconds of delay

**Examples**:
- Missing code splitting for routes
- No caching on stable data
- Large components without lazy loading

**User Impact**:
- Slower than expected interactions
- Suboptimal initial load
- Mobile users especially affected

---

### 🟡 MEDIUM

**Priority**: Schedule for improvement
**Score Range**: 80-89

**Characteristics**:
- Moderate performance impact
- May affect specific use cases
- Tens of milliseconds of impact

**Examples**:
- Missing memoization for expensive computations
- State not colocated properly
- Suboptimal React Query configuration

**User Impact**:
- Slight jank on interactions
- Unnecessary network requests
- Higher than needed resource usage

---

### 🔵 LOW

**Priority**: Nice to have
**Score Range**: Below threshold (not typically reported)

**Characteristics**:
- Minor optimization opportunities
- Best practices not followed
- Minimal measurable impact

**Examples**:
- Minor pattern improvements
- Documentation improvements
- Style consistency issues

**User Impact**:
- Minimal or none
- Developer experience improvement
- Code maintainability

---

## Impact Assessment Criteria

### Performance Metrics

| Metric | CRITICAL | HIGH | MEDIUM |
|--------|----------|------|--------|
| Load Time | +500ms | +200ms | +50ms |
| Bundle Size | +100KB | +50KB | +20KB |
| Re-renders | 10x+ | 5x | 2x |
| Memory | +100MB | +50MB | +10MB |

### User Experience

| Factor | CRITICAL | HIGH | MEDIUM |
|--------|----------|------|--------|
| Visible Delay | Yes | Sometimes | Rarely |
| Affects Mobile | Severe | Noticeable | Minor |
| Affects Core Vitals | Fails | Borderline | Passes |

### Fix Urgency

| Level | When to Fix | Sprint Priority |
|-------|-------------|-----------------|
| CRITICAL | Before deploy | This sprint |
| HIGH | Next 1-2 weeks | Next sprint |
| MEDIUM | When convenient | Backlog |
| LOW | Optional | Tech debt |

---

## Mapping to Commands

| Command | Threshold | Levels Reported |
|---------|-----------|-----------------|
| `/react-review` | ≥80 | ALL |
| `/react-review-quick` | ≥90 | CRITICAL, HIGH |
| `/react-review-pr` | ≥85 | ALL |

---

## References

- [Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/docs/concepts/analytics)
