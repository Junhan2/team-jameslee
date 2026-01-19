# Session Recap Plugin for Claude Code

작업 세션 관리를 위한 경량 플러그인입니다. 작업 로그 기록과 세션 요약 기능을 제공합니다.

## Features

- **`/log`**: 현재 작업 세션을 구조화된 로그로 기록
- **`/recap`**: 최근 작업 상태와 Git 정보 요약
- **Natural Language Triggers**: "어디까지 했지?", "What did I work on?" 등

## Installation

### Via Marketplace (Recommended)

```
/plugin install session-recap@session-recap
```

### Manual Installation

1. Clone this repository:
```bash
git clone https://github.com/Junhan2/session-recap.git ~/.claude/plugins/session-recap
```

2. Enable in Claude Code settings

## Usage

### `/log` - Record a Work Session

```
/log                    # Interactive mode
/log "Feature Name"     # With title
```

Creates a structured log entry in `.claude/logs/YYYY-MM-DD.md`:

```markdown
## Feature Name

> 📅 2026-01-15 14:30 | 🌿 `staging` | 🔖 `7ea1eff`

### 배경 (Why)
Why this work was needed...

### 결과 (What)
**완료:**
- Completed items

**미완료/보류:**
- Remaining items

### 효과 (Impact)
Expected or measured improvements...
```

### `/recap` - Session Summary

```
/recap      # Last 3 days
/recap 7    # Last 7 days
```

Shows:
- Current Git status (branch, commits, staged changes)
- Recent work summaries
- Next steps / pending items

### Natural Language

Just ask:
- "어디까지 했지?"
- "지난 작업 알려줘"
- "What did I work on?"
- "Where did we leave off?"

## Log Storage

Logs are stored in `.claude/logs/` directory (project-specific):

```
your-project/
└── .claude/
    └── logs/
        ├── 2026-01-15.md
        ├── 2026-01-16.md
        └── 2026-01-17.md
```

## Template Customization

Edit `templates/task-log.md` in the plugin directory to customize the log format.

## License

MIT License - see [LICENSE](LICENSE)

## Author

Lee Kang-Joon ([@Junhan2](https://github.com/Junhan2))
