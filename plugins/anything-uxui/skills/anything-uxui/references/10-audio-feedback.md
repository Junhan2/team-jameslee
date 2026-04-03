---
title: Audio Feedback & Sound Synthesis
impact: MEDIUM
tags: audio, web-audio-api, sound-design, feedback
---

# Audio Feedback & Sound Synthesis

> By junhan of select.codes

Accessibility, appropriateness, implementation, weight matching, AudioContext management, envelope design, sound design, and parameter guide for UI sounds.

---

## Accessibility

### `audio-visual-equivalent` — Every sound must have a visual equivalent

Sound **supplements** visual feedback, not **replaces** it. Users with hearing impairments must receive the same information.

```tsx
// ❌ Sound only, no visual feedback
function SubmitButton({ onClick }) {
  const handleClick = () => {
    playSound("success");
    onClick();
  };
}

// ✅ Sound + visual feedback together
function SubmitButton({ onClick }) {
  const [status, setStatus] = useState("idle");
  const handleClick = () => {
    playSound("success");
    setStatus("success");
    onClick();
  };
  return <button data-status={status}>Submit</button>;
}
```

**When to apply**: All interactions that use sound.

---

### `audio-toggle-setting` — Provide a sound toggle

Provide an explicit toggle in settings to disable sound.

```tsx
// ✅ Toggle available
function App() {
  const { soundEnabled } = usePreferences();
  return (
    <SoundProvider enabled={soundEnabled}>
      {children}
    </SoundProvider>
  );
}
```

**When to apply**: Applications that include sound feedback.

---

### `audio-reduced-motion-check` — Respect prefers-reduced-motion

Respect `prefers-reduced-motion` as a proxy for sound sensitivity. Disable sounds when reduced motion is set.

```tsx
// ✅ Check system setting
function playSound(name: string) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;
  audio.play();
}
```

**When to apply**: All sound playback functions.

---

### `audio-volume-control` — Independent volume control

Users must be able to control app sound volume independently from system volume.

```tsx
// ✅ User-controlled volume
function playSound() {
  const { volume } = usePreferences();
  audio.volume = volume;
  audio.play();
}
```

**When to apply**: Applications that include sound feedback.

---

## Appropriateness

### `audio-no-high-frequency` — No sound on high-frequency interactions

Do not add sound to high-frequency interactions like typing, keyboard navigation, or scrolling. Repetitive sounds cause user fatigue.

**When to apply**: Interactions that occur more than once per second.

---

### `audio-confirmations-only` — Sound only for confirmations

Sound is appropriate for important confirmation actions such as payment completion, file upload success, and form submission.

```tsx
// ✅ Sound on important confirmation
async function handlePayment() {
  await processPayment();
  playSound("success");
  showConfirmation();
}
```

**When to apply**: Completion actions where the result must be clearly communicated to the user.

---

### `audio-errors-warnings` — Sound on errors/warnings

Sound is appropriate for unmissable errors and warnings. Important alerts that users might miss with visual feedback alone.

```tsx
// ✅ Sound on error
function handleError(error: Error) {
  playSound("error");
  showErrorToast(error.message);
}
```

**When to apply**: Error/warning situations that require the user's attention.

---

### `audio-no-decorative` — No decorative sounds

Do not add sound to decorative moments with no informational value. Hover sounds, page transition effects, etc. are prohibited.

**When to apply**: For every sound usage, ask "Does this convey information?"

---

### `audio-no-punishing` — Inform, don't punish

Sound should inform the user, not punish them. Do not play harsh sounds on mistakes.

```tsx
// ❌ Harsh buzzer — punishes the user
playSound("loud-buzzer");

// ✅ Gentle alert — conveys information
playSound("gentle-alert");
```

**When to apply**: When designing error/failure sounds.

---

## Implementation

### `audio-preload` — Preload audio files

Preload audio files to avoid playback delay. Loading on demand introduces network latency.

```tsx
// ❌ Load on demand — playback delay
function playSound(name: string) {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.play();
}

// ✅ Preload
const sounds = {
  success: new Audio("/sounds/success.mp3"),
  error: new Audio("/sounds/error.mp3"),
};
Object.values(sounds).forEach(audio => audio.load());

function playSound(name: keyof typeof sounds) {
  sounds[name].currentTime = 0;
  sounds[name].play();
}
```

**When to apply**: All audio file usage.

---

### `audio-default-subtle` — Default volume at 0.3

Default volume should be subtle. 1.0 startles users.

```tsx
// ❌ Too loud
const DEFAULT_VOLUME = 1.0;

// ✅ Subtle
const DEFAULT_VOLUME = 0.3;
```

**When to apply**: When setting volume defaults.

---

### `audio-reset-currenttime` — Reset currentTime before playback

Reset `currentTime` to 0 before playback for fast re-triggering. Allows immediate restart even when the previous playback hasn't finished.

```tsx
// ✅ Reset then play
function playSound() {
  audio.currentTime = 0;
  audio.play();
}
```

**When to apply**: Sounds that may be rapidly re-triggered.

---

## Weight Matching

### `audio-weight-match` — Sound weight = action importance

Sound weight must match the importance of the action. Don't play a fanfare for a toggle.

```tsx
// ❌ Fanfare for a toggle
function handleToggle() {
  playSound("triumphant-fanfare");
}

// ✅ Weight-matched
function handleToggle() {
  playSound("soft-click");      // minor action → light sound
}
function handlePurchase() {
  playSound("success-chime");   // important action → rich sound
}
```

**When to apply**: All sound feedback design.

---

### `audio-duration-match` — Sound duration = action duration

Sound duration must match the duration of the action.

