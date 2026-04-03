---
title: Laws of UX — Psychology-Informed Design
impact: HIGH
tags: ux-psychology, fitts, hick, miller, gestalt, cognitive-load
---

# Laws of UX — Psychology-Informed Design

> By junhan of select.codes

23 psychology principles behind interfaces that "feel right." Violating them creates friction users can't articulate.

---

## 1. Fitts's Law — Size and Distance

### `ux-fitts-target-size` — Interactive targets minimum 32px

Larger targets are easier to click. Interactive elements must be at least 32px.

```css
/* ❌ Small click target */
.icon-button { width: 16px; height: 16px; padding: 0; }

/* ✅ Comfortable target */
.icon-button { width: 32px; height: 32px; padding: 8px; }
```

**When to apply**: All interactive elements (buttons, links, checkboxes, toggles).

---

### `ux-fitts-hit-area` — Expand hit area with pseudo-elements

Extend the clickable area beyond the visual boundary. Use invisible padding or pseudo-elements.

```css
.link { position: relative; }
.link::before {
  content: "";
  position: absolute;
  inset: -8px -12px;
}
```

**When to apply**: Visually small but clickable elements (inline links, icon buttons).

---

## 2. Hick's Law — Choices and Decision Time

### `ux-hicks-minimize-choices` — Minimize choices, progressive disclosure

Decision time increases logarithmically with the number of choices. Show only frequently used options and progressively disclose the rest.

```tsx
// ❌ All options at once
{allSettings.map(setting => <SettingRow key={setting.id} {...setting} />)}

// ✅ Progressive disclosure
{commonSettings.map(setting => <SettingRow key={setting.id} {...setting} />)}
<details>
  <summary>Advanced</summary>
  {advancedSettings.map(setting => <SettingRow key={setting.id} {...setting} />)}
</details>
```

**When to apply**: Menus, settings screens, filters, dropdowns, and other interfaces with many choices.

---

## 3. Miller's Law — Working Memory Capacity

### `ux-millers-chunking` — Chunk into groups of 5-9

Working memory holds roughly 7 (+-2) items. Break large datasets into groups to make them scannable.

```tsx
// ❌ Raw unformatted data
<span>4532015112830366</span>

// ✅ Chunked data
<span>4532 0151 1283 0366</span>
```

**When to apply**: Long numbers/strings, navigation items, form field groups.

---

## 4. Doherty Threshold — Response Time

### `ux-doherty-under-400ms` — Respond within 400ms

Interactions must respond within 400ms to feel "instant." Beyond that, users perceive delay and lose immersion.

```tsx
// ❌ No feedback during loading
async function handleClick() {
  const data = await fetchData();
  setResult(data);
}

// ✅ Immediate optimistic feedback
async function handleClick() {
  setResult(optimisticData);
  const data = await fetchData();
  setResult(data);
}
```

**When to apply**: All responses to user interactions.

---

### `ux-doherty-perceived-speed` — Optimize perceived speed

If you can't make it fast, make it **feel** fast. Use optimistic UI, skeletons, and progress indicators.

```tsx
// ❌ Blank screen during loading
if (isLoading) return null;

// ✅ Skeleton during loading
if (isLoading) return <Skeleton />;
```

**When to apply**: Network requests, heavy computations, and other operations taking more than 400ms.

---

## 5. Postel's Law — Liberal Input

### `ux-postels-flexible-input` — Accept messy input, produce clean output

Accept input liberally and normalize output strictly. Do not force users into a specific format.

```tsx
// ❌ Rigid format requirement
<input placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" />

// ✅ Accept multiple formats
function handleChange(e) {
  const parsed = parseFlexibleDate(e.target.value);
  if (parsed) onChange(parsed);
}
```

**When to apply**: Dates, phone numbers, addresses, and other inputs with multiple possible formats.

---

## 6. Progressive Disclosure

### `ux-progressive-disclosure` — Show what matters now, reveal complexity later

Do not show everything at once. Progressively reveal complexity as needed. Reduce cognitive load on the initial screen.

**When to apply**: Settings screens, multi-step forms, dashboards, advanced features.

---

## 7. Jakob's Law — Familiar Patterns

### `ux-jakobs-familiar-patterns` — Use standard UI patterns

