---
name: clone-ui-v3
description: 레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 100% 완벽하게 클론합니다
agent: ui-extractor-v3
arguments:
  - name: url
    description: 클론할 레퍼런스 사이트 URL
    required: true
  - name: selector
    description: "클론할 섹션 (nav, hero, footer, card, 또는 CSS 선택자)"
    required: false
    default: "전체 페이지"
  - name: output
    description: 출력 폴더 경로
    required: false
    default: "./ui-clone-output"
  - name: framework
    description: "출력 프레임워크 (vanilla, react, vue, nextjs)"
    required: false
    default: "vanilla"
  - name: quality
    description: "품질 모드 (fast: 빠른 추출, precise: 정밀 검증, perfect: 최대 품질)"
    required: false
    default: "precise"
  - name: assets
    description: "에셋 처리 (download: 실제 다운로드, reference: 원본 URL 유지, placeholder: 대체 이미지)"
    required: false
    default: "download"
---

# UI Clone v3 Command

레퍼런스 사이트의 UI를 Chrome DevTools Protocol로 분석하고 **100% 완벽하게** 클론합니다.

## v3 주요 개선사항 (v2 대비)

| 영역 | v2 | v3 |
|------|----|----|
| CSS 변수 | 일부 누락 | **완전 추출 및 보존** |
| z-index 계층 | 미추적 | **스택킹 컨텍스트 완전 분석** |
| Tailwind CSS | 미감지 | **자동 감지 및 최적 출력** |
| 아이콘 | SVG + Icon fonts | **SVG 우선 (Tier 1)** |
| 버튼 상태 | hover만 | **hover/active/focus/focus-visible** |
| 폰트 감지 | 부분 지원 | **Google Fonts 완전 지원** |
| 품질 목표 | ~74% | **≥95% (Tier 1 사이트)** |

## 6단계 파이프라인

```
Phase 0: PRE-FLIGHT   → 환경 검증 (Chrome 연결, URL 접근, CORS 탐지)
Phase 1: DEEP SURVEY  → 리소스 탐색, 폰트/그라데이션 특화 감지
Phase 2: PRECISION    → Tier 1 스크립트 필수 실행 (11개)
Phase 3: SMART ANALYZE→ 레이아웃 분석, Tailwind 감지, 품질 점수
Phase 4: EXACT GENERATE→ 1:1 매핑 코드 생성
Phase 5: AUTO VERIFY  → 듀얼 페이지 검증 + 자동 수정 (선택)
```

## 실행 절차

### Step 1: Pre-flight Check (Phase 0)

1. Chrome DevTools 연결 상태 확인
2. 타겟 URL 접근 가능 여부 확인
3. CORS 제약 사전 탐지
4. 출력 디렉토리 쓰기 권한 확인

```javascript
// Pre-flight Check
function preflightCheckFn(url) {
  return {
    chromeConnected: typeof chrome !== 'undefined',
    urlAccessible: true, // 페이지 로드 성공 여부
    cors: {
      blockedStylesheets: [],
      blockedFonts: []
    },
    estimatedResources: {
      images: 0,
      fonts: 0,
      svgs: 0
    }
  };
}
```

### Step 2: 6단계 파이프라인 실행

#### Phase 1: DEEP SURVEY

| 스크립트 | 함수명 | 설명 |
|---------|--------|------|
| A | `deepSurveyFn` | 시맨틱 섹션, 폰트 스택, 그라데이션 감지 |
| G | `headResourceFn` | CDN CSS, 폰트 preload, meta 태그 |

**핵심 추출 항목:**
- Google Fonts API URL 파싱 → 폰트명 추출
- linear-gradient, radial-gradient, conic-gradient
- CSS 변수 사용 현황 사전 조사

#### Phase 2: PRECISION MEASURE

**⚠️ CRITICAL**: Tier 1 스크립트 **필수 순서대로 실행**

