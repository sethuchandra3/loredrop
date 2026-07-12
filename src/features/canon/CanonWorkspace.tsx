import { canonStore, useCanon } from "../../data/store";

export function CanonWorkspace() {
  const { events, people, bits } = useCanon();
  const person = (id: string) => people.find((item) => item.id === id);
  return <section className="page-shell canon-page"><header className="page-title"><h1>Confirm the tea.</h1><p>AI did the boring part. You just nod, rename, or slap a “disputed” sticker on it.</p></header>
    <div className="canon-board">
      <div className="event-stack">{events.map((event, index) => <article className={`event-polaroid tilt-${index % 3} ${event.disputed ? "disputed" : ""}`} key={event.id}><div className="event-number">CASE #{String(events.length - index).padStart(3,"0")}</div><h2>{event.title}</h2><div className="event-meta"><span>📍 {event.place}</span><span>🗓️ {event.date}</span><span>🌡️ {event.mood}</span></div><blockquote>“{event.quote}”</blockquote><div className="face-pile">{event.participantIds.map((id) => <span key={id} style={{background:person(id)?.color}} title={person(id)?.name}>{person(id)?.emoji}</span>)}</div><button className="dispute-button" onClick={() => canonStore.toggleDisputed(event.id)} type="button">{event.disputed ? "⚠ DISPUTED (perfect)" : "✓ Looks like tea"}</button>{event.disputed && <div className="disputed-stamp">DISPUTED!</div>}</article>)}</div>
      <aside className="canon-sidebar"><div className="sticky-note"><h3>People detected 👀</h3>{people.map((item) => <label key={item.id}><span style={{background:item.color}}>{item.emoji}</span><input aria-label={`Rename ${item.name}`} defaultValue={item.name} onBlur={(event) => canonStore.renamePerson(item.id,event.target.value)}/><small>{item.role}</small></label>)}</div><div className="bits-card"><h3>Bits with tenure</h3>{bits.map((bit,index)=><div key={bit}><b>#{index+1}</b> “{bit}”</div>)}</div></aside>
    </div>
  </section>;
}
