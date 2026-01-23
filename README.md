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
/plugin install ui-cloner@team-jameslee
```

## 📦 Available Plugins

<!-- PLUGINS_START -->
<!-- AUTO-GENERATED: DO NOT EDIT MANUALLY -->

### 1. React Best Practices Review

React/Next.js performance review with confidence-based filtering. Detects async waterfalls, rerenders, bundle issues.

**Commands:**
| Command | Description |
|---------|-------------|
| `/react-review` | Comprehensive React best practices review with confidence-based filtering |
| `/react-review-pr` | Review PR and post results as GitHub comment |
| `/react-review-quick` | Quick React review focusing on CRITICAL and HIGH impact issues only |
| `/react-rules` | List all React best practices rules |

**Agents:**
- `async-waterfall-hunter` - reviewing React/Next
- `bundle-analyzer` - analyze bundle size issues in React/Next
- `client-data-reviewer` - review client-side data fetching patterns in React applications
- `react-pattern-analyzer` - analyze React patterns, hooks usage, and component structure
- `rerender-detector` - detect unnecessary rerenders in React applications
- `server-performance-reviewer` - review server-side performance in React/Next

---

### 2. Session Recap

Track work sessions with structured logs (/log) and get quick recaps (/recap). Supports Korean & English.

**Commands:**
| Command | Description |
|---------|-------------|
| `/log` | 현재 작업 세션의 로그를 .claude/logs/YYYY-MM-DD.md 파일에 기록합니다. |
| `/recap` | 최근 작업 세션의 상태를 요약하여 보여줍니다. |

---

### 3. Prompt Template Analyzer

Analyze past prompts to discover patterns and create reusable AskUserQuestion-based interactive templates.

**Commands:**
| Command | Description |
|---------|-------------|
| `/analyze-prompts` | Analyze past prompts to discover frequently used patterns for template creation |
| `/create-template` | Create an interactive command template from a discovered pattern |
| `/suggest-templates` | View detailed template suggestions based on analyzed prompt patterns |

**Agents:**
- `prompt-pattern-analyzer` - analyze prompt history and identify recurring patterns for template creation

---

### 4. UI Cloner

Clone UI components from reference websites with CSS extraction, multi-framework support (React, Vue, Next.js), and interaction capture.

**Commands:**
| Command | Description |
|---------|-------------|
| `/clone-ui` | 레퍼런스 사이트의 UI를 완벽하게 클론합니다 |

**Agents:**
- `ui-extractor` - 레퍼런스 사이트에서 UI 컴포넌트의 CSS를 추출하고 분석하는 에이전트입니다

---

<!-- PLUGINS_END -->

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
│   ├── prompt-template-analyzer/
│   │   ├── agents/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── generated-commands/
│   └── ui-cloner/
│       ├── agents/
│       ├── commands/
│       └── skills/
└── README.md
```

## 📄 License

MIT License - See individual plugin directories for details.

## 👤 Author

**Junhan Lee (James Lee)**
- GitHub: [@Junhan2](https://github.com/Junhan2)
- Email: junhanlee91@gmail.com
