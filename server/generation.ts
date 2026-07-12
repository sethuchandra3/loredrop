import type { IncomingMessage, ServerResponse } from "node:http";

interface GenerationPayload {
  mode: "continue" | "scene" | "character" | "world";
  instruction: string;
  tone: string;
  length: "short" | "medium" | "long";
  lore: Array<{ id: string; title: string; body: string; tags: string[] }>;
}

const maximumBodyBytes = 64_000;

export async function handleGeneration(request: IncomingMessage, response: ServerResponse) {
  try {
    const payload = validatePayload(await readJson(request));
    const result = process.env.OPENAI_API_KEY
      ? await generateWithOpenAI(payload)
      : generateDemo(payload);
    sendJson(response, 200, result);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    sendJson(response, status, {
      error: {
        code: status === 400 ? "invalid_request" : "generation_failed",
        message: error instanceof Error ? error.message : "Generation failed.",
        retryable: status >= 500 || status === 429,
      },
    });
  }
}

export async function handleVoice(request: IncomingMessage, response: ServerResponse) {
  if (!process.env.OPENAI_API_KEY) {
    response.statusCode = 204;
    response.end();
    return;
  }
  try {
    const body = await readJson(request) as { text?: unknown; voice?: unknown };
    const voices = ["alloy", "nova", "onyx"];
    if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 4_000) throw new HttpError(400, "Narration must be under 4,000 characters.");
    const voice = voices.includes(String(body.voice)) ? String(body.voice) : "nova";
    const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_VOICE_MODEL || "tts-1", voice, input: body.text, response_format: "mp3" }),
    });
    if (!apiResponse.ok) throw new HttpError(apiResponse.status, "The voice booth is warming up. Try again in a moment.");
    response.statusCode = 200;
    response.setHeader("Content-Type", "audio/mpeg");
    response.end(Buffer.from(await apiResponse.arrayBuffer()));
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    sendJson(response, status, { error: { code: "voice_failed", message: error instanceof Error ? error.message : "Voice generation failed.", retryable: status >= 500 } });
  }
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > maximumBodyBytes) throw new HttpError(413, "Request is too large.");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function validatePayload(value: unknown): GenerationPayload {
  if (!value || typeof value !== "object") throw new HttpError(400, "Missing generation request.");
  const input = value as Partial<GenerationPayload>;
  const modes = ["continue", "scene", "character", "world"];
  const lengths = ["short", "medium", "long"];
  if (!modes.includes(input.mode ?? "") || !lengths.includes(input.length ?? "")) throw new HttpError(400, "Invalid mode or length.");
  if (typeof input.instruction !== "string" || !input.instruction.trim() || input.instruction.length > 4_000) throw new HttpError(400, "Provide an instruction under 4,000 characters.");
  if (typeof input.tone !== "string" || !input.tone.trim() || input.tone.length > 80) throw new HttpError(400, "Provide a tone under 80 characters.");
  if (!Array.isArray(input.lore) || input.lore.length > 20) throw new HttpError(400, "Select no more than 20 lore entries.");
  return input as GenerationPayload;
}

async function generateWithOpenAI(payload: GenerationPayload) {
  const lore = payload.lore.map((entry) => `## ${entry.title}\n${entry.body}\nTags: ${entry.tags.join(", ")}`).join("\n\n");
  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "You are Loredrop, a thoughtful fiction collaborator. Treat supplied lore as canon. Write vivid original prose, avoid explaining your process, and never invent a contradiction. Return prose only.",
      input: `Mode: ${payload.mode}\nTone: ${payload.tone}\nTarget length: ${payload.length}\nDirection: ${payload.instruction}\n\nCANON LORE\n${lore || "No canon supplied."}`,
    }),
  });
  const body = await apiResponse.json() as Record<string, unknown>;
  if (!apiResponse.ok) {
    const apiError = body.error as { message?: string } | undefined;
    throw new HttpError(apiResponse.status, apiError?.message || "OpenAI could not complete the request.");
  }
  const text = extractResponseText(body);
  if (!text) throw new HttpError(502, "OpenAI returned no generated text.");
  return { id: String(body.id ?? crypto.randomUUID()), text, model: String(body.model ?? process.env.OPENAI_MODEL ?? "gpt-5-mini"), createdAt: new Date().toISOString() };
}

function extractResponseText(body: Record<string, unknown>): string {
  if (typeof body.output_text === "string") return body.output_text;
  if (!Array.isArray(body.output)) return "";
  return body.output.flatMap((item) => {
    const content = (item as { content?: unknown }).content;
    return Array.isArray(content) ? content.map((part) => (typeof part === "object" && part && "text" in part ? String(part.text) : "")) : [];
  }).filter(Boolean).join("\n");
}

function generateDemo(payload: GenerationPayload) {
  const [first, second, third] = payload.lore;
  const hero = first?.title ?? "the last cartographer";
  const place = second?.title ?? "the city beneath the bells";
  const object = third?.title ?? "a key made of rain";
  const canon = first?.body ?? "They had learned to distrust any memory that arrived too cleanly.";
  const direction = payload.instruction.trim().replace(/[.?!]+$/, "");
  const paragraphs = [
    `${hero} reached ${place} just before midnight, carrying ${object} where no honest person would think to look. ${canon}`,
    `The first bell made the windows shiver. The second pulled every shadow toward the archive doors. By the third, the words ${hero} had come to find were already vanishing from the walls.`,
    `“${direction},” someone whispered from the other side. It sounded less like an invitation than a memory trying to become true.`,
    `${hero} pressed a hand to the door. The lock answered with a small, living click—and somewhere below, the city remembered the wrong name.`,
  ];
  const count = payload.length === "short" ? 2 : payload.length === "long" ? 4 : 3;
  return { id: crypto.randomUUID(), text: paragraphs.slice(0, count).join("\n\n"), model: "loredrop-demo-engine", createdAt: new Date().toISOString() };
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}
