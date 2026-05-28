---
name: session-wrapup
description: |
  This skill should be used at the END of a work session, or when the user asks for a full narrative wrap-up of everything that happened — what was done, why, and the current state — delivered as one readable prose report (줄글) that explains the whole session in a single read. It collects git history, Vault issues/todos, memory, DB changes, and collaboration results, then narrates them in prose with analogies where they genuinely aid understanding.

  This is DISTINCT from the session-catchup skill (/catchup, a resume orientation) and from Claude Code's built-in /recap (an instant one-liner). Wrapup is a DETAILED end-of-session debrief (800–1700 words, prose + analogies, manager-facing).

  Trigger phrases (Korean): "결과 정리해줘", "지금까지 한 거 요약", "세션 마무리", "이해 쉽게 설명", "줄글로 설명", "한 번에 이해되게", "총정리", "wrapup", "랩업"
  Trigger phrases (English): "wrap up", "session debrief", "explain what happened", "narrative summary"

  Do NOT use for short status checks ("어디까지 했지?", "session status", "recent work", "최근 작업", "뭐 하고 있었지?") — those belong to session-catchup (/catchup); for an instant one-liner use the built-in /recap.
---

# Session Wrap-up Skill (세션 마무리 줄글 보고)

긴 작업 세션이 끝나갈 때, 또는 매니저가 "결과 정리 / 줄글로 설명 / 이해 쉽게 / 세션 마무리 / 총정리"를 요청할 때 사용한다.
목표는 **한 번 읽으면 세션 전체가 이해되는 줄글 보고서**다. 리스트 나열이 아니라, 무엇을 왜 했고 지금 상태가 어떤지를 이야기로 엮는다.

## 다른 도구와의 분기 — 역할 분리 (트리거 겹침 금지)

| | session-catchup (/catchup) | session-wrapup (/wrap, 이 스킬) |
|---|---|---|
| 목적 | 진행 상태 빠른 확인 | 세션 마무리 상세 보고 |
| 톤 | 간결, 핵심만 (리스트) | 줄글 narrative + 비유 |
| 길이 | 짧게 | 800–1700 단어 |
| 시점 | 작업 중간/시작 ("어디까지 했지") | 세션 종료 |
| 데이터 | git + .claude/logs | git + Vault issues + memory + DB 변경 + 협업 결과 |
| 트리거 | "어디까지 했지", days 인자 | "결과 정리/줄글로/이해 쉽게/세션 마무리/총정리" |

이 스킬은 **session-catchup의 트리거("어디까지 했지", "최근 작업")를 절대 가로채지 않는다.** 짧은 재개 확인이 오면 session-catchup에, 즉석 한 줄이면 공식 `/recap`에 맡긴다.

---

## 1단계 — 자동 정보 수집 (병렬 실행)

매니저가 디렉토리를 알려주지 않아도 동작해야 한다. 아래를 **병렬로** 수집하고, 없는 항목은 조용히 건너뛴다 (억지로 채우지 않는다).

### (1) Git — 이번 세션의 실제 변경
```bash
git log --since="midnight" --oneline          # 오늘 커밋 (commit별 한 문장의 근거)
git status --short                             # 미커밋/미추적 변경
git diff --stat HEAD                           # 변경 규모 (파일/라인)
git branch --show-current                      # 현재 브랜치
```

### (2) 이번 conversation — 대화 맥락 (셸 아님, 트랜스크립트에서)
- 첫 user prompt (세션이 어떻게 시작됐나)
- 도중의 주요 결정과 방향 전환
- AskUserQuestion으로 매니저가 고른 답들

### (3) Vault — 프로젝트 동적 감지
프로젝트는 cwd / git remote에서 추론하고 `~/Desktop/Vault/dashboard/projects.yml`로 대조한다. 매칭되는 `~/Desktop/Vault/projects/{project}/`가 있으면 수집, 없으면(비-Vault 프로젝트) Vault 섹션은 생략한다.
```bash
VAULT="$HOME/Desktop/Vault"
TODAY="$(date +%F)"
PROJECT="$(basename "$PWD")"   # 코드 프로젝트면 디렉토리명 / Vault면 'Vault' — projects.yml로 보정
# 오늘 생성/수정된 이슈
ls -t "$VAULT/projects/$PROJECT/issues/"*.md 2>/dev/null | head -10
grep -rl "$TODAY" "$VAULT/projects/$PROJECT/issues/" 2>/dev/null
# todo 변경분 (Vault가 git repo일 때)
git -C "$VAULT" diff --stat -- "projects/$PROJECT/todo.md" 2>/dev/null
# 직전 세션 상태
cat "$VAULT/dashboard/.session-status-$PROJECT" 2>/dev/null
```

