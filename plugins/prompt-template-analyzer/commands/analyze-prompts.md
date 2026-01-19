---
description: "Analyze past prompts to discover frequently used patterns for template creation"
argument-hint: "[--days=30] [--min-frequency=3]"
allowed-tools: ["Read", "Bash", "Task", "AskUserQuestion", "Write", "Glob"]
model: sonnet
---

# Analyze Prompts Command

Analyze your prompt history to discover recurring patterns that can be turned into reusable templates.

**Arguments**: $ARGUMENTS

## Workflow

### 1. Parse Arguments & Get User Preferences

Parse arguments:
- `--days`: Analysis period in days (default: 30)
- `--min-frequency`: Minimum occurrences to consider as pattern (default: 3)

If no arguments provided, ask user using AskUserQuestion:

```
Question: "분석할 기간을 선택해주세요"
Header: "Analysis Period"
Options:
- "최근 7일" (Last 7 days of prompts)
- "최근 30일 (Recommended)" (Last 30 days - good balance)
- "최근 90일" (Last 90 days - comprehensive analysis)
```

### 2. Locate History Data

Find Claude history files:

```bash
# Current project path (for filtering)
PROJECT_PATH=$(pwd)

# History index file
HISTORY_FILE=~/.claude/history.jsonl

# Project-specific sessions
PROJECT_SESSIONS_DIR=~/.claude/projects/$(echo "$PROJECT_PATH" | sed 's/\//-/g' | sed 's/^-//')
```

Verify files exist:
```bash
ls -la ~/.claude/history.jsonl 2>/dev/null
ls -la "$PROJECT_SESSIONS_DIR/sessions-index.json" 2>/dev/null
```

### 3. Extract Prompts

Read and filter prompts for current project:

```bash
# Calculate cutoff timestamp (days ago)
CUTOFF=$(date -v-${DAYS}d +%s000 2>/dev/null || date -d "-${DAYS} days" +%s000)

# Extract prompts for current project within date range
cat ~/.claude/history.jsonl | while read line; do
  project=$(echo "$line" | jq -r '.project // empty')
  timestamp=$(echo "$line" | jq -r '.timestamp // 0')
  prompt=$(echo "$line" | jq -r '.prompt // empty')

  if [ "$project" = "$PROJECT_PATH" ] && [ "$timestamp" -gt "$CUTOFF" ]; then
    echo "$prompt"
  fi
done
```

If history.jsonl is not accessible, inform user and suggest alternative:
- Check sessions-index.json for session IDs
- Read individual session .jsonl files for full conversation data

### 4. Launch Pattern Analyzer Agent

Use the Task tool to launch the `prompt-pattern-analyzer` agent with extracted prompts:

**Agent Prompt**:
```
Analyze the following prompts from the current project and identify recurring patterns.

## Prompts to Analyze
{extracted_prompts}

## Analysis Requirements
1. Group similar prompts by intent (code review, refactoring, debugging, etc.)
2. Identify variable parts (file paths, feature names, etc.)
3. Calculate frequency for each pattern
4. Extract common action verbs and objects
5. Note any project-specific terminology

## Output Format
Return patterns in this structure:
- Pattern name
- Frequency count
- Example prompts (2-3)
- Variable parts identified
- Suggested template command name
```

### 5. Filter & Rank Patterns

After agent analysis, filter patterns:

1. Remove patterns with frequency < `--min-frequency`
2. Sort by frequency (highest first)
3. Group by category (code review, feature dev, debugging, etc.)
4. Identify patterns that could benefit from AskUserQuestion interaction

### 6. Present Results

Display discovered patterns:

```markdown
╔═══════════════════════════════════════════════════════════════╗
║        Prompt Pattern Analysis Results                        ║
║        Period: {start_date} ~ {end_date}                      ║
╚═══════════════════════════════════════════════════════════════╝

📊 Summary
──────────────────────────────────────────────────────────────────
 Total Prompts Analyzed:  {count}
 Patterns Discovered:     {pattern_count}
 Template Candidates:     {high_freq_count}
──────────────────────────────────────────────────────────────────

🔥 Top Patterns (Template Candidates)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1. {Pattern Name}
📍 Frequency: {count}회 ({percentage}%)
📁 Category: {category}

**Example Prompts**:
- "{example_1}"
- "{example_2}"

**Variable Parts**:
- `{path}`: File or directory path
- `{feature}`: Feature name

**Suggested Command**: `/review-{category}`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 2. {Pattern Name}
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Next Steps
──────────────────────────────────────────────────────────────────
 • Use `/create-template {pattern_number}` to create a command
 • Use `/suggest-templates` to see detailed suggestions
──────────────────────────────────────────────────────────────────
```

### 7. Save Analysis Results

Save results to `.claude/prompt-analysis/` for future reference:

```bash
mkdir -p .claude/prompt-analysis
```

Write analysis to file:
- `.claude/prompt-analysis/patterns-{date}.json`: Raw pattern data
- Use for `/create-template` and `/suggest-templates` commands

### 8. Handle Edge Cases

**No history found**:
```
⚠️ No prompt history found for this project.

Start using Claude in this project and run /analyze-prompts again later.
History is automatically recorded in ~/.claude/history.jsonl
```

**No patterns found**:
```
📊 Analysis complete but no recurring patterns found.

This could mean:
- Your prompts are highly varied (which is fine!)
- The analysis period is too short
- Try extending the period with --days=90
```

**Permission issues**:
```
⚠️ Cannot access history files.

Check permissions:
- ~/.claude/history.jsonl
- ~/.claude/projects/

These files are created by Claude Code automatically.
```

## Usage Examples

```bash
# Analyze with default settings (30 days, min 3 occurrences)
/analyze-prompts

# Analyze last 7 days
/analyze-prompts --days=7

# Find very common patterns only
/analyze-prompts --min-frequency=5

# Comprehensive analysis
/analyze-prompts --days=90 --min-frequency=2
```

## Notes

- Analysis is scoped to current project only
- Patterns are anonymized (sensitive data stripped)
- Results are stored locally in `.claude/prompt-analysis/`
- Use `/create-template` to turn patterns into commands
