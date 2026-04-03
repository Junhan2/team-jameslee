---
title: Gesture & Drag Interaction Physics
impact: HIGH
tags: gesture, drag, momentum, pointer-capture
---

# Gesture & Drag Interaction Physics

by junhan of select.codes

---

## gesture-momentum-dismiss: Momentum-based dismissal

Don't require dragging to a threshold. **Calculate velocity.** If velocity exceeds the threshold, dismiss regardless of distance. A single quick flick should be enough.

```js
// ❌ Distance-based dismissal (feels sluggish)
if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD) {
  dismiss();
}

// ✅ Velocity-based dismissal (feels natural)
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

### Key formula
- `velocity = Math.abs(dragDistance) / elapsedTime`
- **Threshold: ~0.11** (exceeding this dismisses regardless of distance)

### When to apply
- All swipe-dismissible UI: Drawer, Toast, Sheet, etc.
- Combine with distance threshold using an **OR condition** (dismiss if either is satisfied)

---

## gesture-boundary-damping: Damping at boundaries

When the user drags beyond a natural boundary (e.g., dragging a drawer upward when it is already at the top), **apply damping.** The further they drag, the less the element moves.

```js
// ❌ Hard stop at boundary
if (dragY < 0) {
  dragY = 0; // Abrupt stop
}

// ✅ Damping at boundary
if (dragY < 0) {
  dragY = dragY * 0.3; // Resistance increases progressively
}
```

### When to apply
- In the real world, things don't stop abruptly -- they **slow down first**
- Drawer top/bottom boundaries, scroll bounce, slider range overflow, etc.
- Adjust the damping coefficient (0.2-0.5) to control resistance

---

## gesture-pointer-capture: Pointer capture for drag

When a drag starts, **set the element to capture all pointer events.** This ensures the drag continues even when the pointer leaves the element boundary.

```js
// ❌ Drag breaks when pointer leaves element
element.addEventListener('pointermove', onDrag);

// ✅ Drag continues outside element
function onPointerDown(e) {
  element.setPointerCapture(e.pointerId);
  // Start drag...
}

function onPointerMove(e) {
  if (!element.hasPointerCapture(e.pointerId)) return;
  // Handle drag...
}

function onPointerUp(e) {
  element.releasePointerCapture(e.pointerId);
  // End drag...
}
```

### When to apply
- **Required for all drag interactions**
- `setPointerCapture` on drag start, `releasePointerCapture` on drag end
- Completely prevents pointer escape during fast drags

---

## gesture-multi-touch-guard: Multi-touch guard

**Ignore** additional touch points after the initial drag starts. Without this, switching fingers during a drag causes the element to jump to the new position.

```js
// ❌ Unguarded against multi-touch
function onPress(e) {
  startDrag(e);
}

// ✅ Only allow the first touch
function onPress(e) {
  if (isDragging) return;
  startDrag(e);
}
```

### When to apply
- All drag components with mobile touch interaction
- Use an `isDragging` flag to prevent duplicate drag initiation
- Essential for Drawer, Slider, and Sortable lists

---

## gesture-friction-not-wall: Friction vs hard stop

Instead of completely preventing upward drag, **allow it with increasing friction.** This feels more natural than hitting an invisible wall.

```js
// ❌ Hard stop (invisible wall)
function onDrag(y) {
  if (y < minY) return; // Abrupt stop
  setPosition(y);
}

// ✅ Friction (progressive resistance)
function onDrag(y) {
  if (y < minY) {
    const overflow = minY - y;
    const dampened = minY - overflow * Math.pow(0.5, overflow / 100);
    setPosition(dampened);
  } else {
    setPosition(y);
  }
}
```

### When to apply
- All drag interactions with boundaries
- Use together with `gesture-boundary-damping` -- damping is the principle, friction is the implementation
- Allows the user to explore boundaries while maintaining a natural feel
- Hard stops can make users think "is this a bug?"

---

## Directional Asymmetric Friction

### gesture-directional-friction — Different friction per drag direction

When dismissing downward is the intended action, apply MORE friction to upward drag and LESS to downward. Intended actions should feel easy; unintended actions should feel resistant.

```js
function applyFriction(dragDelta, direction) {
  if (direction === 'up') {
    // High friction — resist unintended upward drag
    return dragDelta * 0.3;
  }
  // Low friction — natural downward dismiss
  return dragDelta * 0.9;
}
```

## Native Platform Integration

### gesture-safari-theme-color — Dynamic theme-color during drag

On Safari, dynamically update `<meta name="theme-color">` during drawer drag to match the visible background. CSS transitions don't work on meta tags — use JS with linear interpolation across a pre-computed color array.

```js
function updateThemeColor(progress) {
  const index = Math.floor(progress * colors.length);
  const color = colors[Math.min(index, colors.length - 1)];
  document.querySelector('meta[name="theme-color"]').content = color;
}
```

### gesture-color-interpolation — Real-time color feedback during drag

Map drag progress (0–1) to a color array index for smooth color transitions during gesture. Use for background color shifts, overlay opacity, and non-CSS properties that can't use CSS transitions.
