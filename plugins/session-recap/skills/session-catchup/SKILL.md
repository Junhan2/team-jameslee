---
name: session-catchup
description: |
  This skill should be used when the user is resuming or restarting work and wants a quick orientation on where they left off — current git state, recent work logs, and what to do next. It restores working context so the user can pick the thread back up.

  Trigger phrases (Korean): "어디까지 했지?", "지난 작업 알려줘", "작업 상태", "뭐 하고 있었지?", "이전 작업", "최근 작업", "이어서 하자", "catchup", "캐치업"
  Trigger phrases (English): "where did we leave off?", "what did I work on?", "what was I doing?", "catch me up", "recent work", "resume work"

  Do NOT use for: an end-of-session detailed narrative debrief (use session-wrapup / "결과 정리해줘", "세션 마무리") or an instant one-line summary (that is Claude Code's built-in /recap).
---

# Session Catch-up Skill (작업 재개 오리엔테이션)

사용자가 작업을 다시 시작하면서 "어디까지 했고 다음에 뭘 해야 하나"를 물을 때 사용한다.
목표는 **재개에 필요한 맥락 복원** — 빠르게 따라잡고 바로 이어서 작업하게 한다.

## 시점으로 갈리는 3-way 분기

| 도구 | 시점 | 역할 |
|---|---|---|
| 공식 `/recap` (built-in) | 아무때나 즉석 | 한 줄 요약 (+ 복귀 시 자동) |
| 이 스킬 / `/catchup` | **작업 재개·시작** | git + 최근 로그 + 다음 단계 = 맥락 복원 |
| session-wrapup / `/wrap` | **세션 종료** | 상세 줄글 디브리프 |

짧은 상태 확인은 이 스킬, 세션을 끝맺는 회고는 **session-wrapup**으로 넘긴다. 트리거가 겹치지 않게 유지한다.

## 동작

1. Git 상태 수집
2. `.claude/logs/` 디렉토리에서 최근 로그 읽기
3. 재개용 요약 출력

## 수집할 정보

### Git 상태
```bash
git branch --show-current
git log -1 --pretty=format:"%h %s"
git rev-list --left-right --count main...HEAD 2>/dev/null || echo "0 0"
git status --porcelain | wc -l
```

### 로그 파일
```bash
ls -t .claude/logs/*.md 2>/dev/null | head -n 3
```

## 출력 형식

```markdown
## 🔄 이어서 작업하기 (Catch-up)

### 📍 Git 상태
- 브랜치: `{branch}` ({main 대비 상태})
- 마지막 커밋: `{short_hash}` {message}
- 미커밋 변경: {count}개 파일

### 📋 최근 작업
**{날짜}**
- {작업명}: {상태 요약}

### 🔜 바로 다음 할 일
{미완료 항목 중 우선순위 높은 것 — 재개 시 가장 먼저 손댈 것}
```

## 로그가 없는 경우

- Git 상태만 보여주기
- `/log` 커맨드로 작업을 기록하라고 권장
