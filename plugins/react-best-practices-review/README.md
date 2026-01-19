# React Best Practices Review

> Vercel React Best Practices 기반 코드 리뷰 자동화 플러그인

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

모든 React/Next.js 프로젝트에 적용 가능한 **top-notch 수준의 코드 리뷰 자동화** 플러그인입니다.

## Features

- **6개 전문 에이전트**: 각 성능 영역에 특화된 분석
- **신뢰도 기반 필터링**: 거짓양성 최소화 (≥80 임계값)
- **영향도 우선순위**: CRITICAL → LOW 순으로 정렬
- **GitHub PR 댓글 자동화**: 리뷰 결과를 PR에 자동 게시
- **프로젝트별 커스터마이징**: `.claude/react-review.local.md` 지원

## Installation

### Step 1: Add Marketplace

```bash
/plugin marketplace add Junhan2/react-best-practices-review
```

### Step 2: Install Plugin

```bash
/plugin install react-best-practices-review@react-best-practices
```

### Alternative: Local Installation

```bash
# Clone repository
git clone https://github.com/Junhan2/react-best-practices-review

# Run Claude with plugin
claude --plugin-dir ./react-best-practices-review
```

### Verify Installation

```bash
# List installed plugins
/plugin list
```

## Usage

> **Note**: All commands are run inside a Claude Code session.

### Full Review (Recommended)

```bash
# 전체 리뷰 (신뢰도 ≥80)
/react-review

# 특정 경로만 리뷰
/react-review src/components/

# 리포트 파일 생성
/react-review --output=file
```

### Quick Review

```bash
# 빠른 리뷰 (CRITICAL/HIGH만, 신뢰도 ≥90)
/react-review-quick
```

### PR Review with GitHub Comment

```bash
# PR 리뷰 + GitHub 댓글 자동 작성
/react-review-pr 123
```

### List All Rules

```bash
# 규칙 목록 조회
/react-rules
```

## Specialized Agents

| Agent | Impact | Focus Area |
|-------|--------|------------|
| **async-waterfall-hunter** | CRITICAL | 비동기 워터폴, 순차 요청 탐지 |
| **bundle-analyzer** | CRITICAL-HIGH | 번들 크기, 코드 스플리팅 분석 |
| **server-performance-reviewer** | HIGH | 서버 캐싱, RSC 패턴, 스트리밍 |
| **client-data-reviewer** | MEDIUM-HIGH | SWR, React Query, 낙관적 업데이트 |
| **rerender-detector** | MEDIUM | 불필요한 리렌더링, Context 분리 |
| **react-pattern-analyzer** | MEDIUM-LOW | React 패턴, 훅 사용법 |

## Confidence Scoring System

```
┌─────────────────────────────────────────────────────────────┐
│ 신뢰도 점수 (Confidence Score)                              │
├─────────────────────────────────────────────────────────────┤
│ 0-25:   거짓양성 / 기존 이슈 / 린트로 감지 가능             │
│ 26-50:  사소한 개선 제안 (참고용)                           │
│ 51-75:  낮은 영향도 이슈                                    │
│ 76-90:  주의 필요 ✅ (보고 대상)                            │
│ 91-100: 치명적 성능 이슈 / 명백한 워터폴 🔴                 │
└─────────────────────────────────────────────────────────────┘
```

### Command Thresholds

| Command | Confidence | Impact Filter | Use Case |
|---------|------------|---------------|----------|
| `/react-review` | ≥80 | ALL | 일반 리뷰 |
| `/react-review-quick` | ≥90 | CRITICAL, HIGH | 빠른 체크 |
| `/react-review-pr` | ≥85 | ALL | PR 댓글용 |

## Rules Categories

### Section 1: Async Waterfall Removal (CRITICAL)
> Request waterfalls are the biggest performance killer

- `async-parallel-requests` - Parallel data fetching
- `async-data-preloading` - Data preloading patterns
- `async-streaming` - Streaming responses

### Section 2: Bundle Size Optimization (CRITICAL-HIGH)
> JavaScript overhead affects all users

- `bundle-code-splitting` - Route-based code splitting
- `bundle-tree-shaking` - Tree shaking optimization
- `bundle-dynamic-imports` - Dynamic imports for large components

### Section 3: Server Performance (HIGH)
> Server-side optimizations for initial load

- `server-caching` - Caching strategies
- `server-streaming-ssr` - Streaming SSR
- `server-rsc-patterns` - React Server Component patterns

### Section 4: Client Data Fetching (MEDIUM-HIGH)
> Efficient client-side data management

- `client-swr-pattern` - SWR/React Query patterns
- `client-optimistic-updates` - Optimistic UI updates
- `client-prefetching` - Data prefetching strategies

### Section 5: Rerendering Prevention (MEDIUM)
> Unnecessary rerenders impact UX

- `rerender-memo-usage` - Proper memoization
- `rerender-state-colocation` - State colocation
- `rerender-context-splitting` - Context splitting

### Section 6: Render Performance (MEDIUM-LOW)
> Fine-grained render optimizations

- `render-virtualization` - List virtualization
- `render-suspense` - Suspense boundaries
- `render-concurrent-features` - React concurrent features

## Project Customization

Create `.claude/react-review.local.md` in your project:

```yaml
---
# Ignore specific rules
ignoreRules:
  - bundle-code-splitting    # Already optimized
  - client-swr-pattern       # Using React Query

# Custom confidence threshold
customThresholds:
  confidence: 85

# Ignore specific paths
ignorePaths:
  - "src/legacy/**"
  - "**/*.test.tsx"
---

## Project-Specific Notes
- This project uses React Query instead of SWR
- AdminPanel is intentionally not code-split (high usage)
```

## Output Example

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
 🔵 LOW:       1 issue  (patterns)
──────────────────────────────────────────────────────────────────

🔴 CRITICAL Issues (Must Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1. Request Waterfall in UserDashboard
📍 File: src/components/UserDashboard.tsx:45
🎯 Confidence: 95/100
⚡ Impact: ~400ms delay

[Code examples and suggestions...]
```

## Comparison with ESLint

| Feature | ESLint | This Plugin |
|---------|--------|-------------|
| Analysis Type | Syntax only | **Performance patterns** |
| Scope | Single file | **Cross-file dependencies** |
| Rules | Fixed | **Project-customizable** |
| Output | All warnings | **Confidence-filtered (≥80)** |
| Priority | None | **CRITICAL → LOW** |
| Integration | CLI only | **GitHub PR comments** |
| Intelligence | Static | **AI-based context** |

## Quality Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| False Positive Rate | < 20% | Manual verification |
| CRITICAL Detection | > 90% | Known waterfall cases |
| Execution Time | < 30s | Normal PR (≤50 files) |
| Confidence Accuracy | > 85% | Score vs actual impact |

## References

- [Vercel Blog: React Best Practices](https://vercel.com/blog/introducing-react-best-practices)
- [Next.js Docs: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Docs: Performance](https://react.dev/learn/thinking-in-react)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) for details.
