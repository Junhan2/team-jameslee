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
Phase 1: SURVEY    → Page Survey + Head Resource + 전체 스크린샷
Phase 2: MEASURE   → Deep Measurement + Pseudo-elements + Authored CSS
                     + Assets(확장) + Image-Container Analysis
                     + Stylesheet Rules + Interaction States (+ group-hover)
                     + Width Chain + 미디어 쿼리
Phase 3: ANALYZE   → 변형 분류 + HTML 재구성 판단 + Authored vs Computed 결정
                     + Head 리소스 전략 + Animation/Font 전략 + 인터랙션 전략
                     + 이미지 배치 전략
Phase 4: GENERATE  → HTML <head> + CSS(@font-face, @keyframes, :hover 포함)
                     + JS + 에셋 다운로드
Phase 5: VERIFY    → 듀얼 페이지 수치 검증 루프 (최대 3회)
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

### 섹션 수 검증 (v2.2)

**⚠️ MANDATORY**: pageSurvey 결과의 sectionCount를 확인하세요.

| 조건 | 조치 |
|------|------|
| sectionCount < 5 | 페이지가 단순하거나 감지 누락 → body 직접 자식 추가 스캔 |
| sectionCount ≥ 10 | **모든 10개+ 섹션 클론 필수** |
| 원본에 명확한 섹션이 더 있음 | pageSurvey 재실행 또는 수동 선택자 추가 |

**금지 사항**:
- ❌ "core sections only"로 자체 제한
- ❌ 섹션 일부만 선택하여 클론
- ❌ 원본보다 적은 섹션 수로 진행

### 1-3. Head 리소스 수집

```
# <head> 리소스 추출 (Script G: Head Resource)
evaluate_script({ function: headResourceFn })
```

수집 대상:
- CDN 스타일시트 URL (Next.js 번들 CSS 등)
- 폰트 preload 링크 (woff2 등)
- favicon/apple-touch-icon
- OG/Twitter meta 태그
- 인라인 `<style>` 내용
- preconnect/preload 힌트

### 1-4. 전체 스크린샷

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

### 2-2. Pseudo-Element Styles (Script B2)

::before/::after/::placeholder 스타일 추출:

```
evaluate_script({ function: pseudoElementFn })
```

- 장식 요소 (오버레이, 구분선, 배경 패턴)
- ::placeholder 입력 필드 스타일
- content 속성값 보존

### 2-3. Authored CSS (Script C)

원본 스타일시트에서 authored 값 추출:

```
evaluate_script({ function: authoredCSSFn })
```

- `auto`, `%`, `flex`, `0 auto` 등 computed에서 소실되는 값 복원
- CORS 차단 시 computed로 graceful fallback

### 2-4. Asset Analysis (Script E — 확장)

이미지, SVG, 폰트, CSS 변수, video, audio, iframe, 반응형 이미지 수집:

```
evaluate_script({ function: assetAnalysisFn })
```

확장 항목:
- `<video>` 속성 (src, poster, autoplay, loop, muted, controls, sources)
- `<audio>` 속성 (src, controls, sources)
- `<iframe>` 속성 (src, width, height, title, allow) — 기록만
- `<picture>` + `<img srcset>` 반응형 이미지

### 2-4.5. Image-in-Container Analysis (Script J)

이미지와 컨테이너의 관계를 분석:

```
evaluate_script({ function: imageContainerFn })
```

분석 항목:
- 이미지 sizing strategy (FILL_CONTAINER / CONTAIN_FIT / COVER_FIT / NATURAL_BOUNDED / FIXED_SIZE)
- 컨테이너 overflow 모드와 이미지 overflow 여부
- 그라디언트 오버레이 레이어 (radial/linear)
- scale transform에 의한 의도적 overflow
- 이미지-컨테이너 크기 비율

### 2-5. Stylesheet Rules (Script H)

@keyframes, @font-face, CSS-in-JS 규칙 추출:

```
evaluate_script({ function: stylesheetRulesFn })
```

- @keyframes: 애니메이션 이름, 프레임별 속성, cssText
- @font-face: fontFamily, src (woff2 URL), fontWeight, fontDisplay
- CSS-in-JS: styled-components, emotion, JSS 마커 감지
- CORS 차단 시트 수 기록

