import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { canonStore, useCanon, type DropKind } from "../../data/store";

const prompts = ["the screenshot that changed everything", "a quote with no context", "the night nobody agrees on", "a running bit with ancient origins"];

export function DropWorkspace() {
  const { drops, events } = useCanon();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<DropKind>("text");
  const [celebrate, setCelebrate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    canonStore.addDrop(kind, text);
    setText(""); setCelebrate(true); window.setTimeout(() => setCelebrate(false), 1800);
  }
  function filesSelected(event: ChangeEvent<HTMLInputElement>) {
    const names = [...(event.target.files ?? [])].map((file) => file.name);
    names.forEach((name) => canonStore.addDrop("photo", `Uploaded photo: ${name}`));
    if (names.length) { setCelebrate(true); window.setTimeout(() => setCelebrate(false), 1800); }
  }

  return <section className="drop-page page-shell">
    {celebrate && <div className="confetti-toast" role="status">✨ New lore just dropped ✨</div>}
    <header className="hero-playful"><div className="hero-copy"><span className="doodle">HOT GOSS, COLD STORAGE</span><h1>Drop the chaos.<br/><em>We’ll make it canon.</em></h1><p>Screenshots, voice notes, blurry photos, unhinged context. Your friend group deserves an archive with personality.</p></div><div className="hero-sticker" aria-hidden="true"><span>100%</span><b>LORE<br/>CERTIFIED</b></div></header>
    <div className="drop-grid">
      <form className="drop-machine" onSubmit={submit}>
        <div className="machine-lights"><i/><i/><i/><span>CANON-O-MATIC 3000</span></div>
        <div className="drop-tabs">{(["text", "photo", "voice"] as DropKind[]).map((value) => <button className={kind === value ? "active" : ""} key={value} onClick={() => setKind(value)} type="button">{value === "text" ? "💬 paste chaos" : value === "photo" ? "📸 photo dump" : "🎙️ voice note"}</button>)}</div>
        {kind === "photo" ? <button className="photo-drop" onClick={() => fileRef.current?.click()} type="button"><span>📎</span><strong>Drop the receipts here</strong><small>multi-select encouraged. context optional.</small></button> : <textarea onChange={(event) => setText(event.target.value)} placeholder={kind === "voice" ? "Type or dictate the voice note transcript…" : "Paste the group chat evidence here…"} rows={7} value={text}/>} 
        <input accept="image/*" hidden multiple onChange={filesSelected} ref={fileRef} type="file"/>
        {kind !== "photo" && <button className="big-chaos-button" type="submit">DROP IT <span>↗</span></button>}
        <p className="privacy-note">🔒 Closed group. Affectionate chaos only. You edit the canon.</p>
      </form>
      <aside className="right-rail">
        <div className="prompt-card"><span>NEED A PROMPT?</span><p>Drop {prompts[drops.length % prompts.length]}.</p></div>
        <div className="canon-meter"><div><b>{drops.length}</b><span>DROPS</span></div><div><b>{events.length}</b><span>EVENTS</span></div><div><b>3</b><span>RUNNING BITS</span></div></div>
        <div className="recent-chaos"><div className="section-label">RECENTLY CANONIZED</div>{events.slice(0, 3).map((event) => <Link key={event.id} to="/canon"><span>{event.disputed ? "⚠️" : "✦"}</span><div><b>{event.title}</b><small>{event.date} · {event.mood}</small></div></Link>)}</div>
      </aside>
    </div>
  </section>;
}

