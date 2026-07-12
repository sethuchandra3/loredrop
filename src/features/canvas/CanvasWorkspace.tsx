import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { canonStore, useCanon, type Drop } from "../../data/store";

const labels: Record<Drop["kind"], string> = { text: "Text receipts", photo: "Photo/video receipts", voice: "Voice receipts" };

export function CanvasWorkspace() {
  const { drops, events } = useCanon();
  const [recording, setRecording] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [storyInput, setStoryInput] = useState({ title: "", people: "", main: "", location: "", details: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const title = events[0]?.title;

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    for (const file of [...(event.target.files ?? [])]) canonStore.addDrop("photo", file.name, await readBlob(file));
    event.target.value = "";
  }

  async function toggleRecording() {
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream); const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        canonStore.addDrop("voice", `Voice memo · ${new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`, await readBlob(blob));
        stream.getTracks().forEach((track) => track.stop()); setRecording(false);
      };
      recorderRef.current = recorder; recorder.start(); setRecording(true);
    } catch { setRecording(false); }
  }

  function addText(event: FormEvent) {
    event.preventDefault();
    if (!storyInput.title.trim() || !storyInput.main.trim()) return;
    const content = [storyInput.people && `Involved: ${storyInput.people}`, storyInput.main, storyInput.location && `Location: ${storyInput.location}`, storyInput.details].filter(Boolean).join("\n");
    canonStore.addDrop("text", content, undefined, { title: storyInput.title, place: storyInput.location });
    setStoryInput({ title: "", people: "", main: "", location: "", details: "" }); setTextOpen(false);
  }

  return <section className="page-shell case-file-page">
    <header className="case-title"><span>CASE FILE</span><h1>{title ?? "Open a new case."}</h1></header>
    <div className="canvas-insert-actions"><button onClick={() => setTextOpen((open) => !open)} type="button">＋ Text</button><button onClick={() => fileRef.current?.click()} type="button">＋ Photos</button><button className={recording ? "recording" : ""} onClick={() => void toggleRecording()} type="button">{recording ? "■ Stop recording" : "＋ Voice"}</button><input accept="image/*" hidden multiple onChange={(event) => void addPhotos(event)} ref={fileRef} type="file"/></div>
    {textOpen && <form className="canvas-text-composer case-form" onSubmit={addText}><span className="case-stamp">NEW CASE ENTRY</span><label htmlFor="story-title">Entry name <em>required</em></label><input autoFocus id="story-title" onChange={(event) => setStoryInput({...storyInput,title:event.target.value})} required value={storyInput.title}/><small>“The Great Ghosting” · “Who Ate My Fries?” · “The Airbnb Disaster”</small><label htmlFor="story-people">Who was involved?</label><input id="story-people" onChange={(event) => setStoryInput({...storyInput,people:event.target.value})} value={storyInput.people}/><label htmlFor="story-main">What happened? <em>required</em></label><textarea id="story-main" onChange={(event) => setStoryInput({...storyInput,main:event.target.value})} required rows={3} value={storyInput.main}/><label htmlFor="story-location">Where?</label><input id="story-location" onChange={(event) => setStoryInput({...storyInput,location:event.target.value})} value={storyInput.location}/><label htmlFor="story-details">Anything else worth saving?</label><textarea id="story-details" onChange={(event) => setStoryInput({...storyInput,details:event.target.value})} rows={3} value={storyInput.details}/><div><button onClick={() => setTextOpen(false)} type="button">Cancel</button><button type="submit">File the lore</button></div></form>}
    {drops.length ? <div className="evidence-sections">{(["text","photo","voice"] as const).map((kind) => { const items=drops.filter((drop)=>drop.kind===kind); return items.length ? <section className={`evidence-group ${kind}`} key={kind}><h2>{labels[kind]} <span>{items.length}</span></h2><div className="evidence-grid">{items.map((drop)=><Evidence drop={drop} key={drop.id}/>)}</div></section> : null; })}<section className="current-lore"><span>AI SUMMARY</span><h2>Current lore</h2><p>{summarize(drops)}</p></section></div> : <section className="canvas-empty"><b>No evidence filed.</b><p>Start with a text receipt, photo, or witness statement.</p></section>}
  </section>;
}

function Evidence({drop}:{drop:Drop}) { if(drop.kind==="photo" && drop.mediaUrl?.startsWith("data:video/")) return <article className="evidence-photo"><video controls src={drop.mediaUrl}/><b>{drop.content}</b></article>; if(drop.kind==="photo" && drop.mediaUrl) return <article className="evidence-photo"><img alt={drop.content} src={drop.mediaUrl}/><b>{drop.content}</b></article>; if(drop.kind==="voice") return <article className="evidence-voice"><b>Witness statement</b>{drop.mediaUrl && <audio controls src={drop.mediaUrl}/>}<small>{drop.content}</small></article>; return <article className="evidence-text"><span>TEXT</span><p>{drop.content}</p></article>; }
function summarize(drops:Drop[]) { const text=drops.filter((drop)=>drop.kind==="text").map((drop)=>drop.content).join(" "); return text || `${drops.length} piece${drops.length===1?"":"s"} of evidence filed. Add a text receipt to establish the current consensus.`; }
function readBlob(blob:Blob) { return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);}); }
