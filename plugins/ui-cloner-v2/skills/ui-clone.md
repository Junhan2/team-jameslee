---
name: ui-clone
description: |
  레퍼런스 사이트의 UI 컴포넌트를 완벽하게 클론하는 스킬입니다.
  Chrome DevTools Protocol을 사용하여 CSS를 추출하고, 5단계 파이프라인으로 코드를 생성합니다.

  다음과 같은 경우에 사용하세요:
  - "UI 클론해줘", "이 사이트 디자인 따라해줘"
  - "네비게이션 복제해줘", "이 컴포넌트 똑같이 만들어줘"
  - "레퍼런스 사이트에서 CSS 추출해줘"
  - "/clone-ui-v2" 명령어 사용 시
---

# UI Cloner Skill v2

레퍼런스 웹사이트의 UI 컴포넌트를 Chrome DevTools 기반으로 완벽하게 클론합니다.

---

## 5단계 파이프라인

```
Phase 1: SURVEY    → Page Survey로 전체 구조 파악
Phase 2: MEASURE   → Deep Measurement + Authored CSS + Width Chain
Phase 3: ANALYZE   → 변형 분류 + HTML 재구성 판단 + Authored vs Computed 결정
Phase 4: GENERATE  → 코드 생성 + 에셋 다운로드
Phase 5: VERIFY    → 듀얼 페이지 수치 검증 루프
```

---

## Phase 1: SURVEY (정보 수집)

### 1-1. 사용자 입력 확인

다음 정보를 확인하세요:

1. **레퍼런스 URL**: 클론할 사이트 주소
2. **타겟 섹션**: 클론할 특정 영역 (전체/네비게이션/Hero/Footer 등)
3. **출력 위치**: 파일 저장 경로 (기본: `./ui-clone-output`)
4. **프레임워크**: React/Vue/Vanilla 등 (기본: vanilla)
5. **품질 모드**: fast/precise (기본: precise)
6. **에셋 모드**: download/reference/placeholder (기본: download)

### 1-2. 페이지 열기 + 서베이

```
# 원본 페이지 열기 — pageId 기록 (듀얼 페이지용)
new_page({ url: targetUrl })

# 전체 구조 파악 (Script A: Page Survey)
evaluate_script({ function: pageSurveyFn })
```

서베이 결과에서:
- 시맨틱 섹션 식별 (header, nav, main, section, footer)
- 각 섹션의 layout 정보 확인 (display, flexDirection, maxWidth)
- 이미지/SVG/링크 수 파악
- 타겟 섹션의 정확한 CSS 선택자 결정

### 1-3. 전체 스크린샷

```
take_screenshot({ filePath: "$output/screenshots/full-page.png", fullPage: true })
```

---

## Phase 2: MEASURE (정밀 측정)

### 2-1. Deep Measurement (Script B)

타겟 섹션에 대해 40+ CSS 속성 + 부모/자식/형제 관계 추출:

```
evaluate_script({ function: deepMeasurementFn })
```

- `__PARENT_SELECTOR__` → Survey에서 결정된 섹션 선택자
- `__BATCH_LIMIT__` → 50 (초과 시 배치 분할)

### 2-2. Authored CSS (Script C)

원본 스타일시트에서 authored 값 추출:

```
evaluate_script({ function: authoredCSSFn })
```

- `auto`, `%`, `flex`, `0 auto` 등 computed에서 소실되는 값 복원
- CORS 차단 시 computed로 graceful fallback

### 2-3. Width Chain (Script F)

타겟 요소 → body까지 width/maxWidth/padding 역추적:

```
evaluate_script({ function: widthChainFn })
```

### 2-4. Asset Analysis (Script E)

이미지, SVG, 폰트, CSS 변수 수집:

```
evaluate_script({ function: assetAnalysisFn })
```

### 2-5. 섹션별 스크린샷

각 주요 섹션에 대해 scrollIntoView + screenshot 패턴 적용:

