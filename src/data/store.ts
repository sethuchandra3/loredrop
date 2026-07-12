import { useSyncExternalStore } from "react";
import type { StoredAsset } from "./assets";

export type DropKind = "text" | "photo" | "voice";
export interface Drop { id: string; kind: DropKind; content: string; createdAt: string; status: "extracted" | "processing"; mediaUrl?: string; assetId?: string; }
export interface Person { id: string; name: string; emoji: string; color: string; role: string; }
export interface CanonEvent { id: string; title: string; date: string; place: string; mood: string; quote: string; participantIds: string[]; dropIds: string[]; disputed?: boolean; }
export interface Connection { id: string; sourceId: string; targetId: string; label: string; weight: number; }
interface State { drops: Drop[]; people: Person[]; events: CanonEvent[]; connections: Connection[]; bits: string[]; assets: StoredAsset[]; }

const KEY = "loredrop:friend-canon:v4";
const people: Person[] = [
  { id: "maya", name: "Maya", emoji: "💅", color: "#ff6b9d", role: "Keeper of the aux" },
  { id: "jordan", name: "Jordan", emoji: "🫡", color: "#ffb84d", role: "Historian under oath" },
  { id: "stuti", name: "Stuti", emoji: "🪩", color: "#8c7bff", role: "Plot accelerator" },
  { id: "sethu", name: "Sethu", emoji: "🛸", color: "#58c9a3", role: "Says ‘one more place’" },
  { id: "miriam", name: "Miriam", emoji: "🔮", color: "#ff8066", role: "Predicts the group chat" },
];
const initial: State = {
  people,
  drops: [],
  events: [],
  connections: [],
  bits: [],
  assets: [],
};

const demoState: State = {
  people,
  drops: [
    { id: "demo-chat", kind: "text", content: "maya: nobody let jordan order the mystery punch again\njordan: legally this is slander", createdAt: "2026-06-14T23:42:00Z", status: "extracted" },
    { id: "demo-photo", kind: "photo", content: "Blurry 2:13am diner evidence", createdAt: "2026-06-15T02:13:00Z", status: "extracted" },
    { id: "demo-voice", kind: "voice", content: "Witness statement: the kayak was absolutely not my fault", createdAt: "2026-05-22T18:30:00Z", status: "extracted" },
  ],
  events: [
    { id: "demo-punch", title: "The Mystery Punch Incident", date: "June 14", place: "Maya’s roof → Moonlight Diner", mood: "confidently doomed", quote: "Legally this is slander.", participantIds: ["maya", "jordan", "stuti", "sethu"], dropIds: ["demo-chat", "demo-photo"] },
    { id: "demo-kayak", title: "We Don’t Talk About the Kayak", date: "May 22", place: "Lake Tahoe-ish", mood: "wet and disputed", quote: "The current had motives.", participantIds: ["jordan", "miriam", "sethu"], dropIds: ["demo-voice"], disputed: true },
    { id: "demo-brunch", title: "The Accidental Four-City Brunch", date: "April 03", place: "FaceTime / four time zones", mood: "surprisingly tender", quote: "Wait, is it breakfast for any of us?", participantIds: ["maya", "jordan", "stuti", "miriam"], dropIds: [] },
  ],
  connections: [
    { id: "demo-c1", sourceId: "maya", targetId: "jordan", label: "co-conspirators", weight: 11 },
    { id: "demo-c2", sourceId: "jordan", targetId: "stuti", label: "bad idea feedback loop", weight: 9 },
  ],
  bits: ["we don’t talk about the kayak", "legally this is slander", "one more place"],
  assets: [],
};

let state = load();
const listeners = new Set<() => void>();
function load(): State { try { const raw = localStorage.getItem(KEY); return raw ? { ...initial, ...(JSON.parse(raw) as State) } : initial; } catch { return initial; } }
function save(next: State) { state = next; localStorage.setItem(KEY, JSON.stringify(state)); listeners.forEach((listener) => listener()); }
export function useCanon() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state); }

export const canonStore = {
  addDrop(kind: DropKind, content: string, mediaUrl?: string, details?: { title?: string; place?: string }, asset?: StoredAsset) {
    const id = crypto.randomUUID();
    const drop: Drop = { id, kind, content: content.trim(), createdAt: new Date().toISOString(), status: "extracted", mediaUrl, assetId: asset?.id };
    const assets = asset ? [asset, ...state.assets] : state.assets;
    if (kind !== "text" && state.events[0]) {
      const [current, ...rest] = state.events;
      save({ ...state, assets, drops: [drop, ...state.drops], events: [{ ...current, dropIds: [id, ...current.dropIds] }, ...rest] });
      return;
    }
    const event: CanonEvent = { id: crypto.randomUUID(), title: details?.title?.trim() || guessTitle(content), date: "Just now", place: details?.place?.trim() || "Shared in the group chat", mood: "freshly added to the record", quote: extractQuote(content), participantIds: detectPeople(content), dropIds: [id] };
    save({ ...state, assets, drops: [drop, ...state.drops], events: [event, ...state.events] });
  },
  renamePerson(id: string, name: string) { save({ ...state, people: state.people.map((person) => person.id === id ? { ...person, name: name.trim() || person.name } : person) }); },
  toggleDisputed(id: string) { save({ ...state, events: state.events.map((event) => event.id === id ? { ...event, disputed: !event.disputed } : event) }); },
  loadDemo() { save(demoState); },
  reset() { localStorage.removeItem(KEY); state = initial; listeners.forEach((listener) => listener()); },
};

function detectPeople(content: string) { const found = people.filter((person) => content.toLowerCase().includes(person.name.toLowerCase())).map((person) => person.id); return found.length ? found : ["stuti", "jordan"]; }
function extractQuote(content: string) { const line = content.split("\n").find(Boolean)?.replace(/^\w+:\s*/i, "") ?? content; return line.slice(0, 90) || "No comment at this time."; }
function guessTitle(content: string) { return content.split("\n").find((line) => line.trim())?.replace(/^\w+:\s*/i, "").trim().slice(0, 64) || "Untitled case"; }
