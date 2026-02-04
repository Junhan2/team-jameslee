# UI Cloner v3 - 100% Perfect Clone Specification

## 1. Executive Summary

### 1.1 Background
UI Cloner v2는 약 60-74%의 클론 품질을 보여주었습니다. 교차 검증 결과, 다음과 같은 핵심 문제점이 발견되었습니다:

| 문제 영역 | 현재 v2 | 목표 v3 |
|----------|---------|---------|
| 그라데이션 배경 | ❌ 미추출 | ✅ 완벽 추출 |
| 커스텀 폰트 | ❌ 감지 실패 | ✅ CDN + @font-face 완벽 지원 |
| 버튼 상태 스타일 | ❌ 상태 혼동 | ✅ default/hover/active 분리 |
| 아이콘 (SVG/pseudo) | ❌ 누락 | ✅ 인라인 SVG + pseudo content |
| 레이아웃 크기 | ❌ 10-30% 오차 | ✅ ±3px 이내 |
| 필터 (grayscale 등) | ❌ 오적용 | ✅ 원본 그대로 |
| **CSS 변수** | ❌ 일부 누락 | ✅ **완전 추출 및 보존** |
| **z-index 계층** | ❌ 미추적 | ✅ **스택킹 컨텍스트 완전 추출** |
| **Tailwind CSS** | ❌ 미감지 | ✅ **자동 감지 및 최적 출력** |

### 1.2 Generalization Validation (범용성 검증)

> **중요**: 이 기획서의 개선 항목들은 upstage.ai 단일 사례가 아닌, 다양한 웹사이트 유형에서 범용적으로 적용 가능하도록 검증되었습니다.

| 구분 | 비율 | 설명 |
|------|------|------|
| **범용적 문제점** | 85% | 대부분의 웹사이트에 영향 |
| **사이트 특정 문제점** | 15% | 우선순위 하향 조정 |
| **추가 식별된 범용 문제** | 7개 | CSS 변수, z-index, Tailwind 등 |

**범용성 검증 테스트 대상 사이트 유형:**
- SaaS 랜딩페이지 (Stripe, Vercel)
- 이커머스 (Shopify)
- 대시보드 (Linear)
- 기업 사이트 (Apple)
- 블로그/뉴스 (Medium)

### 1.2 Version Strategy
- **v2 유지**: 기존 `/plugins/ui-cloner-v2/` 그대로 보존
- **v3 신규**: `/plugins/ui-cloner-v3/` 별도 생성
- **비교 검증**: 동일 URL로 v2, v3 결과 비교 가능

### 1.3 Core Philosophy Change

```
v2: "가능한 한 많이 추출하고 fallback 적용"
      ↓
v3: "원본과 1:1 정확한 매핑, 불확실하면 명시적 경고"
```

---

## 2. Architecture Overview

