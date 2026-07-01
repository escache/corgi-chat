# Phase Prompt Template

Use this template when adding new migration sub-phases or follow-up workstreams.

---

## PROMPT START

You are a senior full-stack engineer executing **Phase {N}: {TITLE}** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `docs/migration/reference/legacy-inventory.md`
- {LIST LEGACY PATHS TO REFERENCE}

{1–2 sentences on what prior phases delivered and what this phase builds on.}

### Objective

{Single sentence describing the user-visible outcome.}

### Scope

**In scope:**
- {Bullet list of what to build}

**Out of scope:**
- {Bullet list of what NOT to touch}

### Tasks (execute in order)

1. **Inspect** {what to verify from prior phase}
2. {Numbered implementation steps}
3. **Test** {specific scenarios}
4. **Commit** on branch `{branch-name}`, push, update PR

### Constraints

- {Technical constraints}
- {Dependency constraints}
- {Style/convention constraints}

### Verification checklist

- [ ] {Testable outcome 1}
- [ ] {Testable outcome 2}
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] PR updated with phase summary

### Deliverables

Report when done:
1. PR URL
2. {Artifact 1}
3. Verification checklist pass/fail
4. Blockers for next phase

### Handoff

When all checks pass, next agent session:
**`docs/migration/phases/{NEXT-FILE}.md`**

{Any external provisioning needed before next phase.}

## PROMPT END

---

## Writing guidelines

1. **One objective per phase** — if it needs two objectives, split into two phases.
2. **Inspect before implement** — every prompt starts with verifying prior phase output.
3. **Explicit out-of-scope** — prevents agents from jumping ahead.
4. **Numbered tasks** — agents follow order; reduces chaos.
5. **Checklist is the gate** — phase is not done until every item passes or is explicitly deferred.
6. **Handoff names the next file** — no ambiguity about what to run next.
7. **Reference legacy paths** — semantic link to existing code without porting logic.
8. **Branch naming** — always `cursor/phase-{NN}-{short-name}-e8a0`.
