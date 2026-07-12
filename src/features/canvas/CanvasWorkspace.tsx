import { useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router";
import { loreStore, useLoredropState } from "../../data/store";

const NODE_WIDTH = 190;
const NODE_HEIGHT = 118;

export function CanvasWorkspace() {
  const { lore, relations, positions, selectedLoreIds } = useLoredropState();
  const [source, setSource] = useState(lore[0]?.id ?? "");
  const [target, setTarget] = useState(lore[1]?.id ?? "");
  const [label, setLabel] = useState("connects to");

  function addRelation(event: FormEvent) {
    event.preventDefault();
    loreStore.addRelation(source, target, label);
  }

  function startDrag(event: ReactPointerEvent<HTMLElement>, id: string) {
    const canvas = event.currentTarget.parentElement;
    if (!canvas) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const move = (moveEvent: PointerEvent) => loreStore.setPosition(id, {
      x: Math.max(8, Math.min(rect.width - NODE_WIDTH - 8, moveEvent.clientX - rect.left - NODE_WIDTH / 2)),
      y: Math.max(8, Math.min(rect.height - NODE_HEIGHT - 8, moveEvent.clientY - rect.top - 28)),
    });
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }

  const find = (id: string) => lore.find((entry) => entry.id === id);

  return (
    <section className="workspace canvas-workspace">
      <header className="workspace-header"><div><p className="eyebrow">Story atlas</p><h1>See the hidden connections.</h1><p>Drag ideas into place, connect them, then send the strongest cluster to the generator.</p></div><Link className="primary-button link-button" to="/generate">Generate from {selectedLoreIds.length} selected →</Link></header>
      <div className="canvas-layout">
        <div className="story-canvas" aria-label="Lore relationship canvas">
          <svg aria-hidden="true" className="canvas-lines">
            {relations.map((relation) => {
              const from = positions[relation.sourceId] ?? { x: 20, y: 20 };
              const to = positions[relation.targetId] ?? { x: 250, y: 220 };
              return <line key={relation.id} x1={from.x + NODE_WIDTH / 2} x2={to.x + NODE_WIDTH / 2} y1={from.y + NODE_HEIGHT / 2} y2={to.y + NODE_HEIGHT / 2} />;
            })}
          </svg>
          {lore.map((entry, index) => {
            const position = positions[entry.id] ?? { x: 30 + (index % 3) * 220, y: 30 + Math.floor(index / 3) * 150 };
            return <article className={`canvas-node ${selectedLoreIds.includes(entry.id) ? "is-selected" : ""}`} key={entry.id} onDoubleClick={() => loreStore.toggleSelected(entry.id)} onPointerDown={(event) => startDrag(event, entry.id)} style={{ left: position.x, top: position.y }} tabIndex={0}><span className="node-type">{entry.tags[0] ?? "lore"}</span><h2>{entry.title}</h2><p>{entry.body}</p></article>;
          })}
        </div>
        <aside className="canvas-inspector panel">
          <h2>Relationships</h2>
          <form onSubmit={addRelation}>
            <label><span>From</span><select onChange={(event) => setSource(event.target.value)} value={source}>{lore.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
            <label><span>Relationship</span><input onChange={(event) => setLabel(event.target.value)} value={label} /></label>
            <label><span>To</span><select onChange={(event) => setTarget(event.target.value)} value={target}>{lore.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
            <button className="primary-button" type="submit">Connect</button>
          </form>
          <div className="relation-list">{relations.map((relation) => <div className="relation-item" key={relation.id}><span><strong>{find(relation.sourceId)?.title}</strong> {relation.label} <strong>{find(relation.targetId)?.title}</strong></span><button aria-label="Delete relationship" className="icon-button" onClick={() => loreStore.removeRelation(relation.id)} type="button">×</button></div>)}</div>
          <p className="inspector-hint">Double-click a card to add or remove it from AI context.</p>
        </aside>
      </div>
    </section>
  );
}

