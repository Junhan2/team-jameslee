# Feature Card 클론 작업 후기

> pageindex.ai의 Key Features 섹션 6개 카드를 픽셀 퍼펙트로 클론한 과정 기록

---

## 1. 작업 개요

**목표**: pageindex.ai의 Key Features 섹션에 있는 6개 feature card를 원본과 동일한 레이아웃, 위치, 크기로 재현

**난이도가 높았던 이유**: 겉보기에는 동일한 카드 6장이지만, 실제로는 **3가지 서로 다른 레이아웃 패턴**으로 구성되어 있었음

```
Card #1       : 텍스트 상단 → 이미지 하단 (overflow)
Card #2 ~ #5  : 이미지 상단 → 텍스트 하단
Card #6       : 이미지 좌측 70% | 텍스트 우측 30% (가로 분할)
```

---

## 2. 이전 시도의 문제점 (실패 원인 분석)

### 2.1 추정 기반 CSS 작성

```css
/* 이전: CSS 변수와 추정값으로 일괄 적용 */
.feature-card {
  padding: var(--spacing-xl); /* 32px 추정 */
}
.feature-content {
  padding: 0 32px 40px; /* "대략 이 정도" */
}
.feature-image-container {
  height: calc(100% - 130px); /* 계산식으로 추정 → 결과: 313px (원본은 332px) */
}
```

**문제**: 원본의 실제 렌더링 값을 확인하지 않고, "이 정도면 맞겠지"라는 추정으로 CSS를 작성함

### 2.2 카드별 구조 차이 미인식

6개 카드를 모두 동일한 HTML 구조 + 공통 CSS로 처리하려 했음. 실제로는:

- Card #1의 번호("01")는 **우측 상단**, 나머지는 **좌측 상단**
- Card #1의 텍스트는 **상단**, Card #2~5는 **하단**
- Card #6은 완전히 다른 **가로 레이아웃**

### 2.3 "눈으로" 확인

적용 후 "비슷해 보이니까 됐다"고 판단. 수치 기반 검증 없이 진행

---

## 3. 성공한 방법론 (3단계 프로세스)

### 3.1 Phase 1 — 원본 수치 추출

Chrome DevTools의 `evaluate_script`를 사용하여 원본 사이트의 **실제 렌더링된 computed styles**를 px 단위로 추출:

```javascript
// Chrome DevTools evaluate_script로 실행
() => {
  const cards = document.querySelectorAll('[class*="feature"]');
  return Array.from(cards).map(card => {
    const rect = card.getBoundingClientRect();
    const number = card.querySelector('.number');
    const title = card.querySelector('.title');
    const image = card.querySelector('img');

    return {
      cardWidth: rect.width,
      cardHeight: rect.height,
      numberTop: number.getBoundingClientRect().top - rect.top,
      numberLeft: number.getBoundingClientRect().left - rect.left,
      titleTop: title.getBoundingClientRect().top - rect.top,
      titleLeft: title.getBoundingClientRect().left - rect.left,
      imageWidth: image.getBoundingClientRect().width,
      imageHeight: image.getBoundingClientRect().height,
    };
  });
}
```

**추출 결과표:**

| 항목 | Card #1 | Card #2 | Cards #3-5 | Card #6 |
|------|---------|---------|------------|---------|
| 카드 크기 | 476 x 445 | 476 x 445 | 317 x 445 | ~950 x 445 |
| number 위치 | top:33, **right:32** | top:32, left:32 | top:32, left:32 | static, padding-left:8 |
| title 위치 | top:41, left:33 | top:344, left:33 | top:344, left:33 | 우측 30% 영역 하단 |
| image 크기 | 475 x 332 | 474 x 278 | 316 x 278 | 좌측 70% 영역 전체 |
| image 위치 | top:130 (하단) | top:0 (상단) | top:0 (상단) | left:0 (좌측) |

### 3.2 Phase 2 — 구조적 차이에 따른 CSS 분리 설계

추출 데이터를 분석하여 3가지 레이아웃 패턴을 식별하고, CSS selector로 분리:

#### Pattern A: Card #1 (텍스트 상단, 이미지 하단 overflow)

