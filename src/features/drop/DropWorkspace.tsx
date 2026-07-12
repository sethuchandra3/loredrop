import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { saveLocalAsset } from "../../data/assets";
import { canonStore, type DropKind } from "../../data/store";

type PendingDrop = PendingFileDrop | PendingTextDrop;

interface PendingFileDrop {
  id: string;
  kind: "file";
  file: File;
  previewUrl: string;
}

interface PendingTextDrop {
  id: string;
  kind: "text";
  content: string;
}

export function DropWorkspace() {
  const navigate = useNavigate();
  const [textOpen, setTextOpen] = useState(false);
  const [text, setText] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const [pendingDrops, setPendingDrops] = useState<PendingDrop[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [storageError, setStorageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingDropsRef = useRef<PendingDrop[]>([]);

  useEffect(() => {
    pendingDropsRef.current = pendingDrops;
  }, [pendingDrops]);

  useEffect(() => {
    return () => {
      pendingDropsRef.current.forEach((item) => {
        if (item.kind === "file") URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  function finishDrop() {
    setTextOpen(false);
    setText("");
    clearPendingDrops();
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 1600);
    window.setTimeout(() => navigate("/canvas"), 700);
  }

  function submitText(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setPendingDrops((current) => [...current, { id: crypto.randomUUID(), kind: "text", content: text.trim() }]);
    setText("");
    setTextOpen(false);
  }

  function filesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    if (files.length) addPendingFiles(files);
    event.target.value = "";
  }

  function addPendingFiles(files: File[]) {
    setDraggingFiles(false);
    setStorageError("");
    setPendingDrops((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        kind: "file" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function removePendingDrop(id: string) {
    setPendingDrops((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.kind === "file") URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function clearPendingDrops() {
    setPendingDrops((current) => {
      current.forEach((item) => {
        if (item.kind === "file") URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }

  async function savePendingDrops() {
    if (!pendingDrops.length || isIngesting) return;
    setIsIngesting(true);
    setTextOpen(false);
    setDraggingFiles(false);
    await new Promise((resolve) => window.setTimeout(resolve, 620));
    try {
      await Promise.all(pendingDrops.map(async (item) => {
        if (item.kind === "text") {
          canonStore.addDrop("text", item.content);
          return;
        }
        const asset = await saveLocalAsset(item.file, item.file.name);
        canonStore.addDrop(kindForFile(item.file), `${labelForFile(item.file)}: ${item.file.name}`, item.previewUrl, undefined, asset);
      }));
      setStorageError("");
      finishDrop();
    } catch (error) {
      setIsIngesting(false);
      setStorageError(error instanceof Error ? error.message : "Could not save these files locally.");
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.start();
      setRecording(true);
    } catch {
      setTextOpen(true);
      setText("Voice note: ");
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      const file = new File([audio], `voice-note-${new Date().toISOString()}.webm`, { type: audio.type || "audio/webm" });
      addPendingFiles([file]);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      streamRef.current = null;
      chunksRef.current = [];
      setRecording(false);
    };
    recorder.stop();
  }

  function hasFiles(event: DragEvent) {
    return [...event.dataTransfer.types].includes("Files");
  }

  function dragOver(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setDraggingFiles(true);
  }

  function dragLeave(event: DragEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDraggingFiles(false);
    }
  }

  function dropFiles(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    addPendingFiles([...event.dataTransfer.files]);
  }

  return (
    <section className={`drop-page page-shell ${draggingFiles ? "is-dragging-files" : ""}`} onDragEnter={dragOver} onDragLeave={dragLeave} onDragOver={dragOver} onDrop={dropFiles}>
      {celebrate && <div className="confetti-toast" role="status">New lore dropped.</div>}

      <header className="drop-question">
        <span className="doodle">LOREDROP</span>
        <h1>Drop the lore.</h1>
      </header>

      <div className={`drop-hub ${pendingDrops.length ? "has-files" : ""} ${isIngesting ? "is-ingesting" : ""}`}>
        <div className="bubble-field" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        {pendingDrops.length > 0 && (
          <div className="hub-preview-ring" aria-label="Drops ready">
            <AnimatePresence initial={false}>
              {pendingDrops.map((item, index) => (
                <div className={`hub-preview-slot preview-${index % 8}`} key={item.id}>
                  <motion.article
                    className="hub-preview"
                    initial={{ opacity: 0, scale: 0.18, y: 28 }}
                    animate={isIngesting ? { opacity: 0, scale: 0.18, x: 0, y: 0, rotate: 12 } : { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.35, y: -22, transition: { duration: 0.16 } }}
                    transition={isIngesting ? { delay: index * 0.055, duration: 0.34, ease: [0.2, 0.86, 0.24, 1] } : { type: "spring", stiffness: 520, damping: 24, mass: 0.8 }}
                  >
                    <PendingPreview item={item} />
                    <b>{pendingLabel(item)}</b>
                    <button aria-label={`Remove ${pendingLabel(item)}`} onClick={() => removePendingDrop(item.id)} type="button">x</button>
                  </motion.article>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <button aria-label="Drop files" className="add-lore-button" onClick={() => fileRef.current?.click()} type="button"><span>+</span></button>
        <button aria-label="Write a text drop" className="floating-tool pencil-tool" onClick={() => setTextOpen((open) => !open)} type="button"><PencilIcon /></button>
        <button aria-label={recording ? "Stop recording" : "Record voice note"} className={`floating-tool mic-tool ${recording ? "is-recording" : ""}`} onClick={() => recording ? stopRecording() : void startRecording()} type="button"><MicIcon /></button>

        {draggingFiles && <div className="hub-drop-hint">Release to collect</div>}
        {pendingDrops.length > 0 && !isIngesting && <div className="hub-actions"><button className="submit-drop" onClick={() => { void savePendingDrops(); }} type="button">Brew tea</button></div>}
        {isIngesting && <div className="ingest-status">Brewing...</div>}

        {textOpen && (
          <form className="inline-text-drop" onSubmit={submitText}>
            <label htmlFor="lore-text">What happened?</label>
            <textarea autoFocus id="lore-text" onChange={(event) => setText(event.target.value)} placeholder="Paste the group chat evidence here..." rows={4} value={text}/>
            <div className="composer-actions"><button onClick={() => setTextOpen(false)} type="button">Cancel</button><button className="submit-drop" type="submit">Drop</button></div>
          </form>
        )}
      </div>

      <input accept="image/*,video/*,audio/*,text/plain,.txt,.md" hidden multiple onChange={(event) => { filesSelected(event); }} ref={fileRef} type="file"/>
      {storageError && <p className="storage-error" role="alert">{storageError}</p>}
    </section>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m4 16.8-.8 4 4-.8L19.4 7.8a2.1 2.1 0 0 0 0-3l-.2-.2a2.1 2.1 0 0 0-3 0L4 16.8Z" />
      <path d="m14.8 6 3.2 3.2" />
      <path d="m4 16.8 3.2 3.2" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="4" width="7" x="8.5" y="2.5" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

function PendingPreview({ item }: { item: PendingDrop }) {
  if (item.kind === "text") return <TextIcon />;
  return <FilePreview file={item.file} url={item.previewUrl} />;
}

function FilePreview({ file, url }: { file: File; url: string }) {
  if (file.type.startsWith("image/")) return <img alt="" src={url} />;
  if (file.type.startsWith("video/")) return <span className="file-type-tile">VID</span>;
  if (file.type.startsWith("audio/")) return <WaveformIcon />;
  if (file.type.startsWith("text/")) return <TextIcon />;
  return <span className="file-type-tile">{file.name.split(".").pop()?.toUpperCase() || "FILE"}</span>;
}

function pendingLabel(item: PendingDrop) {
  if (item.kind === "text") return item.content;
  return item.file.name;
}

function WaveformIcon() {
  return (
    <span className="waveform-tile" aria-label="Voice note">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function TextIcon() {
  return (
    <span className="text-tile" aria-label="Text drop">
      <span>A</span>
      <span>b</span>
      <span>c</span>
    </span>
  );
}

function kindForFile(file: File): DropKind {
  if (file.type.startsWith("audio/")) return "voice";
  return "photo";
}

function labelForFile(file: File) {
  if (file.type.startsWith("video/")) return "Uploaded video";
  if (file.type.startsWith("audio/")) return "Uploaded audio";
  if (file.type.startsWith("text/")) return "Uploaded text";
  return "Uploaded photo";
}