### 2.1 New 6-Phase Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 0: PRE-FLIGHT CHECK                     │
│   (신규) 환경 검증 및 제약 조건 확인                             │
├─────────────────────────────────────────────────────────────────┤
│ • Chrome DevTools 연결 상태 확인                                │
│ • 타겟 URL 접근 가능 여부                                       │
│ • CORS 제약 사전 탐지                                           │
│ • 예상 리소스 크기 추정                                          │
│ • 출력 디렉토리 쓰기 권한                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DEEP SURVEY                         │
│   (강화) 리소스 완전 탐색 + 폰트/그라데이션 특화                  │
├─────────────────────────────────────────────────────────────────┤
│ 1-1. Full DOM Tree Extraction (계층 구조 완전 보존)              │
│ 1-2. Resource Discovery                                         │
│      • <link> 태그 (CSS, preload, preconnect)                   │
│      • <style> 인라인 블록 전체                                  │
│      • <script> 태그 (인라인 스타일 주입 탐지)                   │
│ 1-3. Font Stack Analysis (신규 강화) ★                          │
│      • @font-face 규칙 직접 추출 (CORS 우회 시도)                │
│      • Google Fonts API URL 파싱 → 폰트명 추출                  │
│      • Adobe Fonts/Typekit URL 감지                              │
│      • 사용 중인 font-family 전수 조사                           │
│      • 로컬 폰트 vs 웹폰트 구분                                  │
│ 1-4. Gradient/Complex Background Detection (신규) ★              │
│      • linear-gradient, radial-gradient, conic-gradient         │
│      • 다중 배경 이미지 레이어                                   │
│      • background-blend-mode                                     │
│ 1-5. Reference Screenshot (섹션별 + 전체)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 2: PRECISION MEASURE                     │
│   (강화) 요소별 정밀 측정 + 상태별 분리 + 아이콘 완전 추출        │
├─────────────────────────────────────────────────────────────────┤
│ 2-1. Element Deep Measurement (50+ 속성)                         │
│      • v2의 40+ 속성 + 추가 10개 속성 ★                         │
│        - backdropFilter, mixBlendMode, isolation                │
│        - clipPath, maskImage, perspective                       │
│        - scrollBehavior, scrollSnapType/Align                   │
│        - contain, contentVisibility                             │
│ 2-2. Pseudo-Element Complete Capture (강화) ★                   │
│      • ::before/::after content 값                               │
│      • ::marker, ::selection, ::first-letter/line               │
│      • pseudo 요소의 width/height/position 계산                  │
│ 2-3. Icon Complete Extraction (신규) ★                          │
│      • SVG 인라인: outerHTML 완전 보존                           │
│      • Icon fonts: content + font-family 조합                    │
│      • Image icon: <img> src 추출                                │
│      • CSS background icon: background-image url                 │
│      • Button/Link 내부 아이콘 위치 관계                         │
│ 2-4. State-Separated Style Capture (신규) ★                     │
│      • :default 상태 (기본)                                      │
│      • :hover 상태 (프로그래밍적 트리거)                         │
│      • :active 상태                                              │
│      • :focus 상태                                               │
│      • :focus-visible 상태                                       │
│      • 상태 전환 transition 속성                                 │
│ 2-5. Authored CSS Extraction (강화)                              │
│      • CSSOM 직접 접근                                           │
│      • 반응형 값 보존: auto, %, calc(), clamp()                  │
│      • CSS 변수 참조 유지: var(--color-primary)                  │
│ 2-6. Image Container Relationship (강화)                         │
│      • object-fit/position 완전 추출                             │
│      • aspect-ratio 보존                                         │
│      • 이미지 위 gradient overlay 탐지                           │
│ 2-7. Animation/Transition Complete (강화)                        │
│      • @keyframes 이름 + 정의                                    │
│      • animation-* 모든 속성                                      │
│      • transition 속성 분해                                       │
│ 2-8. Width/Layout Chain (강화)                                   │
│      • body → target 전체 경로 width/max-width/padding           │
│      • flex/grid 컨테이너 탐지 및 속성 추출                      │
│ 2-9. Media Query Extraction                                      │
│      • 브레이크포인트 감지                                        │
│      • 반응형 스타일 변화 추출                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 3: SMART ANALYZE                        │
│   (강화) 추출 데이터 정합성 검증 + 전략 결정                      │
├─────────────────────────────────────────────────────────────────┤
│ 3-1. Layout Pattern Recognition                                  │
│      • Grid vs Flex vs Block 자동 판단                           │
│      • 컬럼 수, gap, alignment 추론                              │
│ 3-2. Component Grouping (신규) ★                                │
│      • 반복 패턴 탐지 (카드, 리스트 아이템)                       │
│      • 변형 분류 (크기, 색상 차이)                               │
│      • 공통 스타일 추출 → 재사용 클래스                          │
│ 3-3. Style Source Decision (강화) ★                             │
│      • Authored vs Computed 비교                                 │
│      • 불일치 시 경고 + authored 우선                            │
│      • 반응형 값 자동 감지                                       │
│ 3-4. Asset Strategy                                              │
│      • 이미지: 다운로드 vs CDN 참조                              │
│      • 폰트: 다운로드 vs Google Fonts 링크                       │
│      • SVG: 인라인 vs 파일 분리                                  │
│ 3-5. Extraction Quality Score (신규) ★                          │
│      • 속성별 추출 성공률                                        │
│      • 누락 항목 명시적 경고                                     │
│      • 위험 요소 리스트업                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 4: EXACT GENERATE                      │
│   (강화) 추출 데이터 ↔ 생성 코드 1:1 매핑                        │
├─────────────────────────────────────────────────────────────────┤
│ 4-1. HTML Generation                                             │
│      • 시맨틱 태그 보존                                          │
│      • 원본 클래스명 유지 (또는 체계적 리네이밍)                  │
│      • SVG 인라인 삽입 (아이콘)                                   │
│      • Accessibility 속성 보존 (aria-*, role)                    │
│ 4-2. CSS Generation (강화) ★                                    │
│      • CSS 변수 블록 (원본 값 유지)                              │
│      • @font-face 규칙 (웹폰트 다운로드 시)                      │
│      • @keyframes 규칙                                           │
│      • 상태별 스타일 (:hover, :active, :focus)                   │
│      • Group-hover 패턴                                          │
│      • 반응형 미디어 쿼리                                        │
│ 4-3. JavaScript Generation (필요시)                              │
│      • 인터랙션 핸들러                                           │
│      • 타이핑 애니메이션 등 동적 효과                             │
│ 4-4. Asset Processing                                            │
│      • 이미지 다운로드 + 최적화                                   │
│      • 폰트 파일 다운로드 (woff2)                                │
│      • SVG 스프라이트 생성 (선택)                                │
│ 4-5. Generation Mapping Verification (신규) ★                   │
│      • 추출 데이터와 생성 코드 1:1 대조                           │
│      • 누락/불일치 항목 리포트                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 5: AUTO VERIFY & FIX                      │
│   (대폭 강화) 자동 비교 + 자동 수정 루프                          │
├─────────────────────────────────────────────────────────────────┤
│ 5-1. Visual Comparison (신규) ★                                 │
│      • 섹션별 스크린샷 비교                                      │
│      • 픽셀 diff 계산 (SSIM score)                               │
│      • 차이 영역 하이라이트 이미지 생성                           │
│ 5-2. Dimensional Verification                                    │
│      • 요소별 크기 비교 (원본 vs 클론)                           │
│      • 허용 오차: ±3px                                           │
│      • 위치 드리프트 탐지                                        │
│ 5-3. Style Property Verification                                 │
│      • 색상: RGB 정확 일치                                       │
│      • 폰트: font-family 체인 일치                               │
│      • 배경: gradient 문자열 일치                                │
│      • 필터: filter 값 일치                                       │
│ 5-4. Auto-Fix Loop (max 3 iterations) ★                         │
│      • 가장 큰 불일치 항목 식별                                  │
│      • CSS 패치 자동 생성                                        │
│      • 재검증 후 반복                                            │
│ 5-5. Final Report Generation                                     │
│      • 섹션별 일치율 (%)                                         │
│      • 수정된 항목 목록                                          │
│      • 잔여 불일치 항목                                          │
│      • 수동 수정 제안                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. New Scripts Specification

### 3.1 Script Map (v2 → v3 변경)

| v2 Script | v3 Script | 변경 사항 |
|-----------|-----------|----------|
| A: Page Survey | A: Deep Survey | 폰트/그라데이션 특화 추가 |
| B: Deep Measurement | B: Precision Measure | 50+ 속성 확장 |
| B2: Pseudo-Element | B2: Pseudo Complete | ::marker, ::selection 추가 |
| - | B3: Icon Extractor | **신규 Tier1** - SVG 아이콘 완전 추출 (Icon fonts는 Tier3) |
| - | B4: State Capture | **신규 Tier1** - 상태별 스타일 분리 |
| - | B5: CSS Variables | **신규 Tier1** ⭐ - CSS 변수 완전 추출 (80%+ 사이트 영향) |
| - | B6: Z-Index Layers | **신규 Tier1** ⭐ - 스택킹 컨텍스트 추출 (90%+ 사이트 영향) |
| C: Authored CSS | C: Smart Authored | CSS 변수 참조 보존 |
| D: Pattern Recognition | D: Component Grouping | 반복 패턴 → 재사용 클래스 |
| - | D2: Tailwind Detector | **신규 Tier2** ⭐ - Tailwind CSS 자동 감지 (30%+ 사이트) |
| E: Asset Analysis | E: Asset Complete | video, audio, iframe 강화 |
| F: Width Chain | F: Layout Chain | flex/grid 컨테이너 포함 |
| G: Head Resource | G: Resource Complete | script 태그 포함 |
| H: Stylesheet Rules | H: Animation Complete | transition 분해 추가 |
| I: Interaction States | I: State-aware | :focus-visible 추가 |
| J: Image-in-Container | J: Image Relations | gradient overlay 강화 |
| - | K: Quality Score | **신규** - 추출 품질 점수 |
| - | V: Visual Diff | **신규 선택** - 픽셀 비교 (SSIM, 선택적 실행) |
| - | X: Auto-Fix | **신규** - 자동 수정 |