### 2-6. Interaction States (Script I)

hover/active/focus 인터랙션 스타일 추출:

```
evaluate_script({ function: interactionStateFn })
```

- CSS 규칙에서 :hover/:active/:focus/:focus-visible 선택자 파싱
- 각 인터랙티브 요소의 기본 상태 + 인터랙션 속성 매칭
- transition 속성 감지 (duration, timing-function)
- `@media (hover: hover)` 블록 내부 규칙 수집

### 2-7. Width Chain (Script F)

타겟 요소 → body까지 width/maxWidth/padding 역추적:

```
evaluate_script({ function: widthChainFn })
```

### 2-8. 섹션별 스크린샷

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

### 2-9. 미디어 쿼리 추출

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

### 2-10. Phase 2 완료 체크포인트 (MANDATORY)

**⚠️ 이 체크포인트는 건너뛸 수 없습니다.**

Phase 3로 진행하기 전에 다음 출력을 **반드시** 생성하세요:

```
=== PHASE 2 EXECUTION SUMMARY ===
✓ Script A (pageSurveyFn) - completed: {sectionCount} sections
✓ Script G (headResourceFn) - completed: {stylesheetCount} stylesheets
✓ Script B (deepMeasurementFn) - completed: {totalExtracted} properties
✓ Script B2 (pseudoElementFn) - completed: {pseudoCount} pseudo-elements
✓ Script C (authoredCSSFn) - completed: {corsBlockedSheets} CORS blocked
✓ Script E (assetAnalysisFn) - completed: {imageCount} images
✓ Script J (imageContainerFn) - completed: {totalImages} image relations [CRITICAL]
✓ Script H (stylesheetRulesFn) - completed: {keyframeCount} keyframes
✓ Script I (interactionStateFn) - completed: {ancestorHoverCount} group-hover [CRITICAL]
✓ Script F (widthChainFn) - completed: chain depth {chainLength}
=== ALL 10/10 SCRIPTS EXECUTED - PROCEED TO PHASE 3 ===
```

**자기 검증 질문** (마음속으로 확인):
- [ ] Script J를 실행했는가? → imageContainerFn 결과가 있는가?
- [ ] Script I를 실행했는가? → interactionStateFn 결과가 있는가?
- [ ] 10개 스크립트 모두 "✓ completed" 상태인가?

**하나라도 "아니오"면**: Phase 3로 진행하지 말고 누락된 스크립트를 실행하세요.

### 스크립트 실행 테이블

| # | 스크립트 | 함수명 | 필수 | 미실행 시 버그 |
|---|---------|--------|------|----------------|
| 1 | Page Survey (Script A) | `pageSurveyFn` | ✓ | 섹션 식별 불가 |
| 2 | Head Resource (Script G) | `headResourceFn` | ✓ | 폰트가 시스템 기본값으로 대체 |
| 3 | Deep Measurement (Script B) | `deepMeasurementFn` | ✓ | 스타일 추출 불가 |
| 4 | Pseudo-Element (Script B2) | `pseudoElementFn` | ✓ | ::before/::after 장식 누락 |
| 5 | Authored CSS (Script C) | `authoredCSSFn` | ✓ | flex, auto, % 값이 px 고정 |
| 6 | Asset Analysis (Script E) | `assetAnalysisFn` | ✓ | 이미지/SVG 목록 누락 |
| 7 | **Image-Container (Script J)** | `imageContainerFn` | **✓ MUST** | **이미지가 임의 200px로 생성** |
| 8 | Stylesheet Rules (Script H) | `stylesheetRulesFn` | ✓ | @keyframes 애니메이션 안 됨 |
| 9 | **Interaction States (Script I)** | `interactionStateFn` | **✓ MUST** | **group-hover 효과 누락** |
| 10 | Width Chain (Script F) | `widthChainFn` | ✓ | 컨테이너 너비 계산 오류 |

**PROHIBITION**: 위 체크리스트가 10/10이 아니면 Phase 3로 진행하지 마세요.

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

### 3-E. Head 리소스 전략

Script G 결과를 기반으로 `<head>` 리소스 처리:

