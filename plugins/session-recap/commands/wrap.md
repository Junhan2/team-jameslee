---
allowed_tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Task: 세션 마무리 줄글 보고 (Session Wrap-up)

세션이 끝나갈 때 **한 번 읽으면 전체가 이해되는 줄글**로 보고한다.
이 커맨드는 `session-wrapup` 스킬과 동일한 동작을 한다 — 자연어("결과 정리해줘", "세션 마무리", "줄글로 설명")로도 같은 결과가 나온다.

> 짧은 재개 확인("어디까지 했지")은 `/catchup`, 즉석 한 줄 요약은 공식 `/recap`을 쓴다. 이 커맨드는 세션 종료 상세 보고 전용.

## 1단계: 자동 정보 수집 (병렬)

매니저가 디렉토리를 알려주지 않아도 동작한다. 아래를 병렬로 수집하고, 없는 항목은 조용히 건너뛴다.

```bash
# (1) Git — 이번 세션의 실제 변경
git log --since="midnight" --oneline
git status --short
git diff --stat HEAD
git branch --show-current

# (3) Vault — 프로젝트 동적 감지 (projects.yml로 보정, 매칭 없으면 생략)
VAULT="$HOME/Desktop/Vault"; TODAY="$(date +%F)"; PROJECT="$(basename "$PWD")"
grep -rl "$TODAY" "$VAULT/projects/$PROJECT/issues/" 2>/dev/null
git -C "$VAULT" diff --stat -- "projects/$PROJECT/todo.md" 2>/dev/null
cat "$VAULT/dashboard/.session-status-$PROJECT" 2>/dev/null

# (4) Memory — 이번 세션 신규 파일
ls -t "$HOME/.claude/projects/$(echo "$PWD" | sed 's#/#-#g')/memory"/*.md 2>/dev/null | head -10
```

추가로 트랜스크립트(대화)에서 직접 수집한다:
- **(2) 대화 맥락**: 첫 user prompt, 주요 결정/방향 전환, AskUserQuestion 답들
- **(5) DB 변경**: 이번 세션 `mcp__supabase__execute_sql` 적용분 (RLS / SECURITY DEFINER / GRANT / schema) — 있을 때만
- **(6) 외부 협업**: Codex / advisor / Explore agent 결과 — 있을 때만

## 2단계: 출력 (12단계 골격)

해당 없는 섹션은 통째로 생략한다. 기술 용어는 영문 그대로(RLS, commit hash, table/function 이름).

1. **시작 Insight 박스** — 세션의 진짜 교훈 1–2 bullet (`★ Insight ───…` 박스)
2. `# 이번 세션 전체 정리 (줄글)` 헤더
3. `## 어떻게 시작했나` — 처음 요청과 이유 한 단락
4. `## 본래 점검에서 나온 결론` *(해당 시)*
5. `## 그런데 더 큰 문제가 따로 있었습니다` *(부수 발견 시)* — **(1)(2)(3) 번호 줄글 단락**, 도움될 때만 비유
6. `## 그래서 실제로 무엇을 했나` — commit별 한 문장 (hash 정확히)
7. `## 현재 상태 — 한 줄 요약` — **굵게 단일 문장 verdict** + 미해결 명시
8. `## 매니저님이 해야 할 일` — bash code block + 명령형 (액션 1개면 1개로)
9. `## 부수적으로 알게 된 것들` *(해당 시)* — 3–5건 짧게
10. `## Vault 동기화` — 이슈/Memory/todo/session status 어디에 무엇이 기록됐는지 (자동분 vs 매니저 확인분 구분)
11. `## 한마디로` — `>` blockquote 1–2 문장
12. **끝 Insight 박스** *(선택)* — 메타 교훈

## 3단계: 톤 & 길이

- 한국어 응답, 기술 용어 영문 유지, 호칭 **"매니저님"**
- 비유는 직관에 도움될 때만 (억지 금지). 자동 처리분 vs 매니저 액션 분리, 자만·추측성 완료 선언 금지
- 길이: 짧은 세션 400–600 / 보통 800–1200 / 긴 세션 1200–1700 단어. **2000 단어 초과 금지** (넘으면 "부수적으로 알게 된 것들"부터 압축)
