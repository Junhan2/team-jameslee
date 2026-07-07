---
title: Distinctive Design — Anti-AI-Slop
impact: CRITICAL
tags: distinctiveness, anti-slop, visual-identity, typography, color, brand
---

# Distinctive Design — Anti-AI-Slop

The mission's core: AI builds the UI, so this skill must make it NOT look AI-made. "AI slop" is a measured, machine-detectable phenomenon — Krebs (2026) scored 1,590 Show HN sites against 16 deterministic patterns (22% hit 4+); a Reddit corpus of 3.2M posts ranks the same tells; Erik Kennedy names them. Every rule here removes a specific slop tell.
By junhan of select.codes.

---

## distinct-no-default-font — Never ship the default font

Inter — especially a centered-hero Inter — is the #1 typography slop tell; the LLM-favorite companions (Geist, Space Grotesk, Instrument Serif) are next. Choose deliberately: **one characterful display face + one workhorse text face, two typefaces max.** A real system-font stack is a legitimate, fast, non-slop choice. (`09-typography` teaches how to *render* a font; this rule is *which* to choose.)

```css
/* ❌ The slop default */
font-family: Inter, sans-serif;
/* ✅ Intentional pairing — or an honest system stack */
--font-display: "Söhne", "GT America", system-ui;
--font-text: ui-sans-serif, system-ui;
```

## distinct-no-slop-palette — No purple-blue gradient; derive from one brand hue

The "VibeCode Purple" blue→purple gradient accent (and gradient hero text) is the most-cited color tell. Derive the palette from **one brand hue with real chroma** (OKLCH), not a rainbow gradient. An accent is a single considered color, not a gradient.

## distinct-emoji-not-icons — Emoji are not an icon set

Emoji as UI icons (⚡🚀✨ atop feature cards) reads as AI-generated instantly. Use a real icon set — inline SVG, consistent stroke width and size.

## distinct-break-scaffold — Break the generic hero scaffold

The "badge above H1 → centered generic-sans hero → three identical icon-topped feature cards → numbered 1-2-3 steps → stat banner" is the *structural* signature of slop. Vary it: asymmetric layout, real editorial hierarchy, content-specific sections. Not every page is three cards.

## distinct-radius-is-brand — Border radius is a brand decision, not 8px everywhere

Uniform 8px rounded corners on everything is a tell. Radius is identity: sharp (0), soft (4–8), or pill — choose per brand and apply the concentric formula (`08 visual-concentric-radius`); don't default.

## distinct-saturate-neutrals — Give neutrals a hue; never flat gray

Pure gray (`oklch(L 0 0)`) reads as untuned default. Bias neutrals warm OR cool (small chroma toward the brand hue) — never both. This single move separates a considered palette from slop.

## distinct-depth-one-technique — Don't mix depth techniques

Pick ONE elevation language — shadows, borders, or surface-tone — and stay consistent. Shadow + border + tinted surface on the same card reads as unresolved. In dark mode, prefer surface-tone elevation over shadows (`18 color-surface-hierarchy`).

## distinct-no-glass-chrome — Glassmorphism only for transient overlays

Translucent "liquid glass" surfaces fail contrast, appear in BOTH slop studies, and NN/g (2025-10) recommends against them. Use backdrop blur ONLY as a scrim on transient overlays over your own content — never on text-bearing chrome (nav, cards, sidebars).

## distinct-density-and-measure — Density and measure signal craft (Hobday)

Small deltas that separate considered from slop: body text **≥16px**; line length **~70ch**; button horizontal padding ≈ **2× vertical**; letter-spacing and line-height scale **inversely** with size (tight leading on display, generous on body); favor real information density over airy 3-card emptiness (a human differentiator per Kennedy).

---

## The 2026 slop checklist (flag on sight)

Inter centered hero · blue-purple gradient accent · gradient hero text · emoji-as-icons · badge+hero+3-cards scaffold · uniform 8px radius · flat gray neutrals · glassmorphism · unprompted neon glow · bento-grid-as-default · numbered 1-2-3 steps · identical feature cards. Each is a distinctiveness finding.
