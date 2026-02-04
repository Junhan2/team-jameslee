---
name: ui-clone-v3
description: |
  레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 100% 완벽하게 클론합니다.
  범용성 검증된 Tier 시스템으로 95%+ 유사도를 달성합니다.

  **v3 핵심 개선:**
  - CSS 변수 완전 추출 (80%+ 사이트 영향)
  - z-index 계층 분석 (90%+ 사이트 영향)
  - Tailwind CSS 자동 감지 (30%+ 사이트)
  - 버튼 상태 분리 (hover/active/focus)

  **품질 모드:**
  - fast: 빠른 추출, ~85% 품질
  - precise: 정밀 검증, ~95% 품질
  - perfect: 최대 품질, ~99% 품질
---

# UI Clone v3 Skill

100% 완벽 클론을 목표로 하는 UI 클로너입니다.

## 사용 방법

```
/clone-ui-v3 <url> [selector] [output] [framework] [quality] [assets]
```

### 예시

```bash
# 기본 사용 (전체 페이지)
/clone-ui-v3 https://stripe.com

# Hero 섹션만 클론
/clone-ui-v3 https://vercel.com hero ./my-hero

# React 컴포넌트로 출력
/clone-ui-v3 https://linear.app nav ./components react

# 최대 품질
/clone-ui-v3 https://example.com --quality perfect
```

## Tier 시스템

### Tier 1: 필수 (80%+ 사이트)
| 스크립트 | 기능 |
|---------|------|
| B5 | CSS 변수 완전 추출 |
| B6 | z-index 계층 분석 |
| B4 | 버튼 상태 분리 |
| B3 | SVG 아이콘 추출 |
| A | 그라데이션 배경 감지 |

### Tier 2: 권장 (40-70% 사이트)
| 스크립트 | 기능 |
|---------|------|
| D2 | Tailwind CSS 감지 |
| D | 반복 패턴 그룹화 |
| K | 품질 점수 계산 |

### Tier 3: 선택 (<40% 사이트)
| 스크립트 | 기능 |
|---------|------|
| V | SSIM 픽셀 비교 |
| X | 자동 수정 |

## 체크리스트 (30항목)

### Phase 0: Pre-flight (3항목)
- [ ] Chrome DevTools 연결 확인
- [ ] 타겟 URL 접근 가능
- [ ] 출력 디렉토리 쓰기 권한

### Phase 1: Deep Survey (5항목)
- [ ] 시맨틱 섹션 식별
- [ ] Google Fonts 감지
- [ ] @font-face 규칙 추출
- [ ] 그라데이션 배경 감지
- [ ] CSS 변수 프리뷰

### Phase 2: Precision Measure (12항목)
- [ ] 50+ CSS 속성 추출
- [ ] ::before/::after 완전 추출
- [ ] SVG 아이콘 인라인 추출
- [ ] hover/active/focus 상태 분리
- [ ] **CSS 변수 완전 추출** ⭐
- [ ] **z-index 계층 분석** ⭐
- [ ] Authored CSS (auto, %, calc)
- [ ] width/flex/grid 체인
- [ ] group-hover 패턴
- [ ] 이미지-컨테이너 관계
- [ ] gradient overlay 감지
- [ ] sizing strategy 분류

### Phase 3: Smart Analyze (5항목)
- [ ] **Tailwind CSS 감지** ⭐
- [ ] 반복 패턴 그룹화
- [ ] 에셋 분석
- [ ] @keyframes 추출
- [ ] 품질 점수 계산

### Phase 4: Generate (3항목)
- [ ] HTML (CSS 변수, SVG 인라인)
- [ ] CSS (:root, @font-face, @keyframes, :hover, z-index)
- [ ] 에셋 다운로드

### Phase 5: Verify (2항목)
- [ ] 듀얼 페이지 검증
- [ ] 자동 수정 루프

## 품질 목표

| 사이트 유형 | v2 | v3 목표 |
|------------|----|---------|
| SaaS 랜딩 | ~70% | ≥95% |
| 대시보드 | ~60% | ≥90% |
| 이커머스 | ~65% | ≥92% |
| Tailwind 사이트 | ~55% | ≥90% |

## 트러블슈팅

### CSS 변수가 하드코딩됨
```
원인: B5 (cssVariablesExtractorFn) 미실행 또는 CORS 차단
해결:
1. Tier 1 스크립트 순서 확인
2. CORS 차단 시 computed 값으로 fallback
3. :root 블록이 styles.css 최상단에 있는지 확인
```

### z-index 레이어링 오류
```
원인: B6 (zIndexLayersExtractorFn) 미실행
해결:
1. groups.modal, groups.dropdown 등 그룹별 정렬 확인
2. 스택킹 컨텍스트 생성 요소 (opacity, transform) 확인
```

### Tailwind 클래스 미유지
```
원인: D2 (tailwindDetectorFn) confidence < 0.3
해결:
1. confidence 값 확인
2. 낮은 confidence 시 custom CSS로 출력
3. Tailwind CDN 링크 직접 포함
```

### 버튼 hover 상태 동일
```
원인: B4 (stateCaptureAsyncFn) 미실행
해결:
1. hoverDiff 값 확인 (null이면 변화 없음)
2. transition 속성 확인
3. :hover 규칙 CSS 포함 확인
```

## v2 vs v3 비교

| 기능 | v2 | v3 |
|------|----|----|
| CSS 변수 | 일부 | 완전 |
| z-index | 미추적 | 완전 분석 |
| Tailwind | 미감지 | 자동 감지 |
| 상태 분리 | hover만 | hover/active/focus |
| 품질 목표 | ~74% | ≥95% |

## 참조 문서

- `upgrade-plan/UI_CLONER_V3_SPEC.md` - 전체 기획서
- `upgrade-plan/GENERALIZATION_ANALYSIS.md` - 범용성 검증
