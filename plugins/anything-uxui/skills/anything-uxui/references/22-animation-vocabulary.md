---
title: Animation Vocabulary (Reference Appendix)
impact: REFERENCE
tags: vocabulary, glossary, animation, naming, reference, appendix
---

# Animation Vocabulary — Reverse-Lookup Glossary

> **This is a reference appendix, not an actionable-rules category** — it does not add to the
> skill's rule count. Use it to turn a *vague description* of a motion effect into its precise
> term, then jump to the rule category that governs building it.

---

## When to reach for this

- The user asks **"what's it called when…"** and describes an effect without naming it.
- Someone describes what they *see* or *feel* ("springy", "slides off", "draws itself in") but
  can't name it — and without the name, they can't find the rule that governs it.
- You need the exact word to prompt a designer or an AI, or to search this skill's other categories.

This is a **naming tool** ("what is this called?"), distinct from the build/review rules in
`01`–`21` ("what should I build / is this right?").

## How to use

1. **Read for the sensation, not keywords.** Map what the user sees or feels to a term below.
2. **Lead with the term**, then 1–2 alternates if several fit, noting how they differ.
3. **Disambiguate close pairs** (Clip-path vs Mask, Pop in vs Bounce, Shared-element vs Layout animation).
4. Once named, **follow the group's rule pointer** to build it correctly.

Reply like this:

> **Stagger** — several items animate one after another, rippling in sequence.
> → Build it per `02-animation-timing` (`timing-stagger-adaptive`).

---

## Glossary

Each group lists the rule categories that govern building those effects. Scan the **What you see**
column to match an effect to its name.

### Entrances & Exits — how elements appear and disappear
*Rules: `02` (easing, duration) · `05` (`@starting-style`, clip-path) · `07` (exits)*

| Term | What you see |
|------|--------------|
| **Fade in / out** | Appears or disappears by changing opacity alone |
| **Slide in** | Enters by sliding from off-screen — left, right, top, or bottom |
| **Scale in** | Grows from small to full size while appearing, usually paired with a fade |
| **Pop in** | Appears with a tiny overshoot, bouncing into place |
| **Reveal** | Uncovered gradually, usually by animating a clip-path or mask |
| **Enter / Exit** | The animation an element plays when it's added to or removed from the DOM |

### Sequencing & Timing — coordinating multiple elements or moments
*Rules: `02` (duration tiers, stagger budgets, 300ms cap)*

| Term | What you see |
|------|--------------|
| **Keyframes** | Fixed points (0%, 50%, 100%) the browser fills the gaps between |
| **Interpolation / Tween** | The in-between frames generated from a start value to an end value |
| **Stagger** | Several items animate one after another with a small delay — a cascade |
| **Orchestration** | Timing multiple animations so they read as one coordinated motion |
| **Delay** | How long before an animation starts |
| **Duration** | How long an animation runs |
| **Fill mode** | Whether an element holds its first/last frame's styles before or after running (e.g. `forwards`) |
| **Stepped animation** | Motion split into discrete jumps, like a ticking countdown |

### Movement & Transforms — changing an element's position, size, or angle
*Rules: `05` (transform, 3D, transform-origin) · `12` (GPU-only props)*

| Term | What you see |
|------|--------------|
| **Translate** | Move along the X or Y axis |
| **Scale** | Grow or shrink |
| **Rotate** | Spin around a point |
| **Skew** | Slant along an axis, shearing the shape |
| **3D tilt / Flip** | Rotate in 3D (`rotateX`/`rotateY`) to add depth |
| **Perspective** | How strong the 3D looks — a lower value exaggerates depth |
| **Transform origin** | The anchor point a scale or rotation grows or spins from |
| **Origin-aware animation** | Grows out of its trigger (a popover from its button) instead of its own center, the CSS default |

### Transitions Between States — connecting one state, view, or element to another
*Rules: `05` (View Transitions, clip-path) · `07` (exits) · `16` (layout)*

| Term | What you see |
|------|--------------|
| **Crossfade** | One element fades out as another fades in, in the same spot |
| **Continuity transition** | A change that stays oriented by visually linking before and after |
| **Morph** | One shape smoothly becomes another, like the Dynamic Island |
| **Shared element transition** | An element travels and reshapes from one spot to another (thumbnail → card) |
| **Layout animation** | An element animates to its new size or position instead of snapping |
| **Accordion / Collapse** | A section smoothly expands and collapses its height to show or hide content |
| **Direction-aware transition** | Content slides one way going forward, the opposite way going back |

### Scroll — motion tied to scrolling or navigating between views
*Rules: `05` (scroll-driven, View Transitions) · `13` (perceived page transitions)*

| Term | What you see |
|------|--------------|
| **Scroll reveal** | Elements fade or slide in as they enter the viewport |
| **Scroll-driven animation** | Progress tied directly to scroll position |
| **Parallax** | Foreground and background move at different speeds, creating depth |
| **Page transition** | An animation when navigating between pages or routes |
| **View transition** | The browser morphs between two states or pages, linking shared elements |

### Feedback & Interaction — responding to the user's actions
*Rules: `04` (press feedback `scale(0.97)`) · `06` (drag, momentum, damping)*