```
# 섹션으로 스크롤
evaluate_script({ function: "() => {
  document.querySelector('__SELECTOR__').scrollIntoView({ block: 'start' });
  return 'scrolled';
}" })

# 스크린샷 촬영
take_screenshot({ filePath: "$output/screenshots/section-name.png" })
```

### 2-6. 미디어 쿼리 추출

```javascript
evaluate_script({ function: `() => {
  const breakpoints = new Set();
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSMediaRule) {
          breakpoints.add(rule.conditionText);
        }
      }
    } catch(e) {}
  }
  return { breakpoints: Array.from(breakpoints).sort() };
}` })
```

---

## Phase 3: ANALYZE (분석 및 판단)

### 3-A. 변형 분류 (Variant Classification)

Script D (Pattern Recognition) 실행 결과를 분석:

```
evaluate_script({ function: patternRecognitionFn })
```

분류 결과에 따른 처리:

| uniquePatterns | 의미 | 코드 생성 전략 |
|----------------|------|----------------|
| 1 | 모든 요소 동일 구조 | 단일 컴포넌트 + 반복 |
| 2~3 | 몇 가지 변형 존재 | `variant` prop 또는 modifier 클래스 |
| 4+ | 각각 다른 구조 | 개별 컴포넌트 또는 그대로 복제 |

### 3-B. HTML 재구성 판단 매트릭스

원본 HTML을 그대로 사용할지, 시맨틱하게 재구성할지 판단:

| 조건 | 판단 | 이유 |
|------|------|------|
| 원본이 이미 시맨틱 (`<nav>`, `<header>`, `<footer>`) | **그대로 사용** | 재구성 불필요 |
| `<div>` 중첩 5단계 이상 | **재구성** | 불필요한 래퍼 제거 |
| flex/grid로 정렬된 구조 | **그대로 사용** | 레이아웃 깨짐 방지 |
| 빈 요소 (`height: 0`, `display: none`) | **제거** | 불필요한 DOM |
| 프레임워크 마크업 (`__next`, `chakra-*`) | **정리** | 프레임워크 종속 제거 |

### 3-C. Authored vs Computed 결정

Phase 2에서 수집한 authored와 computed를 비교:

- **authored가 있으면**: `auto`, `%`, `flex`, `calc()`, `0 auto` → authored 사용
- **authored가 없거나 CORS 차단**: computed 사용
- **고정 px 값**: 둘 다 동일 → computed 사용 (더 정확)

### 3-D. 에셋 전략 결정

사용자의 `assets` 인자에 따라:

| assets 모드 | 처리 |
|-------------|------|
| `download` | curl로 실제 이미지 다운로드, 로컬 경로로 교체 |
| `reference` | 원본 URL 그대로 사용 |
| `placeholder` | 동일 크기의 플레이스홀더 이미지 생성 |

---

## Phase 4: GENERATE (코드 생성)

### 4-1. HTML 생성

Phase 3의 판단을 기반으로 HTML 작성:
- 원본 구조 유지 또는 시맨틱 재구성
- 변형 분류 결과 반영 (반복 요소 → 컴포넌트화)
- 에셋 모드 반영

### 4-2. CSS 생성

```css
/* ============================================
   [Component] - Cloned from [URL]
   ============================================ */

/* CSS Variables */
:root {
  /* Phase 2에서 추출한 CSS 변수 */
}

/* Component Styles */
/* Authored 값 우선, fallback으로 computed */

/* Responsive */
/* Phase 2에서 추출한 미디어 쿼리 */
```

우선순위 규칙:
1. **authored 값** (%, auto, flex, calc) → 반응형 유지
2. **computed 값** (px) → 고정 크기
3. **CSS 변수** → 원본과 동일한 변수명 사용

### 4-3. 에셋 다운로드

`assets: download` 모드일 때:

