# Grid 패턴 클론 작업 후기

> 파란색 CTA 섹션의 격자 배경이 원본 대비 4배 이상 진하게 보였던 문제를 해결한 과정 기록

---

## 1. 작업 개요

**목표**: pageindex.ai의 파란색 CTA 섹션(MCP CTA, Bottom CTA)의 격자 배경 패턴을 원본과 동일한 투명도로 재현

**문제 현상**: 클론의 격자 선이 원본보다 **눈에 띄게 진하여**, 일러스트레이션과 격자가 자연스럽게 어우러지지 않고 격자가 독립적으로 부각됨

```
원본: 격자가 거의 보이지 않음 → 일러스트와 배경이 하나처럼 자연스러움
클론: 격자가 또렷하게 보임 → 일러스트 위에 격자를 덧씌운 느낌
```

---

## 2. 문제 진단 과정

### 2.1 시각적 비교에서 시작

사용자가 원본과 클론의 스크린샷을 비교하여 **"선이 더 옅고, 이미지의 하얀색 선이 격자 선과 맞아 떨어지면서 마치 배경의 일부처럼 보인다"**고 지적.

### 2.2 원본 레이어 구조 분석 (Chrome DevTools)

```javascript
// 원본 사이트의 MCP CTA 섹션 구조를 JavaScript로 분석
() => {
  const container = /* 파란색 컨테이너 */;
  return Array.from(container.children).map(child => ({
    position: getComputedStyle(child).position,
    opacity: getComputedStyle(child).opacity,
    hasGridImg: !!child.querySelector('img[src*="grid"]')
  }));
}
```

**추출된 레이어 구조:**

| 레이어 | 역할 | CSS |
|--------|------|-----|
| Layer 0 (컨테이너) | 파란색 배경 | `background: linear-gradient(#3788d8)`, `overflow: hidden` |
| Layer 1 (absolute) | 격자 오버레이 | `position: absolute; inset: 0; opacity: 0.7` |
| Layer 2 (relative) | 콘텐츠 + 일러스트 | `position: relative; display: flex` |

### 2.3 핵심 발견 — 격자 SVG 자체가 다른 파일

원본의 grid SVG URL을 추출하여 실제 파일을 다운로드하고, 클론의 파일과 비교:

```
원본 SVG: https://pageindex.ai/static/images/new-homepage/grid.svg
클론 SVG: assets/images/grid-chevron.svg
```

**결정적 차이:**

| 속성 | 원본 (grid.svg) | 클론 (grid-chevron.svg) |
|------|-----------------|------------------------|
| 구조 | 46개 개별 대각선 | `<pattern>` 반복 요소 |
| viewBox | `0 0 1373 450` (고정 크기) | 없음 (`width="100%"`) |
| stroke 색상 | `#E7E7E7` | `#e6ebf3` |
| **stroke-opacity** | **0.24** | **없음 (= 1.0)** |
| stroke-width | `0.906141` | `1` |
| 각도 | `matrix(0.866025 0.5 ...)` (isometric 30°) | 좌표 기반 직선 |

### 2.4 투명도 계산으로 수치 검증

```
실효 투명도 = SVG stroke-opacity × CSS container opacity

원본: 0.24 × 0.7 = 0.168 (16.8%)
클론: 1.00 × 0.7 = 0.700 (70.0%)

차이: 70.0 / 16.8 = 4.17배
→ 클론의 격자가 원본 대비 4.17배 더 진하게 보임
```

---

## 3. 해결 방법

### 3.1 원본 SVG 다운로드

```bash
curl -sL "https://pageindex.ai/static/images/new-homepage/grid.svg" \
  -o assets/images/grid-original.svg
```

### 3.2 HTML에서 SVG 참조 교체

```html
<!-- Before: 잘못된 SVG -->
<div class="mcp-cta-bg">
  <img src="assets/images/grid-chevron.svg" alt="" aria-hidden="true">
</div>

<!-- After: 원본 SVG -->
<div class="mcp-cta-bg">
  <img src="assets/images/grid-original.svg" alt="" aria-hidden="true">
</div>
```

