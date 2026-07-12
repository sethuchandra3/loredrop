import { useMemo, useState, type FormEvent } from "react";
import { loreStore, useLoredropState } from "../../data/store";

export function ListWorkspace() {
  const { lore, selectedLoreIds } = useLoredropState();
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...lore]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((entry) =>
        !needle || `${entry.title} ${entry.body} ${entry.tags.join(" ")}`.toLowerCase().includes(needle),
      );
  }, [lore, query]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    loreStore.add({ title, body, tags: tags.split(",") });
    setTitle("");
    setBody("");
    setTags("");
    setIsAdding(false);
  }

  return (
    <section className="workspace list-workspace">
      <header className="workspace-header">
        <div><p className="eyebrow">Lore library</p><h1>Build your story bible.</h1><p>Capture characters, places, artifacts, and the strange rules connecting them.</p></div>
        <button className="primary-button" onClick={() => setIsAdding((value) => !value)} type="button">{isAdding ? "Close" : "+ New lore"}</button>
      </header>

      {isAdding && (
        <form className="lore-form panel" onSubmit={submit}>
          <label><span>Name</span><input autoFocus onChange={(event) => setTitle(event.target.value)} placeholder="The Lantern Court" required value={title} /></label>
          <label><span>What matters?</span><textarea onChange={(event) => setBody(event.target.value)} placeholder="Describe the truth future-you cannot afford to forget…" rows={3} value={body} /></label>
          <label><span>Tags</span><input onChange={(event) => setTags(event.target.value)} placeholder="faction, secret, act-one" value={tags} /></label>
          <button className="primary-button" type="submit">Save lore</button>
        </form>
      )}

      <div className="library-toolbar">
        <label className="search-field"><span className="sr-only">Search lore</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Search your world…" type="search" value={query} /></label>
        <span>{filtered.length} entries · {selectedLoreIds.length} in AI context</span>
      </div>

      <div className="lore-grid">
        {filtered.map((entry) => (
          <article className={`lore-card ${selectedLoreIds.includes(entry.id) ? "is-selected" : ""}`} key={entry.id}>
            <div className="card-topline"><div className="tag-row">{entry.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><button aria-label={`Delete ${entry.title}`} className="icon-button" onClick={() => { if (window.confirm(`Delete “${entry.title}”?`)) loreStore.remove(entry.id); }} type="button">×</button></div>
            <h2>{entry.title}</h2><p>{entry.body || "No details yet."}</p>
            <button className="context-button" onClick={() => loreStore.toggleSelected(entry.id)} type="button">{selectedLoreIds.includes(entry.id) ? "✓ In AI context" : "+ Add to AI context"}</button>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state panel"><h2>No lore found</h2><p>Try a different search or capture a new fragment.</p></div>}
    </section>
  );
}