| 리소스 | 처리 |
|--------|------|
| CDN CSS (Next.js 번들 등) | `<link rel="stylesheet">` 태그로 포함 |
| preconnect/preload | 그대로 포함 (로드 성능 유지) |
| favicon | assets 모드에 따라 다운로드 or 원본 URL 참조 |
| OG/Twitter meta | 그대로 포함 |
| 인라인 `<style>` | 내용이 필요한 경우 styles.css에 병합 |

### 3-E-2. 폰트 적용 순서 (v2.2 CRITICAL)

**⚠️ MANDATORY**: 폰트는 다음 순서로 적용하세요. 순서를 바꾸지 마세요.

| 우선순위 | 소스 | 적용 방법 |
|---------|------|----------|
| **1순위** | headResource의 Google Fonts/CDN 링크 | `<head>`에 `<link>` 태그 그대로 포함 |
| **2순위** | @font-face 선언 (Script H) | styles.css 최상단에 포함, woff2 다운로드 |
| **3순위** | computed fontFamily | fallback으로만 사용 |

**필수 포함 예시**:
```html
<head>
  <!-- 1순위: 원본 사이트의 폰트 CDN 링크 (Script G에서 추출) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- 자체 CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
```

**금지 사항**:
- ❌ 폰트 CDN 링크 누락
- ❌ 임의로 다른 폰트(Space Grotesk, Lora 등) 사용
- ❌ computed fontFamily만 사용하고 CDN 링크 생략

### 3-F. Animation/Font 전략

Script H 결과를 기반으로 처리:

| 항목 | 처리 |
|------|------|
| @keyframes | cssText 그대로 styles.css 상단에 포함 |
| @font-face | styles.css 최상단에 포함, woff2 파일은 assets 모드에 따라 다운로드 |
| CSS-in-JS (styled-components/emotion) | styles.css에 인라인 (프레임워크 종속 제거) |
| CORS 차단 시트 | 원본 CDN `<link>` 태그로 직접 참조 |

### 3-G. 인터랙션 전략

**⚠️ 전제조건**: Script I (interactionStateFn) 실행 결과가 **반드시** 있어야 합니다.
결과가 없으면 Phase 2로 돌아가 `evaluate_script({ function: interactionStateFn })`을 실행하세요.

**Script I 결과 필수 필드**:
- `interactiveElements[]` — :hover/:active/:focus 규칙이 있는 요소들
- `ancestorHoverPatterns[]` — group-hover 패턴 (부모:hover → 자식 스타일 변화)
- `hoverMediaRules[]` — `@media (hover: hover)` 블록 내부 규칙

Script I 결과를 기반으로 처리:

| 항목 | 처리 |
|------|------|
| :hover 규칙 | CSS에 선택자 + 속성 그대로 포함 |
| :active/:focus 규칙 | CSS에 포함 |
| :focus-visible 규칙 | CSS에 포함 (접근성 유지) |
| transition 속성 | 기본 스타일에 transition 속성 포함 |
| @media (hover: hover) | 미디어 쿼리 블록으로 포함 |
| 복합 선택자 (.btn:hover .icon) | 원본 선택자 구조 보존 |

### 3-H. 이미지 배치 전략

**⚠️ 전제조건**: Script J (imageContainerFn) 실행 결과가 **반드시** 있어야 합니다.
결과가 없으면 Phase 2로 돌아가 `evaluate_script({ function: imageContainerFn })`을 실행하세요.

**Script J 결과 필수 필드**:
- `images[].sizingStrategy` — 이미지 크기 결정 전략 (FILL_CONTAINER, CONTAIN_FIT, COVER_FIT, NATURAL_BOUNDED, FIXED_SIZE)
- `images[].overlays[]` — 그라디언트 오버레이 정보
- `images[].relationship.hasScaleTransform` — scale 변환 여부
- `images[].container.overflow` — 컨테이너 overflow 모드

Script J 결과를 기반으로 각 이미지의 코드 생성 전략 결정:

