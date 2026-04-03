---
title: Dialog, Overlay & Popover Patterns
impact: CRITICAL
tags: dialog, modal, drawer, popover, focus-trap, anchor-positioning, overlay
---

# Dialog, Overlay & Popover Patterns

by junhan of select.codes

---

## dialog-use-native: Use HTML `<dialog>` with `showModal()`

Native `<dialog>` provides built-in focus trapping, `::backdrop` styling, top-layer promotion, and Escape-to-close. No JS focus-trap library needed (~14KB saved).

```tsx
// ❌ Custom modal with manual focus trapping
import FocusTrap from 'focus-trap-react';  // +14KB

<div className="overlay" onClick={close}>
  <FocusTrap>
    <div className="modal" role="dialog" aria-modal="true">
      {children}
    </div>
  </FocusTrap>
</div>

// ✅ Native dialog — focus trapping, backdrop, Escape built-in
const ref = useRef<HTMLDialogElement>(null);

<dialog ref={ref} onClose={handleClose}>
  {children}
</dialog>

// Open as modal (with backdrop + focus trap)
ref.current?.showModal();
// Open as non-modal
ref.current?.show();
```

```css
dialog::backdrop {
  background: oklch(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}
```

**When to apply**: Every modal/dialog implementation. There is no reason to use custom focus-trapping solutions in 2026.

---

## dialog-autofocus: Focus the first interactive element

Set `autofocus` on the first interactive element inside the dialog. This is critical for keyboard and screen reader users.

```html
<!-- ❌ Focus lands on the dialog container -->
<dialog>
  <h2>Confirm deletion</h2>
  <input type="text" />
  <button>Cancel</button>
</dialog>

<!-- ✅ Focus lands on the input -->
<dialog>
  <h2>Confirm deletion</h2>
  <input type="text" autofocus />
  <button>Cancel</button>
</dialog>
```

For destructive confirmations, autofocus the safe action (Cancel), not the destructive one (Delete).

**When to apply**: Every dialog. Choose the autofocus target deliberately — first input for forms, safe action for confirmations.

---

## dialog-focus-return: Return focus to trigger on close

When a dialog closes, focus must return to the element that opened it. Without this, keyboard users lose their place in the page.

```tsx
// ❌ Focus lost after dialog closes
function openDialog() {
  dialogRef.current?.showModal();
}

// ✅ Store trigger reference, restore on close
function openDialog(e: React.MouseEvent<HTMLButtonElement>) {
  triggerRef.current = e.currentTarget;
  dialogRef.current?.showModal();
}

function handleClose() {
  dialogRef.current?.close();
  triggerRef.current?.focus();
}
```

**When to apply**: Every dialog close handler. Non-negotiable for keyboard accessibility.

---

## dialog-inert-background: Use `inert` to disable background interaction

The `inert` attribute disables all interaction (click, focus, assistive technology) on background content while a dialog is open. Replaces the old pattern of `aria-hidden` + `tabindex="-1"` on every focusable element.

```tsx
// ❌ Manual aria-hidden management
<main aria-hidden={isDialogOpen} tabIndex={isDialogOpen ? -1 : undefined}>
  {/* Must also handle every focusable child... */}
</main>

// ✅ Single attribute disables entire subtree
<main inert={isDialogOpen || undefined}>
  {pageContent}
</main>
<dialog ref={dialogRef}>{dialogContent}</dialog>
```

Note: Native `<dialog>` with `showModal()` handles inertness automatically for the rest of the document. Use explicit `inert` when building custom overlay patterns.

**When to apply**: Custom overlay implementations. For native `<dialog>` with `showModal()`, this is handled automatically.

---

## dialog-scroll-lock: Prevent background scroll

When a modal dialog is open, the page behind it should not scroll. Choose the approach based on context.

```css
/* Simple approach — toggle class on body */
body.dialog-open {
  overflow: hidden;
}

/* Better — prevent scroll chaining */
dialog {
  overscroll-behavior: contain;
}
```

```tsx
// In React — toggle on open/close
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [isOpen]);
```

**When to apply**: All modal dialogs. `overscroll-behavior: contain` on the dialog itself prevents scroll from leaking to the body. Add `overflow: hidden` on body for full lock.

---

## dialog-escape-close: Escape key closes overlays

Native `<dialog>` handles Escape automatically. For custom overlays, listen for the Escape key explicitly.

```tsx
// Native <dialog> — Escape handled automatically, just listen to onClose
<dialog onClose={handleClose}>{content}</dialog>

// Custom overlay — manual Escape handling
useEffect(() => {
  if (!isOpen) return;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation(); // Prevent parent overlays from also closing
      close();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, close]);
```

For nested overlays, use `stopPropagation()` so only the topmost overlay closes.

**When to apply**: Every overlay. Users expect Escape to dismiss. Prefer native `<dialog>` where possible.

---

## popover-api-native: Use the Popover API for non-modal overlays

The Popover API (`popover` attribute) handles tooltips, menus, and dropdowns natively. Promotes to top layer (no z-index), supports light dismiss, and requires zero JavaScript.

```html
<!-- ❌ Custom popover with z-index battles and click-outside detection -->
<div class="popover" style="z-index: 9999; position: absolute;">
  ...
</div>

<!-- ✅ Native popover — top layer, light dismiss, no JS -->
<button popovertarget="menu">Open Menu</button>
<div id="menu" popover="auto">
  <nav>
    <a href="/settings">Settings</a>
    <a href="/profile">Profile</a>
  </nav>
</div>
```

- `popover="auto"` — light dismiss (click outside closes it) + only one auto popover open at a time
- `popover="manual"` — explicit close only, multiple can coexist

