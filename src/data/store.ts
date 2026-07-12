import { useSyncExternalStore } from "react";

export interface LoreEntry {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoreRelation {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
}

export interface StudioDraft {
  title: string;
  body: string;
  updatedAt: string;
}

interface LoredropState {
  lore: LoreEntry[];
  relations: LoreRelation[];
  positions: Record<string, { x: number; y: number }>;
  selectedLoreIds: string[];
  studio: StudioDraft;
}

const STORAGE_KEY = "loredrop:mvp:v1";
const listeners = new Set<() => void>();

const seedLore: LoreEntry[] = [
  {
    id: "mara-vale",
    title: "Mara Vale",
    body: "A memory cartographer who can hear the edits people make to their own past.",
    tags: ["character", "protagonist"],
    createdAt: "2026-07-12T18:00:00.000Z",
    updatedAt: "2026-07-12T18:00:00.000Z",
  },
  {
    id: "city-archive",
    title: "The Drowned Archive",
    body: "A library below the tide line. Its books rewrite themselves whenever the bells ring at midnight.",
    tags: ["place", "mystery"],
    createdAt: "2026-07-12T18:01:00.000Z",
    updatedAt: "2026-07-12T18:01:00.000Z",
  },
  {
    id: "glass-key",
    title: "The Glass Key",
    body: "Opens any door whose owner has forgotten what lies behind it. A hairline crack grows after every use.",
    tags: ["artifact"],
    createdAt: "2026-07-12T18:02:00.000Z",
    updatedAt: "2026-07-12T18:02:00.000Z",
  },
];

const initialState: LoredropState = {
  lore: seedLore,
  relations: [
    {
      id: "seed-relation",
      sourceId: "mara-vale",
      targetId: "city-archive",
      label: "searches",
    },
  ],
  positions: {
    "mara-vale": { x: 80, y: 90 },
    "city-archive": { x: 390, y: 70 },
    "glass-key": { x: 260, y: 280 },
  },
  selectedLoreIds: ["mara-vale", "city-archive"],
  studio: { title: "Untitled story", body: "", updatedAt: new Date(0).toISOString() },
};

let state = loadState();

function loadState(): LoredropState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as Partial<LoredropState>;
    return {
      lore: Array.isArray(saved.lore) ? saved.lore : initialState.lore,
      relations: Array.isArray(saved.relations) ? saved.relations : [],
      positions: saved.positions && typeof saved.positions === "object" ? saved.positions : {},
      selectedLoreIds: Array.isArray(saved.selectedLoreIds) ? saved.selectedLoreIds : [],
      studio: saved.studio?.title && typeof saved.studio.body === "string" ? saved.studio : initialState.studio,
    };
  } catch {
    return initialState;
  }
}

function update(updater: (current: LoredropState) => LoredropState) {
  state = updater(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

export function useLoredropState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

export const loreStore = {
  add(input: { title: string; body: string; tags: string[] }) {
    const now = new Date().toISOString();
    const entry: LoreEntry = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      body: input.body.trim(),
      tags: [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
      createdAt: now,
      updatedAt: now,
    };
    update((current) => ({ ...current, lore: [entry, ...current.lore] }));
    return entry;
  },
  update(id: string, input: Pick<LoreEntry, "title" | "body" | "tags">) {
    update((current) => ({
      ...current,
      lore: current.lore.map((entry) =>
        entry.id === id
          ? { ...entry, ...input, title: input.title.trim(), body: input.body.trim(), updatedAt: new Date().toISOString() }
          : entry,
      ),
    }));
  },
  remove(id: string) {
    update((current) => ({
      ...current,
      lore: current.lore.filter((entry) => entry.id !== id),
      relations: current.relations.filter((relation) => relation.sourceId !== id && relation.targetId !== id),
      selectedLoreIds: current.selectedLoreIds.filter((selectedId) => selectedId !== id),
    }));
  },
  toggleSelected(id: string) {
    update((current) => ({
      ...current,
      selectedLoreIds: current.selectedLoreIds.includes(id)
        ? current.selectedLoreIds.filter((selectedId) => selectedId !== id)
        : [...current.selectedLoreIds, id],
    }));
  },
  setPosition(id: string, position: { x: number; y: number }) {
    update((current) => ({ ...current, positions: { ...current.positions, [id]: position } }));
  },
  addRelation(sourceId: string, targetId: string, label: string) {
    if (sourceId === targetId || !label.trim()) return;
    update((current) => {
      const duplicate = current.relations.some(
        (relation) => relation.sourceId === sourceId && relation.targetId === targetId && relation.label === label.trim(),
      );
      return duplicate
        ? current
        : {
            ...current,
            relations: [...current.relations, { id: crypto.randomUUID(), sourceId, targetId, label: label.trim() }],
          };
    });
  },
  removeRelation(id: string) {
    update((current) => ({ ...current, relations: current.relations.filter((relation) => relation.id !== id) }));
  },
  saveStudio(title: string, body: string) {
    update((current) => ({ ...current, studio: { title, body, updatedAt: new Date().toISOString() } }));
  },
};

