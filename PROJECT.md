## OneProductIQ Project - Configuration

This file guides Agent's behavior throughout the OneProductIQ development journey.

---

## Project Overview


**OneProductIQ** is a scalable SaaS platform that auto-enriches e-commerce product listings.

**Upload product image** → AI extracts metadata (category, color, material, description, tags) → Searchable product database.

**For:** Fashion/lifestyle e-commerce sellers who manually spend 2-4 hours per product.

**Value:** 80% faster product listing + better SEO = more sales.

**Tech:** FastVLM (vision-language model) + PostgreSQL + React frontend + RunPod GPU workers.


    Image Upload → Queue → GPU Worker (RunPod) → FastVLM → Parser → PostgreSQL → Search/Analytics


**Stack Summary:**
- Frontend: React + Vite + Tailwind
- Backend: FastAPI + SQLAlchemy
- Queue: Redis + Celery
- Database: PostgreSQL
- ML: FastVLM (ONNX) + EfficientSAM3
- Deployment: Docker + RunPod
- Monitoring: CloudWatch + Grafana

---

## Working Philosophy

### One Step at a Time
- **No mega-tasks.** Break work into small, testable chunks.
- **Verify before moving forward.** Each step should have a clear acceptance criterion.
- **Ask before assuming.** If unclear, clarify the current state first.

### Code Style Rules
- **Clean and readable.** Mid-level programmer should understand without comments.
- **No premature optimization.** Fix logic first, optimize later.
- **Avoid hallucination.** Don't add "nice-to-have" features unless explicitly requested.
- **DRY principle.** Reuse existing code, don't duplicate.

### File Creation Policy
- **Create only when necessary.** Ask: "Does this file need to exist?"
- **One responsibility per file.** Don't bloat files with unrelated code.
- **Follow folder structure.** Respect existing project organization.

### Testing Philosophy
- **Don't run tests automatically.** Only run tests when explicitly asked: "Test this" or "Verify this works."
- **Manual verification preferred.** For quick tasks, verify by inspection or simple manual checks.
- **Integration tests matter.** When testing, focus on end-to-end workflows.
- **Manual verification.** After making major changes or development, mention the steps to perform verification.

---

## Essential Skills to Use

### When Starting a Phase
```
/caveman:explore
- Read existing files in the phase folder
- Check MEMORY.md for context
- Review todo.md for dependencies
- Ask: "What does the user want here?"
```

### When Writing Code
```
/caveman:write
- Write 1 function at a time
- Inline comments for non-obvious logic
- Return meaningful error messages
- No more than 50 lines per function
```

### When Debugging
```
/caveman:debug
- Check logs/errors first
- Isolate the problem (divide and conquer)
- Ask clarifying questions
- Propose minimal fix
```

### When Documenting
```
/caveman:document
- Keep docs brief (< 100 words)
- Use examples, not explanations
- Focus on "how to use" not "how it works"
- Update MEMORY.md, todo.md, lessons.md
```

### When Creating Files
```
/caveman:create
- Ask: "Is this file necessary?"
- Create ONLY if it solves a real problem
- Include minimal boilerplate
- Document in MEMORY.md
```

---

## File Management Standards

### MEMORY.md (Task History & Environment)
**Update after each major task completion.**

```markdown
## Current Phase: [Phase Number/Name]
## Last Completed: [Date]
## Status: [In Progress / Blocked / Complete]

### Recent Changes
- [Change 1]
- [Change 2]

### Environment Setup
- FastVLM version: X.X.X
- PostgreSQL: X (running locally)
- Redis: X (running locally)
- Node version: X

### Known Issues
- [Issue 1]: [Status]
```

### todo.md (Task Planning)
**Track what needs to be done in current phase.**

```markdown
## Phase [Number]: [Name]

### Current Sprint
- [ ] Task 1: [description]
- [ ] Task 2: [description]
- [x] Task 3: [completed]

### Blockers
- None / [Describe blocker]

### Next Steps
1. Task 4
2. Task 5
```

