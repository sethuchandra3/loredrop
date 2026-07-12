import {
  isGenerationErrorBody,
  isGenerationResult,
  type GenerationRequest,
  type GenerationResult,
} from "./types";
import { validateGenerationRequest } from "./validation";

export class GenerationApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GenerationApiError";
  }
}

export interface GenerateOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function generateLore(
  request: GenerationRequest,
  options: GenerateOptions = {},
): Promise<GenerationResult> {
  const validation = validateGenerationRequest(request);
  if (!validation.valid) {
    throw new GenerationApiError(validation.errors[0], "invalid_request", false);
  }

  const timeoutController = new AbortController();
  const timeout = window.setTimeout(
    () => timeoutController.abort("Generation request timed out."),
    options.timeoutMs ?? 45_000,
  );
  const signal = combineSignals(options.signal, timeoutController.signal);

  try {
    const response = await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    const body: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      if (isGenerationErrorBody(body)) {
        throw new GenerationApiError(
          body.error.message,
          body.error.code,
          body.error.retryable,
          response.status,
        );
      }
      throw new GenerationApiError(
        "The generation service could not complete this request.",
        "generation_failed",
        response.status >= 500 || response.status === 429,
        response.status,
      );
    }

    if (!isGenerationResult(body)) {
      throw new GenerationApiError(
        "The generation service returned an invalid response.",
        "invalid_response",
        true,
        response.status,
      );
    }

    return body;
  } catch (error) {
    if (error instanceof GenerationApiError) throw error;
    if (signal.aborted) {
      throw new GenerationApiError(
        timeoutController.signal.aborted
          ? "Generation took too long. Try a shorter request."
          : "Generation was cancelled.",
        timeoutController.signal.aborted ? "timeout" : "cancelled",
        timeoutController.signal.aborted,
      );
    }
    throw new GenerationApiError(
      "Could not reach the generation service.",
      "network_error",
      true,
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

function combineSignals(
  first: AbortSignal | undefined,
  second: AbortSignal,
): AbortSignal {
  if (!first) return second;
  return AbortSignal.any([first, second]);
}