| 순서 | Tier | 스크립트 | 함수명 | 설명 |
|------|------|---------|--------|------|
| 1 | 1 | B | `precisionMeasureFn` | 50+ CSS 속성 추출 |
| 2 | 1 | B2 | `pseudoCompleteFn` | ::before/::after/::marker 완전 추출 |
| 3 | 1 | B3 | `iconExtractorFn` | SVG 인라인 아이콘 완전 추출 |
| 4 | 1 | B4 | `stateCaptureAsyncFn` | hover/active/focus 상태별 분리 |
| 5 | 1 | **B5** | `cssVariablesExtractorFn` | ⭐ **CSS 변수 완전 추출** |
| 6 | 1 | **B6** | `zIndexLayersExtractorFn` | ⭐ **z-index 계층 분석** |
| 7 | 1 | C | `smartAuthoredFn` | Authored CSS (auto, %, calc) |
| 8 | 1 | F | `layoutChainFn` | width/flex/grid 컨테이너 체인 |
| 9 | 1 | I | `interactionStateFn` | hover + ancestorHoverPatterns |
| 10 | 1 | J | `imageRelationsFn` | 이미지-컨테이너 관계, gradient overlay |
| 11 | 2 | E | `assetCompleteFn` | 이미지, SVG, video, iframe |

**⚠️ 경고**:
- **B5 (cssVariablesExtractorFn) 누락 시**: CSS 변수가 하드코딩된 값으로 대체됨
- **B6 (zIndexLayersExtractorFn) 누락 시**: 모달, 드롭다운 레이어링 오류
- **B4 (stateCaptureAsyncFn) 누락 시**: 버튼 hover 상태가 default와 혼동됨

#### Phase 3: SMART ANALYZE

| 순서 | Tier | 스크립트 | 함수명 | 설명 |
|------|------|---------|--------|------|
| 1 | 2 | D | `componentGroupingFn` | 반복 패턴 → 재사용 클래스 |
| 2 | 2 | **D2** | `tailwindDetectorFn` | ⭐ **Tailwind CSS 자동 감지** |
| 3 | 2 | K | `qualityScoreFn` | 추출 품질 점수 계산 |
| 4 | 2 | H | `animationCompleteFn` | @keyframes, transition 분해 |

**Tailwind 감지 결과 활용:**
- `isTailwind: true` (confidence > 0.6) → Tailwind 클래스 유지 권장
- `isTailwind: false` → custom CSS 출력

#### Phase 4: EXACT GENERATE

```
4-1. HTML <head> 생성
     • CDN CSS (원본 그대로 참조)
     • Google Fonts link
     • meta, favicon

4-2. HTML <body> 생성
     • 시맨틱 태그 보존
     • SVG 아이콘 인라인 삽입
     • Accessibility 속성 (aria-*, role)

4-3. CSS 생성
     • :root { CSS 변수 블록 }
     • @font-face 규칙
     • @keyframes 규칙
     • 상태별 스타일 (:hover, :active, :focus)
     • Group-hover 패턴
     • z-index 계층 (그룹별 정리)

4-4. 에셋 처리
     • 이미지 다운로드
     • 폰트 파일 (woff2)
```

#### Phase 5: AUTO VERIFY & FIX (precise/perfect 모드)

| 모드 | Phase 5 범위 | 자동 수정 |
|------|-------------|----------|
| fast | 건너뜀 | ✗ |
| precise | 기본 검증 | 1회 |
| perfect | 전체 검증 | 3회 |

```
5-1. 듀얼 페이지 검증
     • 원본 vs 클론 측정값 비교
     • 허용 오차: dimensions ≤3px, color 정확일치

5-2. 자동 수정 루프 (perfect 모드)
     • 가장 큰 불일치 항목 식별
     • CSS 패치 자동 생성
     • 최대 3회 반복

5-3. 보고서 생성
     • 섹션별 일치율 (%)
     • 잔여 불일치 항목
     • 수동 수정 제안
```

## 품질 모드별 실행 범위

| 모드 | Phase 0 | Phase 1-4 | Phase 5 | Auto-Fix | 목표 품질 |
|------|---------|-----------|---------|----------|----------|
| **fast** | ✓ | Tier 1만 | 건너뜀 | ✗ | ~85% |
| **precise** | ✓ | Tier 1+2 | 기본 | 1회 | ~95% |
| **perfect** | ✓ | 전체 | 전체 | 3회 | ~99% |