### 3.1.1 Priority Tiers (범용성 기반)

| Tier | 스크립트 | 영향 범위 | 필수 여부 |
|------|---------|----------|----------|
| **Tier 1** | B, B2, B3(SVG), B4, B5, B6, C, F, I, J | 80%+ 사이트 | ✅ 필수 |
| **Tier 2** | D, D2, E, G, H, K | 40-70% 사이트 | 🟡 권장 |
| **Tier 3** | B3(IconFont), V, X | 20% 미만 | 선택 |

### 3.1.2 Deprecated/Downgraded Items

| 항목 | 변경 | 이유 |
|------|------|------|
| Adobe Fonts 특화 감지 | Tier1 → Tier3 | 사용 빈도 5% 미만 |
| Icon fonts (FontAwesome) | 필수 → 선택 | SVG 아이콘으로 트렌드 이동 |
| SSIM 픽셀 비교 | 필수 → 선택 | 구현 복잡도 대비 효용 낮음 |

### 3.2 New Script Details

#### Script A: Deep Survey (강화)

```javascript
// Script A: Deep Survey Function
function deepSurveyFn() {
  const result = {
    sections: [],
    resources: {
      links: [],
      styles: [],
      scripts: []
    },
    fonts: {
      googleFonts: [],
      adobeFonts: [],
      fontFaceRules: [],
      usedFontFamilies: new Set()
    },
    gradients: [],
    complexBackgrounds: []
  };

  // 1. Semantic Section Discovery
  const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
  semanticTags.forEach(tag => {
    document.querySelectorAll(tag).forEach((el, i) => {
      result.sections.push({
        tag,
        index: i,
        id: el.id || null,
        className: el.className || null,
        rect: el.getBoundingClientRect().toJSON()
      });
    });
  });

  // 2. Resource Discovery
  document.querySelectorAll('link').forEach(link => {
    result.resources.links.push({
      rel: link.rel,
      href: link.href,
      as: link.as,
      crossorigin: link.crossOrigin
    });
  });

  document.querySelectorAll('style').forEach((style, i) => {
    result.resources.styles.push({
      index: i,
      content: style.textContent.substring(0, 5000) // 최대 5000자
    });
  });

  // 3. Font Stack Analysis (★ 신규 강화)
  // 3-1. Google Fonts 감지
  const googleFontsLink = document.querySelector('link[href*="fonts.googleapis"]');
  if (googleFontsLink) {
    const url = new URL(googleFontsLink.href);
    const families = url.searchParams.get('family');
    result.fonts.googleFonts = families ? families.split('|').map(f => {
      const [name, weights] = f.split(':');
      return { name: name.replace(/\+/g, ' '), weights: weights?.split(',') || ['400'] };
    }) : [];
  }

  // 3-2. Adobe Fonts 감지
  const adobeLink = document.querySelector('link[href*="use.typekit"]');
  if (adobeLink) {
    result.fonts.adobeFonts.push({ url: adobeLink.href });
  }

  // 3-3. @font-face 규칙 추출
  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSFontFaceRule) {
            result.fonts.fontFaceRules.push({
              family: rule.style.getPropertyValue('font-family'),
              src: rule.style.getPropertyValue('src'),
              weight: rule.style.getPropertyValue('font-weight'),
              style: rule.style.getPropertyValue('font-style'),
              display: rule.style.getPropertyValue('font-display')
            });
          }
        }
      } catch (e) { /* CORS blocked */ }
    }
  } catch (e) { /* No access */ }

  // 3-4. 사용 중인 font-family 전수 조사
  document.querySelectorAll('*').forEach(el => {
    const fontFamily = getComputedStyle(el).fontFamily;
    if (fontFamily) {
      fontFamily.split(',').forEach(f => {
        result.fonts.usedFontFamilies.add(f.trim().replace(/['"]/g, ''));
      });
    }
  });
  result.fonts.usedFontFamilies = Array.from(result.fonts.usedFontFamilies);

  // 4. Gradient/Complex Background Detection (★ 신규)
  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const bgImage = style.backgroundImage;

    if (bgImage && bgImage !== 'none') {
      // 그라데이션 감지
      if (bgImage.includes('gradient')) {
        result.gradients.push({
          selector: getUniqueSelector(el),
          backgroundImage: bgImage,
          backgroundColor: style.backgroundColor
        });
      }
      // 다중 배경 감지
      if (bgImage.includes(',') || style.backgroundBlendMode !== 'normal') {
        result.complexBackgrounds.push({
          selector: getUniqueSelector(el),
          backgroundImage: bgImage,
          backgroundPosition: style.backgroundPosition,
          backgroundSize: style.backgroundSize,
          backgroundRepeat: style.backgroundRepeat,
          backgroundBlendMode: style.backgroundBlendMode
        });
      }
    }
  });

  return result;

  // Helper: Unique Selector
  function getUniqueSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      return el.tagName.toLowerCase() + '.' + el.className.split(' ').filter(c => c).join('.');
    }
    return el.tagName.toLowerCase();
  }
}
```

#### Script B3: Icon Extractor (신규)