| sizingStrategy | CSS 생성 규칙 |
|----------------|---------------|
| FILL_CONTAINER | `width: 100%; height: 100%; object-fit: contain/cover` |
| CONTAIN_FIT | `width: 100%; height: 100%; object-fit: contain; aspect-ratio: W/H` |
| COVER_FIT | `width: 100%; height: 100%; object-fit: cover` |
| NATURAL_BOUNDED | `max-width: 100%; height: auto` |
| FIXED_SIZE | `width: Npx; height: Npx` |

#### 그라디언트 오버레이 처리
오버레이가 감지된 경우:
- 컨테이너에 `position: relative` 설정
- 이미지 뒤에 `position: absolute; inset: 0` 오버레이 div 생성
- `background-image`에 추출된 gradient 값 그대로 적용
- `pointer-events: none; opacity: N` 적용

#### scale transform 처리
hasScaleTransform이 true인 경우:
- 이미지에 `transform: scale(1.01)` 적용
- 컨테이너에 `overflow: hidden` 확인 (가장자리 clipping 효과)

#### overflow 전략

| 원본 overflow | 이미지 관계 | 처리 |
|---------------|-------------|------|
| hidden + 이미지 fills | 일반 채우기 | `overflow: hidden` 유지 |
| hidden + scale transform | 의도적 bleed | `overflow: hidden` + `transform: scale()` |
| visible + 이미지 overflows | 의도적 overflow | `overflow: visible` 유지 (중요!) |
| hidden + 이미지 smaller | 일반 배치 | `overflow: hidden` 유지 |

#### 금지 규칙 (MUST NOT)
- **max-width를 임의의 고정 px 값으로 설정하지 않기** (예: max-width: 200px)
- Script J의 sizingStrategy가 FILL_CONTAINER/CONTAIN_FIT이면 반드시 width: 100% 사용
- 원본에서 overflow: visible인 컨테이너를 overflow: hidden으로 바꾸지 않기

---

## Phase 4: GENERATE (코드 생성)

### 4-1. HTML `<head>` 생성

Script G 결과를 기반으로 `<head>` 구성:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloned from [URL]</title>
  <!-- Script G: CDN CSS -->
  <link rel="preconnect" href="...">
  <link rel="stylesheet" href="...">
  <!-- Script G: favicon -->
  <link rel="icon" href="assets/icons/favicon.ico">
  <!-- Script G: OG/Twitter meta -->
  <meta property="og:image" content="...">
  <!-- 자체 CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
```

### 4-2. HTML `<body>` 생성

Phase 3의 판단을 기반으로 HTML 작성:
- 원본 구조 유지 또는 시맨틱 재구성
- 변형 분류 결과 반영 (반복 요소 → 컴포넌트화)
- 에셋 모드 반영
- `<video>`, `<iframe>` 속성 보존 (Script E 확장)

### 4-3. CSS 생성

```css
/* ============================================
   [Component] - Cloned from [URL]
   ============================================ */