```tsx
// ❌ Long sound for an instant action
function handleClick() {
  playSound("long-whoosh"); // 2000ms
}

// ✅ Duration-matched
function handleClick() {
  playSound("click"); // 50ms — instant action
}
function handleUpload() {
  playSound("upload-progress"); // matched to upload duration
}
```

**When to apply**: All sound feedback design.

---

## AudioContext Management

### `audio-context-singleton` — Reuse a single AudioContext

Do not create a new AudioContext for every sound. Reuse one. Browsers limit the number of AudioContexts that can exist simultaneously.

```ts
// ❌ New context per call
function playSound() {
  const ctx = new AudioContext();
}

// ✅ Singleton
let audioContext: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}
```

**When to apply**: Always when using the Web Audio API.

---

### `audio-context-resume` — Resume suspended AudioContext

Browsers start AudioContext in a suspended state when created without user interaction. Resume before playback is required.

```ts
// ✅ Resume if suspended
function playSound() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}
```

**When to apply**: All AudioContext-based sound playback.

---

### `audio-context-cleanup` — Clean up audio nodes after playback

Disconnect audio nodes after playback completes to prevent memory leaks.

```ts
// ✅ Clean up on end
source.start();
source.onended = () => {
  source.disconnect();
  gain.disconnect();
};
```

**When to apply**: All dynamically created audio nodes.

---

## Envelope Design

### `audio-envelope-exponential` — Natural decay uses exponential ramp

Use `exponentialRampToValueAtTime` instead of `linearRampToValueAtTime` for natural-sounding decay.

```ts
// ❌ Linear ramp — unnatural decay
gain.gain.linearRampToValueAtTime(0, t + 0.05);

// ✅ Exponential ramp — natural decay
gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
```

**When to apply**: All gain/frequency decay.

---

### `audio-envelope-no-zero` — No zero target for exponential ramp

`exponentialRampToValueAtTime` cannot mathematically target 0. Use a very small value like 0.001.

```ts
// ❌ Zero target — causes error
gain.gain.exponentialRampToValueAtTime(0, t + 0.05);

// ✅ Near-zero value
gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
```

**When to apply**: All exponential ramp usage.

---

### `audio-envelope-initial-value` — Set initial value before ramp

Set the initial value with `setValueAtTime` before ramping to prevent glitches.

```ts
// ❌ No initial value — may glitch
gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

// ✅ Initial value set
gain.gain.setValueAtTime(0.3, t);
gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
```

**When to apply**: All AudioParam ramp usage.

---

## Sound Design

### `audio-design-noise-percussion` — Use filtered noise for percussive sounds

Use filtered noise instead of oscillators for clicks/taps. Noise bursts produce a more natural percussive feel.

```ts
// ❌ Oscillator for click — mechanical beep
const osc = ctx.createOscillator();
osc.type = "sine";

// ✅ Noise burst — natural percussion
const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < data.length; i++) {
  data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
}
```

**When to apply**: Click, tap, and other non-tonal percussive feedback.

---

### `audio-design-oscillator-tonal` — Use oscillator + pitch sweep for tonal sounds

Use an oscillator with pitch variation for tonal sounds like pops and confirmation tones.

```ts
// ❌ Static frequency — lifeless
osc.frequency.value = 400;

// ✅ Pitch sweep — lively
osc.frequency.setValueAtTime(400, t);
osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);
```

**When to apply**: Confirmation tones, alerts, and other feedback requiring pitch.

---

### `audio-design-filter-character` — Shape character with bandpass filter

Apply a bandpass filter to percussive sounds for character. Raw noise played directly sounds harsh.

```ts
// ❌ Raw noise as-is
source.connect(gain).connect(ctx.destination);

// ✅ Filtered noise — characterized sound
const filter = ctx.createBiquadFilter();
filter.type = "bandpass";
filter.frequency.value = 4000;
filter.Q.value = 3;
source.connect(filter).connect(gain).connect(ctx.destination);
```

**When to apply**: Noise-based percussive sound design.

---

## Parameter Guide

### `audio-param-click-duration` — Click sound: 5-15ms

Click/tap sounds should be 5-15ms in duration. Too long feels heavy; too short is imperceptible.

```ts
// ❌ Too long (100ms)
const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);

// ✅ Appropriate length (8ms)
const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
```

**When to apply**: When creating click/tap sounds.

---

### `audio-param-filter-freq` — Click filter: 3000-6000Hz

The bandpass filter for clicks should be in the 3000-6000Hz range. Too low sounds muffled; too high sounds sharp.

```ts
// ❌ Too low — muffled sound
filter.frequency.value = 500;

// ✅ Clear range
filter.frequency.value = 4000;
```

**When to apply**: When setting bandpass filter for click sounds.

---

### `audio-param-gain-limit` — Gain at 1.0 or below

Gain values must not exceed 1.0 to prevent clipping.

```ts
// ❌ Clipping — distortion
gain.gain.setValueAtTime(1.5, t);

// ✅ Safe gain
gain.gain.setValueAtTime(0.3, t);
```

**When to apply**: All gain settings.

---

### `audio-param-q-range` — Filter Q: 2-5

A filter Q of 2-5 is appropriate for clicks. Focused but not harsh.

```ts
// ❌ Too resonant (Q: 15)
filter.Q.value = 15;

// ✅ Balanced Q
filter.Q.value = 3;
```

**When to apply**: When setting bandpass filter Q.

---

## Sound Tuning Guide

| User Feedback | Parameter Adjustment |
|---------------|---------------------|
| "Too harsh" | Lower filter frequency, reduce Q |
| "Too muffled" | Raise filter frequency |
| "Too long" | Shorten duration, speed up decay |
| "Cuts off abruptly" | Use exponential decay |
| "More mechanical" | Raise Q, speed up decay |
| "Softer" | Lower gain, use triangle wave |
