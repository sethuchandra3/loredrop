# Loredrop

Loredrop turns group-chat chaos into canon. Drop screenshots, photos, voice-note transcripts, and half-remembered context; confirm what the system found; then turn the friend-group graph into artifacts people actually want to send back to the chat.

## Live web app

[Open Loredrop](https://loredrop-canon.stuti696708.chatgpt.site)

The hosted app is deployed from this repository's verified production build. Publish a new Sites version after merging product changes to keep the live app aligned with the repository.

## Run the hackathon MVP

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. The seeded demo works without credentials. Set `OPENAI_API_KEY` in `.env` to enable server-side AI voice narration; without a key, narration falls back to the device speech engine. Keys never enter the browser bundle.

## Demo path

1. **Drop** group-chat text or a batch of photos into the Canon-o-matic.
2. **Canon** confirms proposed Events, People, quotes, moods, and disputed memories.
3. **Make stuff** renders the same graph as a thermal Receipt or Breaking News bulletin, with narrated personality modes.
4. **The web** reveals the weighted, labeled connections inside the friend group.

## Commands

- `npm run dev` — start the app and local AI endpoints.
- `npm run build` — type-check and create the production frontend bundle.
- `npm run preview` — preview the static frontend bundle. Use `npm run dev` for the voice-enabled demo.
