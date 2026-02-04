# Building Blocks 카드 클론 작업 후기

> PageIndex Building Blocks 섹션의 카드 레이아웃이 원본과 미세하게 달랐던 문제를 해결한 과정 기록

---

## 1. 작업 개요

**목표**: Building Blocks 섹션의 block-card 컴포넌트를 원본과 동일한 크기, 간격, 모서리 처리로 재현

**문제 현상**: 전체적인 구조는 비슷하지만, 이미지 영역이 원본보다 넓고 각져 보이며, 카드 자체도 약간 더 넓었음

```
원본: 이미지 컨테이너가 독립적인 둥근 패널처럼 보임 → 텍스트와 적절한 간격
클론: 이미지가 카드 안에 빽빽하게 채워짐 → 텍스트와 이미지 사이 여유 부족
```

---

## 2. 문제 진단 과정

### 2.1 시각적 비교에서 시작

사용자가 원본과 클론 스크린샷을 비교하여 **"이미지가 바로 렌더링된 건지, 컨테이너로 한번 더 감싼 것 같다"**고 지적.

### 2.2 원본 DOM 구조 + Computed Styles 추출

```javascript
// Chrome DevTools evaluate_script로 실행
() => {
  // "PageIndex Tree Generation" 텍스트로 카드를 찾아 구조 분석
  const card = /* h3 텍스트 기반 탐색 */;
  const imgContainer = card.children[1];
  const img = imgContainer.querySelector('img');

  return {
    container: {
      w: imgContainer.getBoundingClientRect().width,
      h: imgContainer.getBoundingClientRect().height,
      borderRadius: getComputedStyle(imgContainer).borderRadius,
      margin: getComputedStyle(imgContainer).margin,
      bg: getComputedStyle(imgContainer).backgroundColor,
      border: getComputedStyle(imgContainer).border
    },
    img: {
      maxHeight: getComputedStyle(img).maxHeight,
      objectFit: getComputedStyle(img).objectFit
    }
  };
}
```

### 2.3 추출 결과 — 4가지 차이 발견

| 속성 | 원본 | 클론 (수정 전) | 영향 |
| --- | --- | --- | --- |
| `border-radius` | `8px` | `0` | 이미지 영역이 각져 보임 |
| `margin` | `0 20px 0 48px` | `0 20px 0 0` | 텍스트↔이미지 간격 부족 |
| `width` | `500px` (고정) | `flex: 1` (자동) | 이미지 영역이 남은 공간을 전부 차지 |
| `img max-height` | `none` | `100%` | 이미지가 컨테이너보다 살짝 크게 렌더링되는 원본 동작 억제 |

### 2.4 카드 전체 너비 차이 추가 발견

이미지 컨테이너를 수정한 후에도 카드 전체 너비가 달랐음:

```
원본 카드: 892px
클론 카드: 940px (48px 더 넓음)
```

**원인 추적 — 상위 컨테이너 구조 비교:**

```javascript
// 원본
max-w-[940px] mx-auto px-6
// → max-width: 940px, padding: 0 24px
// → 실질 콘텐츠 너비: 940 - 24×2 = 892px

// 클론
.blocks-list { max-width: 940px; margin: 0 auto; }
// → padding 없음
// → 실질 콘텐츠 너비: 940px 그대로
```

`max-width`는 같지만 **padding 유무**가 카드 너비를 48px 차이나게 만들었음.

---

## 3. 해결 — CSS 수정 내역

### 3.1 이미지 컨테이너 수정

```css
/* Before */
.block-image {
  flex: 1;
  height: 342px;
  margin-right: 20px;
  border-radius: 0;
}
.block-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* After */
.block-image {
  width: 500px;
  flex-shrink: 0;
  height: 342px;
  margin: 0 20px 0 48px;
  border-radius: 8px;
  position: relative;
}
.block-image img {
  max-width: 100%;
  object-fit: contain;
  position: relative;
}
```

### 3.2 상위 컨테이너 padding 추가

```css
/* Before */
.blocks-list {
  max-width: 940px;
  margin: 0 auto var(--spacing-2xl);
}

/* After */
.blocks-list {
  max-width: 940px;
  margin: 0 auto var(--spacing-2xl);
  padding: 0 24px;
}
```

---

## 4. 수정 후 수치 검증

```
항목                    원본          클론          오차
────────────────────────────────────────────────────────
카드 전체 너비         892px         892px         0px ✓
카드 높이              382px         382px         0px ✓
텍스트 영역 너비       322px         322px         0px ✓
이미지 컨테이너 너비   500px         500px         0px ✓
이미지 컨테이너 높이   342px         342px         0px ✓
border-radius          8px           8px           0px ✓
margin (상하좌우)      0 20 0 48     0 20 0 48     0px ✓
img max-height         none          none          일치 ✓
```

