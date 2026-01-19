## 🔍 React Best Practices Review

**Reviewed by**: [react-best-practices-review](https://github.com/Junhan2/react-best-practices-review) plugin
**Confidence threshold**: ≥{{threshold}}%

### 📊 Summary

| Level | Count | Focus Area |
|-------|-------|------------|
{{#if critical_count}}| 🔴 CRITICAL | {{critical_count}} | {{critical_areas}} |{{/if}}
{{#if high_count}}| 🟠 HIGH | {{high_count}} | {{high_areas}} |{{/if}}
{{#if medium_count}}| 🟡 MEDIUM | {{medium_count}} | {{medium_areas}} |{{/if}}

{{#if no_issues}}
### ✅ No Issues Found

This PR passes the React Best Practices review! No issues with confidence ≥{{threshold}}% were detected.

<details>
<summary>What was checked</summary>

- ✅ Async waterfalls and sequential requests
- ✅ Bundle size and code splitting
- ✅ Server component patterns
- ✅ Client data fetching patterns
- ✅ Unnecessary rerenders
- ✅ React patterns and hooks

</details>

{{else}}

---

{{#if critical_issues}}
### 🔴 Critical Issues (Must Fix)

{{#each critical_issues}}
<details>
<summary>🔴 {{title}} in <code>{{file}}</code> (Confidence: {{confidence}}%)</summary>

**Location**: [{{file}}:{{line}}]({{file_url}})

**Issue**: {{description}}

**Current Code**:
```{{language}}
{{current_code}}
```

**Suggested Fix**:
```{{language}}
{{suggested_code}}
```

**Impact**: {{impact}}

</details>

{{/each}}
{{/if}}

{{#if high_issues}}
---

### 🟠 High Priority Issues

{{#each high_issues}}
<details>
<summary>🟠 {{title}} in <code>{{file}}</code> (Confidence: {{confidence}}%)</summary>

**Location**: [{{file}}:{{line}}]({{file_url}})

**Issue**: {{description}}

**Suggested Fix**:
```{{language}}
{{suggested_code}}
```

**Impact**: {{impact}}

</details>

{{/each}}
{{/if}}

{{#if medium_issues}}
---

### 🟡 Medium Priority Issues

{{#each medium_issues}}
- **{{title}}** in `{{file}}:{{line}}` - {{brief_description}}
{{/each}}
{{/if}}

---

### ✅ Action Items

{{#each action_items}}
- [ ] {{task}} ([{{file}}:{{line}}]({{file_url}}))
{{/each}}

{{/if}}

---

<details>
<summary>📋 Review Details</summary>

**Files Reviewed**: {{files_count}}
**Agents Used**: 6 specialized reviewers
**Generated**: {{timestamp}}

| Agent | Focus | Issues |
|-------|-------|--------|
| async-waterfall-hunter | Request waterfalls | {{async_count}} |
| bundle-analyzer | Bundle size | {{bundle_count}} |
| server-performance-reviewer | Server performance | {{server_count}} |
| client-data-reviewer | Client data fetching | {{client_count}} |
| rerender-detector | Rerenders | {{rerender_count}} |
| react-pattern-analyzer | React patterns | {{pattern_count}} |

</details>

---

<sub>
💡 Run <code>/react-review</code> locally for detailed analysis<br>
📚 View all rules: <code>/react-rules</code><br>
🔄 Re-run after fixes to verify
</sub>
