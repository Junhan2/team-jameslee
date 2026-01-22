---
name: clone-ui
description: 레퍼런스 사이트의 UI를 완벽하게 클론합니다
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
---

# UI Clone Command

레퍼런스 사이트의 UI 컴포넌트를 Claude in Chrome으로 분석하고 완벽하게 클론합니다.

## 실행 절차

### Step 1: 브라우저 준비

1. Chrome 브라우저 탭 컨텍스트 확인
2. 레퍼런스 URL로 이동
3. 페이지 로드 대기

```
사용자가 제공한 정보:
- URL: $url
- 섹션: $selector
- 출력 위치: $output
- 프레임워크: $framework
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

### Step 3: CSS 추출 실행

다음 정보를 추출합니다:

1. **구조 (HTML)**
   - 요소 계층 구조
   - 클래스명/ID
   - 속성값

2. **스타일 (CSS)**
   - Computed styles
   - CSS 변수
   - 미디어 쿼리

3. **인터랙션 (JS)**
   - hover 상태
   - click 핸들러
   - 애니메이션

4. **에셋**
   - 이미지 URL
   - 아이콘 (SVG/아이콘폰트)
   - 폰트

### Step 4: 코드 생성

#### vanilla (기본값)
```
$output/
├── index.html      # 메인 HTML
├── styles.css      # 모든 스타일
└── scripts.js      # 인터랙션 로직
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
└── App.tsx         # 사용 예시
```

#### vue
```
$output/
├── components/
│   └── [ComponentName].vue
├── styles/
│   └── variables.css
└── App.vue         # 사용 예시
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
└── app/
    └── page.tsx    # 사용 예시
```

### Step 5: 검증

1. 로컬 서버 시작 (python -m http.server)
2. 브라우저에서 결과물 확인
3. 원본과 시각적 비교
4. 필요시 수정

## 사용 예시

### 기본 사용
```
/clone-ui https://stripe.com
```

### 특정 섹션 지정
```
/clone-ui https://stripe.com nav ./my-nav
```

### React 컴포넌트로 출력
```
/clone-ui https://linear.app hero ./components react
```

### Next.js 프로젝트용
```
/clone-ui https://vercel.com footer ./src nextjs
```

## 주의사항

1. **CORS**: 일부 사이트는 외부 스타일시트 접근이 제한될 수 있음
2. **동적 콘텐츠**: JavaScript로 렌더링되는 요소는 페이지 로드 후 추출
3. **저작권**: 클론한 UI는 학습/참고 목적으로만 사용
4. **에셋**: 원본 사이트의 이미지는 별도 다운로드 또는 대체 필요

## 트러블슈팅

### "Element not found" 에러
- 페이지 로드가 완료될 때까지 대기
- 선택자가 정확한지 확인
- 동적으로 렌더링되는 요소인지 확인

### 스타일이 다르게 보임
- 폰트가 로드되었는지 확인
- CSS 변수가 올바르게 추출되었는지 확인
- 미디어 쿼리 적용 여부 확인

### 애니메이션이 작동하지 않음
- transition/animation 속성 확인
- JavaScript 이벤트 리스너 확인
- 라이브러리 의존성 확인 (GSAP, Framer Motion 등)
