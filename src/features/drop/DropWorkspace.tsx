import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { canonStore, type DropKind } from "../../data/store";

export function DropWorkspace() {
  const navigate = useNavigate();
  const [composerOpen, setComposerOpen] = useState(false);
  const [kind, setKind] = useState<DropKind | null>(null);
  const [text, setText] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function finishDrop() {
    setComposerOpen(false);
    setKind(null);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 1600);
    navigate("/canvas");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || !kind) return;
    canonStore.addDrop(kind, text);
    setText("");
    finishDrop();
  }

  async function filesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    await Promise.all(files.map(async (file) => canonStore.addDrop("photo", file.name, await readFile(file))));
    if (files.length) finishDrop();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setText("Voice note: ");
      setKind("voice");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorder.onstop = () => {
      canonStore.addDrop("voice", "Recorded voice note — ready for tea review.");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      streamRef.current = null;
      setRecording(false);
      finishDrop();
    };
    recorder.stop();
  }

  function closeComposer() {
    if (recording) stopRecording();
    setComposerOpen(false);
    setKind(null);
    setText("");
  }

  return (
    <section className="drop-page page-shell">
      {celebrate && <div className="confetti-toast" role="status">New lore dropped.</div>}

      <header className="drop-question">
        <span className="doodle">LOREDROP</span>
        <h1>Drop the lore.</h1>
      </header>

      <button
        aria-expanded={composerOpen}
        aria-label={composerOpen ? "Close lore composer" : "Add lore"}
        className={`add-lore-button ${composerOpen ? "is-open" : ""}`}
        onClick={() => composerOpen ? closeComposer() : setComposerOpen(true)}
        type="button"
      >
        <span>+</span>
      </button>

      {composerOpen && (
        <div className="composer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeComposer(); }}>
          <section aria-labelledby="composer-title" className="lore-composer" role="dialog">
            <div className="composer-heading">
              <div><span>NEW DROP</span><h2 id="composer-title">How are we telling it?</h2></div>
              <button aria-label="Close" onClick={closeComposer} type="button">×</button>
            </div>

            {!kind && (
              <div className="drop-methods">
                <button onClick={() => setKind("text")} type="button"><b>💬 Text Receipt</b><span>Paste a chat or type what happened.</span></button>
                <button onClick={() => { setKind("photo"); fileRef.current?.click(); }} type="button"><b>📸 Evidence</b><span>Add screenshots or camera-roll evidence.</span></button>
                <button onClick={() => { setKind("voice"); void startRecording(); }} type="button"><b>🎙 Witness Statement</b><span>Record the version you remember.</span></button>
              </div>
            )}

            {(kind === "text" || (kind === "voice" && !recording)) && (
              <form onSubmit={submit}>
                <label htmlFor="lore-text">{kind === "voice" ? "Voice transcription fallback" : "What happened?"}</label>
                <textarea autoFocus id="lore-text" onChange={(event) => setText(event.target.value)} rows={7} value={text}/>
                <div className="composer-actions"><button onClick={() => setKind(null)} type="button">Back</button><button className="submit-drop" type="submit">Add to tea</button></div>
              </form>
            )}

            {kind === "voice" && recording && (
              <div className="voice-recorder"><div className="recording-line"><i/><span>Recording voice note</span></div><div className="waveform" aria-hidden="true">||||||||||||||||||||</div><button onClick={stopRecording} type="button">Stop and add</button></div>
            )}

            <input accept="image/*" hidden multiple onChange={filesSelected} ref={fileRef} type="file"/>
            <p className="composer-privacy">Closed group by default. Everything stays editable.</p>
          </section>
        </div>
      )}

    </section>
  );
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
