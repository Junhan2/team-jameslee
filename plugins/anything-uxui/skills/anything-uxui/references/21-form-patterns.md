---
title: Form & Input Component Patterns
impact: HIGH
tags: forms, inputs, select, checkbox, radio, validation, accessibility
---

# Form & Input Component Patterns

by junhan of select.codes

---

## form-custom-appearance: Fully custom form controls with `appearance: none`

Use `appearance: none` to strip browser default styling from form controls. Rebuild with CSS Grid, `currentColor`, and `em` units for scalable, themeable form elements. Replaces react-select (~29KB) and similar libraries.

```css
/* ❌ Default browser styling — inconsistent across browsers */
select { /* browser default */ }
input[type="checkbox"] { /* browser default */ }

/* ✅ Custom select */
select {
  appearance: none;
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.5em 2em 0.5em 0.75em;
  font: inherit;
  color: inherit;
  cursor: pointer;

  /* Custom arrow */
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 0.75em center;
  background-size: 1em;
}
```

```css
/* ✅ Custom checkbox with CSS Grid */
input[type="checkbox"] {
  appearance: none;
  width: 1.25em;
  height: 1.25em;
  border: 2px solid var(--border-default);
  border-radius: var(--radius-sm);
  display: grid;
  place-content: center;
}

input[type="checkbox"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: transform 120ms ease-in-out;
  background: currentColor;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
}
```

Using `currentColor` and `em` units means the control automatically matches the surrounding text color and scales with font size.

**When to apply**: All custom-styled form controls. `appearance: none` is the starting point. Build up from there with CSS — no JS library needed for styling.

---

## form-user-validation: Show validation state only after interaction

`:user-valid` and `:user-invalid` pseudo-classes activate only after the user has interacted with the field. This prevents red error borders from appearing on page load for empty required fields.

```css
/* ❌ Red border on page load for empty required fields */
input:invalid {
  border-color: var(--color-error);
}
input:valid {
  border-color: var(--color-success);
}

/* ✅ Validation state only after user interacts */
input:user-invalid {
  border-color: var(--color-error);
  outline-color: var(--color-error);
}

input:user-invalid + .error-message {
  display: block;
}

input:user-valid {
  border-color: var(--color-success);
}
```

This replaces the JavaScript pattern of tracking "touched" state per field. The browser handles it natively.

**When to apply**: All form validation styling. Never use `:invalid`/`:valid` for visual feedback — always prefer `:user-invalid`/`:user-valid`.

---

## form-field-sizing: Auto-resizing inputs and textareas

`field-sizing: content` makes form elements grow and shrink with their content. No JavaScript auto-resize library needed.

```css
/* ❌ JavaScript auto-resize */
/* textarea.style.height = textarea.scrollHeight + 'px'; */

/* ✅ CSS-only auto-resize */
textarea {
  field-sizing: content;
  min-height: 3lh;  /* Minimum 3 lines */
  max-height: 10lh; /* Maximum 10 lines */
}

/* Also works on inputs */
input {
  field-sizing: content;
  min-width: 10ch;
}
```

The `lh` unit (line-height) is ideal for constraining text field dimensions relative to their line height.

**When to apply**: Textareas that should grow with content (chat inputs, comment boxes, note fields). Inputs that should size to their content (tag inputs, inline editing).

---

## form-aria-disabled: Accessible disabled state

Use `aria-disabled="true"` instead of the HTML `disabled` attribute. The `disabled` attribute removes the element from the tab order, making it invisible to keyboard users and screen readers. `aria-disabled` keeps the element focusable so assistive technology can explain why it's disabled.

```html
<!-- ❌ Invisible to keyboard navigation, can't explain why -->
<button disabled>Submit</button>

<!-- ✅ Focusable, screen reader can announce why it's disabled -->
<button aria-disabled="true" title="Complete required fields first">Submit</button>
```

```css
/* Style aria-disabled like disabled */
[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```tsx
// Prevent action in handler, not in HTML
function handleSubmit() {
  if (!isValid) return; // Guard in logic
  submit();
}
```

**When to apply**: Buttons and controls that are conditionally unavailable. Use `disabled` only when the element truly should not exist in the accessibility tree (rare). Default to `aria-disabled` for better UX.

---

## form-placeholder-contrast: Placeholder text must be readable

`::placeholder` text must have a minimum 4.5:1 contrast ratio against the input background (WCAG AA). Never use placeholder as a label replacement — placeholders disappear on input and are not reliably announced by screen readers.

```css
/* ❌ Low contrast placeholder used as label */
input::placeholder {
  color: #ccc; /* ~1.6:1 contrast on white — fails WCAG */
}

/* ✅ Sufficient contrast, used as hint only */
input::placeholder {
  color: var(--text-tertiary); /* Ensure ≥4.5:1 contrast */
  opacity: 1; /* Firefox reduces placeholder opacity by default */
}
```

```html
<!-- ❌ Placeholder as label -->
<input placeholder="Email address" />

<!-- ✅ Proper label + placeholder as hint -->
<label for="email">Email address</label>
<input id="email" placeholder="you@example.com" />
```

**When to apply**: Every form field with a placeholder. Always pair with a visible `<label>`. Test contrast with a tool — don't eyeball it.

---

## form-font-inherit: Form elements must inherit typography

By default, form elements (`input`, `button`, `textarea`, `select`) do not inherit `font-family`, `font-size`, or `line-height` from their parents. They use the browser's default system font at a fixed size. This creates visual inconsistency.

```css
/* ❌ Form elements with mismatched typography */
body { font-family: 'Inter', sans-serif; font-size: 1rem; }
/* Inputs render in system font at browser default size */

/* ✅ Force inheritance — single rule, apply globally */
input,
button,
textarea,
select {
  font: inherit;
}
```

The `font: inherit` shorthand sets `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, and `font-variant` in one declaration.

**When to apply**: Always. Add this to your CSS reset. There is no valid reason for form elements to use different typography than the rest of the page.
