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

# Task: 세션 상태 요약

최근 작업 세션의 상태를 요약하여 보여줍니다.

## 1단계: Git 상태 수집

다음 Bash 명령어들을 병렬로 실행하세요:

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

`.claude/logs/` 디렉토리에서 최근 로그 파일들을 읽습니다:
- `days` 인자가 있으면 해당 일수만큼
- 없으면 기본 3일치
- 파일이 없으면 "로그 없음"으로 처리

```bash
# 최근 로그 파일 목록 (날짜순 정렬)
ls -t .claude/logs/*.md 2>/dev/null | head -n {days}
```

각 파일을 Read로 읽어 ## 헤딩(작업명)과 상태를 파싱합니다.

## 3단계: 요약 출력

다음 형식으로 출력하세요:

```markdown
## 🔄 세션 상태

### 📍 Git 상태
- 브랜치: `{branch}` ({main 대비 상태})
- 마지막 커밋: `{short_hash}` {message}
- 미커밋 변경: {unstaged_count}개 파일 ({staged_count}개 staged)

### 📋 최근 작업
{각 날짜별 작업 요약}

**{YYYY-MM-DD}**
- {작업명 1}: {완료/미완료 상태 요약}
- {작업명 2}: {완료/미완료 상태 요약}

### 🔜 다음 단계
{미완료 항목들 중 우선순위 높은 것들}
```

## 4단계: 추가 안내

- 로그가 없으면: `/log` 커맨드로 작업을 기록하라고 안내
- push가 필요하면: "push가 필요합니다" 알림
- 충돌 가능성이 있으면: main과 동기화 권장

## 주의사항

- 로그 파일 파싱 시 ## 로 시작하는 라인을 작업명으로 인식
- 완료/미완료는 "**완료:**", "**미완료/보류:**" 섹션에서 파싱
- 출력은 간결하게, 핵심 정보만 포함