| Term | What you see |
|------|--------------|
| **Hover effect** | Visual change when the cursor is over an element |
| **Press / Tap feedback** | A subtle scale-down on click, so it feels physical |
| **Hold to confirm** | A progress fill while the user holds a button down |
| **Drag** | Moving an element by grabbing it, often with momentum on release |
| **Drag to reorder** | Dragging list items to rearrange while the others shift aside |
| **Swipe to dismiss** | Dragging an element off-screen to close it — a drawer or toast |
| **Rubber-banding** | Resistance and snap-back when you drag past an edge (the iOS pull-past bounce) |
| **Shake / Wiggle** | A quick side-to-side jitter signalling an error or rejected input |
| **Ripple** | A circle expanding from the tap point, confirming the press |

### Easing — how speed changes over an animation
*Rules: `02` (easing decision tree, custom curves, no-ease-in)*

| Term | What you see |
|------|--------------|
| **Easing** | How an animation's speed changes across its run |
| **Ease-out** | Fast start, slow finish — the default for UI and anything reacting to the user |
| **Ease-in** | Slow start, fast finish — usually avoided; feels sluggish |
| **Ease-in-out** | Slow, fast, slow — good for on-screen elements moving from A to B |
| **Linear** | Constant speed — avoid for UI; reserve for spinners and marquees |
| **Cubic-bezier** | A custom easing curve you define for precise control |
| **Asymmetric easing** | A curve that speeds up and slows at different rates; feels more alive than a symmetric one |

### Spring Animations — physics-based motion instead of fixed-duration easing
*Rules: `03` (spring config, mouse tracking, interruptibility)*

| Term | What you see |
|------|--------------|
| **Spring** | Motion driven by physics (tension, mass, damping) rather than a fixed duration |
| **Stiffness / Tension** | How hard the spring pulls toward its target — higher feels snappier |
| **Damping** | How fast it settles — lower means more bounce and wobble |
| **Mass** | How heavy it feels — more mass moves slower |
| **Bounce** | Overshoot-and-settle, adding playfulness |
| **Perceptual duration** | How long a spring feels finished, even as it micro-settles underneath |
| **Momentum** | Velocity carried into motion, especially after a drag or interruption |
| **Velocity** | How fast and which way something moves; a spring carries it when interrupted |
| **Interruptible animation** | One that can be redirected mid-flight instead of finishing first |

### Looping & Ambient Motion — animations that run on their own
*Rules: `02` (linear for continuous motion) · `05`*

| Term | What you see |
|------|--------------|
| **Marquee** | Content scrolling continuously in a loop |
| **Loop** | An animation that repeats, a set number of times or forever |
| **Alternate (yoyo)** | A loop that reverses each pass instead of jumping back to the start |
| **Orbit** | One element circling another on a continuous path |
| **Pulse** | A gentle repeating scale or opacity change to draw attention |
| **Float** | A slow, continuous up-and-down drift that makes a static element feel alive |
| **Idle animation** | Subtle motion while an element waits to be used |

### Polish & Effects — the small touches that separate good from great
*Rules: `05` (clip-path, blur masking) · `09` (tabular-nums) · `12` (blur limit)*

| Term | What you see |
|------|--------------|
| **Blur** | A blur filter that softens an element or hides small imperfections |
| **Clip-path** | Clipping to a shape — used for reveals, masks, before/after sliders |
| **Mask** | Reveal or hide parts of an element with a shape or gradient — soft, fadeable edges (vs clip-path's hard edge) |
| **Before / after slider** | A draggable divider that wipes between two stacked images to compare them |
| **Line drawing** | An SVG path that draws itself in, like an invisible pen tracing it |
| **Text morph** | Text that animates character by character when its value changes |
| **Skeleton / Shimmer** | A placeholder with a moving sheen, shown while content loads |
| **Number ticker** | Digits rolling or counting up to a value |
| **Tabular numbers** | Fixed-width digits so numbers don't shift around as they change |
| **Typewriter** | Text appearing one character at a time, as if being typed |

### Performance — what keeps motion smooth instead of stuttering
*Rules: `12` (GPU-only props, CSS-vs-JS, WAAPI)*

| Term | What you see |
|------|--------------|
| **Frame rate (FPS)** | Frames drawn per second — 60fps is the smooth baseline, 120 on newer displays |
| **Jank** | Visible stutter when the browser drops frames |
| **Dropped frame** | A frame the browser missed its deadline to draw — a tiny hitch |
| **Compositing** | The GPU moving or fading an element on its own layer, skipping layout and paint |
| **will-change** | A hint that an element is about to animate, so the browser promotes it to its own layer early |
| **Layout thrashing** | Animating width/height/top/left, forcing the browser to recalculate layout every frame |

### Principles to Know — concepts that guide when and how to animate
*Rules: `01` (philosophy) · `02` (frequency) · `11` (laws of UX) · `14` (reduced motion)*

| Term | What you see |
|------|--------------|
| **Purposeful animation** | Motion serves a function — orient, give feedback, show a relationship — not just decorate |
| **Anticipation** | A small wind-up the opposite way before a move, hinting at what's coming |
| **Follow-through** | Parts keep moving and settle just after the main motion stops, adding weight |
| **Squash & stretch** | Deforming as it moves to convey weight, speed, and flex |
| **Perceived performance** | The right motion makes an interface feel faster than it actually is |
| **Frequency of use** | The more often a user sees an animation, the shorter and subtler it should be |
| **Spatial consistency** | Animating so an element keeps its identity and place across states |
| **Hardware acceleration** | Animating transform and opacity so the GPU keeps motion smooth |
| **Reduced motion** | Honoring `prefers-reduced-motion` by toning down or removing motion |
