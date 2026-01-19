# Prompt Template Analyzer

과거 프롬프트를 분석하여 자주 사용하는 패턴을 발견하고, AskUserQuestion 기반 인터랙티브 커맨드로 템플릿화하는 Claude Code 플러그인입니다.

## Features

- **패턴 발견**: 프롬프트 히스토리 분석으로 반복 패턴 자동 발견
- **타이핑 최소화**: 선택지 기반 인터랙션으로 입력 부담 감소
- **플러그인 연동**: 기존 플러그인의 검증된 수행 기준 활용
- **문서 연동**: Context7 MCP로 공식 문서 베스트 프랙티스 적용

## Installation

```bash
# Clone to your plugins directory
git clone https://github.com/Junhan2/prompt-template-analyzer.git ~/.claude/plugins/prompt-template-analyzer
```

## Quick Start

```bash
# 1. 프롬프트 패턴 분석
/analyze-prompts

# 2. 발견된 패턴 상세 보기
/suggest-templates

# 3. 선택한 패턴으로 커맨드 생성
/create-template 1

# 4. 생성된 커맨드 사용
/quick-review
```

## Commands

### `/analyze-prompts`

프롬프트 히스토리를 분석하여 반복 패턴을 발견합니다.

```bash
# 기본 설정 (최근 30일, 빈도 3회 이상, 현재 프로젝트)
/analyze-prompts

# 기간 지정
/analyze-prompts --days=7
/analyze-prompts --days=90

# 최소 빈도 지정
/analyze-prompts --min-frequency=5

# 전체 프로젝트 분석
/analyze-prompts --all-projects

# 종합 분석
/analyze-prompts --days=90 --min-frequency=2 --all-projects
```

**스마트 범위 선택**: 현재 프로젝트의 데이터가 부족하면 (20개 미만) 자동으로 분석 범위 선택 UI가 표시됩니다.

**출력 예시**:
```
╔═══════════════════════════════════════════════════════════════╗
║        Prompt Pattern Analysis Results                        ║
╚═══════════════════════════════════════════════════════════════╝

📊 Summary
 Analysis Scope:          전체 프로젝트
 Total Prompts Analyzed:  5,229
 Patterns Discovered:     23

🔥 Top Patterns (Template Candidates)

### 1. Code Review Request
📍 Frequency: 15회 (25%)
📁 Category: Code Review

**Example Prompts**:
- "성능 관점에서 src/components/ 리뷰해줘"
- "이 코드 보안 리뷰해줘"

**Suggested Command**: `/quick-review`
```

### `/suggest-templates`

발견된 패턴에 대한 상세 템플릿 제안을 봅니다.

```bash
# 전체 패턴 개요
/suggest-templates

# 특정 패턴 상세 보기
/suggest-templates 2
```

**제안 내용**:
- 인터랙티브 질문 설계
- 플러그인 연동 정보
- Context7 문서 참조
- 예상 커맨드 구조

### `/create-template`

선택한 패턴을 실제 커맨드 파일로 생성합니다.

```bash
# 패턴 #1로 템플릿 생성
/create-template 1

# 커스텀 이름 지정
/create-template 2 --name=fast-review
```

**생성 과정**:
1. 프로젝트 기술 스택 감지 (package.json)
2. 관련 플러그인 확인 (react-best-practices-review 등)
3. Context7로 공식 문서 조회
4. 수행 기준 통합 및 사용자 확인
5. `generated-commands/` 디렉토리에 파일 생성

## How It Works

### Execution Criteria Layers

생성된 템플릿은 4개 계층의 수행 기준을 통합합니다:

```
┌─────────────────────────────────────┐
│  Layer 1: Plugin Integration        │  ← 최우선
│  (react-best-practices-review 등)   │
├─────────────────────────────────────┤
│  Layer 2: Official Documentation    │
│  (Context7 MCP)                     │
├─────────────────────────────────────┤
│  Layer 3: Historical Patterns       │
│  (과거 세션에서 추출)               │
├─────────────────────────────────────┤
│  Layer 4: User Custom               │
│  (직접 추가한 기준)                 │
└─────────────────────────────────────┘
```

### Data Flow

```
~/.claude/history.jsonl
        │
        ▼
  /analyze-prompts
        │
        ▼
.claude/prompt-analysis/patterns-{date}.json
        │
        ▼
  /suggest-templates + /create-template
        │
        ▼
generated-commands/{name}.md
        │
        ▼
    /{name} (사용 가능)
```

## Example: Creating a Quick Review Command

### Step 1: Analyze Prompts

```bash
/analyze-prompts --days=30
```

발견된 패턴:
- "코드 리뷰" (15회)
- "기능 추가" (12회)
- "버그 수정" (8회)

### Step 2: View Suggestion

```bash
/suggest-templates 1
```

제안 내용:
- 인터랙티브 질문: 리뷰 관점, 대상 경로
- 플러그인 연동: `react-best-practices-review`
- 문서 참조: React/Next.js 공식 문서

### Step 3: Create Template

```bash
/create-template 1 --name=quick-review
```

생성된 파일: `generated-commands/quick-review.md`

### Step 4: Use the Command

```bash
/quick-review
```

AskUserQuestion으로 정보 수집:
1. "어떤 관점에서 리뷰할까요?" → 성능 선택
2. "대상을 선택해주세요" → src/components/ 선택

→ `react-best-practices-review` 에이전트 연동 실행

## Directory Structure

```
prompt-template-analyzer/
├── .claude-plugin/
│   └── plugin.json              # 플러그인 메타데이터
├── commands/
│   ├── analyze-prompts.md       # 패턴 분석 커맨드
│   ├── suggest-templates.md     # 제안 보기 커맨드
│   └── create-template.md       # 템플릿 생성 커맨드
├── agents/
│   └── prompt-pattern-analyzer.md  # 패턴 분석 에이전트
├── skills/
│   └── prompt-analysis/
│       └── SKILL.md             # 관련 스킬 정의
├── generated-commands/          # 생성된 템플릿 저장
└── README.md
```

## Requirements

- Claude Code CLI
- `~/.claude/history.jsonl` (자동 생성됨)
- Context7 MCP (선택사항, 문서 연동용)

## Related Plugins

이 플러그인과 함께 사용하면 좋은 플러그인:

- **react-best-practices-review**: React 코드 리뷰 자동화
- **session-recap**: 작업 세션 추적 및 요약

## License

MIT

## Author

Lee Kang-Joon (junhanlee91@gmail.com)
