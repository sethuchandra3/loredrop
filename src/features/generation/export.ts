import type { GenerationResult } from "./types";

export function sanitizeFilename(value: string): string {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80);

  return sanitized || "loredrop-generation";
}

export function buildMarkdownExport(
  title: string,
  result: GenerationResult,
): string {
  return `# ${title.trim() || "Loredrop generation"}\n\n${result.text.trim()}\n`;
}

export function downloadMarkdown(title: string, result: GenerationResult): void {
  const blob = new Blob([buildMarkdownExport(title, result)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(title)}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

