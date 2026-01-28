---
name: clone-ui-v2
description: 레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 완벽하게 클론합니다
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

quality 모드에 따라 실행 범위가 다릅니다.

#### precise 모드 (기본)

```
Phase 1: SURVEY    → pageSurveyFn + 전체 스크린샷
Phase 2: MEASURE   → deepMeasurementFn + authoredCSSFn + assetAnalysisFn + widthChainFn
                     + 미디어 쿼리 + 섹션별 scrollIntoView + screenshot
Phase 3: ANALYZE   → patternRecognitionFn + HTML 재구성 판단 + Authored vs Computed 결정
Phase 4: GENERATE  → HTML/CSS/JS 코드 생성 + 에셋 처리
Phase 5: VERIFY    → 듀얼 페이지 수치 검증 (최대 3회 반복)
```

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
├── index.html          # 메인 HTML
├── styles.css          # 모든 스타일
├── scripts.js          # 인터랙션 로직 (있는 경우)
├── assets/
│   ├── images/         # 다운로드된 이미지
│   └── icons/          # 추출된 SVG
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

### hover 상태가 정확하지 않음
- DevTools hover 도구 사용 후 hover state가 persist될 수 있음
- `evaluate_script`로 CSS 규칙에서 `:hover` 선택자를 직접 읽어 정확한 hover 스타일 확인
- 스크린샷만 의존하지 말고 computed style 값으로 검증

### 리로드해도 변경이 안 보임
- `navigate_page({ type: "reload", ignoreCache: true })` 사용 (캐시 무시 필수)
- 파일이 올바르게 저장되었는지 확인

### 여러 페이지 간 전환이 안 됨
- `list_pages`로 현재 열린 페이지 목록과 pageId 확인
- 닫힌 페이지의 pageId를 사용하면 에러 발생
- 필요 시 `new_page`로 다시 열기