---

## 5. clone-ui 플러그인이 이 문제를 해결하지 못했던 이유

### 5.1 `flex: 1` vs 고정 너비 — "채워 넣기" 기본 전략

clone-ui는 레이아웃을 재현할 때 **유연한 크기(`flex: 1`)를 기본 전략**으로 사용합니다. 이는 대부분의 경우 합리적이지만, 원본이 **고정 너비(`500px`)로 의도적으로 제한**한 경우에는 결과가 달라집니다:

```
clone-ui 전략: "남은 공간을 이미지가 채운다" → flex: 1
원본 의도:     "이미지는 정확히 500px, 나머지는 여백" → width: 500px + margin-left: 48px
```

### 5.2 margin-left 48px — "보이지 않는 여백"

DevTools 스크린샷이나 시각적 분석에서 **비어있는 여백 48px**은 인식하기 어렵습니다:

```
시각적으로 보이는 것: [텍스트 영역][이미지 영역]
실제 구조:            [텍스트 322px][간격 48px][이미지 500px][간격 20px]
                                    ↑ 이 48px 간격이 눈에 잘 띄지 않음
```

clone-ui는 CSS 추출 시 "텍스트 옆에 이미지가 있다"는 시각적 관계는 파악하지만, **정확히 48px의 의도된 좌측 여백**까지는 추출하지 못합니다.

### 5.3 border-radius 8px — 미세한 라운딩 누락

이미지 컨테이너의 `border-radius: 8px`는:
- 바깥 카드 자체가 `border-radius: 6px`로 이미 둥글어서
- 내부 컨테이너의 추가 라운딩이 시각적으로 미묘하게 보임
- clone-ui가 "이미 카드가 둥글므로 내부는 각져도 된다"고 판단할 수 있음

### 5.4 `max-height: none` vs `100%` — 1~3px의 차이

```
max-height: 100%  → 이미지가 컨테이너 안에 정확히 맞춤 (498×340)
max-height: none  → 이미지가 컨테이너보다 살짝 큼 (503×343) → overflow: hidden으로 잘림
```

이 차이는 **1~3px** 수준이라 스크린샷에서는 구분이 불가능합니다. `getComputedStyle()`로 추출해야만 발견할 수 있습니다.

### 5.5 padding vs max-width — 겉보기 같은 결과, 다른 원인

```
방법 A: max-width: 892px                    → 카드 892px ✓
방법 B: max-width: 940px + padding: 0 24px  → 카드 892px ✓ (원본 방식)
```

시각적 결과는 동일해 보이지만, clone-ui는 **방법 A**를 택할 가능성이 높습니다. 원본이 **방법 B**를 사용하는 이유는 반응형 디자인에서 padding이 별도 역할을 하기 때문인데, 이런 설계 의도는 computed styles만으로는 파악하기 어렵습니다.

---

## 6. 핵심 교훈

### 6.1 "빈 공간"도 의도된 디자인이다

```
원본의 카드 너비 분해:
322px(텍스트) + 48px(간격) + 500px(이미지) + 2px(border) + 20px(우측여백) = 892px

clone-ui가 놓친 것: 48px 간격
→ 결과: 이미지가 570px로 팽창하여 텍스트에 바짝 붙음
```

### 6.2 "같은 너비"를 만드는 방법이 여러 가지

```
max-width: 892px              ← 직접 제한 (clone-ui 방식)
max-width: 940px + padding    ← 간접 제한 (원본 방식)
```

수치 추출 시 최종 너비만 보지 않고, **그 너비가 어떤 CSS 조합으로 만들어졌는지** 상위 컨테이너까지 추적해야 합니다.

### 6.3 "보이지 않는 속성"이 완성도를 좌우한다

이번 수정의 4가지 항목 중 **3가지가 시각적으로 미묘한 차이**였습니다:

| 수정 항목 | 시각적 차이 | 수치적 차이 |
| --- | --- | --- |
| `border-radius: 0 → 8px` | 미묘 (카드 자체가 이미 둥글어서) | 명확 |
| `margin-left: 0 → 48px` | 비교해야 보임 | 명확 |
| `max-height: 100% → none` | 거의 안 보임 (1~3px) | 명확 |
| `padding: 0 → 0 24px` | 비교해야 보임 (48px 차이) | 명확 |

→ **"눈으로 보이는" 차이는 작지만, "수치로 측정한" 차이는 명확**합니다. 픽셀 퍼펙트의 핵심은 시각 비교가 아니라 수치 추출과 대조입니다.
