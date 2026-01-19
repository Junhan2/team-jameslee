---
title: React Best Practices
description: |
  Vercel React Best Practices 기반의 성능 최적화 지식을 제공합니다.
  React/Next.js 코드 리뷰, 성능 이슈 해결, 베스트 프랙티스 안내에 활용됩니다.

triggers:
  - "React 성능 최적화"
  - "async waterfall"
  - "비동기 워터폴"
  - "번들 사이즈"
  - "코드 스플리팅"
  - "React Query 패턴"
  - "SWR 패턴"
  - "불필요한 리렌더링"
  - "useCallback useMemo"
  - "Server Component"
  - "RSC 패턴"
  - "Next.js 성능"
  - "streaming SSR"
  - "Suspense 패턴"
---

# React Best Practices Skill

이 스킬은 Vercel의 React Best Practices를 기반으로 React/Next.js 애플리케이션의 성능 최적화를 안내합니다.

## 활용 방법

### 1. 자동 코드 리뷰

```bash
# 전체 리뷰
/react-review

# 빠른 리뷰 (CRITICAL/HIGH만)
/react-review-quick

# PR 리뷰 + GitHub 댓글
/react-review-pr 123
```

### 2. 규칙 참조

```bash
# 모든 규칙 목록
/react-rules

# 특정 카테고리
/react-rules async
/react-rules bundle
```

### 3. 성능 질문 답변

이 스킬이 활성화되면 다음과 같은 질문에 답변할 수 있습니다:

- "이 코드에서 async waterfall이 있나요?"
- "번들 사이즈를 줄이려면 어떻게 해야 하나요?"
- "React Query를 어떻게 최적화하나요?"
- "불필요한 리렌더링을 찾아주세요"

## 핵심 개념

### 영향도 레벨

| Level | 우선순위 | 설명 |
|-------|----------|------|
| 🔴 CRITICAL | 1순위 | 즉시 수정 필요 |
| 🟠 HIGH | 2순위 | 빠른 시일 내 수정 |
| 🟡 MEDIUM | 3순위 | 개선 고려 |
| 🔵 LOW | 4순위 | 선택적 개선 |

### 신뢰도 점수

모든 이슈는 0-100 신뢰도 점수와 함께 보고됩니다:

- **≥95**: 명확한 이슈
- **90-94**: 높은 확신
- **85-89**: 중간 확신
- **80-84**: 낮지만 보고 가능
- **<80**: 보고하지 않음 (거짓양성 가능)

## 참조 문서

상세 정보는 다음 문서를 참조하세요:

- [impact-levels.md](./references/impact-levels.md) - 영향도 레벨 가이드
- [confidence-scoring.md](./references/confidence-scoring.md) - 신뢰도 점수 기준
- [output-formats.md](./references/output-formats.md) - 출력 형식 가이드

## 규칙 카테고리

### 1. Async Waterfall (CRITICAL)
요청 워터폴 제거 - 가장 큰 성능 영향

### 2. Bundle Size (CRITICAL-HIGH)
번들 크기 최적화 - 모든 사용자에게 영향

### 3. Server Performance (HIGH)
서버 사이드 최적화 - 초기 로드 개선

### 4. Client Data (MEDIUM-HIGH)
클라이언트 데이터 페칭 - UX 개선

### 5. Rerendering (MEDIUM)
불필요한 리렌더링 방지 - 인터랙션 개선

### 6. Render Performance (MEDIUM-LOW)
렌더 성능 최적화 - 대규모 UI 개선
