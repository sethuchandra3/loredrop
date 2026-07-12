export interface StoredAsset {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storageKey: string;
  createdAt: string;
}

const ASSET_DIR = "assets";

export function canUseLocalAssets() {
  return typeof navigator !== "undefined" && "storage" in navigator && "getDirectory" in navigator.storage;
}

export async function saveLocalAsset(file: Blob, name: string): Promise<StoredAsset> {
  if (!canUseLocalAssets()) {
    throw new Error("Origin private file storage is not available in this browser.");
  }

  const id = crypto.randomUUID();
  const storageKey = `${id}${extensionFor(name, file.type)}`;
  const root = await navigator.storage.getDirectory();
  const assets = await root.getDirectoryHandle(ASSET_DIR, { create: true });
  const handle = await assets.getFileHandle(storageKey, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();

  return {
    id,
    name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storageKey,
    createdAt: new Date().toISOString(),
  };
}

export async function loadLocalAssetUrl(storageKey: string): Promise<string> {
  if (!canUseLocalAssets()) {
    throw new Error("Origin private file storage is not available in this browser.");
  }

  const root = await navigator.storage.getDirectory();
  const assets = await root.getDirectoryHandle(ASSET_DIR);
  const handle = await assets.getFileHandle(storageKey);
  const file = await handle.getFile();
  return URL.createObjectURL(file);
}

function extensionFor(name: string, mimeType: string) {
  const match = name.match(/\.[a-z0-9]+$/i);
  if (match) return match[0].toLowerCase();
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "audio/webm") return ".webm";
  if (mimeType === "audio/mpeg") return ".mp3";
  if (mimeType === "text/plain") return ".txt";
  return "";
}
