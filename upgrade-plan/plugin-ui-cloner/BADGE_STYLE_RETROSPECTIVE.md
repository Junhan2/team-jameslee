# Semantic Similarity 뱃지 스타일 복원 후기

> "Semantic Similarity" 뱃지가 pill 스타일 없이 일반 텍스트로 렌더링되던 문제를 해결한 과정 기록

---

## 1. 작업 개요

**목표**: RAG Comparison 섹션의 "Semantic Similarity" 뱃지에 원본과 동일한 pill 스타일 적용

**문제 현상**: "Logical Reasoning"은 파란 그라디언트 pill로 표시되지만, "Semantic Similarity"는 배경/테두리 없이 일반 텍스트로 렌더링

```
원본: [Logical Reasoning (blue pill)] [Semantic Similarity (light pill, opacity 0.9)]
클론: [Logical Reasoning (blue pill)] Semantic Similarity (일반 텍스트)
```

---

## 2. 문제 진단 과정

### 2.1 1차 분석 오류 — `<p>` 태그만 확인

최초 조사에서 원본의 "Semantic Similarity" 텍스트 요소(`<p>`)만 추출:

```json
{
  "tag": "P",
  "fontSize": "12px",
  "fontWeight": "500",
  "color": "rgb(81, 91, 123)",
  "backgroundColor": "rgba(0, 0, 0, 0)",
  "borderRadius": "0px"
}
```

→ "원본도 일반 텍스트이므로 클론이 정확하다"고 오판

### 2.2 2차 분석 — 부모 레이어 전체 추출

유저 지적으로 재조사. 원본의 **전체 DOM 트리**를 추출한 결과:

```
원본 "Semantic Similarity" 구조 (3단 레이어):

<div> ← 그라디언트 pill 컨테이너
  class: bg-gradient-to-t from-[#f4f9ff] to-[#ffffff]
         border border-[#f4f9ff] rounded-[41px] h-[28px] opacity-90
  │
  └── <div> ← 패딩 래퍼
        class: px-[9px] py-[5px] pb-[6px] flex items-center justify-center
        │
        └── <p> ← 텍스트 (이것만 추출했었음)
              class: text-[12px] font-medium text-[#515b7b]
```

**핵심**: 스타일은 `<p>`가 아니라 **최외곽 `<div>`**에 적용되어 있었음

### 2.3 원본 3개 뱃지 비교

