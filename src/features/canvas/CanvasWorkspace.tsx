import { useEffect, useMemo, useState } from "react";
import { useCanon, type Drop } from "../../data/store";

const kindLabel: Record<Drop["kind"], string> = {
  text: "Text drop",
  photo: "Photo file",
  voice: "Voice note",
};

export function CanvasWorkspace() {
  const { drops, events } = useCanon();
  const [scanIndex, setScanIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scanItems = drops.slice(0, 6);

  useEffect(() => {
    setIsLoading(true);
    setScanIndex(0);
    const steps = Math.max(scanItems.length, 1);
    const interval = window.setInterval(() => {
      setScanIndex((index) => {
        if (index >= steps - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => setIsLoading(false), 420);
          return index;
        }
        return index + 1;
      });
    }, 620);

    return () => window.clearInterval(interval);
  }, [drops.length, scanItems.length]);

  const story = useMemo(() => buildStory(drops, events), [drops, events]);
  const activeItem = scanItems[scanIndex] ?? scanItems[0];
  const progress =
    scanItems.length > 1 ? ((scanIndex + 1) / scanItems.length) * 100 : 100;

  return (
    <section className="page-shell canvas-page">
      <header className="page-title canvas-heading">
        <div>
          <span className="scribble">CANVAS</span>
          <h1>Build the story.</h1>
          <p>Every drop gets sorted into one concrete version of what happened.</p>
        </div>
      </header>

      <section className="story-loader" aria-live="polite">
        <div className="loader-topline">
          <span>{isLoading ? "Aggregating lore" : "Story ready"}</span>
          <b>{Math.round(progress)}%</b>
        </div>
        <div className="loading-track" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="pop-scan">
          {scanItems.map((drop, index) => (
            <article
              className={`scan-chip ${index === scanIndex && isLoading ? "active" : ""}`}
              key={drop.id}
            >
              <span>{kindLabel[drop.kind]}</span>
              <b>{drop.content}</b>
            </article>
          ))}
        </div>
        {activeItem && isLoading ? (
          <p className="scan-note">
            Reading {kindLabel[activeItem.kind].toLowerCase()}: {activeItem.content}
          </p>
        ) : null}
      </section>

      <section className="story-card">
        <span className="section-label">CONCRETE STORY</span>
        <h2>{story.title}</h2>
        <p>{story.summary}</p>
        <div className="story-beats">
          {story.beats.map((beat) => (
            <div key={beat.label}>
              <span>{beat.label}</span>
              <b>{beat.text}</b>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function buildStory(drops: Drop[], events: ReturnType<typeof useCanon>["events"]) {
  const latestDrops = drops.slice(0, 3);
  const latestEvent = events[0];
  const title = latestEvent?.title ?? "The lore is still forming.";
  const sources = latestDrops.map((drop) => drop.content).filter(Boolean);
  const summary =
    sources.length > 0
      ? `The canvas is pulling together ${sources.length} source${sources.length === 1 ? "" : "s"} into a single version: ${sources.join(" ")}`
      : "Add a drop first, then Canvas will turn the loose receipts into a cleaner story.";

  return {
    title,
    summary,
    beats: [
      { label: "Setup", text: latestEvent?.place ?? "The context is still pending." },
      { label: "Evidence", text: sources[0] ?? "No files, voice notes, or text drops yet." },
      { label: "Read", text: latestEvent?.mood ?? "Waiting for enough tea to form a read." },
    ],
  };
}
