# Skill: Memory Management

> Cross-session knowledge persistence via `.agent/memory/`. Four memory types mapped to codebase patterns.

## When to Use This Skill

- Starting a task where prior sessions exist with findings
- Need to persist knowledge across sessions (selectors, API contracts, test data)
- Need to query historical findings (why does selector X not work? why is route Y blocked?)
- Building a knowledge graph of codebase patterns

## Memory Types

| Type              | Storage                       | When                                        |
| ----------------- | ----------------------------- | ------------------------------------------- |
| In-context        | Current conversation          | Single session tasks                        |
| External (vector) | `.agent/memory/` entity files | Knowledge that must persist across sessions |
| Episodic          | `.agent/reports/` summaries   | Summarized session history                  |
| Procedural        | `.agent/settings.json`        | Learned rules for this codebase             |

## Architecture

```
.agent/memory/
├── schema.md           — entity/relation schemas
├── entities.json       — current knowledge graph
└── README.md           — human overview
```

## Usage Patterns

### 1. Create Knowledge Entities

When discovering a pattern that persists across sessions:

```
→ Create entity: "MediaPage.FileUploader"
  entityType: "component-selector"
  observations: [
    "Has ZERO data-testid",
    "Use role=button aria-label for file selection",
    "Use input[type=file] for upload",
    "Located at src/features/media/components/FileUploader.tsx:42"
  ]
```

### 2. Create Relations

When linking entities:

```
→ Create relation:
  from: "MediaPage.FileUploader"
  to: "MediaPage.UploadButton"
  relationType: "contains"
```

### 3. Add Observations

When findings accumulate:

```
→ Add observations to "MediaPage.FileUploader":
  "Upload triggers POST /media/v1/media",
  "Max file size: 5MB (validated client-side)",
  "Supported formats: jpg, png, gif, webp"
```

### 4. Query Knowledge

When starting a new session:

```
→ Search nodes: "FileUploader selectors"
→ Read entity: "MediaPage.FileUploader"
```

## When NOT to Use Memory

| Situation                          | Use Instead              |
| ---------------------------------- | ------------------------ |
| One-off task                       | In-context conversation  |
| Transient info (current test data) | `data/*.data.ts` factory |
| Code-level concerns                | Constitution 001-005     |
| Current pipeline state             | `.agent/state.json`      |

## Memory Lifecycle

| Phase     | Memory Action                                       |
| --------- | --------------------------------------------------- |
| Discovery | Researcher creates entities for persistent findings |
| Build     | Builder updates observations with new evidence      |
| Verify    | QA Gatekeeper adds test_run evidence                |
| Teardown  | Lead ensures final state persisted to entities      |

## Parallel Memory Writing

Memory writes CAN run parallel with code work:

```text
Researcher writes entities ← parallel → Builder writes POM/specs
Builder adds observations ← parallel → QA runs tests
Lead persists final state ← sequential → After QA completes
```

**Rules:**

1. Each agent writes only its domain entities (researcher → component facts, builder → implementation facts, qa → test results)
2. No concurrent writes to same entity
3. Relations created by Lead at teardown
4. Schema enforced — entities must have `name`, `entityType`, `observations`

## Evidence Format

All memory entries must include source evidence:

```json
{
  "name": "MediaPage.FileUploader",
  "entityType": "component-selector",
  "observations": ["Has ZERO data-testid", "Use role=button aria-label"],
  "evidence": {
    "sourceFile": "src/features/media/components/FileUploader.tsx",
    "sourceLine": 42,
    "discoveredBy": "researcher",
    "discoveredAt": "2026-07-08T00:00:00Z"
  }
}
```

## Integration with Other Skills

| Skill                 | Integration Point                                  |
| --------------------- | -------------------------------------------------- |
| SOP 001 (Test Task)   | Memory queried before research, updated after QA   |
| SOP 002 (Multi-Agent) | Entities written in parallel with code work        |
| SOP 003 (Bugfix)      | Memory consulted for historical failure patterns   |
| Constitution 003      | Anti-hallucination: memory = source-verified facts |