MCP CTA (line 432)와 Bottom CTA (line 727) 두 곳 모두 동일하게 교체.

### 3.3 기존 파일은 유지 (정확성 확인 완료)

| 파일 | 사용 위치 | 원본 대비 | 조치 |
|------|-----------|-----------|------|
| `grid-chevron.svg` | 벤치마크 섹션 | ✅ 동일 (stroke `#e6ebf3`, sw:1, pattern 방식) | 유지 |
| `grid-chevron-thin.svg` | 푸터 | ✅ 동일 (stroke `#e6ebf3`, sw:0.6, opacity:0.12) | 유지 |
| `cta-background.svg` | CTA 일러스트 | ✅ 동일 (174,810 bytes, byte-for-byte 일치) | 유지 |

---

## 4. 검증 — 원본 사이트 전수 조사 결과

원본 사이트의 **모든 grid 사용처**를 JavaScript로 추출하여 클론과 대조:

```javascript
// 원본 사이트에서 모든 grid 관련 요소 검색
document.querySelectorAll('img[src*="grid"]')  // → 2개 (MCP CTA, Bottom CTA)
footer.querySelectorAll('img[src*="grid"]')    // → 0개 (footer는 inline SVG 사용)
benchmarkContainer.children[0].querySelector('svg')  // → inline SVG (pattern 방식)
```

**원본 사이트의 grid 사용 전체 맵:**

| 섹션 | 방식 | stroke | stroke-opacity | stroke-width | container opacity |
|------|------|--------|----------------|--------------|-------------------|
| MCP CTA | `<img>` → `grid.svg` | `#E7E7E7` | `0.24` | `0.906141` | `0.7` |
| Bottom CTA | `<img>` → `grid.svg` | `#E7E7E7` | `0.24` | `0.906141` | `0.7` |
| Benchmark | inline `<svg>` + `<pattern>` | `#e6ebf3` | 없음 | `1` | `0.7` |
| Footer | inline `<svg>` + `<pattern>` | `#e6ebf3` | 없음 | `0.6` | `0.12` |

**핵심 발견: 원본은 용도에 따라 2가지 완전히 다른 grid SVG를 사용**

```
파란색 배경용 (CTA): grid.svg — 개별 선, stroke-opacity 0.24, 매우 옅음
밝은 배경용 (벤치마크/푸터): inline SVG — <pattern> 반복, opacity 없음, 상대적으로 진함
```

---

## 5. clone-ui 플러그인이 이 문제를 해결하지 못했던 이유

### 5.1 SVG 내부 속성은 추출 범위 밖

clone-ui 플러그인의 CSS 추출 범위:

```
✅ 추출 가능: element의 computed styles (opacity, position, width, height 등)
✅ 추출 가능: background-color, background-image (CSS 속성)
❌ 추출 불가: <img> 태그가 참조하는 SVG 파일 내부의 속성
❌ 추출 불가: SVG 내부의 stroke-opacity, stroke-width, viewBox
❌ 추출 불가: SVG가 <pattern> 방식인지 개별 선 방식인지
```

`getComputedStyle()`은 SVG 파일의 내부 속성에 접근하지 못합니다. grid 레이어의 `opacity: 0.7`은 추출하더라도, SVG 내부의 `stroke-opacity="0.24"`는 별도의 파일 분석이 필요합니다.

### 5.2 "비슷한" 패턴으로 대체 생성

clone-ui가 격자 배경을 재현할 때의 접근:

```
1. 스크린샷에서 "격자 패턴이 있다"는 것을 인식
2. 비슷한 모양의 SVG <pattern>을 새로 생성
3. 색상은 스크린샷에서 대략적으로 추출 (#e6ebf3)
4. stroke-opacity는 인식하지 못하므로 기본값(1.0) 적용
```

이 과정에서 **"눈에 보이는 것을 재현"**하지만, **"눈에 보이지 않는 속성"**(stroke-opacity)은 놓칩니다.

### 5.3 단일 패턴을 전체에 적용

