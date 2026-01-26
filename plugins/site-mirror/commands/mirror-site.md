---
name: mirror-site
description: 웹사이트를 완벽하게 미러링합니다 (원본 파일 다운로드 + URL 치환 방식)
arguments:
  - name: url
    description: 미러링할 웹사이트 URL
    required: true
  - name: output
    description: 출력 폴더 경로
    required: false
    default: "./site-mirror-output"
---

# Site Mirror Command

웹사이트의 원본 리소스를 다운로드하고 CDN URL을 로컬 경로로 치환하여 오프라인에서도 동작하는 완벽한 미러를 생성합니다.

## 핵심 원칙

> **DO**: 원본 CSS/JS/이미지 파일을 그대로 다운로드
> **DON'T**: `getComputedStyle()`로 CSS 재생성 ❌

## 실행 절차

```
사용자가 제공한 정보:
- URL: $url
- 출력 위치: $output
```

### Phase 1: 사전 분석

1. **브라우저에서 페이지 열기**
   ```
   mcp__chrome-devtools__new_page → $url
   ```

2. **라이브러리/프레임워크 감지**
   ```
   mcp__ui-extractor__detect_libraries
   ```

3. **디자인 시스템 추출**
   ```
   mcp__ui-extractor__extract_design_system
   ```

4. **참조 스크린샷 캡처**
   ```
   mcp__chrome-devtools__take_screenshot → $output/reference-fullpage.png (fullPage: true)
   ```

### Phase 2: HTML 추출

JavaScript로 전체 HTML 추출:

```javascript
mcp__chrome-devtools__evaluate_script({
  function: "() => document.documentElement.outerHTML"
})
```

결과를 `$output/raw.html`로 저장

### Phase 3: 리소스 URL 수집

JavaScript로 모든 리소스 URL 수집:

```javascript
(() => {
  const resources = {
    css: [],
    js: [],
    images: [],
    fonts: [],
    animations: []
  };

  // CSS 파일
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (el.href) resources.css.push(el.href);
  });

  // JavaScript 파일
  document.querySelectorAll('script[src]').forEach(el => {
    if (el.src) resources.js.push(el.src);
  });

  // 이미지 (src, srcset)
  document.querySelectorAll('img[src], source[srcset], [style*="background"]').forEach(el => {
    if (el.src) resources.images.push(el.src);
    if (el.srcset) {
      el.srcset.split(',').forEach(s => {
        const url = s.trim().split(' ')[0];
        if (url) resources.images.push(url);
      });
    }
  });

  // 배경 이미지 (인라인 스타일)
  document.querySelectorAll('[style*="url("]').forEach(el => {
    const matches = el.style.cssText.match(/url\(["']?([^"')]+)["']?\)/g);
    if (matches) {
      matches.forEach(m => {
        const url = m.replace(/url\(["']?|["']?\)/g, '');
        resources.images.push(url);
      });
    }
  });

  // Lottie JSON
  document.querySelectorAll('[data-src*=".json"], [data-animation-path*=".json"]').forEach(el => {
    const src = el.dataset.src || el.dataset.animationPath;
    if (src) resources.animations.push(src);
  });

  // 중복 제거
  Object.keys(resources).forEach(key => {
    resources[key] = [...new Set(resources[key])];
  });

  return resources;
})()
```

### Phase 4: 리소스 다운로드

#### 4.1 디렉토리 구조 생성

```bash
mkdir -p $output/assets/{css,js,images/{logos,icons,ui,backgrounds,features},fonts,animations}
```

#### 4.2 CSS 파일 다운로드

```bash
cd $output/assets/css && \
curl -sL "$CSS_URL_1" -o main.css && \
curl -sL "$CSS_URL_2" -o vendor.css
```

#### 4.3 JavaScript 파일 다운로드

```bash
cd $output/assets/js && \
curl -sL "$JS_URL_1" -o main.js &
curl -sL "$JS_URL_2" -o vendor.js &
wait
```