Users spend most of their time on other sites. They expect things to work the same way. Familiar patterns beat creative navigation.

```tsx
// ❌ Non-standard navigation
<button onClick={() => navigate("/")}>⬡</button>

// ✅ Standard recognizable pattern
<Link href="/">Home</Link>
```

**When to apply**: Navigation, forms, modals, dropdowns, and other common UI patterns.

---

## 8. Aesthetic-Usability Effect

### `ux-aesthetic-usability` — Visual polish = perceived usability increase

Aesthetically pleasing designs are perceived as easier to use. Small visual details compound into trust.

```css
/* ❌ Unstyled element */
.card { border: 1px solid black; padding: 10px; }

/* ✅ Considered visual treatment */
.card {
  padding: 16px;
  background: var(--gray-2);
  border: 1px solid var(--gray-a4);
  border-radius: 12px;
  box-shadow: var(--shadow-1);
}
```

**When to apply**: All user-facing elements.

---

## 9. Gestalt — Proximity

### `ux-proximity-grouping` — Proximate elements = related elements

Elements close together are perceived as related. Use spacing to create visual groups. Tight within groups, loose between groups.

```css
/* ❌ Uniform spacing on all items */
.form label, .form input, .form .hint { margin-bottom: 16px; }

/* ✅ Tight within groups, loose between groups */
.form label { margin-bottom: 4px; }
.form input { margin-bottom: 2px; }
.form .hint { margin-bottom: 24px; }
```

**When to apply**: Form layouts, card contents, navigation groups.

---

## 10. Gestalt — Similarity

### `ux-similarity-consistency` — Similar elements look similar

Elements with the same function should look the same. Visual consistency implies functional consistency.

```css
/* ✅ Same function, same appearance */
.primary-action {
  background: var(--gray-12);
  color: var(--gray-1);
  border-radius: 8px;
}
```

**When to apply**: Repeated elements with identical functions (button groups, list items, cards).

---

## 11. Gestalt — Common Region

### `ux-common-region-boundaries` — Group related content with boundaries

Elements sharing a clear boundary are perceived as a group. Use backgrounds, borders, and cards to visualize logical groups.

```tsx
// ✅ Bounded sections
<section className={styles.group}>
  <h3>Appearance</h3>
  <Toggle label="Dark mode" />
</section>
<section className={styles.group}>
  <h3>Account</h3>
  <Input label="Email" />
</section>
```

**When to apply**: Settings pages, form sections, dashboard widgets.

---

## 12. Gestalt — Uniform Connectedness

### `ux-uniform-connectedness` — Visually connect related elements

Elements visually connected by lines, color, or frames are perceived as more strongly related.

```tsx
// ✅ Visual connection with lines
{steps.map((step, i) => (
  <div key={step.id} className={styles.step} data-active={i <= current}>
    <div className={styles.dot} />
    {i < steps.length - 1 && <div className={styles.connector} />}
    <span>{step.label}</span>
  </div>
))}
```

**When to apply**: Step indicators, timelines, flowcharts, connected form fields.

---

## 13. Von Restorff Effect — Isolation Effect

### `ux-von-restorff-emphasis` — Visually distinguish important elements

Among similar elements, the **different** one is remembered most. Give key actions visual differentiation.

```tsx
// ❌ Primary action blends in
<button className={styles.button}>Cancel</button>
<button className={styles.button}>Delete Account</button>

// ✅ Destructive action stands out
<button className={styles["button-secondary"]}>Cancel</button>
<button className={styles["button-danger"]}>Delete Account</button>
```

**When to apply**: CTA buttons, warning/danger actions, recommended plans in pricing tables.

---

## 14. Serial Position Effect

### `ux-serial-position` — Place key items first and last

Users best remember the first (Primacy) and last (Recency) items in a sequence.

```tsx
// ✅ Key items at both ends
<nav>
  <Link href="/">Home</Link>
  <Link href="/about">About</Link>
  <Link href="/settings">Settings</Link>
</nav>
```

**When to apply**: Navigation bars, tab order, list arrangement.

---

## 15. Peak-End Rule

### `ux-peak-end-finish-strong` — Finish the experience on a success state

People judge an experience by its peak moment and its ending. Invest in the completion state.

