---
name: clone-ui-v2
description: 레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 완벽하게 클론합니다
agents:
  - ui-extractor
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
    description: "품질 모드 (fast: 빠른 추출, precise: 정밀 검증 포함)"
    required: false
    default: "precise"
  - name: assets
    description: "에셋 처리 (download: 실제 다운로드, reference: 원본 URL 유지, placeholder: 대체 이미지)"
    required: false
    default: "download"
---

# UI Clone v2 Command

레퍼런스 사이트의 UI 컴포넌트를 Chrome DevTools Protocol로 분석하고 완벽하게 클론합니다.

## 실행 절차

### Step 1: 브라우저 준비

1. `new_page`로 레퍼런스 URL 열기
2. 페이지 로드 대기
3. originalPageId 기록 (듀얼 페이지 검증용)

```
사용자가 제공한 정보:
- URL: $url
- 섹션: $selector
- 출력 위치: $output
- 프레임워크: $framework
- 품질: $quality
- 에셋: $assets
```

### Step 2: 섹션 식별

`$selector` 값에 따른 CSS 선택자 매핑:

| 입력 | CSS 선택자 |
|------|-----------|
| nav, navigation, header | nav, .nav, .navbar, header, .header, [role="navigation"] |
| hero | .hero, .hero-section, section:first-of-type, main > section:first-child |
| footer | footer, .footer, [role="contentinfo"] |
| card | .card, [class*="card"], article |
| button | button, .btn, .button, [role="button"] |
| form | form, .form, [role="form"] |
| modal | .modal, [role="dialog"], .dialog |
| sidebar | aside, .sidebar, nav[class*="side"] |
| 기타 | 그대로 CSS 선택자로 사용 |

**주의**: Page Survey (Script A) 결과로 정확한 선택자를 확인한 후 사용하세요.

### Step 3: 5단계 파이프라인 실행

**⚠️ MANDATORY EXECUTION PROTOCOL**

반드시 **UI Extractor 에이전트** (`agents/ui-extractor.md`)를 delegation하여 실행하세요.
에이전트의 **MANDATORY EXECUTION PROTOCOL v2.1**을 따르세요.

에이전트에는 검증된 13개 스크립트가 정의되어 있습니다:
- `pageSurveyFn` (Script A) — 페이지 구조 파악
- `headResourceFn` (Script G) — CDN CSS, 폰트, meta, favicon
- `deepMeasurementFn` (Script B) — 40+ CSS 속성 추출
- `pseudoElementFn` (Script B2) — ::before/::after
- `authoredCSSFn` (Script C) — auto, %, flex 원본값
- `assetAnalysisFn` (Script E) — 이미지, SVG, video
- `imageContainerFn` (Script J) — 이미지-컨테이너 관계, sizingStrategy
- `stylesheetRulesFn` (Script H) — @keyframes, @font-face
- `interactionStateFn` (Script I) — hover, group-hover, ancestorHoverPatterns
- `widthChainFn` (Script F) — 너비 체인 분석
- `patternRecognitionFn` (Script D) — 패턴 인식

**🚫 절대 자체 스크립트를 작성하지 마세요.** 에이전트의 검증된 스크립트를 사용해야만 정확한 클론이 가능합니다.

**핵심 규칙**:
1. 10개 스크립트를 **순서대로 모두** 실행
2. 각 스크립트 실행 후 "✓ Script X: [요약]" 출력
3. **10/10 완료 확인 후에만** Phase 3 진행

**Phase 전환 조건**:

| 전환 | 조건 | 미충족 시 |
|------|------|----------|
| Phase 2 → 3 | "=== ALL 10/10 SCRIPTS EXECUTED ===" 출력됨 | 누락 스크립트 실행 |
| Phase 3 → 4 | 분석 전략 문서화됨 | 재분석 |
| Phase 4 → 5 | HTML/CSS 파일 생성됨 | 재생성 |

**절대 금지 사항**:
- 스크립트 건너뛰기
- 자체 스크립트 작성
- 결과 확인 없이 Phase 전환

---

quality 모드에 따라 실행 범위가 다릅니다.

#### precise 모드 (기본)

```
Phase 1: SURVEY    → pageSurveyFn + headResourceFn (Script G) + 전체 스크린샷
Phase 2: MEASURE   → 아래 "Phase 2 필수 실행 순서" 참조
Phase 3: ANALYZE   → patternRecognitionFn + HTML 재구성 판단 + Authored vs Computed 결정
                     + Head 리소스 전략 (3-E) + Animation/Font 전략 (3-F)
                     + 인터랙션 전략 (3-G) + 이미지 배치 전략 (3-H)
Phase 4: GENERATE  → HTML <head>(CDN CSS, meta, favicon)
                     + CSS(@font-face, @keyframes, ::before/::after, :hover 포함)
                     + JS(드롭다운, 모바일 메뉴 등) + 에셋 다운로드(fonts/ 포함)
Phase 5: VERIFY    → 듀얼 페이지 수치 검증 (최대 3회 반복)
```

