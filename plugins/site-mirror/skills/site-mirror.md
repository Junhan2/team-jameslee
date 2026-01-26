---
name: site-mirror
description: |
  웹사이트를 원본 파일 다운로드 + URL 치환 방식으로 완벽하게 미러링하는 스킬입니다.
  CSS 재생성 방식(ui-cloner)과 달리 원본 파일을 그대로 다운로드하여 ~95% 충실도를 달성합니다.

  다음과 같은 경우에 사용하세요:
  - "사이트 미러링해줘", "웹사이트 복제해줘"
  - "오프라인으로 저장해줘", "사이트 백업해줘"
  - "완벽하게 클론해줘" (CSS 추출이 아닌 원본 다운로드 원할 때)
  - "/mirror-site" 명령어 사용 시
---

# Site Mirror Skill

웹사이트의 원본 리소스를 다운로드하여 오프라인에서도 동작하는 완벽한 미러를 생성합니다.

## 핵심 원칙

### DO ✅
- **원본 HTML 추출**: `document.documentElement.outerHTML` 사용
- **원본 파일 다운로드**: CSS, JS, 이미지를 curl로 다운로드
- **URL 치환**: CDN URL → 로컬 경로 변환
- **시맨틱 네이밍**: 다운로드 파일에 의미있는 이름 부여

### DON'T ❌
- `getComputedStyle()` 사용하여 CSS 재생성
- HTML 구조 분석 후 재구성
- 인라인 스타일로 변환

## 워크플로우

### Phase 1: 정보 수집

사용자에게 다음 정보를 확인하세요:

1. **타겟 URL**: 미러링할 웹사이트 주소
2. **출력 위치**: 파일 저장 경로 (기본값: `./site-mirror-output`)
3. **추적 코드 제거**: Google Analytics 등 제거 여부 (선택)

### Phase 2: 사전 분석

```
1. 브라우저에서 페이지 열기
2. 라이브러리/프레임워크 감지 (Webflow, React, Vue 등)
3. 디자인 시스템 추출 (색상, 폰트, 간격)
4. 전체 페이지 참조 스크린샷 캡처
```

### Phase 3: HTML 추출

브라우저에서 JavaScript 실행:

```javascript
// 전체 HTML 추출
document.documentElement.outerHTML
```

결과를 `raw.html`로 저장합니다.

### Phase 4: 리소스 URL 수집

다음 리소스들의 URL을 수집:

| 리소스 타입 | 선택자/방법 |
|------------|-------------|
| CSS | `link[rel="stylesheet"]` |
| JS | `script[src]` |
| 이미지 | `img[src]`, `source[srcset]` |
| 배경 이미지 | `style` 속성의 `url()` |
| 폰트 | CSS 파일 내 `@font-face` |
| Lottie | `data-src`, `data-animation-path` |

### Phase 5: 리소스 다운로드

curl을 사용하여 리소스 다운로드:

```bash
# CSS
curl -sL "$CSS_URL" -o assets/css/main.css

# 이미지 (병렬 실행)
curl -sL "$IMG1" -o assets/images/logos/logo.svg &
curl -sL "$IMG2" -o assets/images/icons/arrow.svg &
wait
```

**시맨틱 네이밍 규칙**:

| 폴더 | 용도 | 예시 |
|------|------|------|
| `logos/` | 브랜드 로고 | `brand-logo.svg` |
| `icons/` | UI 아이콘 | `arrow-down.svg` |
| `ui/` | UI 요소 | `button-bg.png` |
| `backgrounds/` | 배경 이미지 | `hero-bg.avif` |
| `features/` | 기능 설명 | `feature-chat.png` |

### Phase 6: URL 치환

Python으로 CDN URL을 로컬 경로로 변환:

```python
mappings = {
    'https://cdn.example.com/style.css': './assets/css/main.css',
    'https://cdn.example.com/logo.svg': './assets/images/logos/brand-logo.svg',
}

for cdn_url, local_path in mappings.items():
    html = html.replace(cdn_url, local_path)
```

### Phase 7: 검증

1. 로컬 서버 실행: `python3 -m http.server 8080`
2. 브라우저에서 `http://localhost:8080` 확인
3. 원본과 클론 스크린샷 비교
4. 콘솔 에러 확인 (404, CORS 등)

## 출력 템플릿

### 폴더 구조

```
output/
├── index.html              # 최종 HTML (URL 치환 완료)
├── raw.html                # 원본 HTML 백업
├── reference-fullpage.png  # 원본 스크린샷
├── clone-preview.png       # 클론 결과 스크린샷
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   │   ├── logos/
│   │   ├── icons/
│   │   ├── ui/
│   │   ├── backgrounds/
│   │   └── features/
│   ├── fonts/
│   └── animations/
├── url-mappings.json       # URL 매핑 테이블
└── MIRROR_REPORT.md        # 결과 보고서
```

### MIRROR_REPORT.md 템플릿

```markdown
# Site Mirror Report

## Overview
- **Source URL**: ${url}
- **Mirror Date**: ${date}
- **Total Files**: ${fileCount}

## Resources Downloaded

### CSS (${cssCount} files)
| File | Size | Source |
|------|------|--------|
| main.css | 305KB | cdn.example.com |

### JavaScript (${jsCount} files)
...

### Images (${imageCount} files)
...

## Fidelity Check
- [ ] Layout matches original
- [ ] Colors match original
- [ ] Fonts load correctly
- [ ] Images display correctly
- [ ] Animations work
- [ ] No console errors
```

## 체크리스트

미러링 완료 후 자동 검증:

- [ ] HTML 구조 동일
- [ ] 모든 CSS 파일 다운로드 완료
- [ ] 모든 JS 파일 다운로드 완료
- [ ] 이미지 404 에러 없음
- [ ] 폰트 로드 성공
- [ ] Lottie 애니메이션 작동
- [ ] 콘솔 에러 없음
- [ ] 스크린샷 비교 일치

## 사용 예시

### 명령어 방식
```
/mirror-site https://example.com ./output
```

### 대화형 방식
```
"example.com 사이트 미러링해줘"
"이 사이트 오프라인으로 저장해줘"
"완벽하게 클론해줘, CSS 추출 말고 원본 다운로드로"
```

## ui-cloner와 선택 기준

| 상황 | 추천 도구 |
|------|----------|
| 특정 컴포넌트만 분석/재사용 | ui-cloner |
| React/Vue 컴포넌트로 변환 | ui-cloner |
| 완벽한 사이트 백업 | **site-mirror** |
| 오프라인 열람 필요 | **site-mirror** |
| CSS 학습/분석 | ui-cloner |
| 원본과 동일한 결과 필요 | **site-mirror** |
