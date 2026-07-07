---
title: Recipe — Modal / Dialog (before → after)
tags: recipe, react, dialog, modal
---
# Recipe — Modal / Dialog

Encodes: `dialog-use-native`, `dialog-css-exit` (allow-discrete), `component-starting-style`, `dialog-focus-return`, `dialog-inert-background`, `popover-vs-dialog`.

## ❌ Before
```tsx
// div soup: no focus trap, no ::backdrop, no Escape, custom overlay, focus lost on close
{open && <div className="overlay" onClick={close}><div className="modal">…</div></div>}
```

## ✅ After
```tsx
const ref = useRef<HTMLDialogElement>(null);
useEffect(() => { open ? ref.current?.showModal() : ref.current?.close(); }, [open]);
// native focus trap + ::backdrop + Escape + top-layer + inert + focus return — all free
<dialog ref={ref} onClose={onClose}>…</dialog>
```
```css
dialog {
  opacity: 1; transform: translateY(0);
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out),
              display 200ms allow-discrete, overlay 200ms allow-discrete;   /* animate the CLOSE too */
}
dialog:not([open]) { opacity: 0; transform: translateY(8px); }
@starting-style { dialog[open] { opacity: 0; transform: translateY(8px); } }
dialog::backdrop { background: oklch(0 0 0 / 0.4); }
```
Non-modal menu/tooltip? Use the Popover API (`popover` attribute) + CSS anchor positioning instead — no JS at all (`popover-vs-dialog`, `anchor-positioning-native`).
