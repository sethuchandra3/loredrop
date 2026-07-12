import { useCallback, useRef } from "react";
import { AssetRecordType, Tldraw, createShapeId, toRichText, type Editor, type TLShapePartial } from "tldraw";
import "tldraw/tldraw.css";
import { useCanon } from "../../data/store";

export function WebWorkspace() {
  const { drops, events } = useCanon();
  const frameRef = useRef<HTMLDivElement>(null);
  const populate = useCallback((editor: Editor) => {
    if (editor.getCurrentPageShapes().length > 0) return;
    if (!drops.length) return;
    const shapes: TLShapePartial[] = [];

    drops.slice(0, 6).forEach((drop, index) => {
      const x = 80 + (index % 3) * 340;
      const y = 80 + Math.floor(index / 3) * 290;
      if (drop.kind === "photo" && drop.mediaUrl && !drop.mediaUrl.startsWith("data:video/")) {
        const assetId = AssetRecordType.createId(`drop-${drop.id}`);
        editor.createAssets([{ id: assetId, typeName: "asset", type: "image", props: { name: drop.content, src: drop.mediaUrl, w: 600, h: 420, mimeType: "image/png", isAnimated: false }, meta: {} }]);
        shapes.push({ id: createShapeId(`drop-${drop.id}`), type: "image", x, y, props: { assetId, w: 300, h: 210 } });
      } else {
        const label = drop.kind === "voice" ? "WITNESS STATEMENT  ▶──────  \n" : drop.kind === "photo" ? "PHOTO EVIDENCE\n" : "TEXT RECEIPT\n";
        const color = drop.kind === "voice" ? "light-red" : drop.kind === "text" ? "yellow" : "light-blue";
        shapes.push(noteShape(`drop-${drop.id}`, x, y, `${label}\n${drop.content}`, color));
      }
    });

    editor.createShapes(shapes);
    editor.zoomToFit({ animation: { duration: 350 } });
  }, [drops]);

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await frameRef.current?.requestFullscreen();
  }

  return <section className="web-canvas-page board-only"><h1 className="board-title">{events[0]?.title ?? "Evidence Board"}</h1><div className="tldraw-frame" ref={frameRef}><Tldraw persistenceKey="loredrop-web-v3" onMount={populate} /><button className="board-expand" onClick={() => void toggleFullscreen()} type="button">↗</button></div></section>;
}

function noteShape(id: string, x: number, y: number, text: string, color: "yellow" | "light-red" | "light-blue"): TLShapePartial {
  return { id: createShapeId(id), type: "note", x, y, props: { richText: toRichText(text), color, size: "m" } };
}
