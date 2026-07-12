# Loredrop implementation plan

This plan turns the current three-route prototype into a demoable MVP while preserving the ownership agreed in planning.

## Shared product slice

The demo path is: capture lore in List → arrange or relate it in Canvas → select lore as AI context → generate and revise prose → export the result.

The shared contract should be landed before feature integration:

- `LoreEntry`: `id`, `title`, `body`, `tags`, `createdAt`, `updatedAt`.
- `LoreRelation`: `id`, `sourceId`, `targetId`, `label`.
- `GenerationRequest`: generation mode, instruction, tone, target length, and selected lore context.
- `GenerationResult`: generated text, model identifier, request identifier, and generation timestamp.
- The browser calls application endpoints only. It never receives or stores provider API keys.

## Jordan — infrastructure and backend

**Branch:** `codex/infrastructure-backend`

### Phase 1: shared foundation (blocks integration)

- Refactor routing and the shell out of `src/main.tsx` without changing route URLs.
- Define the shared lore types and a local repository boundary.
- Decide and document the backend runtime and local development command.
- Add environment validation and an `.env.example`; keep `.env` and keys ignored.
- Add health and error response conventions.

### Phase 2: generation endpoint (pairs with Stuti)

- Implement `POST /api/generations` using the OpenAI Responses API.
- Accept the request shape documented in `src/features/generation/types.ts`.
- Keep system instructions, model choice, API key, limits, and provider response parsing on the server.
- Reject invalid input, cap instruction/context sizes, add a request timeout, and return the agreed JSON error shape.
- Make the model configurable server-side. Start with a cost-conscious text model that supports the Responses API; do not expose arbitrary model selection to the browser.
- Add basic request logging without logging complete private lore or secrets.

### Phase 3: integration and deployment

- Serve frontend and API from one origin or configure a narrow development proxy.
- Add production build/start instructions and final environment documentation.
- Run the integrated smoke test and own cross-cutting release failures.

### Deliverables and done criteria

- Fresh-clone setup works from documented commands.
- Missing credentials produce a useful server error, not a client crash.
- API keys are absent from built browser assets and Git history.
- Endpoint handles success, provider failure, timeout, invalid payload, and rate-limit responses.

## Stuti — AI generation and exports

**Branch:** `codex/ai-generation`

### Phase 1: generation contract and client (started in this branch)

- Define generation modes: continue writing, draft scene, deepen character, and expand world.
- Define typed request/result/error contracts shared with Jordan.
- Build a fetch client with runtime response validation, cancellation, timeouts, and readable errors.
- Keep provider-specific payloads out of the browser-facing contract.

### Phase 2: generation workflow

- Build the generation workspace state: instruction, tone, target length, lore context, result, loading, error, and cancellation.
- Prevent duplicate submissions and reject empty instructions.
- Allow selected lore to be included as explicit context, with visible size/count limits.
- Support retrying without losing the request and preserve the last successful result when a later attempt fails.
- Add “use in Studio” integration once Studio owns a draft contract.

### Phase 3: export and quality

- Export generated text as Markdown and plain text with sanitized filenames.
- Include title and optional provenance metadata, never secrets or hidden prompts.
- Add focused tests once the team selects a test runner: request validation, error parsing, cancellation, filename sanitization, and export content.
- Maintain an eval set of representative lore prompts and score adherence, continuity, unsupported claims, and tone.

### Deliverables and done criteria

- Generation requests use only the application API and can be cancelled.
- All request states are distinguishable: idle, generating, success, validation error, server error, and cancelled.
- A result can be copied, revised, exported, or sent to Studio without regenerating.
- Exported content matches the currently displayed version.

## Sethu — UI/UX, inputs, and outputs

**Branch:** `codex/ui-ux`

### Phase 1: system and shell

- Turn the existing warm paper/ink palette into shared design tokens.
- Specify typography, spacing, radii, borders, focus states, buttons, fields, panels, dialogs, empty states, toasts, and loading states.
- Produce responsive shell behavior for desktop, tablet, and 320px mobile.
- Define accessibility behavior: landmarks, labels, focus order, keyboard shortcuts, reduced motion, contrast, and announcements.

### Phase 2: core inputs and outputs

- Build reusable, presentational input primitives without embedding feature business logic.
- Create the List capture/edit/search/filter experience.
- Define the Studio layout for lore context, generation controls, generated output, revision, and export.
- Pair with Stuti on component props and state descriptions; Stuti owns API calls and generation state.
- Pair with Miriam on node/edge selection, inspector, empty state, and non-pointer controls.

### Phase 3: responsive and usability pass

- Test populated, empty, loading, error, long-content, and narrow-screen states.
- Ensure destructive actions are clear and recoverable or confirmed.
- Run keyboard-only and screen-reader smoke tests on the full demo path.

### Deliverables and done criteria

- Components consume tokens and have visible hover, active, disabled, focus, error, and loading states.
- No feature requires a mouse or relies on color alone.
- Long lore and generated text wrap without breaking layout.

## Miriam — Canvas

**Branch:** `codex/canvas`

### Phase 1: canvas model and rendering

- Render shared lore entries as nodes using their stable IDs.
- Define feature-owned persisted node positions and viewport state.
- Keep node position data separate from lore content.
- Add pan/zoom only after selection and basic positioning work reliably.

### Phase 2: relationships and inspection

- Create, label, select, and delete relationships between valid entries.
- Prevent self-links and exact duplicates unless the team explicitly chooses to allow them.
- Provide a node/relationship inspector and readable empty guidance.
- Provide keyboard alternatives for positioning and relationship creation.

### Phase 3: AI context handoff

- Expose a selection contract returning lore entry IDs, not copied lore objects.
- Add “Generate from selection,” routing selected IDs into Stuti’s generation workflow.
- Handle lore deletion by removing or flagging dangling canvas state safely.

### Deliverables and done criteria

- Positions and relationships survive reloads.
- Canvas remains usable with zero, one, and many lore entries.
- Selected IDs can be handed to generation without duplicating source data.
- Core operations work with keyboard controls.

## Milestones and integration order

### Milestone 1 — contracts and skeleton

1. Jordan lands shared lore contracts, runtime choice, and route structure.
2. Stuti and Jordan agree on the generation HTTP contract.
3. Sethu lands design tokens and component interfaces.
4. Miriam lands the canvas state/selection contract.

### Milestone 2 — vertical slices in parallel

- Jordan: persistence and a stubbed generation endpoint.
- Stuti: request lifecycle, generation screen integration, and exports.
- Sethu: List and shared input/output components.
- Miriam: persisted nodes and relationships.

### Milestone 3 — real AI and cross-feature flow

- Jordan connects the server endpoint to OpenAI.
- Stuti verifies real response/error/cancellation behavior and adds evaluation prompts.
- Miriam hands selected lore IDs into generation.
- Sethu completes Studio composition and responsive states.

### Milestone 4 — release candidate

- Smoke-test: create lore → filter/select → arrange/connect → generate → revise → export → reload.
- Run build, accessibility, responsive, error, timeout, and secret-exposure checks.
- Each owner fixes defects in their area; Jordan integrates and tags the demo build.

## Coordination rules

- Shared type changes require Jordan plus every consuming owner to agree before merge.
- Stuti owns `src/features/generation/**`; Jordan owns server/provider code; Sethu owns shared presentational components; Miriam owns `src/features/canvas/**`.
- Feature branches must not edit another owner’s files without coordination.
- Hand-offs include files changed, contract changes, verification, limitations, and merge dependencies.
- Never place `OPENAI_API_KEY` in Vite variables, browser storage, screenshots, logs, or committed files.

