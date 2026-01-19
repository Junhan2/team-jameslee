---
description: "Create an interactive command template from a discovered pattern"
argument-hint: "<pattern_number> [--name=command-name]"
allowed-tools: ["Read", "Write", "Bash", "AskUserQuestion", "Glob", "Task"]
model: sonnet
---

# Create Template Command

Create an AskUserQuestion-based interactive command from a discovered prompt pattern.

**Arguments**: $ARGUMENTS

## Workflow

### 1. Load Pattern Data

If no pattern number provided, use AskUserQuestion:

```
Question: "템플릿으로 만들 패턴을 선택해주세요"
Header: "Pattern"
Options:
- "1. {pattern_name} ({frequency}회)"
- "2. {pattern_name} ({frequency}회)"
- "3. {pattern_name} ({frequency}회)"
```

Load pattern data from `.claude/prompt-analysis/patterns-*.json`:
- Pattern name, category, frequency
- Example prompts
- Variable parts identified

### 2. Confirm or Customize Command Name

If `--name` provided, use that. Otherwise:

```
Question: "커맨드 이름을 선택해주세요"
Header: "Command Name"
Options:
- "/{suggested_name} (Recommended)" (Auto-generated based on pattern)
- "/{alternative_1}" (Alternative suggestion)
- "/{alternative_2}" (Another option)
```

Validate command name:
- Must start with lowercase letter
- Only alphanumeric and hyphens
- Check for duplicates in existing commands

### 3. Detect Project Tech Stack

```bash
# Read package.json
cat package.json 2>/dev/null | jq -r '
  "React: " + (.dependencies.react // .devDependencies.react // "not found"),
  "Next.js: " + (.dependencies.next // .devDependencies.next // "not found"),
  "TypeScript: " + (.devDependencies.typescript // "not found")
'
```

### 4. Find Related Plugins

Search for plugins that match the pattern category:

```bash
# List plugin names and descriptions
for plugin_json in ${CLAUDE_PLUGIN_ROOT}/../*/.claude-plugin/plugin.json; do
  cat "$plugin_json" 2>/dev/null | jq -r '[.name, .description] | @tsv'
done
```

Map pattern categories to plugins:
| Pattern Category | Related Plugin |
|-----------------|----------------|
| Code Review | react-best-practices-review |
| Performance | react-best-practices-review |
| Session/Progress | session-recap |

### 5. Query Official Documentation (Context7)

If tech stack detected, query Context7 MCP for best practices:

**For React patterns**:
```
Use mcp__plugin_context7_context7__resolve-library-id with:
- libraryName: "react"
- query: "{pattern_description}"

Then mcp__plugin_context7_context7__query-docs with:
- libraryId: (resolved id)
- query: "best practices for {pattern_action}"
```

**For Next.js patterns**:
```
Similar process with "next.js" library
```

### 6. Analyze Historical Responses

Use Task tool with prompt-pattern-analyzer agent to extract execution criteria from past responses:

```
Analyze the session files where similar prompts were used.

For each session with matching prompts:
1. Find the Claude response
2. Extract action items performed
3. Identify checklist patterns
4. Note any tools used

Return a list of common execution steps.
```

### 7. Confirm Execution Criteria

Present integrated criteria and let user confirm:

```
Question: "수행 기준에 포함할 항목을 선택해주세요"
Header: "Criteria"
MultiSelect: true
Options:
- "{plugin_rule_1}" (From {plugin_name})
- "{plugin_rule_2}" (From {plugin_name})
- "{doc_practice_1}" (From {library} docs)
- "{historical_step_1}" (From past responses)
```

### 8. Define Interactive Questions

Based on variable parts, create AskUserQuestion flow:

For each variable identified:
```
Question: "'{variable}' 입력 방식을 선택해주세요"
Header: "Input Type"
Options:
- "선택지 제공 (Recommended)" (User picks from options)
- "직접 입력" (Free text via 'Other')
- "기본값 사용" (Use default: {default})
```

If "선택지 제공" selected:
```
Question: "'{variable}'의 선택지를 정의해주세요"
Header: "Options"
Options:
- "자동 감지 (Recommended)" (Detect from project structure)
- "직접 정의" (Define custom options)
```

### 9. Generate Command File

Create the command markdown file:

```markdown
---
description: "{generated_description}"
argument-hint: "{argument_format}"
allowed-tools: [{required_tools}]
model: sonnet
---

# {Command Title}

{brief_description}

**Arguments**: $ARGUMENTS

## 1. Collect Information

### Step 1: {First Question}

Use AskUserQuestion:
```
Question: "{question_text}"
Header: "{header}"
MultiSelect: {true/false}
Options:
- "{option_1}" ({description})
- "{option_2}" ({description})
```

### Step 2: {Second Question}
...

## 2. Execute with Criteria

Based on user selections, execute the following:

### Execution Criteria

{if_plugin_integration}
#### From {plugin_name} Plugin
Invoke the following agent/command:
- Tool: Task with subagent_type="{agent_name}"
- Prompt: {agent_prompt_template}
{endif}

{if_context7_docs}
#### From Official Documentation
Apply these best practices:
{best_practice_list}
{endif}

{if_historical_patterns}
#### Standard Execution Steps
{step_list}
{endif}

### Core Actions

1. {action_1}
2. {action_2}
3. {action_3}

## 3. Output Format

{output_template}

## Usage Examples

```bash
# Basic usage
/{command_name}

# With arguments
/{command_name} {example_args}
```

## Notes

- Generated by prompt-template-analyzer
- Pattern frequency: {frequency}회
- Created: {date}
```

### 10. Write Command File

Save to `generated-commands/`:

```bash
# Target path
TARGET="${CLAUDE_PLUGIN_ROOT}/generated-commands/{command_name}.md"
```

Write the generated content.

### 11. Verify & Confirm

Check command was created:

```bash
ls -la "${CLAUDE_PLUGIN_ROOT}/generated-commands/{command_name}.md"
```

Inform user:

```markdown
✅ Template Created Successfully!

**Command**: `/{command_name}`
**Location**: `${CLAUDE_PLUGIN_ROOT}/generated-commands/{command_name}.md`

### Integrated Criteria
{criteria_summary}

### How to Use
```bash
/{command_name}
```

The command will guide you through:
1. {question_1_summary}
2. {question_2_summary}
...

### Customization
Edit the command file to:
- Add more options
- Modify execution criteria
- Change output format

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Try it now: `/{command_name}`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Error Handling

**Pattern not found**:
```
⚠️ Pattern #{number} not found.

Available patterns:
{list_of_patterns}

Run /analyze-prompts to refresh pattern list.
```

**Command name conflict**:
```
⚠️ Command "/{name}" already exists.

Options:
1. Choose a different name
2. Overwrite existing command
```

**No Context7 results**:
```
ℹ️ Could not find official documentation for {tech}.

Proceeding with plugin rules and historical patterns only.
```

## Usage Examples

```bash
# Create template from pattern #1
/create-template 1

# Create with custom name
/create-template 2 --name=quick-review

# Interactive selection
/create-template
```

## Notes

- Templates are saved to `generated-commands/` directory
- Edit generated files to customize behavior
- Run `/analyze-prompts` to discover new patterns
- Criteria layers: Plugin > Docs > History