```javascript
// Script B3: Icon Extractor Function
function iconExtractorFn(selector) {
  const container = document.querySelector(selector) || document.body;
  const icons = [];

  // 1. Inline SVG Icons
  container.querySelectorAll('svg').forEach(svg => {
    const parent = svg.parentElement;
    const isIcon = svg.clientWidth <= 48 && svg.clientHeight <= 48;

    if (isIcon) {
      icons.push({
        type: 'svg-inline',
        selector: getUniqueSelector(svg),
        outerHTML: svg.outerHTML,
        width: svg.clientWidth,
        height: svg.clientHeight,
        viewBox: svg.getAttribute('viewBox'),
        parentSelector: getUniqueSelector(parent),
        position: getPositionRelativeToParent(svg, parent)
      });
    }
  });

  // 2. Image Icons (<img> with small size)
  container.querySelectorAll('img').forEach(img => {
    if (img.naturalWidth <= 48 && img.naturalHeight <= 48) {
      icons.push({
        type: 'img-icon',
        selector: getUniqueSelector(img),
        src: img.src,
        alt: img.alt,
        width: img.clientWidth,
        height: img.clientHeight,
        parentSelector: getUniqueSelector(img.parentElement),
        position: getPositionRelativeToParent(img, img.parentElement)
      });
    }
  });

  // 3. Icon Fonts (pseudo-element with font-family)
  container.querySelectorAll('*').forEach(el => {
    ['::before', '::after'].forEach(pseudo => {
      const style = getComputedStyle(el, pseudo);
      const content = style.content;
      const fontFamily = style.fontFamily;

      // 아이콘 폰트 패턴 감지
      const iconFontFamilies = ['Font Awesome', 'Material Icons', 'Ionicons', 'feather'];
      const isIconFont = iconFontFamilies.some(f => fontFamily.includes(f));

      if (content && content !== 'none' && content !== '""' && isIconFont) {
        icons.push({
          type: 'icon-font',
          selector: getUniqueSelector(el),
          pseudo,
          content,
          fontFamily,
          fontSize: style.fontSize,
          color: style.color
        });
      }
    });
  });

  // 4. CSS Background Icons
  container.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const bgImage = style.backgroundImage;

    if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
      // 작은 배경 이미지는 아이콘으로 간주
      if (el.clientWidth <= 48 && el.clientHeight <= 48) {
        const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          icons.push({
            type: 'bg-icon',
            selector: getUniqueSelector(el),
            url: urlMatch[1],
            width: el.clientWidth,
            height: el.clientHeight,
            backgroundSize: style.backgroundSize,
            backgroundPosition: style.backgroundPosition
          });
        }
      }
    }
  });

  // 5. Button/Link 내부 아이콘 관계 분석
  container.querySelectorAll('button, a, [role="button"]').forEach(btn => {
    const innerIcons = [];
    btn.querySelectorAll('svg, img').forEach(icon => {
      if ((icon.clientWidth <= 48 || icon.clientHeight <= 48)) {
        innerIcons.push({
          type: icon.tagName.toLowerCase(),
          position: getPositionRelativeToParent(icon, btn)
        });
      }
    });

    if (innerIcons.length > 0) {
      icons.push({
        type: 'button-with-icon',
        selector: getUniqueSelector(btn),
        text: btn.textContent.trim().substring(0, 50),
        innerIcons
      });
    }
  });

  return icons;

  // Helpers
  function getUniqueSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      return el.tagName.toLowerCase() + '.' + el.className.split(' ').filter(c => c).join('.');
    }
    // Fallback: nth-child
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(el);
      return getUniqueSelector(parent) + ' > ' + el.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
    }
    return el.tagName.toLowerCase();
  }

  function getPositionRelativeToParent(child, parent) {
    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    return {
      top: childRect.top - parentRect.top,
      left: childRect.left - parentRect.left,
      right: parentRect.right - childRect.right,
      bottom: parentRect.bottom - childRect.bottom
    };
  }
}
```

#### Script B4: State Capture (신규)

```javascript
// Script B4: State Capture Function
async function stateCaptureAsyncFn(selector) {
  const elements = document.querySelectorAll(selector);
  const results = [];

  for (const el of elements) {
    const states = {};

    // 1. Default State
    states.default = extractKeyStyles(el);

    // 2. Hover State (programmatic trigger)
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await sleep(100); // transition 대기
    states.hover = extractKeyStyles(el);

    // Hover 변화 감지
    states.hoverDiff = diffStyles(states.default, states.hover);

    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await sleep(50);

    // 3. Focus State
    if (el.focus) {
      el.focus();
      await sleep(50);
      states.focus = extractKeyStyles(el);
      states.focusDiff = diffStyles(states.default, states.focus);
      el.blur();
    }

    // 4. Active State (mousedown → mouseup)
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(50);
    states.active = extractKeyStyles(el);
    states.activeDiff = diffStyles(states.default, states.active);
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    // 5. Transition 속성 추출
    const style = getComputedStyle(el);
    states.transition = {
      property: style.transitionProperty,
      duration: style.transitionDuration,
      timingFunction: style.transitionTimingFunction,
      delay: style.transitionDelay
    };

    results.push({
      selector: getUniqueSelector(el),
      tagName: el.tagName.toLowerCase(),
      states
    });
  }

  return results;

  // Helpers
  function extractKeyStyles(el) {
    const s = getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor,
      borderWidth: s.borderWidth,
      boxShadow: s.boxShadow,
      transform: s.transform,
      opacity: s.opacity,
      scale: s.scale,
      filter: s.filter,
      textDecoration: s.textDecoration,
      outline: s.outline
    };
  }

  function diffStyles(a, b) {
    const diff = {};
    for (const key in a) {
      if (a[key] !== b[key]) {
        diff[key] = { from: a[key], to: b[key] };
      }
    }
    return Object.keys(diff).length > 0 ? diff : null;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function getUniqueSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      return el.tagName.toLowerCase() + '.' + el.className.split(' ').filter(c => c).join('.');
    }
    return el.tagName.toLowerCase();
  }
}
```

#### Script B5: CSS Variables Extractor (신규 - 범용성 검증 추가) ⭐