**When to apply**: Tooltips, dropdown menus, action menus, notification panels — any non-modal supplementary content. Saves a click-outside detection library.

---

## popover-vs-dialog: Choose the right overlay primitive

**Dialog** = modal. Blocks all other interaction. Requires a decision from the user.
**Popover** = non-modal. Supplementary content. User can continue interacting with the page.

| Pattern | Use |
|---------|-----|
| Confirmation ("Delete this?") | `<dialog>` with `showModal()` |
| Form (edit profile, create item) | `<dialog>` with `showModal()` |
| Critical alert (data loss warning) | `<dialog>` with `showModal()` |
| Dropdown menu | `popover="auto"` |
| Tooltip / info bubble | `popover="auto"` |
| Date picker dropdown | `popover="auto"` |
| Notification panel | `popover="auto"` or `popover="manual"` |
| Non-modal info (no user decision) | `<dialog>` with `show()` (non-modal) |

**When to apply**: Every time you need an overlay. Ask: "Does this block the user?" → dialog. "Is this supplementary?" → popover.

---

## anchor-positioning-native: CSS-only positioned overlays

CSS Anchor Positioning replaces Floating UI (~8KB) for tooltip/popover positioning. Define an anchor, then position elements relative to it with pure CSS.

```css
/* ❌ JavaScript positioning library */
/* import { computePosition, flip, shift } from '@floating-ui/dom'; */

/* ✅ CSS Anchor Positioning */
.trigger { anchor-name: --trigger; }

.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: top center;
  margin: unset; /* Critical: unset default margin */
}
```

The `margin: unset` is critical — default margins on positioned elements cause offset issues.

**When to apply**: Tooltips, dropdown menus, popovers — any element positioned relative to a trigger. Check browser support and use Floating UI as fallback for older browsers if needed.

---

## anchor-position-fallback: Automatic flip when space is insufficient

Use `position-try` to define fallback positions. The browser automatically flips the element when there isn't enough space in the preferred direction.

```css
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  position-area: top center;

  /* Flip to bottom if no space on top */
  position-try: flip-block;
}

/* Custom fallback chain */
.dropdown {
  position: fixed;
  position-anchor: --trigger;
  position-area: bottom span-right;

  position-try-fallbacks:
    --try-top,     /* Try top first */
    flip-block,    /* Then opposite side */
    flip-inline;   /* Then horizontal flip */
}

@position-try --try-top {
  position-area: top span-right;
}
```

**When to apply**: Any anchored element near viewport edges. `flip-block` (vertical flip) covers most cases. Define custom `@position-try` blocks for complex fallback chains.

---

## drawer-snap-points: Multi-stage drawer with velocity-aware snapping

Drawers with multiple snap points (e.g., 40% and 80% of viewport height) provide progressive disclosure. Use drag velocity to determine behavior: fast flick skips intermediate points, slow drag snaps to nearest.

```tsx
// Snap point logic
const SNAP_POINTS = [0, 0.4, 0.8]; // closed, peek, full
const VELOCITY_THRESHOLD = 500; // px/s

function getSnapTarget(currentY: number, velocity: number, viewportHeight: number) {
  const currentFraction = 1 - currentY / viewportHeight;

  if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    // Fast flick — go to next/previous snap point
    return velocity < 0
      ? SNAP_POINTS.findLast(p => p < currentFraction) ?? 0
      : SNAP_POINTS.find(p => p > currentFraction) ?? 0.8;
  }

  // Slow drag — snap to nearest
  return SNAP_POINTS.reduce((closest, point) =>
    Math.abs(point - currentFraction) < Math.abs(closest - currentFraction) ? point : closest
  );
}
```

**When to apply**: Mobile bottom sheets, maps overlays, music player "now playing" sheets. Define snap points based on content hierarchy — what's most useful at each level.

---

## drawer-scaled-background: Depth effect with background scaling

When a drawer opens, scale the background content to `scale(0.95)` with border-radius. Creates visual depth and signals context shift (iOS Sheet pattern).

```css
/* Background scales down when drawer is open */
.app-content {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1),
              border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.app-content.drawer-open {
  transform: scale(0.95);
  border-radius: 12px;
  overflow: hidden;
}
```

The specific cubic-bezier `(0.32, 0.72, 0, 1)` matches iOS sheet timing. The border-radius on the scaled background reinforces the "pushed back" depth illusion.

**When to apply**: Full-screen or near-full-screen bottom sheets. Adds polish and spatial context. Pair with `drawer-snap-points` for the complete mobile sheet experience.

---

## drawer-responsive: Same content, different container

On mobile, use a bottom drawer. On desktop, use a centered dialog. The content inside is identical — only the container changes.

```tsx
// ❌ Two separate components with duplicated content
{isMobile ? <MobileDrawer>{content}</MobileDrawer> : <DesktopModal>{content}</DesktopModal>}

// ✅ Single adaptive container
<AdaptiveOverlay>
  {/* Same content renders in both modes */}
  <OverlayHeader title="Settings" />
  <SettingsForm />
</AdaptiveOverlay>
```

```css
/* Container adapts via media query */
.adaptive-overlay {
  /* Mobile: bottom sheet */
  position: fixed;
  inset: auto 0 0 0;
  border-radius: 12px 12px 0 0;
  max-height: 90vh;
}

@media (min-width: 768px) {
  .adaptive-overlay {
    /* Desktop: centered dialog */
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    border-radius: 12px;
    max-height: 80vh;
    max-width: 500px;
  }
}
```

**When to apply**: Any overlay that appears on both mobile and desktop. Build content once, adapt the container with CSS.
