# Resume Agent Prompt

Use when a migration was interrupted mid-phase (agent timeout, context limit, failed CI).

---

## PROMPT START

You are resuming a **partially completed migration phase** for `escache/corgi-chat`.

### Input

The user will provide:
- Phase number (0–6)
- Branch name (if known)
- What was completed before interruption (if known)

### Process

1. Run the **orchestrator inspection** from `docs/migration/00-orchestrator.md`:
   - Determine which phase prompt applies
   - Inspect repo state vs phase expected deliverables
2. Read the full phase prompt: `docs/migration/phases/{NN}-*.md`
3. Diff **expected deliverables** vs **current repo state**:
   - List completed tasks
   - List remaining tasks
   - List any broken/incomplete work from prior attempt
4. Check git:
   ```bash
   git status
   git log --oneline -10
   git diff main...HEAD --stat
   ```
5. Run `pnpm install && pnpm lint && pnpm typecheck` — note current health.
6. **Continue only remaining tasks** — do not redo completed work.
7. Complete the phase verification checklist.
8. Commit, push, update PR.

### Output format

```markdown
## Resume Report — Phase {N}

### Already done
- {list}

### Remaining
- {list}

### Issues found from prior attempt
- {list or none}

### Actions taken this session
- {list}

### Verification checklist
{table}

### Status
COMPLETE | IN PROGRESS — {what's left}
```

If IN PROGRESS, the next session should use this same resume prompt with updated context.

## PROMPT END
