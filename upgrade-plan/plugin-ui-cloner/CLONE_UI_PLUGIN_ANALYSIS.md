# clone-ui 플러그인이 픽셀 퍼펙트를 달성하지 못한 이유

> pageindex.ai Feature Cards 클론 작업에서 clone-ui 플러그인 방식 vs 수동 DevTools 추출 방식의 근본적 차이 분석

---

## 1. 결론 요약

clone-ui 플러그인은 **"요소별 속성 추출"** 방식이고,
성공한 접근법은 **"요소간 관계 측정"** 방식이다.

이 차이가 품질 격차의 근본 원인이다.

---

## 2. clone-ui 플러그인의 추출 방식 분석

### 2.1 플러그인이 추출하는 것

`ui-extractor.md`와 `ui-clone.md`에 정의된 추출 로직을 보면:

```javascript
// ui-clone.md Phase 2 — 단일 요소 추출
const computed = window.getComputedStyle(el);
const props = [
  'display', 'flexDirection', 'alignItems', 'justifyContent', 'gap',
  'position', 'top', 'left', 'right', 'bottom', 'zIndex',
  'width', 'height', 'maxWidth', 'minHeight',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'background', 'backgroundColor', 'backgroundImage',
  'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
  'boxShadow', 'opacity',
  'font', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
  'color', 'textAlign',
  'transform', 'transition'
];
```

```javascript
// ui-clone.md Phase 3 — 자식 요소 추출 (9개 속성만)
results.push({
  tag: el.tagName,
  class: el.className,
  styles: {
    display: computed.display,
    padding: computed.padding,
    margin: computed.margin,
    background: computed.backgroundColor,
    borderRadius: computed.borderRadius,
    boxShadow: computed.boxShadow,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    color: computed.color
  }
});
```

### 2.2 플러그인이 추출하지 않는 것

이 Feature Card 작업에서 **결정적으로 중요했던 정보들**:

| 필요했던 정보 | clone-ui가 추출하는가 | 성공한 방식에서의 역할 |
|--------------|:-------------------:|---------------------|
| 요소 간 상대적 위치 (titleTop - cardTop) | **X** | Card #1 title이 카드 상단에서 41px |
| `margin-top: auto` (authored value) | **X** (computed로 해석됨) | Cards #2-5 텍스트를 하단에 배치 |
| `order: -1` (flex ordering) | **X** (자식 추출에 미포함) | 이미지를 텍스트 위로 재배치 |
| `flex-shrink: 0` | **X** (자식 추출에 미포함) | Card #6의 70/30 비율 유지 |
| `overflow: hidden` | **X** | Card #1 이미지 overflow 크롭 |
| `object-fit: contain` | **X** | SVG 이미지 비율 유지 |
| 형제 요소 간 크기 비율 | **X** | Card #6의 image:text = 70:30 |
| 동일 클래스 요소 간 구조 차이 | **X** | 6개 카드가 3가지 패턴 |

---

## 3. 7가지 근본 한계

### 한계 1: 속성 추출 vs 관계 측정

**clone-ui 방식** — 각 요소의 속성을 독립적으로 추출:

```javascript
// 각 요소를 개별로 처리
const titleStyle = getComputedStyle(title);
// 결과: { fontSize: "28px", fontWeight: "600", color: "#142132" }
// → 타이포그래피는 맞지만, "카드 안에서 어디에 있는지"를 모름
```

**성공한 방식** — 요소 간 상대적 관계를 계산:

```javascript
// 부모-자식 관계를 측정
const cardRect = card.getBoundingClientRect();
const titleRect = title.getBoundingClientRect();
const relativeTop = titleRect.top - cardRect.top;  // = 41px
const relativeLeft = titleRect.left - cardRect.left; // = 33px
// → "title은 카드 상단에서 41px, 좌측에서 33px에 위치"
```

**왜 이것이 중요한가**: 같은 `font-size: 28px` 제목이라도, Card #1에서는 **상단**에, Card #2에서는 **하단**에 있다. 속성은 동일하지만 위치가 다르다. clone-ui는 이 위치 차이를 감지하지 못한다.

### 한계 2: Computed Value vs Authored Value 혼동

```javascript
// clone-ui가 읽는 값 (computed)
getComputedStyle(title).marginTop  // → "257px" (브라우저가 계산한 값)

// 원래 작성되어야 하는 값 (authored)
.feature-title { margin-top: auto; } // flex에서 하단 정렬
```

`getComputedStyle()`은 **브라우저가 최종 계산한 결과값**을 반환한다.
`margin-top: auto`는 `margin-top: 257px` 같은 구체적 수치로 변환된다.

