---
description: "빠른 프로젝트 점검 — MUST 이슈만 스캔하는 경량 버전"
argument-hint: "[path]"
allowed-tools: ["Read", "Grep", "Glob", "Task", "Bash", "WebSearch"]
model: sonnet
---

# Quick Deep Review

MUST 등급 이슈만 빠르게 스캔하는 경량 버전입니다. 전체 리뷰(`/deep-review`)의 축약판으로, 즉시 조치가 필요한 문제만 찾습니다.

**Arguments**: $ARGUMENTS

## Workflow

### 1. Project Detection

프로젝트 경로와 기본 정보를 빠르게 파악합니다:
- package.json에서 프레임워크, 주요 의존성
- 프로젝트 규모 (파일 수)

### 2. Quick Scan

3개 핵심 에이전트만 **병렬** 실행합니다:

| Agent | Focus | 시간 |
|-------|-------|------|
| `tech-stack-reviewer` | 보안 취약점, 지원 종료 버전 | ~30s |
| `performance-reviewer` | 심각한 성능 병목 | ~30s |
| `code-quality-reviewer` | 버그 리스크, 타입 안전성 결여 | ~30s |

**핵심 차이**: 각 에이전트에게 "MUST 등급만 보고하라"고 지시합니다.

**Agent Prompt**:
```
프로젝트를 {focus_area} 관점에서 빠르게 스캔해주세요.
⚠️ MUST 등급(안 하면 실질적 손해)만 보고하세요.
SHOULD, COULD, STRENGTH는 이번 스캔에서는 생략합니다.

프로젝트 경로: {path}
```

### 3. Quick Report

```
⚡ Quick Deep Review — {project_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 즉시 조치 필요 ({count}건)

{MUST 이슈만 간결하게 나열}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 전체 분석은 /deep-review 를 사용하세요
```

### 4. No Issues Found

MUST 이슈가 없으면:
```
✅ Quick Scan Complete — 즉시 조치가 필요한 이슈가 없습니다.
💡 전체 분석(SHOULD 포함)은 /deep-review 를 사용하세요
```
