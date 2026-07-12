import { useSyncExternalStore } from "react";

export type DropKind = "text" | "photo" | "voice";
export interface Drop { id: string; kind: DropKind; content: string; createdAt: string; status: "extracted" | "processing"; mediaUrl?: string; }
export interface Person { id: string; name: string; emoji: string; color: string; role: string; }
export interface CanonEvent { id: string; title: string; date: string; place: string; mood: string; quote: string; participantIds: string[]; dropIds: string[]; disputed?: boolean; }
export interface Connection { id: string; sourceId: string; targetId: string; label: string; weight: number; }
interface State { drops: Drop[]; people: Person[]; events: CanonEvent[]; connections: Connection[]; bits: string[]; }

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
};

let state = load();
const listeners = new Set<() => void>();
function load(): State { try { const raw = localStorage.getItem(KEY); return raw ? { ...initial, ...(JSON.parse(raw) as State) } : initial; } catch { return initial; } }
function save(next: State) { state = next; localStorage.setItem(KEY, JSON.stringify(state)); listeners.forEach((listener) => listener()); }
export function useCanon() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state); }

export const canonStore = {
  addDrop(kind: DropKind, content: string, mediaUrl?: string, details?: { title?: string; place?: string }) {
    const id = crypto.randomUUID();
    const drop: Drop = { id, kind, content: content.trim(), createdAt: new Date().toISOString(), status: "extracted", mediaUrl };
    if (kind !== "text" && state.events[0]) {
      const [current, ...rest] = state.events;
      save({ ...state, drops: [drop, ...state.drops], events: [{ ...current, dropIds: [id, ...current.dropIds] }, ...rest] });
      return;
    }
    const event: CanonEvent = { id: crypto.randomUUID(), title: details?.title?.trim() || guessTitle(content), date: "Just now", place: details?.place?.trim() || "Shared in the group chat", mood: "freshly added to the record", quote: extractQuote(content), participantIds: detectPeople(content), dropIds: [id] };
    save({ ...state, drops: [drop, ...state.drops], events: [event, ...state.events] });
  },
  renamePerson(id: string, name: string) { save({ ...state, people: state.people.map((person) => person.id === id ? { ...person, name: name.trim() || person.name } : person) }); },
  toggleDisputed(id: string) { save({ ...state, events: state.events.map((event) => event.id === id ? { ...event, disputed: !event.disputed } : event) }); },
  reset() { localStorage.removeItem(KEY); state = initial; listeners.forEach((listener) => listener()); },
};

function detectPeople(content: string) { const found = people.filter((person) => content.toLowerCase().includes(person.name.toLowerCase())).map((person) => person.id); return found.length ? found : ["stuti", "jordan"]; }
function extractQuote(content: string) { const line = content.split("\n").find(Boolean)?.replace(/^\w+:\s*/i, "") ?? content; return line.slice(0, 90) || "No comment at this time."; }
function guessTitle(content: string) { return content.split("\n").find((line) => line.trim())?.replace(/^\w+:\s*/i, "").trim().slice(0, 64) || "Untitled case"; }
