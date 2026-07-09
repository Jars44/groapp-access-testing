# Memory Schema

> Defines entity types, relation types, and storage structure for `.agent/memory/entities/`

## Storage Strategy

**Per-entity files** — each entity is a separate JSON file. Prevents concurrent write conflicts.

```text
.agent/memory/entities/
├── FileUploader.json         ← Researcher creates, Builder updates, Reflector annotates
├── UploadButton.json         ← Researcher creates
├── LoginPage.json            ← Researcher creates, QA adds test_run
├── media-api.json            ← Researcher creates
├── auth-route.json           ← Researcher creates
└── relations.json            ← Lead writes at teardown only
```

## Entity File Structure

```json
{
  "name": "MediaPage.FileUploader",
  "entityType": "component-selector",
  "writes": [
    {
      "agent": "researcher",
      "timestamp": "2026-07-09T00:00:00Z",
      "action": "create"
    },
    {
      "agent": "builder",
      "timestamp": "2026-07-09T00:30:00Z",
      "action": "observation_update"
    }
  ],
  "observations": [
    {
      "content": "Has ZERO data-testid",
      "addedBy": "researcher",
      "timestamp": "2026-07-09T00:00:00Z",
      "sourceFile": "src/features/media/components/FileUploader.tsx",
      "sourceLine": 42
    },
    {
      "content": "Uses aria-label='file uploader' for test selector",
      "addedBy": "builder",
      "timestamp": "2026-07-09T00:30:00Z",
      "sourceFile": "src/tests/pages/media/media.page.ts",
      "sourceLine": 46
    }
  ],
  "annotations": [
    {
      "type": "critique",
      "severity": "warning",
      "agent": "reflector",
      "content": "No testid — ask dev to add data-testid='file-uploader'",
      "timestamp": "2026-07-09T01:00:00Z"
    }
  ],
  "test_results": {
    "tc-01": {
      "status": "pass",
      "run": 1,
      "timestamp": "2026-07-09T02:00:00Z"
    },
    "tc-02": {
      "status": "pass",
      "run": 1,
      "timestamp": "2026-07-09T02:00:00Z"
    },
    "lastRun": "2026-07-09T02:00:00Z"
  }
}
```

## Relations File Structure

**File:** `.agent/memory/entities/relations.json`

```json
{
  "relations": [
    {
      "from": "MediaPage.FileUploader",
      "to": "MediaPage.UploadButton",
      "relationType": "contains",
      "createdBy": "lead",
      "timestamp": "2026-07-09T03:00:00Z"
    }
  ]
}
```

## Entity Types

| Type                 | Purpose                      | Examples                                     |
| -------------------- | ---------------------------- | -------------------------------------------- |
| `component-selector` | Component DOM structure      | MediaPage.FileUploader, LoginPage.EmailInput |
| `api-endpoint`       | REST API contracts           | POST /media/v1/media, GET /user/profile      |
| `route`              | Frontend route definitions   | /company/profile, /auth/login                |
| `test-data`          | Test data patterns           | CompanyCreatePayload, UserProfile            |
| `selector-pattern`   | Reusable selector strategies | aria-role pattern, testid fallback           |

## Relation Types

| Type        | Meaning                | Example                          |
| ----------- | ---------------------- | -------------------------------- |
| `contains`  | Parent-child component | FileUploader contains Button     |
| `uses`      | Dependency             | LoginPage uses AuthAPI           |
| `triggers`  | Action-effect          | ClickLogin triggers navigate     |
| `requires`  | Prerequisite           | UserProfile requires AuthContext |
| `validates` | Test covers            | spec validates component         |

## Write Ownership

| Agent         | Can Write To                             | Cannot Write To                          |
| ------------- | ---------------------------------------- | ---------------------------------------- |
| Researcher    | Create new entity files in its domain    | Other agents' files                      |
| Builder       | Append observations to existing entities | Delete observations, create new entities |
| Reflector     | Append annotations                       | Delete annotations, create entities      |
| QA Gatekeeper | Append test_results                      | Modify observations                      |
| Lead          | Write relations.json at teardown         | Modify entity files                      |

## Conflict Prevention Rules

1. **One entity per file** — no shared entity files
2. **Append-only** — never delete another agent's data
3. **Write history tracked** — every write logged with agent + timestamp
4. **Relations separate** — Lead writes relations.json at teardown only
5. **Evidence required** — all observations need sourceFile + sourceLine

## Query Patterns

```bash
# Search by entity name
ls .agent/memory/entities/ | grep FileUploader

# Read specific entity
cat .agent/memory/entities/FileUploader.json

# Read all entities of type
grep -l '"entityType": "component-selector"' .agent/memory/entities/*.json

# Read relations
cat .agent/memory/entities/relations.json

# Search by observation content
grep -r "data-testid" .agent/memory/entities/
```

## Memory Lifecycle

```text
Discovery → Researcher creates entity files (component selectors, routes, APIs)
Build     → Builder appends observations to existing entities
Reflect   → Reflector appends annotations (critique findings)
Verify    → QA appends test_results (pass/fail/run counts)
Teardown  → Lead writes relations.json, reviews for stale data
```
