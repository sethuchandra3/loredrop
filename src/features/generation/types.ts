export const GENERATION_MODES = [
  "continue",
  "scene",
  "character",
  "world",
] as const;

export type GenerationMode = (typeof GENERATION_MODES)[number];

export const GENERATION_LENGTHS = ["short", "medium", "long"] as const;

export type GenerationLength = (typeof GENERATION_LENGTHS)[number];

export interface GenerationLoreContext {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

export interface GenerationRequest {
  mode: GenerationMode;
  instruction: string;
  tone: string;
  length: GenerationLength;
  lore: GenerationLoreContext[];
}

export interface GenerationResult {
  id: string;
  text: string;
  model: string;
  createdAt: string;
}

export interface GenerationErrorBody {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export const GENERATION_LIMITS = {
  instructionCharacters: 4_000,
  toneCharacters: 80,
  loreEntries: 20,
  loreCharacters: 40_000,
} as const;

export function isGenerationResult(value: unknown): value is GenerationResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;
  return (
    typeof result.id === "string" &&
    typeof result.text === "string" &&
    result.text.trim().length > 0 &&
    typeof result.model === "string" &&
    typeof result.createdAt === "string" &&
    !Number.isNaN(Date.parse(result.createdAt))
  );
}

export function isGenerationErrorBody(
  value: unknown,
): value is GenerationErrorBody {
  if (!value || typeof value !== "object") return false;

  const error = (value as Record<string, unknown>).error;
  if (!error || typeof error !== "object") return false;

  const fields = error as Record<string, unknown>;
  return (
    typeof fields.code === "string" &&
    typeof fields.message === "string" &&
    typeof fields.retryable === "boolean"
  );
}