#### 4.4 이미지 다운로드 (병렬)

시맨틱 네이밍 규칙:
- `logos/` - 브랜드 로고
- `icons/` - UI 아이콘, 화살표
- `ui/` - 버튼, 배지 등 UI 요소
- `backgrounds/` - 배경 이미지
- `features/` - 기능 설명 이미지

```bash
# 병렬 다운로드 예시
cd $output/assets/images/logos && \
curl -sL "https://cdn.../logo.svg" -o brand-logo.svg &
curl -sL "https://cdn.../icon.svg" -o brand-icon.svg &
wait
```

#### 4.5 Lottie 애니메이션 다운로드

```bash
cd $output/assets/animations && \
curl -sL "https://cdn.../animation.json" -o hero-animation.json
```

### Phase 5: URL 치환

Python 스크립트로 CDN URL을 로컬 경로로 변환:

```python
import re

# raw.html 읽기
with open('raw.html', 'r') as f:
    html = f.read()

# URL 매핑 테이블
mappings = {
    'https://cdn.example.com/styles/main.css': './assets/css/main.css',
    'https://cdn.example.com/images/logo.svg': './assets/images/logos/brand-logo.svg',
    # ... 모든 리소스 매핑
}

# 치환 실행
for cdn_url, local_path in mappings.items():
    html = html.replace(cdn_url, local_path)

# index.html로 저장
with open('index.html', 'w') as f:
    f.write(html)
```

### Phase 6: 추적 코드 제거 (선택)

```python
patterns_to_remove = [
    r'<script[^>]*googletagmanager[^>]*>.*?</script>',
    r'<script[^>]*gtag[^>]*>.*?</script>',
    r'<script[^>]*analytics[^>]*>.*?</script>',
    r'<noscript[^>]*gtm[^>]*>.*?</noscript>',
]

for pattern in patterns_to_remove:
    html = re.sub(pattern, '', html, flags=re.DOTALL)
```

### Phase 7: 검증

1. **로컬 서버 실행**
   ```bash
   cd $output && python3 -m http.server 8080
   ```

2. **브라우저에서 확인**
   ```
   mcp__chrome-devtools__new_page → http://localhost:8080
   ```

3. **스크린샷 비교**
   ```
   mcp__chrome-devtools__take_screenshot → $output/clone-preview.png
   ```

4. **콘솔 에러 확인**
   ```
   mcp__chrome-devtools__list_console_messages → types: ["error"]
   ```

## 출력 구조

```
$output/
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
│   │   ├── logos/
│   │   ├── icons/
│   │   ├── ui/
│   │   ├── backgrounds/
│   │   └── features/
│   ├── fonts/
│   └── animations/
├── url-mappings.json       # CDN → 로컬 매핑 테이블
└── MIRROR_REPORT.md        # 결과 보고서
```

## 사용 예시

### 기본 사용
```
/mirror-site https://example.com
```

### 출력 폴더 지정
```
/mirror-site https://example.com ./my-mirror
```

## ui-cloner와의 차이점

| 항목 | ui-cloner | site-mirror |
|-----|-----------|-------------|
| CSS 처리 | `getComputedStyle()` 추출 | 원본 파일 다운로드 |
| HTML 처리 | 구조 분석 후 재구성 | `outerHTML` 그대로 저장 |
| 결과 충실도 | ~60% | ~95% |
| 오프라인 지원 | ❌ | ✅ |
| 파일 크기 | 작음 | 큼 (원본과 동일) |
| 용도 | 컴포넌트 분석/재구성 | 완벽한 복제/백업 |

## 주의사항

1. **저작권**: 미러링된 콘텐츠는 학습/백업 목적으로만 사용
2. **동적 콘텐츠**: JavaScript로 렌더링되는 요소는 페이지 로드 완료 후 추출
3. **CORS**: 일부 CDN은 직접 다운로드가 제한될 수 있음
4. **용량**: 대형 사이트는 상당한 저장 공간 필요
