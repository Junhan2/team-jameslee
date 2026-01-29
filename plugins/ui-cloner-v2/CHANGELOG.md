# UI-Cloner v2 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-01-29

### Added
- **Enhanced pageSurvey script (v2.2)** in ui-extractor agent
  - Body/main direct children scanning for comprehensive section detection
  - Height threshold increased to 100px for major sections only
  - Viewport width ratio check (≥50%) for main content areas
  - Section name inference from aria-label, data-section, id, class, headings
  - Automatic sorting by top position
- **Full page clone enforcement rules** in all three files
  - Mandatory inclusion of ALL detected sections
  - Prohibition of "core sections only" self-limitation
  - Section count validation (≥10 when original has 10+)
- **Font application priority order (v2.2)**
  - Priority 1: Google Fonts/CDN links from headResource → direct `<head>` inclusion
  - Priority 2: @font-face declarations from Script H → woff2 download
  - Priority 3: computed fontFamily → fallback only
- Section count verification table in skills/ui-clone.md

### Changed
- pageSurveyFn now returns `_v2_2_enhanced: true` flag
- Increased image collection limit from 10 to 20 per section
- Added `sectionName` field to pageSurvey results

### Fixed
- Issue where only 5 sections were detected when original had 10+ sections
- Issue where fonts were incorrectly applied (Space Grotesk instead of Inter)
- Issue where "Best for", "Building Blocks", "Comparison", "Case Study" sections were omitted

## [2.1.0] - 2026-01-28

### Added
- **MANDATORY EXECUTION PROTOCOL v2.1** in ui-extractor agent
  - Sequential execution rules for all 10 scripts
  - Self-verification output format ("✓ Script X: [summary]")
  - Phase transition conditions table
- Bug consequence documentation for skipped scripts
  - Script J skip → images rendered at arbitrary 200px
  - Script I skip → group-hover effects missing
  - Script G skip → fonts fallback to system defaults
  - Script H skip → @keyframes animations not working

### Changed
- Strengthened Phase 2 completion checkpoint in skills/ui-clone.md
  - Added mandatory execution summary output format
  - Added self-verification questions
  - Added bug consequence column to script table
- Enhanced agent delegation instructions in commands/clone-ui-v2.md
  - Added "핵심 규칙" section with 3 key rules
  - Added "Phase 전환 조건" table
  - Added "절대 금지 사항" section

### Fixed
- Issue where Claude would skip Script J/I causing image sizing bugs
- Issue where group-hover effects were missing from generated CSS
- Issue where fonts were not properly loaded from CDN

## [2.0.0] - 2026-01-27

### Added
- Chrome DevTools Protocol integration (replacing selenium-based v1)
- 13 extraction scripts (A, B, B2, C, E, F, G, H, I, J, D Pattern)
  - Script A: Page Survey (pageSurveyFn)
  - Script G: Head Resource (headResourceFn)
  - Script B: Deep Measurement (deepMeasurementFn)
  - Script B2: Pseudo-Element (pseudoElementFn)
  - Script C: Authored CSS (authoredCSSFn)
  - Script E: Asset Analysis (assetAnalysisFn)
  - Script J: Image-Container Analysis (imageContainerFn)
  - Script H: Stylesheet Rules (stylesheetRulesFn)
  - Script I: Interaction States (interactionStateFn)
  - Script F: Width Chain (widthChainFn)
  - Script D: Pattern Recognition (patternRecognitionFn)
- Dual-page pixel-perfect verification workflow
- 5-phase pipeline (Survey → Measure → Analyze → Generate → Verify)
- 40+ CSS property extraction with category-based organization
- Authored vs Computed CSS decision matrix
- Group-hover (ancestor:hover) pattern detection
- Image-container relationship analysis with sizing strategies
- @keyframes and @font-face extraction
- Video/Audio/Iframe/Picture element support

### Changed
- Complete rewrite from v1 (selenium-based) to v2 (CDP-based)
- Output structure reorganized with assets/fonts/ directory

### Removed
- Selenium WebDriver dependency
- Python-based extraction scripts
