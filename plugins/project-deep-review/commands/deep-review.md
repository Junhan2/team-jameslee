---
description: "딥 리서치 기반 프로젝트 총체적 분석 — 5개 전문 에이전트가 병렬로 코드, 성능, UX, 해자, 품질을 분석합니다"
argument-hint: "[path] [--focus=all|tech|ux|perf|moat|code] [--output=console|file|both]"
allowed-tools: ["Read", "Grep", "Glob", "Task", "Bash", "Write", "WebSearch"]
model: sonnet
---

# Project Deep Review

5개 전문 에이전트를 활용한 딥 리서치 기반 프로젝트 총체적 분석을 수행합니다.

**Arguments**: $ARGUMENTS

## Review Workflow

### 1. Parse Arguments

Parse the provided arguments:
- `path`: 프로젝트 루트 디렉토리 (default: current working directory)
- `--focus`: 분석 범위 (default: `all`)
  - `all`: 전체 5개 영역
  - `tech`: 기술스택 & 아키텍처만
  - `ux`: UX/UI & 디자인만
  - `perf`: 성능만
  - `moat`: 도메인 해자 & 서비스 품질만
  - `code`: 코드 품질만
- `--output`: 출력 형식 (default: `console`)

### 2. Project Context Detection

프로젝트 컨텍스트를 수집합니다:

1. **package.json** 분석:
   - 프레임워크 & 버전 (Next.js, React, Vue 등)
   - 주요 의존성
   - 스크립트 구성

2. **프로젝트 구조** 파악:
   - 디렉토리 구조 스캔
   - 설정 파일 목록 (tsconfig, eslint, prettier 등)
   - 테스트 설정

3. **CLAUDE.md** 확인:
   - 프로젝트별 지침이 있는지 확인
   - 도메인 정보 추출

4. **프로젝트 메타정보** 구성:
   ```
   Project Name: {name}
   Framework: {framework} {version}
   Domain: {추론된 도메인 - SaaS, 이커머스, 대시보드 등}
   Scale: {추론된 규모 - 파일 수, 코드 라인 수}
   Key Dependencies: {주요 의존성 목록}
   ```

### 3. Launch Specialized Agents

`--focus`에 따라 에이전트를 **병렬**로 실행합니다.

| Agent | Focus | Color |
|-------|-------|-------|
| `tech-stack-reviewer` | 기술스택, 아키텍처, 의존성, 인프라 | 🔵 blue |
| `ux-design-reviewer` | UX/UI, 디자인 미학, 접근성, 사용성 | 🟣 magenta |
| `performance-reviewer` | Core Web Vitals, 번들, 캐싱, 최적화 | 🔴 red |
| `domain-moat-reviewer` | 비즈니스 로직, 해자, 서비스 품질, 고객 편의 | 🟢 green |
| `code-quality-reviewer` | 코드 구조, 테스트, DX, 기술 부채 | 🔷 cyan |

**Agent Prompt Template**:
```
프로젝트를 {focus_area} 관점에서 딥 리서치 기반으로 분석해주세요.

## 프로젝트 컨텍스트
{project_context}

## 프로젝트 경로
{project_path}

## 분석 가이드
1. 먼저 프로젝트 코드를 충분히 탐색하세요
2. WebSearch로 해당 기술스택의 최신 베스트 프랙티스를 확인하세요
3. Impact Scoring (MUST/SHOULD/STRENGTH)에 따라 분류하세요
4. COULD 등급은 보고하지 마세요
5. STRENGTH를 반드시 3개 이상 포함하세요
6. 모든 제안에 근거(URL, 데이터)를 포함하세요
```

**`--focus` 값에 따라**:
- `all`: 5개 에이전트 모두 실행
- 개별 값: 해당 에이전트만 실행

모든 에이전트를 **백그라운드**로 실행하고, 완료를 기다립니다.

### 4. Aggregate Results

모든 에이전트 완료 후:

1. 각 에이전트의 결과 수집
2. Impact별 통합:
   - 🔴 **MUST** (전 에이전트 통합)
   - 🟠 **SHOULD** (전 에이전트 통합)
   - 💪 **STRENGTH** (전 에이전트 통합)
3. 중복 제거 (같은 파일/영역에 대한 유사 제안)
4. 우선순위 정렬 (MUST 내에서도 비즈니스 임팩트 순)

### 5. Generate Comprehensive Report

**Console Output Format**:

```
╔═══════════════════════════════════════════════════════════════════╗
║              🔍 Project Deep Review Report                        ║
║              {project_name} — {date}                              ║
╚═══════════════════════════════════════════════════════════════════╝

📊 Overview
───────────────────────────────────────────────────────────────────────
 Framework: {framework}  |  Domain: {domain}  |  Scale: {files} files
───────────────────────────────────────────────────────────────────────

💪 프로젝트 강점 (유지해야 할 것)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 기술스택
  • {strength}
🟣 UX/디자인
  • {strength}
🔴 성능
  • {strength}
🟢 도메인 해자
  • {strength}
🔷 코드 품질
  • {strength}

🔴 필수 개선 (MUST) — 안 하면 실질적 손해
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{영역별 MUST 이슈 — 비즈니스 임팩트 순}

🟠 권장 개선 (SHOULD) — 체감 가능한 개선
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{영역별 SHOULD 이슈 — 효과 순}

📋 Action Plan (우선순위 순)
───────────────────────────────────────────────────────────────────────
 # │ 등급   │ 영역      │ 제목                          │ 예상 효과
───────────────────────────────────────────────────────────────────────
 1 │ MUST   │ {영역}    │ {제목}                        │ {효과}
 2 │ MUST   │ {영역}    │ {제목}                        │ {효과}
 3 │ SHOULD │ {영역}    │ {제목}                        │ {효과}
 ...
───────────────────────────────────────────────────────────────────────

📚 리서치 소스
───────────────────────────────────────────────────────────────────────
{전 에이전트가 참조한 URL 목록 통합}
───────────────────────────────────────────────────────────────────────

✅ Review Complete — MUST: {count} | SHOULD: {count} | STRENGTH: {count}
```

### 6. File Output (if requested)

`--output=file` 또는 `--output=both`인 경우:

1. 마크다운 리포트 생성
2. `./deep-review-report-{date}.md`로 저장
3. 파일 위치 안내

## Anti-Bias Safeguards

이 리뷰의 핵심 원칙:

1. **"개선"에 꽂히지 않기**: 현재 잘 되고 있는 것을 먼저 인정
2. **규모 적합성**: 1인 프로젝트에 엔터프라이즈 수준 요구하지 않기
3. **ROI 중심**: 구현 비용 대비 효과가 불분명하면 제안하지 않기
4. **근거 필수**: 모든 제안에 공식문서, 데이터, 사례 근거 포함
5. **COULD 배제**: 이론적/미적 개선은 결과에 포함하지 않기

## Error Handling

- 에이전트 실패 시 나머지로 계속 진행
- 프로젝트 파일이 없으면 경로 확인 안내
- 인터넷 접근 불가 시 코드 기반 분석만 수행
