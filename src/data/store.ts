import { useSyncExternalStore } from "react";

export type DropKind = "text" | "photo" | "voice";
export interface Drop { id: string; kind: DropKind; content: string; createdAt: string; status: "extracted" | "processing"; }
export interface Person { id: string; name: string; emoji: string; color: string; role: string; }
export interface CanonEvent { id: string; title: string; date: string; place: string; mood: string; quote: string; participantIds: string[]; dropIds: string[]; disputed?: boolean; }
export interface Connection { id: string; sourceId: string; targetId: string; label: string; weight: number; }
interface State { drops: Drop[]; people: Person[]; events: CanonEvent[]; connections: Connection[]; bits: string[]; }

const KEY = "loredrop:friend-canon:v2";
const people: Person[] = [
  { id: "maya", name: "Maya", emoji: "💅", color: "#ff6b9d", role: "Keeper of the aux" },
  { id: "jordan", name: "Jordan", emoji: "🫡", color: "#ffb84d", role: "Historian under oath" },
  { id: "stuti", name: "Stuti", emoji: "🪩", color: "#8c7bff", role: "Plot accelerator" },
  { id: "sethu", name: "Sethu", emoji: "🛸", color: "#58c9a3", role: "Says ‘one more place’" },
  { id: "miriam", name: "Miriam", emoji: "🔮", color: "#ff8066", role: "Predicts the group chat" },
];
const initial: State = {
  people,
  drops: [
    { id: "d1", kind: "text", content: "maya: nobody let jordan order the mystery punch again\njordan: legally this is slander", createdAt: "2026-06-14T23:42:00Z", status: "extracted" },
    { id: "d2", kind: "photo", content: "Blurry 2:13am photo outside Moonlight Diner", createdAt: "2026-06-15T02:13:00Z", status: "extracted" },
    { id: "d3", kind: "voice", content: "Voice memo: the kayak was absolutely not my fault", createdAt: "2026-05-22T18:30:00Z", status: "extracted" },
  ],
  events: [
    { id: "e1", title: "The Mystery Punch Incident", date: "June 14", place: "Maya’s roof → Moonlight Diner", mood: "confidently doomed", quote: "Legally this is slander.", participantIds: ["maya", "jordan", "stuti", "sethu"], dropIds: ["d1", "d2"] },
    { id: "e2", title: "We Don’t Talk About the Kayak", date: "May 22", place: "Lake Tahoe-ish", mood: "wet and disputed", quote: "The current had motives.", participantIds: ["jordan", "miriam", "sethu"], dropIds: ["d3"], disputed: true },
    { id: "e3", title: "The Accidental Four-City Brunch", date: "April 03", place: "FaceTime / four time zones", mood: "surprisingly tender", quote: "Wait, is it breakfast for any of us?", participantIds: ["maya", "jordan", "stuti", "miriam"], dropIds: [] },
  ],
  connections: [
    { id: "c1", sourceId: "maya", targetId: "jordan", label: "co-conspirators", weight: 11 },
    { id: "c2", sourceId: "jordan", targetId: "stuti", label: "bad idea feedback loop", weight: 9 },
    { id: "c3", sourceId: "stuti", targetId: "sethu", label: "last ones dancing", weight: 8 },
    { id: "c4", sourceId: "sethu", targetId: "miriam", label: "disputed witnesses", weight: 7 },
    { id: "c5", sourceId: "miriam", targetId: "maya", label: "emergency debrief", weight: 10 },
    { id: "c6", sourceId: "maya", targetId: "stuti", label: "outfit committee", weight: 6 },
  ],
  bits: ["we don’t talk about the kayak", "legally this is slander", "one more place"],
};

let state = load();
const listeners = new Set<() => void>();
function load(): State { try { const raw = localStorage.getItem(KEY); return raw ? { ...initial, ...(JSON.parse(raw) as State) } : initial; } catch { return initial; } }
function save(next: State) { state = next; localStorage.setItem(KEY, JSON.stringify(state)); listeners.forEach((listener) => listener()); }
export function useCanon() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => state); }

export const canonStore = {
  addDrop(kind: DropKind, content: string) {
    const id = crypto.randomUUID();
    const drop: Drop = { id, kind, content: content.trim(), createdAt: new Date().toISOString(), status: "extracted" };
    const event: CanonEvent = { id: crypto.randomUUID(), title: guessTitle(content), date: "Just now", place: "Location pending 👀", mood: "needs group verification", quote: extractQuote(content), participantIds: detectPeople(content), dropIds: [id] };
    save({ ...state, drops: [drop, ...state.drops], events: [event, ...state.events] });
  },
  renamePerson(id: string, name: string) { save({ ...state, people: state.people.map((person) => person.id === id ? { ...person, name: name.trim() || person.name } : person) }); },
  toggleDisputed(id: string) { save({ ...state, events: state.events.map((event) => event.id === id ? { ...event, disputed: !event.disputed } : event) }); },
  reset() { localStorage.removeItem(KEY); state = initial; listeners.forEach((listener) => listener()); },
};

function detectPeople(content: string) { const found = people.filter((person) => content.toLowerCase().includes(person.name.toLowerCase())).map((person) => person.id); return found.length ? found : ["stuti", "jordan"]; }
function extractQuote(content: string) { const line = content.split("\n").find(Boolean)?.replace(/^\w+:\s*/i, "") ?? content; return line.slice(0, 90) || "No comment at this time."; }
function guessTitle(content: string) { const lower = content.toLowerCase(); if (lower.includes("uber")) return "The Uber Driver Knows Too Much"; if (lower.includes("birthday")) return "Birthday Behavior Under Review"; if (lower.includes("karaoke")) return "The Karaoke Host Files a Report"; return "Developing Lore Situation"; }

