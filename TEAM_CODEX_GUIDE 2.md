# Loredrop Team Codex Guide

Paste the **Shared project prompt** into every teammate's Codex task, then append that teammate's assignment from the **Team assignments** section.

## Shared project prompt (paste into all four Codex tasks)

```text
You are one of four engineers collaborating on Loredrop, a local-first creative workspace for capturing lore in a list, arranging relationships on a canvas, and turning selected material into polished writing in a studio.

Repository baseline
- React 19 + TypeScript + Vite 6.
- React Router 7 with /list, /canvas, and /studio routes.
- The current prototype keeps the shell and placeholder routes in src/main.tsx and global styling in src/styles.css.
- Do not add a backend, authentication, cloud sync, or a state-management library unless the team explicitly agrees.

MVP product contract
- List: create, edit, tag, search/filter, select, and delete lore entries.
- Canvas: arrange lore entries as nodes and create simple labeled relationships.
- Studio: compose a document from selected lore and edit/export the result.
- Data is local-first. Use a shared typed repository API backed by localStorage; UI code must not access localStorage directly.
- All three workspaces use the same LoreEntry IDs and shared data model.

Shared data contract
- LoreEntry: id, title, body, tags, createdAt, updatedAt.
- LoreRelation: id, sourceId, targetId, label.
- StudioDocument: id, title, body, loreEntryIds, createdAt, updatedAt.
- IDs are strings; timestamps are ISO-8601 strings; tags are trimmed, unique strings.
- Keep these interfaces in one shared module. Coordinate before changing their shape.

Architecture and file ownership
- src/app: app composition, routes, and shell.
- src/components: reusable presentational components.
- src/features/list, src/features/canvas, src/features/studio: feature-owned UI and logic.
- src/data: types, seed data, persistence, and repository functions.
- src/styles: tokens, global/reset styles, and shared component styles. Feature-specific styles stay with their feature when practical.
- Prefer named exports. Keep components focused and split a file when it develops multiple responsibilities.
- Never import one feature's internal module from another feature. Promote genuinely shared code to src/components, src/data, or src/lib.

TypeScript and React conventions
- Preserve strict TypeScript; do not use any, @ts-ignore, or non-null assertions to bypass a design problem.
- Use function components and hooks. Do not introduce class components.
- Keep state as close as possible to its owner; derive values instead of duplicating state.
- Use semantic HTML, explicit labels, keyboard-accessible controls, visible focus states, and useful empty/error states.
- Avoid premature abstractions. Extract shared code only after the common contract is clear.
- User-facing mutations must be explicit and recoverable where reasonable; confirm destructive bulk actions.

Visual language
- Tone: quiet, editorial, warm, and focused—not a generic admin dashboard.
- Preserve the existing palette direction: ink green, warm paper, muted green text, and amber/terracotta accents.
- Define reusable CSS custom properties for color, spacing, radii, shadows, typography, and layout widths; do not scatter new hex values.
- Use an 8px spacing rhythm, restrained radii, clear hierarchy, and subtle borders before shadows.
- Every workspace must work at 320px width and at desktop sizes. Avoid fixed content widths that overflow.
- Motion is optional, brief, and must respect prefers-reduced-motion.

Quality bar
- Run npm run build before handing off. Do not claim completion if it fails.
- Add focused tests only if a test setup exists or your assignment explicitly establishes it; do not independently add competing test stacks.
- Manually check the changed route at desktop and mobile widths, keyboard navigation, empty state, populated state, and persistence after reload.
- Keep console output clean and do not leave dead code, commented-out experiments, placeholder copy, or generated artifacts.

Git and collaboration
- Work on branch codex/<assignment-name> and only edit files needed for your assignment.
- Before editing a shared contract or another teammate's owned area, send the proposed change and reason to the team.
- Make small commits with imperative messages, e.g. "Add lore repository API".
- Do not reformat unrelated files, rewrite another teammate's work, or use destructive Git commands.
- Rebase/update from the agreed integration branch before handoff, resolve only conflicts you understand, then rerun npm run build.
- Handoff must include: outcome, files changed, data/API contracts added or changed, verification performed, known limitations, and integration order/dependencies.

Definition of done
- The assigned user flow works end to end without console errors.
- Shared contracts are honored and no feature reaches around the repository API.
- Loading/empty/error/destructive states relevant to the feature are handled.
- UI is responsive and keyboard usable.
- npm run build passes.
- The handoff notes identify any follow-up rather than silently expanding scope.

Work only on the assignment appended below. First inspect the repository and existing changes, state a concise plan, then implement and verify. If the assignment conflicts with the current repository state, preserve existing work and report the conflict before making a broad change.
```

## Team assignments

### Teammate 1 — Foundation and integration owner

**Branch:** `codex/foundation`

Append this assignment:

