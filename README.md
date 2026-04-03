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

### 5. Site Mirror

Mirror websites by downloading original resources and converting CDN URLs to local paths. Achieves ~95% fidelity for offline viewing.

**Commands:**
| Command | Description |
|---------|-------------|
| `/mirror-site` | 웹사이트를 완벽하게 미러링합니다 (원본 파일 다운로드 + URL 치환 방식) |

**Agents:**
- `resource-downloader` - 웹사이트의 리소스(CSS, JS, 이미지, 폰트, 애니메이션)를 다운로드하고

---

### 6. UI Cloner V2

Clone UI with Chrome DevTools Protocol. Extracts 40+ CSS properties, authored CSS, structural patterns, and performs dual-page pixel-perfect verification.

**Commands:**
| Command | Description |
|---------|-------------|
| `/clone-ui-v2` | 레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 완벽하게 클론합니다 |

**Agents:**
- `ui-extractor` - 레퍼런스 사이트에서 UI 컴포넌트의 CSS, HTML 구조, 에셋, 관계 정보를 추출하는 에이전트입니다

---

### 7. UI Cloner V3

100% Perfect UI Clone with generalization-validated Tier system. Achieves 95%+ similarity on 80%+ of sites. CSS variables, z-index layers, Tailwind CSS auto-detection.

**Commands:**
| Command | Description |
|---------|-------------|
| `/clone-ui-v3` | 레퍼런스 사이트의 UI를 Chrome DevTools 기반으로 100% 완벽하게 클론합니다 |

**Agents:**
- `ui-extractor-v3` - 100% 완벽 클론을 목표로 하는 UI 추출 에이전트입니다

---

### 8. Project Deep Review

Deep research-based holistic project analysis. 5 specialized agents evaluate tech stack, UX/UI, performance, domain moat, and code quality against latest best practices with anti-bias impact scoring.

**Commands:**
| Command | Description |
|---------|-------------|
| `/deep-review` | 딥 리서치 기반 프로젝트 총체적 분석 — 5개 전문 에이전트가 병렬로 코드, 성능, UX, 해자, 품질을 분석합니다 |
| `/deep-review-quick` | 빠른 프로젝트 점검 — MUST 이슈만 스캔하는 경량 버전 |

**Agents:**
- `code-quality-reviewer` - 코드 품질, 테스트 전략, 유지보수성, 기술 부채를 분석하는 에이전트
- `domain-moat-reviewer` - 프로젝트의 비즈니스 로직, 도메인 해자, 서비스 품질, 고객 편의성을 분석하는 에이전트
- `performance-reviewer` - 프로젝트의 성능을 Core Web Vitals, 번들 크기, 서버/클라이언트 최적화 관점에서 분석하는 에이전트
- `tech-stack-reviewer` - 프로젝트의 기술스택, 아키텍처, 의존성을 최신 공식문서와 업계 베스트 프랙티스 기반으로 분석하는 에이전트
- `ux-design-reviewer` - 프로젝트의 UX/UI, 디자인 미학, 사용성, 접근성을 분석하는 에이전트

---

### 9. UI Cloner V4

Visual Equivalence UI Cloner. Verify-heavy architecture with section-by-section iterative cloning, 3-layer verification (visual + textual + structural), scroll-tick cross-validation, and behavior analysis.

---

### 10. UI Cloner V5

State-Aware UI Cloner. Multi-state capture, sibling role disambiguation, and interaction smoke testing to eliminate the last 5% of visual differences.

---

### 11. Anything Uxui

Comprehensive UIUX design principles — 248 rules across 21 categories for building world-class web interfaces. Covers animation, layout, color systems, accessibility, keyboard navigation, and more.

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