```css
/* data-feature 속성으로 특정 카드만 타겟 */
.feature-card[data-feature="1"] .feature-content {
  padding: 41px 33px 0;  /* 추출값: title top:41, left:33 */
}

.feature-card[data-feature="1"] .feature-image-container {
  position: absolute;
  left: 0;
  top: 130px;              /* 추출값: image top:130 */
  width: 100%;
  height: 332px;           /* 추출값: image height:332 (카드 밖으로 overflow) */
  overflow: hidden;
}
```

**핵심 발견**: 이미지 높이가 332px로, 카드 높이 445px에서 top:130px부터 시작하면 130+332=462px > 445px. 즉, 이미지가 카드 밖으로 **의도적으로 overflow**되고 있었음. `calc(100% - 130px) = 315px`라는 이전 추정이 틀렸던 이유.

#### Pattern B: Cards #2-5 (이미지 상단, 텍스트 하단)

```css
/* :not() 선택자로 Card#1과 Card#6을 제외 */
.feature-card:not([data-feature="1"]):not(.feature-wide) .feature-title {
  margin-top: auto;     /* flex container에서 하단으로 밀기 */
  padding: 0 33px;      /* 추출값: title left:33 */
}

.feature-card:not([data-feature="1"]):not(.feature-wide) .feature-subtitle {
  padding: 0 33px 41px; /* 추출값: 하단 여백 41px */
}

.feature-image-container {
  height: 278px;        /* 추출값: image height:278 */
  order: -1;            /* flex에서 이미지를 상단으로 */
}
```

**핵심 기법**: `margin-top: auto`를 flex 자식에 적용하면, 남은 공간을 모두 위쪽 margin으로 채워서 요소를 하단에 배치함

#### Pattern C: Card #6 (가로 분할 레이아웃)

```css
/* HTML 구조 자체를 변경: 이미지를 feature-content 밖으로 분리 */
.feature-card.feature-wide {
  display: flex;
  flex-direction: row;   /* 세로→가로 레이아웃 전환 */
}

.feature-wide .feature-wide-image {
  width: 70%;            /* 추출값: ~665px / 950px ≈ 70% */
  height: 100%;
  flex-shrink: 0;
}

.feature-wide .feature-content {
  width: 30%;            /* 추출값: ~285px / 950px ≈ 30% */
  flex-shrink: 0;
  padding: 32px 0;
}

.feature-wide .feature-number {
  position: static;      /* absolute → static 전환 */
  display: block;
  margin-bottom: auto;   /* 상단에 고정 */
  padding-left: 8px;     /* 추출값: number left:8 */
}

.feature-wide .feature-title {
  margin-top: auto;      /* 하단에 배치 */
  line-height: 42px;
}
```

**핵심 결정**: Card #6은 CSS만으로는 불가능했고, **HTML 구조 자체를 변경**해야 했음:

```html
<!-- 변경 전: 이미지가 feature-content 안에 있음 -->
<div class="feature-card feature-wide">
  <div class="feature-content">
    <span class="feature-number">06</span>
    <div class="feature-image-container">
      <img src="..." alt="...">
    </div>
    <h3 class="feature-title">Human-like Retrieval</h3>
    <p class="feature-subtitle">...</p>
  </div>
</div>

<!-- 변경 후: 이미지를 별도 div로 분리 -->
<div class="feature-card feature-wide">
  <div class="feature-wide-image">
    <img src="..." alt="...">
  </div>
  <div class="feature-content">
    <span class="feature-number">06</span>
    <h3 class="feature-title">Human-like Retrieval</h3>
    <p class="feature-subtitle">...</p>
  </div>
  <div class="feature-details">...</div>
</div>
```

### 3.3 Phase 3 — 적용 후 수치 재측정 검증

CSS 적용 후 클론 사이트에서도 동일한 방식으로 수치를 추출하여 **원본과 직접 비교**:

```
항목                    원본        클론        오차
─────────────────────────────────────────────────
Card#1 title top       41px        42px        1px ✓
Card#1 title left      33px        34px        1px ✓
Card#2 title top       344px       343px       1px ✓
Card#2 image height    278px       278px       0px ✓
Card#6 image width     665px       665px       0px ✓
Card#6 text width      285px       287px       2px ✓
```

