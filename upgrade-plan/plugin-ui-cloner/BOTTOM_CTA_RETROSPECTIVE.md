# Bottom CTA 섹션 클론 작업 후기

> "Human-like Retrieval" 파란색 CTA 섹션의 콘텐츠가 전체 너비를 채우고, 잘못된 일러스트를 사용하던 문제를 해결한 과정 기록

---

## 1. 작업 개요

**목표**: Bottom CTA 섹션을 원본과 동일한 레이아웃으로 재현

**문제 현상**: 파란색 박스 안에서 일러스트와 텍스트가 전체 너비(1850px)를 채우고 있어 원본(1300px 중앙 정렬)과 비율이 다르게 보임

```
원본: [파란색 1802px [         콘텐츠 1300px (중앙정렬)         ]]
클론: [파란색 1850px [콘텐츠 1850px (전체 채움)                  ]]
```

---

## 2. 문제 진단 과정

### 2.1 원본 구조 추출 (Chrome DevTools)

```javascript
// 1단계: 파란색 컨테이너 찾기 (backgroundImage로 식별)
document.querySelectorAll('div').forEach(div => {
  const cs = getComputedStyle(div);
  if (cs.backgroundImage.includes('55, 136, 216') && div.getBoundingClientRect().height > 200) {
    // → 2개 발견: MCP CTA (1300×429), Bottom CTA (1802×300)
  }
});

// 2단계: Bottom CTA 내부 레이어 분석
// → 콘텐츠 wrapper에 max-width: 1300px, m-auto 적용 확인
```

**원본 레이어 구조:**

```
.bottom-cta (1802×300, blue gradient, border-radius 12px, overflow hidden)
├── [grid overlay] (absolute, 1802×300, opacity 0.7)
│   └── <img> grid.svg
└── [content wrapper] (relative, flex, max-width: 1300px, m-auto)
    ├── [illustration] (absolute, 1300×300, pointer-events: none)
    │   └── <img> cat-bg.svg ← MCP CTA의 cta-bg-2.svg와 다른 파일!
    ├── [spacer] (w-1/2, 608×0) ← 빈 div으로 텍스트를 우측으로 밀어냄
    └── [text area] (w-1/2, 612×139, z-10, ml-20, px-6)
        ├── <h2> "Human-like Retrieval" (36px, 600)
        ├── <p> "No vector DB..." (16px, white)
        └── <a> "Try Now" 버튼
```

### 2.2 클론 구조와 비교 — 4가지 차이 발견

| # | 항목 | 원본 | 클론 (수정 전) |
|---|------|------|----------------|
| 1 | 콘텐츠 wrapper max-width | **1300px** (중앙정렬) | **없음** (전체 1850px 채움) |
| 2 | 일러스트 파일 | **cat-bg.svg** (28KB) | **cta-background.svg** (175KB, MCP CTA용) |
| 3 | 스페이서 div | **있음** (w-1/2, 텍스트를 우측으로) | **없음** |
| 4 | 텍스트 max-width | **없음** (자연 너비) | **500px** (H2가 564→500px로 잘림) |

### 2.3 핵심 발견 — MCP CTA와 Bottom CTA는 다른 컴포넌트

```
              MCP CTA                    Bottom CTA
─────────────────────────────────────────────────────────
파란 박스     1300px (고정)               1802px (가변, 거의 풀 너비)
일러스트     cta-bg-2.svg (175KB)        cat-bg.svg (28KB)
콘텐츠 제한  박스 자체가 1300px           박스는 넓고, 내부 1300px 제한
텍스트 위치  우측 (650px spacer)          우측 (50% spacer + ml-80px)
```

clone-ui가 **"같은 파란색 CTA니까 같은 구조"**라고 판단해 동일한 일러스트와 레이아웃을 적용한 것이 근본 원인.

---

## 3. 해결 — 수정 내역

### 3.1 일러스트 파일 다운로드 + 교체

```bash
curl -sL "https://pageindex.ai/static/images/new-homepage/cat-bg.svg" \
  -o assets/images/cta-bg-bottom.svg
# → 28,525 bytes (vs cta-background.svg 174,810 bytes)
```

```html
<!-- Before -->
<img src="assets/images/cta-background.svg" alt="" aria-hidden="true">
<!-- After -->
<img src="assets/images/cta-bg-bottom.svg" alt="" aria-hidden="true">
```

### 3.2 콘텐츠 wrapper에 max-width 추가

```css
/* Before */
.bottom-cta-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* After */
.bottom-cta-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1300px;        /* ← 핵심: 콘텐츠를 1300px로 제한 */
  margin: 0 auto;           /* ← 파란 박스 안에서 중앙 정렬 */
  height: 300px;
}
```

### 3.3 스페이서 div 추가

```html
<!-- Before -->
<div class="bottom-cta-content">
  <div class="bottom-cta-illustration">...</div>
  <div class="bottom-cta-text">...</div>
</div>

<!-- After -->
<div class="bottom-cta-content">
  <div class="bottom-cta-illustration">...</div>
  <div class="bottom-cta-spacer" aria-hidden="true"></div>  <!-- 추가 -->
  <div class="bottom-cta-text">...</div>
</div>
```

```css
.bottom-cta-spacer {
  width: 50%;
}
```

### 3.4 텍스트 영역 margin/padding 수정 + max-width 제거

