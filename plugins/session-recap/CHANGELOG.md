# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-19

### Added
- `/log` command for recording work sessions with structured templates
- `/recap` command for quick session status summaries
- Natural language skill triggers (Korean & English)
- Customizable log template in `templates/task-log.md`
- Git integration for automatic branch/commit info collection
- Project-specific log storage in `.claude/logs/`

### Template Format
- **배경 (Why)**: Context and reasoning
- **결과 (What)**: Completed and pending items
- **효과 (Impact)**: Expected or measured improvements
- **변경 파일**: Git diff summary
