---
description: |
  Use this skill when the user asks about recent work progress, session status, or what was done previously.
  
  Trigger phrases (Korean):
  - "어디까지 했지?"
  - "지난 작업 알려줘"
  - "작업 상태"
  - "뭐 하고 있었지?"
  - "이전 작업"
  - "최근 작업"
  
  Trigger phrases (English):
  - "What did I work on?"
  - "Where did we leave off?"
  - "Session status"
  - "Recent work"
  - "What was I doing?"
---

# Session Recap Skill

사용자가 최근 작업 상태나 진행 상황을 물어볼 때 이 스킬을 사용하세요.

## 동작

1. Git 상태 수집
2. `.claude/logs/` 디렉토리에서 최근 로그 읽기
3. 요약 출력

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
## 🔄 세션 상태

### 📍 Git 상태
- 브랜치: `{branch}` ({main 대비 상태})
- 마지막 커밋: `{short_hash}` {message}
- 미커밋 변경: {count}개 파일

### 📋 최근 작업
**{날짜}**
- {작업명}: {상태 요약}

### 🔜 다음 단계
{미완료 항목 중 우선순위 높은 것}
```

## 로그가 없는 경우

로그 파일이 없으면 다음과 같이 안내:
- Git 상태만 보여주기
- `/log` 커맨드로 작업을 기록하라고 권장
