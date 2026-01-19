# Team JamesLee - Claude Code Plugins

A curated collection of Claude Code plugins for productivity and code quality.

## 🚀 Quick Install

```bash
# Add marketplace
/plugin marketplace add Junhan2/team-jameslee

# Install all plugins
/plugin install react-best-practices-review@team-jameslee
/plugin install session-recap@team-jameslee
/plugin install prompt-template-analyzer@team-jameslee
```

## 📦 Available Plugins

### 1. React Best Practices Review

**Commands:**
| Command | Description |
|---------|-------------|
| `/react-review` | Comprehensive React/Next.js performance review |
| `/react-review-quick` | Quick review (CRITICAL & HIGH only) |
| `/react-review-pr` | Review PR and post GitHub comment |
| `/react-rules` | List all best practices rules |

**Agents:**
- `async-waterfall-hunter` - Detect sequential async requests
- `rerender-detector` - Find unnecessary rerenders
- `bundle-analyzer` - Analyze bundle size issues
- `server-performance-reviewer` - RSC & caching patterns
- `client-data-reviewer` - SWR/React Query patterns
- `react-pattern-analyzer` - Hooks & component patterns

**Features:**
- Confidence-based filtering (80%+ threshold)
- Impact levels: CRITICAL, HIGH, MEDIUM, LOW
- Vercel best practices integration

---

### 2. Session Recap

**Commands:**
| Command | Description |
|---------|-------------|
| `/log` | Record current work to `.claude/logs/YYYY-MM-DD.md` |
| `/log "title"` | Record with specific title |
| `/recap` | Show recent 3 days summary |
| `/recap 7` | Show recent 7 days summary |

**Natural Language Triggers:**
- "어디까지 했지?" / "Where did we leave off?"
- "지난 작업 알려줘" / "What did I work on?"
- "작업 상태" / "Session status"

**Log Template:**
```markdown
## {Task Name}
> 📅 {timestamp} | 🌿 `{branch}` | 🔖 `{commit}`

### 배경 (Why)
### 결과 (What)
### 효과 (Impact)
### 변경 파일
```

---

### 3. Prompt Template Analyzer

**Commands:**
| Command | Description |
|---------|-------------|
| `/analyze-prompts` | Analyze prompt history for recurring patterns |
| `/analyze-prompts --all-projects` | Analyze across all projects |
| `/suggest-templates` | View detailed template suggestions |
| `/create-template` | Generate interactive command from pattern |

**Agents:**
- `prompt-pattern-analyzer` - NLP-style pattern recognition and variable extraction

**Features:**
- Discovers frequently used prompt patterns
- **Smart scope selection**: Auto-prompts when current project has insufficient data
- Creates AskUserQuestion-based interactive templates
- 4-layer execution criteria: Plugin > Docs > Historical > Custom
- Integrates with existing plugins (react-best-practices-review, etc.)
- Context7 MCP support for official documentation lookup

**Workflow:**
```bash
/analyze-prompts              # Discover patterns (current project)
/analyze-prompts --all-projects  # Analyze all projects
/suggest-templates 1          # View suggestion for pattern #1
/create-template 1            # Generate /quick-review command
/quick-review                 # Use generated template
```

---

## 📁 Structure

```
team-jameslee/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── react-best-practices-review/
│   │   ├── agents/
│   │   ├── commands/
│   │   ├── rules/
│   │   └── skills/
│   ├── session-recap/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── templates/
│   └── prompt-template-analyzer/
│       ├── agents/
│       ├── commands/
│       ├── skills/
│       └── generated-commands/
└── README.md
```

## 📄 License

MIT License - See individual plugin directories for details.

## 👤 Author

**Junhan Lee (James Lee)**
- GitHub: [@Junhan2](https://github.com/Junhan2)
- Email: junhanlee91@gmail.com
