# Loredrop

Loredrop is a local-first story atlas for capturing lore, mapping relationships, generating canon-aware prose, and polishing it into an exportable draft.

## Run the hackathon MVP

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. The complete demo works without credentials using a clearly identified local demo generator. To enable live OpenAI generation, set `OPENAI_API_KEY` in `.env`; the key is read only by the Vite development server and is never shipped to the browser.

## Demo path

1. Capture or select lore in **Lore**.
2. Drag cards and create relationships in **Canvas**.
3. Generate a canon-aware scene in **Generate**.
4. Send the result to **Studio**, revise it, and export Markdown.

## Commands

- `npm run dev` — start the app and generation endpoint.
- `npm run build` — type-check and create the production frontend bundle.
- `npm run preview` — preview the static frontend bundle. Generation requires a compatible `/api/generations` deployment endpoint; use `npm run dev` for the self-contained demo.