```javascript
// Script B5: CSS Variables Extractor Function
// 범용성: 80%+ 모던 웹사이트에서 CSS 변수 사용
function cssVariablesExtractorFn() {
  const result = {
    rootVariables: {},      // :root에 정의된 변수
    componentVariables: {}, // 컴포넌트별 로컬 변수
    variableUsage: [],      // 변수 사용처 추적
    darkModeVariables: {}   // prefers-color-scheme 변수
  };

  // 1. :root 및 html에서 CSS 변수 추출
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        // :root 또는 html 선택자
        if (rule.selectorText === ':root' || rule.selectorText === 'html') {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) {
              result.rootVariables[prop] = rule.style.getPropertyValue(prop).trim();
            }
          }
        }

        // @media (prefers-color-scheme: dark) 내부 변수
        if (rule instanceof CSSMediaRule) {
          if (rule.conditionText?.includes('prefers-color-scheme: dark')) {
            for (const innerRule of rule.cssRules) {
              if (innerRule.selectorText === ':root' || innerRule.selectorText === 'html') {
                for (const prop of innerRule.style) {
                  if (prop.startsWith('--')) {
                    result.darkModeVariables[prop] = innerRule.style.getPropertyValue(prop).trim();
                  }
                }
              }
            }
          }
        }

        // 컴포넌트 로컬 변수 (클래스 선택자)
        if (rule.selectorText && rule.selectorText.startsWith('.')) {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) {
              if (!result.componentVariables[rule.selectorText]) {
                result.componentVariables[rule.selectorText] = {};
              }
              result.componentVariables[rule.selectorText][prop] = rule.style.getPropertyValue(prop).trim();
            }
          }
        }
      }
    } catch (e) { /* CORS blocked */ }
  }

  // 2. CSS 변수 사용처 추적
  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const inlineStyle = el.getAttribute('style') || '';

    // var() 사용 패턴 찾기
    const varPattern = /var\(--[\w-]+/g;
    const matches = inlineStyle.match(varPattern);

    if (matches) {
      result.variableUsage.push({
        selector: getUniqueSelector(el),
        variables: matches.map(m => m.replace('var(', ''))
      });
    }
  });

  // 3. 통계 정보
  result.stats = {
    totalRootVariables: Object.keys(result.rootVariables).length,
    totalComponentVariables: Object.keys(result.componentVariables).length,
    hasDarkMode: Object.keys(result.darkModeVariables).length > 0,
    usageCount: result.variableUsage.length
  };

  return result;

  function getUniqueSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      return el.tagName.toLowerCase() + '.' + el.className.split(' ').filter(c => c).join('.');
    }
    return el.tagName.toLowerCase();
  }
}
```

#### Script B6: Z-Index Layers Extractor (신규 - 범용성 검증 추가) ⭐

```javascript
// Script B6: Z-Index Layers Extractor Function
// 범용성: 90%+ 웹사이트에서 z-index 레이어링 사용 (헤더, 모달, 드롭다운 등)
function zIndexLayersExtractorFn() {
  const layers = [];
  const stackingContexts = [];

  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const zIndex = style.zIndex;
    const position = style.position;

    // z-index가 auto가 아니고 positioned인 경우
    if (zIndex !== 'auto' && position !== 'static') {
      const isStacking = isStackingContext(el, style);

      layers.push({
        selector: getUniqueSelector(el),
        zIndex: parseInt(zIndex),
        position,
        isStackingContext: isStacking,
        // 컨텍스트 생성 원인
        contextReason: isStacking ? getStackingReason(style) : null
      });

      if (isStacking) {
        stackingContexts.push({
          selector: getUniqueSelector(el),
          zIndex: parseInt(zIndex),
          children: []
        });
      }
    }
  });

  // z-index 내림차순 정렬
  layers.sort((a, b) => b.zIndex - a.zIndex);

  return {
    layers,
    stackingContexts,
    stats: {
      totalLayers: layers.length,
      maxZIndex: layers.length > 0 ? layers[0].zIndex : 0,
      minZIndex: layers.length > 0 ? layers[layers.length - 1].zIndex : 0,
      stackingContextCount: stackingContexts.length
    },
    // 레이어 그룹 (일반적인 용도별 분류)
    groups: {
      base: layers.filter(l => l.zIndex >= 0 && l.zIndex < 10),
      dropdown: layers.filter(l => l.zIndex >= 10 && l.zIndex < 100),
      sticky: layers.filter(l => l.zIndex >= 100 && l.zIndex < 1000),
      modal: layers.filter(l => l.zIndex >= 1000 && l.zIndex < 10000),
      tooltip: layers.filter(l => l.zIndex >= 10000)
    }
  };

  function isStackingContext(el, style) {
    return (
      style.zIndex !== 'auto' ||
      style.opacity !== '1' ||
      style.transform !== 'none' ||
      style.filter !== 'none' ||
      style.backdropFilter !== 'none' ||
      style.perspective !== 'none' ||
      style.clipPath !== 'none' ||
      style.mask !== 'none' ||
      style.isolation === 'isolate' ||
      style.mixBlendMode !== 'normal' ||
      style.willChange.includes('transform') ||
      style.willChange.includes('opacity') ||
      style.contain === 'layout' ||
      style.contain === 'paint' ||
      style.contain === 'strict' ||
      style.contain === 'content'
    );
  }

  function getStackingReason(style) {
    const reasons = [];
    if (style.zIndex !== 'auto') reasons.push('z-index');
    if (style.opacity !== '1') reasons.push('opacity');
    if (style.transform !== 'none') reasons.push('transform');
    if (style.filter !== 'none') reasons.push('filter');
    if (style.isolation === 'isolate') reasons.push('isolation');
    if (style.mixBlendMode !== 'normal') reasons.push('mix-blend-mode');
    return reasons;
  }

  function getUniqueSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      return el.tagName.toLowerCase() + '.' + el.className.split(' ').filter(c => c).join('.');
    }
    return el.tagName.toLowerCase();
  }
}
```

#### Script D2: Tailwind CSS Detector (신규 - 범용성 검증 추가) ⭐

