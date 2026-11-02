import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ── Setup __dirname en ESM ───────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ────────────────────────────────────────────────
const DB_PATH = path.resolve(__dirname, "../data/simplegym.db");
const MIGRATIONS_PATH = path.resolve(__dirname, "migrations");

// ── DB Instance ──────────────────────────────────────────
const db = new Database(DB_PATH);

// ── Configuración SQLite ─────────────────────────────────
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Tabla de migraciones ─────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    filename TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Tablas principales ───────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (routine_id) REFERENCES routines(id)
  );

  CREATE TABLE IF NOT EXISTS exercise_catalog (
    id TEXT PRIMARY KEY,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    contributed_by TEXT,
    source_exercise_id TEXT
  );

  CREATE TABLE IF NOT EXISTS exercise_names (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    source_type TEXT NOT NULL,
    lang TEXT NOT NULL,
    name TEXT NOT NULL,
    is_alias INTEGER NOT NULL DEFAULT 0
  );
`);

// ── Índice para búsquedas rápidas ─────────────────────────
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_exercise_names_name 
  ON exercise_names(name);
`);

// ── Ejecutar migraciones .sql ────────────────────────────
function runMigration() {
  if (!fs.existsSync(MIGRATIONS_PATH)) return;

  const files = fs.readdirSync(MIGRATIONS_PATH)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const alreadyApplied = db
      .prepare("SELECT 1 FROM _migrations WHERE filename = ?")
      .get(file);

    if (alreadyApplied) continue;

    const sql = fs.readFileSync(
      path.join(MIGRATIONS_PATH, file),
      "utf-8"
    );

    db.exec(sql);

    db.prepare(`
      INSERT INTO _migrations (filename) VALUES (?)
    `).run(file);

    console.log(`✓ Migración aplicada: ${file}`);
  }
}

runMigration();

export default db;