clone-ui는 "격자 배경"이라는 시각적 요소를 하나의 SVG로 만들어 전체 사이트에 공유합니다:

```
clone-ui 접근: grid-chevron.svg → MCP CTA, Bottom CTA, 벤치마크 모두 동일
원본 실제:     grid.svg (CTA용) ≠ inline SVG (벤치마크용) ≠ inline SVG (푸터용)
```

원본이 용도별로 **3가지 다른 격자 구현**을 사용한다는 것을 파악하려면, 각 섹션의 DOM 구조를 개별적으로 분석해야 합니다.

### 5.4 근본적 한계 — 파일 수준 분석 불가

| 분석 수준 | clone-ui | 수동 DevTools |
|-----------|----------|---------------|
| CSS computed styles | ✅ | ✅ |
| DOM 구조 | ✅ | ✅ |
| img src URL 추출 | ❌ | ✅ |
| SVG 파일 다운로드 | ❌ | ✅ (`curl`) |
| SVG 내부 속성 분석 | ❌ | ✅ (파일 직접 읽기) |
| 섹션별 차이 비교 | 제한적 | ✅ (전수 조사) |

---

## 6. 핵심 교훈

### 6.1 "같은 패턴"이 같은 파일이 아닐 수 있다

```
시각적으로 같은 격자 패턴이라도:
- 파란색 배경 위 → stroke-opacity 0.24, 개별 선, isometric 행렬 변환
- 밝은 배경 위 → opacity 없음, <pattern> 반복, 좌표 기반 직선
- 푸터 위 → stroke-width 0.6 (더 얇은 선), container opacity 0.12
```

### 6.2 투명도는 "곱셈"으로 누적된다

```
최종 투명도 = SVG stroke-opacity × CSS container opacity × (기타 부모 opacity)

이 곱셈 체인 중 하나라도 빠지면 결과가 크게 달라진다:
- 0.24 × 0.7 = 0.168 (원본, 미묘하게 보임)
- 1.00 × 0.7 = 0.700 (클론, 눈에 확 띔)
```

### 6.3 원본 에셋 직접 확보가 가장 정확하다

```
방법 1 (clone-ui): 스크린샷 → 시각적 추정 → 새로 생성  ← 오차 발생
방법 2 (수동):     URL 추출 → curl 다운로드 → 원본 그대로 사용  ← 오차 0
```

SVG, 폰트, 이미지 등 **에셋 파일**은 CSS 추출과 달리 **원본을 직접 확보**하는 것이 가장 확실한 방법입니다. `getComputedStyle()`이 접근할 수 없는 파일 내부 속성까지 완벽하게 가져옵니다.

### 6.4 전수 조사로 "공유"와 "분리"를 구분해야 한다

```
잘못된 가정: "모든 격자 배경은 같은 SVG를 사용한다"
올바른 접근: 각 섹션의 grid 요소를 개별 분석하여 어떤 파일/구현을 쓰는지 확인

원본 조사 결과:
- CTA 2곳: grid.svg (img 태그)
- 벤치마크: inline SVG (다른 패턴)
- 푸터: inline SVG (또 다른 설정)
→ 총 3가지 서로 다른 구현
```

---

## 7. 적용 가능한 일반 원칙

1. **에셋 파일은 추출이 아니라 확보** — SVG, 폰트, 이미지는 CSS 추출이 아닌 URL을 통한 직접 다운로드가 정확도 100%
2. **투명도 체인 전체를 추적** — CSS opacity, SVG stroke-opacity, fill-opacity 등 모든 레이어를 곱셈으로 계산
3. **"같은 패턴" 가정 금지** — 시각적으로 유사한 요소도 반드시 개별 분석하여 실제 구현 차이를 확인
4. **전수 조사 필수** — `querySelectorAll`로 사이트 전체의 해당 요소를 검색하고, 섹션별로 구현 방식이 다른지 대조
5. **수치 검증으로 완료** — "비슷해 보인다"가 아니라 `0.24 × 0.7 = 0.168`처럼 계산으로 일치를 확인
