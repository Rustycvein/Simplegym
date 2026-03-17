
const DB_NAME = "simplegym";
const DB_VERSION = 1;
const API_URL = "https://simplegym.onrender.com";

// ── Token helpers ────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("sg_token");
}

export function setToken(token) {
  localStorage.setItem("sg_token", token);
}

export function removeToken() {
  localStorage.removeItem("sg_token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Abrir / inicializar la base de datos ─────────────────────
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("sessions")) {
        const store = db.createObjectStore("sessions", { keyPath: "id" });
        store.createIndex("date", "date");
        store.createIndex("synced", "synced");
      }

      if (!db.objectStoreNames.contains("routines")) {
        const store = db.createObjectStore("routines", { keyPath: "id" });
        store.createIndex("synced", "synced");
        store.createIndex("deletedAt", "deletedAt");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Helpers genéricos ────────────────────────────────────────
function tx(db, storeName, mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName);
}

export function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(db, storeName) {
  return promisify(tx(db, storeName).getAll());
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}

// ═══════════════════════════════════════════════════════════════
//  SESIONES
// ═══════════════════════════════════════════════════════════════

export async function saveSession(sessionData) {
  const db = await openDB();
  const now = new Date().toISOString();
  const session = {
    id: uuid(),
    routineId: sessionData.routineId || "free_workout",
    exercises: sessionData.exercises,
    date: now,
    updatedAt: now,
    deletedAt: null,
    synced: false,
  };
  await promisify(tx(db, "sessions", "readwrite").put(session));
  return session;
}

export async function getSessions() {
  const db = await openDB();
  const all = await getAll(db, "sessions");
  return all
    .filter((s) => !s.deletedAt)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ═══════════════════════════════════════════════════════════════
//  RUTINAS
// ═══════════════════════════════════════════════════════════════

export async function saveRoutine(routineData) {
  const db = await openDB();
  const now = new Date().toISOString();
  const routine = {
    id: routineData.id || uuid(),
    name: routineData.name,
    exercises: routineData.exercises || [],
    createdAt: routineData.createdAt || now,
    updatedAt: now,
    deletedAt: null,
    synced: false,
  };
  await promisify(tx(db, "routines", "readwrite").put(routine));
  return routine;
}

export async function getRoutines() {
  const db = await openDB();
  const all = await getAll(db, "routines");
  return all
    .filter((r) => !r.deletedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteRoutine(routineId) {
  const db = await openDB();
  const store = tx(db, "routines", "readwrite");
  const routine = await promisify(store.get(routineId));
  if (!routine) return;
  routine.deletedAt = new Date().toISOString();
  routine.updatedAt = routine.deletedAt;
  routine.synced = false;
  await promisify(tx(db, "routines", "readwrite").put(routine));
}

// ═══════════════════════════════════════════════════════════════
//  SINCRONIZACIÓN
// ═══════════════════════════════════════════════════════════════

async function syncSessions(db) {
  const all = await getAll(db, "sessions");
  const pending = all.filter((s) => !s.synced);

  for (const session of pending) {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id: session.id,
          routineId: session.routineId,
          exercises: session.exercises,
          date: session.date,
          updatedAt: session.updatedAt,
        }),
      });
      if (res.ok || res.status === 409) {
        session.synced = true;
        await promisify(tx(db, "sessions", "readwrite").put(session));
      }
    } catch (_) {
      // Sin conexión
    }
  }
}

async function syncRoutines(db) {
  const all = await getAll(db, "routines");
  const pending = all.filter((r) => !r.synced);

  for (const routine of pending) {
    try {
      const res = await fetch(`${API_URL}/api/routines`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(routine),
      });
      if (res.ok || res.status === 409) {
        routine.synced = true;
        await promisify(tx(db, "routines", "readwrite").put(routine));
      }
    } catch (_) {
      // Sin conexión
    }
  }
}

export async function syncAll() {
  if (!navigator.onLine) return { status: "offline" };
  if (!getToken()) return { status: "unauthenticated" };
  try {
    const db = await openDB();
    await Promise.all([syncSessions(db), syncRoutines(db)]);
    return { status: "ok" };
  } catch (err) {
    console.error("Sync error:", err);
    return { status: "error", error: err };
  }
}

export async function getPendingCount() {
  const db = await openDB();
  const [sessions, routines] = await Promise.all([
    getAll(db, "sessions"),
    getAll(db, "routines"),
  ]);
  return (
    sessions.filter((s) => !s.synced).length +
    routines.filter((r) => !r.synced).length
  );
}