##### Phase 2: MEASURE 필수 실행 순서

**⚠️ CRITICAL**: 다음 스크립트들을 **순서대로 모두 실행**해야 합니다. 건너뛰지 마세요.

| 순서 | 실행 명령 | 설명 |
|------|----------|------|
| 1 | `evaluate_script({ function: deepMeasurementFn })` | 40+ CSS 속성 추출 |
| 2 | `evaluate_script({ function: pseudoElementFn })` | ::before/::after 스타일 |
| 3 | `evaluate_script({ function: authoredCSSFn })` | auto, %, flex 원본값 |
| 4 | `evaluate_script({ function: assetAnalysisFn })` | 이미지, SVG, video, iframe |
| 5 | **`evaluate_script({ function: imageContainerFn })`** | ⚠️ **MUST** 이미지-컨테이너 관계 |
| 6 | `evaluate_script({ function: stylesheetRulesFn })` | @keyframes, @font-face |
| 7 | **`evaluate_script({ function: interactionStateFn })`** | ⚠️ **MUST** hover + ancestorHoverPatterns |
| 8 | `evaluate_script({ function: widthChainFn })` | 너비 체인 |

**⚠️ 경고**:
- **Script J (imageContainerFn)를 건너뛰면** 이미지가 잘못된 크기(예: 임의의 200px)로 생성됩니다.
- **Script I (interactionStateFn)를 건너뛰면** group-hover 효과가 CSS에 포함되지 않습니다.

Phase 3으로 진행하기 전에 위 8개 스크립트가 **모두 실행되었는지 확인**하세요.

#### fast 모드

```
Phase 1: SURVEY    → pageSurveyFn + 전체 스크린샷
Phase 2: MEASURE   → deepMeasurementFn (배치 1회) + assetAnalysisFn
Phase 3: (건너뜀)
Phase 4: GENERATE  → HTML/CSS 코드 생성 + 에셋 처리
Phase 5: (건너뜀)  → 스크린샷 비교만
```

### Step 4: 코드 생성

#### vanilla (기본값)
```
$output/
├── index.html          # <head> 리소스(CDN CSS, meta, favicon) 포함
├── styles.css          # @font-face, @keyframes, ::before/::after, :hover 포함
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
    └── report.json     # 검증 결과 (precise 모드)
```

#### react
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

#### vue
```
$output/
├── components/
│   └── [ComponentName].vue  # SFC
├── styles/
│   └── variables.css
├── assets/
├── screenshots/
└── verify/
    └── report.json
```

#### nextjs
```
$output/
├── components/
│   └── [ComponentName]/
│       ├── index.tsx
│       ├── [ComponentName].tsx
│       └── [ComponentName].module.css
├── styles/
│   └── globals.css
├── app/
│   └── page.tsx         # 사용 예시
├── assets/
├── screenshots/
└── verify/
    └── report.json
```

### Step 5: 듀얼 페이지 검증 (precise 모드)

```
1. new_page(url: "file:///$output/index.html")       → 클론 페이지 열기
2. select_page(pageId: originalPageId)                → 원본으로 전환
3. evaluate_script → 원본 셀렉터별 getBoundingClientRect 수집
4. take_screenshot → 원본 섹션별 스크린샷
5. select_page(pageId: clonePageId)                   → 클론으로 전환
6. navigate_page(type: "reload", ignoreCache: true)   → 최신 CSS 반영
7. evaluate_script → 클론 셀렉터별 측정
8. take_screenshot → 클론 섹션별 스크린샷
9. 비교: dimensions ≤3px, color 정확일치
10. 오차 발견 시: CSS 수정 → reload → 재측정 (최대 3회)
11. report.json 생성
```

## 사용 예시

### 기본 사용 (전체 페이지, precise)
```
/clone-ui-v2 https://stripe.com
```

### 특정 섹션 지정
```
/clone-ui-v2 https://stripe.com nav ./my-nav
```

### React 컴포넌트로 출력
```
/clone-ui-v2 https://linear.app hero ./components react
```

### 빠른 모드 (검증 건너뛰기)
```
/clone-ui-v2 https://vercel.com footer ./src vanilla fast
```

### 에셋 URL 유지 (다운로드 안 함)
```
/clone-ui-v2 https://example.com hero ./output vanilla precise reference
```

### 플레이스홀더 이미지 사용
```
/clone-ui-v2 https://example.com .features ./output react fast placeholder
```

## 주의사항