```javascript
// Script D2: Tailwind CSS Detector Function
// 범용성: 30%+ 사이트 (급격히 증가 중, 2024-2025 트렌드)
function tailwindDetectorFn() {
  const result = {
    isTailwind: false,
    confidence: 0,
    version: null,
    detectedClasses: [],
    recommendation: ''
  };

  // Tailwind 클래스 패턴
  const tailwindPatterns = {
    // 레이아웃
    layout: /^(flex|grid|block|inline|inline-flex|inline-grid|hidden|contents)$/,
    // 너비/높이
    sizing: /^(w|h|min-w|max-w|min-h|max-h)-(\d+|auto|full|screen|min|max|fit)$/,
    // 패딩/마진
    spacing: /^(p|m|px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml)-(\d+|auto)$/,
    // 갭
    gap: /^gap-(x|y)?-?\d+$/,
    // 색상 (text, bg, border)
    colors: /^(text|bg|border|ring|outline)-(inherit|current|transparent|black|white|\w+)-?\d*$/,
    // 타이포그래피
    typography: /^(text|font|leading|tracking|antialiased|subpixel-antialiased)-(xs|sm|base|lg|xl|\d*xl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\d+)$/,
    // 보더
    border: /^(border|rounded)(-\w+)?(-\d+)?$/,
    // 그림자
    shadow: /^shadow(-\w+)?$/,
    // opacity
    opacity: /^opacity-\d+$/,
    // Flexbox
    flexbox: /^(flex|items|justify|content|self|order|grow|shrink|basis)-(\w+|\d+)$/,
    // Grid
    gridPattern: /^(grid|col|row)-(cols|rows|span|start|end)-(\d+|auto|full|none)$/,
    // 반응형 프리픽스
    responsive: /^(sm|md|lg|xl|2xl):/,
    // 상태 프리픽스
    states: /^(hover|focus|active|disabled|group-hover|dark):/
  };

  let matchCount = 0;
  let totalClasses = 0;
  const detectedPatterns = new Set();

  // 모든 요소의 클래스 분석
  document.querySelectorAll('*').forEach(el => {
    if (!el.className || typeof el.className !== 'string') return;

    const classes = el.className.split(' ').filter(c => c);
    totalClasses += classes.length;

    classes.forEach(cls => {
      // 반응형/상태 프리픽스 제거 후 검사
      const cleanCls = cls.replace(/^(sm|md|lg|xl|2xl|hover|focus|active|disabled|group-hover|dark):/, '');

      for (const [patternName, pattern] of Object.entries(tailwindPatterns)) {
        if (pattern.test(cleanCls) || pattern.test(cls)) {
          matchCount++;
          detectedPatterns.add(patternName);
          if (result.detectedClasses.length < 50) {
            result.detectedClasses.push({ class: cls, pattern: patternName });
          }
          break;
        }
      }
    });
  });

  // Tailwind CSS 링크 감지
  const tailwindCDN = document.querySelector('script[src*="tailwindcss"], link[href*="tailwind"]');
  const hasTailwindCDN = !!tailwindCDN;

  // 신뢰도 계산
  const classRatio = totalClasses > 0 ? matchCount / totalClasses : 0;
  const patternDiversity = detectedPatterns.size / Object.keys(tailwindPatterns).length;

  result.confidence = Math.min(
    (classRatio * 0.6 + patternDiversity * 0.3 + (hasTailwindCDN ? 0.1 : 0)),
    1
  );

  result.isTailwind = result.confidence > 0.3 || hasTailwindCDN;

  // 버전 추정 (JIT 모드 특징으로)
  const hasArbitraryValues = document.querySelector('[class*="["]') !== null;
  result.version = hasArbitraryValues ? '3.x (JIT)' : result.isTailwind ? '2.x or 3.x' : null;

  // 권장 사항
  if (result.isTailwind) {
    result.recommendation = result.confidence > 0.6
      ? 'Use Tailwind CSS classes in output for better maintainability'
      : 'Consider using Tailwind CSS classes mixed with custom CSS';
  } else {
    result.recommendation = 'Use custom CSS output';
  }

  result.stats = {
    totalClasses,
    matchedClasses: matchCount,
    matchRatio: classRatio,
    patternsCovered: Array.from(detectedPatterns),
    hasCDN: hasTailwindCDN
  };

  return result;
}
```

#### Script V: Visual Diff (신규 - 선택적 실행)

```javascript
// Script V: Visual Diff Function (runs in Node.js context via Bash)
// 이 스크립트는 브라우저가 아닌 Node.js에서 실행됩니다.

// 간단한 SSIM 계산 (라이브러리 없이)
function calculateSSIM(img1Data, img2Data) {
  // 이미지 데이터가 같은 크기인지 확인
  if (img1Data.length !== img2Data.length) {
    return { score: 0, error: 'Size mismatch' };
  }

  const n = img1Data.length / 4; // RGBA
  let sum1 = 0, sum2 = 0, sum12 = 0;
  let sumSq1 = 0, sumSq2 = 0;

  for (let i = 0; i < img1Data.length; i += 4) {
    // Grayscale 변환
    const gray1 = (img1Data[i] * 0.299 + img1Data[i+1] * 0.587 + img1Data[i+2] * 0.114);
    const gray2 = (img2Data[i] * 0.299 + img2Data[i+1] * 0.587 + img2Data[i+2] * 0.114);

    sum1 += gray1;
    sum2 += gray2;
    sumSq1 += gray1 * gray1;
    sumSq2 += gray2 * gray2;
    sum12 += gray1 * gray2;
  }

  const mean1 = sum1 / n;
  const mean2 = sum2 / n;
  const var1 = sumSq1 / n - mean1 * mean1;
  const var2 = sumSq2 / n - mean2 * mean2;
  const cov = sum12 / n - mean1 * mean2;

  const c1 = 6.5025; // (0.01 * 255)^2
  const c2 = 58.5225; // (0.03 * 255)^2

  const ssim = ((2 * mean1 * mean2 + c1) * (2 * cov + c2)) /
               ((mean1 * mean1 + mean2 * mean2 + c1) * (var1 + var2 + c2));

  return {
    score: ssim,
    mean1,
    mean2,
    variance1: var1,
    variance2: var2
  };
}

// 차이 영역 탐지
function findDiffRegions(img1Data, img2Data, width, height, threshold = 30) {
  const regions = [];
  const visited = new Set();

  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 4;

      if (visited.has(idx)) continue;

      // RGB 차이 계산
      const diff = Math.abs(img1Data[idx] - img2Data[idx]) +
                   Math.abs(img1Data[idx+1] - img2Data[idx+1]) +
                   Math.abs(img1Data[idx+2] - img2Data[idx+2]);

      if (diff > threshold * 3) {
        // 차이 영역 확장
        let minX = x, maxX = x, minY = y, maxY = y;

        // 주변 탐색 (간단한 flood fill)
        for (let dy = -50; dy <= 50; dy += 10) {
          for (let dx = -50; dx <= 50; dx += 10) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

            const nidx = (ny * width + nx) * 4;
            const ndiff = Math.abs(img1Data[nidx] - img2Data[nidx]) +
                         Math.abs(img1Data[nidx+1] - img2Data[nidx+1]) +
                         Math.abs(img1Data[nidx+2] - img2Data[nidx+2]);

            if (ndiff > threshold * 3) {
              minX = Math.min(minX, nx);
              maxX = Math.max(maxX, nx);
              minY = Math.min(minY, ny);
              maxY = Math.max(maxY, ny);
              visited.add(nidx);
            }
          }
        }

        if (maxX - minX > 20 || maxY - minY > 20) {
          regions.push({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          });
        }
      }
    }
  }

  return regions;
}
```