| 항목 | RAG Comparison | Logical Reasoning | Semantic Similarity |
|------|---------------|-------------------|---------------------|
| 역할 | 섹션 라벨 | PageIndex 강점 | 기존 방식 |
| 배경 | gradient(#f4f9ff → #fff) | gradient(#3788d8 → rgba) | gradient(#f4f9ff → #fff) |
| 테두리 | 1px solid #f4f9ff | 1px solid #acd4fb | 1px solid #f4f9ff |
| border-radius | 41px | 200px | 41px |
| 높이 | 32px | 29px | 28px |
| font-size | 14px | 12px | 12px |
| 색상 | #515B7B | white | #515B7B |
| opacity | 1.0 | 1.0 | **0.9** |

→ "Semantic Similarity"는 "RAG Comparison"과 동일한 그라디언트 pill이되, 크기가 약간 작고 opacity 0.9로 살짝 투명

---

## 3. 해결 — 수정 내역

### 3.1 클론의 수정 전 CSS

```css
.comparison-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 200px;
  height: 29px;
}

.badge-blue {
  color: white;
  background: linear-gradient(to top, #3788d8 12.751%, rgba(55, 136, 216, 0.4) 85.365%);
  border: 1px solid #acd4fb;
}

.badge-gray {
  color: var(--color-text-secondary);
  background-color: transparent;     /* ← 그라디언트 없음 */
  border-radius: 0;                  /* ← pill 모양 제거 */
  padding: 5px 9px 6px;
}
```

### 3.2 수정 후 CSS

```css
.badge-gray {
  color: var(--color-text-secondary);
  background: linear-gradient(to top, #f4f9ff, #ffffff);  /* ← 그라디언트 추가 */
  border: 1px solid #f4f9ff;                               /* ← 테두리 추가 */
  border-radius: 41px;                                     /* ← pill 모양 복원 */
  height: 28px;                                            /* ← 원본 높이 */
  opacity: 0.9;                                            /* ← 원본 투명도 */
}
```

---

## 4. 수정 후 수치 검증

```
항목                    원본          클론          상태
────────────────────────────────────────────────────────
너비                    131px         131px         ✓
높이                    28px          28px          ✓
font-size               12px          12px          ✓
font-weight             500           500           ✓
background              gradient      gradient      ✓
border                  1px #f4f9ff   1px #f4f9ff   ✓
border-radius           41px          41px          ✓
opacity                 0.9           0.9           ✓
padding                 5px 9px 6px   5px 9px 6px   ✓
```

---

## 5. 오진 원인 분석 — 왜 1차에서 "스타일 없음"으로 판단했는가

### 5.1 단일 요소만 추출하는 함수 설계

```javascript
// 1차 분석: 텍스트를 가진 요소만 찾음
allElements.forEach(el => {
  if (el.textContent.trim() === 'Semantic Similarity') {
    return getComputedStyle(el);  // ← <p> 태그만 반환
  }
});
```

문제: `<p>` 태그에는 `background: transparent`, `border-radius: 0`이 맞음.
하지만 스타일이 적용된 것은 **2단계 위의 부모 `<div>`**.

### 5.2 올바른 분석 방법

```javascript
// 2차 분석: 같은 텍스트를 가진 모든 조상 요소 추출
allElements.forEach(el => {
  if (targets.includes(el.textContent.trim())) {
    return getComputedStyle(el);  // ← <div>, <div>, <p> 모두 반환
  }
});
```

→ 같은 `textContent`를 공유하는 **모든 레이어**의 스타일을 추출하면 어느 레이어에 스타일이 있는지 즉시 파악 가능

### 5.3 "투명 배경 = 스타일 없음" 가정의 오류

```
<p> 태그 computed style:
  backgroundColor: rgba(0, 0, 0, 0)  → "투명이니까 스타일 없음" ← 오판

실제 구조:
  <div background=gradient>   ← 여기에 스타일!
    <div padding>
      <p transparent>         ← 여기만 봤음
```

CSS에서 **자식 요소의 배경이 투명하다고 부모에 스타일이 없는 것이 아님**.
부모의 배경이 자식을 통해 비쳐 보이는 것이 정상 동작.

---

## 6. 핵심 교훈

### 6.1 CSS 추출은 단일 요소가 아닌 DOM 트리 전체를 대상으로

```
잘못된 접근: textContent로 요소 1개를 찾고 → 그 요소의 computed style만 확인
올바른 접근: textContent로 모든 조상 요소를 찾고 → 각 레이어의 style을 비교

특히 Tailwind CSS 기반 사이트는 div > div > p 같은 다단 래퍼를 많이 사용
```

### 6.2 "같은 텍스트를 가진 모든 요소"가 분석 단위

```javascript
// textContent는 자식에게 상속되므로, 같은 텍스트를 가진 요소가 여러 개 나옴
document.querySelectorAll('*').forEach(el => {
  if (el.textContent.trim() === 'Semantic Similarity') {
    // → <div>(래퍼), <div>(패딩), <p>(텍스트) 3개가 모두 매칭
    // → 3개 모두의 스타일을 확인해야 완전한 분석
  }
});
```

### 6.3 시각적 유사성 판단의 한계

```
"Logical Reasoning" = 파란 pill    → 시각적으로 명확한 뱃지
"Semantic Similarity" = 연한 pill  → 배경이 거의 흰색이라 일반 텍스트처럼 보임

사람 눈:  "연한 회색 텍스트 = 스타일 없음" (오판 가능)
DevTools: gradient(#f4f9ff → #fff), border, radius 41px (명확한 스타일)
```

gradient가 `#f4f9ff → #ffffff`처럼 **거의 흰색**일 때, 스크린샷만으로는 배경이 있는지 없는지 구분하기 어려움. DevTools 수치 확인이 필수.

### 6.4 opacity 0.9 같은 미세한 차이도 의도적 디자인

```
RAG Comparison badge:     opacity 1.0 (섹션 라벨 — 강조)
Logical Reasoning badge:  opacity 1.0 (PageIndex 강점 — 강조)
Semantic Similarity badge: opacity 0.9 (기존 방식 — 약간 투명하게 비강조)
```

0.1 차이의 opacity도 디자인 의도를 반영. 시각적 위계(visual hierarchy)를 위한 미세 조정.