모든 항목이 **2px 이내 오차**로 원본과 일치.

---

## 4. 트러블슈팅 기록

### 4.1 Card #1 이미지 높이 불일치

| 문제 | 원인 | 해결 |
|------|------|------|
| 이미지 313px로 렌더링 (원본 332px) | `calc(100% - 130px)` = 445-130 = 315px 사용 | 추출한 정확한 값 `height: 332px` 직접 지정 |

이미지가 카드 영역을 초과하여 overflow되는 것이 원본의 **의도된 디자인**이었음. `overflow: hidden`으로 잘리는 부분은 보이지 않으므로 시각적으로 자연스러움.

### 4.2 Card #6 hover 오버레이 오작동 (오진단)

| 증상 | 원인 | 해결 |
|------|------|------|
| Card #6이 항상 hover 상태로 보임 | DevTools hover 도구 사용 후 hover 상태가 persist | 실제 버그 아님. `getComputedStyle` 확인 시 `opacity: 0, visibility: hidden` 정상 |

검증 방법:
```javascript
// DevTools에서 실행하여 기본 상태 확인
() => {
  const details = document.querySelector('.feature-wide .feature-details');
  const styles = window.getComputedStyle(details);
  return { opacity: styles.opacity, visibility: styles.visibility };
  // 결과: { opacity: "0", visibility: "hidden" } → 정상
}
```

### 4.3 Card #6 content 패딩 과다

| 문제 | 원인 | 해결 |
|------|------|------|
| 텍스트 영역이 원본보다 좁음 | 초기값 `padding: 32px 16px` 적용 | 추출값 기반 `padding: 32px 0` + number에만 `padding-left: 8px` |

---

## 5. 핵심 교훈

### 추정 vs 추출

| 이전 (실패) | 이번 (성공) |
|-------------|-------------|
| CSS 변수로 추정값 사용 | `getBoundingClientRect()` + `getComputedStyle()`로 정확한 px 추출 |
| 6개 카드 공통 스타일 | 카드별 레이아웃 구조 분리 (3가지 패턴) |
| `calc()` 계산식 추정 | 실측 332px, 278px 등 직접 적용 |
| 적용 후 "눈으로" 확인 | 적용 후 수치 재측정으로 검증 |
| HTML 구조 유지 | Card #6은 HTML 자체를 재구성 |

### 픽셀 퍼펙트 클론의 3단계 공식

```
1. 추출 (Extract)    — 원본에서 실제 렌더링 값을 px 단위로 측정
2. 적용 (Apply)      — 추출값을 그대로 CSS에 반영, 구조적 차이는 HTML도 변경
3. 검증 (Verify)     — 클론에서 동일 측정을 수행하여 원본과 수치 비교
```

**가장 결정적인 차이**: "추정 → 적용"의 2단계가 아니라, **"추출 → 적용 → 재측정 비교"의 3단계 프로세스**를 거친 것.

### 도구 활용

- **Chrome DevTools `evaluate_script`**: 원본/클론 모두에서 JavaScript로 실제 렌더링 수치 추출
- **`getBoundingClientRect()`**: 요소의 실제 위치와 크기 (viewport 기준)
- **`getComputedStyle()`**: 브라우저가 최종 계산한 CSS 속성값
- **스크린샷 비교**: 시각적 확인용 (수치 검증의 보조 수단)

---

## 6. 적용 가능한 일반 원칙

1. **클론 작업에서 추정은 금물** — 반드시 원본의 실제 렌더링 값을 추출할 것
2. **겉보기에 같은 컴포넌트라도 내부 구조가 다를 수 있음** — 모든 변형을 개별 분석할 것
3. **CSS만으로 안 되면 HTML 구조를 바꿀 것** — Card #6처럼 레이아웃이 근본적으로 다른 경우
4. **`margin-top: auto`는 flex 레이아웃에서 강력한 정렬 도구** — 요소를 하단에 밀어붙이는 데 활용
5. **검증은 "눈"이 아니라 "수치"로** — 적용 후 반드시 동일 측정 방법으로 비교할 것
