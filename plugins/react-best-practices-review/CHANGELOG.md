# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-19

### Added
- Initial release
- 6 specialized review agents:
  - `async-waterfall-hunter` - CRITICAL async waterfall detection
  - `bundle-analyzer` - CRITICAL-HIGH bundle size analysis
  - `server-performance-reviewer` - HIGH server performance review
  - `client-data-reviewer` - MEDIUM-HIGH client data fetching review
  - `rerender-detector` - MEDIUM unnecessary rerender detection
  - `react-pattern-analyzer` - MEDIUM-LOW React pattern analysis
- 4 commands:
  - `/react-review` - Comprehensive review (confidence >= 80)
  - `/react-review-quick` - Quick review (CRITICAL/HIGH only, confidence >= 90)
  - `/react-review-pr` - PR review with GitHub comment automation
  - `/react-rules` - List all rules
- 18 best practices rules across 6 categories
- Confidence-based filtering system
- Project-specific customization via `.claude/react-review.local.md`
- Report generation (Markdown, GitHub PR comment)