```tsx
// ❌ Abrupt ending after action
await submitForm(data);
router.push("/");

// ✅ Satisfying completion state
await submitForm(data);
setStatus("success");
// → <SuccessScreen message="You're all set." />
```

**When to apply**: Onboarding completion, payment success, form submission, task completion screens.

---

## 16. Tesler's Law — Conservation of Complexity

### `ux-teslers-complexity` — The system absorbs complexity

Every system has irreducible complexity. The question is who handles it — the system should absorb it, not the user.

```tsx
// ❌ Complexity pushed to the user
<input placeholder="Enter date as YYYY-MM-DDTHH:mm:ss.sssZ" />

// ✅ System absorbs complexity
<DatePicker onChange={(date) => setDate(date.toISOString())} />
```

**When to apply**: Date/time input, file format conversion, address input, and other complex inputs.

---

## 17. Goal-Gradient Effect

### `ux-goal-gradient-progress` — Show progress toward completion

People accelerate their behavior as they approach a goal. Show them how close they are.

```tsx
// ✅ Show progress
<ProgressBar value={step} max={totalSteps} />
<span>Step {step} of {totalSteps}</span>
```

**When to apply**: Multi-step forms, onboarding, profile completeness, gamification.

---

## 18. Zeigarnik Effect — Incomplete Task Memory

### `ux-zeigarnik-show-incomplete` — Show incomplete status

People remember incomplete tasks better than completed ones. Showing incomplete status motivates return visits.

```tsx
// ✅ Show incomplete status
{!profile.isComplete && (
  <Banner>Complete your profile — {profile.completionPercent}% done</Banner>
)}
```

**When to apply**: Profile completion, onboarding checklists, learning progress.

---

## 19. Law of Pragnanz — Simplicity

### `ux-pragnanz-simplify` — Simplify complex visuals into clear forms

People interpret complex visuals in the simplest possible form. Reduce visual noise.

```css
/* ❌ Visually noisy layout */
.card {
  border: 2px dashed red;
  background: linear-gradient(45deg, #f0f, #0ff);
  box-shadow: 5px 5px 0 black, 10px 10px 0 gray;
}

/* ✅ Clean and simple form */
.card {
  background: var(--gray-2);
  border: 1px solid var(--gray-a4);
  border-radius: 12px;
  box-shadow: var(--shadow-1);
}
```

**When to apply**: All visual layouts. Especially cards, modals, forms.

---

## 20. Pareto Principle — 80/20 Rule

### `ux-pareto-prioritize-features` — Prioritize the core 20% of features

80% of users use 20% of features. Optimize the critical path first; keep the rest accessible but not prominent.

```tsx
// ✅ Highlight core features, keep the rest accessible
{criticalFeatures.map(f => <Button key={f.id}>{f.label}</Button>)}
<MoreMenu features={secondaryFeatures} />
```

**When to apply**: Feature prioritization, dashboard layout, toolbars.

---

## 21. Cognitive Load

### `ux-cognitive-load-reduce` — Minimize extraneous cognitive load

Remove everything that does not help the user complete their task. Decoration, redundant labels, and unnecessary options all add load.

```tsx
// ❌ Excessive elements
<dialog>
  <Icon name="warning" size={64} />
  <h2>Warning!</h2>
  <p>Are you absolutely sure you want to delete?</p>
  <p>This action is permanent and cannot be undone.</p>
  <p>All associated data will be lost forever.</p>
  <button>Cancel</button>
  <button>Delete</button>
  <button>Learn More</button>
</dialog>

// ✅ Essential information only
<dialog>
  <h2>Delete this item?</h2>
  <p>This can't be undone.</p>
  <button>Cancel</button>
  <button>Delete</button>
</dialog>
```

**When to apply**: Modals, alerts, forms, error messages, and all UI requiring the user's attention.

---

## 22. Law of Common Fate

Elements moving in the same direction are perceived as related. When animating groups, move related elements in the same direction and timing.

**When to apply**: List item animations, drag and drop groups, expand/collapse transitions.

---

## 23. Law of Closure

People perceive incomplete visual forms as complete. Minimal visual cues can be sufficient for group recognition.

**When to apply**: Icon design, loading indicators, partially obscured content.
