// Private, device-local photo storage. No automatic cloud upload or sharing.
const DB = "3cmall-grocery-photos-v1";
function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Photo storage unavailable"));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("photos");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function transact(mode, operation) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("photos", mode);
    const request = operation(tx.objectStore("photos"));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
export const photoKey = name => String(name || "").trim().toLowerCase();
export async function saveGroceryPhoto(name, file) {
  if (!file || !["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP photo.");
  if (file.size > 4 * 1024 * 1024) throw new Error("Choose a photo smaller than 4 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const ratio = Math.min(1, 480 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .78));
    if (!blob) throw new Error("Unable to process image.");
    await transact("readwrite", store => store.put(blob, photoKey(name)));
  } finally { bitmap.close(); }
}
export async function readGroceryPhoto(name) {
  return transact("readonly", store => store.get(photoKey(name)));
}

// Removes a user-provided image from this device only.
export async function deleteGroceryPhoto(name) {
  return transact("readwrite", store => store.delete(photoKey(name)));
}
