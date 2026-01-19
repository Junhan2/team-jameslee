---
description: "Comprehensive React best practices review with confidence-based filtering"
argument-hint: "[path] [--output=console|file|both] [--threshold=80]"
allowed-tools: ["Read", "Grep", "Glob", "Task", "Bash", "Write"]
model: sonnet
---

# React Best Practices Review

Run a comprehensive code review using 6 specialized agents, each focusing on a different aspect of React/Next.js performance.

**Arguments**: $ARGUMENTS

## Review Workflow

### 1. Parse Arguments

Parse the provided arguments:
- `path`: Directory or file to review (default: `src/`)
- `--output`: Output format - `console` (default), `file`, or `both`
- `--threshold`: Minimum confidence score to report (default: 80)

### 2. Project Detection

Detect project configuration:

1. Read `package.json` to identify:
   - React version (check for React 19 / React Compiler)
   - Next.js version
   - Data fetching libraries (React Query, SWR)
   - State management (Zustand, Jotai, Redux)

2. Check for `.claude/react-review.local.md` for project-specific settings:
   - `ignoreRules`: Rules to skip
   - `ignorePaths`: Paths to exclude
   - `customThresholds.confidence`: Override default threshold

3. Check for React Compiler:
   ```bash
   grep -l "babel-plugin-react-compiler" package.json
   ```
   If found, inform agents to skip manual memoization issues.

### 3. Identify Files to Review

Determine review scope:

1. If specific path provided, use that
2. Otherwise, identify changed files:
   ```bash
   git diff --name-only HEAD~5 -- '*.tsx' '*.ts' '*.jsx' '*.js' | grep -v '.test.' | grep -v '.spec.'
   ```
3. If no changes, review `src/` directory

### 4. Launch Specialized Agents

Launch all 6 agents in **parallel** using the Task tool:

| Agent | Priority | Focus |
|-------|----------|-------|
| `async-waterfall-hunter` | CRITICAL | Async waterfalls, sequential requests |
| `bundle-analyzer` | CRITICAL-HIGH | Bundle size, code splitting |
| `server-performance-reviewer` | HIGH | RSC patterns, caching |
| `client-data-reviewer` | MEDIUM-HIGH | SWR/React Query, optimistic updates |
| `rerender-detector` | MEDIUM | Unnecessary rerenders |
| `react-pattern-analyzer` | MEDIUM-LOW | Hooks, component patterns |

**Agent Prompt Template**:
```
Review the following React/Next.js code for {focus_area}.

## Project Context
- React Version: {version}
- Next.js Version: {version}
- React Compiler: {enabled/disabled}
- Data Library: {library}

## Files to Review
{file_list}

## Confidence Threshold
Only report issues with confidence >= {threshold}

## Rules Reference
Read rules from: ${CLAUDE_PLUGIN_ROOT}/rules/

## Output Format
For each issue, provide:
- File path and line number
- Confidence score (0-100)
- Impact level
- Current code
- Suggested fix
- Estimated improvement
```

### 5. Aggregate Results

After all agents complete:

1. Collect all reported issues
2. Filter by confidence threshold
3. Group by impact level:
   - 🔴 CRITICAL (95-100)
   - 🟠 HIGH (90-94)
   - 🟡 MEDIUM (80-89)
4. Sort within groups by confidence (highest first)
5. Remove duplicates (same file:line from multiple agents)

### 6. Generate Report

**Console Output Format**:

```
╔═══════════════════════════════════════════════════════════════╗
║        React Best Practices Review Report                     ║
║        Generated: {timestamp}                                 ║
╚═══════════════════════════════════════════════════════════════╝

📊 Summary
──────────────────────────────────────────────────────────────────
 🔴 CRITICAL:  {count} issues
 🟠 HIGH:      {count} issues
 🟡 MEDIUM:    {count} issues
──────────────────────────────────────────────────────────────────

🔴 CRITICAL Issues (Must Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1. {Issue Title}
📍 File: {file_path}:{line_number}
🎯 Confidence: {score}/100
⚡ Impact: {impact_description}

Current Code:
┌──────────────────────────────────────┐
│ {current_code}                       │
└──────────────────────────────────────┘

Suggested Fix:
┌──────────────────────────────────────┐
│ {suggested_code}                     │
└──────────────────────────────────────┘

📈 Estimated: {improvement}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟠 HIGH Issues (Should Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{issues...}

🟡 MEDIUM Issues (Consider Fixing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{issues...}

📋 Action Plan
──────────────────────────────────────────────────────────────────
 Priority │ Task                              │ Impact
──────────────────────────────────────────────────────────────────
 1. ⚡    │ {task}                            │ {impact}
 2. ⚡    │ {task}                            │ {impact}
 ...
──────────────────────────────────────────────────────────────────

✅ Review Complete - {total_issues} issues found, {critical_count} critical
```

### 7. File Output (if requested)

If `--output=file` or `--output=both`:

1. Generate markdown report using `${CLAUDE_PLUGIN_ROOT}/templates/report-markdown.md`
2. Write to `./react-review-report-{date}.md`
3. Inform user of file location

## Usage Examples

```bash
# Full review with default settings
/react-review

# Review specific directory
/react-review src/components/

# Generate report file
/react-review --output=file

# Higher confidence threshold
/react-review --threshold=90

# Combine options
/react-review src/pages/ --output=both --threshold=85
```

## Agent Coordination Notes

- All agents run in **parallel** for speed
- Each agent focuses on its specialty
- Results are aggregated and deduplicated
- Final output is sorted by impact
- If no issues found, confirm code meets standards

## Error Handling

- If an agent fails, continue with others
- If no files found to review, inform user
- If git not available, review all files in src/