### (4) Memory — 이번 세션 신규 파일
cwd를 슬래시→하이픈으로 인코딩한 경로 아래 memory를 본다.
```bash
MEM="$HOME/.claude/projects/$(echo "$PWD" | sed 's#/#-#g')/memory"
ls -t "$MEM"/*.md 2>/dev/null | head -10
```

### (5) Production/Staging DB 변경 — 있을 때만 (트랜스크립트에서)
이번 세션에서 `mcp__supabase__execute_sql` 등으로 적용한 DDL/DML 변경. RLS, SECURITY DEFINER, GRANT, schema 변경은 특히 명확히. 없으면 섹션 자체를 생략.

### (6) 외부 협업 — 있을 때만 (트랜스크립트에서)
Codex / advisor / Explore agent 등의 결과 요약. 없으면 생략.

---

## 2단계 — 출력 형식 (12단계 골격)

아래 골격을 순서대로 따른다. 해당 사항이 없는 섹션은 통째로 생략한다 (빈 헤더 금지). 기술 용어는 영문 그대로(RLS, SECURITY DEFINER, schema.sql, commit hash, table/function 이름).

**① 시작 Insight 박스** — 이번 세션의 진짜 교훈 1–2 bullet
```
★ Insight ─────────────────────────────────────
[세션의 핵심 교훈 1-2개]
─────────────────────────────────────────────────
```

**②** `# 이번 세션 전체 정리 (줄글)` 헤더

**③** `## 어떻게 시작했나` — 처음 요청과 그 이유를 한 단락 줄글로

**④** `## 본래 점검에서 나온 결론` *(해당 시)* — 원래 주제의 결과

**⑤** `## 그런데 더 큰 문제가 따로 있었습니다` *(부수 발견이 있을 때)* — 발견을 **(1)(2)(3) 번호 줄글 단락**으로. 각 단락은 한 문제를 끝까지 설명하고, 비기술자도 이해할 비유를 **도움이 될 때만** 곁들인다 (억지 비유 금지)

**⑥** `## 그래서 실제로 무엇을 했나` — commit별 한 문장 (hash 정확히 인용)

**⑦** `## 현재 상태 — 한 줄 요약` — **굵게 처리한 단일 문장 verdict** + 미해결 항목 명시
> 예: **현재 production은 안전하지만, staging의 upsert 함수 signature drift는 아직 미해결입니다.**

**⑧** `## 매니저님이 해야 할 일` — bash code block + 명령형. 액션이 1개면 1개로 명확히 (억지로 늘리지 않음)
```bash
# 예: 실제로 실행할 명령
```

**⑨** `## 부수적으로 알게 된 것들` *(해당 시)* — 본 작업 외 발견 3–5건 짧게

**⑩** `## Vault 동기화` — 이슈 노트 / Memory / todo / session status 중 **어디에 무엇이 기록됐는지** (자동 처리분과 매니저가 확인할 것을 구분)

**⑪** `## 한마디로` — `>` blockquote, 1–2 문장 요약

**⑫ 끝 Insight 박스** *(선택)* — 메타 교훈
```
★ Insight ─────────────────────────────────────
[이번 세션에서 일하는 방식에 대한 메타 교훈]
─────────────────────────────────────────────────
```

---

## 3단계 — 톤 가이드

- **한국어로 응답.** 기술 용어는 영문 그대로 유지 (RLS, SECURITY DEFINER, commit hash, table/function 이름 등 번역 금지)
- 매니저 호칭은 **"매니저님"** (이준한 매니저)
- 친근하지만 정확하게. **비유는 직관에 도움될 때만** — 억지 비유는 오히려 신뢰를 깎는다
- **자동 처리된 것 vs 매니저가 직접 해야 할 것을 명확히 분리.** 자만 금지 — 미해결/불확실은 솔직히 명시
- "아마 될 것이다" 류의 추측성 완료 선언 금지. 검증된 것만 "완료"로

---

## 4단계 — 출력 길이 예산

| 세션 규모 | 단어 |
|---|---|
| 짧음 (발견 1–2, commit 1–2) | 400–600 |
| 보통 (발견 3–5, commit 2–4) | 800–1200 |
| 긺 (P0 다수 등) | 1200–1700 |

**2000 단어 절대 초과 금지.** 넘으면 `## 부수적으로 알게 된 것들`부터 압축한다.

---

## 5단계 — 주의사항

- 해당 없는 섹션은 **통째로 생략** (빈 헤더를 남기지 않는다)
- commit hash는 `git log` 출력에서 **정확히** 인용 (추측 금지)
- DB 변경 / 외부 협업 섹션은 **실제로 있었을 때만** 추가
- 비-Vault 프로젝트(예: junhan.day 등 일부)면 Vault 섹션은 자연스럽게 축소/생략
- 짧은 재개 확인은 **session-catchup(/catchup)**, 즉석 한 줄은 공식 **/recap**으로 (이 스킬은 세션 종료 상세 보고 전용)