**문제점**: `257px`를 그대로 적용하면:
- 뷰포트 크기가 바뀌면 깨짐
- 카드 높이가 달라지면 깨짐
- 반응형에서 완전히 틀어짐

`auto`는 **의도를 표현**하는 값이고, `257px`는 **특정 조건에서의 결과**일 뿐이다.

### 한계 3: 구조적 패턴 인식 부재

clone-ui의 자식 요소 추출:

```javascript
// 모든 .feature-card를 동일하게 처리
parent.querySelectorAll('*').forEach((el, i) => {
  if (i > 50) return;
  // 모든 자식의 속성을 "평탄하게" 추출
});
```

**수동 분석에서 발견한 것**:

```
같은 클래스 `.feature-card`이지만 3가지 서로 다른 레이아웃:

Card #1:   title → subtitle → image(absolute, overflow)
Card #2-5: image(order:-1) → number → title(margin-top:auto) → subtitle
Card #6:   [image-wrapper 70%] | [content 30%: number → title → subtitle]
```

clone-ui는 `.feature-card` 6개를 모두 **하나의 패턴**으로 인식한다.
"이 카드들이 구조적으로 다르다"는 판단을 하지 못한다.

### 한계 4: 자식 추출 속성의 심각한 부족

clone-ui Phase 3의 자식 추출은 **9개 속성만** 수집:

```javascript
styles: {
  display, padding, margin, background, borderRadius,
  boxShadow, fontSize, fontWeight, color
}
```

Feature Card에서 **실제로 레이아웃을 결정한 속성들**:

```css
/* 이 중 clone-ui가 추출하는 것: 0개 */
position: absolute;     /* Card #1 이미지 위치 */
top: 130px;             /* Card #1 이미지 offset */
height: 332px;          /* Card #1 이미지 크기 */
order: -1;              /* Cards #2-5 이미지를 상단으로 */
flex-shrink: 0;         /* Card #6 비율 유지 */
flex-direction: row;    /* Card #6 가로 레이아웃 */
width: 70%;             /* Card #6 이미지 영역 비율 */
overflow: hidden;       /* Card #1 이미지 크롭 */
object-fit: contain;    /* SVG 비율 유지 */
margin-top: auto;       /* Cards #2-5 텍스트 하단 배치 */
```

**레이아웃을 결정하는 핵심 속성의 100%가 자식 추출에서 누락된다.**

### 한계 5: HTML 구조 변경 불가

clone-ui의 파이프라인:

```
원본 HTML 추출 → CSS 추출 → CSS 적용한 새 파일 생성
```

이 파이프라인은 **HTML 구조가 올바르다는 전제** 위에 작동한다.

Card #6의 경우:

```html
<!-- 원본 pageindex.ai의 HTML (추정) -->
<div class="feature-card">
  <div class="image-area">...</div>   <!-- 70% -->
  <div class="text-area">...</div>    <!-- 30% -->
</div>

<!-- clone-ui가 만든 HTML (초기 클론) -->
<div class="feature-card">
  <div class="feature-content">       <!-- 이미지+텍스트 모두 포함 -->
    <span class="feature-number">06</span>
    <div class="feature-image-container">
      <img src="...">
    </div>
    <h3>Human-like Retrieval</h3>
  </div>
</div>
```

Card #6은 이미지를 `.feature-content` **밖으로** 분리해야 70/30 가로 분할이 가능했다.
clone-ui는 CSS만 교체하고 HTML 구조를 재설계하지 않으므로, 이 레이아웃을 구현할 수 없다.

### 한계 6: 검증 방법의 차이

**clone-ui의 검증** (`clone-ui.md` Step 5):

```
1. 로컬 서버 시작 (python -m http.server)
2. 브라우저에서 결과물 확인
3. 원본과 시각적 비교     ← "눈으로" 비교
4. 필요시 수정
```

**성공한 방식의 검증**:

```javascript
// 클론에서 동일 측정 실행
const cloneTitle = cloneCard.querySelector('.feature-title');
const cloneTitleTop = cloneTitle.getBoundingClientRect().top
                    - cloneCard.getBoundingClientRect().top;
// 결과: 42px (원본: 41px, 오차: 1px ✓)
```

"시각적 비교"는 **20px 오차도 "비슷해 보인다"**고 판단할 수 있다.
수치 비교는 **1px 오차까지 정확히 감지**한다.

### 한계 7: 의사 요소 및 CSS 기법 미인식

clone-ui가 놓치는 CSS 기법들:

