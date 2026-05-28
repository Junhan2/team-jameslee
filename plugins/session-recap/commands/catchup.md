---
allowed_tools:
  - Bash
  - Read
  - Glob
args:
  - name: days
    description: "조회할 일수 (기본값: 3)"
    required: false
---

# Task: 작업 재개 — Catch-up (어디까지 했나)

작업을 다시 시작할 때 **"어디까지 했고 다음에 뭘 해야 하나"**를 빠르게 잡아주는 재개 오리엔테이션이다.

> **언제 쓰나 — 세 도구가 시점으로 갈린다:**
> - **공식 `/recap`** (Claude Code built-in): 아무때나 즉석 한 줄 요약 (+ 자리 비웠다 복귀 시 자동)
> - **`/catchup`** (이 커맨드): **작업 재개/시작 시** — git 상태 + 최근 로그 + 다음 단계로 맥락 복원
> - **`/wrap`**: **세션 종료 시** 상세 줄글 디브리프
>
> 즉석 한 줄이면 공식 `/recap`을, 끝맺는 상세 보고면 `/wrap`을 쓴다. 이 커맨드는 그 사이 — "다시 앉아서 이어서 하기"다.

## 1단계: Git 상태 수집

다음 Bash 명령어들을 병렬로 실행한다:

```bash
# 현재 브랜치
git branch --show-current

# 최근 커밋 (1개)
git log -1 --pretty=format:"%h %s"

# main 대비 ahead/behind
git rev-list --left-right --count main...HEAD 2>/dev/null || echo "0 0"

# Unstaged 변경 파일 수
git status --porcelain | wc -l

# Staged 변경 파일 수
git diff --cached --name-only | wc -l
```

## 2단계: 로그 파일 읽기

`.claude/logs/` 디렉토리에서 최근 로그 파일들을 읽는다:
- `days` 인자가 있으면 해당 일수만큼
- 없으면 기본 3일치
- 파일이 없으면 "로그 없음"으로 처리

```bash
# 최근 로그 파일 목록 (날짜순 정렬)
ls -t .claude/logs/*.md 2>/dev/null | head -n {days}
```

각 파일을 Read로 읽어 ## 헤딩(작업명)과 상태를 파싱한다.

## 3단계: 출력

다음 형식으로 출력한다 (간결하게 — 재개에 필요한 핵심만):

```markdown
## 🔄 이어서 작업하기 (Catch-up)

### 📍 Git 상태
- 브랜치: `{branch}` ({main 대비 상태})
- 마지막 커밋: `{short_hash}` {message}
- 미커밋 변경: {unstaged_count}개 파일 ({staged_count}개 staged)

### 📋 최근 작업
**{YYYY-MM-DD}**
- {작업명 1}: {완료/미완료 상태 요약}
- {작업명 2}: {완료/미완료 상태 요약}

### 🔜 바로 다음 할 일
{미완료 항목 중 우선순위 높은 것들 — 재개 시 가장 먼저 손댈 것}
```

## 4단계: 추가 안내

- 로그가 없으면: `/log` 커맨드로 작업을 기록하라고 안내
- push가 필요하면: "push가 필요합니다" 알림
- 충돌 가능성이 있으면: main과 동기화 권장
- 세션을 끝맺는 상세 보고가 필요하면: `/wrap` 안내

## 주의사항

- 로그 파일 파싱 시 ## 로 시작하는 라인을 작업명으로 인식
- 완료/미완료는 "**완료:**", "**미완료/보류:**" 섹션에서 파싱
- 출력은 간결하게, **재개에 필요한 정보**만 포함 (전체 회고는 `/wrap`이 담당)