## 출력 구조

### vanilla (기본값)
```
$output/
├── index.html          # <head> 리소스, CSS 변수 포함
├── styles.css          # :root 변수, @font-face, @keyframes, :hover
├── scripts.js          # 인터랙션 핸들러
├── assets/
│   ├── images/
│   ├── icons/          # SVG 아이콘
│   └── fonts/          # woff2 파일
├── screenshots/
│   ├── original-*.png
│   └── clone-*.png
└── verify/
    └── report.json     # 품질 점수, 불일치 항목
```

### react / vue / nextjs
```
$output/
├── components/
│   └── [ComponentName]/
├── styles/
│   ├── variables.css   # CSS 변수 분리
│   └── globals.css
├── assets/
├── screenshots/
└── verify/
    └── report.json
```

## 사용 예시

### 기본 사용 (precise 모드)
```
/clone-ui-v3 https://stripe.com
```

### 특정 섹션 + React
```
/clone-ui-v3 https://linear.app hero ./components react
```

### 최대 품질 (perfect 모드)
```
/clone-ui-v3 https://vercel.com --quality perfect
```

### 빠른 프로토타이핑
```
/clone-ui-v3 https://example.com footer ./src vanilla fast placeholder
```

## Tier 시스템

### Tier 1: 필수 (80%+ 사이트 영향)
- CSS 변수 추출 (B5)
- z-index 계층 분석 (B6)
- 버튼 상태 분리 (B4)
- SVG 아이콘 추출 (B3)
- 그라데이션 배경 (A)
- Google Fonts 감지 (A)

### Tier 2: 권장 (40-70% 사이트)
- Tailwind CSS 감지 (D2)
- pseudo-element 콘텐츠 (B2)
- 반응형 브레이크포인트

### Tier 3: 선택 (<40% 사이트)
- Adobe Fonts
- Icon fonts (FontAwesome 등)
- SSIM 픽셀 비교
- 자동 수정 루프

## 트러블슈팅

### CSS 변수가 하드코딩된 값으로 나옴
- Script B5 (cssVariablesExtractorFn) 실행 확인
- :root 블록이 styles.css 최상단에 있는지 확인
- CORS 차단된 스타일시트의 경우 computed 값으로 fallback

### z-index가 원본과 다름
- Script B6 (zIndexLayersExtractorFn) 결과 확인
- 스택킹 컨텍스트 생성 요소 (opacity, transform 등) 확인
- groups.modal, groups.dropdown 등 그룹별 정렬 확인

### Tailwind 클래스가 유지되지 않음
- Script D2 (tailwindDetectorFn)의 isTailwind, confidence 확인
- confidence < 0.3이면 custom CSS로 출력됨
- Tailwind CDN 링크가 포함되었는지 확인

### 버튼 hover가 default 상태와 같음
- Script B4 (stateCaptureAsyncFn) 결과에서 hoverDiff 확인
- hoverDiff가 null이면 hover 스타일 변화 없음
- transition 속성이 default에 포함되었는지 확인

### 그라데이션 배경이 단색으로 나옴
- Script A (deepSurveyFn)의 gradients 배열 확인
- backgroundImage 값이 'gradient' 포함하는지 확인
- fallbackColor가 적용되었는지 확인

## v2와의 비교 테스트

동일 URL로 v2, v3 결과 비교:
```bash
# v2 실행
/clone-ui-v2 https://example.com --output ./v2-output

# v3 실행
/clone-ui-v3 https://example.com --output ./v3-output

# 결과 비교
# v3/verify/report.json에서 품질 점수 확인
```

## 참조 문서

- `upgrade-plan/UI_CLONER_V3_SPEC.md` - 전체 기획서
- `upgrade-plan/GENERALIZATION_ANALYSIS.md` - 범용성 검증 분석
- `iteration-md/CROSS_VALIDATION_REPORT.md` - 원본 검증 보고서