| CSS 기법 | Feature Card에서의 용도 | clone-ui 대응 |
|----------|----------------------|---------------|
| `::before` / `::after` | 장식 요소, 오버레이 | 추출 불가 |
| `position: absolute + inset: 0` | hover 오버레이 전체 덮기 | absolute만 추출, inset은 누락 가능 |
| `overflow: hidden` + 초과 크기 | 이미지 크롭 효과 | overflow는 추출하지만 "의도적 초과"를 이해 못함 |
| `backdrop-filter: blur()` | 반투명 오버레이 블러 | 추출은 하나 브라우저 지원 차이 |
| `margin-top: auto` in flex | 하단 정렬 | computed value로 해석되어 의도 손실 |

---

## 4. 구체적 실패 시나리오 재현

### Card #1에서 일어나는 일

**clone-ui가 추출하는 데이터:**

```json
{
  "feature-card": {
    "display": "flex", "flexDirection": "column",
    "height": "445px", "backgroundColor": "#ffffff"
  },
  "feature-title": {
    "fontSize": "28px", "fontWeight": "600", "color": "#142132"
  },
  "feature-image-container": {
    "display": "flex", "alignItems": "center"
  }
}
```

**clone-ui가 모르는 것:**

```
- title은 카드 상단에서 41px에 위치해야 함
- "01" 번호는 좌측이 아니라 우측 상단에 있음
- 이미지는 position:absolute + top:130px로 카드 하단에 고정
- 이미지 height가 332px로 카드(445px)를 넘어 overflow됨
- overflow:hidden으로 넘친 부분이 잘림
```

**결과:** clone-ui는 title, image, subtitle이 일반적인 flex column 순서로 배치된 "평범한 카드"를 만든다.

### Card #6에서 일어나는 일

**clone-ui가 추출하는 데이터:**

```json
{
  "feature-card": {
    "display": "flex", "height": "445px"
  },
  "feature-content": {
    "display": "flex", "flexDirection": "column"
  }
}
```

**clone-ui가 모르는 것:**

```
- 이 카드만 flex-direction: row (가로 배치)
- 이미지와 텍스트가 별도 div로 분리되어야 함
- 이미지 영역 70%, 텍스트 영역 30% 비율
- "06" 번호가 position:static (다른 카드는 absolute)
- 텍스트 영역 내에서 number는 상단, title/subtitle은 하단
```

**결과:** clone-ui는 다른 카드와 동일한 세로 레이아웃으로 Card #6을 만든다.

---

## 5. 플러그인 방식의 구조적 한계 (설계 차원)

### 5.1 "추출 → 적용" 2단계 파이프라인의 근본 문제

```
clone-ui:    추출(Extract) → 적용(Apply)
성공한 방식:  추출(Extract) → 분석(Analyze) → 설계(Design) → 적용(Apply) → 검증(Verify)
```

clone-ui에는 **분석(Analyze)과 설계(Design) 단계가 없다**.

- **분석**: "6개 카드가 3가지 다른 패턴이다"를 파악하는 단계
- **설계**: "Card #6은 HTML 구조를 바꿔야 한다"를 결정하는 단계

이 두 단계는 **인간의 판단**이 필요한 영역이며, 단순한 속성 추출로는 대체할 수 없다.

### 5.2 getComputedStyle()의 본질적 한계

`getComputedStyle()`은 브라우저의 **최종 렌더링 결과**를 읽는다.
하지만 클론에 필요한 것은 **그 결과를 만든 원인(CSS 규칙)**이다.

```
원본 CSS 규칙:
  .title { margin-top: auto; }          ← 이것이 필요함

getComputedStyle() 결과:
  marginTop: "257.5px"                   ← 이것은 결과일 뿐

클론에 적용할 CSS:
  .title { margin-top: auto; }          ← 원인을 복원해야 함
  .title { margin-top: 257.5px; }       ← 결과를 복사하면 깨짐
```

이 문제는 **어떤 자동화 도구도** getComputedStyle()만으로는 해결할 수 없다.
CSS 규칙을 직접 분석하거나, 렌더링 결과를 해석하여 의도를 추론해야 한다.

### 5.3 "동일 클래스 = 동일 구조" 가정의 오류

clone-ui는 같은 클래스명을 가진 요소들을 동일 패턴으로 처리한다.

```
.feature-card (Card #1) → 패턴 A
.feature-card (Card #2) → 패턴 B   ← 다른 패턴이지만 같은 클래스
.feature-card (Card #6) → 패턴 C   ← 또 다른 패턴이지만 같은 클래스
```

실제 웹사이트에서는 **같은 컴포넌트가 변형(variant)**으로 사용되는 경우가 매우 흔하다.
clone-ui의 "클래스 기반 추출"은 이 변형을 구분하지 못한다.

---

## 6. clone-ui 플러그인으로도 성공하려면 필요한 개선점

### 개선 1: 관계 측정 추가