### lessons.md (Knowledge Base)
**Record solutions, patterns, and discoveries.**

```markdown
## FastVLM Performance
- **Problem**: Inference was slow
- **Solution**: Batch images (4-8 per pass)
- **Impact**: 3x speedup

## PostgreSQL Indexing
- Always index user_id for multi-tenant queries
- JSONB indexes: use GIN operator
```

---

## Phase Workflow Template

### Before Starting Phase
1. Use `/caveman:explore` to check what exists
2. Update `MEMORY.md` with phase context
3. List tasks in `todo.md`
4. Ask: "What's the single smallest task to start?"

### During Phase
1. Pick ONE task from `todo.md`
2. Write code incrementally (1 function at a time)
3. Verify it works (manually or with simple check)
4. Update `todo.md` (mark as complete)
5. Move to next task

### After Phase
1. Update `MEMORY.md` with completion status
2. Document key learnings in `lessons.md`
3. Clean up any temporary files
4. List blockers/dependencies for next phase
5. Mention the steps to perform manual testing, verification and confirmation.

---


## DO's and DON'Ts

### DO
- ✅ Ask clarifying questions
- ✅ Write one function at a time
- ✅ Test locally before claiming done
- ✅ Update MEMORY.md after tasks
- ✅ Keep code <50 lines per function
- ✅ Use existing patterns in codebase
- ✅ Explain trade-offs (fast vs. clean, etc.)

### DON'T
- ❌ Write 500-line functions
- ❌ Add "future-proofing" features
- ❌ Create unnecessary abstractions
- ❌ Run tests automatically
- ❌ Implement features not requested
- ❌ Ignore errors silently
- ❌ Complicate simple tasks

---

## Quick Reference: Phase Checklist

**Before each phase:**
```
□ Read MEMORY.md (what was done before)
□ Read todo.md (what needs doing)
□ Ask user: "Ready to start Phase X?"
□ Use /caveman:explore to check files
```

**During each task:**
```
□ Break into 1-step subtasks
□ Write code (1 function at a time)
□ Verify manually
□ Update todo.md
```

**After each phase:**
```
□ Update MEMORY.md (status + changes)
□ Document in lessons.md (learnings)
□ List any blockers
□ Check dependencies for next phase
```

---

## Example: How This Works in Practice

**User asks:** "Start Phase 1: FastVLM Testing Dashboard"

**Claude does:**
1. `/caveman:explore` → Check if Phase 1 folder exists, read MEMORY.md
2. Ask: "Current state: nothing exists. Shall I start with React setup or image upload component first?"
3. User: "React setup first"
4. `/caveman:write` → Create minimal Vite project (just the basics)
5. Update `todo.md`: Mark "React setup" as complete
6. Ask: "Next: image upload component?"

**Later in phase:**
7. Write `ImageUpload.tsx` (1 component)
8. Verify it displays (manual check, not test)
9. Update `MEMORY.md`: Record that Vite + React is working
10. Move to next task

---

## When Stuck

**If unclear on what to do:**
```
1. Check MEMORY.md → "What's the context?"
2. Check todo.md → "What's the next task?"
3. Use /caveman:explore → "What files exist?"
4. Ask the user → "Should I do X or Y?"
```

**If code doesn't work:**
```
1. Check error message (don't ignore it)
2. Isolate: Run smallest reproducible example
3. Ask: "Is this expected?" (maybe it's a config issue)
4. Propose minimal fix
5. Document in lessons.md
```

**If unsure about design:**
```
1. Look for similar code in project
2. Copy the pattern
3. Ask: "Does this match your style?"
4. Adjust if needed
```

---

## Final Principles

1. **Clarity over cleverness.** A mid-level programmer should understand without struggling.
2. **Small over complete.** 1 working task beats 10 half-done tasks.
3. **Ask over assume.** If unsure, ask the user.
4. **Test before claiming done.** Not automated tests—just verify it works.
5. **Document as you go.** Update MEMORY.md, don't batch updates.
6. **Learn from issues.** Add solutions to lessons.md for future reference.

---

