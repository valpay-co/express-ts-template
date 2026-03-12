---
name: epic-tracker
description: Track progress on project epics and tasks. Use to check status.
disable-model-invocation: false
---

# Epic Progress Tracker

Track progress on project epics and tasks.

## Instructions

1. Read project planning docs (e.g., docs/plan/)
2. Search the codebase for implemented features matching each epic
3. Analyze commit history for relevant work
4. Check test coverage for completed tasks

## Output Format:

### Epic Status Overview

| Epic ID | Epic Name | Status | Progress | Blockers |
|---------|-----------|--------|----------|----------|
| EP-01 | [Name] | Complete / In Progress / Not Started | X/Y tasks | [Issues] |

### Detailed Task Breakdown

**EP-XX: [Epic Name]**
- T-XXX: [Task name] - Completed (commit: abc123)
- T-XXX: [Task name] - In Progress
- T-XXX: [Task name] - Not Started
- T-XXX: [Task name] - Blocked ([reason])

### Timeline Health

- Epics on track: X/N
- Epics at risk: X/N
- Epics blocked: X/N

### Recommendations

[What should be prioritized next to stay on schedule]