/* 1. @font-face (Script H) */
@font-face {
  font-family: '...';
  src: url('assets/fonts/...woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* 2. @keyframes (Script H) */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 3. CSS Variables (Script E) */
:root {
  /* Phase 2에서 추출한 CSS 변수 */
}

/* 4. Reset & Base */

/* 5. Component Styles (Script B + C) */
/* Authored 값 우선, fallback으로 computed */

/* 5.5. Image-in-Container (Script J) */
.card-image-container {
  position: relative;
  overflow: hidden; /* or visible — Script J 결과에 따름 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Script J sizingStrategy에 따름 */
  /* aspect-ratio: 500 / 342; — 원본 비율 보존 시 */
  /* transform: scale(1.01); — 의도적 bleed 시 */
}
/* Gradient overlays */
.card-image-container .overlay-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.7;
  background-image: radial-gradient(...); /* Script J에서 추출한 값 */
}

/* 6. Pseudo-elements (Script B2) */
.element::before {
  content: "";
  /* 추출된 pseudo-element 스타일 */
}

/* 7. Interaction States (Script I) */
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
.feature-card:hover {
  box-shadow: ...;
  transform: ...;
}

/* 8. Responsive */
@media (hover: hover) { /* Script I hover media 규칙 */ }
@media (max-width: 768px) { /* Phase 2 미디어 쿼리 */ }
```

우선순위 규칙:
1. **authored 값** (%, auto, flex, calc) → 반응형 유지
2. **computed 값** (px) → 고정 크기
3. **CSS 변수** → 원본과 동일한 변수명 사용

### 4-4. 에셋 다운로드

`assets: download` 모드일 때:

```bash
# Bash 도구로 이미지 다운로드
curl -sL "https://example.com/image.png" -o "$output/assets/images/image.png"
```

SVG는 outerHTML에서 직접 추출하여 파일로 저장.

### 4-5. 출력 구조

#### Vanilla (기본)
```
$output/
├── index.html          # <head> 리소스 포함
├── styles.css          # @font-face, @keyframes, :hover 포함
├── scripts.js          # 드롭다운, 모바일 메뉴 등 인터랙션
├── assets/
│   ├── images/         # 다운로드된 이미지 (PNG, JPG, 배경 SVG)
│   ├── icons/          # 아이콘 SVG, favicon
│   └── fonts/          # woff2 웹폰트 파일 [NEW]
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
- 모든 스크립트 (A~J, B2) 실행
- authored vs computed 비교
- 패턴 분류 + 변형 처리
- Head 리소스 + @font-face/@keyframes + 인터랙션 상태 포함
- ::before/::after pseudo-element 보존
- 이미지-컨테이너 관계 분석 + 그라디언트 오버레이 + group-hover
- 듀얼 페이지 수치 검증 루프 (최대 3회)
- 검증 보고서 생성

---

## 체크리스트 (25항목)

클론 완료 후 자동 검증:

### 필수 (8항목 — 기본)
- [ ] 컨테이너 크기/패딩 일치
- [ ] border-radius 값 정확히 일치
- [ ] box-shadow 값 정확히 일치
- [ ] 폰트 스타일 일치 (family, size, weight, line-height)
- [ ] 색상값 일치 (color, backgroundColor)
- [ ] hover 인터랙션 작동
- [ ] 반응형 breakpoints 작동
- [ ] 다크모드 지원 (해당 시)

### v2 기본 (7항목)
- [ ] authored CSS 값 사용 (auto, %, flex → authored 우선)
- [ ] 형제 요소 간격 일치 (gap, margin 기반)
- [ ] 너비 체인 정확성 (maxWidth → padding → content)
- [ ] SVG 내부 속성 보존 (stroke-opacity, fill 등)
- [ ] 패턴 변형 올바르게 분류 (text-top vs image-top vs horizontal)
- [ ] 듀얼 페이지 수치 비교 통과 (오차 ≤ 3px)
- [ ] 에셋 다운로드/참조/플레이스홀더 올바르게 처리

### v2 확장 (10항목 — NEW)
- [ ] CDN 스타일시트가 `<head>`에 포함 (Script G)
- [ ] 웹폰트 (@font-face) 로드 확인 (Script H)
- [ ] @keyframes 애니메이션 정상 재생 (Script H)
- [ ] ::before/::after 의사 요소 보존 (Script B2)
- [ ] :hover 스타일 변화 정확 재현 (Script I)
- [ ] :focus/:active 상태 정확 재현 (Script I)
- [ ] `<video>`/`<iframe>` 요소 속성 보존 (Script E 확장)
- [ ] 이미지가 컨테이너를 올바르게 채움 (object-fit 정확, 임의 max-width 없음) (Script J)
- [ ] 그라디언트 오버레이 레이어 보존 (radial/linear-gradient) (Script J)
- [ ] group-hover 패턴 동작 (ancestor:hover → descendant 스타일 변화) (Script I 확장)

---

## CSS 변수 추출

Phase 2 (MEASURE)에서 Script E가 자동으로 수집합니다. 추출된 변수는 Phase 4에서 `:root` 블록으로 출력됩니다.

---

## 인터랙션 추출

> **참고**: 인터랙션 추출은 Phase 2의 **Script I (interactionStateFn)**가 자동으로 처리합니다.
> Script I는 모든 인터랙티브 요소에 대해 :hover/:active/:focus/:focus-visible 규칙을 CSS 시트에서 파싱하고,
> transition 속성과 `@media (hover: hover)` 블록까지 수집합니다.
> 별도의 수동 추출 스크립트는 필요하지 않습니다.

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