```javascript
// 현재: 각 요소의 속성만 추출
const styles = getComputedStyle(el);

// 개선: 부모 대비 상대 위치 계산
const parentRect = el.parentElement.getBoundingClientRect();
const childRect = el.getBoundingClientRect();
const relativePosition = {
  top: childRect.top - parentRect.top,
  left: childRect.left - parentRect.left,
  widthRatio: childRect.width / parentRect.width,
  heightRatio: childRect.height / parentRect.height
};
```

### 개선 2: 패턴 분류 단계 추가

```javascript
// 같은 클래스의 요소들을 비교하여 변형(variant) 감지
const cards = document.querySelectorAll('.feature-card');
const patterns = {};

cards.forEach((card, i) => {
  const structure = getStructureSignature(card);
  // 자식 요소의 순서, 위치, 크기를 기반으로 구조 시그니처 생성
  if (!patterns[structure]) patterns[structure] = [];
  patterns[structure].push(i);
});

// 결과: { "text-top-image-bottom": [0], "image-top-text-bottom": [1,2,3,4], "horizontal": [5] }
```

### 개선 3: Authored CSS 규칙 추출

```javascript
// computed 값 대신 원본 CSS 규칙 직접 읽기
for (const sheet of document.styleSheets) {
  for (const rule of sheet.cssRules) {
    if (el.matches(rule.selectorText)) {
      // rule.style에서 authored 값 추출
      // margin-top: auto (computed가 아닌 원본 값)
    }
  }
}
```

### 개선 4: 자식 추출 속성 확대

```javascript
// 현재 9개 → 레이아웃 결정 속성 추가
const layoutProps = [
  'position', 'top', 'left', 'right', 'bottom',
  'width', 'height', 'maxWidth', 'minHeight',
  'order', 'flex', 'flexShrink', 'flexGrow', 'flexBasis',
  'overflow', 'objectFit', 'objectPosition',
  'alignSelf', 'justifySelf',
  'gridColumn', 'gridRow'
];
```

### 개선 5: 수치 검증 자동화

```javascript
// 생성된 클론에서 동일 측정을 수행하여 자동 비교
async function verifyClone(originalUrl, cloneUrl, selectors) {
  const original = await measureElements(originalUrl, selectors);
  const clone = await measureElements(cloneUrl, selectors);

  return selectors.map(sel => ({
    selector: sel,
    originalPos: original[sel],
    clonePos: clone[sel],
    deviation: calculateDeviation(original[sel], clone[sel]),
    pass: deviation < 3  // 3px 이내면 통과
  }));
}
```

---

## 7. 최종 비교표

| 항목 | clone-ui 플러그인 | 수동 DevTools 추출 |
|------|:-----------------:|:-----------------:|
| **추출 대상** | 요소별 CSS 속성 | 요소 간 상대적 관계 |
| **자식 요소 속성** | 9개 (시각 위주) | 전체 (레이아웃 포함) |
| **값 유형** | Computed (결과값) | Authored (의도값) + Measured (실측값) |
| **패턴 인식** | 클래스 기반 (동일 처리) | 구조 분석 (변형 감지) |
| **HTML 변경** | 불가 (CSS만 교체) | 필요시 구조 재설계 |
| **검증 방식** | 시각적 비교 (눈) | 수치 비교 (px 단위) |
| **오차 범위** | 10-30px | 1-2px |
| **반응형 안정성** | 낮음 (고정 px 의존) | 높음 (auto, flex 활용) |
| **작업 속도** | 빠름 (자동화) | 느림 (수동 분석) |
| **범용성** | 높음 (대부분의 사이트) | 낮음 (사이트별 맞춤) |

---

## 8. 결론

clone-ui 플러그인의 핵심 가치는 **속도와 범용성**이다. 대부분의 사이트에서 80% 수준의 클론을 빠르게 만들어낸다.

하지만 **픽셀 퍼펙트(100%)**를 달성하지 못하는 이유는:

1. **속성을 추출하지만, 관계를 측정하지 않는다**
2. **결과값(computed)을 읽지만, 의도(authored)를 파악하지 않는다**
3. **동일 클래스의 변형(variant)을 구분하지 못한다**
4. **CSS만 교체하고, HTML 구조를 재설계하지 않는다**
5. **눈으로 검증하고, 수치로 검증하지 않는다**

이 다섯 가지 한계는 모두 **"자동 추출"과 "인간의 분석/판단" 사이의 갭**에서 발생한다.

> **한 줄 요약**: clone-ui는 "무엇이 렌더링되었는가"를 추출하지만,
> 픽셀 퍼펙트에는 "왜 그렇게 렌더링되었는가"를 이해해야 한다.