```text
Assignment: Foundation and integration.

Own the shared application foundation. Refactor the single-file prototype into the agreed folder structure; create the app shell and route composition; define design tokens; add the shared TypeScript data contracts, safe seed data, and a localStorage-backed repository API. The repository must tolerate missing or malformed stored data and expose typed CRUD functions without coupling to a feature UI. Provide a lightweight subscription/change-notification mechanism so multiple routes can observe updates in the same tab. Keep the three route screens functional as placeholders or import the feature screens if they already exist.

Also act as integration owner: publish the shared contract early, review proposed contract changes, integrate the other three branches in dependency order, and run the final build/smoke check. Do not implement the feature-rich List, Canvas, or Studio screens.

Primary ownership: src/app/**, src/data/**, src/styles/**, and shared configuration.
Deliver first: types and repository API, so the feature branches can target a stable contract.
```

Acceptance checks:

- Refreshing the app preserves repository changes.
- Malformed local storage falls back safely instead of crashing.
- Navigation and responsive shell work on all three routes.
- Shared colors/spacing are tokens rather than repeated literals.

### Teammate 2 — List workspace

**Branch:** `codex/list-workspace`

Append this assignment:

```text
Assignment: List workspace.

Build the /list MVP using the shared LoreEntry repository contract. Implement a useful empty state, entry creation, inline or form-based editing, deletion with confirmation, tag entry, text search, tag filtering, selection, and a clear detail/edit experience. Keep filter state local to the feature. Sorting should be deterministic, defaulting to most recently updated. Make the main list and controls fully keyboard accessible and responsive.

Do not edit the repository implementation or app shell unless integration requires a tiny import/export change; propose contract gaps to the foundation owner instead. Do not build Canvas or Studio behavior.

Primary ownership: src/features/list/**.
Expected public export: a ListWorkspace component that the route layer can render.
```

Acceptance checks:

- A user can create, find, filter, edit, and delete an entry.
- Tags are trimmed and duplicates are not displayed.
- Empty search results are distinct from an empty collection.
- Selection remains sensible when the selected entry is deleted or filtered out.

### Teammate 3 — Canvas workspace

**Branch:** `codex/canvas-workspace`

Append this assignment:

```text
Assignment: Canvas workspace.

Build the /canvas MVP using shared LoreEntry and LoreRelation contracts. Show lore entries as movable nodes on a bounded workspace, persist node positions through a feature-owned persistence adapter, allow creating and deleting simple labeled relationships, and provide a readable relationship list or inspector. Include empty guidance when no lore exists. Support pointer interaction plus a keyboard-accessible alternative for selecting/moving or relating nodes; do not make drag-and-drop the only path.

Use platform APIs and simple React/CSS for the MVP. Do not add a graph/diagram dependency without team agreement. Do not edit the shared repository or shell beyond a tiny integration export; raise contract gaps to the foundation owner.

Primary ownership: src/features/canvas/**.
Expected public export: a CanvasWorkspace component that the route layer can render.
```

Acceptance checks:

- Existing lore appears without duplicating List-owned data.
- Node positions survive reloads and remain inside the usable canvas.
- Relationships cannot reference missing entries or create accidental exact duplicates.
- Core relationship actions are usable without a mouse.

### Teammate 4 — Studio workspace and release QA

**Branch:** `codex/studio-workspace`

Append this assignment:

```text
Assignment: Studio workspace and release QA.

Build the /studio MVP using shared StudioDocument and LoreEntry contracts. Let users create/open a document, attach and remove lore references, insert selected lore content into an editable draft, edit title/body, autosave locally with a visible saved/dirty state, and export the current document as a plain-text or Markdown download. Clearly separate attached reference material from the editable draft and handle missing/deleted lore references gracefully.

Additionally own the release smoke-test checklist: after integration, verify the end-to-end path (create lore in List, use it in Canvas, attach it in Studio, reload, and confirm persistence), responsive behavior, keyboard navigation, and console cleanliness. Report issues to the owning teammate; only fix cross-feature issues with their coordination.

Primary ownership: src/features/studio/** and docs/RELEASE_CHECKLIST.md.
Expected public export: a StudioWorkspace component that the route layer can render.
```

Acceptance checks:

- Documents and lore attachments persist after reload.
- Autosave status accurately reflects saved versus pending edits.
- Export uses a sanitized filename and contains the current title/body.
- Missing references do not crash the editor.

## Integration order

1. Teammate 1 lands the folder structure, tokens, data types, and repository API.
2. Teammates 2–4 update/rebase onto that foundation and finish their feature branches in parallel.
3. Teammate 1 integrates List, Canvas, then Studio, resolving only route/export and shared-style conflicts.
4. Teammate 4 runs the release checklist against the integrated branch.
5. Each owner fixes issues in their area; Teammate 1 runs `npm run build` and the final smoke check.

## Decisions requiring team agreement

Pause and record a decision before changing any of these:

- Shared data interface fields or persistence keys/migrations.
- Adding a runtime dependency or test framework.
- Replacing the router, build tool, styling approach, or local-first architecture.
- Changing global navigation, design tokens, or route URLs.
- Expanding the MVP to authentication, collaboration, cloud sync, AI generation, or a backend.

