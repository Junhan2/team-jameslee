# UI Cloner Plugin

레퍼런스 웹사이트의 UI 컴포넌트를 완벽하게 클론하는 Claude Code 플러그인입니다.

## 기능

- **CSS 자동 추출**: Claude in Chrome으로 실제 렌더링된 스타일 추출
- **컴포넌트화**: React, Vue, Next.js 컴포넌트로 변환
- **인터랙션 복제**: hover, active 상태 및 애니메이션 포함
- **반응형 지원**: 미디어 쿼리 및 breakpoints 추출
- **다크모드**: 테마 변수 자동 추출

## 설치

플러그인은 이미 `.claude/plugins/ui-cloner/`에 설치되어 있습니다.

## 사용법

### 슬래시 명령어

```bash
/clone-ui <url> [selector] [output] [framework]
```

**예시:**
```bash
# 기본 사용 (전체 페이지)
/clone-ui https://stripe.com

# 네비게이션만 클론
/clone-ui https://stripe.com nav ./nav-clone

# React 컴포넌트로 출력
/clone-ui https://linear.app hero ./components react

# Next.js 프로젝트용
/clone-ui https://vercel.com footer ./src nextjs
```

### 자연어 요청

```
"stripe.com의 네비게이션을 클론해줘"
"linear.app의 Hero 섹션을 React 컴포넌트로 만들어줘"
"이 사이트의 카드 디자인 똑같이 복제해줘"
```

## 지원 프레임워크

| 프레임워크 | 출력 형식 |
|-----------|----------|
| vanilla (기본) | HTML + CSS + JS |
| react | TSX + CSS Modules |
| vue | Single File Component |
| nextjs | TSX + CSS Modules (App Router) |

## 추출되는 항목

### CSS 속성
- Layout: display, flex, grid, position
- Sizing: width, height, padding, margin, gap
- Visual: background, border, border-radius, box-shadow
- Typography: font-family, font-size, font-weight, color
- Animation: transition, transform, animation

### 인터랙션
- :hover 상태
- :active 상태
- :focus 상태
- JavaScript 이벤트 핸들러

### 에셋
- 이미지 URL
- SVG 아이콘
- 웹폰트

## 플러그인 구조

```
ui-cloner/
├── plugin.json           # 플러그인 메타데이터
├── README.md             # 이 파일
├── skills/
│   └── ui-clone.md       # UI 클론 스킬 정의
├── commands/
│   └── clone-ui.md       # /clone-ui 명령어
└── agents/
    └── ui-extractor.md   # CSS 추출 에이전트
```

## 워크플로우

```
1. URL 입력
   ↓
2. Chrome 브라우저 열기
   ↓
3. 페이지 로드 & 스냅샷
   ↓
4. 타겟 요소 식별
   ↓
5. CSS Computed Styles 추출
   ↓
6. 자식 요소 스타일 추출
   ↓
7. Hover/Active 상태 캡처
   ↓
8. CSS 변수 & 미디어 쿼리 추출
   ↓
9. 코드 생성 (선택한 프레임워크)
   ↓
10. 로컬 서버로 검증
```

## 주의사항

1. **저작권**: 클론한 UI는 학습/참고 목적으로만 사용하세요
2. **에셋**: 원본 사이트의 이미지/폰트는 별도 라이센스 확인 필요
3. **CORS**: 일부 외부 스타일시트는 접근이 제한될 수 있음
4. **동적 콘텐츠**: SPA는 페이지 로드 후 렌더링 대기 필요

## 트러블슈팅

### Chrome 연결 실패
- Claude in Chrome 확장 프로그램이 설치되어 있는지 확인
- 브라우저가 열려있는지 확인

### 스타일 추출 실패
- 페이지가 완전히 로드될 때까지 대기
- 선택자가 정확한지 확인 (스냅샷으로 검증)

### 결과물이 원본과 다름
- 폰트가 올바르게 로드되는지 확인
- CSS 변수가 모두 추출되었는지 확인
- 반응형 breakpoint 확인

## 라이센스

MIT License
