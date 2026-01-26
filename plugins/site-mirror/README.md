# Site Mirror Plugin

웹사이트를 완벽하게 미러링하는 Claude Code 플러그인입니다.

## 개요

기존 `ui-cloner` 플러그인의 CSS 추출 방식(~60% 충실도)과 달리, **원본 파일 다운로드 + URL 치환** 방식으로 **~95% 충실도**를 달성합니다.

## ui-cloner vs site-mirror

| 항목 | ui-cloner | site-mirror |
|-----|-----------|-------------|
| **CSS 처리** | `getComputedStyle()` 추출 → 재생성 | 원본 CSS 파일 다운로드 |
| **HTML 처리** | 구조 분석 후 재구성 | `outerHTML` 그대로 저장 |
| **결과 충실도** | ~60% | ~95% |
| **오프라인 지원** | ❌ | ✅ |
| **용도** | 컴포넌트 분석, React/Vue 변환 | 완벽한 복제, 백업, 오프라인 열람 |

## 사용법

### 명령어

```
/mirror-site <url> [output-dir]
```

### 예시

```bash
# 기본 사용
/mirror-site https://example.com

# 출력 폴더 지정
/mirror-site https://example.com ./my-mirror

# 대화형
"example.com 사이트 미러링해줘"
"이 사이트 오프라인으로 저장해줘"
```

## 작동 방식

### Phase 1: 사전 분석
- 브라우저에서 페이지 열기
- 라이브러리/프레임워크 감지
- 디자인 시스템 추출
- 참조 스크린샷 캡처

### Phase 2: HTML 추출
```javascript
document.documentElement.outerHTML
```

### Phase 3: 리소스 URL 수집
- CSS 파일 (`link[rel="stylesheet"]`)
- JavaScript 파일 (`script[src]`)
- 이미지 (`img[src]`, `srcset`, `background-image`)
- 폰트 (CSS 내 `@font-face`)
- Lottie 애니메이션 (`.json`)

### Phase 4: 리소스 다운로드
```bash
curl -sL "$URL" -o assets/css/main.css
```

### Phase 5: URL 치환
```python
html = html.replace('https://cdn.example.com/logo.svg', './assets/images/logos/brand-logo.svg')
```

### Phase 6: 검증
```bash
python3 -m http.server 8080
# http://localhost:8080 에서 확인
```

## 출력 구조

```
output/
├── index.html              # URL 치환된 최종 HTML
├── raw.html                # 원본 HTML 백업
├── reference-fullpage.png  # 원본 스크린샷
├── clone-preview.png       # 클론 결과 스크린샷
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── vendor.css
│   ├── js/
│   │   ├── main.js
│   │   └── vendor.js
│   ├── images/
│   │   ├── logos/          # 브랜드 로고
│   │   ├── icons/          # UI 아이콘
│   │   ├── ui/             # UI 요소
│   │   ├── backgrounds/    # 배경 이미지
│   │   └── features/       # 기능 설명 이미지
│   ├── fonts/
│   └── animations/         # Lottie JSON
├── url-mappings.json       # CDN → 로컬 매핑 테이블
└── MIRROR_REPORT.md        # 결과 보고서
```

## 구성 요소

### 명령어
- **mirror-site**: `/mirror-site <url> [output-dir]`

### 스킬
- **site-mirror**: 트리거 문구로 자동 호출
  - "사이트 미러링해줘"
  - "웹사이트 복제해줘"
  - "오프라인으로 저장해줘"

### 에이전트
- **resource-downloader**: 리소스 다운로드 및 URL 매핑 전문

## 검증된 사이트

| 사이트 | 충실도 | 참고 |
|--------|--------|------|
| brainfishai.com | ~95% | Webflow + Lottie |

## 주의사항

1. **저작권**: 미러링된 콘텐츠는 학습/백업 목적으로만 사용
2. **동적 콘텐츠**: SPA는 페이지 로드 완료 후 추출 필요
3. **CORS**: 일부 CDN은 직접 다운로드가 제한될 수 있음
4. **용량**: 대형 사이트는 상당한 저장 공간 필요

## 관련 문서

- [brainfish-clone 성공 사례](../../brainfish-clone(success)/CLONE_PROCESS.md)
- [ui-cloner 플러그인](../ui-cloner/README.md)

## 라이선스

MIT License
