# Constitution 005 — AI Agent Design Patterns

> 7 patterns that address the failure modes most seen in production agentic systems. Source: LangChain State of AI Agent Engineering Report (2026), Redis.io (2025), Datadog State of AI Engineering (2026).

## Why This Matters

- 57% of AI practitioners run agents in production (LangChain, 2026)
- Reflection pattern alone lifts coding accuracy 80% → 91% (Redis.io, 2025)
- 32% cite output quality as top deployment blocker (LangChain, 2026)
- 69% of LLM input tokens in production are system prompts (Datadog, 2026)

## Pattern 1: Reflection (Implemented)

**What:** Agent critiques its own output before returning. Add self-review step after generation.

**Why:** Single highest-leverage quality improvement. Gains exceed 30 percentage points when paired with external verification (Playwright).

**Implementation:** `docs/personas/reflector.md` — runs after Builder, before QA Gatekeeper.

```text
Generate output → Critique (self or external) → Revise → [loop ≤3] → Return
```

**Evidence in this codebase:**

- `docs/personas/reflector.md` — reflection agent with constitution checklist
- `docs/personas/reviewer.md` — code audit checklist
- SOP 002 Mode C Phase 4 — reflector before QA gatekeeper

---

## Pattern 2: ReAct (Implemented)

**What:** Interleave reasoning traces with tool calls. Think aloud, then act.

**Why:** Produces better decisions. Gives traceable debugging when agent goes wrong.

**Implementation:** `docs/personas/researcher.md` — explores code, thinks through dependencies, acts via glob/grep.

```text
Thought: "I need to check X before doing Y" → Action: call search tool → Observation: result → repeat
```

**Evidence in this codebase:**

- `docs/personas/researcher.md` — reads routes.tsx, traces component, finds selectors
- `docs/personas/builder.md` — ARRANGE → ACT → ASSERT pattern

---

## Pattern 3: Plan-and-Execute (Implemented)

**What:** Separate planner from executor. Planner writes full multi-step plan, executor runs it.

**Why:** Locks in coherent strategy before irreversible actions. Reduces mid-task drift.

**Implementation:** `docs/workflows/001-test-task-sop.md` — Phase 2: Plan before Phase 3: Implement.

```text
Plan (what to build) → Execute (build it) → [replan if step fails]
```

**Evidence in this codebase:**

- `docs/workflows/001-test-task-sop.md` — STEP 3 WRITE PLAN before STEP 4 CREATE POM
- `.agent/plans/test-plan-{feature}.md` — written before builder dispatched

---

## Pattern 4: Tool Use (Implemented)

**What:** Define tools with clear contracts. One purpose, describe failures, return structured data.

**Why:** 69% of production tokens are system prompts (Datadog). Sloppy tool definitions = token waste + bad calls.

**Implementation:** `.agent/mcp.json` + `.agent/settings.json` — persona-scoped tool restrictions.

**Three rules:**

| Rule                   | Detail                                             |
| ---------------------- | -------------------------------------------------- |
| One tool, one purpose  | Compound tools produce unpredictable call patterns |
| Describe failures      | Tell model what to do on error or empty result     |
| Return structured data | Unstructured output forces parsing errors          |

**Evidence in this codebase:**

- `.agent/mcp.json` — universal tool schema (filesystem, terminal, web, browser, memory, task)
- `.agent/settings.json` — per-persona tool allowlists and restrictions
- Researcher restricted to read-only: `read, glob, grep, bash`
- Builder restricted from `playwright_*`, `firecrawl_*`

---

## Pattern 5: Multi-Agent Collaboration (Implemented)

**What:** Run specialized agents in parallel or sequence, each handling its domain.

**Why:** Agentic framework adoption doubled YoY (Datadog, 2026). Coordination overhead only pays at genuine complexity.

**Implementation:** SOP 002 Mode C — parallel researcher sub-agents + parallel QA + summary draft.

```text
Researcher-ROUTES     ← parallel →
Researcher-COMPONENTS ← parallel → Lead aggregates
Researcher-API         ← parallel →
Researcher-VALIDATORS ← parallel →
         ↓
      BUILDER (sequential)
         ↓
PARALLEL: QA GATEKEEPER + LEAD DRAFTS SUMMARY
         ↓
      LEAD TEARDOWN
```

**Evidence in this codebase:**

- SOP 002 Mode C — 3 parallelizable phases documented
- `docs/personas/orchestrator-lead.md` — Mode C as default workflow
- `.agent/tasks/` — per-agent output files prevent concurrent write corruption

---

## Pattern 6: Memory Management (Implemented)

**What:** 4 memory types. Don't stuff everything in context window.

| Type              | Best For              | Limitation             |
| ----------------- | --------------------- | ---------------------- |
| In-context        | Short sessions        | Expensive at scale     |
| External (vector) | Large knowledge bases | Adds latency           |
| Episodic          | Summarized history    | Loses verbatim detail  |
| Procedural        | Learned strategies    | Requires stable system |

**Why:** 69% of tokens already system prompts. Raw history on top = unsustainable + degraded attention.

**Implementation:** `.agent/memory/` — cross-session knowledge graph via memory tools.

**Evidence in this codebase:**

- `.agent/memory/schema.md` — entity/relation schemas for persistent knowledge
- `skills/memory-management/SKILL.md` — when to use each memory type
- `.agent/state.json` — persistent pipeline state across sessions

---

## Pattern 7: Human-in-the-Loop (Implemented)

**What:** Pause at predefined checkpoints for human approval. Audit trails without blocking.

**Why:** 93% of enterprises deploy agents within 2 years (UiPath, 2025). Teams deploying safely identified which decisions need checkpoints.

**Implementation:** QA Gatekeeper blocks on failures. Lead escalates after max retries. User approves plan cleanup.

**Two implementations:**

| Type         | When                     | Example                         |
| ------------ | ------------------------ | ------------------------------- |
| Interrupt    | High-stakes irreversible | Test failure blocks merge       |
| Async-review | Audit trails needed      | Summary generated, user decides |

**Evidence in this codebase:**

- `docs/personas/qa-gatekeeper.md` — blocks on stable failure, flaky test, missing evidence
- SOP 002 — max 3 retries before escalation
- `.agent/plans/test-plan-{feature}.md` — user prompted to keep or delete after summary

---

## Pattern Gap Analysis

| Pattern           | Status         | Evidence                         |
| ----------------- | -------------- | -------------------------------- |
| Reflection        | ✅ Implemented | `reflector.md`, `reviewer.md`    |
| ReAct             | ✅ Implemented | `researcher.md`, `builder.md`    |
| Plan-and-Execute  | ✅ Implemented | SOP 001, test-plan template      |
| Tool Use          | ✅ Implemented | `mcp.json`, `settings.json`      |
| Multi-Agent       | ✅ Implemented | SOP 002 Mode C                   |
| Memory            | ✅ Implemented | `memory/schema.md`, skill        |
| Human-in-the-Loop | ✅ Implemented | `qa-gatekeeper.md`, retry limits |

**All 7 patterns implemented.** No gaps.

---

## Three Laws of Agent Development

1. **Context is the core competency.** Master context engineering — structure docs, trigger handoffs, provide foundational knowledge.
2. **Orchestration moves up the stack.** 2024: individual completions. 2025: single-agent sessions. 2026: AI Coordinator handles everything below intent level.
3. **Democratization accelerates.** Each complexity layer absorbed by orchestration = non-technical users can participate.

Source: Dr. Tali Rezun, "From One Agent to Coding Agent Armies" (Feb 2026).