```css
/* Before */
.bottom-cta-text {
  width: 50%;
  margin-left: auto;
}
.bottom-cta-text-inner {
  padding: 24px 32px;
  max-width: 500px;       /* ← H2를 500px로 제한하고 있었음 */
}

/* After */
.bottom-cta-text {
  width: 50%;
  margin-left: 80px;      /* ← 원본의 ml-20 (5rem = 80px) */
  padding: 0 24px;        /* ← 원본의 px-6 */
  gap: 8px;               /* ← 원본의 gap-2 */
}
.bottom-cta-text-inner {
  padding: 0;
  /* max-width 제거 → H2가 564px로 자연 렌더링 */
}
```

---

## 4. 수정 후 수치 검증

```
항목                    원본          클론          상태
────────────────────────────────────────────────────────
콘텐츠 wrapper 너비      1300px        1300px        ✓
일러스트 크기            1300×300      1300×300      ✓
텍스트 영역 너비         612px         612px         ✓
텍스트 영역 높이         139px         139px         ✓
텍스트 margin            0 0 0 80      0 0 0 80      ✓
텍스트 padding           0 24px        0 24px        ✓
H2 너비                  564px         564px         ✓
H2 font-size             36px          36px          ✓
H2 line-height           40.32px       40.32px       ✓
```

---

## 5. clone-ui 플러그인이 이 문제를 해결하지 못했던 이유

### 5.1 "같은 파란색 = 같은 컴포넌트" 가정

clone-ui는 시각적으로 유사한 섹션을 동일한 컴포넌트로 처리합니다:

```
시각적 특징:    파란색 배경 + 격자 패턴 + 일러스트 + 텍스트 + 버튼
clone-ui 판단: "MCP CTA와 같은 구조" → 동일한 CSS, 동일한 일러스트 적용
원본 실제:     다른 너비, 다른 일러스트, 다른 콘텐츠 제한 방식
```

### 5.2 "넓은 파란 박스 안의 좁은 콘텐츠" 패턴 미감지

이 섹션의 핵심 디자인 패턴은:

```
[1802px 파란 박스 (배경 + 격자)]
    ↓ overflow: hidden
[1300px 콘텐츠 영역 (중앙 정렬)]
    ↓ 격자는 파란 박스 전체, 일러스트는 콘텐츠 영역만
```

파란 박스 **밖**에 격자가 보이지만 일러스트는 중앙 1300px에만 있는 이 이중 너비 구조를 clone-ui는 감지하지 못합니다. 스크린샷에서는 단순히 "파란 배경 위에 일러스트와 텍스트"로만 보이기 때문입니다.

### 5.3 일러스트 파일이 다르다는 것을 판별할 수 없음

```
MCP CTA:    cta-bg-2.svg (1372×450, 175KB) — 중앙 집중형 일러스트
Bottom CTA: cat-bg.svg   (1373×451, 28KB)  — 산개형 문서/페이지 일러스트
```

두 일러스트는 같은 isometric 스타일이지만 배치가 다릅니다. clone-ui는 `<img>` 태그의 `src` URL을 비교하지 않고, 시각적 유사성에 의존하여 "같은 일러스트"로 판단합니다.

### 5.4 `max-width` 체인 추적 불가

원본의 너비 제한은 여러 레이어에 걸쳐 있습니다:

```
[viewport 1920px]
  └─ [parent: max-w calc(100vw-70px) = 1850px, padding 0 24px]
       └─ [blue box: 1802px (parent에서 padding 빠짐)]
            └─ [content: max-w 1300px, m-auto]
                 └─ [text: w-1/2 = 612px, ml-80px]
```

clone-ui의 CSS 추출은 **개별 요소의 computed style**만 캡처합니다. 부모-자식 간의 `max-width → padding → max-width` 체인은 추적하지 못합니다.

---

## 6. 핵심 교훈

### 6.1 "시각적으로 같은 컴포넌트"가 같은 구조가 아닐 수 있다

```
MCP CTA와 Bottom CTA의 공통점:
✅ 파란색 배경, 격자 패턴, isometric 일러스트, 흰색 텍스트, CTA 버튼

MCP CTA와 Bottom CTA의 차이점:
❌ 파란 박스 너비 (1300px vs 1802px)
❌ 일러스트 파일 (cta-bg-2.svg vs cat-bg.svg)
❌ 콘텐츠 제한 방식 (박스 자체 vs 내부 max-width)
❌ 레이아웃 전략 (단순 flex vs spacer + ml-80px)
```

### 6.2 너비 제한은 여러 레이어에 걸쳐 작동한다

```
원본의 너비 결정 체인:
viewport → parent padding → blue box → content max-width → text w-1/2

이 중 하나라도 빠지면 레이아웃이 달라짐:
- content max-width 빠짐 → 일러스트가 1850px로 퍼짐 (클론의 문제)
- parent padding 빠짐 → 파란 박스가 48px 더 넓어짐
```

### 6.3 img src URL 비교는 필수 작업

```
방법 1: 스크린샷에서 일러스트가 "비슷해 보여서" 같은 파일 사용 ← 오류 발생
방법 2: img.src를 추출하여 URL을 직접 비교 ← 다른 파일임을 즉시 발견
```

같은 디자인 시스템의 일러스트라도 **섹션별로 다른 SVG 파일**을 사용할 수 있습니다. `img.src` 추출은 매번 해야 하는 기본 작업입니다.

### 6.4 빈 div(spacer)도 레이아웃의 일부

```
원본의 Bottom CTA 콘텐츠 구조:
[illustration (absolute)] + [spacer (50%)] + [text (50%, ml-80)]

spacer가 없으면:
- justify-content: space-between이 작동하지 않음
- 텍스트가 중앙이나 좌측에 배치됨
- margin-left: auto로 대체 가능하지만 원본의 의도와 다른 구현
```

빈 div은 시각적으로 보이지 않지만, flex 레이아웃에서 공간을 차지하여 다른 요소의 위치를 결정합니다.
