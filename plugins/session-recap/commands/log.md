---
allowed_tools:
  - Bash
  - Read
  - Write
  - Glob
  - AskUserQuestion
args:
  - name: title
    description: "작업 제목 (선택적). 제공되지 않으면 대화 맥락에서 추론"
    required: false
---

# Task: 작업 로그 기록

현재 작업 세션의 로그를 `.claude/logs/YYYY-MM-DD.md` 파일에 기록합니다.

## 1단계: Git 상태 수집

다음 Bash 명령어들을 실행하여 정보를 수집하세요:

```bash
# 현재 브랜치
git branch --show-current

# 최근 커밋 해시 (short)
git rev-parse --short HEAD

# 변경된 파일 목록
git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only
```

## 2단계: 작업 내용 확인

사용자에게 다음 정보를 AskUserQuestion으로 물어보세요 (대화 맥락에서 명확하지 않은 경우):

1. **배경 (Why)**: 이 작업을 하게 된 이유는 무엇인가요?
2. **완료 항목**: 어떤 작업들이 완료되었나요?
3. **미완료/보류 항목**: 남은 작업이나 의도적으로 제외한 항목이 있나요?
4. **효과 (Impact)**: 기대 효과나 측정된 개선 사항은 무엇인가요?

대화 맥락에서 이미 명확한 내용은 추론하여 사용하세요.

## 3단계: 로그 파일 작성

오늘 날짜 기준으로 `.claude/logs/YYYY-MM-DD.md` 파일에 아래 템플릿으로 append 하세요.
파일이 없으면 새로 생성합니다.

### 템플릿

```markdown
## {작업명}

> 📅 {YYYY-MM-DD HH:MM} | 🌿 `{branch}` | 🔖 `{short_hash}`

### 배경 (Why)
{이 작업을 하게 된 이유, 문제 상황, 요청 사항}

### 결과 (What)
**완료:**
- {완료된 항목들}

**미완료/보류:**
- {남은 작업 또는 의도적으로 제외한 항목}

### 효과 (Impact)
{기대 효과 또는 실제 측정된 개선 사항}

### 변경 파일
<details>
<summary>{N}개 파일 변경</summary>

{git diff 결과}

</details>

---
```

## 4단계: 완료 메시지

로그가 기록되면 사용자에게 알려주세요:
- 파일 경로
- 기록된 작업 제목
- 총 로그 개수 (해당 날짜 파일 기준)

## 주의사항

- 인자로 `title`이 제공되면 그것을 작업명으로 사용
- 제공되지 않으면 대화 맥락에서 추론하거나 사용자에게 질문
- 시간은 현재 로컬 시간 사용 (24시간 형식)
- `.claude/logs/` 디렉토리가 없으면 먼저 생성
