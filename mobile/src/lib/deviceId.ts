import { storage, STORAGE_KEYS } from "../stores/storage";

function generateDeviceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "dev_";
  for (let i = 0; i < 28; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getOrCreateDeviceId(): string {
  const existing = storage.getString(STORAGE_KEYS.DEVICE_ID);
  if (existing) return existing;

  const newId = generateDeviceId();
  storage.set(STORAGE_KEYS.DEVICE_ID, newId);
  return newId;
}
