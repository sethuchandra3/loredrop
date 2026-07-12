import { useEffect, useState } from "react";
import { loreStore, useLoredropState } from "../../data/store";
import { sanitizeFilename } from "../generation/export";

export function StudioWorkspace() {
  const { studio, lore, selectedLoreIds } = useLoredropState();
  const [title, setTitle] = useState(studio.title);
  const [body, setBody] = useState(studio.body);
  const selected = lore.filter((entry) => selectedLoreIds.includes(entry.id));

  useEffect(() => {
    const timeout = window.setTimeout(() => loreStore.saveStudio(title, body), 450);
    return () => window.clearTimeout(timeout);
  }, [title, body]);

  function exportDraft() {
    const blob = new Blob([`# ${title.trim() || "Untitled story"}\n\n${body.trim()}\n`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sanitizeFilename(title)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="workspace studio-workspace">
      <header className="workspace-header"><div><p className="eyebrow">Writing studio</p><h1>Shape the story.</h1><p>Your selected lore stays close while you turn fragments into a draft.</p></div><button className="primary-button" onClick={exportDraft} type="button">Export .md</button></header>
      <div className="studio-layout">
        <aside className="studio-context panel"><div className="section-heading"><h2>Context shelf</h2><span>{selected.length}</span></div>{selected.map((entry) => <article key={entry.id}><span className="tag">{entry.tags[0] ?? "lore"}</span><h3>{entry.title}</h3><p>{entry.body}</p><button className="text-button" onClick={() => setBody((value) => `${value}${value ? "\n\n" : ""}${entry.title}\n${entry.body}`)} type="button">Insert into draft →</button></article>)}</aside>
        <div className="editor panel"><input aria-label="Draft title" className="editor-title" onChange={(event) => setTitle(event.target.value)} value={title} /><textarea aria-label="Story draft" onChange={(event) => setBody(event.target.value)} placeholder="Begin where the world changes…" value={body} /><div className="save-status">Saved locally · {body.trim() ? body.trim().split(/\s+/).length : 0} words</div></div>
      </div>
    </section>
  );
}

