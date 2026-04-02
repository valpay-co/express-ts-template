Perform JIRA operations using the Atlassian MCP tools.

**Inputs:**
Prompt user for which project.

**Constants:**
- Cloud ID: `9a214be1-a314-4d3d-8471-b7e5fb3b0406`

**Usage:** `/jira <command> [args]`

Parse `$ARGUMENTS` to determine the command and arguments.

---

## Commands

### `create` — Create a new issue
**Syntax:** `/jira create`
**Steps:**
1. Ask the user for: Summary (required), Issue Type (Task/Bug/Enhancement/Hotfix/Epic), Description (optional), Complexity (1–5), Discipline, Assignee (optional, name to search).
2. If assignee provided, call `lookupJiraAccountId` to resolve their account ID.
3. Call `createJiraIssue` with cloudId, project key `VK`, and all collected fields. Map Complexity to `customfield_10230` and Discipline to `customfield_10231`.
4. Print the created issue key and URL.

---

### `update` — Update an existing issue
**Syntax:** `/jira update <ISSUE-KEY>`
**Steps:**
1. If issue key not provided in args, ask for it.
2. Ask which fields to update: Summary, Description, Complexity, Discipline, Assignee.
3. Call `editJiraIssue` with only the changed fields.
4. Confirm what was updated.

---

### `transition` — Move issue to a new status
**Syntax:** `/jira transition <ISSUE-KEY> [status]`
**Steps:**
1. If issue key not in args, ask for it. If target status not in args, ask.
2. Call `getTransitionsForJiraIssue` to list available transitions.
3. Find the transition matching the requested status (case-insensitive).
4. Call `transitionJiraIssue` with the transition ID.
5. Print the issue key and new status.

---

### `comment` — Add a comment
**Syntax:** `/jira comment <ISSUE-KEY> [comment text]`
**Steps:**
1. If issue key not in args, ask. If comment text not in args, ask user to type it.
2. Call `addCommentToJiraIssue`.
3. Confirm comment was added.

---

### `view` — View an issue
**Syntax:** `/jira view <ISSUE-KEY>`
**Steps:**
1. If issue key not in args, ask.
2. Call `getJiraIssue` with cloudId and issue key.
3. Display: Key, Summary, Status, Assignee, Issue Type, Priority, Complexity, Discipline, Description, and last 3 comments if any.

---

### `search` — Search issues
**Syntax:** `/jira search <query>`
**Steps:**
1. If no query in args, ask.
2. If query looks like JQL (contains `=`, `AND`, `OR`, `ORDER BY`), use it directly.
3. Otherwise build: `project = VK AND text ~ "<query>" ORDER BY updated DESC`
4. Call `searchJiraIssuesUsingJql` with max 15 results.
5. Display a table: Key | Summary | Status | Assignee.

---

### No command / help
If `$ARGUMENTS` is empty or `help`, show the available commands with one-line descriptions:
- `create` — Create a new issue
- `update <KEY>` — Edit fields on an issue
- `transition <KEY> <status>` — Move to a new status
- `comment <KEY>` — Add a comment
- `view <KEY>` — View issue details
- `search <query>` — Search by text or JQL

---

Now parse `$ARGUMENTS` and execute the appropriate command above.