1. **CORS**: 일부 사이트는 외부 스타일시트 접근이 제한될 수 있음 → authored CSS 추출이 부분적으로 실패하며 computed로 fallback
2. **동적 콘텐츠**: JavaScript로 렌더링되는 요소는 페이지 로드 후 추출
3. **저작권**: 클론한 UI는 학습/참고 목적으로만 사용
4. **에셋**: 원본 사이트의 이미지는 `assets` 인자로 처리 방식 선택 가능
5. **file:// URL**: 듀얼 페이지 검증에서 로컬 파일을 열 때 절대 경로 필요

## 트러블슈팅

### "Element not found" 에러
- Page Survey (Script A)로 정확한 선택자 재확인
- 동적으로 렌더링되는 요소인지 확인
- 페이지 로드 완료 대기

### 스타일이 다르게 보임
- authored CSS vs computed CSS 결정 확인 (특히 `auto`, `%`, `flex`)
- CSS 변수가 올바르게 추출되었는지 확인
- 미디어 쿼리 적용 여부 확인
- Width Chain으로 컨테이너 계층 검증

### 애니메이션이 작동하지 않음
- transition/animation 속성 확인
- JavaScript 이벤트 리스너 확인
- 라이브러리 의존성 확인 (GSAP, Framer Motion 등)

### 에셋 다운로드 실패
- CORS나 인증으로 다운로드 차단 시 `assets: reference`로 전환
- WebP/AVIF 등 형식 문제 시 확인 필요

### hover 효과가 재현되지 않음
- Script I (interactionStateFn) 결과 확인: `interactiveElements` 배열에 해당 요소 포함 여부
- CSS에 `:hover` 규칙이 포함되었는지 확인 (styles.css 섹션 7)
- `transition` 속성이 기본 스타일에 포함되었는지 확인
- `@media (hover: hover)` 블록이 CSS에 포함되었는지 확인 (Tailwind이 생성하는 경우)
- 복합 선택자 (.parent:hover .child)의 구조가 HTML과 일치하는지 확인

### @keyframes 애니메이션이 동작하지 않음
- Script H (stylesheetRulesFn) 결과 확인: `corsBlockedSheets` 수 확인
- CORS 차단 시 원본 CDN `<link>` 태그로 직접 참조
- styles.css에 @keyframes 블록이 포함되었는지 확인
- animation 속성이 해당 요소에 적용되었는지 확인

### 폰트가 원본과 다르게 보임
- Script G (headResourceFn) 결과에서 폰트 preload 링크 확인
- Script H (stylesheetRulesFn) 결과에서 @font-face 선언 확인
- woff2 파일이 assets/fonts/에 다운로드되었는지 확인
- styles.css @font-face의 src URL 경로가 올바른지 확인
- font-display: swap 적용 여부 확인

### ::before/::after가 누락됨
- Script B2 (pseudoElementFn) 결과에서 해당 요소의 pseudo-element 확인
- content 속성값이 정확히 포함되었는지 확인 (빈 문자열 `""` 포함)
- position, z-index 등 레이아웃 속성이 보존되었는지 확인

### Tailwind 클래스가 적용되지 않음
- v2는 Tailwind 유틸리티 클래스가 아닌 computed → custom CSS로 변환합니다
- 원본의 Tailwind 클래스 대신 추출된 스타일값이 styles.css에 포함됩니다
- CDN Tailwind CSS가 필요한 경우 Script G에서 추출한 CDN `<link>`로 포함

### 리로드해도 변경이 안 보임
- `navigate_page({ type: "reload", ignoreCache: true })` 사용 (캐시 무시 필수)
- 파일이 올바르게 저장되었는지 확인

### 이미지가 컨테이너보다 너무 작음
- Script J (imageContainerFn) 결과에서 sizingStrategy 확인
- FILL_CONTAINER/CONTAIN_FIT인데 max-width가 고정 px → `max-width: 100%`로 수정
- object-fit이 fill로 되어 있으면 원본의 object-fit 값으로 교체
- 컨테이너의 width/height가 원본과 일치하는지 확인

### 이미지 가장자리 페이드 효과 없음
- Script J 결과에서 overlays 배열 확인
- 오버레이 div가 CSS에 포함되었는지 확인 (position: absolute, gradient 값)
- overlay의 opacity, pointer-events 확인
- 컨테이너에 `position: relative`가 설정되어 있는지 확인

### group hover 효과 미동작
- Script I의 ancestorHoverPatterns 결과 확인
- CSS에 `.group:hover .child` 형태의 규칙 포함 여부
- HTML에 group 클래스 적용 여부
- JS에서 hover 이벤트로 구현 시 mouseenter/mouseleave 확인

### 여러 페이지 간 전환이 안 됨
- `list_pages`로 현재 열린 페이지 목록과 pageId 확인
- 닫힌 페이지의 pageId를 사용하면 에러 발생
- 필요 시 `new_page`로 다시 열기