```bash
# Bash 도구로 이미지 다운로드
curl -sL "https://example.com/image.png" -o "$output/assets/images/image.png"
```

SVG는 outerHTML에서 직접 추출하여 파일로 저장.

### 4-4. 출력 구조

#### Vanilla (기본)
```
$output/
├── index.html
├── styles.css
├── scripts.js          # 인터랙션 (있는 경우)
├── assets/
│   ├── images/         # 다운로드된 이미지
│   └── icons/          # 추출된 SVG
├── screenshots/        # 원본 + 클론 비교용
│   ├── full-page.png
│   ├── original-*.png
│   └── clone-*.png
└── verify/
    └── report.json     # 검증 결과
```

#### React
```
$output/
├── components/
│   └── [ComponentName]/
│       ├── index.tsx
│       ├── [ComponentName].tsx
│       ├── [ComponentName].module.css
│       └── types.ts
├── styles/
│   └── variables.css
├── assets/
├── screenshots/
└── verify/
    └── report.json
```

#### Vue
```
$output/
├── components/
│   └── [ComponentName].vue
├── styles/
│   └── variables.css
├── assets/
├── screenshots/
└── verify/
    └── report.json
```

---

## Phase 5: VERIFY (듀얼 페이지 수치 검증)

### 5-1. 클론 페이지 열기

```
new_page({ url: "file:///$output/index.html" })
```

이제 두 페이지가 열려 있습니다:
- **page 1**: 원본 사이트 (originalPageId)
- **page 2**: 클론 결과물 (clonePageId)

### 5-2. 원본 측정

```
# 원본 페이지로 전환
select_page({ pageId: originalPageId })

# 주요 셀렉터 측정
evaluate_script({ function: verifyMeasureFn })

# 섹션별 스크린샷
evaluate_script({ function: "() => {
  document.querySelector('__SELECTOR__').scrollIntoView({ block: 'start' });
  return 'scrolled';
}" })
take_screenshot({ filePath: "$output/verify/original-section.png" })
```

### 5-3. 클론 측정

```
# 클론 페이지로 전환
select_page({ pageId: clonePageId })

# 최신 CSS 반영
navigate_page({ type: "reload", ignoreCache: true })

# 동일 셀렉터 측정
evaluate_script({ function: verifyMeasureFn })

# 섹션별 스크린샷
take_screenshot({ filePath: "$output/verify/clone-section.png" })
```

### 5-4. 비교 및 판정

측정값 비교:

| 속성 | 허용 오차 |
|------|----------|
| width, height | ≤ 3px |
| top, left (상대 위치) | ≤ 3px |
| fontSize | 정확 일치 |
| color, backgroundColor | 정확 일치 |
| borderRadius | ≤ 1px |
| padding, margin | ≤ 2px |

### 5-5. 수정 루프 (최대 3회)

오차 발견 시:

```
1. Edit 도구로 CSS 수정
2. select_page({ pageId: clonePageId })
3. navigate_page({ type: "reload", ignoreCache: true })
4. evaluate_script({ function: verifyMeasureFn })  → 재측정
5. 비교 → 오차 3px 이내이면 통과, 아니면 반복
```

최대 3회 반복 후에도 오차가 남으면 잔여 오차를 보고서에 기록합니다.

### 5-6. 검증 보고서 생성

```json
{
  "url": "https://original-site.com",
  "timestamp": "2026-01-28T10:00:00Z",
  "quality": "precise",
  "sections": {
    "header": {
      "status": "pass",
      "maxDeviation": "1px",
      "iterations": 1
    },
    "hero": {
      "status": "pass",
      "maxDeviation": "2px",
      "iterations": 2,
      "fixes": ["hero padding-top: 48px → 52px"]
    },
    "footer": {
      "status": "warn",
      "maxDeviation": "4px",
      "iterations": 3,
      "remaining": ["footer height: 4px difference (content-dependent)"]
    }
  },
  "assets": {
    "downloaded": 12,
    "failed": 1,
    "fallback": ["logo.webp → placeholder"]
  },
  "overall": "pass"
}
```

