---
description: |
  Use this skill when the user asks about prompt patterns, template creation, or wants to automate their common requests.

  Trigger phrases (Korean):
  - "자주 쓰는 프롬프트"
  - "프롬프트 패턴"
  - "템플릿 만들어줘"
  - "반복되는 요청"
  - "자동화하고 싶어"
  - "매번 치기 귀찮아"

  Trigger phrases (English):
  - "My common prompts"
  - "Prompt patterns"
  - "Create a template"
  - "Automate my requests"
  - "Repetitive tasks"
---

# Prompt Analysis Skill

프롬프트 분석 및 템플릿 생성에 관련된 요청을 처리합니다.

## Core Capabilities

### 1. Pattern Discovery
사용자의 과거 프롬프트에서 반복 패턴을 발견합니다.

### 2. Template Generation
발견된 패턴을 AskUserQuestion 기반 인터랙티브 템플릿으로 변환합니다.

### 3. Plugin Integration
기존 플러그인과 연동하여 검증된 수행 기준을 적용합니다.

## Available Commands

| Command | Description |
|---------|-------------|
| `/analyze-prompts` | 프롬프트 히스토리 분석 및 패턴 발견 |
| `/suggest-templates` | 패턴별 상세 템플릿 제안 보기 |
| `/create-template` | 선택한 패턴으로 커맨드 생성 |

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  1. /analyze-prompts                                         │
│     └─ 히스토리 분석 → 패턴 발견 → 결과 저장                │
├─────────────────────────────────────────────────────────────┤
│  2. /suggest-templates                                       │
│     └─ 패턴 로드 → 플러그인/문서 연동 → 상세 제안          │
├─────────────────────────────────────────────────────────────┤
│  3. /create-template                                         │
│     └─ 패턴 선택 → 수행 기준 확인 → 커맨드 파일 생성       │
├─────────────────────────────────────────────────────────────┤
│  4. /{generated-command}                                     │
│     └─ AskUserQuestion으로 정보 수집 → 작업 실행           │
└─────────────────────────────────────────────────────────────┘
```

## Data Locations

### Input: Claude History
```
~/.claude/history.jsonl                    # 전역 히스토리 인덱스
~/.claude/projects/{project}/              # 프로젝트별 세션 데이터
  ├── sessions-index.json                  # 세션 목록
  └── {sessionId}.jsonl                    # 세션 상세 (프롬프트+응답)
```

### Output: Analysis Results
```
.claude/prompt-analysis/
  ├── patterns-{date}.json                 # 분석 결과 (패턴 데이터)
  └── config.json                          # 사용자 설정

${CLAUDE_PLUGIN_ROOT}/generated-commands/  # 생성된 커맨드
  └── {command-name}.md
```

## Execution Criteria Layers

템플릿 실행 시 적용되는 수행 기준의 우선순위:

### Layer 1: Plugin Integration (최우선)
기존에 검증된 플러그인의 규칙을 활용합니다.

**예시**:
- `react-best-practices-review` → 코드 리뷰 패턴에 연동
- `session-recap` → 작업 추적 패턴에 연동

### Layer 2: Official Documentation
Context7 MCP를 통해 공식 문서의 베스트 프랙티스를 조회합니다.

**예시**:
- React 공식 문서의 hooks 규칙
- Next.js 공식 문서의 App Router 패턴

### Layer 3: Historical Patterns
과거 세션에서 Claude가 실제로 수행한 항목을 추출합니다.

**예시**:
- 코드 리뷰 시 항상 확인한 체크리스트
- 버그 수정 시 따른 단계

### Layer 4: User Custom
사용자가 직접 추가하거나 수정한 기준입니다.

## AskUserQuestion Philosophy

이 플러그인의 핵심 원칙: **타이핑 최소화**

❌ 기존 방식:
```
사용자: "성능 관점에서 src/components/ 코드 리뷰해줘"
```

✅ 템플릿 방식:
```
사용자: /quick-review
질문1: "어떤 관점에서 리뷰할까요?" → [성능] 선택
질문2: "대상을 선택해주세요" → [components/] 선택
→ 실행
```

## Best Practices

### Pattern Analysis
- 최소 7일 이상의 히스토리 권장
- 빈도 3회 이상인 패턴만 템플릿 후보로 고려
- 카테고리별 분포 확인하여 주요 작업 유형 파악

### Template Creation
- 변수는 2-4개가 적당 (너무 많으면 복잡)
- 기본값 제공으로 빠른 실행 가능하게
- 플러그인 연동으로 품질 보장

### Generated Commands
- 명확한 커맨드명 사용 (예: `/quick-review`, `/add-feature`)
- 각 질문에 `(Recommended)` 옵션 포함
- 실행 후 결과를 명확히 출력

## Troubleshooting

### "히스토리 파일을 찾을 수 없습니다"
- Claude Code를 통해 작업한 기록이 있어야 합니다
- `~/.claude/` 디렉토리 존재 여부 확인

### "패턴을 발견하지 못했습니다"
- 분석 기간 연장 시도 (`--days=90`)
- 최소 빈도 낮추기 (`--min-frequency=2`)
- 현재 프로젝트에서 충분한 작업 기록 필요

### "플러그인 연동 실패"
- 해당 플러그인이 설치되어 있는지 확인
- 플러그인 디렉토리 구조 확인

## Example Usage Scenarios

### Scenario 1: 코드 리뷰 자동화
```bash
# 1. 패턴 분석
/analyze-prompts --days=30

# 2. "코드 리뷰" 패턴 발견 (12회)
# 3. 템플릿 생성
/create-template 1 --name=quick-review

# 4. 이후 사용
/quick-review
→ 리뷰 관점 선택
→ 대상 선택
→ react-best-practices-review 연동 실행
```

### Scenario 2: 기능 추가 자동화
```bash
# 패턴: "{feature} 기능 추가해줘"가 자주 발견됨
/create-template 2 --name=add-feature

# 이후 사용
/add-feature
→ 기능명 입력
→ 구현 방식 선택 (기존 패턴 / Context7 문서 기반)
→ 실행
```

## Related Commands

- `/analyze-prompts`: 패턴 분석 시작
- `/suggest-templates`: 제안 상세 보기
- `/create-template`: 템플릿 생성
