import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { loreStore, useLoredropState } from "../../data/store";
import { generateLore, GenerationApiError } from "./client";
import { downloadMarkdown } from "./export";
import {
  GENERATION_LIMITS,
  type GenerationLength,
  type GenerationMode,
  type GenerationResult,
} from "./types";
import "./generation.css";

const modeLabels: Record<GenerationMode, string> = {
  continue: "Continue writing",
  scene: "Draft a scene",
  character: "Deepen a character",
  world: "Expand the world",
};

export function GenerationWorkspace() {
  const navigate = useNavigate();
  const { lore, selectedLoreIds } = useLoredropState();
  const [mode, setMode] = useState<GenerationMode>("scene");
  const [instruction, setInstruction] = useState("");
  const [tone, setTone] = useState("Atmospheric and grounded");
  const [length, setLength] = useState<GenerationLength>("medium");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const selectedLore = lore.filter((entry) => selectedLoreIds.includes(entry.id));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGenerating) return;

    const controller = new AbortController();
    activeRequest.current = controller;
    setIsGenerating(true);
    setError(null);

    try {
      const nextResult = await generateLore(
        {
          mode,
          instruction,
          tone,
          length,
          lore: selectedLore.map(({ id, title, body, tags }) => ({ id, title, body, tags })),
        },
        { signal: controller.signal },
      );
      setResult(nextResult);
    } catch (caught) {
      setError(
        caught instanceof GenerationApiError
          ? caught.message
          : "Something went wrong while generating.",
      );
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsGenerating(false);
      }
    }
  }

  function cancelGeneration() {
    activeRequest.current?.abort();
  }

  function sendToStudio() {
    if (!result) return;
    loreStore.saveStudio(instruction.trim() || "Generated story", result.text);
    navigate("/studio");
  }

  return (
    <section className="generation-workspace" aria-labelledby="generation-title">
      <div className="generation-heading">
        <p className="eyebrow">AI generation</p>
        <h1 id="generation-title">Turn lore into a first draft.</h1>
        <p>Give the generator a clear direction. Your selected lore becomes the creative guardrail.</p>
      </div>

      <div className="generation-layout">
        <form className="generation-form" onSubmit={handleSubmit}>
          <div className="generation-context-summary">
            <span><strong>{selectedLore.length}</strong> lore fragments attached</span>
            <Link to="/list">Edit context</Link>
          </div>
          <fieldset>
            <legend>What should Loredrop make?</legend>
            <div className="generation-modes">
              {(Object.entries(modeLabels) as [GenerationMode, string][]).map(
                ([value, label]) => (
                  <label key={value}>
                    <input
                      checked={mode === value}
                      name="mode"
                      onChange={() => setMode(value)}
                      type="radio"
                      value={value}
                    />
                    <span>{label}</span>
                  </label>
                ),
              )}
            </div>
          </fieldset>

          <label className="generation-field">
            <span>Direction</span>
            <textarea
              maxLength={GENERATION_LIMITS.instructionCharacters}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Write the confrontation where Mara discovers who altered the city archive…"
              required
              rows={7}
              value={instruction}
            />
            <small>
              {instruction.length.toLocaleString()} /{" "}
              {GENERATION_LIMITS.instructionCharacters.toLocaleString()}
            </small>
          </label>

          <div className="generation-options">
            <label className="generation-field">
              <span>Tone</span>
              <input
                maxLength={GENERATION_LIMITS.toneCharacters}
                onChange={(event) => setTone(event.target.value)}
                required
                type="text"
                value={tone}
              />
            </label>
            <label className="generation-field">
              <span>Length</span>
              <select
                onChange={(event) =>
                  setLength(event.target.value as GenerationLength)
                }
                value={length}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="generation-error" role="alert">
              {error}
            </div>
          )}

          <div className="generation-actions">
            <button disabled={isGenerating} type="submit">
              {isGenerating ? "Generating…" : "Generate draft"}
            </button>
            {isGenerating && (
              <button className="button-secondary" onClick={cancelGeneration} type="button">
                Cancel
              </button>
            )}
          </div>
        </form>

        <article className="generation-result" aria-live="polite">
          <div className="generation-result-header">
            <div>
              <p className="eyebrow">Draft</p>
              <h2>{result ? "Generated writing" : "Your result will appear here"}</h2>
            </div>
            {result && (
              <div className="result-actions">
                <button className="button-secondary" onClick={() => void navigator.clipboard.writeText(result.text)} type="button">Copy</button>
                <button className="button-secondary" onClick={() => downloadMarkdown(instruction, result)} type="button">Export</button>
                <button onClick={sendToStudio} type="button">Use in Studio</button>
              </div>
            )}
          </div>
          {result ? (
            <div className="generation-copy">{result.text}</div>
          ) : (
            <p className="generation-placeholder">
              Choose a direction and generate a scene grounded in your selected lore.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
