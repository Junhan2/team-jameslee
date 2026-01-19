---
description: "View detailed template suggestions based on analyzed prompt patterns"
argument-hint: "[pattern_number]"
allowed-tools: ["Read", "Bash", "AskUserQuestion", "Glob"]
model: sonnet
---

# Suggest Templates Command

View detailed suggestions for turning discovered patterns into interactive templates.

**Arguments**: $ARGUMENTS

## Workflow

### 1. Load Analysis Results

Read the latest analysis from `.claude/prompt-analysis/`:

```bash
# Find latest analysis file
LATEST=$(ls -t .claude/prompt-analysis/patterns-*.json 2>/dev/null | head -1)
```

If no analysis exists:
```
⚠️ No pattern analysis found.

Run /analyze-prompts first to discover patterns in your prompt history.
```

### 2. Check for Specific Pattern

If pattern number provided as argument:
- Show detailed suggestion for that pattern only
- Skip to Step 4

If no argument:
- List all patterns with brief overview
- Ask user which pattern to explore

### 3. Interactive Pattern Selection

Use AskUserQuestion to let user select:

```
Question: "어떤 패턴의 템플릿 제안을 보시겠습니까?"
Header: "Pattern"
MultiSelect: false
Options:
- "1. {pattern_name} ({frequency}회)" (Description: {brief_description})
- "2. {pattern_name} ({frequency}회)" (Description: {brief_description})
- "3. {pattern_name} ({frequency}회)" (Description: {brief_description})
- "전체 보기" (Description: Show all patterns with suggestions)
```

### 4. Detect Project Tech Stack

Read project configuration:

```bash
# Check package.json
cat package.json 2>/dev/null | jq '{
  react: (.dependencies.react // .devDependencies.react // null),
  next: (.dependencies.next // .devDependencies.next // null),
  typescript: (.devDependencies.typescript // null),
  reactQuery: (.dependencies["@tanstack/react-query"] // null),
  swr: (.dependencies.swr // null)
}'
```

### 5. Check Existing Plugins

Find related plugins that can be integrated:

```bash
# List installed plugins
ls ${CLAUDE_PLUGIN_ROOT}/../*/plugin.json 2>/dev/null | while read f; do
  cat "$f" | jq -r '.name'
done
```

Match pattern category to plugins:
- Code review patterns → `react-best-practices-review`
- Session tracking → `session-recap`
- etc.

### 6. Generate Template Suggestion

For selected pattern, generate detailed suggestion:

```markdown
╔═══════════════════════════════════════════════════════════════╗
║        Template Suggestion: {pattern_name}                    ║
╚═══════════════════════════════════════════════════════════════╝

📊 Pattern Analysis
──────────────────────────────────────────────────────────────────
 Frequency:     {count}회 (상위 {percentile}%)
 Category:      {category}
 Avg Length:    {avg_words} words
──────────────────────────────────────────────────────────────────

📝 Example Prompts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. "{example_prompt_1}"
2. "{example_prompt_2}"
3. "{example_prompt_3}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Suggested Command: `/{suggested_command_name}`

### Interactive Questions (AskUserQuestion)

The template will ask these questions to minimize typing:

**Q1. {question_1}**
Header: "{header}"
Options:
- {option_1}
- {option_2}
- {option_3}

**Q2. {question_2}**
...

### Execution Criteria

템플릿이 실행할 때 적용될 수행 기준:

#### Layer 1: Plugin Integration
{if_plugin_available}
✅ `{plugin_name}` 플러그인 연동 가능
   - {specific_rule_or_agent}
   - {specific_rule_or_agent}
{else}
ℹ️ 관련 플러그인 없음
{endif}

#### Layer 2: Official Documentation (Context7)
{if_tech_stack_detected}
📚 {tech_name} 공식 문서 참조:
   - {best_practice_1}
   - {best_practice_2}
{endif}

#### Layer 3: Historical Response Patterns
과거 유사 프롬프트에서 Claude가 수행한 주요 항목:
- {extracted_action_1}
- {extracted_action_2}
- {extracted_action_3}

### Preview Command Structure

```yaml
---
description: "{auto_generated_description}"
argument-hint: "{detected_arguments}"
allowed-tools: [{detected_tools}]
model: sonnet
---

# {Command Name}

## 1. Collect Information (AskUserQuestion)
{question_flow}

## 2. Execute with Criteria
{execution_steps_with_criteria}

## 3. Output Format
{output_format}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Actions
──────────────────────────────────────────────────────────────────
 • `/create-template {pattern_number}` - Create this template
 • `/suggest-templates {next_number}` - View next pattern
──────────────────────────────────────────────────────────────────
```

### 7. Show All Patterns Summary

If user selected "전체 보기":

```markdown
╔═══════════════════════════════════════════════════════════════╗
║        All Pattern Suggestions                                ║
╚═══════════════════════════════════════════════════════════════╝

| # | Pattern | Freq | Plugin | Suggested Command |
|---|---------|------|--------|-------------------|
| 1 | {name} | {n}회 | ✅ {plugin} | `/{cmd}` |
| 2 | {name} | {n}회 | ❌ - | `/{cmd}` |
| 3 | {name} | {n}회 | ✅ {plugin} | `/{cmd}` |
...

──────────────────────────────────────────────────────────────────
 Use `/suggest-templates {number}` for detailed suggestion
──────────────────────────────────────────────────────────────────
```

## Usage Examples

```bash
# View all suggestions overview
/suggest-templates

# View detailed suggestion for pattern #2
/suggest-templates 2
```

## Notes

- Suggestions are based on `/analyze-prompts` results
- Plugin integration is detected automatically
- Tech stack is read from package.json
- Use `/create-template` to actually generate the command file
