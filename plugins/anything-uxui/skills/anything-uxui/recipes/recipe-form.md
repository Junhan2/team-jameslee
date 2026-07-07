---
title: Recipe — Form (before → after)
tags: recipe, react, form
---
# Recipe — Form

Encodes: `useActionState`, `form-user-validation` (`:user-invalid`), on-blur reward-early-punish-late, `form-wcag22-input` (allow-paste, autocomplete, inputmode), `form-field-sizing`.

## ❌ Before
```tsx
// validates every keystroke, blocks paste, no autocomplete/inputmode, error in a top banner
<input onChange={validateNow} onPaste={e => e.preventDefault()} />
{errors.length > 0 && <Banner>{errors}</Banner>}
```

## ✅ After
```tsx
const [state, action, pending] = useActionState(submit, initial);
<form action={action}>
  <label htmlFor="email">Email</label>
  <input id="email" name="email" type="email"
         autoComplete="email" inputMode="email" />      {/* paste allowed by default */}
  {state?.error && <p id="email-err" role="alert">{state.error}</p>}  {/* below the field */}
  <button aria-disabled={pending}>Submit</button>
</form>
```
```css
/* CSS-native validation: only after the user engages; reward success early, flag on blur */
input:user-invalid { border-color: var(--danger); }
input:user-valid   { border-color: var(--success); }
```

For async availability checks (username/email), debounce ~500ms; announce errors via `aria-describedby`, never by wrapping the field in a live region.
