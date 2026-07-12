import {
  GENERATION_LENGTHS,
  GENERATION_LIMITS,
  GENERATION_MODES,
  type GenerationRequest,
} from "./types";

export interface GenerationValidation {
  valid: boolean;
  errors: string[];
}

export function validateGenerationRequest(
  request: GenerationRequest,
): GenerationValidation {
  const errors: string[] = [];
  const instruction = request.instruction.trim();
  const tone = request.tone.trim();
  const loreCharacters = request.lore.reduce(
    (total, entry) => total + entry.title.length + entry.body.length,
    0,
  );

  if (!GENERATION_MODES.includes(request.mode)) {
    errors.push("Choose a valid generation mode.");
  }
  if (!instruction) {
    errors.push("Describe what you want to generate.");
  } else if (instruction.length > GENERATION_LIMITS.instructionCharacters) {
    errors.push(
      `Keep the instruction under ${GENERATION_LIMITS.instructionCharacters.toLocaleString()} characters.`,
    );
  }
  if (!tone) {
    errors.push("Provide a tone for the generated writing.");
  } else if (tone.length > GENERATION_LIMITS.toneCharacters) {
    errors.push(
      `Keep the tone under ${GENERATION_LIMITS.toneCharacters} characters.`,
    );
  }
  if (!GENERATION_LENGTHS.includes(request.length)) {
    errors.push("Choose a valid target length.");
  }
  if (request.lore.length > GENERATION_LIMITS.loreEntries) {
    errors.push(
      `Select no more than ${GENERATION_LIMITS.loreEntries} lore entries.`,
    );
  }
  if (loreCharacters > GENERATION_LIMITS.loreCharacters) {
    errors.push(
      `Lore context must stay under ${GENERATION_LIMITS.loreCharacters.toLocaleString()} characters.`,
    );
  }

  return { valid: errors.length === 0, errors };
}