---

## quality별 실행 흐름

### fast 모드

Phase 1~4만 실행, Phase 5 (VERIFY) 건너뛰기:
- Survey → Measure (배치 1회만) → Analyze (간소화) → Generate
- authored CSS 추출 건너뛰기 (computed만 사용)
- 패턴 분류 건너뛰기
- 스크린샷 비교만 (수치 검증 없음)

### precise 모드 (기본)

전체 5단계 실행:
- 모든 스크립트 (A~F) 실행
- authored vs computed 비교
- 패턴 분류 + 변형 처리
- 듀얼 페이지 수치 검증 루프 (최대 3회)
- 검증 보고서 생성

---

## 체크리스트 (15항목)

클론 완료 후 자동 검증:

### 필수 (8항목 — 기존)
- [ ] 컨테이너 크기/패딩 일치
- [ ] border-radius 값 정확히 일치
- [ ] box-shadow 값 정확히 일치
- [ ] 폰트 스타일 일치 (family, size, weight, line-height)
- [ ] 색상값 일치 (color, backgroundColor)
- [ ] hover 인터랙션 작동
- [ ] 반응형 breakpoints 작동
- [ ] 다크모드 지원 (해당 시)

### 추가 (7항목 — v2 신규)
- [ ] authored CSS 값 사용 (auto, %, flex → authored 우선)
- [ ] 형제 요소 간격 일치 (gap, margin 기반)
- [ ] 너비 체인 정확성 (maxWidth → padding → content)
- [ ] SVG 내부 속성 보존 (stroke-opacity, fill 등)
- [ ] 패턴 변형 올바르게 분류 (text-top vs image-top vs horizontal)
- [ ] 듀얼 페이지 수치 비교 통과 (오차 ≤ 3px)
- [ ] 에셋 다운로드/참조/플레이스홀더 올바르게 처리

---

## CSS 변수 추출

Phase 2 (MEASURE)에서 Script E가 자동으로 수집합니다. 추출된 변수는 Phase 4에서 `:root` 블록으로 출력됩니다.

---

## 인터랙션 추출

hover/active/focus 상태의 스타일 차이를 감지하려면:

```javascript
// DevTools를 통한 hover 상태 CSS 변화 추출
evaluate_script({ function: `() => {
  const el = document.querySelector('__SELECTOR__');
  if (!el) return { error: 'not found' };

  // 1. 기본 상태 측정
  const base = window.getComputedStyle(el);
  const baseStyles = {
    transform: base.transform,
    boxShadow: base.boxShadow,
    backgroundColor: base.backgroundColor,
    color: base.color,
    borderColor: base.borderColor,
    opacity: base.opacity,
    textDecoration: base.textDecoration,
    outline: base.outline
  };

  // 2. CSS 규칙에서 :hover 선택자 찾기
  const hoverRules = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText && rule.selectorText.includes(':hover')) {
          try {
            const baseSelector = rule.selectorText.replace(/:hover/g, '');
            if (el.matches(baseSelector) || el.closest(baseSelector)) {
              for (const prop of rule.style) {
                hoverRules[prop] = rule.style.getPropertyValue(prop);
              }
            }
          } catch(e) {}
        }
      }
    } catch(e) { /* CORS */ }
  }

  return { baseStyles, hoverRules };
}` })
```

---

## 사용 예시

### 기본 사용
```
/clone-ui-v2 https://stripe.com
```

### 특정 섹션 + precise 모드
```
/clone-ui-v2 https://stripe.com nav ./my-nav vanilla precise download
```

### React 컴포넌트 + fast 모드
```
/clone-ui-v2 https://linear.app hero ./components react fast reference
```

### 대화형
```
"linear.app의 히어로 섹션을 React 컴포넌트로 클론해줘"
```
