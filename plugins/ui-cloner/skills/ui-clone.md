---
name: ui-clone
description: |
  레퍼런스 사이트의 UI 컴포넌트를 완벽하게 클론하는 스킬입니다.
  Claude in Chrome을 사용하여 CSS를 추출하고, 컴포넌트화된 코드를 생성합니다.

  다음과 같은 경우에 사용하세요:
  - "UI 클론해줘", "이 사이트 디자인 따라해줘"
  - "네비게이션 복제해줘", "이 컴포넌트 똑같이 만들어줘"
  - "레퍼런스 사이트에서 CSS 추출해줘"
  - "/clone-ui" 명령어 사용 시
---

# UI Cloner Skill

레퍼런스 웹사이트의 UI 컴포넌트를 완벽하게 클론합니다.

## 워크플로우

### Phase 1: 정보 수집

사용자에게 다음 정보를 확인하세요:

1. **레퍼런스 URL**: 클론할 사이트 주소
2. **타겟 섹션**: 클론할 특정 영역 (네비게이션, Hero, Footer 등)
3. **출력 위치**: 파일 저장 경로
4. **프레임워크**: React/Vue/Vanilla JS 등 (선택사항)
5. **컴포넌트화**: 단일 파일 vs 컴포넌트 분리

### Phase 2: CSS 추출 (Claude in Chrome)

```javascript
// 1. 브라우저에서 사이트 열기
mcp__claude-in-chrome__navigate({ url: referenceUrl, tabId: tabId })

// 2. 페이지 스냅샷으로 구조 파악
mcp__claude-in-chrome__take_snapshot({ tabId: tabId })

// 3. JavaScript로 CSS 추출
mcp__claude-in-chrome__javascript_tool({
  tabId: tabId,
  action: 'javascript_exec',
  text: `
    (function() {
      const selector = '${targetSelector}';
      const el = document.querySelector(selector);
      if (!el) return { error: 'Element not found' };

      const computed = window.getComputedStyle(el);
      const styles = {};

      // 핵심 CSS 속성들
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

      props.forEach(prop => {
        const value = computed.getPropertyValue(
          prop.replace(/([A-Z])/g, '-$1').toLowerCase()
        );
        if (value && value !== 'none' && value !== 'normal' && value !== '0px') {
          styles[prop] = value;
        }
      });

      return {
        selector: selector,
        tagName: el.tagName,
        className: el.className,
        styles: styles,
        innerHTML: el.innerHTML.substring(0, 2000),
        childCount: el.children.length
      };
    })()
  `
})
```

### Phase 3: 자식 요소 추출

```javascript
// 자식 요소들의 CSS도 재귀적으로 추출
mcp__claude-in-chrome__javascript_tool({
  tabId: tabId,
  action: 'javascript_exec',
  text: `
    (function() {
      const parent = document.querySelector('${targetSelector}');
      const children = parent.querySelectorAll('*');
      const results = [];

      children.forEach((el, i) => {
        if (i > 50) return; // 최대 50개
        const computed = window.getComputedStyle(el);
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
      });

      return results;
    })()
  `
})
```

### Phase 4: Hover/Active 상태 추출

```javascript
// hover 상태 시뮬레이션
mcp__claude-in-chrome__hover({ uid: elementRef, tabId: tabId })

// hover 상태의 CSS 추출
mcp__claude-in-chrome__javascript_tool({
  tabId: tabId,
  action: 'javascript_exec',
  text: `
    (function() {
      const el = document.querySelector('${targetSelector}');
      // 강제로 :hover pseudo-class 적용
      el.matches(':hover'); // trigger
      const computed = window.getComputedStyle(el);
      return {
        transform: computed.transform,
        boxShadow: computed.boxShadow,
        backgroundColor: computed.backgroundColor,
        transition: computed.transition
      };
    })()
  `
})
```

### Phase 5: 코드 생성

추출된 CSS를 기반으로 파일 생성:

#### Vanilla HTML/CSS/JS
```
output/
├── index.html
├── styles.css
└── scripts.js
```

#### React Component
```
output/
├── ComponentName/
│   ├── index.tsx
│   ├── ComponentName.tsx
│   ├── ComponentName.module.css (또는 .styles.ts)
│   └── types.ts
```

#### Vue Component
```
output/
├── ComponentName.vue (SFC)
```

## CSS 변수 추출

```javascript
// :root CSS 변수 추출
mcp__claude-in-chrome__javascript_tool({
  tabId: tabId,
  action: 'javascript_exec',
  text: `
    (function() {
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const vars = {};

      // 모든 CSS 변수 수집
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.selectorText === ':root') {
              Array.from(rule.style).forEach(prop => {
                if (prop.startsWith('--')) {
                  vars[prop] = computed.getPropertyValue(prop).trim();
                }
              });
            }
          });
        } catch(e) {}
      });

      return vars;
    })()
  `
})
```

## 반응형 Breakpoints 추출

```javascript
// 미디어 쿼리 추출
mcp__claude-in-chrome__javascript_tool({
  tabId: tabId,
  action: 'javascript_exec',
  text: `
    (function() {
      const mediaQueries = [];

      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSMediaRule) {
              mediaQueries.push({
                condition: rule.conditionText,
                rules: rule.cssRules.length
              });
            }
          });
        } catch(e) {}
      });

      return [...new Set(mediaQueries.map(m => m.condition))];
    })()
  `
})
```

## 출력 템플릿

### HTML 템플릿
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Clone</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${extractedHTML}
  <script src="scripts.js"></script>
</body>
</html>
```

### CSS 템플릿
```css
/* ============================================
   ${componentName} - Cloned from ${referenceUrl}
   ============================================ */

/* CSS Variables */
:root {
  ${extractedVariables}
}

/* Component Styles */
${extractedStyles}

/* Responsive */
${responsiveStyles}

/* Dark Mode */
${darkModeStyles}
```

### React 컴포넌트 템플릿
```tsx
import React from 'react';
import styles from './${componentName}.module.css';

interface ${componentName}Props {
  // props
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className={styles.container}>
      ${extractedJSX}
    </div>
  );
};
```

## 체크리스트

클론 완료 후 자동 검증:

- [ ] 컨테이너 크기/패딩 일치
- [ ] border-radius 값 정확히 일치
- [ ] box-shadow 값 정확히 일치
- [ ] 폰트 스타일 일치
- [ ] 색상값 일치
- [ ] hover 인터랙션 작동
- [ ] 반응형 breakpoints 작동
- [ ] 다크모드 지원 (해당 시)

## 사용 예시

```
/clone-ui https://example.com nav ./output/nav-clone react
```

또는 대화형:
```
"example.com의 네비게이션을 React 컴포넌트로 클론해줘"
```