#### Script X: Auto-Fix (신규)

```javascript
// Script X: Auto-Fix Function
function autoFixFn(discrepancies) {
  const fixes = [];

  for (const item of discrepancies) {
    const { selector, property, original, clone, diff } = item;

    // CSS 패치 생성
    let cssRule = `${selector} {\n`;

    switch (property) {
      case 'width':
      case 'height':
      case 'padding':
      case 'margin':
        // 크기 수정
        cssRule += `  ${property}: ${original};\n`;
        break;

      case 'backgroundColor':
      case 'color':
      case 'borderColor':
        // 색상 수정
        cssRule += `  ${toCSSProperty(property)}: ${original};\n`;
        break;

      case 'fontFamily':
        // 폰트 수정 (fallback 체인 보존)
        cssRule += `  font-family: ${original};\n`;
        break;

      case 'backgroundImage':
        // 그라데이션 수정
        cssRule += `  background-image: ${original};\n`;
        break;

      case 'filter':
        // 필터 수정
        cssRule += `  filter: ${original};\n`;
        break;

      case 'borderRadius':
        cssRule += `  border-radius: ${original};\n`;
        break;

      case 'boxShadow':
        cssRule += `  box-shadow: ${original};\n`;
        break;

      default:
        cssRule += `  ${toCSSProperty(property)}: ${original};\n`;
    }

    cssRule += `}\n`;

    fixes.push({
      selector,
      property,
      original,
      clone,
      cssRule,
      priority: calculatePriority(property, diff)
    });
  }

  // 우선순위 정렬
  fixes.sort((a, b) => b.priority - a.priority);

  return {
    totalFixes: fixes.length,
    fixes: fixes.slice(0, 20), // 최대 20개 수정
    cssPatches: fixes.map(f => f.cssRule).join('\n')
  };

  // Helpers
  function toCSSProperty(jsProperty) {
    return jsProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  function calculatePriority(property, diff) {
    const priorityMap = {
      backgroundColor: 100,
      color: 90,
      fontFamily: 85,
      backgroundImage: 80,
      width: 70,
      height: 70,
      filter: 60,
      borderRadius: 50,
      padding: 40,
      margin: 40,
      boxShadow: 30
    };

    const basePriority = priorityMap[property] || 20;
    const diffMagnitude = typeof diff === 'number' ? Math.min(diff / 10, 30) : 10;

    return basePriority + diffMagnitude;
  }
}
```

---

## 4. Quality Metrics & Targets

### 4.1 Target Quality Metrics

| Metric | v2 Current | v3 Target | Measurement |
|--------|------------|-----------|-------------|
| **Overall Similarity** | ~74% | ≥95% | SSIM score |
| **Dimension Accuracy** | ±30px | ≤3px | getBoundingClientRect |
| **Color Accuracy** | ~90% | 100% | RGB exact match |
| **Font Match** | ~60% | 100% | font-family chain |
| **Gradient Match** | 0% | 100% | backgroundImage string |
| **Icon Extraction** | ~50% | 100% | SVG/pseudo complete |
| **Interaction States** | ~70% | 100% | hover/active/focus |

### 4.2 Section-wise Targets

| Section | v2 Current | v3 Target |
|---------|------------|-----------|
| Navigation | 85% | ≥98% |
| Hero Section | 70% | ≥95% |
| Logo Slider | 75% | ≥95% |
| Products | 65% | ≥95% |
| Solutions | 70% | ≥95% |
| Footer | 80% | ≥98% |

---

## 5. Plugin Structure

### 5.1 Directory Structure

```
plugins/ui-cloner-v3/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── agents/
│   └── ui-extractor-v3.md          # 강화된 에이전트 (15단계)
├── commands/
│   └── clone-ui-v3.md              # 6단계 파이프라인
├── skills/
│   └── ui-clone-v3.md              # 실행 가이드 + 30항목 체크리스트
├── scripts/
│   ├── survey/
│   │   └── deep-survey.js          # Script A
│   ├── measure/
│   │   ├── precision-measure.js    # Script B
│   │   ├── pseudo-complete.js      # Script B2
│   │   ├── icon-extractor.js       # Script B3 (신규)
│   │   ├── state-capture.js        # Script B4 (신규)
│   │   └── ...
│   ├── analyze/
│   │   ├── component-grouping.js   # Script D
│   │   └── quality-score.js        # Script K (신규)
│   └── verify/
│       ├── visual-diff.js          # Script V (신규)
│       └── auto-fix.js             # Script X (신규)
└── templates/
    ├── vanilla/
    ├── react/
    └── nextjs/
```

### 5.2 plugin.json

```json
{
  "name": "ui-cloner-v3",
  "version": "3.0.0",
  "description": "100% Perfect UI Clone - Chrome DevTools Protocol 기반 완벽한 UI 복제",
  "author": "team-jameslee",
  "repository": "https://github.com/team-jameslee/claude-plugins",
  "keywords": ["ui", "clone", "css", "chrome-devtools", "pixel-perfect"],
  "main": "commands/clone-ui-v3.md"
}
```

---

## 6. Command Specification

### 6.1 Command Syntax

