---
title: Tree Shaking Optimization
impact: HIGH
impactDescription: Remove unused code from bundles
tags: [bundle, performance, tree-shaking, imports]
appliesTo: [next.js, react, vite]
relatedAgent: bundle-analyzer
---

# Tree Shaking Optimization

## Problem

Importing entire libraries or using barrel files can prevent tree shaking, including large amounts of unused code in your bundle.

## Detection Signals

- Full library imports (`import _ from 'lodash'`)
- Star imports (`import * as utils from './utils'`)
- Barrel file imports from large packages
- Bundle size larger than expected

## ❌ Bad Pattern

```tsx
// Full library import - 70KB+
import _ from 'lodash';
const value = _.get(obj, 'path.to.value');

// Star import - includes everything
import * as utils from './utils';
console.log(utils.formatDate(date));

// Barrel file import - may include unused exports
import { Button } from '@/components';  // If barrel re-exports everything

// MUI icons - can include 2MB of icons!
import * as Icons from '@mui/icons-material';
```

**Why this is problematic**:
- Bundler can't determine what's used
- Entire library/module included
- Massive bundle size increase

## ✅ Good Pattern

```tsx
// Direct import - only what's needed (~3KB)
import get from 'lodash/get';
const value = get(obj, 'path.to.value');

// Or use lodash-es (tree-shakeable)
import { get } from 'lodash-es';

// Named imports from specific files
import { formatDate } from './utils/date';

// Direct component import
import { Button } from '@/components/Button';

// Specific icon import (~2KB each)
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
```

**Why this is better**:
- Bundler knows exactly what's used
- Only needed code is included
- Dramatically smaller bundle

## Performance Impact

| Library | Full Import | Tree-shaken | Savings |
|---------|-------------|-------------|---------|
| lodash | 70KB | 3KB | -67KB (96%) |
| date-fns | 50KB | 5KB | -45KB (90%) |
| @mui/icons | 2MB | 4KB | -1.9MB (99%) |
| rxjs | 100KB | 10KB | -90KB (90%) |

## Tree Shaking Checklist

### 1. Check package.json sideEffects
```json
{
  "sideEffects": false,  // Enables tree shaking
  // Or list files with side effects
  "sideEffects": ["*.css", "*.scss"]
}
```

### 2. Use ESM Packages
```tsx
// Prefer -es suffix or esm packages
import { debounce } from 'lodash-es';  // ✅ Tree-shakeable
import { debounce } from 'lodash';     // ❌ Not tree-shakeable
```

### 3. Avoid Barrel File Anti-patterns
```tsx
// ❌ Bad: components/index.ts re-exports everything
export * from './Button';
export * from './Modal';
export * from './DataGrid';  // 100KB
export * from './Chart';     // 150KB

// ✅ Good: Direct imports or selective re-exports
// components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
// Heavy components: import directly
```

### 4. Check Import Statements
```tsx
// ❌ Prevents tree shaking
import moment from 'moment';
import * as R from 'ramda';

// ✅ Allows tree shaking
import { format } from 'date-fns';
import { map, filter } from 'ramda';
```

## Common Library Solutions

| Library | Problem | Solution |
|---------|---------|----------|
| lodash | Not tree-shakeable | Use `lodash-es` or `lodash/method` |
| moment | All locales included | Use `date-fns` or `dayjs` |
| @mui/icons | 2MB import | Direct imports: `@mui/icons-material/Add` |
| antd | Large bundle | Enable tree shaking, use babel-plugin-import |
| rxjs | Large bundle | Use `rxjs/operators` imports |

## Verifying Tree Shaking

```bash
# Analyze bundle contents
npm run build
npx source-map-explorer build/static/js/*.js

# Or use webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

## Exceptions

Do NOT apply this rule when:

1. **Using entire library**: If you genuinely use 80%+ of a library
2. **Small libraries**: < 5KB libraries aren't worth optimizing
3. **Build tool handles it**: Some modern bundlers auto-optimize

## Related Rules

- [bundle-code-splitting](./bundle-code-splitting.md) - Route-based splitting
- [bundle-dynamic-imports](./bundle-dynamic-imports.md) - Component-level splitting

## References

- [Webpack: Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Rollup: Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Full import of lodash, moment, or MUI icons |
| **90-94** | Star import from large utility module |
| **85-89** | Barrel file re-exporting heavy components |
| **80-84** | Potentially unused large imports |
| **<80** | **DO NOT REPORT** - may be intentional or small |