```
/clone-ui-v3 <url> [options]

Options:
  --selector <css>    : 특정 영역만 클론 (기본: body)
  --output <path>     : 출력 디렉토리 (기본: ./cloned-ui/)
  --framework <type>  : vanilla | react | vue | nextjs (기본: vanilla)
  --quality <mode>    : fast | precise | perfect (기본: precise)
  --assets <strategy> : download | reference | placeholder (기본: download)
  --verify <level>    : skip | basic | full (기본: full)
  --auto-fix          : 자동 수정 활성화 (기본: true)
  --max-iterations    : 최대 수정 반복 횟수 (기본: 3)

Examples:
  /clone-ui-v3 https://example.com
  /clone-ui-v3 https://example.com --selector "main.content"
  /clone-ui-v3 https://example.com --quality perfect --verify full
```

### 6.2 Quality Modes

| Mode | Phase 0 | Phase 1-4 | Phase 5 | Auto-Fix | Target |
|------|---------|-----------|---------|----------|--------|
| **fast** | ✓ | 기본 | Skip | ✗ | ~85% |
| **precise** | ✓ | 전체 | Basic | ✓ (1회) | ~95% |
| **perfect** | ✓ | 전체 | Full | ✓ (3회) | ~99% |

---

## 7. Migration from v2

### 7.1 Breaking Changes
- 없음 (v2와 독립 실행)

### 7.2 Improvements over v2
1. **Pre-flight Check** (Phase 0): 사전 검증으로 실패 방지
2. **Font Detection**: Google Fonts 자동 감지 (Adobe Fonts는 Tier 3)
3. **Gradient Extraction**: 그라데이션 배경 완벽 추출
4. **Icon Extraction**: SVG 아이콘 완전 지원 (Icon fonts는 Tier 3)
5. **State Separation**: hover/active/focus 상태별 분리
6. **CSS Variables**: CSS 변수 완전 추출 및 보존 ★ 신규
7. **Z-Index Layers**: 스택킹 컨텍스트 완전 추출 ★ 신규
8. **Tailwind Detection**: Tailwind CSS 자동 감지 ★ 신규
9. **Auto-Fix**: 불일치 자동 수정 (선택적 기능)
10. **Visual Diff**: 픽셀 단위 비교 (선택적 기능)

---

## 8. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Plugin 디렉토리 구조 생성
- [ ] plugin.json, marketplace.json 작성
- [ ] 기본 command 파일 작성

### Phase 2: Tier 1 Scripts (Week 2) - 필수
- [ ] Script A: Deep Survey 구현
- [ ] Script B3: Icon Extractor (SVG 중심)
- [ ] Script B4: State Capture 구현
- [ ] Script B5: CSS Variables Extractor ★ 신규
- [ ] Script B6: Z-Index Layers Extractor ★ 신규

### Phase 3: Tier 2 Scripts (Week 3) - 권장
- [ ] Script D2: Tailwind Detector ★ 신규
- [ ] Script K: Quality Score 구현
- [ ] Component grouping 로직 강화
- [ ] CSS generation 1:1 매핑 검증

### Phase 4: Tier 3 Scripts (Week 4) - 선택
- [ ] Script V: Visual Diff 구현 (선택적)
- [ ] Script X: Auto-Fix 구현
- [ ] Icon fonts 지원 (선택적)
- [ ] Adobe Fonts 지원 (선택적)

### Phase 5: 범용성 테스트 (Week 5)
- [ ] **SaaS 사이트**: stripe.com, vercel.com
- [ ] **대시보드**: linear.app
- [ ] **Tailwind 사이트**: tailwindcss.com
- [ ] **기업 사이트**: apple.com
- [ ] **이커머스**: shopify.com
- [ ] **블로그**: medium.com
- [ ] **앱**: github.com
- [ ] 기존 테스트: upstage.ai

---

## 9. Success Criteria

### 9.1 Quantitative (범용성 검증 기준)

| 지표 | Tier 1 사이트 (80%+) | Tier 2 사이트 (40-70%) | Tier 3 사이트 (<40%) |
|------|---------------------|----------------------|---------------------|
| 시각적 유사도 | ≥95% | ≥90% | ≥85% |
| 크기 정확도 | ≤3px | ≤5px | ≤10px |
| 색상 정확도 | 100% | 98% | 95% |
| 폰트 일치 | 100% | 95% | 90% |

### 9.2 범용성 검증 체크리스트

#### Tier 1 (필수 - 모든 테스트 사이트에서 통과)
- [ ] 그라데이션 배경 추출 성공
- [ ] Google Fonts 커스텀 폰트 적용
- [ ] SVG 아이콘 완전 추출
- [ ] 버튼 hover/active 상태 분리
- [ ] CSS 변수 완전 추출 및 보존
- [ ] z-index 계층 정확히 복제
- [ ] container width chain 정확도 ≤3px

#### Tier 2 (권장 - 70% 이상 사이트에서 통과)
- [ ] Tailwind CSS 감지 정확도 ≥90%
- [ ] pseudo-element 콘텐츠 추출
- [ ] 반응형 브레이크포인트 감지
- [ ] 다크 모드 스타일 추출

#### Tier 3 (선택 - 해당 사이트에서만)
- [ ] Adobe Fonts 감지
- [ ] Icon fonts 추출
- [ ] SSIM 픽셀 비교
- [ ] 자동 수정 루프

### 9.3 v2 대비 개선 검증

| 테스트 사이트 | v2 예상 점수 | v3 목표 점수 | 개선율 |
|--------------|-------------|-------------|--------|
| upstage.ai | ~74% | ≥95% | +21% |
| stripe.com | ~70% | ≥95% | +25% |
| vercel.com | ~65% | ≥92% | +27% |
| linear.app | ~60% | ≥90% | +30% |
| tailwindcss.com | ~55% | ≥90% | +35% |

---

## 10. Documentation

### 10.1 Related Documents
- `CROSS_VALIDATION_REPORT.md` - 원본 검증 보고서
- `GENERALIZATION_ANALYSIS.md` - 범용성 검증 분석

### 10.2 Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-04 | 초기 기획서 작성 |
| 1.1 | 2025-02-04 | 범용성 검증 결과 반영, Tier 시스템 도입 |

---

*Specification Version: 1.1*
*Updated: 2025-02-04*
*Author: Claude Opus 4.5*
